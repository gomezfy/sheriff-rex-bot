# 📖 Guia de Comandos - Sheriff Bot

## 🗂️ Estrutura de Comandos

Todos os comandos estão organizados em categorias dentro da pasta `src/commands/`. Cada arquivo representa um comando específico do bot.

---

## 📂 Categorias de Comandos

### 🛡️ **Admin** (Administração)
Comandos administrativos para gerenciar o servidor.

| Arquivo | Comando | Descrição |
|---------|---------|-----------|
| `admin.ts` | `/admin` | Painel administrativo geral |
| `embedbuilder.ts` | `/embedbuilder` | Construtor de mensagens embed personalizadas |
| `welcome.ts` | `/welcome` | Configuração de mensagens de boas-vindas |

**Localização:** `src/commands/admin/`

---

### 💰 **Economy** (Economia)
Sistema de economia do servidor com moedas e recompensas.

| Arquivo | Comando | Descrição |
|---------|---------|-----------|
| `daily.ts` | `/daily` | Recompensa diária |
| `give.ts` | `/give` | Transferir moedas para outro usuário |
| `leaderboard.ts` | `/leaderboard` | Ranking de usuários mais ricos |
| `expedition.ts` | `/expedition` | Sistema de expedições para ganhar recompensas |
| `territories.ts` | `/territories` | Sistema de territórios |
| `middleman.ts` | `/middleman` | Sistema de intermediação de trocas |
| `redeem.ts` | `/redeem` | Resgatar códigos promocionais |
| `setuptoken.ts` | `/setuptoken` | Configurar tokens personalizados |
| `addgold.ts` | `/addgold` | (Admin) Adicionar ouro |
| `addsilver.ts` | `/addsilver` | (Admin) Adicionar prata |
| `addtokens.ts` | `/addtokens` | (Admin) Adicionar tokens |
| `addbackpack.ts` | `/addbackpack` | (Admin) Adicionar slots na mochila |
| `addseal.ts` | `/addseal` | (Admin) Adicionar selo especial |
| `removegold.ts` | `/removegold` | (Admin) Remover ouro |

**Localização:** `src/commands/economy/`

---

### 🎲 **Gambling** (Jogos de Azar)
Mini jogos e apostas.

| Arquivo | Comando | Descrição |
|---------|---------|-----------|
| `dice.ts` | `/dice` | Jogo de dados |
| `duel.ts` | `/duel` | Duelo entre usuários |
| `roulette.ts` | `/roulette` | Roleta |
| `bankrob.ts` | `/bankrob` | Assalto ao banco |

**Localização:** `src/commands/gambling/`

---

### ⛏️ **Mining** (Mineração)
Sistema de mineração de recursos.

| Arquivo | Comando | Descrição |
|---------|---------|-----------|
| `mine.ts` | `/mine` | Minerar recursos (ouro, prata, gemas) |

**Localização:** `src/commands/mining/`

---

### 🎯 **Bounty** (Recompensas/Procurados)
Sistema de recompensas por captura.

| Arquivo | Comando | Descrição |
|---------|---------|-----------|
| `wanted.ts` | `/wanted` | Colocar alguém como procurado |
| `capture.ts` | `/capture` | Capturar um procurado |
| `bounties.ts` | `/bounties` | Ver lista de procurados |
| `clearbounty.ts` | `/clearbounty` | Limpar recompensa |

**Localização:** `src/commands/bounty/`

---

### 👤 **Profile** (Perfil)
Comandos relacionados ao perfil do usuário.

| Arquivo | Comando | Descrição |
|---------|---------|-----------|
| `profile.ts` | `/profile` | Ver perfil do usuário |
| `inventory.ts` | `/inventory` | Ver inventário |

**Localização:** `src/commands/profile/`

---

### 🏰 **Guild** (Guildas)
Sistema de guildas/clãs.

| Arquivo | Comando | Descrição |
|---------|---------|-----------|
| `guilda.ts` | `/guilda` | Gerenciar guilda |

**Localização:** `src/commands/guild/`

---

### 🔧 **Utility** (Utilidades)
Comandos de utilidade geral.

| Arquivo | Comando | Descrição |
|---------|---------|-----------|
| `help.ts` | `/help` | Menu de ajuda |
| `ping.ts` | `/ping` | Verificar latência do bot |
| `poll.ts` | `/poll` | Criar enquetes |

**Localização:** `src/commands/utility/`

---

## 🛠️ Como Modificar um Comando

### Passo 1: Localizar o Arquivo
Encontre o arquivo do comando que deseja modificar usando a tabela acima.

**Exemplo:** Para modificar o comando de dados, edite `src/commands/gambling/dice.ts`

### Passo 2: Entender a Estrutura
Cada comando segue esta estrutura básica:

```typescript
import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '@/types';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('nome-do-comando')
    .setDescription('Descrição do comando'),
  
  async execute(interaction) {
    // Lógica do comando aqui
  }
};

export default command;
```

### Passo 3: Fazer Modificações
- **Nome/Descrição:** Modifique em `data: new SlashCommandBuilder()`
- **Lógica:** Modifique dentro da função `execute()`
- **Parâmetros:** Adicione opções com `.addStringOption()`, `.addUserOption()`, etc.

### Passo 4: Testar
Após modificar, o bot recarrega automaticamente em modo desenvolvimento (`npm run dev`).

Para registrar novos comandos ou mudanças de estrutura no Discord:
```bash
npm run deploy
```

---

## 📝 Exemplos de Modificações Comuns

### Alterar Recompensa de um Jogo
**Arquivo:** `src/commands/gambling/dice.ts`

Procure por variáveis como `winAmount`, `reward`, ou similar e ajuste os valores.

### Modificar Cooldown
Procure por `cooldownManager` no arquivo e ajuste o tempo:
```typescript
cooldownManager.setCooldown(userId, 'comando', 3600000); // 1 hora em ms
```

### Adicionar Nova Opção a um Comando
```typescript
.addStringOption(option =>
  option
    .setName('nova-opcao')
    .setDescription('Descrição da opção')
    .setRequired(true)
)
```

---

## 🗺️ Arquivos Importantes

### Gerenciadores (Utils)
Localização: `src/utils/`

| Arquivo | Função |
|---------|--------|
| `database.ts` | Gerenciamento do banco de dados |
| `cooldownManager.ts` | Sistema de cooldowns |
| `embedBuilders.ts` | Criação de embeds padronizadas |
| `inventoryManager.ts` | Gerenciamento de inventário |
| `customEmojis.ts` | Emojis personalizados |

### Dados
Localização: `src/data/`

Arquivos JSON que armazenam dados do bot (economia, inventários, perfis, etc.)

---

## 🚀 Comandos Úteis

```bash
# Modo desenvolvimento (recarrega automaticamente)
npm run dev

# Compilar TypeScript
npm run build

# Registrar comandos no Discord
npm run deploy

# Executar em produção
npm start

# Verificar erros de código
npm run lint

# Corrigir formatação
npm run format
```

---

## ❓ Qual comando você quer modificar?

Agora que o bot está configurado e funcionando, me diga qual comando específico você gostaria de modificar e que mudanças deseja fazer! 🤠
