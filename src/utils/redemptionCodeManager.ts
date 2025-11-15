import { db } from "../../server/db";
import { redemptionCodes, users, inventoryItems } from "../../shared/schema";
import { eq, and, sql } from "drizzle-orm";
import type { RedemptionCode, InsertRedemptionCode } from "../../shared/schema";
import crypto from "crypto";

export interface RedemptionResult {
  success: boolean;
  code?: RedemptionCode;
  error?: string;
  errorType?: "NOT_FOUND" | "ALREADY_REDEEMED" | "INVALID_CODE" | "UNKNOWN" | "INSUFFICIENT_BALANCE" | "UPGRADE_NOT_NEEDED";
  currentInventoryCapacity?: number;
  targetInventoryCapacity?: number;
}

export interface CreateCodeResult {
  success: boolean;
  code?: string;
  error?: string;
}

export async function createRedemptionCode(
  codeData: InsertRedemptionCode,
): Promise<CreateCodeResult> {
  try {
    const [newCode] = await db
      .insert(redemptionCodes)
      .values(codeData)
      .returning();

    console.log(`✅ Redemption code created: ${newCode.code}`);

    return {
      success: true,
      code: newCode.code,
    };
  } catch (error) {
    console.error("Error creating redemption code:", error);
    
    if (error instanceof Error && error.message.includes("unique constraint")) {
      return {
        success: false,
        error: "Code already exists",
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function redeemCodeAndApplyRewards(
  code: string,
  userId: string,
  username: string,
): Promise<RedemptionResult> {
  try {
    return await db.transaction(async (tx: any) => {
      const [redemption] = await tx
        .select()
        .from(redemptionCodes)
        .where(eq(redemptionCodes.code, code))
        .limit(1)
        .for("update");

      if (!redemption) {
        return {
          success: false,
          error: "Invalid redemption code",
          errorType: "NOT_FOUND" as const,
        };
      }

      if (redemption.redeemed) {
        return {
          success: false,
          code: redemption,
          error: "Code already redeemed",
          errorType: "ALREADY_REDEEMED" as const,
        };
      }

      const [existingUser] = await tx
        .select()
        .from(users)
        .where(eq(users.userId, userId))
        .limit(1)
        .for("update");

      if (!existingUser) {
        await tx.insert(users).values({
          userId,
          username,
          rexBucks: redemption.rexBucks || 0,
          saloonTokens: redemption.tokens || 0,
          silver: redemption.coins || 0,
          backpackCapacity: redemption.backpack || 100,
          isVip: redemption.vip || false,
          customBackground: redemption.background ? 'premium' : null,
        });
      } else {
        if (redemption.backpack && existingUser.backpackCapacity >= redemption.backpack) {
          return {
            success: false,
            error: "Backpack upgrade not needed",
            errorType: "UPGRADE_NOT_NEEDED" as const,
            currentInventoryCapacity: existingUser.backpackCapacity,
            targetInventoryCapacity: redemption.backpack,
          };
        }

        const updateData: any = {
          rexBucks: existingUser.rexBucks + (redemption.rexBucks || 0),
          saloonTokens: existingUser.saloonTokens + (redemption.tokens || 0),
          silver: existingUser.silver + (redemption.coins || 0),
          backpackCapacity: redemption.backpack || existingUser.backpackCapacity,
        };

        if (redemption.vip) {
          updateData.isVip = true;
        }

        if (redemption.background) {
          updateData.customBackground = 'premium';
        }

        await tx
          .update(users)
          .set(updateData)
          .where(eq(users.userId, userId));
      }

      if (redemption.tokens > 0) {
        await tx.execute(sql`
          INSERT INTO inventory_items (id, user_id, item_id, name, quantity, weight, value, type)
          VALUES (${crypto.randomBytes(8).toString("hex")}, ${userId}, 'saloon_token', 'Saloon Token', ${redemption.tokens}, 0.01, 10, 'currency')
          ON CONFLICT (user_id, item_id) 
          DO UPDATE SET quantity = inventory_items.quantity + ${redemption.tokens}
        `);
      }

      if (redemption.coins > 0) {
        await tx.execute(sql`
          INSERT INTO inventory_items (id, user_id, item_id, name, quantity, weight, value, type)
          VALUES (${crypto.randomBytes(8).toString("hex")}, ${userId}, 'silver', 'Silver Coins', ${redemption.coins}, 0.01, 1, 'currency')
          ON CONFLICT (user_id, item_id)
          DO UPDATE SET quantity = inventory_items.quantity + ${redemption.coins}
        `);
      }

      const [updatedCode] = await tx
        .update(redemptionCodes)
        .set({
          redeemed: true,
          redeemedBy: userId,
          redeemedAt: new Date(),
        })
        .where(eq(redemptionCodes.code, code))
        .returning();

      console.log(
        `✅ Code redeemed atomically: ${code} by user ${userId} (${username})`,
      );

      return {
        success: true,
        code: updatedCode,
      };
    });
  } catch (error) {
    console.error(`Error redeeming code ${code}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      errorType: "UNKNOWN" as const,
    };
  }
}

export async function getRedemptionCode(code: string): Promise<RedemptionCode | null> {
  try {
    const [redemption] = await db
      .select()
      .from(redemptionCodes)
      .where(eq(redemptionCodes.code, code))
      .limit(1);

    return redemption || null;
  } catch (error) {
    console.error(`Error getting redemption code ${code}:`, error);
    return null;
  }
}

export async function getAllRedemptionCodes(): Promise<RedemptionCode[]> {
  try {
    return await db.select().from(redemptionCodes);
  } catch (error) {
    console.error("Error getting all redemption codes:", error);
    return [];
  }
}

export async function deleteRedemptionCode(code: string): Promise<boolean> {
  try {
    await db.delete(redemptionCodes).where(eq(redemptionCodes.code, code));
    console.log(`🗑️  Redemption code deleted: ${code}`);
    return true;
  } catch (error) {
    console.error(`Error deleting redemption code ${code}:`, error);
    return false;
  }
}
