import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
} from "discord.js";
import { setWantedConfig, getWantedConfig } from "../../../utils/dataManager";

export async function handleWanted(
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

    if (!channel || !("send" in channel)) {
      await interaction.reply({
        content: "❌ The channel must be a text channel!",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    setWantedConfig(interaction.guild.id, {
      enabled: true,
      channelId: channel.id,
    });

    const embed = new EmbedBuilder()
      .setColor("#57F287")
      .setTitle("✅ Wanted Channel Configured!")
      .setDescription(`Wanted posters will now be posted in ${channel}`)
      .addFields(
        { name: "📢 Channel", value: `${channel}`, inline: true },
        {
          name: "🎯 Purpose",
          value: "Sheriff bounties & fugitives",
          inline: true,
        },
      )
      .setFooter({
        text: "Automatic wanted posters from /bankrob escapes will appear here!",
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  } else if (subcommand === "view") {
    const config = getWantedConfig(interaction.guild.id);

    if (!config || !config.enabled) {
      const embed = new EmbedBuilder()
        .setColor("#808080")
        .setTitle("📋 Wanted Channel Configuration")
        .setDescription(
          "Wanted poster channel is not configured.\n\n**Fallback:** Will use logs channel if configured.",
        )
        .addFields({
          name: "💡 Setup",
          value: "Use `/admin wanted set` to configure a channel",
          inline: false,
        })
        .setTimestamp();

      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const channel = interaction.guild.channels.cache.get(config.channelId);
    const channelText = channel
      ? `${channel}`
      : `Unknown channel (${config.channelId})`;

    const embed = new EmbedBuilder()
      .setColor("#FFD700")
      .setTitle("📋 Wanted Channel Configuration")
      .setDescription("Wanted poster channel is currently active.")
      .addFields(
        { name: "📢 Channel", value: channelText, inline: true },
        { name: "✅ Status", value: "Enabled", inline: true },
      )
      .setFooter({ text: "Use /admin wanted disable to turn off" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  } else if (subcommand === "disable") {
    const config = getWantedConfig(interaction.guild.id);

    if (!config || !config.enabled) {
      await interaction.reply({
        content: "⚠️ Wanted poster channel is already disabled!",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    setWantedConfig(interaction.guild.id, {
      enabled: false,
      channelId: null,
    });

    const embed = new EmbedBuilder()
      .setColor("#FFA500")
      .setTitle("⚠️ Wanted Channel Disabled")
      .setDescription(
        "Wanted posters will no longer be posted automatically.\n\n**Fallback:** Will use logs channel if configured.",
      )
      .setFooter({ text: "Use /admin wanted set to re-enable" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}
