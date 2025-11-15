# 🎨 Como Usar os Ícones SVG no seu Bot

## ✅ Tudo Pronto!

Integrei completamente os **287 ícones SVG do Feather Icons** no seu bot Sheriff Rex! 

## 📊 Resumo do que foi feito:

### 1. ✅ Ícones Extraídos
- **287 ícones SVG** salvos em `assets/icons/`
- Todos os ícones do Feather Icons disponíveis

### 2. ✅ Sistema de Gerenciamento Criado
- **`src/utils/iconManager.ts`**: Sistema centralizado
- **55 ações mapeadas** para os ícones certos
- Emojis Unicode de fallback automático

### 3. ✅ Scripts de Automação
Adicionados ao `package.json`:
```bash
npm run icons:list      # Ver todos os ícones disponíveis
npm run icons:convert   # Converter SVG → PNG
npm run icons:upload    # Fazer upload para Discord
```

### 4. ✅ Exemplo Funcionando
O comando **Embed Builder** já está usando os novos ícones!

## 🚀 Como Funciona

### Uso Simples (no código):

```typescript
import { getIconEmoji } from "../../utils/iconManager";

// Criar botão com ícone
new ButtonBuilder()
  .setCustomId("shop_buy")
  .setLabel("Comprar")
  .setEmoji(getIconEmoji("shop_buy")); // 🛒 (shopping-cart.svg)
```

### Ícones Disponíveis por Categoria:

#### 🎨 **Embed Builder** (14 ícones)
```
📄 Básico     → file-text.svg
👥 Autor      → user.svg
🖼 Imagens    → image.svg
⬇ Rodapé     → arrow-down.svg
➕ Adicionar  → plus-circle.svg
📝 Gerenciar  → edit-3.svg
🎨 Cor        → droplet.svg
🕐 Tempo      → clock.svg
📑 Template   → file.svg
📥 Importar   → download.svg
📤 Exportar   → upload.svg
🗑 Limpar     → trash-2.svg
✉ Enviar     → send.svg
❌ Cancelar   → x-circle.svg
```

#### 🏰 **Guilda** (8 ícones)
```
ℹ️ Info        → info.svg
👥 Membros     → users.svg
🚪 Sair        → log-out.svg
✅ Confirmar   → check.svg
❌ Cancelar    → x.svg
👢 Expulsar    → user-x.svg
⬆️ Promover    → arrow-up.svg
⬇️ Rebaixar    → arrow-down.svg
```

#### ⚔️ **Duelo** (3 ícones)
```
⚡ Ataque    → zap.svg
🛡 Defender  → shield.svg
🎯 Especial  → target.svg
```

#### 🛒 **Loja** (4 ícones)
```
◀️ Anterior  → chevron-left.svg
▶️ Próximo   → chevron-right.svg
🛒 Comprar   → shopping-cart.svg
❌ Fechar    → x.svg
```

#### 👤 **Perfil** (3 ícones)
```
✏️ Editar    → edit.svg
🖼 Fundo     → image.svg
🖼️ Moldura   → square.svg
```

#### 🗺️ **Territórios** (5 ícones)
```
⬅️ Anterior       → chevron-left.svg
➡️ Próximo        → chevron-right.svg
💰 Comprar        → dollar-sign.svg
🗺️ Meus Territ.  → map.svg
❌ Fechar         → x.svg
```

#### ⛏️ **Mineração** (2 ícones)
```
📊 Progresso  → activity.svg
🎁 Reclamar   → gift.svg
```

#### 💰 **Economia** (3 ícones)
```
💳 Banco       → credit-card.svg
💸 Transferir  → arrow-right-circle.svg
💼 Trabalhar   → briefcase.svg
```

#### ⚙️ **Geral** (13 ícones)
```
✅ Confirmar      → check.svg
❌ Cancelar       → x.svg
🗑️ Deletar        → trash-2.svg
🔄 Atualizar      → refresh-cw.svg
⚙️ Configurações  → settings.svg
❓ Ajuda          → help-circle.svg
🔍 Buscar         → search.svg
🔍 Filtrar        → filter.svg
⭐ Favoritar      → star.svg
🔒 Trancar        → lock.svg
🔓 Destrancar     → unlock.svg
```

## 📝 Ver Todos os Ícones

Execute este comando para ver a lista completa:

```bash
npm run icons:list
```

## 🎯 Opções de Uso

### Opção 1: Emojis Unicode (Atual - Já Funciona!)
- ✅ **Já está ativo**
- ✅ Não precisa fazer nada
- ✅ Funciona em qualquer servidor
- ℹ️ Usa emojis Unicode padrão (🛒, 📄, ✨, etc.)

### Opção 2: Emojis Personalizados (Visual Premium)
- 🎨 Ícones Feather originais
- ✨ Visual mais profissional
- 📋 Requer alguns passos:

```bash
# Passo 1: Converter SVG para PNG
npm run icons:convert

# Passo 2: Fazer upload para seu servidor Discord
# (Substitua 123456789 pelo ID do seu servidor)
npm run icons:upload 123456789

# Pronto! O bot usará automaticamente os emojis personalizados
```

**Como pegar o ID do servidor:**
1. Ative "Modo Desenvolvedor" no Discord (Configurações → Avançado)
2. Clique com botão direito no nome do servidor
3. Selecione "Copiar ID do Servidor"

## 📚 Documentação Completa

Consulte **`docs/ICONS_GUIDE.md`** para o guia completo em português com todos os detalhes!

## 🔧 Atualizar Outros Comandos

Para aplicar ícones em outros comandos do bot:

1. Abra o arquivo do comando
2. Adicione o import:
   ```typescript
   import { getIconEmoji } from "../../utils/iconManager";
   ```
3. Substitua `.setEmoji("🛒")` por `.setEmoji(getIconEmoji("shop_buy"))`

### Comandos que você pode atualizar:

- ✅ **`embedbuilder.ts`** - JÁ ATUALIZADO COMO EXEMPLO!
- ⬜ `guilda.ts` - 8 ícones prontos
- ⬜ `duel.ts` - 3 ícones prontos
- ⬜ `shopHandlers.ts` - 4 ícones prontos
- ⬜ `profileHandlers.ts` - 3 ícones prontos
- ⬜ `territoryManager.ts` - 5 ícones prontos
- ⬜ `poll.ts` - 2 ícones prontos

## 💡 Adicionar Novo Ícone

Para mapear um novo ícone:

1. Abra `src/utils/iconManager.ts`
2. Adicione em `ICON_MAPPINGS`:

```typescript
{
  action: "minha_acao",          // ID único
  iconName: "star",               // Nome do arquivo SVG (sem .svg)
  fallbackEmoji: "⭐",            // Emoji Unicode
  description: "Favoritar item"   // Descrição
}
```

3. Use no código:

```typescript
.setEmoji(getIconEmoji("minha_acao"))
```

## 🎨 Galeria de Ícones

Veja todos os 287 ícones disponíveis em:
- 📂 `assets/icons/` (SVG originais)
- 🌐 https://feathericons.com/ (Galeria online)

---

**🤠 Sistema integrado com sucesso no Sheriff Rex Bot!**

**287 ícones** | **55 ações mapeadas** | **Pronto para usar!**
