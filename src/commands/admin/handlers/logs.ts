import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
} from "discord.js";
import {
  setLogConfig,
  removeLogConfig,
  getLogConfig,
} from "../../../utils/dataManager";
import { t } from "../../../utils/i18n";

export async function handleLogs(
  interaction: ChatInputCommandInteraction,
  subcommand: string,
): Promise<void> {
  if (!interaction.guild) {
    await interaction.reply({
      content: "❌ This command can only be used in a server!",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (subcommand === "set") {
    const channel = interaction.options.getChannel("channel", true);

    const config = {
      channelId: channel.id,
      enabled: true,
      types: [
        "command",
        "error",
        "welcome",
        "leave",
        "economy",
        "bounty",
        "mining",
        "gambling",
        "admin",
      ],
    };

    setLogConfig(interaction.guild.id, config);

    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle(`✅ ${t(interaction, "logs_configured")}`)
      .setDescription(t(interaction, "logs_channel_set"))
      .addFields(
        {
          name: `📢 ${t(interaction, "announce_channel")}`,
          value: `<#${channel.id}>`,
          inline: false,
        },
        {
          name: `📋 ${t(interaction, "logs_events_tracked")}`,
          value: `✅ ${t(interaction, "logs_member_join")}\n✅ ${t(interaction, "logs_member_leave")}\n✅ ${t(interaction, "logs_message_delete")}\n✅ ${t(interaction, "logs_message_edit")}`,
          inline: false,
        },
      )
      .setFooter({
        text: t(interaction, "logs_title"),
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  } else if (subcommand === "view") {
    const config = getLogConfig(interaction.guild.id);

    if (!config) {
      await interaction.reply({
        content: `❌ ${t(interaction, "logs_not_configured")}`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const statusText = config.enabled
      ? `✅ ${t(interaction, "logs_enabled")}`
      : `❌ ${t(interaction, "logs_disabled")}`;

    const embed = new EmbedBuilder()
      .setColor(config.enabled ? 0x00ff00 : 0x808080)
      .setTitle(`🛡️ ${t(interaction, "logs_current_config")}`)
      .addFields(
        {
          name: `📊 ${t(interaction, "logs_status")}`,
          value: statusText,
          inline: true,
        },
        {
          name: `📢 ${t(interaction, "announce_channel")}`,
          value: `<#${config.channelId}>`,
          inline: true,
        },
        {
          name: `📋 ${t(interaction, "logs_events_tracked")}`,
          value:
            `✅ ${t(interaction, "logs_member_join")}\n` +
            `✅ ${t(interaction, "logs_member_leave")}\n` +
            `✅ ${t(interaction, "logs_message_delete")}\n` +
            `✅ ${t(interaction, "logs_message_edit")}`,
          inline: false,
        },
      )
      .setFooter({ text: t(interaction, "logs_title") });

    if (config.updatedAt) {
      embed.setTimestamp(config.updatedAt);
    }

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  } else if (subcommand === "disable") {
    const config = getLogConfig(interaction.guild.id);

    if (!config) {
      await interaction.reply({
        content: `❌ ${t(interaction, "logs_not_configured")}`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    removeLogConfig(interaction.guild.id);

    const embed = new EmbedBuilder()
      .setColor(0xff0000)
      .setTitle(`❌ ${t(interaction, "logs_removed")}`)
      .setDescription(t(interaction, "logs_removed_description"))
      .setTimestamp()
      .setFooter({ text: t(interaction, "logs_title") });

    await interaction.reply({ embeds: [embed] });
  }
}
