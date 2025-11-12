import { Events, GuildMember, TextChannel } from "discord.js";
import { logMemberJoin } from "../utils/modLogs";
import { getWelcomeConfig } from "../utils/dataManager";
import { loadGuildConfig } from "../utils/configManager";
import { buildWelcomeEmbed } from "../utils/welcomeEmbedBuilder";

export const name = Events.GuildMemberAdd;
export const once = false;

export async function execute(member: GuildMember) {
  await logMemberJoin(member);

  try {
    let welcomeConfig = getWelcomeConfig(member.guild.id);

    if (!welcomeConfig || !welcomeConfig.enabled) {
      const guildConfig = loadGuildConfig(member.guild.id);
      if (guildConfig.welcomeEnabled && guildConfig.welcomeChannel) {
        welcomeConfig = {
          enabled: true,
          channelId: guildConfig.welcomeChannel,
          message:
            guildConfig.welcomeMessage || "Welcome {user} to {server}! 🤠",
        };
      }
    }

    if (welcomeConfig && welcomeConfig.enabled && welcomeConfig.channelId) {
      const channel = member.guild.channels.cache.get(
        welcomeConfig.channelId,
      ) as TextChannel;

      if (channel && "send" in channel) {
        const welcomePayload = buildWelcomeEmbed(welcomeConfig, member);
        await channel.send(welcomePayload);
      }
    }
  } catch (error) {
    console.error("Error sending welcome message:", error);
  }
}
