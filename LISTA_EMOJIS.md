# 🎨 Lista Completa de Emojis do Sheriff Bot

## Emojis Customizados Existentes (40 emojis)

### 💰 Economia & Moedas
| Nome | Emoji Texto | Arquivo PNG | Status |
|------|-------------|-------------|--------|
| SALOON_TOKEN | 🎫 | saloon-token.png | ✅ Existe |
| SILVER_COIN | 🪙 | silver-coin.png | ✅ Existe |
| GOLD_BAR | 🥇 | gold-bar.png | ✅ Existe |
| MONEYBAG | 💰 | moneybag.png | ✅ Existe |
| CURRENCY | 💱 | currency.png | ✅ Existe |
| GEM | 💎 | gem.png | ✅ Existe |
| DIAMOND | 💎 | diamond.png | ✅ Existe |

### 🎖️ Medalhas & Prêmios
| Nome | Emoji Texto | Arquivo PNG | Status |
|------|-------------|-------------|--------|
| TROPHY | 🏆 | trophy.png | ✅ Existe |
| GOLD_MEDAL | 🥇 | gold_medal.png | ✅ Existe |
| SILVER_MEDAL | 🥈 | silver_medal.png | ✅ Existe |
| BRONZE_MEDAL | 🥉 | bronze_medal.png | ✅ Existe |
| STAR | ⭐ | star.png | ✅ Existe |

### 🤠 Cowboy & Western
| Nome | Emoji Texto | Arquivo PNG | Status |
|------|-------------|-------------|--------|
| COWBOY | 🤠 | cowboy.png | ✅ Existe |
| COWBOY_HORSE | 🏇 | cowboy_horse.png | ✅ Existe |
| COWBOYS | 👥 | cowboys.png | ✅ Existe |
| RUNNING_COWBOY | 🏃 | running_cowboy.png | ✅ Existe |
| REVOLVER | 🔫 | revolver.png | ✅ Existe |
| DUST | 💨 | dust.png | ✅ Existe |

### 🎒 Itens & Objetos
| Nome | Emoji Texto | Arquivo PNG | Status |
|------|-------------|-------------|--------|
| BACKPACK | 🎒 | backpack.png | ✅ Existe |
| BRIEFCASE | 💼 | briefcase.png | ✅ Existe |
| CRATE | 📦 | crate.png | ✅ Existe |
| SCROLL | 📜 | scroll.png | ✅ Existe |
| GIFT | 🎁 | gift.png | ✅ Existe |
| PICKAXE | ⛏️ | pickaxe.png | ✅ Existe |
| DART | 🎯 | dart.png | ✅ Existe |

### ✅ Status & Indicadores
| Nome | Emoji Texto | Arquivo PNG | Status |
|------|-------------|-------------|--------|
| CHECK | ✅ | check.png | ✅ Existe |
| CANCEL | ❌ | cancel.png | ✅ Existe |
| CROSS | ❌ | cross.png | ✅ Existe |
| WARNING | ⚠️ | warning.png | ✅ Existe |
| INFO | ℹ️ | info.png | ✅ Existe |
| LOCK | 🔒 | lock.png | ✅ Existe |

### ⏰ Tempo & Ações
| Nome | Emoji Texto | Arquivo PNG | Status |
|------|-------------|-------------|--------|
| CLOCK | 🕐 | clock.png | ✅ Existe |
| TIMER | ⏱️ | timer.png | ✅ Existe |
| ALARM | 🚨 | alarm.png | ✅ Existe |

### 🏦 Locais & Edifícios
| Nome | Emoji Texto | Arquivo PNG | Status |
|------|-------------|-------------|--------|
| BANK | 🏦 | bank.png | ✅ Existe |

### ✨ Efeitos & Visuais
| Nome | Emoji Texto | Arquivo PNG | Status |
|------|-------------|-------------|--------|
| SPARKLES | ✨ | sparkles.png | ✅ Existe |
| LIGHTNING | ⚡ | lightning.png | ✅ Existe |

### 📊 Utilidades
| Nome | Emoji Texto | Arquivo PNG | Status |
|------|-------------|-------------|--------|
| STATS | 📊 | stats.png | ✅ Existe |
| BALANCE | ⚖️ | balance.png | ✅ Existe |
| MUTE | 🔇 | mute.png | ✅ Existe |

---

## 🆕 Sugestões de Novos Emojis Customizados

Baseado no tema Western do bot, aqui estão ideias de novos emojis:

### Armas & Combate
- 🎯 **TARGET** - Alvo de tiro
- 💣 **DYNAMITE** - Dinamite
- 🪓 **AXE** - Machado
- 🗡️ **KNIFE** - Faca
- 🏹 **BOW** - Arco e flecha

### Animais Western
- 🐎 **HORSE** - Cavalo
- 🐂 **BULL** - Touro
- 🦅 **EAGLE** - Águia
- 🐍 **SNAKE** - Cobra
- 🦂 **SCORPION** - Escorpião

### Locais & Construções
- 🏚️ **SALOON** - Saloon
- ⛏️ **MINE_ENTRANCE** - Entrada de mina
- 🏜️ **DESERT** - Deserto
- 🌵 **CACTUS** - Cacto
- 🛤️ **RAILROAD** - Ferrovia

### Comida & Bebida
- 🍺 **BEER** - Cerveja
- 🥃 **WHISKEY** - Whisky
- 🍖 **MEAT** - Carne
- ☕ **COFFEE** - Café

### Jogos & Cassino
- 🎰 **SLOT_MACHINE** - Caça-níqueis
- 🃏 **CARDS** - Cartas de baralho
- 🎲 **DICE** - Dados
- 🎴 **POKER_CHIP** - Ficha de poker

### Clima & Natureza
- ☀️ **SUN** - Sol
- 🌙 **MOON** - Lua
- ⭐ **NIGHT_STAR** - Estrela da noite
- 🌪️ **TORNADO** - Tornado
- 💨 **WIND** - Vento

---

## 📝 Como Adicionar Novos Emojis

1. **Criar a imagem PNG** (256x256px, máximo 256KB)
2. **Salvar em** `assets/custom-emojis/nome_do_emoji.png`
3. **Adicionar no código** em `src/utils/customEmojis.ts`:
   ```typescript
   // No objeto CUSTOM_EMOJIS
   NOME_EMOJI: getDataPath('assets', 'custom-emojis', 'nome_emoji.png'),
   
   // No objeto EMOJI_TEXT (fallback)
   NOME_EMOJI: '🔥',
   ```
4. **Criar função getter**:
   ```typescript
   export function getNomeEmoji(): string { 
     return getEmoji('nome_emoji'); 
   }
   ```
5. **Fazer upload no Discord** com `/uploademojis`

---

## 🎨 Dicas de Design

- **Tamanho:** 256x256px ou 512x512px
- **Formato:** PNG com transparência
- **Peso máximo:** 256KB
- **Estilo:** Simples e reconhecível
- **Cores:** Temática Western (marrom, dourado, vermelho)
