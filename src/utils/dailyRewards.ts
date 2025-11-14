import cron from "node-cron";
import { Client, EmbedBuilder } from "discord.js";
import { readData, writeData } from "./database";
import { addItem, getInventory, calculateWeight } from "./inventoryManager";
import {
  getSaloonTokenEmoji,
  getGoldBarEmoji,
  getCheckEmoji,
  getCrossEmoji,
} from "./customEmojis";
import logger from "./consoleLogger";
import { tUser } from "./i18n";

interface DailyRewardState {
  lastGlobalRun?: number;
  userRewards: {
    [userId: string]: {
      lastRewardedAt: number;
    };
  };
}

const REWARD_AMOUNTS = {
  saloon_token: 60,
  gold: 3,
  seal: 15,
};

const REWARD_HOUR = 21;
const REWARD_MINUTE = 0;
const REWARD_TIMEZONE = process.env.DAILY_REWARD_TZ || "America/Sao_Paulo";

let schedulerInstance: any = null;

function loadRewardState(): DailyRewardState {
  const data = readData("daily-rewards.json");
  if (!data || !data.userRewards) {
    return {
      userRewards: {},
    };
  }
  return data;
}

function updateRewardState(state: DailyRewardState): void {
  writeData("daily-rewards.json", state);
}

function getEligibleUserIds(): string[] {
  try {
    const inventoryData = readData("inventory.json");
    if (!inventoryData || typeof inventoryData !== "object") {
      return [];
    }
    return Object.keys(inventoryData);
  } catch (error) {
    logger.error("Failed to get eligible user IDs", error);
    return [];
  }
}

function isSameDay(timestamp1: number, timestamp2: number): boolean {
  const date1 = new Date(timestamp1);
  const date2 = new Date(timestamp2);
  
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

async function grantRewardToUser(
  client: Client,
  userId: string,
  state: DailyRewardState,
): Promise<boolean> {
  try {
    const now = Date.now();
    
    const lastRewarded = state.userRewards[userId]?.lastRewardedAt || 0;
    if (isSameDay(lastRewarded, now)) {
      return false;
    }

    const inventory = getInventory(userId);
    const currentWeight = calculateWeight(inventory);
    const maxWeight = inventory.maxWeight;

    const goldWeight = 3 * 1;
    const sealWeight = 15 * 0.000001;
    const tokenWeight = 60 * 0.00001;
    const totalNeededWeight = goldWeight + sealWeight + tokenWeight;

    if (currentWeight + totalNeededWeight > maxWeight) {
      try {
        const user = await client.users.fetch(userId);
        const embed = new EmbedBuilder()
          .setColor("#FF6B6B")
          .setTitle(tUser(userId, "auto_daily_inventory_full_title"))
          .setDescription(
            tUser(userId, "auto_daily_inventory_full_desc", {
              needed: totalNeededWeight.toFixed(2),
              available: (maxWeight - currentWeight).toFixed(2),
            }),
          )
          .setFooter({
            text: tUser(userId, "auto_daily_inventory_full_footer"),
          })
          .setTimestamp();

        await user.send({ embeds: [embed] });
      } catch (dmError) {
        logger.debug(
          `Could not send inventory full DM to user ${userId}: DMs may be closed`,
        );
      }

      logger.warn(
        `User ${userId} inventory too full for daily rewards (needs ${totalNeededWeight.toFixed(2)}kg, has ${(maxWeight - currentWeight).toFixed(2)}kg available)`,
      );
      return false;
    }

    const tokenResult = await addItem(userId, "saloon_token", REWARD_AMOUNTS.saloon_token);
    const goldResult = await addItem(userId, "gold", REWARD_AMOUNTS.gold);
    const sealResult = await addItem(userId, "seal", REWARD_AMOUNTS.seal);

    if (!tokenResult.success || !goldResult.success || !sealResult.success) {
      logger.error(
        `Failed to add daily rewards to user ${userId}: ${!tokenResult.success ? tokenResult.error : !goldResult.success ? goldResult.error : sealResult.error}`,
      );
      return false;
    }

    try {
      const user = await client.users.fetch(userId);
      const embed = new EmbedBuilder()
        .setColor("#FFD700")
        .setTitle(tUser(userId, "auto_daily_reward_title"))
        .setDescription(
          tUser(userId, "auto_daily_reward_desc", {
            token: getSaloonTokenEmoji(),
            tokenAmount: REWARD_AMOUNTS.saloon_token,
            gold: getGoldBarEmoji(),
            goldAmount: REWARD_AMOUNTS.gold,
            sealAmount: REWARD_AMOUNTS.seal,
          }),
        )
        .setFooter({
          text: tUser(userId, "auto_daily_reward_footer", {
            hour: REWARD_HOUR,
          }),
        })
        .setTimestamp();

      await user.send({ embeds: [embed] });
    } catch (dmError) {
      logger.debug(
        `Could not send daily reward DM to user ${userId}: DMs may be closed`,
      );
    }

    if (!state.userRewards[userId]) {
      state.userRewards[userId] = { lastRewardedAt: now };
    } else {
      state.userRewards[userId].lastRewardedAt = now;
    }

    return true;
  } catch (error) {
    logger.error(`Error granting daily reward to user ${userId}`, error);
    return false;
  }
}

async function runDailyRewards(client: Client): Promise<void> {
  try {
    logger.info("Starting daily rewards distribution...");
    
    const state = loadRewardState();
    const now = Date.now();

    if (state.lastGlobalRun && isSameDay(state.lastGlobalRun, now)) {
      logger.info("Daily rewards already distributed today, skipping");
      return;
    }

    const eligibleUsers = getEligibleUserIds();
    logger.info(`Found ${eligibleUsers.length} eligible users for daily rewards`);

    let successCount = 0;
    let failCount = 0;
    let skippedCount = 0;

    for (const userId of eligibleUsers) {
      const result = await grantRewardToUser(client, userId, state);
      if (result === true) {
        successCount++;
      } else if (result === false && state.userRewards[userId]?.lastRewardedAt && isSameDay(state.userRewards[userId].lastRewardedAt, now)) {
        skippedCount++;
      } else {
        failCount++;
      }

      if ((successCount + failCount + skippedCount) % 10 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    state.lastGlobalRun = now;
    updateRewardState(state);

    logger.success(
      `Daily rewards distribution complete: ${successCount} granted, ${failCount} failed, ${skippedCount} already claimed`,
    );
  } catch (error) {
    logger.error("Error during daily rewards distribution", error);
  }
}

async function checkAndRunBackfill(client: Client): Promise<void> {
  try {
    const state = loadRewardState();
    const now = new Date();
    const currentHour = now.getHours();

    if (!state.lastGlobalRun) {
      logger.info("No previous daily rewards run found");
      
      if (currentHour >= REWARD_HOUR) {
        logger.info("Current time is past reward time, running backfill...");
        await runDailyRewards(client);
      } else {
        logger.info("Current time is before reward time, waiting for scheduled run");
      }
    } else {
      const lastRun = new Date(state.lastGlobalRun);
      if (!isSameDay(lastRun.getTime(), now.getTime()) && currentHour >= REWARD_HOUR) {
        logger.info("Missed daily rewards run detected, running backfill...");
        await runDailyRewards(client);
      }
    }
  } catch (error) {
    logger.error("Error during backfill check", error);
  }
}

export function startDailyRewardsScheduler(client: Client): void {
  if (schedulerInstance) {
    logger.warn("Daily rewards scheduler already running");
    return;
  }

  const cronExpression = `${REWARD_MINUTE} ${REWARD_HOUR} * * *`;
  
  logger.info(
    `Starting daily rewards scheduler: ${cronExpression} (${REWARD_TIMEZONE})`,
  );

  schedulerInstance = cron.schedule(
    cronExpression,
    async () => {
      logger.info("Daily rewards scheduler triggered");
      await runDailyRewards(client);
    },
    {
      timezone: REWARD_TIMEZONE,
    },
  );

  checkAndRunBackfill(client);

  logger.success(
    `Daily rewards scheduler started successfully (runs at ${REWARD_HOUR}:${REWARD_MINUTE.toString().padStart(2, "0")} ${REWARD_TIMEZONE})`,
  );
}

export function stopDailyRewardsScheduler(): void {
  if (schedulerInstance) {
    schedulerInstance.stop();
    schedulerInstance = null;
    logger.info("Daily rewards scheduler stopped");
  }
}
