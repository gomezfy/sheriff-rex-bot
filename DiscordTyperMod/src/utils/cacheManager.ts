import fs from "fs";
import { promises as fsPromises } from "fs";
import { getDataPath } from "./database";
import path from "path";

interface CacheConfig {
  ttl: number;
  maxSize: number;
  syncInterval: number;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  dirty: boolean;
}

interface WriteOperation {
  cacheName: string;
  entries: Array<[string, any]>;
  priority: "high" | "normal";
}

class CacheManager {
  private caches: Map<string, Map<string, CacheEntry<any>>> = new Map();
  private syncTimers: Map<string, NodeJS.Timeout> = new Map();
  private config: Map<string, CacheConfig> = new Map();
  private dataDir: string;
  private writeQueue: WriteOperation[] = [];
  private isProcessingQueue: boolean = false;
  private writeQueueTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.dataDir = path.join(getDataPath("data"));
    this.setupGracefulShutdown();
    this.startWriteQueueProcessor();
  }

  /**
   * Start the async write queue processor
   * Processes writes in background without blocking the event loop
   */
  private startWriteQueueProcessor(): void {
    this.writeQueueTimer = setInterval(() => {
      this.processWriteQueue();
    }, 1000); // Process queue every second
  }

  registerCache(cacheName: string, config: Partial<CacheConfig> = {}) {
    const defaultConfig: CacheConfig = {
      ttl: 5 * 60 * 1000,
      maxSize: 500, // Reduced from 1000 to save memory
      syncInterval: 10000,
      ...config,
    };

    this.config.set(cacheName, defaultConfig);
    this.caches.set(cacheName, new Map());

    const syncTimer = setInterval(() => {
      this.syncCache(cacheName);
    }, defaultConfig.syncInterval);

    this.syncTimers.set(cacheName, syncTimer);
  }

  get<T>(cacheName: string, key: string): T | null {
    const cache = this.caches.get(cacheName);
    if (!cache) {
      return null;
    }

    const entry = cache.get(key);
    if (!entry) {
      return null;
    }

    const config = this.config.get(cacheName);
    if (config && Date.now() - entry.timestamp > config.ttl) {
      cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set<T>(cacheName: string, key: string, data: T, dirty = true): void {
    const cache = this.caches.get(cacheName);
    if (!cache) {
      console.warn(`Cache ${cacheName} not registered`);
      return;
    }

    const config = this.config.get(cacheName);
    if (config && cache.size >= config.maxSize) {
      const oldestKey = cache.keys().next().value;
      if (oldestKey) {
        const oldEntry = cache.get(oldestKey);
        if (oldEntry?.dirty) {
          this.flushEntry(cacheName, oldestKey, oldEntry.data);
        }
        cache.delete(oldestKey);
      }
    }

    cache.set(key, {
      data,
      timestamp: Date.now(),
      dirty,
    });
  }

  getOrLoad<T>(
    cacheName: string,
    key: string,
    filename: string,
    defaultValue: T,
  ): T {
    const cached = this.get<T>(cacheName, key);
    if (cached !== null) {
      return cached;
    }

    const filePath = path.join(this.dataDir, filename);

    try {
      if (fs.existsSync(filePath)) {
        const fileData = fs.readFileSync(filePath, "utf8");
        if (fileData.trim()) {
          const parsed = JSON.parse(fileData);
          const value = parsed[key] || defaultValue;
          this.set(cacheName, key, value, false);
          return value;
        }
      }
    } catch (error: any) {
      console.error(`Error loading ${filename}:`, error.message);
    }

    this.set(cacheName, key, defaultValue, false);
    return defaultValue;
  }

  invalidate(cacheName: string, key?: string): void {
    const cache = this.caches.get(cacheName);
    if (!cache) {
      return;
    }

    if (key) {
      const entry = cache.get(key);
      if (entry?.dirty) {
        this.flushEntry(cacheName, key, entry.data);
      }
      cache.delete(key);
    } else {
      this.syncCache(cacheName);
      cache.clear();
    }
  }

  private syncCache(cacheName: string): void {
    const cache = this.caches.get(cacheName);
    if (!cache) {
      return;
    }

    const dirtyEntries: Array<[string, any]> = [];

    for (const [key, entry] of cache.entries()) {
      if (entry.dirty) {
        dirtyEntries.push([key, entry.data]);
        entry.dirty = false;
        entry.timestamp = Date.now();
      }
    }

    if (dirtyEntries.length > 0) {
      this.bulkWrite(cacheName, dirtyEntries);
    }
  }

  /**
   * Queue a write operation for async processing
   * This prevents blocking the event loop during file I/O
   * @param cacheName
   * @param entries
   * @param priority
   */
  private queueWrite(
    cacheName: string,
    entries: Array<[string, any]>,
    priority: "high" | "normal" = "normal",
  ): void {
    const operation: WriteOperation = { cacheName, entries, priority };

    if (priority === "high") {
      // High priority writes go to the front of the queue
      this.writeQueue.unshift(operation);
    } else {
      this.writeQueue.push(operation);
    }
  }

  /**
   * Process the write queue asynchronously
   * Uses setImmediate to avoid blocking the event loop
   */
  private async processWriteQueue(): Promise<void> {
    if (this.isProcessingQueue || this.writeQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    try {
      // Process up to 10 operations per cycle to avoid long blocking
      const batchSize = Math.min(this.writeQueue.length, 10);

      for (let i = 0; i < batchSize; i++) {
        const operation = this.writeQueue.shift();
        if (!operation) {
          break;
        }

        // Use setImmediate to yield to event loop, then await async write
        await new Promise<void>((resolve) => {
          setImmediate(async () => {
            await this.executeBulkWrite(operation.cacheName, operation.entries);
            resolve();
          });
        });
      }
    } finally {
      this.isProcessingQueue = false;
    }
  }

  /**
   * Execute the actual file write operation ASYNCHRONOUSLY
   * Only called from the write queue processor
   * @param cacheName
   * @param entries
   */
  private async executeBulkWrite(
    cacheName: string,
    entries: Array<[string, any]>,
  ): Promise<void> {
    const filename = this.getFilenameForCache(cacheName);
    if (!filename) {
      return;
    }

    const filePath = path.join(this.dataDir, filename);

    try {
      let existingData: any = {};

      // Use async file read
      try {
        const fileContent = await fsPromises.readFile(filePath, "utf8");
        if (fileContent.trim()) {
          existingData = JSON.parse(fileContent);
        }
      } catch (error: any) {
        // File doesn't exist, use empty object
        if (error.code !== "ENOENT") {
          throw error;
        }
      }

      for (const [key, data] of entries) {
        existingData[key] = data;
      }

      // Use async file write
      await fsPromises.writeFile(
        filePath,
        JSON.stringify(existingData, null, 2),
        "utf8",
      );
    } catch (error: any) {
      console.error(`Error bulk writing to ${filename}:`, error.message);
    }
  }

  /**
   * Synchronous version for shutdown only
   * Used to guarantee data persistence on process exit
   * @param cacheName
   * @param entries
   */
  private executeBulkWriteSync(
    cacheName: string,
    entries: Array<[string, any]>,
  ): void {
    const filename = this.getFilenameForCache(cacheName);
    if (!filename) {
      return;
    }

    const filePath = path.join(this.dataDir, filename);

    try {
      let existingData: any = {};
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, "utf8");
        if (fileContent.trim()) {
          existingData = JSON.parse(fileContent);
        }
      }

      for (const [key, data] of entries) {
        existingData[key] = data;
      }

      fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2), "utf8");
    } catch (error: any) {
      console.error(`Error bulk writing to ${filename}:`, error.message);
    }
  }

  private bulkWrite(cacheName: string, entries: Array<[string, any]>): void {
    // Queue the write instead of executing immediately
    this.queueWrite(cacheName, entries, "normal");
  }

  private flushEntry(cacheName: string, key: string, data: any): void {
    this.bulkWrite(cacheName, [[key, data]]);
  }

  private getFilenameForCache(cacheName: string): string | null {
    const mapping: Record<string, string> = {
      economy: "economy.json",
      profiles: "profiles.json",
      inventory: "inventory.json",
      xp: "xp.json",
      daily: "daily.json",
      bounties: "bounties.json",
      mining: "mining.json",
      backgrounds: "backgrounds.json",
      punishment: "punishment.json",
      warehouse: "warehouse.json",
    };
    return mapping[cacheName] || null;
  }

  private setupGracefulShutdown(): void {
    const shutdown = async () => {
      console.log("💾 Flushing caches before shutdown...");

      // Stop the write queue processor
      if (this.writeQueueTimer) {
        clearInterval(this.writeQueueTimer);
      }

      // Sync all caches (adds to write queue)
      for (const cacheName of this.caches.keys()) {
        this.syncCache(cacheName);
        const timer = this.syncTimers.get(cacheName);
        if (timer) {
          clearInterval(timer);
        }
      }

      // Force process remaining write queue SYNCHRONOUSLY for shutdown
      // This guarantees data persistence even if async operations are interrupted
      while (this.writeQueue.length > 0) {
        const operation = this.writeQueue.shift();
        if (operation) {
          this.executeBulkWriteSync(operation.cacheName, operation.entries);
        }
      }

      console.log("✅ Caches flushed successfully!");
    };

    process.on("SIGINT", async () => {
      await shutdown();
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      await shutdown();
      process.exit(0);
    });

    process.on("beforeExit", async () => {
      await shutdown();
    });
  }

  forceSync(cacheName?: string): void {
    if (cacheName) {
      this.syncCache(cacheName);
    } else {
      for (const name of this.caches.keys()) {
        this.syncCache(name);
      }
    }
  }

  getStats(cacheName: string): { size: number; dirtyCount: number } {
    const cache = this.caches.get(cacheName);
    if (!cache) {
      return { size: 0, dirtyCount: 0 };
    }

    let dirtyCount = 0;
    for (const entry of cache.values()) {
      if (entry.dirty) {
        dirtyCount++;
      }
    }

    return {
      size: cache.size,
      dirtyCount,
    };
  }
}

export const cacheManager = new CacheManager();

// Optimized cache settings for lower memory usage
cacheManager.registerCache("economy", {
  syncInterval: 20000,
  ttl: 5 * 60 * 1000,
  maxSize: 300,
});
cacheManager.registerCache("profiles", {
  syncInterval: 30000,
  ttl: 10 * 60 * 1000,
  maxSize: 200,
});
cacheManager.registerCache("inventory", {
  syncInterval: 20000,
  ttl: 5 * 60 * 1000,
  maxSize: 300,
});
cacheManager.registerCache("xp", {
  syncInterval: 40000,
  ttl: 10 * 60 * 1000,
  maxSize: 200,
});
cacheManager.registerCache("daily", {
  syncInterval: 60000,
  ttl: 20 * 60 * 1000,
  maxSize: 200,
});
cacheManager.registerCache("bounties", {
  syncInterval: 30000,
  ttl: 10 * 60 * 1000,
  maxSize: 100,
});
cacheManager.registerCache("mining", {
  syncInterval: 30000,
  ttl: 10 * 60 * 1000,
  maxSize: 100,
});
cacheManager.registerCache("backgrounds", {
  syncInterval: 60000,
  ttl: 30 * 60 * 1000,
  maxSize: 50,
});
cacheManager.registerCache("punishment", {
  syncInterval: 40000,
  ttl: 15 * 60 * 1000,
  maxSize: 100,
});
cacheManager.registerCache("warehouse", {
  syncInterval: 30000,
  ttl: 10 * 60 * 1000,
  maxSize: 50,
});

console.log("✅ Cache system initialized with auto-sync!");
