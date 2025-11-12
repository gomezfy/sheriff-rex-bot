import { EmbedBuilder, Client, User } from "discord.js";
import { getLogConfig } from "./dataManager";
import { loadGuildConfig } from "./configManager";

class Logger {
  static async log(
    client: Client,
    guildId: string,
    type: string,
    data: any,
  ): Promise<void> {
    try {
      const dashboardConfig = loadGuildConfig(guildId);
      const oldConfig = getLogConfig(guildId);

      const config =
        dashboardConfig.logsEnabled && dashboardConfig.logsChannel
          ? {
              enabled: dashboardConfig.logsEnabled,
              channelId: dashboardConfig.logsChannel,
            }
          : oldConfig;

      if (!config || !config.enabled) {
        return;
      }

      const guild = client.guilds.cache.get(guildId);
      if (!guild) {
        return;
      }

      const channel = guild.channels.cache.get(config.channelId);
      if (!channel) {
        console.error(
          `Log channel ${config.channelId} not found in guild ${guild.name}`,
        );
        return;
      }

      const embed = this.createLogEmbed(type, data);

      if (channel.isTextBased()) {
        await channel.send({ embeds: [embed] });
      }
    } catch (error) {
      console.error("Error sending log:", error);
    }
  }

  static createLogEmbed(type: string, data: any): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setTimestamp()
      .setFooter({ text: "Sheriff Bot Logs" });

    switch (type) {
      case "command":
        embed
          .setColor("#5865F2")
          .setTitle("📜 Command Executed")
          .addFields(
            {
              name: "👤 User",
              value: `${data.user.tag} (${data.user.id})`,
              inline: true,
            },
            { name: "⚙️ Command", value: `\`/${data.command}\``, inline: true },
            { name: "📍 Channel", value: `<#${data.channelId}>`, inline: true },
          );
        if (data.options) {
          embed.addFields({
            name: "🔧 Options",
            value: data.options,
            inline: false,
          });
        }
        break;

      case "error":
        embed
          .setColor("#ED4245")
          .setTitle("❌ Error")
          .addFields(
            { name: "⚙️ Command", value: `\`/${data.command}\``, inline: true },
            { name: "👤 User", value: `${data.user.tag}`, inline: true },
            {
              name: "📝 Error",
              value: `\`\`\`${data.error.substring(0, 1000)}\`\`\``,
              inline: false,
            },
          );
        break;

      case "welcome":
        embed
          .setColor("#57F287")
          .setTitle("👋 Welcome Message Sent")
          .addFields(
            {
              name: "👤 New Member",
              value: `${data.member.tag} (${data.member.id})`,
              inline: true,
            },
            { name: "📍 Channel", value: `<#${data.channelId}>`, inline: true },
            {
              name: "📊 Server Members",
              value: `${data.memberCount}`,
              inline: true,
            },
          );
        break;

      case "leave":
        embed
          .setColor("#F26522")
          .setTitle("👋 Member Left")
          .addFields(
            {
              name: "👤 Member",
              value: `${data.member.tag} (${data.member.id})`,
              inline: true,
            },
            {
              name: "📊 Server Members",
              value: `${data.memberCount}`,
              inline: true,
            },
            {
              name: "⏱️ Joined At",
              value: data.joinedAt
                ? `<t:${Math.floor(data.joinedAt / 1000)}:R>`
                : "Unknown",
              inline: true,
            },
          );
        if (data.roles && data.roles.length > 0) {
          embed.addFields({
            name: "🎭 Roles",
            value: data.roles.join(", "),
            inline: false,
          });
        }
        break;

      case "economy":
        embed
          .setColor("#FEE75C")
          .setTitle("💰 Economy Transaction")
          .addFields(
            { name: "👤 User", value: `${data.user.tag}`, inline: true },
            { name: "💵 Type", value: data.type, inline: true },
            { name: "💎 Amount", value: data.amount, inline: true },
          );
        if (data.reason) {
          embed.addFields({
            name: "📝 Reason",
            value: data.reason,
            inline: false,
          });
        }
        break;

      case "bounty":
        embed
          .setColor("#F26522")
          .setTitle("🎯 Bounty Action")
          .addFields(
            { name: "👤 Issuer", value: `${data.issuer.tag}`, inline: true },
            { name: "🎯 Target", value: `${data.target.tag}`, inline: true },
            { name: "💰 Amount", value: `${data.amount} 🪙`, inline: true },
            { name: "📋 Action", value: data.action, inline: false },
          );
        break;

      case "mining":
        embed
          .setColor("#95A5A6")
          .setTitle("⛏️ Mining Activity")
          .addFields(
            { name: "👤 Miner", value: `${data.user.tag}`, inline: true },
            { name: "⛏️ Type", value: data.mineType, inline: true },
            {
              name: "🥇 Gold Earned",
              value: `${data.goldAmount}`,
              inline: true,
            },
          );
        if (data.partner) {
          embed.addFields({
            name: "🤝 Partner",
            value: `${data.partner.tag}`,
            inline: true,
          });
        }
        break;

      case "gambling":
        embed
          .setColor("#9B59B6")
          .setTitle("🎰 Gambling Activity")
          .addFields(
            { name: "👤 Player", value: `${data.user.tag}`, inline: true },
            { name: "🎲 Game", value: data.game, inline: true },
            { name: "💰 Bet", value: `${data.bet} 🪙`, inline: true },
            { name: "📊 Result", value: data.result, inline: false },
          );
        if (data.winnings) {
          embed.addFields({
            name: "🏆 Winnings",
            value: `${data.winnings} 🪙`,
            inline: true,
          });
        }
        break;

      case "admin":
        embed
          .setColor("#E91E63")
          .setTitle("🛡️ Admin Action")
          .addFields(
            { name: "👤 Admin", value: `${data.admin.tag}`, inline: true },
            { name: "⚙️ Action", value: data.action, inline: true },
            { name: "📝 Details", value: data.details, inline: false },
          );
        break;

      default:
        embed
          .setColor("#99AAB5")
          .setTitle("📋 Log Entry")
          .setDescription(`Type: ${type}`);
    }

    return embed;
  }
}

export default Logger;
