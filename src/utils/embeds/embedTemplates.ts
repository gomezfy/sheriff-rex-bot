interface EmbedTemplate {
  id: string;
  name: string;
  nameLocalized: { [key: string]: string };
  description: string;
  emoji: string;
  data: {
    title?: string;
    description?: string;
    color?: string;
    authorName?: string;
    authorIcon?: string;
    thumbnail?: string;
    image?: string;
    footerText?: string;
    footerIcon?: string;
    timestamp?: boolean;
    fields: Array<{ name: string; value: string; inline: boolean }>;
  };
}

export const EMBED_TEMPLATES: EmbedTemplate[] = [
  {
    id: "announcement",
    name: "📢 Announcement",
    nameLocalized: {
      "pt-BR": "📢 Anúncio",
    },
    description: "Professional announcement template",
    emoji: "📢",
    data: {
      title: "📢 Important Announcement",
      description:
        "Hello everyone! We have an important announcement to share with you all.\n\n**What's new:**\n• Feature 1\n• Feature 2\n• Feature 3\n\nThank you for your attention!",
      color: "#5865F2",
      footerText: "Sheriff Rex • Announcement",
      timestamp: true,
      fields: [],
    },
  },
  {
    id: "rules",
    name: "📜 Server Rules",
    nameLocalized: {
      "pt-BR": "📜 Regras do Servidor",
    },
    description: "Server rules template",
    emoji: "📜",
    data: {
      title: "📜 Server Rules",
      description:
        "Welcome to our community! Please follow these rules to ensure everyone has a great experience.",
      color: "#ED4245",
      fields: [
        {
          name: "1️⃣ Be Respectful",
          value: "Treat all members with respect and kindness.",
          inline: false,
        },
        {
          name: "2️⃣ No Spam",
          value: "Avoid excessive messages or advertising.",
          inline: false,
        },
        {
          name: "3️⃣ Follow Discord ToS",
          value: "All Discord Terms of Service apply here.",
          inline: false,
        },
      ],
      footerText: "Breaking rules may result in warnings or bans",
      timestamp: true,
    },
  },
  {
    id: "welcome",
    name: "👋 Welcome Message",
    nameLocalized: {
      "pt-BR": "👋 Mensagem de Boas-vindas",
    },
    description: "Welcome new members",
    emoji: "👋",
    data: {
      title: "👋 Welcome to the Server!",
      description:
        "Howdy, partner! Welcome to our Wild West community!\n\n**Get started:**\n• Read the rules in #rules\n• Introduce yourself in #introductions\n• Check out #information for server info\n\nEnjoy your stay! 🤠",
      color: "#57F287",
      thumbnail: "https://i.imgur.com/example-western-badge.png",
      footerText: "Sheriff Rex • Welcome",
      timestamp: true,
      fields: [],
    },
  },
  {
    id: "warning",
    name: "⚠️ Warning/Alert",
    nameLocalized: {
      "pt-BR": "⚠️ Aviso/Alerta",
    },
    description: "Important warning or alert",
    emoji: "⚠️",
    data: {
      title: "⚠️ Important Warning",
      description:
        "**Attention Required**\n\nThis is an important notice that requires your attention.\n\nPlease read carefully and take necessary action.",
      color: "#FEE75C",
      footerText: "Sheriff Rex • Warning",
      timestamp: true,
      fields: [],
    },
  },
  {
    id: "event",
    name: "🎉 Event Announcement",
    nameLocalized: {
      "pt-BR": "🎉 Anúncio de Evento",
    },
    description: "Announce server events",
    emoji: "🎉",
    data: {
      title: "🎉 Upcoming Event!",
      description:
        "Join us for an exciting community event!\n\n**Event Details:**\nYou're all invited to participate in our special event.",
      color: "#9B59B6",
      fields: [
        {
          name: "📅 Date & Time",
          value: "TBD - Check announcements",
          inline: true,
        },
        {
          name: "📍 Location",
          value: "Voice Channel / Game Server",
          inline: true,
        },
        {
          name: "🎁 Rewards",
          value: "Special prizes for participants!",
          inline: false,
        },
      ],
      footerText: "Sheriff Rex • Events",
      timestamp: true,
    },
  },
  {
    id: "info",
    name: "ℹ️ Information",
    nameLocalized: {
      "pt-BR": "ℹ️ Informação",
    },
    description: "General information embed",
    emoji: "ℹ️",
    data: {
      title: "ℹ️ Information",
      description:
        "Here's some useful information about our server and community.",
      color: "#5865F2",
      fields: [
        {
          name: "📊 Server Stats",
          value: "Active members, channels, and more",
          inline: true,
        },
        {
          name: "🔗 Useful Links",
          value: "Website, social media, etc.",
          inline: true,
        },
      ],
      footerText: "Sheriff Rex • Information",
      timestamp: true,
    },
  },
  {
    id: "western_wanted",
    name: "🤠 Western Wanted Poster",
    nameLocalized: {
      "pt-BR": "🤠 Cartaz de Procurado",
    },
    description: "Western-themed wanted poster",
    emoji: "🤠",
    data: {
      title: "🔫 WANTED 🔫",
      description:
        "**DEAD OR ALIVE**\n\n*Reward for capture or information leading to arrest*\n\nThis outlaw is wanted for crimes against the frontier!",
      color: "#8B4513",
      fields: [
        {
          name: "👤 Name",
          value: "The Outlaw",
          inline: true,
        },
        {
          name: "💰 Bounty",
          value: "$5,000 Gold",
          inline: true,
        },
        {
          name: "⚖️ Crimes",
          value: "Bank robbery, cattle rustling, disturbing the peace",
          inline: false,
        },
      ],
      footerText: "Sheriff Rex • Wanted List",
      timestamp: true,
    },
  },
  {
    id: "western_saloon",
    name: "🍺 Saloon Notice",
    nameLocalized: {
      "pt-BR": "🍺 Aviso do Saloon",
    },
    description: "Western saloon announcement",
    emoji: "🍺",
    data: {
      title: "🍺 THE RUSTY NAIL SALOON 🍺",
      description:
        "**Welcome to the Finest Saloon in the West!**\n\nBelly up to the bar, partner, and enjoy our hospitality!\n\n*Drinks on special every Saturday night!*",
      color: "#D4A017",
      fields: [
        {
          name: "🍻 Today's Special",
          value: "Whiskey - Half Price",
          inline: true,
        },
        {
          name: "🎰 Games Available",
          value: "Poker, Blackjack, Roulette",
          inline: true,
        },
      ],
      footerText: "The Rusty Nail Saloon • Est. 1875",
      timestamp: false,
    },
  },
];

export function getTemplateById(id: string): EmbedTemplate | undefined {
  return EMBED_TEMPLATES.find((t) => t.id === id);
}

export function getTemplateName(
  template: EmbedTemplate,
  locale?: string,
): string {
  if (locale && template.nameLocalized[locale]) {
    return template.nameLocalized[locale];
  }
  return template.name;
}
