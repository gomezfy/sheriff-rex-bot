import { ChatInputCommandInteraction, EmbedBuilder, MessageFlags } from "discord.js";
import {
  uploadCustomEmojis,
  removeAllCustomEmojis,
  listCustomEmojis,
  syncServerEmojis,
} from "../../../utils/emojiUploader";

export async function handleUploadEmojis(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  if (!interaction.guild) {
    await interaction.editReply({
      content: "❌ This command can only be used in a server!",
    });
    return;
  }

  const action = interaction.options.getString("action", true);

  try {
    let results;
    let title: string;
    let successLabel: string;

    if (action === "sync") {
      results = await syncServerEmojis(interaction.guild);
      title = "🔄 Emoji Synchronization Results";
      successLabel = "✅ Successfully Synced";
    } else if (action === "upload") {
      results = await uploadCustomEmojis(interaction.guild);
      title = "🎨 Custom Emoji Upload Results";
      successLabel = "✅ Successfully Uploaded/Updated";
    } else {
      results = await removeAllCustomEmojis(interaction.guild);
      title = "🗑️ Custom Emoji Removal Results";
      successLabel = "✅ Successfully Removed";
    }

    const embed = new EmbedBuilder()
      .setColor(results.failed === 0 ? "#00FF00" : "#FFA500")
      .setTitle(title)
      .setTimestamp();

    embed.addFields(
      {
        name: successLabel,
        value: `${results.success} emoji(s)`,
        inline: true,
      },
      {
        name: "❌ Failed",
        value: `${results.failed} emoji(s)`,
        inline: true,
      },
    );

    if (results.errors.length > 0) {
      const errorText = results.errors.slice(0, 10).join("\n");
      embed.addFields({
        name: "⚠️ Errors",
        value: `\`\`\`${errorText}\`\`\``,
        inline: false,
      });

      if (results.errors.length > 10) {
        embed.setFooter({
          text: `... and ${results.errors.length - 10} more errors`,
        });
      }
    }

    if (action === "upload") {
      const availableEmojis = listCustomEmojis();
      if (availableEmojis.length > 0) {
        embed.addFields({
          name: "📋 Available Custom Emojis",
          value: availableEmojis.map((name) => `\`${name}\``).join(", "),
          inline: false,
        });
      }
    }

    await interaction.editReply({ embeds: [embed] });
  } catch (error: any) {
    console.error("Error managing emojis:", error);

    const errorEmbed = new EmbedBuilder()
      .setColor("#FF0000")
      .setTitle("❌ Operation Failed")
      .setDescription(
        `An error occurred while managing emojis:\n\`\`\`${error.message}\`\`\``,
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [errorEmbed] });
  }
}
