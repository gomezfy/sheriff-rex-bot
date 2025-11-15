import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import * as fs from "fs";
import * as path from "path";
import {
  successEmbed,
  errorEmbed,
  warningEmbed,
  formatCurrency,
} from "../../utils/embeds";
import { getDataPath, writeData, readData } from "../../utils/database";
import { t, getLocale } from "../../utils/i18n";
import {
  getGiftEmoji,
  getCheckEmoji,
  getCrossEmoji,
  getSparklesEmoji,
  getBackpackEmoji,
  getStarEmoji,
  getWarningEmoji,
  getSaloonTokenEmoji,
  getSilverCoinEmoji,
  getInfoEmoji,
  getRexBuckEmoji,
} from "../../utils/customEmojis";
import { applyLocalizations } from "../../utils/commandLocalizations";
import {
  addItem,
  upgradeBackpack,
  getBackpackLevel,
  getInventory,
} from "../../utils/inventoryManager";
import { showProgressBar } from "../../utils/progressBar";
import { addRexBucks } from "../../utils/rexBuckManager";

const redemptionCodesPath = path.join(
  getDataPath("data"),
  "redemption-codes.json",
);

interface RedemptionCode {
  productId: string;
  productName: string;
  tokens: number;
  coins: number;
  vip: boolean;
  background: boolean;
  backpack?: number | boolean;
  rexBucks?: number;
  createdAt: number;
  createdBy: string;
  redeemed: boolean;
  redeemedBy?: string;
  redeemedAt?: number;
}

function loadRedemptionCodes(): Record<string, RedemptionCode> {
  try {
    return readData("redemption-codes.json");
  } catch (error) {
    console.error("Error loading redemption codes:", error);
    return {};
  }
}

function saveRedemptionCodes(data: Record<string, RedemptionCode>): void {
  writeData("redemption-codes.json", data);
}

const commandBuilder = new SlashCommandBuilder()
  .setName("redeem")
  .setDescription("🎁 Redeem a purchase code from the website shop")
  .setContexts([0, 1, 2]) // Guild, BotDM, PrivateChannel
  .setIntegrationTypes([0, 1]) // Guild Install, User Install
  .addStringOption((option) =>
    option
      .setName("code")
      .setDescription("Your redemption code (e.g. SHERIFF-GOLD-ABC123)")
      .setRequired(true),
  );

export default {
  data: applyLocalizations(commandBuilder, "redeem"),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const code = interaction.options
      .getString("code", true)
      .toUpperCase()
      .trim();
    const userId = interaction.user.id;

    await interaction.deferReply();

    try {
      const redemptionCodes = loadRedemptionCodes();

      // Check if code exists
      if (!redemptionCodes[code]) {
        const embed = new EmbedBuilder()
          .setColor(0xe74c3c)
          .setTitle(
            `${getCrossEmoji()} ${t(interaction, "redeem_invalid_title")}`,
          )
          .setDescription(t(interaction, "redeem_invalid_desc", { code }))
          .setFooter({ text: t(interaction, "redeem_invalid_footer") })
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
        return;
      }

      const redemption = redemptionCodes[code];

      // Check if already redeemed
      if (redemption.redeemed) {
        const redeemedDate = redemption.redeemedAt
          ? new Date(redemption.redeemedAt).toLocaleString()
          : "Unknown";

        const embed = new EmbedBuilder()
          .setColor(0xf39c12)
          .setTitle(
            `${getWarningEmoji()} ${t(interaction, "redeem_already_title")}`,
          )
          .setDescription(
            t(interaction, "redeem_already_desc", {
              product: redemption.productName,
              date: redeemedDate,
            }),
          )
          .setFooter({ text: t(interaction, "redeem_already_footer") })
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
        return;
      }

      // Show progress bar
      await showProgressBar(
        interaction,
        `${getGiftEmoji()} ${t(interaction, "redeem_processing").toUpperCase()}`,
        t(interaction, "redeem_processing"),
        2000,
        "#FFD700",
      );

      // Apply rewards
      const rewards: string[] = [];
      let backpackUpgraded = false;
      let newCapacity = 0;

      // Add tokens
      if (redemption.tokens > 0) {
        const tokenResult = await addItem(userId, "saloon_token", redemption.tokens);
        if (tokenResult.success) {
          rewards.push(
            `${getSaloonTokenEmoji()} +${formatCurrency(redemption.tokens, "tokens")}`,
          );
        }
      }

      // Add coins
      if (redemption.coins > 0) {
        const coinResult = await addItem(userId, "silver", redemption.coins);
        if (coinResult.success) {
          rewards.push(
            `${getSilverCoinEmoji()} +${formatCurrency(redemption.coins, "silver")}`,
          );
        }
      }

      // Add RexBucks
      if (redemption.rexBucks && redemption.rexBucks > 0) {
        const rexBuckResult = addRexBucks(
          userId,
          redemption.rexBucks,
          "redeem",
          code,
          {
            productId: redemption.productId,
            productName: redemption.productName,
            username: interaction.user.tag,
          },
        );
        if (rexBuckResult.success) {
          rewards.push(
            `${getRexBuckEmoji()} +${redemption.rexBucks.toLocaleString()} RexBucks`,
          );
        }
      }

      // Apply backpack upgrade
      if (redemption.backpack) {
        const targetCapacity =
          typeof redemption.backpack === "number" ? redemption.backpack : 500;
        const currentLevel = getBackpackLevel(userId);

        // Check if user already has this capacity or higher
        const inventory = getInventory(userId);

        if (inventory.maxWeight >= targetCapacity) {
          const embed = new EmbedBuilder()
            .setColor(0xf39c12)
            .setTitle(
              `${getInfoEmoji()} ${t(interaction, "redeem_upgrade_not_needed_title")}`,
            )
            .setDescription(
              t(interaction, "redeem_upgrade_not_needed_desc", {
                current: inventory.maxWeight,
                target: targetCapacity,
              }),
            )
            .setFooter({
              text: t(interaction, "redeem_upgrade_not_needed_footer"),
            })
            .setTimestamp();

          await interaction.editReply({ embeds: [embed] });
          return;
        }

        // Apply upgrade
        const upgradeResult = await upgradeBackpack(userId, targetCapacity);
        if (upgradeResult.success) {
          backpackUpgraded = true;
          newCapacity = targetCapacity;
          rewards.push(
            `${getBackpackEmoji()} ${t(interaction, "redeem_inventory_upgraded", { capacity: targetCapacity })}`,
          );
        }
      }

      // Mark as redeemed
      redemption.redeemed = true;
      redemption.redeemedBy = userId;
      redemption.redeemedAt = Date.now();
      redemptionCodes[code] = redemption;
      saveRedemptionCodes(redemptionCodes);

      // Create success embed
      const embed = new EmbedBuilder()
        .setColor(0x2ecc71)
        .setTitle(
          `${getCheckEmoji()} ${t(interaction, "redeem_success_title")}`,
        )
        .setDescription(
          t(interaction, "redeem_success_desc", {
            product: redemption.productName,
            code,
          }),
        )
        .addFields({
          name: `${getGiftEmoji()} ${t(interaction, "redeem_rewards")}`,
          value:
            rewards.length > 0
              ? rewards.join("\n")
              : t(interaction, "redeem_special_perks"),
          inline: false,
        })
        .setFooter({ text: t(interaction, "redeem_success_footer") })
        .setTimestamp();

      if (redemption.vip) {
        embed.addFields({
          name: `${getStarEmoji()} ${t(interaction, "redeem_vip_status")}`,
          value: t(interaction, "redeem_vip_activated"),
          inline: false,
        });
      }

      if (redemption.background) {
        embed.addFields({
          name: `${getSparklesEmoji()} ${t(interaction, "redeem_background")}`,
          value: t(interaction, "redeem_background_unlocked"),
          inline: false,
        });
      }

      if (backpackUpgraded) {
        embed.addFields({
          name: `${getBackpackEmoji()} ${t(interaction, "redeem_backpack")}`,
          value: t(interaction, "redeem_backpack_upgraded", {
            capacity: newCapacity,
          }),
          inline: false,
        });
      }

      await interaction.editReply({ embeds: [embed] });

      console.log(
        `✅ Code redeemed: ${code} by ${interaction.user.tag} (${userId})`,
      );
    } catch (error) {
      console.error("Error redeeming code:", error);

      const embed = new EmbedBuilder()
        .setColor(0xe74c3c)
        .setTitle(`${getCrossEmoji()} ${t(interaction, "redeem_error_title")}`)
        .setDescription(t(interaction, "redeem_error_desc"))
        .setFooter({ text: t(interaction, "redeem_error_footer") })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    }
  },
};
