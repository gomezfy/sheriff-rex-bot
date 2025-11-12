import { readData, writeData } from "./database";
import { Guild, GuildMember } from "discord.js";

export interface MuteData {
  userId: string;
  guildId: string;
  moderatorId: string;
  reason: string;
  mutedAt: number;
  expiresAt: number;
  muteId: string;
}

export interface ActiveMutes {
  [key: string]: MuteData;
}

function getMutesData(): ActiveMutes {
  try {
    return readData("mutes.json");
  } catch (error) {
    return {};
  }
}

function saveMutesData(data: ActiveMutes): void {
  writeData("mutes.json", data);
}

export async function muteUser(
  member: GuildMember,
  moderatorId: string,
  reason: string,
  durationMinutes: number,
): Promise<{ success: boolean; message: string; expiresAt?: number }> {
  try {
    const mutesData = getMutesData();
    const key = `${member.guild.id}_${member.id}`;

    if (mutesData[key] && mutesData[key].expiresAt > Date.now()) {
      return { success: false, message: "❌ Este usuário já está silenciado!" };
    }

    await member.timeout(durationMinutes * 60 * 1000, reason);

    const muteId = `mute_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const expiresAt = Date.now() + durationMinutes * 60 * 1000;

    mutesData[key] = {
      userId: member.id,
      guildId: member.guild.id,
      moderatorId,
      reason,
      mutedAt: Date.now(),
      expiresAt,
      muteId,
    };

    saveMutesData(mutesData);

    return {
      success: true,
      message: `✅ Usuário silenciado por ${durationMinutes} minutos!`,
      expiresAt,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `❌ Erro ao silenciar: ${error.message}`,
    };
  }
}

export async function unmuteUser(
  member: GuildMember,
): Promise<{ success: boolean; message: string }> {
  try {
    const mutesData = getMutesData();
    const key = `${member.guild.id}_${member.id}`;

    await member.timeout(null);

    delete mutesData[key];
    saveMutesData(mutesData);

    return { success: true, message: "✅ Usuário dessilenciado com sucesso!" };
  } catch (error: any) {
    return {
      success: false,
      message: `❌ Erro ao dessilenciar: ${error.message}`,
    };
  }
}

export function checkExpiredMutes(): string[] {
  const mutesData = getMutesData();
  const now = Date.now();
  const expiredKeys: string[] = [];

  for (const [key, mute] of Object.entries(mutesData)) {
    if (mute.expiresAt <= now) {
      expiredKeys.push(key);
      delete mutesData[key];
    }
  }

  if (expiredKeys.length > 0) {
    saveMutesData(mutesData);
  }

  return expiredKeys;
}

export function getActiveMute(
  userId: string,
  guildId: string,
): MuteData | null {
  const mutesData = getMutesData();
  const key = `${guildId}_${userId}`;
  const mute = mutesData[key];

  if (!mute || mute.expiresAt <= Date.now()) {
    return null;
  }

  return mute;
}
