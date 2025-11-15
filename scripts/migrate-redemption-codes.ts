import * as fs from "fs";
import * as path from "path";
import { db } from "../server/db";
import { redemptionCodes } from "../shared/schema";

interface OldRedemptionCode {
  productId: string;
  productName: string;
  tokens: number;
  coins: number;
  vip: boolean;
  background: boolean;
  backpack?: number | boolean;
  rexBucks?: number;
  createdAt: number;
  createdBy: string;
  redeemed: boolean;
  redeemedBy?: string;
  redeemedAt?: number;
}

async function migrateRedemptionCodes() {
  console.log("🔄 Starting redemption codes migration...");

  const jsonPath = path.join(
    process.cwd(),
    "data",
    "redemption-codes.json",
  );

  if (!fs.existsSync(jsonPath)) {
    console.log("⚠️  No redemption-codes.json file found. Skipping migration.");
    return;
  }

  try {
    const fileData = fs.readFileSync(jsonPath, "utf-8");
    const oldCodes: Record<string, OldRedemptionCode> = JSON.parse(fileData);

    const codeEntries = Object.entries(oldCodes);

    if (codeEntries.length === 0) {
      console.log("✅ No codes to migrate.");
      return;
    }

    console.log(`📊 Found ${codeEntries.length} codes to migrate.`);

    let migrated = 0;
    let skipped = 0;

    for (const [code, data] of codeEntries) {
      try {
        await db.insert(redemptionCodes).values({
          code,
          productId: data.productId,
          productName: data.productName,
          tokens: data.tokens || 0,
          coins: data.coins || 0,
          rexBucks: data.rexBucks || 0,
          vip: data.vip || false,
          background: data.background || false,
          backpack: typeof data.backpack === "number" ? data.backpack : null,
          createdAt: new Date(data.createdAt),
          createdBy: data.createdBy,
          redeemed: data.redeemed || false,
          redeemedBy: data.redeemedBy || null,
          redeemedAt: data.redeemedAt ? new Date(data.redeemedAt) : null,
        });

        migrated++;
        console.log(`✅ Migrated code: ${code}`);
      } catch (error) {
        if (error instanceof Error && error.message.includes("unique constraint")) {
          skipped++;
          console.log(`⏭️  Skipped (already exists): ${code}`);
        } else {
          console.error(`❌ Error migrating code ${code}:`, error);
        }
      }
    }

    console.log("\n📊 Migration Summary:");
    console.log(`   ✅ Migrated: ${migrated}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   📁 Total: ${codeEntries.length}`);

    const backupPath = jsonPath + ".backup";
    fs.copyFileSync(jsonPath, backupPath);
    console.log(`\n💾 Backup created: ${backupPath}`);
    console.log("✅ Migration complete!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
}

migrateRedemptionCodes()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
