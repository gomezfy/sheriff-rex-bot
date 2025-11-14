import { EmbedBuilder } from "discord.js";
import {
  getCheckEmoji,
  getCancelEmoji,
  getWarningEmoji,
  getInfoEmoji,
} from "../../customEmojis";

export class BasicEmbedTemplates {
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
}
