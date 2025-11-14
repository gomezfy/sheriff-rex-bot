import { EmbedBuilder, User } from "discord.js";
import { getClockEmoji } from "../../customEmojis";

export class SpecialEmbedTemplates {
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
