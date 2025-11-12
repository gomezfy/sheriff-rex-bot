import { EmbedBuilder } from "discord.js";
import {
  getSilverCoinEmoji,
  getGoldBarEmoji,
  getSaloonTokenEmoji,
  getCheckEmoji,
  getCancelEmoji,
  getWarningEmoji,
  getInfoEmoji,
  getMoneybagEmoji,
} from "./customEmojis";

/**
 * Minimalist Embed System
 *
 * Neutral color palette for clean, modern Discord embeds
 */

export const Colors = {
  SUCCESS: 0x10b981, // Green
  ERROR: 0xef4444, // Red
  WARNING: 0xf59e0b, // Amber
  INFO: 0x3b82f6, // Blue
  NEUTRAL: 0x6b7280, // Gray
  GOLD: 0xfbbf24, // Gold (for economy/rewards)
  PURPLE: 0xa855f7, // Purple (for special events)
} as const;

export interface MinimalEmbedOptions {
  title?: string;
  description?: string;
  fields?: Array<{ name: string; value: string; inline?: boolean }>;
  footer?: string;
  timestamp?: boolean;
  color?: number;
}

/**
 * Create a minimal embed with consistent styling
 * @param options
 */
export function createMinimalEmbed(options: MinimalEmbedOptions): EmbedBuilder {
  const embed = new EmbedBuilder().setColor(options.color || Colors.NEUTRAL);

  if (options.title) {
    embed.setTitle(options.title);
  }

  if (options.description) {
    embed.setDescription(options.description);
  }

  if (options.fields && options.fields.length > 0) {
    embed.addFields(options.fields);
  }

  if (options.footer) {
    embed.setFooter({ text: options.footer });
  }

  if (options.timestamp) {
    embed.setTimestamp();
  }

  return embed;
}

/**
 * Success embed (green) - for successful operations
 * @param title
 * @param description
 * @param footer
 */
export function successEmbed(
  title: string,
  description?: string,
  footer?: string,
): EmbedBuilder {
  return createMinimalEmbed({
    title: `${getCheckEmoji()} ${title}`,
    description,
    footer,
    color: Colors.SUCCESS,
  });
}

/**
 * Error embed (red) - for errors and failures
 * @param title
 * @param description
 * @param footer
 */
export function errorEmbed(
  title: string,
  description?: string,
  footer?: string,
): EmbedBuilder {
  return createMinimalEmbed({
    title: `${getCancelEmoji()} ${title}`,
    description,
    footer,
    color: Colors.ERROR,
  });
}

/**
 * Warning embed (amber) - for warnings and alerts
 * @param title
 * @param description
 * @param footer
 */
export function warningEmbed(
  title: string,
  description?: string,
  footer?: string,
): EmbedBuilder {
  return createMinimalEmbed({
    title: `${getWarningEmoji()} ${title}`,
    description,
    footer,
    color: Colors.WARNING,
  });
}

/**
 * Info embed (blue) - for information and help
 * @param title
 * @param description
 * @param footer
 */
export function infoEmbed(
  title: string,
  description?: string,
  footer?: string,
): EmbedBuilder {
  return createMinimalEmbed({
    title: `${getInfoEmoji()} ${title}`,
    description,
    footer,
    color: Colors.INFO,
  });
}

/**
 * Neutral embed (gray) - for generic content
 * @param title
 * @param description
 * @param footer
 */
export function neutralEmbed(
  title: string,
  description?: string,
  footer?: string,
): EmbedBuilder {
  return createMinimalEmbed({
    title,
    description,
    footer,
    color: Colors.NEUTRAL,
  });
}

/**
 * Economy embed - for economy-related operations (gold color)
 * @param title
 * @param description
 * @param footer
 */
export function economyEmbed(
  title: string,
  description?: string,
  footer?: string,
): EmbedBuilder {
  return createMinimalEmbed({
    title: `${getMoneybagEmoji()} ${title}`,
    description,
    footer,
    color: Colors.GOLD,
    timestamp: true,
  });
}

/**
 * Reward embed - for rewards and bonuses (purple)
 * @param title
 * @param description
 * @param footer
 */
export function rewardEmbed(
  title: string,
  description?: string,
  footer?: string,
): EmbedBuilder {
  return createMinimalEmbed({
    title: `🎁 ${title}`,
    description,
    footer,
    color: Colors.PURPLE,
    timestamp: true,
  });
}

/**
 * Progress embed - for showing progress and stats
 * @param title
 * @param fields
 * @param footer
 */
export function progressEmbed(
  title: string,
  fields: Array<{ name: string; value: string; inline?: boolean }>,
  footer?: string,
): EmbedBuilder {
  return createMinimalEmbed({
    title,
    fields,
    footer,
    color: Colors.INFO,
    timestamp: true,
  });
}

/**
 * Create a simple field for embeds
 * @param name
 * @param value
 * @param inline
 */
export function field(name: string, value: string, inline: boolean = false) {
  return { name, value, inline };
}

/**
 * Format currency value for display
 * @param amount
 * @param currency
 */
export function formatCurrency(
  amount: number,
  currency: "tokens" | "silver" | "gold",
): string {
  const emoji = {
    tokens: getSaloonTokenEmoji(),
    silver: getSilverCoinEmoji(),
    gold: getGoldBarEmoji(),
  };

  return `${amount.toLocaleString()} ${emoji[currency]}`;
}

/**
 * Format time duration (e.g., "2h 30m")
 * @param milliseconds
 */
export function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

/**
 * Create a progress bar visualization
 * @param current
 * @param max
 * @param length
 */
export function progressBar(
  current: number,
  max: number,
  length: number = 10,
): string {
  const percentage = Math.min(Math.max(current / max, 0), 1);
  const filled = Math.floor(percentage * length);
  const empty = length - filled;

  return "█".repeat(filled) + "░".repeat(empty);
}
