import { EmbedBuilder, ColorResolvable, Guild } from "discord.js";
import {
  getCowboyEmoji,
  getDartEmoji,
  getPickaxeEmoji,
  getTrophyEmoji,
} from "../../customEmojis";

export class ThemeEmbedTemplates {
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
}
