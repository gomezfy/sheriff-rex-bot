# 🏰 Guia de Modificação do Comando /guilda

## 📋 Visão Geral

O comando `/guilda` é o sistema completo de guildas do bot Sheriff Rex. Ele permite que os usuários criem guildas, entrem em guildas, gerenciem membros e muito mais.

## 📂 Arquivos Principais

### 1. Comando Principal
- **Arquivo:** `src/commands/guild/guilda.ts`
- **Descrição:** Contém toda a lógica do comando /guilda
- **Linhas de código:** ~870 linhas

### 2. Gerenciador de Guildas
- **Arquivo:** `src/utils/guildManager.ts`
- **Descrição:** Funções auxiliares para manipular dados de guildas
- **Funções principais:**
  - `createGuild()` - Criar uma nova guilda
  - `joinGuild()` - Entrar em uma guilda
  - `leaveGuild()` - Sair de uma guilda
  - `getUserGuild()` - Obter guilda do usuário
  - `getAllGuilds()` - Listar todas as guildas
  - `kickMember()` - Expulsar membro
  - `promoteMember()` - Promover membro a co-líder
  - `demoteMember()` - Rebaixar co-líder a membro

### 3. Arquivos de Dados
- `src/data/guilds.json` - Dados de todas as guildas
- `src/data/user-guilds.json` - Mapeamento usuário -> guilda
- `src/data/join-requests.json` - Solicitações de entrada pendentes

## 🎯 Funcionalidades Atuais

### Para Usuários SEM Guilda:
1. **Criar Guilda**
   - Custo: 1000 Saloon Tokens
   - Nome: 3-30 caracteres
   - Descrição: 10-200 caracteres
   - Pode ser pública ou privada

2. **Entrar em Guilda**
   - Guildas públicas: entrada imediata
   - Guildas privadas: requer aprovação do líder

### Para Usuários COM Guilda:
1. **Ver Informações** - Detalhes da guilda atual
2. **Ver Membros** - Lista de todos os membros com cargos
3. **Gerenciar Membros** (apenas líder/co-líder):
   - Expulsar membros
   - Promover membros a co-líder
   - Rebaixar co-líderes a membros
4. **Sair da Guilda** - Com confirmação

## 🏗️ Estrutura do Código

### Fluxo Principal (linhas 43-867)

```typescript
// 1. Verifica se o usuário já está em uma guilda
if (isInGuild && userGuild) {
  // Mostra informações da guilda + botões de ação
} else {
  // Mostra tela de boas-vindas + opções criar/entrar
}
```

### Botões de Ação

#### Quando o Usuário TEM Guilda:
- `guild_info` - Informações detalhadas
- `guild_members` - Gerenciar membros
- `guild_leave` - Sair da guilda

#### Quando o Usuário NÃO TEM Guilda:
- `guild_create` - Abre modal de criação
- `guild_join` - Lista guildas disponíveis

## 🔧 Como Modificar

### Exemplo 1: Alterar o Custo de Criação

**Arquivo:** `src/utils/guildManager.ts` (linha ~97)

```typescript
// ANTES:
const removeResult = removeUserGold(userId, 1000);

// DEPOIS (para 500 tokens):
const removeResult = removeUserGold(userId, 500);
```

### Exemplo 2: Alterar Máximo de Membros

**Arquivo:** `src/utils/guildManager.ts` (linha ~123)

```typescript
// ANTES:
settings: {
  maxMembers: 20,
  
// DEPOIS (para 50 membros):
settings: {
  maxMembers: 50,
```

### Exemplo 3: Adicionar Novo Botão

**Arquivo:** `src/commands/guild/guilda.ts` (linha ~97)

```typescript
const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
  new ButtonBuilder()
    .setCustomId('guild_info')
    .setLabel('Informações')
    .setStyle(ButtonStyle.Primary),
  new ButtonBuilder()
    .setCustomId('guild_members')
    .setLabel('Membros')
    .setStyle(ButtonStyle.Secondary),
  // NOVO BOTÃO AQUI:
  new ButtonBuilder()
    .setCustomId('guild_stats')
    .setLabel('Estatísticas')
    .setStyle(ButtonStyle.Success),
  new ButtonBuilder()
    .setCustomId('guild_leave')
    .setLabel('Sair')
    .setStyle(ButtonStyle.Danger)
);
```

Depois adicione o handler no collector (linha ~125):

```typescript
if (buttonInteraction.customId === 'guild_stats') {
  // Sua lógica aqui
  await buttonInteraction.reply({
    content: 'Estatísticas da guilda!',
    flags: MessageFlags.Ephemeral,
  });
}
```

### Exemplo 4: Adicionar Campo no Embed da Guilda

**Arquivo:** `src/commands/guild/guilda.ts` (linha ~52)

```typescript
const guildEmbed = new EmbedBuilder()
  .setColor('#FFD700')
  .setTitle(`🏰 ${userGuild.name}`)
  .setDescription(userGuild.description)
  .addFields(
    // Campos existentes...
    {
      name: 'Líder',
      value: `<@${userGuild.leaderId}>`,
      inline: true,
    },
    // NOVO CAMPO:
    {
      name: '🏆 Vitórias',
      value: `${userGuild.wins || 0}`, // Você precisaria adicionar isso ao tipo
      inline: true,
    }
  );
```

## 📊 Estrutura de Dados

### PlayerGuild (tipo definido em src/types/index.ts)

```typescript
interface PlayerGuild {
  id: string;                    // ID único da guilda
  name: string;                  // Nome da guilda
  description: string;           // Descrição
  leaderId: string;             // ID do Discord do líder
  createdAt: number;            // Timestamp de criação
  members: GuildMember[];       // Array de membros
  level: number;                // Nível da guilda
  xp: number;                   // XP da guilda
  settings: {
    maxMembers: number;         // Máximo de membros
    isPublic: boolean;          // Se é pública ou privada
    requireApproval: boolean;   // Se requer aprovação
  };
}
```

### GuildMember

```typescript
interface GuildMember {
  userId: string;               // ID do Discord do membro
  joinedAt: number;            // Timestamp de entrada
  role: 'leader' | 'co-leader' | 'member'; // Cargo
}
```

## 🚀 Testando Modificações

1. **Edite o arquivo desejado**
2. **Recompile:** `npm run build`
3. **Reinicie o bot:** O workflow reinicia automaticamente
4. **Teste no Discord:** Use `/guilda` para testar

## 💡 Dicas Importantes

1. **Sempre mantenha backups** - O sistema faz backups automáticos a cada 15 horas
2. **TypeScript é forte** - Se algo der erro de tipo, corrija antes de testar
3. **Collectors têm timeout** - Padrão de 5 minutos (300000ms)
4. **Mensagens ephemeral** - Apenas o usuário vê (flags: MessageFlags.Ephemeral)
5. **Traduções** - Use `tUser()` para textos multilíngue quando possível

## 🔍 Onde Encontrar Mais

- **Tipos TypeScript:** `src/types/index.ts`
- **Traduções:** `src/utils/i18n.ts`
- **Documentação geral:** `replit.md`
- **Guia de comandos:** `GUIA_COMANDOS.md`

## ✅ Checklist Antes de Modificar

- [ ] Entendi qual funcionalidade quero modificar
- [ ] Localizei o arquivo correto
- [ ] Li o código existente
- [ ] Fiz backup ou commit do código atual
- [ ] Testei a modificação
- [ ] Verifiquei se não quebrei outras funcionalidades

---

**Pronto para modificar!** 🎉

Se tiver dúvidas sobre alguma parte específica do código, consulte os comentários no código-fonte ou a documentação completa em `replit.md`.
