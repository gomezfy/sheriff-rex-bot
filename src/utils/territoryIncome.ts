import { Client, EmbedBuilder } from "discord.js";
import { getUserTerritories, getTerritory } from "./territoryManager";
import { readData, writeData } from "./database";
import { getSilverCoinEmoji } from "./customEmojis";

const { addItem } = require("./inventoryManager");

interface TerritoryIncomeData {
  [userId: string]: {
    lastPayout: number;
    lastCattlePayout?: number; // For weekly Cattle rewards from Ranch
  };
}

const PAYOUT_COOLDOWN = 23 * 60 * 60 * 1000; // 23 hours
const CATTLE_PAYOUT_COOLDOWN = 7 * 24 * 60 * 60 * 1000; // 7 days (1 week)

/**
 * Get territory income data
 */
function getIncomeData(): TerritoryIncomeData {
  return readData("territory-income.json");
}

/**
 * Save territory income data
 * @param data
 */
function saveIncomeData(data: TerritoryIncomeData): void {
  writeData("territory-income.json", data);
}

/**
 * Check if user can claim territory income
 * @param userId
 */
export function canClaimTerritoryIncome(userId: string): boolean {
  const data = getIncomeData();

  if (!data[userId]) {
    return true;
  }

  const timeSinceLastPayout = Date.now() - data[userId].lastPayout;
  return timeSinceLastPayout >= PAYOUT_COOLDOWN;
}

/**
 * Get time until next payout
 * @param userId
 */
export function getTimeUntilNextPayout(userId: string): number {
  const data = getIncomeData();

  if (!data[userId]) {
    return 0;
  }

  const timeSinceLastPayout = Date.now() - data[userId].lastPayout;
  const timeRemaining = PAYOUT_COOLDOWN - timeSinceLastPayout;

  return Math.max(0, timeRemaining);
}

/**
 * Process territory income for a user and send DM
 * @param client
 * @param userId
 */
export async function processTerritoryIncome(
  client: Client,
  userId: string,
): Promise<boolean> {
  try {
    // Check if user has territories
    const userTerritories = getUserTerritories(userId);

    if (userTerritories.length === 0) {
      return false; // No territories, nothing to pay
    }

    // Check cooldown
    if (!canClaimTerritoryIncome(userId)) {
      return false; // Still on cooldown
    }

    // Calculate income - Silver Coins daily + Ranch weekly cattle
    let totalSilver = 0;
    let totalCattle = 0;
    const incomeDetails: string[] = [];

    // Check if it's time for weekly Cattle payout (Ranch)
    const data = getIncomeData();
    const hasRanch = userTerritories.includes("ranch");
    let shouldPayCattle = false;

    if (hasRanch) {
      const lastCattlePayout = data[userId]?.lastCattlePayout || 0;
      const timeSinceCattlePayout = Date.now() - lastCattlePayout;
      shouldPayCattle = timeSinceCattlePayout >= CATTLE_PAYOUT_COOLDOWN;
    }

    for (const territoryId of userTerritories) {
      const territory = getTerritory(territoryId);
      if (!territory) {
        continue;
      }

      if (territoryId === "saloon_business") {
        totalSilver += 5000;
        incomeDetails.push("🍺 **Saloon Business:** +5,000 Silver Coins");
      } else if (territoryId === "gold_mine_shares") {
        totalSilver += 12000;
        incomeDetails.push("⛏️ **Gold Mine Shares:** +12,000 Silver Coins");
      } else if (territoryId === "ranch") {
        totalSilver += 15000;
        incomeDetails.push("🐴 **Ranch:** +15,000 Silver Coins");

        // Add weekly Cattle if it's time
        if (shouldPayCattle) {
          totalCattle += 8;
          incomeDetails.push("🐄 **Weekly Bonus:** +8 Cattle");
        }
      }
    }

    // Add income to inventory
    if (totalSilver > 0) {
      await addItem(userId, "silver", totalSilver);
    }
    if (totalCattle > 0) {
      await addItem(userId, "cattle", totalCattle);
    }

    // Update payout timestamps
    if (!data[userId]) {
      data[userId] = { lastPayout: 0 };
    }

    data[userId].lastPayout = Date.now();

    // Update Cattle payout timestamp if we paid Cattle
    if (shouldPayCattle) {
      data[userId].lastCattlePayout = Date.now();
    }

    saveIncomeData(data);

    // Send DM to user
    try {
      const user = await client.users.fetch(userId);

      const silverEmoji = getSilverCoinEmoji();

      const embed = new EmbedBuilder()
        .setColor(0xffd700) // Gold color
        .setTitle("🏛️ Territory Income Received!")
        .setDescription("Your territories have generated profits!")
        .addFields(
          {
            name: "💰 Income Breakdown",
            value: incomeDetails.join("\n"),
            inline: false,
          },
          {
            name: "📊 Total Received",
            value: `${totalSilver.toLocaleString()} ${silverEmoji} Silver Coins${totalCattle > 0 ? `\n${totalCattle} 🐄 Cattle` : ""}`,
            inline: false,
          },
        )
        .setFooter({ text: "🤠 Keep investing in your empire!" })
        .setTimestamp();

      await user.send({ embeds: [embed] });

      console.log(
        `💰 Territory income sent to ${user.tag}: ${totalSilver} silver`,
      );
      return true;
    } catch (error) {
      console.error(`❌ Failed to send DM to user ${userId}:`, error);
      // Even if DM fails, we still gave them the money
      return true;
    }
  } catch (error) {
    console.error("❌ Error processing territory income:", error);
    return false;
  }
}

/**
 * Process territory income for all users
 * @param client
 */
export async function processAllTerritoryIncome(client: Client): Promise<void> {
  try {
    const territories = readData("territories.json");
    const userIds = Object.keys(territories);

    let processed = 0;
    let skipped = 0;

    for (const userId of userIds) {
      const success = await processTerritoryIncome(client, userId);
      if (success) {
        processed++;
      } else {
        skipped++;
      }

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log(
      `💰 Territory income processed: ${processed} users paid, ${skipped} skipped`,
    );
  } catch (error) {
    console.error("❌ Error processing all territory income:", error);
  }
}

/**
 * Start automatic territory income processing
 * Checks every hour and automatically pays users who are eligible
 * @param client
 */
export function startAutomaticTerritoryIncome(client: Client): NodeJS.Timeout {
  console.log("🏛️ Starting automatic territory income system (23-hour cycle)");

  // Run immediately on startup
  processAllTerritoryIncome(client).catch((error) => {
    console.error("❌ Error in initial territory income processing:", error);
  });

  // Then run every hour to check for eligible users
  const interval = setInterval(
    async () => {
      try {
        await processAllTerritoryIncome(client);
      } catch (error) {
        console.error(
          "❌ Error in automatic territory income processing:",
          error,
        );
      }
    },
    60 * 60 * 1000,
  ); // Check every hour

  return interval;
}
