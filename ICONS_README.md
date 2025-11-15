# 🎨 Sistema de Ícones Feather - Sheriff Bot

## ✅ O que foi feito

Integrei completamente os **287 ícones SVG do Feather Icons** no seu bot Discord! 

### 📦 Arquivos Criados

1. **`src/utils/iconManager.ts`** - Sistema centralizado de gerenciamento de ícones
2. **`scripts/convert-icons-to-png.ts`** - Converte SVGs para PNG (formato aceito pelo Discord)
3. **`scripts/upload-icons-to-discord.ts`** - Faz upload automático dos ícones para o Discord
4. **`docs/ICONS_GUIDE.md`** - Guia completo de uso (em português)
5. **`assets/icons/`** - 287 ícones SVG extraídos
6. **Comandos atualizados** - Embed Builder já usa os novos ícones!

### 🎯 55 Ícones Mapeados

Todos os botões do bot agora têm ícones correspondentes:

#### Embed Builder (14 ícones)
- 📄 Básico → `file-text.svg`
- 👥 Autor → `user.svg`
- 🖼 Imagens → `image.svg`
- ⬇ Rodapé → `arrow-down.svg`
- ➕ Adicionar Campo → `plus-circle.svg`
- 📝 Gerenciar Campos → `edit-3.svg`
- 🎨 Cor → `droplet.svg`
- 🕐 Timestamp → `clock.svg`
- 📑 Templates → `file.svg`
- 📥 Importar → `download.svg`
- 📤 Exportar → `upload.svg`
- 🗑 Limpar → `trash-2.svg`
- ✉ Enviar → `send.svg`
- ❌ Cancelar → `x-circle.svg`

#### Guilda (8 ícones)
- ℹ️ Info → `info.svg`
- 👥 Membros → `users.svg`
- 🚪 Sair → `log-out.svg`
- ✅ Confirmar → `check.svg`
- ❌ Cancelar → `x.svg`
- 👢 Expulsar → `user-x.svg`
- ⬆️ Promover → `arrow-up.svg`
- ⬇️ Rebaixar → `arrow-down.svg`

#### Duelo (3 ícones)
- ⚡ Ataque → `zap.svg`
- 🛡 Defender → `shield.svg`
- 🎯 Especial → `target.svg`

#### Loja (4 ícones)
- ◀️ Anterior → `chevron-left.svg`
- ▶️ Próximo → `chevron-right.svg`
- 🛒 Comprar → `shopping-cart.svg`
- ❌ Fechar → `x.svg`

#### Perfil (3 ícones)
- ✏️ Editar → `edit.svg`
- 🖼 Fundo → `image.svg`
- 🖼️ Moldura → `square.svg`

#### Territórios (5 ícones)
- ⬅️ Anterior → `chevron-left.svg`
- ➡️ Próximo → `chevron-right.svg`
- 💰 Comprar → `dollar-sign.svg`
- 🗺️ Meus Territórios → `map.svg`
- ❌ Fechar → `x.svg`

#### E mais...
- 📊 Progresso Mineração → `activity.svg`
- 🎁 Reclamar Recompensa → `gift.svg`
- 💳 Banco → `credit-card.svg`
- 💸 Transferir → `arrow-right-circle.svg`
- 💼 Trabalhar → `briefcase.svg`
- ⚙️ Configurações → `settings.svg`
- ❓ Ajuda → `help-circle.svg`
- 🔍 Buscar → `search.svg`
- ⭐ Favoritar → `star.svg`
- 🔒 Trancar → `lock.svg`

## 🚀 Como Usar

### Comandos NPM Disponíveis

```bash
# Listar todos os ícones mapeados
npm run icons:list

# Converter SVGs para PNG (necessário para upload)
npm run icons:convert

# Fazer upload para o Discord (substitua GUILD_ID pelo ID do seu servidor)
npm run icons:upload <GUILD_ID>
```

### No Código

```typescript
import { getIconEmoji } from "../../utils/iconManager";

// Usar em qualquer botão
new ButtonBuilder()
  .setCustomId("meu_botao")
  .setLabel("Meu Botão")
  .setStyle(ButtonStyle.Primary)
  .setEmoji(getIconEmoji("shop_buy")); // Retorna 🛒 ou emoji personalizado
```

## 📝 Exemplo Completo

O arquivo `src/commands/admin/embedbuilder.ts` já foi atualizado como exemplo!

**Antes:**
```typescript
.setEmoji("📄")
```

**Depois:**
```typescript
.setEmoji(getIconEmoji("eb_basic")) // Usa file-text.svg
```

## 🎨 Próximos Passos

### Opção 1: Usar como está (Recomendado)
Os ícones já funcionam! O sistema usa emojis Unicode como fallback. Nenhuma ação necessária.

### Opção 2: Emojis Personalizados (Visual Premium)

Para ter os ícones Feather como emojis personalizados no Discord:

1. **Converter SVGs para PNG:**
   ```bash
   npm run icons:convert
   ```

2. **Fazer upload para o Discord:**
   ```bash
   npm run icons:upload SEU_GUILD_ID
   ```

3. **Pronto!** O bot usará automaticamente os emojis personalizados.

**Nota:** Servidores Discord têm limites de emojis:
- Nível 0 (sem boost): 50 emojis
- Nível 1 (2 boosts): 100 emojis
- Nível 2 (7 boosts): 150 emojis
- Nível 3 (14 boosts): 250 emojis

## 📚 Documentação

Consulte **`docs/ICONS_GUIDE.md`** para o guia completo em português!

## 🔧 Arquivos para Atualizar

Para aplicar os ícones nos outros comandos, basta:

1. Importar: `import { getIconEmoji } from "../../utils/iconManager";`
2. Usar: `.setEmoji(getIconEmoji("nome_da_acao"))`

### Comandos que podem ser atualizados:

- ✅ `src/commands/admin/embedbuilder.ts` - **JÁ ATUALIZADO!**
- ⬜ `src/commands/guild/guilda.ts`
- ⬜ `src/commands/gambling/duel.ts`
- ⬜ `src/events/interaction-handlers/buttons/shopHandlers.ts`
- ⬜ `src/events/interaction-handlers/buttons/profileHandlers.ts`
- ⬜ `src/utils/territoryManager.ts`
- ⬜ `src/commands/utility/poll.ts`

## 💡 Adicionar Novos Ícones

Edite `src/utils/iconManager.ts` e adicione em `ICON_MAPPINGS`:

```typescript
{
  action: "minha_acao",
  iconName: "star",              // Nome do arquivo SVG
  fallbackEmoji: "⭐",
  description: "Minha descrição"
}
```

---

**🤠 Sistema criado para Sheriff Rex Bot**

**287 ícones disponíveis** | **55 ações mapeadas** | **1 comando atualizado**
