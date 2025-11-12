import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  MessageFlags,
} from "discord.js";
import {
  isOwner,
  adminRateLimiter,
  isValidCurrencyAmount,
  MAX_CURRENCY_AMOUNT,
} from "../../utils/security";
import { transactionLock } from "../../utils/transactionLock";
import { addItem } from "../../utils/inventoryManager";

export default {
  data: new SlashCommandBuilder()
    .setName("addseal")
    .setDescription("[OWNER ONLY] Add Seals to a user")
    .setDescriptionLocalizations({
      "pt-BR": "[SOMENTE OWNER] Adicionar Selos a um usuário",
    })
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to give Seals to")
        .setDescriptionLocalizations({
          "pt-BR": "O usuário para dar Selos",
        })
        .setRequired(true),
    )
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("Amount of Seals to add")
        .setDescriptionLocalizations({
          "pt-BR": "Quantidade de Selos para adicionar",
        })
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
      addItem(targetUser.id, "seal", amount),
    );

    if (!result.success) {
      await interaction.editReply({
        content: `❌ Failed to add seals: ${result.error}`,
      });
      return;
    }

    const sealEmoji = "🎟️";

    const embed = new EmbedBuilder()
      .setColor("#8B4513")
      .setTitle("✅ Seals Added!")
      .setDescription(
        `Successfully added **${amount.toLocaleString()} ${sealEmoji}** to ${targetUser.tag}!`,
      )
      .addFields(
        { name: "👤 User", value: `${targetUser}`, inline: true },
        {
          name: "🎟️ Amount",
          value: `${amount.toLocaleString()} ${sealEmoji}`,
          inline: true,
        },
      )
      .setFooter({ text: "Manual addition by bot owner" })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
