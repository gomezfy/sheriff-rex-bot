import fs from "fs";
import path from "path";
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

  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");

    // Update cache
    dataCache.set(filename, { data: data, timestamp: Date.now() });

    measureDatabaseOperation(`write_${filename}`, startTime);
    return true;
  } catch (error: any) {
    console.error(`❌ Erro ao escrever ${filename}:`, error.message);
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
