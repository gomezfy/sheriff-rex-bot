# Como Usar o Embed de Diretrizes Resumido

## Arquivo Criado
`diretrizes-embed-resumido.json` - Versão resumida das diretrizes em formato embed (1319 caracteres)

## Características

✅ **Limite Respeitado**: 1319 caracteres (limite de 3000)
✅ **7 Campos Organizados**: Propósito, Comandos, Proibições, Economia, Punições, Segurança, Comunidade
✅ **Cor Temática**: Laranja (#E67E22)
✅ **Rodapé Informativo**: Lembrete sobre regras e moderadores

---

## Como Usar

### **Opção 1: Comando /embedbuilder do Bot**

1. Use o comando `/embedbuilder` no seu servidor
2. Cole o conteúdo completo do arquivo `diretrizes-embed-resumido.json`
3. O bot criará o embed automaticamente

### **Opção 2: Site Discohook**

1. Acesse https://discohook.org/
2. Cole o JSON no editor
3. Preview aparecerá automaticamente
4. Envie para seu canal Discord

### **Opção 3: Código JavaScript** (Para Desenvolvedores)

```javascript
const { EmbedBuilder } = require('discord.js');
const embedData = require('./diretrizes-embed-resumido.json');

const embed = new EmbedBuilder()
  .setTitle(embedData.title)
  .setDescription(embedData.description)
  .setColor(embedData.color)
  .setFooter({ text: embedData.footer.text })
  .setTimestamp(embedData.timestamp);

embedData.fields.forEach(field => {
  embed.addFields({
    name: field.name,
    value: field.value,
    inline: field.inline
  });
});

channel.send({ embeds: [embed] });
```

---

## Diferenças da Versão Completa

**Versão Completa** (6698 caracteres)
- Mais detalhada com emojis customizados
- Exemplos específicos de comandos
- Guia rápido para iniciantes
- Citações temáticas

**Versão Resumida** (1319 caracteres)
- Focada no essencial
- Sem emojis customizados
- Ideal para canais de regras
- Cabe em embed do Discord

---

## Quando Usar Cada Versão

**Use a Versão Resumida quando:**
- Precisar de regras rápidas em um canal
- Quiser um embed limpo e objetivo
- Tiver limite de caracteres
- For para novos membros

**Use a Versão Completa quando:**
- Tiver um canal dedicado para regras
- Quiser visual mais rico com emojis
- Precisar de todos os detalhes
- For para documentação extensa

---

## Customização

Para adicionar thumbnail (ícone do bot):

```json
{
  "title": "...",
  "thumbnail": {
    "url": "URL_DO_ICONE_DO_BOT"
  },
  "fields": [...]
}
```

Para adicionar imagem de capa:

```json
{
  "title": "...",
  "image": {
    "url": "URL_DA_IMAGEM"
  },
  "fields": [...]
}
```

---

**Dica**: Use esta versão resumida como "quick reference" e mantenha a versão completa em um canal de documentação!
