import { Client, User, EmbedBuilder, AttachmentBuilder } from "discord.js";
import {
  addBounty,
  getBountyByTarget,
  getWantedConfig,
  getLogConfig,
} from "./dataManager";
import { generateWantedPoster } from "./wantedPoster";
import { loadGuildConfig } from "./configManager";

export async function createAutoWanted(
  client: Client,
  guildId: string,
  escapee: User,
  stolenAmount: number,
): Promise<{
  success: boolean;
  bounty?: any;
  amount?: number;
  poster?: AttachmentBuilder;
  embed?: EmbedBuilder;
  error?: string;
}> {
  try {
    const percentage = 0.5 + Math.random() * 0.2;
    let bountyAmount = Math.floor(stolenAmount * percentage);
    bountyAmount = Math.max(500, Math.min(5000, bountyAmount));

    const sheriffId = client.user!.id;
    const sheriffTag = "🚨 Sheriff";

    addBounty(escapee.id, escapee.tag, sheriffId, sheriffTag, bountyAmount);

    const bounty = getBountyByTarget(escapee.id);

    const posterBuffer = await generateWantedPoster(
      escapee,
      bounty.totalAmount,
    );
    const attachment = new AttachmentBuilder(posterBuffer, {
      name: "wanted.png",
    });

    const embed = new EmbedBuilder()
      .setColor("#FF0000")
      .setTitle("🚨 WANTED - BANK ROBBERY ESCAPEE!")
      .setDescription(
        `**${escapee.tag}** escaped from the Sheriff during a bank robbery!\n\nThe law is offering a reward for their capture!`,
      )
      .addFields(
        { name: "🎯 Fugitive", value: escapee.tag, inline: true },
        {
          name: "💰 Bounty",
          value: `🪙 ${bounty.totalAmount.toLocaleString()} Silver Coins`,
          inline: true,
        },
        { name: "⚖️ Crime", value: "Bank Robbery", inline: true },
      )
      .setImage("attachment://wanted.png")
      .setFooter({ text: "Use /claim to capture this fugitive!" })
      .setTimestamp();

    try {
      const guild = client.guilds.cache.get(guildId);
      if (guild) {
        let channelId: string | null = null;

        const dashboardConfig = loadGuildConfig(guildId);
        if (dashboardConfig.wantedEnabled && dashboardConfig.wantedChannel) {
          channelId = dashboardConfig.wantedChannel;
        }

        if (!channelId) {
          const wantedConfig = getWantedConfig(guildId);
          if (wantedConfig && wantedConfig.enabled && wantedConfig.channelId) {
            channelId = wantedConfig.channelId;
          }
        }

        if (!channelId) {
          if (dashboardConfig.logsEnabled && dashboardConfig.logsChannel) {
            channelId = dashboardConfig.logsChannel;
          }
        }

        if (!channelId) {
          const oldConfig = getLogConfig(guildId);
          if (oldConfig && oldConfig.enabled && oldConfig.channelId) {
            channelId = oldConfig.channelId;
          }
        }

        if (channelId) {
          const channel = guild.channels.cache.get(channelId);
          if (channel && channel.isTextBased()) {
            await channel.send({ embeds: [embed], files: [attachment] });
          }
        }
      }
    } catch (error) {
      console.error("Error posting wanted poster to channel:", error);
    }

    return {
      success: true,
      bounty: bounty,
      amount: bountyAmount,
      poster: attachment,
      embed: embed,
    };
  } catch (error: any) {
    console.error("Error creating auto wanted:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}
