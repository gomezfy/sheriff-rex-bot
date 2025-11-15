import crypto from "crypto";
import { db } from "../../server/db";
import { users, rexBuckTransactions } from "../../shared/schema";
import { eq, desc, gt } from "drizzle-orm";
import type { NeonDatabase } from "drizzle-orm/neon-serverless";

interface RexBuckResult {
  success: boolean;
  newBalance: number;
  transactionId: string;
  error?: string;
}

interface UserRexBucksData {
  balance: number;
  totalTransactions: number;
}

export async function getRexBuckBalance(userId: string): Promise<number> {
  try {
    const user = await db.select({ rexBucks: users.rexBucks }).from(users).where(eq(users.userId, userId)).limit(1);

    return user[0]?.rexBucks ?? 0;
  } catch (error) {
    console.error(`Error getting RexBuck balance for ${userId}:`, error);
    return 0;
  }
}

export async function getUserRexBuckData(userId: string): Promise<UserRexBucksData> {
  try {
    const user = await db.select({ rexBucks: users.rexBucks }).from(users).where(eq(users.userId, userId)).limit(1);

    const transactions = await db
      .select()
      .from(rexBuckTransactions)
      .where(eq(rexBuckTransactions.userId, userId));

    return {
      balance: user[0]?.rexBucks ?? 0,
      totalTransactions: transactions.length,
    };
  } catch (error) {
    console.error(`Error getting RexBuck data for ${userId}:`, error);
    return { balance: 0, totalTransactions: 0 };
  }
}

export async function addRexBucks(
  userId: string,
  username: string,
  amount: number,
  type: "redeem" | "purchase" | "admin_add",
  redemptionCode?: string,
  metadata?: Record<string, any>,
): Promise<RexBuckResult> {
  if (amount <= 0) {
    return {
      success: false,
      newBalance: 0,
      transactionId: "",
      error: "Amount must be positive",
    };
  }

  try {
    return await db.transaction(async (tx: any) => {
      const existingUser = await tx
        .select({ userId: users.userId, username: users.username, rexBucks: users.rexBucks })
        .from(users)
        .where(eq(users.userId, userId))
        .limit(1)
        .for('update');

      let balanceBefore = 0;

      if (existingUser.length === 0) {
        const [newUser] = await tx.insert(users).values({
          userId,
          username,
          rexBucks: amount,
        }).returning();
        balanceBefore = 0;
      } else {
        balanceBefore = existingUser[0].rexBucks;
        await tx
          .update(users)
          .set({ rexBucks: balanceBefore + amount })
          .where(eq(users.userId, userId));
      }

      const balanceAfter = balanceBefore + amount;

      const transactionId = crypto.randomBytes(16).toString("hex");

      await tx.insert(rexBuckTransactions).values({
        id: transactionId,
        userId,
        amount,
        type,
        redemptionCode,
        balanceBefore,
        balanceAfter,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null,
      });

      console.log(
        `💵 RexBucks added: +${amount} to user ${userId} (${balanceBefore} → ${balanceAfter})`,
      );

      return {
        success: true,
        newBalance: balanceAfter,
        transactionId,
      };
    });
  } catch (error) {
    console.error(`Error adding RexBucks for ${userId}:`, error);
    return {
      success: false,
      newBalance: 0,
      transactionId: "",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function removeRexBucks(
  userId: string,
  amount: number,
  metadata?: Record<string, any>,
): Promise<RexBuckResult> {
  if (amount <= 0) {
    return {
      success: false,
      newBalance: 0,
      transactionId: "",
      error: "Amount must be positive",
    };
  }

  try {
    return await db.transaction(async (tx: any) => {
      const user = await tx
        .select({ rexBucks: users.rexBucks })
        .from(users)
        .where(eq(users.userId, userId))
        .limit(1)
        .for('update');

      if (user.length === 0 || user[0].rexBucks < amount) {
        throw new Error("Insufficient RexBucks balance");
      }

      const balanceBefore = user[0].rexBucks;
      const balanceAfter = balanceBefore - amount;

      await tx
        .update(users)
        .set({ rexBucks: balanceAfter })
        .where(eq(users.userId, userId));

      const transactionId = crypto.randomBytes(16).toString("hex");

      await tx.insert(rexBuckTransactions).values({
        id: transactionId,
        userId,
        amount: -amount,
        type: "admin_remove",
        balanceBefore,
        balanceAfter,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null,
      });

      console.log(
        `💵 RexBucks removed: -${amount} from user ${userId} (${balanceBefore} → ${balanceAfter})`,
      );

      return {
        success: true,
        newBalance: balanceAfter,
        transactionId,
      };
    });
  } catch (error) {
    console.error(`Error removing RexBucks from ${userId}:`, error);
    return {
      success: false,
      newBalance: 0,
      transactionId: "",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getUserTransactionHistory(userId: string, limit = 10) {
  try {
    const transactions = await db
      .select()
      .from(rexBuckTransactions)
      .where(eq(rexBuckTransactions.userId, userId))
      .orderBy(desc(rexBuckTransactions.timestamp))
      .limit(limit);

    return transactions;
  } catch (error) {
    console.error(`Error getting transaction history for ${userId}:`, error);
    return [];
  }
}

export async function getAllTransactions(limit = 100) {
  try {
    return await db.select().from(rexBuckTransactions).orderBy(desc(rexBuckTransactions.timestamp)).limit(limit);
  } catch (error) {
    console.error("Error getting all transactions:", error);
    return [];
  }
}

export async function getTransactionById(transactionId: string) {
  try {
    const tx = await db
      .select()
      .from(rexBuckTransactions)
      .where(eq(rexBuckTransactions.id, transactionId))
      .limit(1);

    return tx[0] || null;
  } catch (error) {
    console.error(`Error getting transaction ${transactionId}:`, error);
    return null;
  }
}

export async function getRexBucksLeaderboard(limit = 10) {
  try {
    return await db
      .select({
        userId: users.userId,
        username: users.username,
        balance: users.rexBucks,
      })
      .from(users)
      .where(gt(users.rexBucks, 0))
      .orderBy(desc(users.rexBucks))
      .limit(limit);
  } catch (error) {
    console.error("Error getting RexBucks leaderboard:", error);
    return [];
  }
}
