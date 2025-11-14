import fs from "fs";
import path from "path";
import { cacheManager } from "./cacheManager";
import { getDataPath } from "./database";
import {
  getUserGold,
  getUserSilver,
  addUserGold,
  addUserSilver,
  removeUserGold,
  removeUserSilver,
} from "./dataManager";

const dataDir = getDataPath("data");
const bankFile = path.join(dataDir, "bank.json");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

if (!fs.existsSync(bankFile)) {
  fs.writeFileSync(bankFile, JSON.stringify({}, null, 2));
}

interface BankAccount {
  saloon_tokens: number;
  silver: number;
  lastUpdate: number;
}

export function getBankAccount(userId: string): BankAccount {
  const defaultAccount: BankAccount = {
    saloon_tokens: 0,
    silver: 0,
    lastUpdate: Date.now(),
  };

  const cached = cacheManager.get<BankAccount>("bank", userId);
  if (cached !== null) {
    return cached;
  }

  try {
    const data = fs.readFileSync(bankFile, "utf8");
    const accounts = JSON.parse(data);

    if (!accounts[userId]) {
      cacheManager.set("bank", userId, defaultAccount, true);
      return defaultAccount;
    }

    cacheManager.set("bank", userId, accounts[userId], false);
    return accounts[userId];
  } catch (error) {
    console.error("Error reading bank account:", error);
    cacheManager.set("bank", userId, defaultAccount, true);
    return defaultAccount;
  }
}

export function saveBankAccount(userId: string, account: BankAccount): void {
  account.lastUpdate = Date.now();
  cacheManager.set("bank", userId, account, true);
}

/**
 * Deposit saloon tokens from wallet to bank
 */
export async function depositTokens(
  userId: string,
  amount: number,
): Promise<{ success: boolean; message: string }> {
  if (amount <= 0) {
    return { success: false, message: "Amount must be greater than 0" };
  }

  const walletBalance = getUserGold(userId);
  if (walletBalance < amount) {
    return { success: false, message: "Insufficient balance in wallet" };
  }

  const removeResult = await removeUserGold(userId, amount);
  if (!removeResult.success) {
    return { success: false, message: "Failed to remove tokens from wallet" };
  }

  const account = getBankAccount(userId);
  account.saloon_tokens += amount;
  saveBankAccount(userId, account);

  return { success: true, message: `Deposited ${amount} tokens` };
}

/**
 * Withdraw saloon tokens from bank to wallet
 */
export async function withdrawTokens(
  userId: string,
  amount: number,
): Promise<{ success: boolean; message: string }> {
  if (amount <= 0) {
    return { success: false, message: "Amount must be greater than 0" };
  }

  const account = getBankAccount(userId);
  if (account.saloon_tokens < amount) {
    return { success: false, message: "Insufficient balance in bank" };
  }

  account.saloon_tokens -= amount;
  saveBankAccount(userId, account);

  await addUserGold(userId, amount);

  return { success: true, message: `Withdrawn ${amount} tokens` };
}

/**
 * Deposit silver from wallet to bank
 */
export async function depositSilver(
  userId: string,
  amount: number,
): Promise<{ success: boolean; message: string }> {
  if (amount <= 0) {
    return { success: false, message: "Amount must be greater than 0" };
  }

  const walletBalance = getUserSilver(userId);
  if (walletBalance < amount) {
    return { success: false, message: "Insufficient balance in wallet" };
  }

  const removeResult = await removeUserSilver(userId, amount);
  if (!removeResult.success) {
    return { success: false, message: "Failed to remove silver from wallet" };
  }

  const account = getBankAccount(userId);
  account.silver += amount;
  saveBankAccount(userId, account);

  return { success: true, message: `Deposited ${amount} silver` };
}

/**
 * Withdraw silver from bank to wallet
 */
export async function withdrawSilver(
  userId: string,
  amount: number,
): Promise<{ success: boolean; message: string }> {
  if (amount <= 0) {
    return { success: false, message: "Amount must be greater than 0" };
  }

  const account = getBankAccount(userId);
  if (account.silver < amount) {
    return { success: false, message: "Insufficient balance in bank" };
  }

  account.silver -= amount;
  saveBankAccount(userId, account);

  await addUserSilver(userId, amount);

  return { success: true, message: `Withdrawn ${amount} silver` };
}

/**
 * Get total wealth (wallet + bank)
 */
export function getTotalWealth(userId: string): {
  tokens: number;
  silver: number;
  total: number;
} {
  const walletTokens = getUserGold(userId);
  const walletSilver = getUserSilver(userId);
  const account = getBankAccount(userId);

  const totalTokens = walletTokens + account.saloon_tokens;
  const totalSilver = walletSilver + account.silver;

  return {
    tokens: totalTokens,
    silver: totalSilver,
    total: totalTokens + totalSilver,
  };
}
