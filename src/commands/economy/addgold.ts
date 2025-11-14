import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  MessageFlags,
} from "discord.js";
import { getGoldBarEmoji } from "../../utils/customEmojis";
import {
  isOwner,
  adminRateLimiter,
  isValidCurrencyAmount,
  MAX_CURRENCY_AMOUNT,
} from "../../utils/security";
import { addItem } from "../../utils/inventoryManager";

export default {
  data: new SlashCommandBuilder()
    .setName("addgold")
    .setDescription("[OWNER ONLY] Add Gold Bars to a user")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to give Gold Bars to")
        .setRequired(true),
    )
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("Amount of Gold Bars to add")
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

    // addItem already uses transaction lock internally
    const result = await addItem(targetUser.id, "gold", amount);

    if (!result.success) {
      await interaction.editReply({
        content: `❌ Failed to add gold bars: ${result.error}`,
      });
      return;
    }

    const goldEmoji = getGoldBarEmoji();

    const embed = new EmbedBuilder()
      .setColor("#FFD700")
      .setTitle("✅ Gold Bars Added!")
      .setDescription(
        `Successfully added **${amount.toLocaleString()} ${goldEmoji}** to ${targetUser.tag}!`,
      )
      .addFields(
        { name: "👤 User", value: `${targetUser}`, inline: true },
        {
          name: "💰 Amount",
          value: `${amount.toLocaleString()} ${goldEmoji}`,
          inline: true,
        },
      )
      .setFooter({ text: "Manual addition by bot owner" })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
