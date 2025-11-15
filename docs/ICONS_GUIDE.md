# 🎨 Guia de Ícones Feather para Sheriff Bot

Este guia explica como usar os ícones SVG do Feather nos botões do seu bot Discord.

## 📦 Conteúdo

Você tem **287 ícones SVG** do Feather Icons extraídos em `assets/icons/`.

## 🔧 Sistema de Ícones

### Como Funciona

O bot agora usa um sistema centralizado de gerenciamento de ícones através do arquivo `src/utils/iconManager.ts`. Este sistema:

1. **Mapeia cada ação do bot para um ícone específico do Feather**
2. **Fornece emojis Unicode de fallback** (caso os emojis personalizados não estejam disponíveis)
3. **Permite converter SVGs para PNG** (formato aceito pelo Discord)
4. **Automatiza o upload de ícones** como emojis personalizados do Discord

### Ícones Disponíveis

Execute o comando abaixo para ver todos os ícones mapeados:

```bash
npm run icons:list
```

Isso mostrará uma lista organizada por categoria de todos os ícones disponíveis, incluindo:

- **Embed Builder**: file-text, user, image, arrow-down, etc.
- **Guild (Guilda)**: info, users, log-out, check, etc.
- **Duelo**: zap, shield, target
- **Loja**: chevron-left, chevron-right, shopping-cart
- **Perfil**: edit, image, square
- **Territórios**: map, dollar-sign
- **E muito mais...**

## 📝 Como Usar nos Comandos

### Exemplo Básico

```typescript
import { getIconEmoji } from "../../utils/iconManager";

// Criar um botão com ícone
new ButtonBuilder()
  .setCustomId("shop_buy")
  .setLabel("Comprar")
  .setStyle(ButtonStyle.Primary)
  .setEmoji(getIconEmoji("shop_buy")); // 🛒 (ou emoji personalizado se configurado)
```

### Exemplo Completo

Veja `src/commands/admin/embedbuilder.ts` para um exemplo completo de integração.

## 🔄 Converter SVGs para PNG

O Discord não aceita SVGs diretamente. Para converter os ícones SVG para PNG:

```bash
npm run icons:convert
```

Este comando:
- Lê todos os SVGs de `assets/icons/`
- Converte para PNG 128x128 pixels
- Salva em `assets/icons-png/`
- Adiciona padding de 16px para melhor visualização

## 📤 Upload para o Discord

Para fazer upload dos ícones como emojis personalizados em um servidor Discord:

```bash
npm run icons:upload <GUILD_ID>
```

**Importante:**
- Você precisa ser administrador do servidor
- O bot precisa ter permissão para gerenciar emojis
- Servidores têm limites de emojis:
  - Nível 0: 50 emojis
  - Nível 1: 100 emojis
  - Nível 2: 150 emojis
  - Nível 3: 250 emojis

**Como obter o GUILD_ID:**
1. Ative o Modo Desenvolvedor no Discord (Configurações → Avançado → Modo Desenvolvedor)
2. Clique com o botão direito no seu servidor
3. Selecione "Copiar ID do Servidor"

## 🎯 Adicionar Novos Ícones

Para adicionar um novo mapeamento de ícone:

1. Abra `src/utils/iconManager.ts`
2. Adicione uma nova entrada em `ICON_MAPPINGS`:

```typescript
{
  action: "minha_acao",           // ID da ação
  iconName: "star",                // Nome do arquivo SVG (sem extensão)
  fallbackEmoji: "⭐",             // Emoji Unicode de fallback
  description: "Favoritar item"    // Descrição
}
```

3. Use no seu código:

```typescript
.setEmoji(getIconEmoji("minha_acao"))
```

## 📂 Estrutura de Arquivos

```
sheriff-bot/
├── assets/
│   ├── icons/              # SVGs originais (287 arquivos)
│   └── icons-png/          # PNGs convertidos (gerados automaticamente)
├── src/
│   └── utils/
│       └── iconManager.ts  # Sistema de gerenciamento de ícones
├── scripts/
│   ├── convert-icons-to-png.ts      # Script de conversão SVG→PNG
│   └── upload-icons-to-discord.ts   # Script de upload para Discord
└── docs/
    └── ICONS_GUIDE.md      # Este guia
```

## 🚀 Próximos Passos

### Opção 1: Usar Emojis Unicode (Mais Simples)

Os ícones já estão funcionando com emojis Unicode de fallback. Nenhuma ação adicional necessária!

### Opção 2: Usar Emojis Personalizados (Mais Bonito)

1. Execute `npm run icons:convert` para gerar os PNGs
2. Execute `npm run icons:upload <GUILD_ID>` para fazer upload no seu servidor
3. O bot usará automaticamente os emojis personalizados quando disponíveis

## 📋 Comandos Já Atualizados

✅ **Embed Builder** (`src/commands/admin/embedbuilder.ts`)
- Todos os 14 botões agora usam ícones Feather
- Ícones incluem: file-text, user, image, plus-circle, edit-3, droplet, clock, file, download, upload, trash-2, send, x-circle

## 🔍 Ícones Mapeados por Categoria

### Embed Builder (14 ícones)
- **Básico**: file-text, user, image, arrow-down
- **Campos**: plus-circle, edit-3, droplet, clock
- **Gerenciamento**: file, download, upload, trash-2
- **Ações**: send, x-circle

### Guild/Guilda (8 ícones)
- info, users, log-out, check, x, user-x, arrow-up, arrow-down

### Duelo (3 ícones)
- zap, shield, target

### Loja (4 ícones)
- chevron-left, chevron-right, shopping-cart, x

### E mais... Execute `npm run icons:list` para ver todos!

## 💡 Dicas

1. **Consistência**: Use o mesmo ícone para ações similares em diferentes comandos
2. **Fallback**: Sempre forneça um emoji Unicode de fallback adequado
3. **Documentação**: Adicione descrições claras ao criar novos mapeamentos
4. **Testes**: Teste com e sem emojis personalizados para garantir que o fallback funcione

## 🐛 Troubleshooting

**Problema**: Emojis personalizados não aparecem
- **Solução**: Verifique se você executou o upload e se o bot tem permissão para ver os emojis do servidor

**Problema**: Erro ao converter SVG para PNG
- **Solução**: Certifique-se de que a biblioteca `@napi-rs/canvas` está instalada corretamente

**Problema**: Limite de emojis atingido
- **Solução**: Priorize os ícones mais usados ou aumente o nível boost do servidor

## 📞 Suporte

Para mais informações sobre os ícones Feather:
- Website: https://feathericons.com/
- GitHub: https://github.com/feathericons/feather

---

**Criado para Sheriff Rex Bot** 🤠
