import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  MessageFlags,
} from "discord.js";
import { transactionLock } from "../../utils/transactionLock";
import { removeItem } from "../../utils/inventoryManager";
import {
  isOwner,
  adminRateLimiter,
  isValidCurrencyAmount,
  MAX_CURRENCY_AMOUNT,
} from "../../utils/security";

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
        .setMinValue(1)
        .setMaxValue(MAX_CURRENCY_AMOUNT),
    )
    .setDefaultMemberPermissions(0),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    // Security: Validate owner
    if (!(await isOwner(interaction))) {
      return;
    }

    // Security: Rate limit admin commands
    if (!adminRateLimiter.canExecute(interaction.user.id)) {
      const remaining = adminRateLimiter.getRemainingCooldown(
        interaction.user.id,
      );
      await interaction.editReply({
        content: `⏰ Please wait ${(remaining / 1000).toFixed(1)}s before using another admin command.`,
      });
      return;
    }

    const targetUser = interaction.options.getUser("user", true);
    const amount = interaction.options.getInteger("amount", true);

    // Security: Validate amount
    if (!isValidCurrencyAmount(amount)) {
      await interaction.editReply({
        content: `❌ Invalid amount! Must be between 1 and ${MAX_CURRENCY_AMOUNT.toLocaleString()}.`,
      });
      return;
    }

    // Use transaction lock to prevent race conditions
    const result = await transactionLock.withLock(targetUser.id, () =>
      removeItem(targetUser.id, "saloon_token", amount),
    );

    if (!result.success) {
      await interaction.editReply({
        content: `❌ Failed to remove tokens: ${result.error}`,
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

    await interaction.editReply({ embeds: [embed] });
  },
};
