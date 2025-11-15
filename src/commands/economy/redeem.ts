import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import {
  successEmbed,
  errorEmbed,
  warningEmbed,
  formatCurrency,
} from "../../utils/embeds";
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
import { showProgressBar } from "../../utils/progressBar";
import { redeemCodeAndApplyRewards } from "../../utils/redemptionCodeManager";

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
      // Show progress bar
      await showProgressBar(
        interaction,
        `${getGiftEmoji()} ${t(interaction, "redeem_processing").toUpperCase()}`,
        t(interaction, "redeem_processing"),
        2000,
        "#FFD700",
      );

      const redemptionResult = await redeemCodeAndApplyRewards(
        code,
        userId,
        interaction.user.tag,
      );

      if (!redemptionResult.success) {
        if (redemptionResult.errorType === "NOT_FOUND") {
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

        if (redemptionResult.errorType === "ALREADY_REDEEMED" && redemptionResult.code) {
          const redeemedDate = redemptionResult.code.redeemedAt
            ? new Date(redemptionResult.code.redeemedAt).toLocaleString()
            : "Unknown";

          const embed = new EmbedBuilder()
            .setColor(0xf39c12)
            .setTitle(
              `${getWarningEmoji()} ${t(interaction, "redeem_already_title")}`,
            )
            .setDescription(
              t(interaction, "redeem_already_desc", {
                product: redemptionResult.code.productName,
                date: redeemedDate,
              }),
            )
            .setFooter({ text: t(interaction, "redeem_already_footer") })
            .setTimestamp();

          await interaction.editReply({ embeds: [embed] });
          return;
        }

        if (redemptionResult.errorType === "UPGRADE_NOT_NEEDED") {
          const embed = new EmbedBuilder()
            .setColor(0xf39c12)
            .setTitle(
              `${getInfoEmoji()} ${t(interaction, "redeem_upgrade_not_needed_title")}`,
            )
            .setDescription(
              t(interaction, "redeem_upgrade_not_needed_desc", {
                current: redemptionResult.currentInventoryCapacity,
                target: redemptionResult.targetInventoryCapacity,
              }),
            )
            .setFooter({
              text: t(interaction, "redeem_upgrade_not_needed_footer"),
            })
            .setTimestamp();

          await interaction.editReply({ embeds: [embed] });
          return;
        }

        const embed = new EmbedBuilder()
          .setColor(0xe74c3c)
          .setTitle(`${getCrossEmoji()} ${t(interaction, "redeem_error_title")}`)
          .setDescription(redemptionResult.error || t(interaction, "redeem_error_desc"))
          .setFooter({ text: t(interaction, "redeem_error_footer") })
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
        return;
      }

      const redemption = redemptionResult.code!;

      const rewards: string[] = [];

      if (redemption.tokens > 0) {
        rewards.push(
          `${getSaloonTokenEmoji()} +${formatCurrency(redemption.tokens, "tokens")}`,
        );
      }

      if (redemption.coins > 0) {
        rewards.push(
          `${getSilverCoinEmoji()} +${formatCurrency(redemption.coins, "silver")}`,
        );
      }

      if (redemption.rexBucks && redemption.rexBucks > 0) {
        rewards.push(
          `${getRexBuckEmoji()} +${redemption.rexBucks.toLocaleString()} RexBucks`,
        );
      }

      let backpackUpgraded = false;
      let newCapacity = 0;

      if (redemption.backpack) {
        backpackUpgraded = true;
        newCapacity = redemption.backpack;
        rewards.push(
          `${getBackpackEmoji()} ${t(interaction, "redeem_inventory_upgraded", { capacity: redemption.backpack })}`,
        );
      }

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
