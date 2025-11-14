export interface AnnouncementData {
  templates: Record<string, Template>;
  history: HistoryEntry[];
}

export interface Template {
  name: string;
  title: string;
  message: string;
  color: string;
  thumbnail?: string;
  image?: string;
  footer?: string;
}

export interface HistoryEntry {
  id: string;
  guildId: string;
  channelId: string;
  authorId: string;
  authorTag: string;
  title: string;
  timestamp: number;
}

export const COLOR_PRESETS: Record<string, { name: string; hex: string }> = {
  gold: { name: "🟡 Gold Rush", hex: "#FFD700" },
  red: { name: "🔴 Wanted Poster", hex: "#DC143C" },
  green: { name: "🟢 Sheriff Badge", hex: "#2ECC71" },
  blue: { name: "🔵 Night Sky", hex: "#3498DB" },
  purple: { name: "🟣 Saloon Velvet", hex: "#9B59B6" },
  orange: { name: "🟠 Sunset", hex: "#E67E22" },
  brown: { name: "🟤 Leather", hex: "#8B4513" },
  dark: { name: "⚫ Dark Night", hex: "#2C3E50" },
  white: { name: "⚪ Clean Slate", hex: "#ECF0F1" },
};
