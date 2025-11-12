import { ChannelType, PermissionFlagsBits } from "discord.js";

export interface TemplateRole {
  name: string;
  color: number;
  permissions: bigint[];
  hoist: boolean;
}

export interface TemplateChannel {
  name: string;
  type: ChannelType;
  topic?: string;
}

export interface TemplateCategory {
  name: string;
  channels: TemplateChannel[];
}

export interface ServerTemplate {
  id: string;
  name: string;
  description: string;
  emoji: string;
  roles: TemplateRole[];
  categories: TemplateCategory[];
}

export const SERVER_TEMPLATES: ServerTemplate[] = [
  {
    id: "gaming",
    name: "Gaming Community",
    description:
      "Servidor completo para comunidade de jogos com canais de voz, texto e anúncios",
    emoji: "🎮",
    roles: [
      {
        name: "👑 Owner",
        color: 0xffd700,
        permissions: [PermissionFlagsBits.Administrator],
        hoist: true,
      },
      {
        name: "🛡️ Moderador",
        color: 0x00ff00,
        permissions: [
          PermissionFlagsBits.ManageMessages,
          PermissionFlagsBits.KickMembers,
          PermissionFlagsBits.BanMembers,
          PermissionFlagsBits.ModerateMembers,
        ],
        hoist: true,
      },
      {
        name: "⭐ VIP",
        color: 0xff00ff,
        permissions: [],
        hoist: true,
      },
      {
        name: "🎮 Gamer",
        color: 0x808080,
        permissions: [],
        hoist: false,
      },
    ],
    categories: [
      {
        name: "📋 INFORMAÇÕES",
        channels: [
          {
            name: "bem-vindo",
            type: ChannelType.GuildAnnouncement,
            topic: "👋 Bem-vindo ao servidor! Leia as regras e divirta-se!",
          },
          {
            name: "regras",
            type: ChannelType.GuildText,
            topic: "📜 Regras do servidor - Leia com atenção!",
          },
          {
            name: "anúncios",
            type: ChannelType.GuildAnnouncement,
            topic: "📢 Anúncios importantes do servidor",
          },
        ],
      },
      {
        name: "💬 GERAL",
        channels: [
          {
            name: "chat-geral",
            type: ChannelType.GuildText,
            topic: "💭 Converse sobre qualquer assunto",
          },
          {
            name: "bot-comandos",
            type: ChannelType.GuildText,
            topic: "🤖 Use comandos de bots aqui",
          },
          {
            name: "memes",
            type: ChannelType.GuildText,
            topic: "😂 Compartilhe memes e diversão",
          },
        ],
      },
      {
        name: "🎮 GAMING",
        channels: [
          {
            name: "chat-gaming",
            type: ChannelType.GuildText,
            topic: "🎮 Fale sobre jogos",
          },
          {
            name: "procurar-grupo",
            type: ChannelType.GuildText,
            topic: "🔍 Encontre pessoas para jogar",
          },
          {
            name: "clips-e-highlights",
            type: ChannelType.GuildText,
            topic: "🎬 Compartilhe suas melhores jogadas",
          },
        ],
      },
      {
        name: "🔊 CANAIS DE VOZ",
        channels: [
          {
            name: "🎧 Lobby",
            type: ChannelType.GuildVoice,
          },
          {
            name: "🎮 Gaming 1",
            type: ChannelType.GuildVoice,
          },
          {
            name: "🎮 Gaming 2",
            type: ChannelType.GuildVoice,
          },
          {
            name: "😴 AFK",
            type: ChannelType.GuildVoice,
          },
        ],
      },
    ],
  },
  {
    id: "community",
    name: "Comunidade Geral",
    description:
      "Servidor versátil para comunidades gerais com foco em socialização",
    emoji: "👥",
    roles: [
      {
        name: "👑 Administrador",
        color: 0xff0000,
        permissions: [PermissionFlagsBits.Administrator],
        hoist: true,
      },
      {
        name: "🛡️ Staff",
        color: 0x3498db,
        permissions: [
          PermissionFlagsBits.ManageMessages,
          PermissionFlagsBits.KickMembers,
        ],
        hoist: true,
      },
      {
        name: "💎 Apoiador",
        color: 0x9b59b6,
        permissions: [],
        hoist: true,
      },
      {
        name: "👤 Membro",
        color: 0x95a5a6,
        permissions: [],
        hoist: false,
      },
    ],
    categories: [
      {
        name: "📌 INÍCIO",
        channels: [
          {
            name: "apresente-se",
            type: ChannelType.GuildText,
            topic: "👋 Se apresente para a comunidade!",
          },
          {
            name: "regras",
            type: ChannelType.GuildText,
            topic: "📜 Regras da comunidade",
          },
          {
            name: "novidades",
            type: ChannelType.GuildAnnouncement,
            topic: "🎉 Novidades e atualizações",
          },
        ],
      },
      {
        name: "💬 CONVERSAS",
        channels: [
          {
            name: "bate-papo",
            type: ChannelType.GuildText,
            topic: "💭 Conversas gerais",
          },
          {
            name: "debates",
            type: ChannelType.GuildText,
            topic: "🗣️ Debates e discussões",
          },
          {
            name: "sugestões",
            type: ChannelType.GuildText,
            topic: "💡 Dê suas sugestões",
          },
        ],
      },
      {
        name: "🎨 CRIATIVIDADE",
        channels: [
          {
            name: "arte",
            type: ChannelType.GuildText,
            topic: "🎨 Compartilhe suas artes",
          },
          {
            name: "música",
            type: ChannelType.GuildText,
            topic: "🎵 Compartilhe músicas",
          },
          {
            name: "projetos",
            type: ChannelType.GuildText,
            topic: "💼 Mostre seus projetos",
          },
        ],
      },
      {
        name: "🔊 VOZ",
        channels: [
          {
            name: "🎤 Sala Principal",
            type: ChannelType.GuildVoice,
          },
          {
            name: "🎵 Música",
            type: ChannelType.GuildVoice,
          },
          {
            name: "🎮 Jogos",
            type: ChannelType.GuildVoice,
          },
        ],
      },
    ],
  },
  {
    id: "study",
    name: "Estudos & Educação",
    description:
      "Servidor focado em educação, estudos e compartilhamento de conhecimento",
    emoji: "📚",
    roles: [
      {
        name: "👨‍🏫 Professor",
        color: 0x2ecc71,
        permissions: [
          PermissionFlagsBits.ManageMessages,
          PermissionFlagsBits.ManageChannels,
        ],
        hoist: true,
      },
      {
        name: "🎓 Monitor",
        color: 0x3498db,
        permissions: [PermissionFlagsBits.ManageMessages],
        hoist: true,
      },
      {
        name: "📖 Estudante",
        color: 0x95a5a6,
        permissions: [],
        hoist: false,
      },
    ],
    categories: [
      {
        name: "📋 INFORMAÇÕES",
        channels: [
          {
            name: "bem-vindo",
            type: ChannelType.GuildAnnouncement,
            topic: "👋 Seja bem-vindo ao servidor de estudos!",
          },
          {
            name: "diretrizes",
            type: ChannelType.GuildText,
            topic: "📜 Diretrizes e regras de conduta",
          },
          {
            name: "avisos",
            type: ChannelType.GuildAnnouncement,
            topic: "📢 Avisos importantes",
          },
        ],
      },
      {
        name: "📚 ESTUDOS",
        channels: [
          {
            name: "matemática",
            type: ChannelType.GuildText,
            topic: "➗ Dúvidas e discussões de matemática",
          },
          {
            name: "programação",
            type: ChannelType.GuildText,
            topic: "💻 Programação e tecnologia",
          },
          {
            name: "idiomas",
            type: ChannelType.GuildText,
            topic: "🌍 Aprendizado de idiomas",
          },
          {
            name: "recursos",
            type: ChannelType.GuildText,
            topic: "📑 Compartilhe materiais de estudo",
          },
        ],
      },
      {
        name: "💡 AJUDA",
        channels: [
          {
            name: "dúvidas",
            type: ChannelType.GuildText,
            topic: "❓ Tire suas dúvidas",
          },
          {
            name: "projetos",
            type: ChannelType.GuildText,
            topic: "🚀 Compartilhe projetos e trabalhos",
          },
        ],
      },
      {
        name: "🔊 SALAS DE ESTUDO",
        channels: [
          {
            name: "📖 Sala Silenciosa",
            type: ChannelType.GuildVoice,
          },
          {
            name: "👥 Grupo de Estudos",
            type: ChannelType.GuildVoice,
          },
          {
            name: "🎤 Discussões",
            type: ChannelType.GuildVoice,
          },
        ],
      },
    ],
  },
  {
    id: "business",
    name: "Negócios & Profissional",
    description:
      "Servidor profissional para negócios, networking e produtividade",
    emoji: "💼",
    roles: [
      {
        name: "👔 CEO",
        color: 0x000000,
        permissions: [PermissionFlagsBits.Administrator],
        hoist: true,
      },
      {
        name: "💼 Gerente",
        color: 0x1f8b4c,
        permissions: [
          PermissionFlagsBits.ManageChannels,
          PermissionFlagsBits.ManageMessages,
        ],
        hoist: true,
      },
      {
        name: "👨‍💼 Profissional",
        color: 0x3498db,
        permissions: [],
        hoist: true,
      },
      {
        name: "🤝 Parceiro",
        color: 0x95a5a6,
        permissions: [],
        hoist: false,
      },
    ],
    categories: [
      {
        name: "📋 CORPORATIVO",
        channels: [
          {
            name: "anúncios",
            type: ChannelType.GuildAnnouncement,
            topic: "📢 Anúncios oficiais da empresa",
          },
          {
            name: "geral",
            type: ChannelType.GuildText,
            topic: "💬 Comunicação geral",
          },
          {
            name: "recursos-humanos",
            type: ChannelType.GuildText,
            topic: "👥 RH e gestão de pessoas",
          },
        ],
      },
      {
        name: "💡 PROJETOS",
        channels: [
          {
            name: "planejamento",
            type: ChannelType.GuildText,
            topic: "📊 Planejamento de projetos",
          },
          {
            name: "desenvolvimento",
            type: ChannelType.GuildText,
            topic: "⚙️ Desenvolvimento e execução",
          },
          {
            name: "relatórios",
            type: ChannelType.GuildText,
            topic: "📈 Relatórios e resultados",
          },
        ],
      },
      {
        name: "🤝 NETWORKING",
        channels: [
          {
            name: "apresentações",
            type: ChannelType.GuildText,
            topic: "👋 Apresente-se profissionalmente",
          },
          {
            name: "oportunidades",
            type: ChannelType.GuildText,
            topic: "💼 Oportunidades de negócios",
          },
        ],
      },
      {
        name: "🔊 REUNIÕES",
        channels: [
          {
            name: "📞 Sala de Reunião 1",
            type: ChannelType.GuildVoice,
          },
          {
            name: "📞 Sala de Reunião 2",
            type: ChannelType.GuildVoice,
          },
        ],
      },
    ],
  },
  {
    id: "minimal",
    name: "Minimalista",
    description: "Servidor simples e clean com o essencial para começar",
    emoji: "✨",
    roles: [
      {
        name: "👑 Admin",
        color: 0xe74c3c,
        permissions: [PermissionFlagsBits.Administrator],
        hoist: true,
      },
      {
        name: "👤 Membro",
        color: 0x95a5a6,
        permissions: [],
        hoist: false,
      },
    ],
    categories: [
      {
        name: "📌 PRINCIPAL",
        channels: [
          {
            name: "regras",
            type: ChannelType.GuildText,
            topic: "📜 Regras do servidor",
          },
          {
            name: "geral",
            type: ChannelType.GuildText,
            topic: "💬 Chat geral",
          },
          {
            name: "comandos",
            type: ChannelType.GuildText,
            topic: "🤖 Use bots aqui",
          },
        ],
      },
      {
        name: "🔊 VOZ",
        channels: [
          {
            name: "🎤 Voz Geral",
            type: ChannelType.GuildVoice,
          },
        ],
      },
    ],
  },
];

export function getTemplateById(id: string): ServerTemplate | undefined {
  return SERVER_TEMPLATES.find((t) => t.id === id);
}

export function getAllTemplates(): ServerTemplate[] {
  return SERVER_TEMPLATES;
}
