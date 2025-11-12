import fs from "fs";
import { getDataPath } from "./database";
import path from "path";

const dataDir = getDataPath("data");
const punishmentFile = path.join(dataDir, "punishment.json");

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Ensure punishment file exists
if (!fs.existsSync(punishmentFile)) {
  fs.writeFileSync(punishmentFile, JSON.stringify({}, null, 2));
}

interface Punishment {
  reason: string;
  appliedAt: number;
  expiresAt: number;
  duration: number;
}

function getPunishments(): Record<string, Punishment> {
  const data = fs.readFileSync(punishmentFile, "utf8");
  return JSON.parse(data);
}

function savePunishments(data: Record<string, Punishment>): void {
  fs.writeFileSync(punishmentFile, JSON.stringify(data, null, 2));
}

export function applyPunishment(
  userId: string,
  reason: string = "Captured by Sheriff",
): Punishment {
  const punishments = getPunishments();
  const now = Date.now();
  const duration = 30 * 60 * 1000;
  const expiresAt = now + duration;

  punishments[userId] = {
    reason,
    appliedAt: now,
    expiresAt,
    duration,
  };

  savePunishments(punishments);

  return punishments[userId];
}

export function isPunished(userId: string): Punishment | null {
  const punishments = getPunishments();
  const punishment = punishments[userId];

  if (!punishment) {
    return null;
  }

  const now = Date.now();

  if (now >= punishment.expiresAt) {
    delete punishments[userId];
    savePunishments(punishments);
    return null;
  }

  return punishment;
}

export function getRemainingTime(userId: string): number | null {
  const punishment = isPunished(userId);
  if (!punishment) {
    return null;
  }

  return punishment.expiresAt - Date.now();
}

export function removePunishment(userId: string): boolean {
  const punishments = getPunishments();

  if (!punishments[userId]) {
    return false;
  }

  delete punishments[userId];
  savePunishments(punishments);
  return true;
}

export function formatTime(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}
