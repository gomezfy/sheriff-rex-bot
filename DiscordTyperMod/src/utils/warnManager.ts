import { readData, writeData } from "./database";

export interface WarnData {
  userId: string;
  guildId: string;
  moderatorId: string;
  reason: string;
  timestamp: number;
  warnId: string;
}

export interface UserWarns {
  [key: string]: WarnData[];
}

function getWarnsData(): UserWarns {
  try {
    return readData("warns.json");
  } catch (error) {
    return {};
  }
}

function saveWarnsData(data: UserWarns): void {
  writeData("warns.json", data);
}

export function addWarn(
  userId: string,
  guildId: string,
  moderatorId: string,
  reason: string,
): { success: boolean; warnId: string; totalWarns: number } {
  const warnsData = getWarnsData();
  const key = `${guildId}_${userId}`;

  if (!warnsData[key]) {
    warnsData[key] = [];
  }

  const warnId = `warn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const newWarn: WarnData = {
    userId,
    guildId,
    moderatorId,
    reason,
    timestamp: Date.now(),
    warnId,
  };

  warnsData[key].push(newWarn);
  saveWarnsData(warnsData);

  return {
    success: true,
    warnId,
    totalWarns: warnsData[key].length,
  };
}

export function removeWarn(
  userId: string,
  guildId: string,
  warnId: string,
): { success: boolean; message: string } {
  const warnsData = getWarnsData();
  const key = `${guildId}_${userId}`;

  if (!warnsData[key] || warnsData[key].length === 0) {
    return { success: false, message: "Este usuário não possui avisos." };
  }

  const initialLength = warnsData[key].length;
  warnsData[key] = warnsData[key].filter((warn) => warn.warnId !== warnId);

  if (warnsData[key].length === initialLength) {
    return { success: false, message: "Aviso não encontrado." };
  }

  saveWarnsData(warnsData);
  return { success: true, message: "Aviso removido com sucesso!" };
}

export function clearWarns(
  userId: string,
  guildId: string,
): { success: boolean; clearedCount: number } {
  const warnsData = getWarnsData();
  const key = `${guildId}_${userId}`;

  const clearedCount = warnsData[key]?.length || 0;
  delete warnsData[key];
  saveWarnsData(warnsData);

  return { success: true, clearedCount };
}

export function getUserWarns(userId: string, guildId: string): WarnData[] {
  const warnsData = getWarnsData();
  const key = `${guildId}_${userId}`;
  return warnsData[key] || [];
}

export function getWarnCount(userId: string, guildId: string): number {
  return getUserWarns(userId, guildId).length;
}
