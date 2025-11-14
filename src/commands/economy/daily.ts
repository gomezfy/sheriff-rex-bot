import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  MessageFlags,
} from "discord.js";
import { addXp } from "../../utils/xpManager";
import {
  economyEmbed,
  errorEmbed,
  warningEmbed,
  formatCurrency,
  formatDuration,
  field,
} from "../../utils/embeds";
import {
  getSilverCoinEmoji,
  getSaloonTokenEmoji,
} from "../../utils/customEmojis";
import { t } from "../../utils/i18n";
import { applyLocalizations } from "../../utils/commandLocalizations";
import { addItem } from "../../utils/inventoryManager";
import { readData, writeData } from "../../utils/database";
import { Command, DailyData, DailyUserData } from "../../types";

const dailyCooldown = 24 * 60 * 60 * 1000;

/**
 * Get daily data from database
 * @returns The daily data object containing all user daily claim information
 */
function getDailyData(): DailyData {
  return readData("daily.json") as DailyData;
}

/**
 * Save daily data to database
 * @param data - The daily data object to save
 * @returns void
 */
function saveDailyData(data: DailyData): void {
  writeData("daily.json", data);
}

/**
 * Daily Command - Allows users to claim daily rewards and build streaks
 *
 * Features:
 * - 24 hour cooldown between claims
 * - Streak system with bonus rewards
 * - Rewards scale with streak length (up to 100% bonus)
 * - Breaks streak if user doesn't claim within 48 hours
 * - Rewards: Silver coins, Saloon Tokens, and XP
 */
const command: Command = {
  data: applyLocalizations(
    new SlashCommandBuilder()
      .setName("daily")
      .setDescription("Claim your daily reward and build a streak!")
      .setContexts([0, 1, 2]) // Guild, BotDM, PrivateChannel
      .setIntegrationTypes([0, 1]), // Guild Install, User Install
    "daily",
  ),
  /**
   * Execute the daily command
   * @param interaction - The command interaction from Discord
   * @returns Promise that resolves when command execution is complete
   */
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const userId = interaction.user.id;
    const dailyData = getDailyData();

    if (!dailyData[userId]) {
      dailyData[userId] = {
        lastClaim: 0,
        streak: 0,
      };
    }

    let userData = dailyData[userId];

    // Fix corrupted data (if userData is just a number instead of an object)
    if (typeof userData === "number") {
      userData = {
        lastClaim: userData,
        streak: 1,
      };
      dailyData[userId] = userData;
      saveDailyData(dailyData);
    }

    const now = Date.now();
    const timeSinceLastClaim = now - userData.lastClaim;

    if (timeSinceLastClaim < dailyCooldown) {
      const timeLeft = dailyCooldown - timeSinceLastClaim;
      const pluralSuffix = userData.streak !== 1 ? "s" : "";

      const embed = warningEmbed(
        t(interaction, "daily_title"),
        t(interaction, "daily_already_claimed", {
          time: formatDuration(timeLeft),
          streak: userData.streak,
          plural: pluralSuffix,
        }),
        t(interaction, "daily_come_back"),
      );

      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // Defer reply immediately for better performance
    await interaction.deferReply();

    const wasStreakBroken = timeSinceLastClaim > dailyCooldown * 2;
    const previousStreak = userData.streak; // Capture previous streak before mutation
    const newStreak = wasStreakBroken ? 1 : userData.streak + 1;

    const baseSilver = 500;
    const baseTokens = 5;
    const baseXP = 100;

    const streakBonus = Math.min(newStreak * 0.1, 1.0);

    const silverAmount = Math.floor(baseSilver * (1 + streakBonus));
    const tokenAmount = Math.floor(baseTokens * (1 + streakBonus));
    const xpAmount = Math.floor(baseXP * (1 + streakBonus));

    const silverResult = await addItem(userId, "silver", silverAmount);
    const tokenResult = await addItem(userId, "saloon_token", tokenAmount);

    if (!silverResult.success || !tokenResult.success) {
      const error = !silverResult.success
        ? silverResult.error
        : tokenResult.error;

      const embed = errorEmbed(
        t(interaction, "daily_failed_title"),
        t(interaction, "daily_inventory_too_full", { error }),
        t(interaction, "daily_free_space"),
      );

      await interaction.editReply({
        embeds: [embed],
      });
      return;
    }

    addXp(userId, xpAmount);

    userData.lastClaim = now;
    userData.streak = newStreak;
    dailyData[userId] = userData;
    saveDailyData(dailyData);

    const streakText =
      newStreak !== 1
        ? t(interaction, "daily_days")
        : t(interaction, "daily_day");

    const embed = economyEmbed(
      t(interaction, "daily_title"),
      wasStreakBroken && previousStreak > 1
        ? t(interaction, "daily_streak_broken")
        : t(interaction, "daily_claimed_success"),
      t(interaction, "daily_comeback_24h"),
    ).addFields(
      field(
        `${getSilverCoinEmoji()} ${t(interaction, "daily_field_silver")}`,
        `+${formatCurrency(silverAmount, "silver")}`,
        true,
      ),
      field(
        `${getSaloonTokenEmoji()} ${t(interaction, "daily_field_tokens")}`,
        `+${formatCurrency(tokenAmount, "tokens")}`,
        true,
      ),
      field(t(interaction, "daily_field_xp"), `+${xpAmount}`, true),
      field(
        t(interaction, "daily_field_streak"),
        `${newStreak} ${streakText} 🔥`,
        true,
      ),
      field(
        t(interaction, "daily_field_bonus"),
        `+${Math.floor(streakBonus * 100)}%`,
        true,
      ),
      field("\u200B", "\u200B", true),
    );

    await interaction.editReply({ embeds: [embed] });
  },
};

export default command;
