import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  MessageFlags,
} from "discord.js";
import { transactionLock } from "../../utils/transactionLock";
import { removeItem } from "../../utils/inventoryManager";

const OWNER_ID = process.env.OWNER_ID;

export default {
  data: new SlashCommandBuilder()
    .setName("removegold")
    .setDescription("[OWNER ONLY] Remove Saloon Tokens from a user")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to remove Saloon Tokens from")
        .setRequired(true),
    )
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("Amount of Saloon Tokens to remove")
        .setRequired(true)
        .setMinValue(1),
    )
    .setDefaultMemberPermissions(0),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    if (interaction.user.id !== OWNER_ID) {
      await interaction.reply({
        content: "❌ This command is only available to the bot owner!",
        flags: [MessageFlags.Ephemeral],
      });
      return;
    }

    const targetUser = interaction.options.getUser("user", true);
    const amount = interaction.options.getInteger("amount", true);

    // Use transaction lock to prevent race conditions
    const result = await transactionLock.withLock(targetUser.id, () =>
      removeItem(targetUser.id, "saloon_token", amount),
    );

    if (!result.success) {
      await interaction.reply({
        content: `❌ Failed to remove tokens: ${result.error}`,
        flags: [MessageFlags.Ephemeral],
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor("#FF4500")
      .setTitle("✅ Saloon Tokens Removed!")
      .setDescription(
        `Successfully removed **${amount.toLocaleString()} 🎫** from ${targetUser.tag}!`,
      )
      .addFields(
        { name: "👤 User", value: `${targetUser}`, inline: true },
        {
          name: "💰 Amount Removed",
          value: `${amount.toLocaleString()} 🎫`,
          inline: true,
        },
      )
      .setFooter({ text: "Manual removal by bot owner" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  },
};
