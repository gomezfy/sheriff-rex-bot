import { LocalizationMap } from "discord.js";

export interface CommandLocalization {
  name: LocalizationMap;
  description: LocalizationMap;
}

export const commandLocalizations: Record<string, CommandLocalization> = {
  // Utility Commands
  ping: {
    name: {
      "pt-BR": "ping",
      "en-US": "ping",
    },
    description: {
      "pt-BR": "Ver latência do bot",
      "en-US": "Check bot latency",
    },
  },

  help: {
    name: {
      "pt-BR": "ajuda",
      "en-US": "help",
    },
    description: {
      "pt-BR": "Ver todos os comandos",
      "en-US": "View all commands",
    },
  },

  poll: {
    name: {
      "pt-BR": "votacao",
      "en-US": "poll",
    },
    description: {
      "pt-BR": "Criar votação",
      "en-US": "Create a poll",
    },
  },

  // Economy Commands
  daily: {
    name: {
      "pt-BR": "diaria",
      "en-US": "daily",
    },
    description: {
      "pt-BR": "Recompensa diária",
      "en-US": "Daily reward",
    },
  },

  give: {
    name: {
      "pt-BR": "dar",
      "en-US": "give",
    },
    description: {
      "pt-BR": "Transferir itens ou moedas",
      "en-US": "Transfer items or coins",
    },
  },

  leaderboard: {
    name: {
      "pt-BR": "classificacao",
      "en-US": "leaderboard",
    },
    description: {
      "pt-BR": "Ver os mais ricos",
      "en-US": "View richest players",
    },
  },

  middleman: {
    name: {
      "pt-BR": "intermediario",
      "en-US": "middleman",
    },
    description: {
      "pt-BR": "Trocar tokens/ouro por prata",
      "en-US": "Exchange tokens/gold for silver",
    },
  },

  redeem: {
    name: {
      "pt-BR": "resgatar",
      "en-US": "redeem",
    },
    description: {
      "pt-BR": "Resgatar código de compra",
      "en-US": "Redeem purchase code",
    },
  },

  territories: {
    name: {
      "pt-BR": "territorios",
      "en-US": "territories",
    },
    description: {
      "pt-BR": "Comprar territórios",
      "en-US": "Purchase territories",
    },
  },

  armazem: {
    name: {
      "pt-BR": "armazem",
      "en-US": "warehouse",
    },
    description: {
      "pt-BR": "Comprar/vender recursos",
      "en-US": "Buy/sell resources",
    },
  },

  expedition: {
    name: {
      "pt-BR": "expedicao",
      "en-US": "expedition",
    },
    description: {
      "pt-BR": "Expedição no deserto",
      "en-US": "Desert expedition",
    },
  },

  setuptoken: {
    name: {
      "pt-BR": "configurartoken",
      "en-US": "setuptoken",
    },
    description: {
      "pt-BR": "Configurar sistema de tokens",
      "en-US": "Setup token system",
    },
  },

  addbackpack: {
    name: {
      "pt-BR": "adicionarmochila",
      "en-US": "addbackpack",
    },
    description: {
      "pt-BR": "Adicionar capacidade de mochila",
      "en-US": "Add backpack capacity",
    },
  },

  addsilver: {
    name: {
      "pt-BR": "adicionarprata",
      "en-US": "addsilver",
    },
    description: {
      "pt-BR": "Adicionar moedas de prata",
      "en-US": "Add silver coins",
    },
  },

  addtokens: {
    name: {
      "pt-BR": "adicionartokens",
      "en-US": "addtokens",
    },
    description: {
      "pt-BR": "Adicionar tokens saloon",
      "en-US": "Add saloon tokens",
    },
  },

  addseal: {
    name: {
      "pt-BR": "adicionarselo",
      "en-US": "addseal",
    },
    description: {
      "pt-BR": "Adicionar selos",
      "en-US": "Add seals",
    },
  },

  addgold: {
    name: {
      "pt-BR": "adicionarouro",
      "en-US": "addgold",
    },
    description: {
      "pt-BR": "Adicionar barras de ouro [Owner]",
      "en-US": "Add gold bars [Owner]",
    },
  },

  removegold: {
    name: {
      "pt-BR": "removerouro",
      "en-US": "removegold",
    },
    description: {
      "pt-BR": "Remover barras de ouro [Owner]",
      "en-US": "Remove gold bars [Owner]",
    },
  },

  // Profile Commands
  profile: {
    name: {
      "pt-BR": "perfil",
      "en-US": "profile",
    },
    description: {
      "pt-BR": "Ver perfil do usuário",
      "en-US": "View user profile",
    },
  },

  inventory: {
    name: {
      "pt-BR": "inventario",
      "en-US": "inventory",
    },
    description: {
      "pt-BR": "Ver seu inventário",
      "en-US": "View your inventory",
    },
  },

  // Mining Commands
  mine: {
    name: {
      "pt-BR": "minerar",
      "en-US": "mine",
    },
    description: {
      "pt-BR": "Minerar ouro",
      "en-US": "Mine gold",
    },
  },

  // Gambling Commands
  bankrob: {
    name: {
      "pt-BR": "assaltar",
      "en-US": "bankrob",
    },
    description: {
      "pt-BR": "Assaltar banco",
      "en-US": "Rob the bank",
    },
  },

  dice: {
    name: {
      "pt-BR": "dado",
      "en-US": "dice",
    },
    description: {
      "pt-BR": "Jogar dados",
      "en-US": "Roll dice",
    },
  },

  duel: {
    name: {
      "pt-BR": "duelo",
      "en-US": "duel",
    },
    description: {
      "pt-BR": "Duelar com alguém",
      "en-US": "Duel someone",
    },
  },

  roubo: {
    name: {
      "pt-BR": "roubo",
      "en-US": "theft",
    },
    description: {
      "pt-BR": "Roubar alguém",
      "en-US": "Steal from someone",
    },
  },

  roulette: {
    name: {
      "pt-BR": "roleta",
      "en-US": "roulette",
    },
    description: {
      "pt-BR": "Girar roleta",
      "en-US": "Spin roulette",
    },
  },

  // Bounty Commands
  wanted: {
    name: {
      "pt-BR": "procurado",
      "en-US": "wanted",
    },
    description: {
      "pt-BR": "Colocar recompensa",
      "en-US": "Place bounty",
    },
  },

  bounties: {
    name: {
      "pt-BR": "recompensas",
      "en-US": "bounties",
    },
    description: {
      "pt-BR": "Ver recompensas ativas",
      "en-US": "View active bounties",
    },
  },

  capture: {
    name: {
      "pt-BR": "capturar",
      "en-US": "capture",
    },
    description: {
      "pt-BR": "Capturar procurado",
      "en-US": "Capture wanted",
    },
  },

  clearbounty: {
    name: {
      "pt-BR": "limparrecompensa",
      "en-US": "clearbounty",
    },
    description: {
      "pt-BR": "Remover recompensa [Admin]",
      "en-US": "Remove bounty [Admin]",
    },
  },

  // Guild Commands
  guilda: {
    name: {
      "pt-BR": "guilda",
      "en-US": "guild",
    },
    description: {
      "pt-BR": "Sistema de guildas",
      "en-US": "Guild system",
    },
  },

  // AI Commands
  ai: {
    name: {
      "pt-BR": "ia",
      "en-US": "ai",
    },
    description: {
      "pt-BR": "Falar com IA",
      "en-US": "Chat with AI",
    },
  },

  models: {
    name: {
      "pt-BR": "modelos",
      "en-US": "models",
    },
    description: {
      "pt-BR": "Ver modelos de IA",
      "en-US": "View AI models",
    },
  },

  // Admin Commands
  admin: {
    name: {
      "pt-BR": "admin",
      "en-US": "admin",
    },
    description: {
      "pt-BR": "Painel administrativo",
      "en-US": "Admin panel",
    },
  },

  addreward: {
    name: {
      "pt-BR": "adicionarrecompensa",
      "en-US": "addreward",
    },
    description: {
      "pt-BR": "Adicionar recompensa [Admin]",
      "en-US": "Add reward [Admin]",
    },
  },

  clear: {
    name: {
      "pt-BR": "limpar",
      "en-US": "clear",
    },
    description: {
      "pt-BR": "Limpar mensagens [Admin]",
      "en-US": "Clear messages [Admin]",
    },
  },

  clearwarns: {
    name: {
      "pt-BR": "limparavisos",
      "en-US": "clearwarns",
    },
    description: {
      "pt-BR": "Limpar avisos [Admin]",
      "en-US": "Clear warnings [Admin]",
    },
  },

  criaservidor: {
    name: {
      "pt-BR": "criarservidor",
      "en-US": "createserver",
    },
    description: {
      "pt-BR": "Criar servidor automaticamente [Admin]",
      "en-US": "Auto-create server [Admin]",
    },
  },

  embedbuilder: {
    name: {
      "pt-BR": "crioembed",
      "en-US": "embedbuilder",
    },
    description: {
      "pt-BR": "Criar embed personalizado [Admin]",
      "en-US": "Create custom embed [Admin]",
    },
  },

  mute: {
    name: {
      "pt-BR": "mutar",
      "en-US": "mute",
    },
    description: {
      "pt-BR": "Silenciar usuário [Admin]",
      "en-US": "Mute user [Admin]",
    },
  },

  unmute: {
    name: {
      "pt-BR": "desmutar",
      "en-US": "unmute",
    },
    description: {
      "pt-BR": "Remover silêncio [Admin]",
      "en-US": "Unmute user [Admin]",
    },
  },

  warn: {
    name: {
      "pt-BR": "avisar",
      "en-US": "warn",
    },
    description: {
      "pt-BR": "Avisar usuário [Admin]",
      "en-US": "Warn user [Admin]",
    },
  },

  warnings: {
    name: {
      "pt-BR": "avisos",
      "en-US": "warnings",
    },
    description: {
      "pt-BR": "Ver avisos [Admin]",
      "en-US": "View warnings [Admin]",
    },
  },

  setlogs: {
    name: {
      "pt-BR": "configurarlogs",
      "en-US": "setlogs",
    },
    description: {
      "pt-BR": "Configurar logs [Admin]",
      "en-US": "Configure logs [Admin]",
    },
  },

  welcome: {
    name: {
      "pt-BR": "boasvindas",
      "en-US": "welcome",
    },
    description: {
      "pt-BR": "Configurar boas-vindas [Admin]",
      "en-US": "Setup welcome [Admin]",
    },
  },
};

export function applyLocalizations(builder: any, commandName: string): any {
  const localization = commandLocalizations[commandName];

  if (!localization) {
    console.warn(`⚠️ No localizations found for command: ${commandName}`);
    return builder;
  }

  return builder
    .setNameLocalizations(localization.name)
    .setDescriptionLocalizations(localization.description);
}
