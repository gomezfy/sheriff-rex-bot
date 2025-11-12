# Sheriff Rex Bot - Documentação do Projeto

## 📋 Visão Geral
**Sheriff Rex** é um bot Discord completo em TypeScript com tema de faroeste (Wild West), oferecendo:
- 46 comandos slash organizados em 8 categorias
- Sistema de economia dual (Saloon Tokens + Silver Coins)
- Mini jogos e sistema de apostas
- Sistema de mineração (solo e cooperativo)
- Sistema de bounty hunting com pôsters visuais
- Sistema de moderação completo
- Perfis visuais personalizados com Canvas
- Suporte multilíngue (PT-BR, EN-US, ES-ES, FR)

## 🗂️ Estrutura do Projeto

```
Sheriff Bot/
├── src/
│   ├── commands/          # 46 comandos organizados por categoria
│   │   ├── admin/         # 11 comandos de administração
│   │   ├── ai/            # 2 comandos de IA
│   │   ├── bounty/        # 4 comandos de recompensas
│   │   ├── economy/       # 13 comandos de economia
│   │   ├── gambling/      # 5 comandos de jogos
│   │   ├── guild/         # 1 comando de guildas
│   │   ├── mining/        # 1 comando de mineração
│   │   ├── profile/       # 2 comandos de perfil
│   │   └── utility/       # 3 comandos utilitários
│   ├── events/            # Event handlers do Discord
│   ├── utils/             # Gerenciadores e utilitários
│   ├── types/             # Definições de tipos TypeScript
│   └── data/              # Armazenamento JSON de dados
├── assets/                # Recursos visuais (emojis, imagens)
├── database/              # Esquema SQL
└── server/                # Servidor web para Linked Roles
```

## 📂 Categorias de Comandos

### 🛡️ Admin (11 comandos)
- `/admin` - Painel administrativo
- `/embedbuilder` - Construtor de embeds
- `/welcome` - Configurar mensagens de boas-vindas
- `/setlogs` - Configurar canal de logs
- `/warn` - Avisar usuário
- `/warnings` - Ver avisos
- `/clearwarns` - Limpar avisos
- `/mute` - Silenciar usuário
- `/unmute` - Desilenciar usuário
- `/clear` - Limpar mensagens
- `/criaservidor` - Criar template de servidor

### 💰 Economy (13 comandos)
- `/daily` - Recompensa diária com streaks
- `/give` - Transferir moedas
- `/leaderboard` - Ranking de riqueza
- `/expedition` - Sistema de expedições
- `/territories` - Gerenciar territórios
- `/middleman` - Intermediação de trocas
- `/redeem` - Códigos promocionais
- `/armazem` - Gerenciar armazém
- `/addgold`, `/addsilver`, `/addtokens` - (Admin) Adicionar moedas
- `/removegold` - (Admin) Remover ouro
- `/addbackpack` - (Admin) Aumentar mochila
- `/addseal` - (Admin) Adicionar selos

### 🎲 Gambling (5 comandos)
- `/dice` - Jogo de dados
- `/duel` - Duelo PvP com apostas
- `/roulette` - Roleta
- `/bankrob` - Assalto ao banco
- `/roubo` - Sistema de roubo

### ⛏️ Mining (1 comando)
- `/mine` - Mineração de recursos (ouro, prata, gemas)

### 🎯 Bounty (4 comandos)
- `/wanted` - Colocar procurado
- `/capture` - Capturar procurado
- `/bounties` - Lista de procurados
- `/clearbounty` - Limpar recompensa

### 👤 Profile (2 comandos)
- `/profile` - Perfil visual com Canvas
- `/inventory` - Inventário de itens

### 🏰 Guild (1 comando)
- `/guilda` - Sistema de guildas/clãs

### 🔧 Utility (3 comandos)
- `/help` - Menu de ajuda
- `/ping` - Latência do bot
- `/poll` - Criar enquetes

### 🤖 AI (2 comandos)
- `/ai` - Conversar com IA
- `/models` - Listar modelos de IA

## ⚙️ Variáveis de Ambiente Necessárias

### Obrigatórias
- `DISCORD_TOKEN` - Token do bot Discord
- `CLIENT_ID` ou `DISCORD_CLIENT_ID` - ID do aplicativo Discord

### Opcionais
- `DISCORD_CLIENT_SECRET` - Para Linked Roles
- `SESSION_SECRET` - Segurança de sessão web
- `DATABASE_URL` - PostgreSQL (opcional, usa JSON se não configurado)
- `LOW_MEMORY=true` - Para ambientes com pouca RAM
- `NODE_ENV=production` - Para modo produção

## 🚀 Como Executar

### Desenvolvimento (Replit)
```bash
# O workflow já está configurado para rodar automaticamente
# Ou execute manualmente:
npm run dev
```

### Registrar Comandos no Discord
```bash
npm run deploy
```

### Produção
```bash
npm run build
npm start
```

## 🛠️ Como Modificar Comandos

### 1. Localizar o Comando
Encontre o arquivo em `src/commands/<categoria>/<nome>.ts`

### 2. Estrutura Básica
```typescript
import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '@/types';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('nome-comando')
    .setDescription('Descrição'),
  
  async execute(interaction) {
    // Lógica do comando
  }
};

export default command;
```

### 3. Modificações Comuns

**Alterar valores de recompensas:**
```typescript
const reward = 100; // Altere o valor aqui
```

**Adicionar nova opção:**
```typescript
.addStringOption(option =>
  option
    .setName('opcao')
    .setDescription('Descrição')
    .setRequired(true)
)
```

**Modificar cooldown:**
```typescript
cooldownManager.setCooldown(userId, 'comando', 3600000); // 1 hora
```

## 📦 Arquivos Importantes

### Gerenciadores (`src/utils/`)
- `database.ts` - Banco de dados
- `cooldownManager.ts` - Cooldowns
- `embedBuilders.ts` - Embeds padronizadas
- `inventoryManager.ts` - Inventário
- `customEmojis.ts` - Emojis personalizados
- `xpManager.ts` - Sistema de XP/Níveis
- `warehouseManager.ts` - Gerenciamento de armazém
- `territoryManager.ts` - Sistema de territórios

### Dados (`src/data/`)
Arquivos JSON com dados persistentes:
- `economy.json` - Dados de economia
- `profiles.json` - Perfis de usuários
- `inventory.json` - Inventários
- `bounties.json` - Recompensas ativas
- `guilds.json` - Dados de guildas

## 🔄 Comandos NPM

```bash
npm run dev          # Desenvolvimento com hot-reload
npm run build        # Compilar TypeScript
npm start            # Produção (requer build)
npm run deploy       # Registrar comandos no Discord
npm run lint         # Verificar erros
npm run format       # Formatar código
```

## 📚 Documentação Adicional

- `GUIA_COMANDOS.md` - Guia detalhado de todos os comandos
- `GUIA_COMANDO_GUILDA.md` - Sistema de guildas
- `README.md` - Informações gerais do projeto
- `LINKED_ROLES_SETUP.md` - Configurar Linked Roles

## 🌐 Hospedagem

### Replit (Atual)
- Desenvolvimento rápido
- Hot-reload automático
- Ambiente configurado

### ShardCloud.app
- Hospedagem gratuita/premium
- Autodetecção de comandos npm
- SSL e domínio inclusos
- Suporte multi-bot

## 🔒 Segurança

- Nunca exponha tokens ou secrets
- Use variáveis de ambiente para credenciais
- Sistema de validação de ambiente (`src/utils/security.ts`)
- Proteção contra spam com cooldowns

## 📊 Performance

- Sistema de cache otimizado
- Modo low-memory para ambientes limitados
- Sweepers automáticos para memória
- Monitoramento de performance integrado

## 🎯 Próximos Passos

Para começar a modificar comandos:
1. Configure as variáveis de ambiente (DISCORD_TOKEN, CLIENT_ID)
2. O bot iniciará automaticamente
3. Escolha um comando para modificar
4. Edite o arquivo correspondente
5. Teste as mudanças (hot-reload automático em dev)

## 📞 Suporte

- GitHub: https://github.com/gomezfy/Sheriffbot-
- Documentação completa neste arquivo
- Guias específicos nos arquivos .md do projeto
