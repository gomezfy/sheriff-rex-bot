import { readData, writeData } from "./database";
import { GuildMember } from "discord.js";

export interface LevelReward {
  level: number;
  roleId: string;
}

export interface GuildLevelRewards {
  [guildId: string]: LevelReward[];
}

function getLevelRewardsData(): GuildLevelRewards {
  try {
    return readData("level-rewards.json");
  } catch (error) {
    return {};
  }
}

function saveLevelRewardsData(data: GuildLevelRewards): void {
  writeData("level-rewards.json", data);
}

export function addLevelReward(
  guildId: string,
  level: number,
  roleId: string,
): { success: boolean; message: string } {
  const rewardsData = getLevelRewardsData();

  if (!rewardsData[guildId]) {
    rewardsData[guildId] = [];
  }

  const existing = rewardsData[guildId].find((r) => r.level === level);
  if (existing) {
    existing.roleId = roleId;
    saveLevelRewardsData(rewardsData);
    return {
      success: true,
      message: `✅ Recompensa do nível ${level} atualizada!`,
    };
  }

  rewardsData[guildId].push({ level, roleId });
  rewardsData[guildId].sort((a, b) => a.level - b.level);
  saveLevelRewardsData(rewardsData);

  return {
    success: true,
    message: `✅ Recompensa adicionada para o nível ${level}!`,
  };
}

export function removeLevelReward(
  guildId: string,
  level: number,
): { success: boolean; message: string } {
  const rewardsData = getLevelRewardsData();

  if (!rewardsData[guildId]) {
    return {
      success: false,
      message: "❌ Nenhuma recompensa configurada neste servidor.",
    };
  }

  const initialLength = rewardsData[guildId].length;
  rewardsData[guildId] = rewardsData[guildId].filter((r) => r.level !== level);

  if (rewardsData[guildId].length === initialLength) {
    return {
      success: false,
      message: `❌ Nenhuma recompensa encontrada para o nível ${level}.`,
    };
  }

  saveLevelRewardsData(rewardsData);
  return {
    success: true,
    message: `✅ Recompensa do nível ${level} removida!`,
  };
}

export function getLevelRewards(guildId: string): LevelReward[] {
  const rewardsData = getLevelRewardsData();
  return rewardsData[guildId] || [];
}

export async function checkAndGrantRewards(
  member: GuildMember,
  level: number,
): Promise<string[]> {
  const rewards = getLevelRewards(member.guild.id);
  const grantedRoles: string[] = [];

  for (const reward of rewards) {
    if (reward.level === level) {
      try {
        const role = member.guild.roles.cache.get(reward.roleId);
        if (role && !member.roles.cache.has(reward.roleId)) {
          await member.roles.add(role);
          grantedRoles.push(role.name);
        }
      } catch (error) {
        console.error(`Failed to grant role ${reward.roleId}:`, error);
      }
    }
  }

  return grantedRoles;
}
