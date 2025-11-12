import { Guild } from "discord.js";

export function getSaloonTokenEmoji(guild: Guild | null): string {
  if (!guild) {
    return "🪙";
  }

  const emoji = guild.emojis.cache.find((e) => e.name === "saloon_token");
  return emoji ? emoji.toString() : "🪙";
}
