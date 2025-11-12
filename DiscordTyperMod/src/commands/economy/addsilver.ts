import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  MessageFlags,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} from "discord.js";
import { getSilverCoinEmoji } from "../../utils/customEmojis";
import { securityLogger } from "../../utils/security";
import { transactionLock } from "../../utils/transactionLock";
import { addItem } from "../../utils/inventoryManager";

const OWNER_ID = process.env.OWNER_ID;
const HIGH_VALUE_THRESHOLD = 10000;

export default {
  data: new SlashCommandBuilder()
    .setName("addsilver")
    .setDescription("[OWNER ONLY] Add Silver Coins to a user")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to give Silver Coins to")
        .setRequired(true),
    )
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("Amount of Silver Coins to add")
        .setRequired(true)
        .setMinValue(1),
    )
    .setDefaultMemberPermissions(0),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    if (interaction.user.id !== OWNER_ID) {
      await interaction.editReply({
        content: "❌ This command is only available to the bot owner!",
      });
      return;
    }

    const targetUser = interaction.options.getUser("user", true);
    const amount = interaction.options.getInteger("amount", true);

    // High value confirmation
    if (amount >= HIGH_VALUE_THRESHOLD) {
      const confirmEmbed = new EmbedBuilder()
        .setColor("#FFA500")
        .setTitle("⚠️ High Value Transaction")
        .setDescription(
          `You are about to add **${amount.toLocaleString()}** silver coins to ${targetUser.tag}.\n\nThis is a large amount. Please confirm this action.`,
        )
        .addFields(
          { name: "👤 Target User", value: targetUser.tag, inline: true },
          {
            name: "💰 Amount",
            value: `${amount.toLocaleString()} silver`,
            inline: true,
          },
        );

      const confirmRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("confirm_add")
          .setLabel("✅ Confirm")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId("cancel_add")
          .setLabel("❌ Cancel")
          .setStyle(ButtonStyle.Danger),
      );

      const reply = await interaction.editReply({
        embeds: [confirmEmbed],
        components: [confirmRow],
      });

      try {
        const confirmation = await reply.awaitMessageComponent({
          filter: (i) => i.user.id === interaction.user.id,
          componentType: ComponentType.Button,
          time: 30000,
        });

        if (confirmation.customId === "cancel_add") {
          await confirmation.update({
            content: "❌ Transaction cancelled.",
            embeds: [],
            components: [],
          });
          return;
        }

        await confirmation.deferUpdate();
      } catch (error) {
        await interaction.editReply({
          content: "⏱️ Confirmation timeout. Transaction cancelled.",
          embeds: [],
          components: [],
        });
        return;
      }
    }

    // Use transaction lock to prevent race conditions
    const result = await transactionLock.withLock(targetUser.id, () =>
      addItem(targetUser.id, "silver", amount),
    );

    // Log the transaction
    securityLogger.logTransaction(
      interaction.user.id,
      "silver",
      amount,
      "admin_add",
      targetUser.id,
    );

    if (!result.success) {
      await interaction.editReply({
        content: `❌ Failed to add coins: ${result.error}`,
      });
      return;
    }

    const silverEmoji = getSilverCoinEmoji();

    const embed = new EmbedBuilder()
      .setColor("#C0C0C0")
      .setTitle("✅ Silver Coins Added!")
      .setDescription(
        `Successfully added **${amount.toLocaleString()} ${silverEmoji}** to ${targetUser.tag}!`,
      )
      .addFields(
        { name: "👤 User", value: `${targetUser}`, inline: true },
        {
          name: "💰 Amount",
          value: `${amount.toLocaleString()} ${silverEmoji}`,
          inline: true,
        },
      )
      .setFooter({ text: "Manual addition by bot owner" })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
