import { writeData, readData } from "./database";

interface UserXP {
  xp: number;
  level: number;
  lastMessageTimestamp: number;
}

const COOLDOWN = 60 * 1000; // 60 seconds

function getXpData(): Record<string, UserXP> {
  try {
    return readData("xp.json");
  } catch (error) {
    return {};
  }
}

function saveXpData(data: Record<string, UserXP>): void {
  writeData("xp.json", data);
}

export function getXpForLevel(level: number): number {
  return 5 * level ** 2 + 50 * level + 100;
}

export function getUserXp(userId: string): UserXP {
  const xpData = getXpData();
  if (!xpData[userId]) {
    return { xp: 0, level: 0, lastMessageTimestamp: 0 };
  }
  return xpData[userId];
}

export function addXp(
  userId: string,
  amount: number,
  bypassCooldown: boolean = false,
): {
  leveledUp: boolean;
  oldLevel: number;
  newLevel: number;
  granted: boolean;
} {
  const xpData = getXpData();
  const userData = getUserXp(userId);

  const now = Date.now();
  if (!bypassCooldown && now - userData.lastMessageTimestamp < COOLDOWN) {
    return {
      leveledUp: false,
      oldLevel: userData.level,
      newLevel: userData.level,
      granted: false,
    };
  }

  userData.xp += amount;
  userData.lastMessageTimestamp = now;
  const oldLevel = userData.level;

  let xpForNextLevel = getXpForLevel(userData.level);
  let leveledUp = false;

  while (userData.xp >= xpForNextLevel) {
    userData.level++;
    userData.xp -= xpForNextLevel;
    xpForNextLevel = getXpForLevel(userData.level);
    leveledUp = true;
  }

  xpData[userId] = userData;
  saveXpData(xpData);

  return { leveledUp, oldLevel, newLevel: userData.level, granted: true };
}

export function getXpLeaderboard(
  limit: number = 10,
): { userId: string; xp: number; level: number }[] {
  const xpData = getXpData();
  const users = Object.entries(xpData).map(([userId, data]) => ({
    userId,
    ...data,
  }));

  users.sort((a, b) => {
    if (a.level !== b.level) {
      return b.level - a.level;
    }
    return b.xp - a.xp;
  });

  return users.slice(0, limit);
}
