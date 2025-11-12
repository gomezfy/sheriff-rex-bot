import { EmbedBuilder, ColorResolvable, User, Guild } from "discord.js";
import {
  getCheckEmoji,
  getCancelEmoji,
  getWarningEmoji,
  getInfoEmoji,
  getStarEmoji,
  getMoneybagEmoji,
  getLightningEmoji,
  getSparklesEmoji,
  getCowboyEmoji,
  getDartEmoji,
  getSlotMachineEmoji,
  getPickaxeEmoji,
  getTrophyEmoji,
  getClockEmoji,
} from "./customEmojis";

export class EmbedTemplates {
  static success(title: string, description?: string): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle(`${getCheckEmoji()} ${title}`)
      .setTimestamp();

    if (description) {
      embed.setDescription(description);
    }

    return embed;
  }

  static error(title: string, description?: string): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setColor(0xff0000)
      .setTitle(`${getCancelEmoji()} ${title}`)
      .setTimestamp();

    if (description) {
      embed.setDescription(description);
    }

    return embed;
  }

  static warning(title: string, description?: string): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setColor(0xffa500)
      .setTitle(`${getWarningEmoji()} ${title}`)
      .setTimestamp();

    if (description) {
      embed.setDescription(description);
    }

    return embed;
  }

  static info(title: string, description?: string): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(`${getInfoEmoji()} ${title}`)
      .setTimestamp();

    if (description) {
      embed.setDescription(description);
    }

    return embed;
  }

  static gold(title: string, description?: string): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setColor(0xffd700)
      .setTitle(title)
      .setTimestamp();

    if (description) {
      embed.setDescription(description);
    }

    return embed;
  }

  static western(
    title: string,
    description?: string,
    color: ColorResolvable = 0x8b4513,
  ): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle(`${getCowboyEmoji()} ${title}`)
      .setFooter({ text: "Sheriff Rex Bot - Western Discord Bot" })
      .setTimestamp();

    if (description) {
      embed.setDescription(description);
    }

    return embed;
  }

  static profile(user: User): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(0x5865f2)
      .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
      .setThumbnail(user.displayAvatarURL({ size: 256 }))
      .setTimestamp();
  }

  static economy(title: string, user: User): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(0xffd700)
      .setTitle(title)
      .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
      .setTimestamp();
  }

  static bounty(
    title: string,
    color: ColorResolvable = 0xff0000,
  ): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(color)
      .setTitle(`${getDartEmoji()} ${title}`)
      .setTimestamp();
  }

  static mining(title: string): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(0xffd700)
      .setTitle(`${getPickaxeEmoji()} ${title}`)
      .setTimestamp();
  }

  static leaderboard(title: string, guild?: Guild): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setColor(0xffd700)
      .setTitle(`${getTrophyEmoji()} ${title}`)
      .setTimestamp();

    if (guild) {
      embed.setFooter({
        text: guild.name,
        iconURL: guild.iconURL() || undefined,
      });
    }

    return embed;
  }

  static announcement(
    title: string,
    color: ColorResolvable = 0x5865f2,
  ): EmbedBuilder {
    return new EmbedBuilder().setColor(color).setTitle(title).setTimestamp();
  }

  static cooldown(command: string, timeLeft: number): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(0xffa500)
      .setTitle(`${getClockEmoji()} Cooldown Active`)
      .setDescription(
        `Please wait **${timeLeft.toFixed(1)}s** before using \`/${command}\` again.`,
      )
      .setTimestamp();
  }

  static pagination(
    title: string,
    page: number,
    totalPages: number,
  ): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(title)
      .setFooter({ text: `Page ${page}/${totalPages}` })
      .setTimestamp();
  }
}

export class EmbedFieldBuilder {
  private fields: Array<{ name: string; value: string; inline?: boolean }> = [];

  add(name: string, value: string, inline: boolean = false): this {
    this.fields.push({ name, value, inline });
    return this;
  }

  addSpacer(inline: boolean = false): this {
    this.fields.push({ name: "\u200b", value: "\u200b", inline });
    return this;
  }

  addMultiple(
    fields: Array<{ name: string; value: string; inline?: boolean }>,
  ): this {
    this.fields.push(...fields);
    return this;
  }

  build(): Array<{ name: string; value: string; inline?: boolean }> {
    return this.fields;
  }

  apply(embed: EmbedBuilder): EmbedBuilder {
    return embed.addFields(...this.fields);
  }
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(2)}B`;
  } else if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(2)}M`;
  } else if (num >= 1_000) {
    return `${(num / 1_000).toFixed(2)}K`;
  } else {
    return num.toLocaleString();
  }
}

export function formatTime(ms: number): string {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));

  const parts: string[] = [];
  if (days > 0) {
    parts.push(`${days}d`);
  }
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }
  if (seconds > 0) {
    parts.push(`${seconds}s`);
  }

  return parts.join(" ") || "0s";
}

export function createProgressBar(
  current: number,
  max: number,
  length: number = 10,
): string {
  const percentage = Math.min(Math.max(current / max, 0), 1);
  const filled = Math.round(percentage * length);
  const empty = length - filled;

  const filledBar = "█".repeat(filled);
  const emptyBar = "░".repeat(empty);

  return `${filledBar}${emptyBar} ${(percentage * 100).toFixed(0)}%`;
}

export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.substring(0, maxLength - 3)}...`;
}
