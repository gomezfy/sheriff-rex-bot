import { EmbedBuilder, GuildMember } from "discord.js";

function replacePlaceholders(
  text: string | null | undefined,
  member: GuildMember,
): string {
  if (!text || typeof text !== "string") {
    return text || "";
  }

  return text
    .replace(/{@user}/g, member.user.toString())
    .replace(/{user}/g, member.user.toString())
    .replace(/{user\.name}/g, member.user.username)
    .replace(/{username}/g, member.user.username)
    .replace(/{user\.tag}/g, member.user.tag)
    .replace(/{user\.discriminator}/g, member.user.discriminator)
    .replace(/{user-discriminator}/g, member.user.discriminator)
    .replace(/{user\.id}/g, member.user.id)
    .replace(/{user-id}/g, member.user.id)
    .replace(/{user\.avatar}/g, member.user.displayAvatarURL({ size: 1024 }))
    .replace(/{user-avatar-url}/g, member.user.displayAvatarURL({ size: 1024 }))
    .replace(/{guild}/g, member.guild.name)
    .replace(/{guild\.name}/g, member.guild.name)
    .replace(/{server}/g, member.guild.name)
    .replace(/{guild\.size}/g, member.guild.memberCount.toString())
    .replace(/{guild-size}/g, member.guild.memberCount.toString())
    .replace(/{guildsize}/g, member.guild.memberCount.toString())
    .replace(/{guild\.icon}/g, member.guild.iconURL({ size: 1024 }) || "")
    .replace(/{guild-icon-url}/g, member.guild.iconURL({ size: 1024 }) || "");
}

function isValidJSON(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

function convertColor(color: any): any {
  if (typeof color === "number" && color < 0) {
    return (color >>> 0) & 0xffffff;
  }
  return color;
}

export function buildWelcomeEmbed(config: any, member: GuildMember): any {
  if (isValidJSON(config.message)) {
    const embedData = JSON.parse(config.message);

    const processedData = JSON.parse(
      replacePlaceholders(JSON.stringify(embedData), member),
    );

    if (processedData.content && processedData.embed) {
      const embed = new EmbedBuilder();
      const embedConfig = processedData.embed;

      if (embedConfig.title) {
        embed.setTitle(embedConfig.title);
      }
      if (embedConfig.description) {
        embed.setDescription(embedConfig.description);
      }
      if (embedConfig.color) {
        embed.setColor(convertColor(embedConfig.color));
      }
      if (embedConfig.url) {
        embed.setURL(embedConfig.url);
      }

      if (embedConfig.author) {
        embed.setAuthor({
          name: embedConfig.author.name || "",
          iconURL: embedConfig.author.icon_url || embedConfig.author.iconURL,
          url: embedConfig.author.url,
        });
      }

      if (embedConfig.thumbnail) {
        const thumbnailUrl =
          typeof embedConfig.thumbnail === "string"
            ? embedConfig.thumbnail
            : embedConfig.thumbnail.url || "";
        if (thumbnailUrl && typeof thumbnailUrl === "string") {
          embed.setThumbnail(thumbnailUrl);
        }
      }

      if (embedConfig.image) {
        const imageUrl =
          typeof embedConfig.image === "string"
            ? embedConfig.image
            : embedConfig.image.url || "";
        if (imageUrl && typeof imageUrl === "string") {
          embed.setImage(imageUrl);
        }
      }

      if (embedConfig.fields && Array.isArray(embedConfig.fields)) {
        embedConfig.fields.forEach((field: any) => {
          embed.addFields({
            name: field.name,
            value: field.value,
            inline: field.inline || false,
          });
        });
      }

      if (embedConfig.footer) {
        embed.setFooter({
          text: embedConfig.footer.text || embedConfig.footer,
          iconURL: embedConfig.footer.icon_url || embedConfig.footer.iconURL,
        });
      } else {
        embed.setFooter({ text: `Member #${member.guild.memberCount}` });
      }

      if (embedConfig.timestamp !== false) {
        embed.setTimestamp();
      }

      return {
        content: processedData.content,
        embeds: [embed],
      };
    }

    const embed = new EmbedBuilder();

    if (processedData.title) {
      embed.setTitle(processedData.title);
    }
    if (processedData.description) {
      embed.setDescription(processedData.description);
    }
    if (processedData.color) {
      embed.setColor(convertColor(processedData.color));
    }
    if (processedData.url) {
      embed.setURL(processedData.url);
    }

    if (processedData.author) {
      embed.setAuthor({
        name: processedData.author.name || "",
        iconURL: processedData.author.icon_url || processedData.author.iconURL,
        url: processedData.author.url,
      });
    }

    if (processedData.thumbnail) {
      const thumbnailUrl =
        typeof processedData.thumbnail === "string"
          ? processedData.thumbnail
          : processedData.thumbnail.url || "";
      if (thumbnailUrl && typeof thumbnailUrl === "string") {
        embed.setThumbnail(thumbnailUrl);
      }
    }

    if (processedData.image) {
      const imageUrl =
        typeof processedData.image === "string"
          ? processedData.image
          : processedData.image.url || "";
      if (imageUrl && typeof imageUrl === "string") {
        embed.setImage(imageUrl);
      }
    }

    if (processedData.fields && Array.isArray(processedData.fields)) {
      processedData.fields.forEach((field: any) => {
        embed.addFields({
          name: field.name,
          value: field.value,
          inline: field.inline || false,
        });
      });
    }

    if (processedData.footer) {
      embed.setFooter({
        text: processedData.footer.text || processedData.footer,
        iconURL: processedData.footer.icon_url || processedData.footer.iconURL,
      });
    } else {
      embed.setFooter({ text: `Member #${member.guild.memberCount}` });
    }

    if (processedData.timestamp !== false) {
      embed.setTimestamp();
    }

    return { embeds: [embed] };
  } else {
    const welcomeMessage = replacePlaceholders(config.message, member);

    const embed = new EmbedBuilder()
      .setColor("#FFD700")
      .setDescription(welcomeMessage)
      .setTimestamp()
      .setFooter({ text: `Member #${member.guild.memberCount}` });

    if (config.image) {
      embed.setImage(config.image);
    }

    return { embeds: [embed] };
  }
}

export { replacePlaceholders, isValidJSON };
