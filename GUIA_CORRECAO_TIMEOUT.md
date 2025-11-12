# 🔧 Guia de Correção - Erro "Unknown Interaction" (Timeout)

## 📋 Problema

Quando um comando do Discord demora mais de 3 segundos para responder, o Discord cancela a interação e retorna erro:

```
status: 404,
code: 10062,
message: 'Unknown interaction'
```

## ✅ Solução Implementada

Foi criada uma infraestrutura de **auto-defer** que permite comandos declararem que precisam de mais tempo para processar. O sistema está pronto em:

- **Types**: `src/types/index.ts` - Interface `AutoDeferConfig` e propriedade `Command.autoDefer`
- **Helper**: `src/index.ts` - Função `ensureDeferred(interaction, options)`
- **Dispatcher**: `src/index.ts` - Lógica para processar metadata `autoDefer` antes de executar comando

## 🎯 Como Corrigir um Comando com Timeout

### Opção 1: Usar AutoDefer (Recomendado para comandos novos)

**Passo 1**: Adicione a metadata no export do comando:

```typescript
module.exports = {
  data: new SlashCommandBuilder()
    .setName('meucomando')
    .setDescription('Descrição'),
  autoDefer: { ephemeral: false }, // ou true se quiser resposta privada
  async execute(interaction) {
    // Seu código aqui
  }
};
```

**Passo 2**: Troque TODOS os `interaction.reply()` por `interaction.editReply()`:

```typescript
// ❌ ANTES (vai dar erro)
await interaction.reply({ content: 'Olá!' });

// ✅ DEPOIS (correto)
await interaction.editReply({ content: 'Olá!' });
```

**Passo 3**: Para mensagens adicionais, use `followUp()`:

```typescript
// Primeira resposta
await interaction.editReply({ embeds: [embed] });

// Mensagens adicionais
await interaction.followUp({ content: 'Informação extra', ephemeral: true });
```

### Opção 2: Defer Manual (Mais simples para comandos existentes)

**Passo 1**: Adicione defer no início do execute():

```typescript
async execute(interaction: ChatInputCommandInteraction): Promise<void> {
  // Defer imediato para prevenir timeout
  await interaction.deferReply(); // ou { ephemeral: true } se quiser privado
  
  // Resto do código...
}
```

**Passo 2**: Troque TODOS os `interaction.reply()` por `interaction.editReply()` (mesmo processo da Opção 1)

## 📝 Exemplo Completo: Corrigindo comando /mine

### ANTES (com timeout):
```typescript
module.exports = {
  data: new SlashCommandBuilder().setName('mine'),
  async execute(interaction) {
    const userData = await fetchUserData(interaction.user.id); // demora 2s
    const miningResult = await processMining(userData); // demora 2s
    
    // ❌ Total: 4 segundos = TIMEOUT!
    await interaction.reply({ embeds: [resultEmbed] });
  }
};
```

### DEPOIS (corrigido):
```typescript
module.exports = {
  data: new SlashCommandBuilder().setName('mine'),
  async execute(interaction) {
    // ✅ Defer imediato
    await interaction.deferReply();
    
    const userData = await fetchUserData(interaction.user.id);
    const miningResult = await processMining(userData);
    
    // ✅ Edit reply ao invés de reply
    await interaction.editReply({ embeds: [resultEmbed] });
  }
};
```

## 🎨 Preservando Mensagens Ephemeral (Privadas)

Se o comando deve mostrar mensagens apenas para o usuário:

```typescript
// Defer com ephemeral
await interaction.deferReply({ ephemeral: true });

// Edit também será ephemeral
await interaction.editReply({ content: 'Mensagem privada' });
```

## 🔍 Identificando Comandos que Precisam de Correção

Verifique nos logs de produção por:

1. **Erro explícito**:
   ```
   DiscordAPIError[10062]: Unknown interaction
   status: 404
   ```

2. **Comandos que fazem**:
   - Múltiplas leituras de banco de dados
   - Geração de imagens (Canvas)
   - Cálculos complexos
   - Chamadas de API externa
   - Qualquer operação que demore >2 segundos

## 📊 Comandos Prioritários para Verificar

Baseado na estrutura do bot, estes comandos **provavelmente** precisam de correção:

### Alto Risco (>3s):
- `/mine` - mineração com canvas e múltiplas verificações
- `/expedition` - cálculos complexos de party
- `/profile` - geração de imagem com canvas (✅ já tem defer)
- `/wanted` - geração de poster
- `/duel` - processamento de jogo interativo
- `/roulette` - jogo com animações

### Médio Risco (2-3s):
- `/leaderboard` - queries complexas
- `/guilda` - múltiplas verificações de membros
- `/daily` - cálculos de streak e recompensas
- `/armazem` - warehouse com múltiplas operações

### Baixo Risco (<2s):
- `/help`, `/ping`, `/poll` - comandos simples

## ✅ Checklist de Correção

Para cada comando que você corrigir:

- [ ] Adicionou `await interaction.deferReply()` no início do execute()
- [ ] Trocou TODOS os `interaction.reply()` por `interaction.editReply()`
- [ ] Usou `interaction.followUp()` para mensagens adicionais
- [ ] Configurou `{ ephemeral: true }` se a resposta deve ser privada
- [ ] Testou o comando em desenvolvimento
- [ ] Verificou logs de produção após deploy

## 🚀 Testando a Correção

1. Configure as credenciais do Discord (DISCORD_TOKEN, CLIENT_ID)
2. Rode o bot: `npm run dev`
3. Execute o comando corrigido no Discord
4. Verifique que NÃO aparece erro "Unknown interaction"
5. Confirme que a resposta é exibida corretamente

## 📚 Documentação Adicional

- [Discord.js - Replying to slash commands](https://discordjs.guide/slash-commands/response-methods.html)
- [Discord.js - Deferred replies](https://discordjs.guide/slash-commands/response-methods.html#deferred-responses)

---

**Última atualização**: 11 de Novembro de 2025  
**Status**: ✅ Infraestrutura pronta, aguardando aplicação em comandos específicos
