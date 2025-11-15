import { readData, writeData } from "./database";
import crypto from "crypto";

interface RexBuckTransaction {
  id: string;
  userId: string;
  amount: number;
  type: "redeem" | "purchase" | "admin_add" | "admin_remove";
  redemptionCode?: string;
  balanceBefore: number;
  balanceAfter: number;
  metadata?: Record<string, any>;
  timestamp: number;
}

interface UserRexBucks {
  userId: string;
  balance: number;
  totalEarned: number;
  totalSpent: number;
  lastUpdate: number;
}

const TRANSACTIONS_FILE = "rexbuck-transactions.json";
const BALANCES_FILE = "rexbuck-balances.json";

export function loadTransactions(): Record<string, RexBuckTransaction> {
  try {
    return readData(TRANSACTIONS_FILE);
  } catch (error) {
    console.error("Error loading RexBuck transactions:", error);
    return {};
  }
}

export function saveTransactions(data: Record<string, RexBuckTransaction>): void {
  writeData(TRANSACTIONS_FILE, data);
}

export function loadBalances(): Record<string, UserRexBucks> {
  try {
    return readData(BALANCES_FILE);
  } catch (error) {
    console.error("Error loading RexBuck balances:", error);
    return {};
  }
}

export function saveBalances(data: Record<string, UserRexBucks>): void {
  writeData(BALANCES_FILE, data);
}

export function getRexBuckBalance(userId: string): number {
  const balances = loadBalances();
  return balances[userId]?.balance || 0;
}

export function getUserRexBuckData(userId: string): UserRexBucks {
  const balances = loadBalances();
  return (
    balances[userId] || {
      userId,
      balance: 0,
      totalEarned: 0,
      totalSpent: 0,
      lastUpdate: Date.now(),
    }
  );
}

export function addRexBucks(
  userId: string,
  amount: number,
  type: "redeem" | "purchase" | "admin_add",
  redemptionCode?: string,
  metadata?: Record<string, any>,
): { success: boolean; newBalance: number; transactionId: string } {
  if (amount <= 0) {
    throw new Error("Amount must be positive");
  }

  const balances = loadBalances();
  const transactions = loadTransactions();

  const userData = getUserRexBuckData(userId);
  const balanceBefore = userData.balance;
  const balanceAfter = balanceBefore + amount;

  const transactionId = crypto.randomBytes(16).toString("hex");
  const transaction: RexBuckTransaction = {
    id: transactionId,
    userId,
    amount,
    type,
    redemptionCode,
    balanceBefore,
    balanceAfter,
    metadata,
    timestamp: Date.now(),
  };

  userData.balance = balanceAfter;
  userData.totalEarned += amount;
  userData.lastUpdate = Date.now();

  balances[userId] = userData;
  transactions[transactionId] = transaction;

  saveBalances(balances);
  saveTransactions(transactions);

  console.log(
    `💵 RexBucks added: ${amount} to user ${userId} (${balanceBefore} → ${balanceAfter})`,
  );

  return {
    success: true,
    newBalance: balanceAfter,
    transactionId,
  };
}

export function removeRexBucks(
  userId: string,
  amount: number,
  metadata?: Record<string, any>,
): { success: boolean; newBalance: number; transactionId: string; error?: string } {
  if (amount <= 0) {
    return { success: false, newBalance: 0, transactionId: "", error: "Amount must be positive" };
  }

  const balances = loadBalances();
  const transactions = loadTransactions();

  const userData = getUserRexBuckData(userId);
  const balanceBefore = userData.balance;

  if (balanceBefore < amount) {
    return {
      success: false,
      newBalance: balanceBefore,
      transactionId: "",
      error: "Insufficient RexBucks balance",
    };
  }

  const balanceAfter = balanceBefore - amount;

  const transactionId = crypto.randomBytes(16).toString("hex");
  const transaction: RexBuckTransaction = {
    id: transactionId,
    userId,
    amount: -amount,
    type: "admin_remove",
    balanceBefore,
    balanceAfter,
    metadata,
    timestamp: Date.now(),
  };

  userData.balance = balanceAfter;
  userData.totalSpent += amount;
  userData.lastUpdate = Date.now();

  balances[userId] = userData;
  transactions[transactionId] = transaction;

  saveBalances(balances);
  saveTransactions(transactions);

  console.log(
    `💵 RexBucks removed: ${amount} from user ${userId} (${balanceBefore} → ${balanceAfter})`,
  );

  return {
    success: true,
    newBalance: balanceAfter,
    transactionId,
  };
}

export function getUserTransactionHistory(
  userId: string,
  limit = 10,
): RexBuckTransaction[] {
  const transactions = loadTransactions();
  return Object.values(transactions)
    .filter((t) => t.userId === userId)
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
}

export function getAllTransactions(): RexBuckTransaction[] {
  const transactions = loadTransactions();
  return Object.values(transactions).sort((a, b) => b.timestamp - a.timestamp);
}

export function getTransactionById(transactionId: string): RexBuckTransaction | null {
  const transactions = loadTransactions();
  return transactions[transactionId] || null;
}

export function getRexBucksLeaderboard(limit = 10): UserRexBucks[] {
  const balances = loadBalances();
  return Object.values(balances)
    .sort((a, b) => b.balance - a.balance)
    .slice(0, limit);
}
