import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  MessageFlags,
} from "discord.js";
import {
  infoEmbed,
  warningEmbed,
  formatCurrency,
  progressBar,
} from "../../utils/embeds";
import {
  getBackpackEmoji,
  getMoneybagEmoji,
  getStatsEmoji,
  getCrateEmoji,
  getBalanceEmoji,
  getWarningEmoji,
  getAlarmEmoji,
} from "../../utils/customEmojis";
import { getCustomEmoji } from "../../utils/emojiUploader";
import { t } from "../../utils/i18n";
const {
  getInventory,
  calculateWeight,
  ITEMS,
  getNextUpgrade,
} = require("../../utils/inventoryManager");

export default {
  data: new SlashCommandBuilder()
    .setName("inventory")
    .setDescription(`${getBackpackEmoji()} View your backpack inventory`)
    .setContexts([0, 1, 2]) // Guild, BotDM, PrivateChannel
    .setIntegrationTypes([0, 1]) // Guild Install, User Install
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Check another user's inventory (optional)")
        .setRequired(false),
    ),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const targetUser = interaction.options.getUser("user") || interaction.user;

    // Only allow viewing own inventory for privacy
    if (targetUser.id !== interaction.user.id) {
      const embed = warningEmbed(
        t(interaction, "inventory_private_title"),
        t(interaction, "inventory_private_desc"),
        t(interaction, "inventory_private_footer"),
      );

      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const inventory = getInventory(targetUser.id);
    const currentWeight = calculateWeight(inventory);
    const maxWeight = inventory.maxWeight;

    // Currency totals
    const saloonTokens = inventory.items["saloon_token"] || 0;
    const silverCoins = inventory.items["silver"] || 0;

    // Count items (excluding currencies)
    const currencies = ["saloon_token", "silver"];
    const otherItems: [string, number][] = [];
    let totalItems = 0;

    for (const [itemId, quantity] of Object.entries(inventory.items)) {
      const quantityNum = Number(quantity);
      totalItems += quantityNum;

      if (!currencies.includes(itemId)) {
        otherItems.push([itemId, quantityNum]);
      }
    }

    // Build items list
    let itemsList = "";
    if (otherItems.length === 0) {
      itemsList = t(interaction, "inventory_empty");
    } else {
      for (const [itemId, quantity] of otherItems) {
        const item = (ITEMS as any)[itemId as string];
        if (item) {
          const itemWeight = item.weight * quantity;
          const weightDisplay =
            itemWeight >= 0.1 ? ` • ${itemWeight.toFixed(1)}kg` : "";
          // Use custom emoji if available, otherwise fallback to text emoji
          const itemEmoji = item.customEmoji
            ? getCustomEmoji(item.customEmoji, item.emoji)
            : item.emoji;
          itemsList += `${itemEmoji} **${item.name}** ×${quantity.toLocaleString()}${weightDisplay}\n`;
        }
      }
    }

    // Weight status
    const weightPercentage = (currentWeight / maxWeight) * 100;
    const weightColor =
      weightPercentage >= 90
        ? "red"
        : weightPercentage >= 70
          ? "amber"
          : "green";
    const weightBar = progressBar(currentWeight, maxWeight, 20);

    // Check for upgrade
    const nextUpgrade = getNextUpgrade(targetUser.id);
    let upgradeInfo = "";

    if (nextUpgrade) {
      upgradeInfo = t(interaction, "inventory_next_upgrade", {
        capacity: nextUpgrade.capacity,
        price: nextUpgrade.price,
      });
    } else {
      upgradeInfo = t(interaction, "inventory_max_capacity");
    }

    // Create embed
    const embed = infoEmbed(
      `${getBackpackEmoji()} ${t(interaction, "inventory_title", { username: targetUser.username })}`,
      t(interaction, "inventory_subtitle"),
    )
      .addFields(
        {
          name: `${getMoneybagEmoji()} ${t(interaction, "inventory_currency")}`,
          value: `${formatCurrency(saloonTokens, "tokens")}\n${formatCurrency(silverCoins, "silver")}`,
          inline: true,
        },
        {
          name: `${getStatsEmoji()} ${t(interaction, "inventory_stats")}`,
          value: t(interaction, "inventory_stats_items", {
            items: totalItems.toLocaleString(),
            types: Object.keys(inventory.items).length,
            weight: currentWeight.toFixed(1),
            maxWeight: maxWeight,
          }),
          inline: true,
        },
        {
          name: `${getCrateEmoji()} ${t(interaction, "inventory_items")}`,
          value: itemsList,
          inline: false,
        },
        {
          name: `${getBalanceEmoji()} ${t(interaction, "inventory_capacity")}`,
          value: `${weightBar}\n${currentWeight.toFixed(1)}kg / ${maxWeight}kg (${weightPercentage.toFixed(0)}%)${upgradeInfo}`,
          inline: false,
        },
      )
      .setThumbnail(targetUser.displayAvatarURL({ size: 128 }));

    // Warning if nearly full
    if (weightPercentage >= 90) {
      embed.setFooter({
        text: `${getWarningEmoji()} ${t(interaction, "inventory_nearly_full_warning")}`,
      });
    } else if (weightPercentage >= 100) {
      embed.setFooter({
        text: `${getAlarmEmoji()} ${t(interaction, "inventory_full_warning")}`,
      });
    } else {
      embed.setFooter({ text: t(interaction, "inventory_transfer_hint") });
    }

    await interaction.editReply({ embeds: [embed] });
  },
};
