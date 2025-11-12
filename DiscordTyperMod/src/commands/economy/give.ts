import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  MessageFlags,
} from "discord.js";
import {
  successEmbed,
  errorEmbed,
  warningEmbed,
  formatCurrency,
} from "../../utils/embeds";
import { t } from "../../utils/i18n";
import { applyLocalizations } from "../../utils/commandLocalizations";
import { securityLogger } from "../../utils/security";
import { transactionLock } from "../../utils/transactionLock";
import {
  getSaloonTokenEmoji,
  getSilverCoinEmoji,
  getGoldBarEmoji,
  getGiftEmoji,
} from "../../utils/customEmojis";
import { transferItem, ITEMS } from "../../utils/inventoryManager";

export default {
  data: applyLocalizations(
    new SlashCommandBuilder()
      .setName("give")
      .setDescription("Transfer items or currency to another user")
      .setContexts([0, 1, 2])
      .setIntegrationTypes([0, 1])
      .addUserOption((option) =>
        option
          .setName("user")
          .setNameLocalizations({
            "pt-BR": "usuario",
            "es-ES": "usuario",
            fr: "utilisateur",
          })
          .setDescription("The user to give to")
          .setDescriptionLocalizations({
            "pt-BR": "O usuário para dar",
            "es-ES": "El usuario a quien dar",
            fr: "L'utilisateur à qui donner",
          })
          .setRequired(true),
      )
      .addStringOption((option) =>
        option
          .setName("item")
          .setNameLocalizations({
            "pt-BR": "item",
            "es-ES": "articulo",
            fr: "objet",
          })
          .setDescription("The item to give")
          .setDescriptionLocalizations({
            "pt-BR": "O item para dar",
            "es-ES": "El artículo a dar",
            fr: "L'objet à donner",
          })
          .setRequired(true)
          .addChoices(
            { name: "Saloon Tokens", value: "saloon_token" },
            { name: "Seal", value: "seal" },
            { name: "Silver Coins", value: "silver" },
            { name: "Gold Bar", value: "gold" },
          ),
      )
      .addIntegerOption((option) =>
        option
          .setName("amount")
          .setNameLocalizations({
            "pt-BR": "quantidade",
            "es-ES": "cantidad",
            fr: "quantité",
          })
          .setDescription("Amount to give")
          .setDescriptionLocalizations({
            "pt-BR": "Quantidade para dar",
            "es-ES": "Cantidad a dar",
            fr: "Quantité à donner",
          })
          .setRequired(true)
          .setMinValue(1),
      ),
    "give",
  ),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const recipient = interaction.options.getUser("user", true);
    const itemId = interaction.options.getString("item", true);
    const amount = interaction.options.getInteger("amount", true);

    if (recipient.bot) {
      const embed = errorEmbed(
        t(interaction, "give_invalid_recipient"),
        t(interaction, "give_cant_give_bots"),
        t(interaction, "give_choose_real_player"),
      );

      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (recipient.id === interaction.user.id) {
      const embed = warningEmbed(
        t(interaction, "give_self_transfer"),
        t(interaction, "give_cant_give_self"),
        t(interaction, "give_mighty_strange"),
      );

      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await interaction.deferReply();

    // Use transaction lock to prevent race conditions
    const result = await transactionLock.withMultipleLocks(
      [interaction.user.id, recipient.id],
      () => transferItem(interaction.user.id, recipient.id, itemId, amount),
    );

    if (!result.success) {
      const embed = errorEmbed(
        t(interaction, "give_transfer_failed"),
        result.error,
        t(interaction, "give_check_inventory"),
      );

      await interaction.editReply({ embeds: [embed] });
      return;
    }

    // Log high value transactions
    const type =
      itemId === "saloon_token"
        ? "token"
        : itemId === "silver"
          ? "silver"
          : "gold";
    securityLogger.logTransaction(
      interaction.user.id,
      type as "silver" | "gold" | "token",
      amount,
      "transfer",
      recipient.id,
    );

    const item = ITEMS[itemId];

    // Usar emojis customizados
    let itemEmoji = "📦";
    if (itemId === "saloon_token") {
      itemEmoji = getSaloonTokenEmoji();
    } else if (itemId === "silver") {
      itemEmoji = getSilverCoinEmoji();
    } else if (itemId === "gold") {
      itemEmoji = getGoldBarEmoji();
    } else {
      itemEmoji = item?.emoji || "📦";
    }

    const itemName = item?.name || itemId;

    let amountDisplay = "";
    if (itemId === "saloon_token") {
      amountDisplay = formatCurrency(amount, "tokens");
    } else if (itemId === "silver") {
      amountDisplay = formatCurrency(amount, "silver");
    } else {
      amountDisplay = `${itemEmoji} **${amount.toLocaleString()} ${itemName}**`;
    }

    const giftEmoji = getGiftEmoji();
    const embed = successEmbed(
      `${giftEmoji} ${t(interaction, "give_transfer_success")}`,
      t(interaction, "give_you_gave", {
        amount: amountDisplay,
        user: recipient.tag,
      }),
    )
      .addFields(
        {
          name: t(interaction, "give_from"),
          value: interaction.user.tag,
          inline: true,
        },
        { name: t(interaction, "give_to"), value: recipient.tag, inline: true },
        {
          name: t(interaction, "give_item"),
          value: `${itemEmoji} ${itemName}`,
          inline: true,
        },
        {
          name: t(interaction, "give_quantity"),
          value: amount.toLocaleString(),
          inline: true,
        },
      )
      .setFooter({ text: `${giftEmoji} ${t(interaction, "give_generosity")}` });

    await interaction.editReply({ embeds: [embed] });
  },
};
