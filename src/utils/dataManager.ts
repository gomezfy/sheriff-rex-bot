import fs from "fs";
import path from "path";
import { getItem, addItem, removeItem, transferItem } from "./inventoryManager";
import { getDataPath } from "./database";
import { transactionLock } from "./transactionLock";

const dataDir = getDataPath("data");
const economyFile = path.join(dataDir, "economy.json");
const bountiesFile = path.join(dataDir, "bounties.json");
const welcomeFile = path.join(dataDir, "welcome.json");
const logsFile = path.join(dataDir, "logs.json");
const wantedFile = path.join(dataDir, "wanted.json");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

if (!fs.existsSync(economyFile)) {
  fs.writeFileSync(economyFile, JSON.stringify({}, null, 2));
}

if (!fs.existsSync(bountiesFile)) {
  fs.writeFileSync(bountiesFile, JSON.stringify([], null, 2));
}

if (!fs.existsSync(welcomeFile)) {
  fs.writeFileSync(welcomeFile, JSON.stringify({}, null, 2));
}

if (!fs.existsSync(logsFile)) {
  fs.writeFileSync(logsFile, JSON.stringify({}, null, 2));
}

if (!fs.existsSync(wantedFile)) {
  fs.writeFileSync(wantedFile, JSON.stringify({}, null, 2));
}

export function getUserGold(userId: string): number {
  return getItem(userId, "saloon_token");
}

export async function setUserGold(userId: string, amount: number): Promise<any> {
  const current = getUserGold(userId);
  const diff = amount - current;

  if (diff > 0) {
    return await addItem(userId, "saloon_token", diff);
  } else if (diff < 0) {
    return await removeItem(userId, "saloon_token", Math.abs(diff));
  }

  return { success: true, totalQuantity: current };
}

export async function addUserGold(userId: string, amount: number): Promise<any> {
  return await addItem(userId, "saloon_token", amount);
}

export async function removeUserGold(userId: string, amount: number): Promise<any> {
  return await removeItem(userId, "saloon_token", amount);
}

export async function transferGold(
  fromUserId: string,
  toUserId: string,
  amount: number,
): Promise<any> {
  return await transferItem(fromUserId, toUserId, "saloon_token", amount);
}

export function getUserSilver(userId: string): number {
  return getItem(userId, "silver");
}

export async function setUserSilver(userId: string, amount: number): Promise<any> {
  const current = getUserSilver(userId);
  const diff = amount - current;

  if (diff > 0) {
    return await addItem(userId, "silver", diff);
  } else if (diff < 0) {
    return await removeItem(userId, "silver", Math.abs(diff));
  }

  return { success: true, totalQuantity: current };
}

export async function addUserSilver(userId: string, amount: number): Promise<any> {
  return await addItem(userId, "silver", amount);
}

export async function removeUserSilver(userId: string, amount: number): Promise<any> {
  return await removeItem(userId, "silver", amount);
}

export async function transferSilver(
  fromUserId: string,
  toUserId: string,
  amount: number,
): Promise<any> {
  return await transferItem(fromUserId, toUserId, "silver", amount);
}

function getBounties(): any[] {
  const data = fs.readFileSync(bountiesFile, "utf8");
  return JSON.parse(data);
}

function saveBounties(data: any[]): void {
  fs.writeFileSync(bountiesFile, JSON.stringify(data, null, 2));
}

export function addBounty(
  targetId: string,
  targetTag: string,
  posterId: string,
  posterTag: string,
  amount: number,
): any[] {
  const bounties = getBounties();

  const existingIndex = bounties.findIndex((b: any) => b.targetId === targetId);

  if (existingIndex !== -1) {
    const existingBounty = bounties[existingIndex];

    const contributorIndex = existingBounty.contributors.findIndex(
      (c: any) => c.id === posterId,
    );

    if (contributorIndex !== -1) {
      existingBounty.contributors[contributorIndex].amount += amount;
    } else {
      existingBounty.contributors.push({
        id: posterId,
        tag: posterTag,
        amount: amount,
      });
    }

    existingBounty.totalAmount += amount;
    existingBounty.updatedAt = Date.now();

    bounties[existingIndex] = existingBounty;
  } else {
    bounties.push({
      targetId,
      targetTag,
      totalAmount: amount,
      contributors: [
        {
          id: posterId,
          tag: posterTag,
          amount: amount,
        },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }

  saveBounties(bounties);
  return bounties;
}

export function getBountyByTarget(targetId: string): any {
  const bounties = getBounties();
  return bounties.find((b: any) => b.targetId === targetId);
}

export function removeBounty(targetId: string): any[] {
  const bounties = getBounties();
  const filtered = bounties.filter((b: any) => b.targetId !== targetId);
  saveBounties(filtered);
  return filtered;
}

export function getAllBounties(): any[] {
  return getBounties();
}

export function removeContribution(
  targetId: string,
  contributorId: string,
  amount: number,
): boolean {
  const bounties = getBounties();
  const bountyIndex = bounties.findIndex((b: any) => b.targetId === targetId);

  if (bountyIndex === -1) {
    return false;
  }

  const bounty = bounties[bountyIndex];
  const contributorIndex = bounty.contributors.findIndex(
    (c: any) => c.id === contributorId,
  );

  if (contributorIndex === -1) {
    return false;
  }

  bounty.contributors[contributorIndex].amount -= amount;
  bounty.totalAmount -= amount;

  if (bounty.contributors[contributorIndex].amount <= 0) {
    bounty.contributors.splice(contributorIndex, 1);
  }

  if (bounty.contributors.length === 0) {
    bounties.splice(bountyIndex, 1);
  } else {
    bounty.updatedAt = Date.now();
    bounties[bountyIndex] = bounty;
  }

  saveBounties(bounties);
  return true;
}

export function getWelcomeConfig(guildId: string): any {
  const data = fs.readFileSync(welcomeFile, "utf8");
  const welcomeData = JSON.parse(data);
  return welcomeData[guildId] || null;
}

export function setWelcomeConfig(guildId: string, config: any): any {
  const data = fs.readFileSync(welcomeFile, "utf8");
  const welcomeData = JSON.parse(data);

  welcomeData[guildId] = {
    channelId: config.channelId,
    message: config.message,
    image: config.image || null,
    enabled: config.enabled !== false,
    updatedAt: Date.now(),
  };

  fs.writeFileSync(welcomeFile, JSON.stringify(welcomeData, null, 2));
  return welcomeData[guildId];
}

export function removeWelcomeConfig(guildId: string): boolean {
  const data = fs.readFileSync(welcomeFile, "utf8");
  const welcomeData = JSON.parse(data);

  delete welcomeData[guildId];

  fs.writeFileSync(welcomeFile, JSON.stringify(welcomeData, null, 2));
  return true;
}

export function getLogConfig(guildId: string): any {
  const data = fs.readFileSync(logsFile, "utf8");
  const logsData = JSON.parse(data);
  return logsData[guildId] || null;
}

export function setLogConfig(guildId: string, config: any): any {
  const data = fs.readFileSync(logsFile, "utf8");
  const logsData = JSON.parse(data);

  logsData[guildId] = {
    channelId: config.channelId,
    enabled: config.enabled !== false,
    types: config.types || [
      "command",
      "error",
      "welcome",
      "leave",
      "economy",
      "bounty",
      "mining",
      "gambling",
      "admin",
    ],
    updatedAt: Date.now(),
  };

  fs.writeFileSync(logsFile, JSON.stringify(logsData, null, 2));
  return logsData[guildId];
}

export function removeLogConfig(guildId: string): boolean {
  const data = fs.readFileSync(logsFile, "utf8");
  const logsData = JSON.parse(data);

  delete logsData[guildId];

  fs.writeFileSync(logsFile, JSON.stringify(logsData, null, 2));
  return true;
}

export function getWantedConfig(guildId: string): any {
  const data = fs.readFileSync(wantedFile, "utf8");
  const wantedData = JSON.parse(data);
  return wantedData[guildId] || null;
}

export function setWantedConfig(guildId: string, config: any): boolean {
  const data = fs.readFileSync(wantedFile, "utf8");
  const wantedData = JSON.parse(data);

  wantedData[guildId] = {
    channelId: config.channelId,
    enabled: config.enabled !== false,
    updatedAt: Date.now(),
  };

  fs.writeFileSync(wantedFile, JSON.stringify(wantedData, null, 2));
  return true;
}

export function removeWantedConfig(guildId: string): boolean {
  const data = fs.readFileSync(wantedFile, "utf8");
  const wantedData = JSON.parse(data);

  delete wantedData[guildId];

  fs.writeFileSync(wantedFile, JSON.stringify(wantedData, null, 2));
  return true;
}
