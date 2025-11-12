import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { t } from "../../utils/i18n";
import { applyLocalizations } from "../../utils/commandLocalizations";

/**
 * Get status emoji based on latency
 * @param interaction - The command interaction
 * @param latency - The latency in milliseconds
 * @returns Localized status emoji string
 */
function getStatusEmoji(
  interaction: ChatInputCommandInteraction,
  latency: number,
): string {
  if (latency < 100) return t(interaction, "ping_excellent");
  if (latency < 200) return t(interaction, "ping_good");
  if (latency < 400) return t(interaction, "ping_medium");
  if (latency < 800) return t(interaction, "ping_slow");
  return t(interaction, "ping_critical");
}

/**
 * Get embed color based on latency
 * @param latency - The latency in milliseconds
 * @returns Hexadecimal color code
 */
function getStatusColor(latency: number): number {
  if (latency < 100) return 0x00ff00; // Verde
  if (latency < 200) return 0x90ee90; // Verde claro
  if (latency < 400) return 0xffff00; // Amarelo
  if (latency < 800) return 0xffa500; // Laranja
  return 0xff0000; // Vermelho
}

/**
 * Format uptime in human-readable format
 * @param ms - Uptime in milliseconds
 * @returns Formatted uptime string (e.g., "2d 5h 30m")
 */
function formatUptime(ms: number): string {
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);

  return parts.join(" ") || "< 1m";
}

/**
 * Ping Command - Check bot's latency and uptime
 * Displays response time, API latency, uptime, and connection status
 */
export const data = applyLocalizations(
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check the bot's latency")
    .setContexts([0, 1, 2]) // Guild, BotDM, PrivateChannel
    .setIntegrationTypes([0, 1]), // Guild Install, User Install
  "ping",
);

/**
 * Execute the ping command
 * @param interaction - The command interaction
 * @returns Promise that resolves when command execution is complete
 */
export async function execute(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  await interaction.reply({
    content: t(interaction, "ping_calculating"),
  });

  const sent = await interaction.fetchReply();
  const latency = sent.createdTimestamp - interaction.createdTimestamp;
  const apiLatency = Math.round(interaction.client.ws.ping);
  const uptime = interaction.client.uptime || 0;

  const statusEmoji = getStatusEmoji(interaction, latency);
  const color = getStatusColor(latency);

  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(t(interaction, "ping_pong"))
    .addFields(
      {
        name: `📡 ${t(interaction, "ping_latency")}`,
        value: `\`${latency}ms\``,
        inline: true,
      },
      {
        name: `💓 ${t(interaction, "ping_api_latency")}`,
        value: `\`${apiLatency}ms\``,
        inline: true,
      },
      {
        name: `⏰ ${t(interaction, "ping_uptime")}`,
        value: `\`${formatUptime(uptime)}\``,
        inline: true,
      },
      {
        name: `${t(interaction, "ping_status")}`,
        value: statusEmoji,
        inline: false,
      },
    )
    .setTimestamp()
    .setFooter({ text: `Sheriff Bot • ${latency}ms` });

  await interaction.editReply({ content: "", embeds: [embed] });
}
