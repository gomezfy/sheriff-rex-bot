# 🎮 Guia de Modificação dos Comandos de Jogo

Este guia ensina como modificar os principais comandos de jogo do Sheriff Rex Bot. Todos os comandos seguem a mesma estrutura e padrões, facilitando as modificações.

## 📋 Índice
1. [Estrutura Básica de um Comando](#estrutura-básica)
2. [Modificar Valores de Recompensas](#modificar-recompensas)
3. [Modificar Duração de Jogos](#modificar-duração)
4. [Adicionar Novos Itens](#adicionar-itens)
5. [Modificar Dificuldade](#modificar-dificuldade)
6. [Testar Modificações](#testar-modificações)

---

## 📁 Estrutura Básica

Todos os comandos de jogo estão organizados em categorias:

```
src/commands/
├── gambling/       # Jogos de apostas
│   ├── dice.ts     # Jogo de dados
│   ├── duel.ts     # Duelo PvP
│   ├── bankrob.ts  # Assalto ao banco
│   └── roulette.ts # Roleta
├── mining/         # Sistema de mineração
│   └── mine.ts     # Comando de mineração
└── economy/        # Economia
    └── expedition.ts # Expedições
```

### Estrutura de um Comando TypeScript

```typescript
import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('comando')
  .setDescription('Descrição do comando');

export async function execute(interaction) {
  // Lógica do comando aqui
}

export const cooldown = 30; // Cooldown em segundos
```

---

## 💰 Modificar Recompensas

### 1. **Jogo de Dados (/dice)**

**Arquivo:** `src/commands/gambling/dice.ts`

**Modificar aposta mínima:**
```typescript
// Linha ~46
.setMinValue(10)  // Altere para o valor mínimo desejado
```

**Modificar cooldown:**
```typescript
// Linha ~71
const cooldownAmount = 10000; // 10 segundos (em milissegundos)
```

### 2. **Duelo (/duel)**

**Arquivo:** `src/commands/gambling/duel.ts`

**Modificar HP inicial:**
```typescript
// Linha ~40-44
function createPlayer(user: User): DuelPlayer {
  return {
    user,
    hp: 100,      // ← HP inicial (altere aqui)
    maxHp: 100,   // ← HP máximo (altere aqui)
    defense: false,
    specialUsed: false,
  };
}
```

**Modificar dano das ações:**
```typescript
// Linha ~48-56
function calculateDamage(attacker, defender, isSpecial) {
  // Ataque especial: 25-45 de dano
  const baseDamage = isSpecial 
    ? Math.floor(Math.random() * 21) + 25  // ← Especial: min 25, max 45
    : Math.floor(Math.random() * 16) + 10; // ← Normal: min 10, max 25
  
  if (defender.defense) {
    return Math.floor(baseDamage * 0.4); // ← Redução da defesa (60%)
  }
  
  return baseDamage;
}
```

**Modificar recompensas de XP:**
```typescript
// Linha ~363-364
const winnerXpResult = addXp(winner.user.id, 50, true);  // ← XP do vencedor
const loserXpResult = addXp(loser.user.id, 15, true);    // ← XP do perdedor
```

**Modificar cooldown:**
```typescript
// Linha ~425
export const cooldown = 30; // ← Cooldown em segundos
```

### 3. **Mineração (/mine)**

**Arquivo:** `src/commands/mining/mine.ts`

**Modificar duração:**
```typescript
// Linha ~43-45
const GOLD_VALUE = 13439;                 // Valor em prata de cada barra de ouro
const SOLO_DURATION = 90 * 60 * 1000;    // ← 90 minutos (solo)
const COOP_DURATION = 30 * 60 * 1000;    // ← 30 minutos (cooperativo)
```

**Modificar quantidade de ouro:**
```typescript
// Linha ~76-81 (função startMining)
data[userId] = {
  type,
  startTime: now,
  endTime: now + duration,
  claimed: false,
  goldAmount: goldAmount || (type === 'solo' 
    ? Math.floor(Math.random() * 3) + 1  // ← Solo: 1-3 barras
    : 0),
  partnerId: partnerId || null,
};
```

**Para mineração cooperativa, procure:**
```typescript
// Procure pela lógica de "coop" - geralmente 4-6 barras divididas
```

**Modificar chance de diamante:**
```typescript
// Linha ~422-428
const diamondChance = Math.random();
if (diamondChance < 0.20) {  // ← 20% de chance (0.20 = 20%)
  const diamondResult = addItem(userId, 'diamond', 1);
  if (diamondResult.success) {
    foundDiamond = true;
  }
}
```

### 4. **Expedição (/expedition)**

**Arquivo:** `src/commands/economy/expedition.ts`

**Modificar duração:**
```typescript
// Linha ~44-46
const EXPEDITION_DURATION_SHORT = 3 * 60 * 60 * 1000;  // ← 3 horas
const EXPEDITION_DURATION_LONG = 10 * 60 * 60 * 1000;  // ← 10 horas
const EXPEDITION_COOLDOWN = 6 * 60 * 60 * 1000;        // ← 6 horas cooldown
```

**Modificar custo de selos:**
```typescript
// Linha ~49-52
const SEAL_COST_3H = 12;           // ← 12 selos para 3h
const SEAL_COST_10H_SOLO = 30;     // ← 30 selos para 10h solo
const SEAL_COST_10H_PARTY = 10;    // ← 10 selos por pessoa (10h grupo)
```

**Modificar recompensas:**
```typescript
// Linha ~84-108 (função calculateRewards)
function calculateRewards(duration, partySize) {
  if (duration === EXPEDITION_DURATION_SHORT) {
    // Expedição de 3 horas
    return {
      silverMin: 10000,    // ← Mínimo de prata
      silverMax: 30000,    // ← Máximo de prata
      goldBars: 8,         // ← Barras de ouro
      wheatMin: 2000,      // ← Mínimo de trigo
      wheatMax: 6000,      // ← Máximo de trigo
      honey: 10,           // ← Mel
      xp: 1000,            // ← XP
    };
  } else {
    // Expedição de 10 horas
    return {
      silverMin: 40000,    // ← Mínimo de prata
      silverMax: 100000,   // ← Máximo de prata
      goldBars: 25,        // ← Barras de ouro
      wheatMin: 8000,      // ← Mínimo de trigo
      wheatMax: 15000,     // ← Máximo de trigo
      honey: 35,           // ← Mel
      xp: 3500,            // ← XP
    };
  }
}
```

---

## ⏱️ Modificar Duração

### Formato de Tempo
```typescript
// JavaScript trabalha com milissegundos
1 segundo  = 1000
1 minuto   = 60 * 1000
1 hora     = 60 * 60 * 1000
1 dia      = 24 * 60 * 60 * 1000

// Exemplos práticos:
30 segundos = 30 * 1000          // 30000
5 minutos   = 5 * 60 * 1000      // 300000
2 horas     = 2 * 60 * 60 * 1000 // 7200000
```

### Modificar Cooldowns

**Cooldown de comando (global):**
```typescript
// No final do arquivo do comando
export const cooldown = 30; // em segundos
```

**Cooldown interno (específico do jogo):**
```typescript
// Dentro da função execute
const cooldownAmount = 10000; // em milissegundos
```

---

## 🎁 Adicionar Novos Itens

### 1. Definir o item no inventoryManager

**Arquivo:** `src/utils/inventoryManager.ts`

```typescript
// Procure pela função getItemWeight e adicione:
function getItemWeight(itemType: string): number {
  const weights: { [key: string]: number } = {
    'gold': 1,        // 1kg
    'silver': 0.005,  // 5g
    'wheat': 0.0005,  // 0.5g
    'honey': 0.05,    // 50g
    'seal': 0.01,     // 10g
    'diamond': 0.1,   // 100g
    'novo_item': 0.5, // ← Adicione aqui (500g)
  };
  return weights[itemType] || 0;
}
```

### 2. Adicionar tradução

**Arquivo:** `src/utils/i18n.ts`

```typescript
// Seção PT-BR (procure por "inventory_item_")
'inventory_item_novo_item': 'Novo Item',
'inventory_item_novo_item_desc': 'Descrição do novo item',

// Seção EN-US (mesmas linhas, traduzido)
'inventory_item_novo_item': 'New Item',
'inventory_item_novo_item_desc': 'New item description',
```

### 3. Usar o item em comandos

```typescript
// Em qualquer comando, você pode:
import { addItem, removeItem, getItem } from '../../utils/inventoryManager';

// Adicionar item
const result = addItem(userId, 'novo_item', quantidade);
if (result.success) {
  // Item adicionado com sucesso
}

// Remover item
const removed = removeItem(userId, 'novo_item', quantidade);

// Verificar quantidade
const quantidade = getItem(userId, 'novo_item');
```

---

## 🎯 Modificar Dificuldade

### Jogo de Dados - Mudar para mais fácil

```typescript
// Opção 1: Reduzir intervalo de valores (2-12 → 2-7)
.setMinValue(2)
.setMaxValue(7)  // ← Números menores = mais fácil adivinhar

// Opção 2: Aumentar tempo de resposta
time: 60000,  // ← 60 segundos em vez de 30
```

### Duelo - Ajustar balanceamento

```typescript
// Mais fácil (menos dano, mais HP):
hp: 150,           // ← Aumentar HP
maxHp: 150,

// Dano do ataque normal reduzido:
Math.floor(Math.random() * 11) + 5  // 5-15 em vez de 10-25

// Defesa mais eficaz:
return Math.floor(baseDamage * 0.2); // 80% redução em vez de 60%
```

### Mineração - Mais recompensas

```typescript
// Mais ouro:
goldAmount: Math.floor(Math.random() * 6) + 3  // 3-8 barras em vez de 1-3

// Menos tempo:
const SOLO_DURATION = 45 * 60 * 1000;  // 45 minutos em vez de 90

// Mais chance de diamante:
if (diamondChance < 0.50) {  // 50% em vez de 20%
```

---

## 🧪 Testar Modificações

### 1. **Compilar o código**
```bash
npm run build
```

### 2. **Verificar erros**
```bash
npm run lint
```

### 3. **Reiniciar o bot**
O workflow reinicia automaticamente quando você salva arquivos, mas se precisar reiniciar manualmente:
- Clique no botão "Stop" no painel do workflow
- Clique no botão "Run" para iniciar novamente

### 4. **Testar no Discord**
1. Use o comando modificado no Discord
2. Verifique se as mudanças funcionam como esperado
3. Teste casos extremos (valores mínimos/máximos)

### 5. **Verificar logs**
Se algo não funcionar, verifique os logs do bot na aba "Console" do Replit.

---

## 💡 Dicas Importantes

### ✅ Boas Práticas

1. **Faça uma mudança por vez**
   - Modifique um valor
   - Teste
   - Confirme que funciona
   - Repita

2. **Anote os valores originais**
   - Antes de mudar, copie o valor original
   - Assim você pode voltar se necessário

3. **Use comentários**
   ```typescript
   const SOLO_DURATION = 45 * 60 * 1000;  // Original: 90 minutos
   ```

4. **Teste com valores pequenos primeiro**
   - Ex: Ao testar duração, use 1 minuto em vez de 10 horas

### ⚠️ Cuidados

1. **Não mude tipos de dados**
   ```typescript
   // ❌ ERRADO
   const cooldown = "30"; // String
   
   // ✅ CORRETO
   const cooldown = 30;   // Número
   ```

2. **Mantenha a sintaxe TypeScript**
   - Sempre use ponto e vírgula `;`
   - Respeite as chaves `{}`
   - Não remova imports necessários

3. **Cuidado com balanceamento**
   - Recompensas muito altas podem quebrar a economia
   - Cooldowns muito baixos podem causar spam
   - Testes excessivos podem lotar o inventário

---

## 📚 Recursos Adicionais

### Arquivos Importantes

- **Economia:** `src/utils/dataManager.ts` - Gerencia moedas e tokens
- **Inventário:** `src/utils/inventoryManager.ts` - Gerencia itens
- **Traduções:** `src/utils/i18n.ts` - Todas as mensagens
- **XP:** `src/utils/xpManager.ts` - Sistema de níveis

### Onde Encontrar Valores

**Valores de moeda:**
```typescript
// src/commands/mining/mine.ts
const GOLD_VALUE = 13439; // Valor em prata de cada barra de ouro
```

**Limites de inventário:**
```typescript
// src/utils/inventoryManager.ts
maxWeight: 100 // 100kg padrão
```

**Sistema de níveis:**
```typescript
// src/utils/xpManager.ts
// Fórmula: level^2 * 100 XP necessário para próximo nível
```

---

## 🎮 Exemplos Práticos

### Exemplo 1: Duelo mais rápido e com mais XP

```typescript
// src/commands/gambling/duel.ts

// HP reduzido para partidas mais rápidas (linha ~40)
hp: 50,
maxHp: 50,

// Dano aumentado (linha ~49)
const baseDamage = isSpecial 
  ? Math.floor(Math.random() * 31) + 40  // 40-70 dano
  : Math.floor(Math.random() * 21) + 20; // 20-40 dano

// Mais XP (linha ~363)
const winnerXpResult = addXp(winner.user.id, 100, true);  // 100 XP
const loserXpResult = addXp(loser.user.id, 50, true);     // 50 XP

// Cooldown menor (linha ~425)
export const cooldown = 15; // 15 segundos
```

### Exemplo 2: Mineração mais rentável

```typescript
// src/commands/mining/mine.ts

// Mais barras de ouro (linha ~80)
goldAmount: Math.floor(Math.random() * 8) + 5  // 5-12 barras

// Duração reduzida (linha ~44)
const SOLO_DURATION = 30 * 60 * 1000;  // 30 minutos

// Chance de diamante dobrada (linha ~423)
if (diamondChance < 0.40) {  // 40% de chance
```

### Exemplo 3: Expedição com recompensas épicas

```typescript
// src/commands/economy/expedition.ts

// Recompensas aumentadas (linha ~87-95)
return {
  silverMin: 50000,     // 50k-150k prata
  silverMax: 150000,
  goldBars: 20,         // 20 barras
  wheatMin: 10000,      // 10k-20k trigo
  wheatMax: 20000,
  honey: 50,            // 50 mel
  xp: 5000,             // 5000 XP
};

// Cooldown reduzido (linha ~46)
const EXPEDITION_COOLDOWN = 2 * 60 * 60 * 1000;  // 2 horas
```

---

## 🆘 Resolução de Problemas

### Erro de Compilação
```bash
# Verifique a sintaxe TypeScript
npm run lint

# Se houver erros, leia a mensagem e corrija
# Geralmente são:
# - Ponto e vírgula faltando
# - Chaves não fechadas
# - Tipos incompatíveis
```

### Bot não responde ao comando
1. Verifique se o bot está online
2. Veja os logs no console
3. Certifique-se de ter recompilado (`npm run build`)
4. Reinicie o workflow

### Valores não mudaram
1. Confirme que salvou o arquivo
2. Recompile o código (`npm run build`)
3. Reinicie o bot
4. Limpe o cache do Discord (Ctrl+R)

---

## ✨ Conclusão

Agora você tem tudo para personalizar os comandos de jogo do seu bot! Lembre-se:

1. **Comece pequeno** - Mude uma coisa por vez
2. **Teste sempre** - Antes de fazer várias mudanças
3. **Documente** - Anote o que mudou
4. **Divirta-se** - Experimente e encontre o balanceamento perfeito!

Se tiver dúvidas sobre alguma modificação específica, consulte o código dos comandos ou peça ajuda!

**Bom desenvolvimento, parceiro! 🤠**
