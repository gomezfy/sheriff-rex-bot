/**
 * Performance optimization utilities for production deployment
 * Optimized for 10,000+ concurrent users
 */

import { Client, Options, Sweepers, GatewayIntentBits } from "discord.js";

/**
 * Low memory cache configuration for constrained environments
 * Optimized for minimal memory usage (< 50MB)
 */
export const LOW_MEMORY_CACHE_CONFIG = Options.cacheWithLimits({
  // Application Commands - Minimal cache
  ApplicationCommandManager: {
    maxSize: 50,
    keepOverLimit: () => false,
  },

  // Disable emoji caching
  BaseGuildEmojiManager: 0,
  GuildEmojiManager: 0,

  // Guild Members - Very limited
  GuildMemberManager: {
    maxSize: 100,
    keepOverLimit: (member) => member.id === member.client.user?.id,
  },

  // Messages - Minimal
  MessageManager: {
    maxSize: 10,
    keepOverLimit: () => false,
  },

  // Users - Limited
  UserManager: {
    maxSize: 200,
    keepOverLimit: (user) => user.id === user.client.user?.id,
  },

  // Disable all unused managers
  GuildBanManager: 0,
  GuildInviteManager: 0,
  GuildScheduledEventManager: 0,
  GuildStickerManager: 0,
  PresenceManager: 0,
  ReactionManager: 0,
  ReactionUserManager: 0,
  StageInstanceManager: 0,
  ThreadManager: 0,
  ThreadMemberManager: 0,
  VoiceStateManager: 0,
});

/**
 * Advanced cache configuration for high-performance production
 * Optimized for memory efficiency and speed
 */
export const PRODUCTION_CACHE_CONFIG = Options.cacheWithLimits({
  // Application Commands - Cache all for instant access
  ApplicationCommandManager: {
    maxSize: 200,
    keepOverLimit: () => true,
  },

  // Base Guild - Keep all guilds cached
  BaseGuildEmojiManager: 0, // Don't cache emojis (use custom emoji system)
  GuildEmojiManager: 0,

  // Guild Members - Reduced for memory optimization
  GuildMemberManager: {
    maxSize: 500, // Reduced from 1000 to save memory
    keepOverLimit: (member) => {
      // Keep only bot and admins
      return (
        member.id === member.client.user?.id ||
        member.permissions.has("Administrator")
      );
    },
  },

  // Messages - Minimal caching (use events, not cache)
  MessageManager: {
    maxSize: 20, // Reduced from 50 - saves ~30MB
    keepOverLimit: () => false,
  },

  // Users - Optimized caching
  UserManager: {
    maxSize: 1000, // Reduced from 2000 to save memory
    keepOverLimit: (user) => user.id === user.client.user?.id,
  },

  // Disable unused managers (save memory)
  GuildBanManager: 0,
  GuildInviteManager: 0,
  GuildScheduledEventManager: 0,
  GuildStickerManager: 0,
  StageInstanceManager: 0,
  ThreadManager: 0,
  ThreadMemberManager: 0,
  PresenceManager: 0, // Don't cache presences (heavy)
  VoiceStateManager: 0, // Not needed for economy bot
  ReactionManager: 0,
  ReactionUserManager: 0,
  AutoModerationRuleManager: 0,
  GuildForumThreadManager: 0,
});

/**
 * Advanced sweeper configuration for automatic cache cleanup
 * Runs periodically to free memory
 */
export const PRODUCTION_SWEEPERS = {
  // Aggressive message sweeping - keep for only 1 minute
  messages: {
    interval: 120, // 2 minutes (more frequent)
    lifetime: 60, // 1 minute (reduced from 3)
  },

  // More frequent user sweeping
  users: {
    interval: 300, // 5 minutes (reduced from 10)
    filter: () => (user: any) => {
      // Don't sweep bot user
      if (user.id === user.client.user?.id) {
        return false;
      }
      return true;
    },
  },

  // More frequent guild member sweeping
  guildMembers: {
    interval: 600, // 10 minutes (reduced from 15)
    filter: () => (member: any) => {
      // Keep only bot and admins
      if (member.id === member.client.user?.id) {
        return false;
      }
      if (member.permissions.has("Administrator")) {
        return false;
      }
      return true;
    },
  },

  // Aggressive thread sweeping
  threads: {
    interval: 900, // 15 minutes (reduced from 30)
    lifetime: 1800, // 30 minutes (reduced from 1 hour)
  },
};

/**
 * Optimal intents for economy bot
 * Only request what's needed to reduce gateway load
 */
export const PRODUCTION_INTENTS = [
  GatewayIntentBits.Guilds, // Essential - guild info
  GatewayIntentBits.GuildMembers, // For member join/leave
  GatewayIntentBits.GuildMessages, // For prefix commands (if any)
  GatewayIntentBits.MessageContent, // For reading message content
  // GatewayIntentBits.GuildPresences,   // DISABLED - not needed, saves bandwidth
  // GatewayIntentBits.GuildVoiceStates, // DISABLED - not needed
  // GatewayIntentBits.GuildMessageReactions, // DISABLED - not needed
];

/**
 * Performance monitoring class
 */
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  private startTime: number = Date.now();

  /**
   * Record a metric
   * @param metric
   * @param value
   */
  record(metric: string, value: number): void {
    if (!this.metrics.has(metric)) {
      this.metrics.set(metric, []);
    }

    const values = this.metrics.get(metric)!;
    values.push(value);

    // Keep only last 100 values
    if (values.length > 100) {
      values.shift();
    }
  }

  /**
   * Get average for a metric
   * @param metric
   */
  getAverage(metric: string): number {
    const values = this.metrics.get(metric);
    if (!values || values.length === 0) {
      return 0;
    }

    const sum = values.reduce((a, b) => a + b, 0);
    return sum / values.length;
  }

  /**
   * Get all metrics
   */
  getMetrics(): Record<string, { avg: number; count: number }> {
    const result: Record<string, { avg: number; count: number }> = {};

    for (const [metric, values] of this.metrics.entries()) {
      result[metric] = {
        avg: this.getAverage(metric),
        count: values.length,
      };
    }

    return result;
  }

  /**
   * Get uptime in seconds
   */
  getUptime(): number {
    return Math.floor((Date.now() - this.startTime) / 1000);
  }

  /**
   * Get memory usage
   */
  getMemoryUsage(): NodeJS.MemoryUsage {
    return process.memoryUsage();
  }

  /**
   * Format memory usage for display
   */
  formatMemoryUsage(): string {
    const usage = this.getMemoryUsage();
    return (
      `RSS: ${(usage.rss / 1024 / 1024).toFixed(2)}MB | ` +
      `Heap: ${(usage.heapUsed / 1024 / 1024).toFixed(2)}MB / ${(usage.heapTotal / 1024 / 1024).toFixed(2)}MB`
    );
  }
}

export const performanceMonitor = new PerformanceMonitor();

/**
 * Command execution timer decorator
 * @param commandName
 * @param startTime
 */
export function measureCommandTime(
  commandName: string,
  startTime: number,
): void {
  const duration = Date.now() - startTime;
  performanceMonitor.record(`command_${commandName}`, duration);

  // Log slow commands (>1s)
  if (duration > 1000) {
    console.warn(`⚠️  Slow command: ${commandName} took ${duration}ms`);
  }
}

/**
 * Database operation timer
 * @param operation
 * @param startTime
 */
export function measureDatabaseOperation(
  operation: string,
  startTime: number,
): void {
  const duration = Date.now() - startTime;
  performanceMonitor.record(`db_${operation}`, duration);

  // Log slow operations (>100ms)
  if (duration > 100) {
    console.warn(`⚠️  Slow DB operation: ${operation} took ${duration}ms`);
  }
}

/**
 * Connection pool for rate limiting
 */
export class ConnectionPool {
  private connections: Map<string, number> = new Map();
  private readonly maxConnections: number;
  private readonly timeWindow: number;

  constructor(maxConnections: number = 50, timeWindow: number = 60000) {
    this.maxConnections = maxConnections;
    this.timeWindow = timeWindow;

    // Cleanup old connections every minute
    setInterval(() => this.cleanup(), 60000);
  }

  /**
   * Check if connection is allowed
   * @param userId
   */
  canConnect(userId: string): boolean {
    const now = Date.now();
    const lastConnection = this.connections.get(userId);

    if (!lastConnection) {
      this.connections.set(userId, now);
      return true;
    }

    if (now - lastConnection < this.timeWindow) {
      return false;
    }

    this.connections.set(userId, now);
    return true;
  }

  /**
   * Cleanup old connections
   */
  private cleanup(): void {
    const now = Date.now();
    const toDelete: string[] = [];

    for (const [userId, timestamp] of this.connections.entries()) {
      if (now - timestamp > this.timeWindow * 2) {
        toDelete.push(userId);
      }
    }

    toDelete.forEach((userId) => this.connections.delete(userId));
  }

  /**
   * Get connection count
   */
  getConnectionCount(): number {
    return this.connections.size;
  }
}

export const connectionPool = new ConnectionPool();

/**
 * Health check system
 */
export class HealthCheck {
  private lastCheck: number = Date.now();
  private healthy: boolean = true;
  private errors: string[] = [];

  /**
   * Mark as healthy
   */
  markHealthy(): void {
    this.healthy = true;
    this.lastCheck = Date.now();
    this.errors = [];
  }

  /**
   * Mark as unhealthy
   * @param reason
   */
  markUnhealthy(reason: string): void {
    this.healthy = false;
    this.lastCheck = Date.now();
    this.errors.push(reason);

    // Keep only last 10 errors
    if (this.errors.length > 10) {
      this.errors.shift();
    }
  }

  /**
   * Check if healthy
   */
  isHealthy(): boolean {
    // Consider unhealthy if no check in last 5 minutes
    if (Date.now() - this.lastCheck > 300000) {
      return false;
    }

    return this.healthy;
  }

  /**
   * Get health status
   */
  getStatus(): { healthy: boolean; lastCheck: number; errors: string[] } {
    return {
      healthy: this.isHealthy(),
      lastCheck: this.lastCheck,
      errors: this.errors,
    };
  }
}

export const healthCheck = new HealthCheck();

/**
 * Graceful shutdown handler
 * @param client
 */
export function setupGracefulShutdown(client: Client): void {
  const shutdown = async (signal: string) => {
    console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);

    try {
      // Stop accepting new commands
      console.log("📛 Stopping command processing...");

      // Flush caches
      console.log("💾 Flushing caches...");
      const { cacheManager } = require("./cacheManager");
      cacheManager.forceSync();

      // Destroy client
      console.log("🔌 Disconnecting from Discord...");
      client.destroy();

      console.log("✅ Graceful shutdown complete");
      process.exit(0);
    } catch (error) {
      console.error("❌ Error during shutdown:", error);
      process.exit(1);
    }
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  // Handle uncaught errors
  process.on("uncaughtException", (error) => {
    console.error("❌ Uncaught Exception:", error);
    healthCheck.markUnhealthy(`Uncaught exception: ${error.message}`);
  });

  process.on("unhandledRejection", (reason, promise) => {
    console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
    healthCheck.markUnhealthy(`Unhandled rejection: ${reason}`);
  });
}

/**
 * Memory optimization - Force garbage collection periodically
 */
export function setupMemoryOptimization(): void {
  // Force GC every 5 minutes if available (more aggressive)
  if (global.gc) {
    setInterval(() => {
      const before = process.memoryUsage().heapUsed;
      global.gc!();
      const after = process.memoryUsage().heapUsed;
      const freed = (before - after) / 1024 / 1024;

      if (freed > 0) {
        console.log(`🧹 Garbage collection freed ${freed.toFixed(2)}MB`);
      }
    }, 300000); // 5 minutes (more aggressive)
  }

  // Monitor memory usage
  setInterval(() => {
    const usage = process.memoryUsage();
    const heapUsedMB = usage.heapUsed / 1024 / 1024;
    const heapTotalMB = usage.heapTotal / 1024 / 1024;
    const percentage = (heapUsedMB / heapTotalMB) * 100;

    performanceMonitor.record("memory_heap_used", heapUsedMB);
    performanceMonitor.record("memory_heap_total", heapTotalMB);

    // Warn if memory usage is high
    if (percentage > 85) {
      console.warn(
        `⚠️  High memory usage: ${percentage.toFixed(1)}% (${heapUsedMB.toFixed(2)}MB / ${heapTotalMB.toFixed(2)}MB)`,
      );

      // Force GC if memory is critically high
      if (percentage > 90 && global.gc) {
        console.log("🧹 Forcing garbage collection due to high memory...");
        global.gc();
      }

      healthCheck.markUnhealthy(`High memory usage: ${percentage.toFixed(1)}%`);
    } else {
      healthCheck.markHealthy();
    }
  }, 30000); // Every 30 seconds (more frequent monitoring)
}

/**
 * Setup performance monitoring
 * @param client
 */
export function setupPerformanceMonitoring(client: Client): void {
  // Log stats every 5 minutes
  setInterval(() => {
    const metrics = performanceMonitor.getMetrics();
    const uptime = performanceMonitor.getUptime();
    const memory = performanceMonitor.formatMemoryUsage();

    console.log("\n📊 Performance Stats:");
    console.log(
      `⏱️  Uptime: ${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
    );
    console.log(`💾 Memory: ${memory}`);
    console.log(`🏰 Guilds: ${client.guilds.cache.size}`);
    console.log(`👥 Cached Users: ${client.users.cache.size}`);
    console.log(
      `📝 Cached Members: ${client.guilds.cache.reduce((acc, guild) => acc + guild.members.cache.size, 0)}`,
    );

    // Log command averages
    const commandMetrics = Object.entries(metrics)
      .filter(([key]) => key.startsWith("command_"))
      .sort((a, b) => b[1].avg - a[1].avg)
      .slice(0, 5);

    if (commandMetrics.length > 0) {
      console.log("\n⚡ Slowest Commands:");
      commandMetrics.forEach(([key, value]) => {
        const cmdName = key.replace("command_", "");
        console.log(
          `  ${cmdName}: ${value.avg.toFixed(2)}ms (${value.count} executions)`,
        );
      });
    }

    console.log(""); // Empty line
  }, 300000); // 5 minutes
}
