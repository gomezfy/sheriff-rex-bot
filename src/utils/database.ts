import fs from "fs";
import path from "path";
import crypto from "crypto";
import { isValidDataFilename } from "./security";
import { measureDatabaseOperation } from "./performance";

/**
 * Get the canonical data path - ALWAYS uses src/data to prevent data duplication
 * This ensures data consistency across all environments (development and production)
 *
 * In production, src/data should be copied to the deployment location during build/deploy
 * @param {...any} segments
 */
export function getDataPath(...segments: string[]): string {
  // Always use src/data as the single source of truth
  // This prevents data duplication and ensures consistency
  if (segments[0] === "data") {
    return path.join(process.cwd(), "src", ...segments);
  }

  // If path doesn't start with 'data', assume it's already absolute or relative to cwd
  return path.join(process.cwd(), ...segments);
}

// Determine data directory based on environment
const dataDir = getDataPath("data");

// In-memory cache for frequently accessed data
const dataCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 30000; // 30 seconds cache (increased for better performance)

// Cleanup old cache entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of dataCache.entries()) {
    if (now - value.timestamp > CACHE_TTL * 2) {
      dataCache.delete(key);
    }
  }
}, 60000); // Cleanup every minute

export function initializeDatabase(): void {
  console.log(`📁 Data directory: ${dataDir}`);

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log("✅ Pasta data/ criada!");
  }

  const requiredFiles = [
    "daily.json",
    "economy.json",
    "economy.backup.json",
    "profiles.json",
    "xp.json",
    "inventory.json",
    "wanted.json",
    "welcome.json",
    "logs.json",
    "bounties.json",
    "backgrounds.json",
    "punishment.json",
    "mining.json",
    "warns.json",
    "mutes.json",
    "mod-logs.json",
    "level-rewards.json",
    "redemption-codes.json",
    "territories.json",
    "territory-income.json",
    "expedition.json",
  ];

  let created = 0;
  requiredFiles.forEach((filename) => {
    const filePath = path.join(dataDir, filename);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, "{}", "utf8");
      created++;
    }
  });

  if (created > 0) {
    console.log(`✅ Criados ${created} arquivos de dados!`);
  }
  console.log("✅ Sistema de dados pronto!");
}

export function readData(filename: string): any {
  const startTime = Date.now();

  // Security: Validate filename to prevent path traversal
  if (!isValidDataFilename(filename)) {
    console.error(`🚨 SECURITY: Invalid filename attempted: ${filename}`);
    throw new Error(`Invalid filename: ${filename}`);
  }

  // Check cache first
  const cached = dataCache.get(filename);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    measureDatabaseOperation(`read_${filename}_cached`, startTime);
    return cached.data;
  }

  const filePath = path.join(dataDir, filename);

  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Auto-restore from backup if main file is missing but backup exists
    if (!fs.existsSync(filePath) && fs.existsSync(path.join(dataDir, `${filename}.backup`))) {
      try {
        const backupPath = path.join(dataDir, `${filename}.backup`);
        const backupData = fs.readFileSync(backupPath, "utf8");
        JSON.parse(backupData); // Verify it's valid JSON
        fs.copyFileSync(backupPath, filePath);
        console.log(`✅ Auto-restored ${filename} from backup`);
      } catch (restoreError) {
        console.error(`⚠️  Failed to restore ${filename} from backup:`, restoreError);
      }
    }

    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, "{}", "utf8");
      const emptyData = {};
      dataCache.set(filename, { data: emptyData, timestamp: Date.now() });
      measureDatabaseOperation(`read_${filename}`, startTime);
      return emptyData;
    }

    const data = fs.readFileSync(filePath, "utf8");
    if (!data.trim()) {
      const emptyData = {};
      dataCache.set(filename, { data: emptyData, timestamp: Date.now() });
      measureDatabaseOperation(`read_${filename}`, startTime);
      return emptyData;
    }

    const parsed = JSON.parse(data);

    // Cache the result
    dataCache.set(filename, { data: parsed, timestamp: Date.now() });

    measureDatabaseOperation(`read_${filename}`, startTime);
    return parsed;
  } catch (error: any) {
    console.error(`❌ Erro ao ler ${filename}:`, error.message);
    measureDatabaseOperation(`read_${filename}_error`, startTime);
    return {};
  }
}

export function writeData(filename: string, data: any): boolean {
  const startTime = Date.now();

  // Security: Validate filename to prevent path traversal
  if (!isValidDataFilename(filename)) {
    console.error(`🚨 SECURITY: Invalid filename attempted: ${filename}`);
    throw new Error(`Invalid filename: ${filename}`);
  }

  const filePath = path.join(dataDir, filename);
  const backupPath = path.join(dataDir, `${filename}.backup`);
  
  // Use unique temp file to avoid collision
  const uniqueId = crypto.randomBytes(8).toString("hex");
  const tempPath = path.join(dataDir, `${filename}.${uniqueId}.tmp`);

  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Step 1: Write to unique temporary file
    const jsonData = JSON.stringify(data, null, 2);
    fs.writeFileSync(tempPath, jsonData, "utf8");

    // Step 2: Verify the temp file was written correctly
    const verifyData = fs.readFileSync(tempPath, "utf8");
    JSON.parse(verifyData); // This will throw if JSON is invalid

    // Step 3: Sync to disk to ensure data is persisted
    const fd = fs.openSync(tempPath, "r");
    fs.fsyncSync(fd);
    fs.closeSync(fd);

    // Step 4: Copy current file to backup (if it exists)
    if (fs.existsSync(filePath)) {
      try {
        fs.copyFileSync(filePath, backupPath);
      } catch (backupError) {
        console.warn(`⚠️  Failed to create backup for ${filename}:`, backupError);
      }
    }

    // Step 5: Atomic rename temp to main file (overwrites existing)
    fs.renameSync(tempPath, filePath);

    // Update cache
    dataCache.set(filename, { data: data, timestamp: Date.now() });

    measureDatabaseOperation(`write_${filename}`, startTime);
    return true;
  } catch (error: any) {
    console.error(`❌ Erro ao escrever ${filename}:`, error.message);
    
    // Clean up temp file if it exists
    if (fs.existsSync(tempPath)) {
      try {
        fs.unlinkSync(tempPath);
      } catch {
        // Ignore cleanup errors
      }
    }

    measureDatabaseOperation(`write_${filename}_error`, startTime);
    return false;
  }
}

/**
 * Clear cache for a specific file or all files
 * @param filename
 */
export function clearCache(filename?: string): void {
  if (filename) {
    dataCache.delete(filename);
  } else {
    dataCache.clear();
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { size: number; files: string[] } {
  return {
    size: dataCache.size,
    files: Array.from(dataCache.keys()),
  };
}

/**
 * Restore data from backup file
 * @param filename - The data file to restore
 * @returns true if restored successfully, false otherwise
 */
export function restoreFromBackup(filename: string): boolean {
  if (!isValidDataFilename(filename)) {
    console.error(`🚨 SECURITY: Invalid filename attempted: ${filename}`);
    throw new Error(`Invalid filename: ${filename}`);
  }

  const filePath = path.join(dataDir, filename);
  const backupPath = path.join(dataDir, `${filename}.backup`);

  try {
    if (!fs.existsSync(backupPath)) {
      console.error(`❌ No backup found for ${filename}`);
      return false;
    }

    // Verify backup is valid JSON
    const backupData = fs.readFileSync(backupPath, "utf8");
    JSON.parse(backupData);

    // Copy backup to main file
    fs.copyFileSync(backupPath, filePath);

    // Clear cache for this file
    dataCache.delete(filename);

    console.log(`✅ Successfully restored ${filename} from backup`);
    return true;
  } catch (error: any) {
    console.error(`❌ Failed to restore ${filename} from backup:`, error.message);
    return false;
  }
}
