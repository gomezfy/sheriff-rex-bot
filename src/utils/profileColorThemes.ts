export interface ColorTheme {
  id: string;
  name: string;
  nameLocalized: {
    "pt-BR": string;
    "en-US": string;
    "es-ES": string;
  };
  emoji: string;
  colors: {
    overlay: string;
    rexSignature: string;
    username: string;
    usernameSecondary: string;
    statsText: string;
    xpText: string;
    bioBoxBackground: string;
    bioBoxBorder: string;
    bioTitle: string;
    bioText: string;
    phraseBoxBackground: string;
    phraseBoxBorder: string;
    phraseQuotes: string;
    phraseText: string;
  };
}

export const COLOR_THEMES: ColorTheme[] = [
  {
    id: "default",
    name: "Western Classic",
    nameLocalized: {
      "pt-BR": "Western Clássico",
      "en-US": "Western Classic",
      "es-ES": "Western Clásico",
    },
    emoji: "🤠",
    colors: {
      overlay: "rgba(0, 0, 0, 0.45)",
      rexSignature: "rgba(255, 255, 255, 0.5)",
      username: "#FFFFFF",
      usernameSecondary: "rgba(255, 255, 255, 0.8)",
      statsText: "#FFFFFF",
      xpText: "#CCCCCC",
      bioBoxBackground: "rgba(0, 30, 60, 0.75)",
      bioBoxBorder: "rgba(255, 255, 255, 0.3)",
      bioTitle: "#FFFFFF",
      bioText: "#E5E5E5",
      phraseBoxBackground: "rgba(212, 175, 55, 0.15)",
      phraseBoxBorder: "rgba(212, 175, 55, 0.6)",
      phraseQuotes: "rgba(212, 175, 55, 0.4)",
      phraseText: "#FFFFFF",
    },
  },
  {
    id: "sunset",
    name: "Desert Sunset",
    nameLocalized: {
      "pt-BR": "Pôr do Sol no Deserto",
      "en-US": "Desert Sunset",
      "es-ES": "Atardecer del Desierto",
    },
    emoji: "🌅",
    colors: {
      overlay: "rgba(40, 20, 0, 0.5)",
      rexSignature: "rgba(255, 160, 80, 0.6)",
      username: "#FFE5CC",
      usernameSecondary: "rgba(255, 200, 150, 0.9)",
      statsText: "#FFDDBB",
      xpText: "#FFB380",
      bioBoxBackground: "rgba(60, 20, 0, 0.8)",
      bioBoxBorder: "rgba(255, 140, 60, 0.5)",
      bioTitle: "#FFD4A3",
      bioText: "#FFCCAA",
      phraseBoxBackground: "rgba(255, 100, 50, 0.2)",
      phraseBoxBorder: "rgba(255, 120, 60, 0.7)",
      phraseQuotes: "rgba(255, 140, 80, 0.5)",
      phraseText: "#FFDDCC",
    },
  },
  {
    id: "forest",
    name: "Forest Trail",
    nameLocalized: {
      "pt-BR": "Trilha da Floresta",
      "en-US": "Forest Trail",
      "es-ES": "Sendero del Bosque",
    },
    emoji: "🌲",
    colors: {
      overlay: "rgba(10, 30, 20, 0.5)",
      rexSignature: "rgba(150, 255, 180, 0.5)",
      username: "#E0FFE5",
      usernameSecondary: "rgba(180, 255, 200, 0.9)",
      statsText: "#D5FFE0",
      xpText: "#A0D5B0",
      bioBoxBackground: "rgba(20, 50, 30, 0.8)",
      bioBoxBorder: "rgba(100, 200, 120, 0.5)",
      bioTitle: "#C5FFD5",
      bioText: "#D0FFE0",
      phraseBoxBackground: "rgba(60, 140, 80, 0.2)",
      phraseBoxBorder: "rgba(80, 180, 100, 0.7)",
      phraseQuotes: "rgba(100, 200, 120, 0.5)",
      phraseText: "#E0FFE8",
    },
  },
  {
    id: "ocean",
    name: "Ocean Depths",
    nameLocalized: {
      "pt-BR": "Profundezas do Oceano",
      "en-US": "Ocean Depths",
      "es-ES": "Profundidades del Océano",
    },
    emoji: "🌊",
    colors: {
      overlay: "rgba(0, 20, 40, 0.55)",
      rexSignature: "rgba(100, 200, 255, 0.6)",
      username: "#CCECFF",
      usernameSecondary: "rgba(150, 220, 255, 0.9)",
      statsText: "#D5F0FF",
      xpText: "#80C5E0",
      bioBoxBackground: "rgba(0, 40, 80, 0.85)",
      bioBoxBorder: "rgba(80, 160, 220, 0.5)",
      bioTitle: "#C0E8FF",
      bioText: "#D5EEFF",
      phraseBoxBackground: "rgba(40, 120, 180, 0.25)",
      phraseBoxBorder: "rgba(60, 150, 220, 0.75)",
      phraseQuotes: "rgba(80, 170, 240, 0.5)",
      phraseText: "#E0F4FF",
    },
  },
  {
    id: "purple",
    name: "Purple Dream",
    nameLocalized: {
      "pt-BR": "Sonho Roxo",
      "en-US": "Purple Dream",
      "es-ES": "Sueño Púrpura",
    },
    emoji: "💜",
    colors: {
      overlay: "rgba(30, 0, 40, 0.5)",
      rexSignature: "rgba(220, 150, 255, 0.6)",
      username: "#F0D5FF",
      usernameSecondary: "rgba(230, 180, 255, 0.9)",
      statsText: "#EDD5FF",
      xpText: "#C5A0E0",
      bioBoxBackground: "rgba(40, 10, 60, 0.8)",
      bioBoxBorder: "rgba(180, 120, 220, 0.5)",
      bioTitle: "#E5CCFF",
      bioText: "#EDD5FF",
      phraseBoxBackground: "rgba(140, 80, 200, 0.2)",
      phraseBoxBorder: "rgba(160, 100, 220, 0.7)",
      phraseQuotes: "rgba(180, 120, 240, 0.5)",
      phraseText: "#F0E0FF",
    },
  },
  {
    id: "golden",
    name: "Golden Hour",
    nameLocalized: {
      "pt-BR": "Hora Dourada",
      "en-US": "Golden Hour",
      "es-ES": "Hora Dorada",
    },
    emoji: "✨",
    colors: {
      overlay: "rgba(30, 25, 0, 0.5)",
      rexSignature: "rgba(255, 215, 120, 0.7)",
      username: "#FFF8E0",
      usernameSecondary: "rgba(255, 235, 180, 0.95)",
      statsText: "#FFEECC",
      xpText: "#E0C090",
      bioBoxBackground: "rgba(50, 40, 0, 0.85)",
      bioBoxBorder: "rgba(220, 180, 80, 0.6)",
      bioTitle: "#FFEAAA",
      bioText: "#FFF0CC",
      phraseBoxBackground: "rgba(212, 175, 55, 0.25)",
      phraseBoxBorder: "rgba(230, 190, 70, 0.8)",
      phraseQuotes: "rgba(240, 200, 90, 0.6)",
      phraseText: "#FFF5DD",
    },
  },
  {
    id: "crimson",
    name: "Crimson Night",
    nameLocalized: {
      "pt-BR": "Noite Carmesim",
      "en-US": "Crimson Night",
      "es-ES": "Noche Carmesí",
    },
    emoji: "🔴",
    colors: {
      overlay: "rgba(30, 0, 0, 0.55)",
      rexSignature: "rgba(255, 100, 120, 0.6)",
      username: "#FFCCDD",
      usernameSecondary: "rgba(255, 160, 180, 0.9)",
      statsText: "#FFD5E0",
      xpText: "#FF9AAA",
      bioBoxBackground: "rgba(60, 10, 20, 0.85)",
      bioBoxBorder: "rgba(220, 80, 100, 0.5)",
      bioTitle: "#FFCCDD",
      bioText: "#FFD5E0",
      phraseBoxBackground: "rgba(180, 40, 60, 0.25)",
      phraseBoxBorder: "rgba(220, 60, 80, 0.75)",
      phraseQuotes: "rgba(240, 80, 100, 0.5)",
      phraseText: "#FFE0E8",
    },
  },
  {
    id: "midnight",
    name: "Midnight Sky",
    nameLocalized: {
      "pt-BR": "Céu da Meia-Noite",
      "en-US": "Midnight Sky",
      "es-ES": "Cielo de Medianoche",
    },
    emoji: "🌙",
    colors: {
      overlay: "rgba(5, 10, 30, 0.6)",
      rexSignature: "rgba(180, 200, 255, 0.5)",
      username: "#E0E8FF",
      usernameSecondary: "rgba(200, 210, 255, 0.9)",
      statsText: "#D8E5FF",
      xpText: "#A8B8D0",
      bioBoxBackground: "rgba(10, 15, 45, 0.9)",
      bioBoxBorder: "rgba(120, 140, 200, 0.4)",
      bioTitle: "#D0DDFF",
      bioText: "#D8E5FF",
      phraseBoxBackground: "rgba(60, 80, 140, 0.2)",
      phraseBoxBorder: "rgba(100, 120, 180, 0.6)",
      phraseQuotes: "rgba(130, 150, 200, 0.4)",
      phraseText: "#E5EEFF",
    },
  },
];

const DEFAULT_THEME = COLOR_THEMES[0];

export function getThemeById(themeId: string): ColorTheme {
  const theme = COLOR_THEMES.find((t) => t.id === themeId);
  if (!theme) {
    console.warn(`⚠️ Theme '${themeId}' not found, falling back to default theme`);
    return DEFAULT_THEME;
  }
  
  const missingFields: string[] = [];
  const requiredColorFields = Object.keys(DEFAULT_THEME.colors);
  requiredColorFields.forEach((field) => {
    if (!(field in theme.colors)) {
      missingFields.push(field);
    }
  });
  
  if (missingFields.length > 0) {
    console.warn(`⚠️ Theme '${themeId}' is missing color fields: ${missingFields.join(', ')}, using defaults`);
    return {
      ...theme,
      colors: {
        ...DEFAULT_THEME.colors,
        ...theme.colors,
      },
    };
  }
  
  return theme;
}

export function getThemeNameLocalized(
  themeId: string,
  locale: string,
): string {
  const theme = getThemeById(themeId);
  const localeKey = locale as keyof typeof theme.nameLocalized;
  return theme.nameLocalized[localeKey] || theme.nameLocalized["en-US"];
}
