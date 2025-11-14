// Load environment variables (works both locally with .env and in production with system env)
import dotenv from "dotenv";
import { Client, Partials, Collection, Events, MessageFlags } from "discord.js";
import fs from "fs";
import path from "path";
import Logger from "./utils/logger";
import logger from "./utils/consoleLogger";
import {
  sanitizeErrorForLogging,
  validateEnvironment,
  getSafeEnvironmentInfo,
} from "./utils/security";
import { Command, BotClient } from "./types";
import { ErrorHandler } from "./utils/errorHandler";
import { globalCooldownManager } from "./utils/cooldownManager";
import {
  PRODUCTION_CACHE_CONFIG,
  LOW_MEMORY_CACHE_CONFIG,
  PRODUCTION_SWEEPERS,
  PRODUCTION_INTENTS,
  performanceMonitor,
  measureCommandTime,
  setupGracefulShutdown,
  setupMemoryOptimization,
  setupPerformanceMonitoring,
  healthCheck,
} from "./utils/performance";
import { startAutomaticTerritoryIncome } from "./utils/territoryIncome";
import { startMiningNotifications } from "./utils/miningTracker";
import { startExpeditionChecker } from "./utils/expeditionChecker";
import { startWarehouseStatsReset } from "./utils/warehouseManager";
import { startDailyRewardsScheduler } from "./utils/dailyRewards";
import { addXp } from "./utils/xpManager";
import { initializeDatabase } from "./utils/database";
import {
  isPunished,
  getRemainingTime,
  formatTime,
} from "./utils/punishmentManager";
import { canGainXp } from "./utils/messageThrottler";

// Display startup banner
logger.startup("Initializing Sheriff Rex Bot");

// Try to load .env file if it exists (for local development)
const envPath = path.join(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  logger.info("Loading .env file");
  dotenv.config({ path: envPath });
} else {
  logger.info("Using system environment variables (production mode)");
}

// Check environment variables
logger.section("Environment Check");
logger.table({
  "DISCORD_TOKEN": !!process.env.DISCORD_TOKEN,
  "DISCORD_CLIENT_ID": !!process.env.DISCORD_CLIENT_ID,
  "CLIENT_ID": !!process.env.CLIENT_ID,
  "DATABASE_URL": !!process.env.DATABASE_URL,
  "NODE_ENV": process.env.NODE_ENV || "development",
});

// Validate environment variables before starting
logger.info("Validating environment variables");
try {
  validateEnvironment();
  logger.success("Environment validation passed");
  logger.debug("Environment info: " + JSON.stringify(getSafeEnvironmentInfo()));
} catch (error) {
  logger.error("Environment validation failed", sanitizeErrorForLogging(error as Error));
  process.exit(1);
}

// Production mode - reduce console logs
const isProduction = process.env.NODE_ENV === "production";

logger.section("Database Initialization");
logger.info("Initializing database system");
initializeDatabase();
logger.success("Database system ready");

// Detect low memory environment
const isLowMemory =
  process.env.LOW_MEMORY === "true" ||
  (process.env.MEMORY_LIMIT && parseInt(process.env.MEMORY_LIMIT) < 100);

logger.info(`Memory mode: ${isLowMemory ? "LOW MEMORY" : "PRODUCTION"}`);

// Production-optimized client configuration
const client = new Client({
  // Optimized intents - only what's needed
  intents: PRODUCTION_INTENTS,

  // Minimal partials for better performance
  partials: [Partials.User, Partials.Channel, Partials.GuildMember],

  // Advanced cache configuration - auto-detect based on memory
  makeCache: isLowMemory ? LOW_MEMORY_CACHE_CONFIG : PRODUCTION_CACHE_CONFIG,

  // Aggressive sweepers for memory management
  sweepers: PRODUCTION_SWEEPERS,

  // Connection settings for stability
  rest: {
    timeout: 15000,
    retries: 3,
  },

  // Presence configuration
  presence: {
    status: "online",
    activities: [
      {
        name: "🤠 Sheriff Rex | /help",
        type: 0, // Playing
      },
    ],
  },

  // Fail if cache is full (prevents memory leaks)
  failIfNotExists: false,

  // Allow mentions
  allowedMentions: {
    parse: ["users", "roles"],
    repliedUser: true,
  },
}) as Client & BotClient;

(client as BotClient).commands = new Collection<string, Command>();

// Helper function to load commands from a directory
function loadCommandsFromPath(basePath: string, pathLabel: string): number {
  if (!fs.existsSync(basePath)) {
    logger.debug(`Path ${pathLabel} does not exist, skipping`);
    return 0;
  }

  const categories = fs.readdirSync(basePath).filter((item) => {
    const itemPath = path.join(basePath, item);
    return fs.statSync(itemPath).isDirectory();
  });

  let count = 0;
  for (const category of categories) {
    const categoryPath = path.join(basePath, category);
    const commandFiles = fs
      .readdirSync(categoryPath)
      .filter(
        (file) =>
          (file.endsWith(".js") || file.endsWith(".ts")) &&
          !file.endsWith(".d.ts"),
      );

    for (const file of commandFiles) {
      const filePath = path.join(categoryPath, file);
      try {
        const importedCommand = require(filePath);
        // Support both export default and named exports
        const command = importedCommand.default || importedCommand;
        
        if ("data" in command && "execute" in command) {
          client.commands.set(command.data.name, command);
          count++;
          logger.debug(`Loaded command: /${command.data.name} (${pathLabel}/${category})`);
        }
      } catch (error: any) {
        logger.error(`Failed to load command ${file}`, sanitizeErrorForLogging(error));
      }
    }
  }
  return count;
}

logger.section("Loading Commands");
let commandCount = 0;

// Load from traditional commands directory
const commandsPath = path.join(__dirname, "commands");
commandCount += loadCommandsFromPath(commandsPath, "commands");

// Load from features directory
const featuresPath = path.join(__dirname, "features");
commandCount += loadCommandsFromPath(featuresPath, "features");

logger.success(`Loaded ${commandCount} total commands`);

logger.section("Loading Events");
const eventsPath = path.join(__dirname, "events");
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter(
    (file) =>
      (file.endsWith(".js") || file.endsWith(".ts")) && !file.endsWith(".d.ts"),
  );

let eventCount = 0;
for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  try {
    const event = require(filePath);
    if (event.once) {
      client.once(event.name, (...args: any[]) => event.execute(...args));
    } else {
      client.on(event.name, (...args: any[]) => event.execute(...args));
    }
    eventCount++;
    logger.debug(`Loaded event: ${event.name}${event.once ? ' (once)' : ''}`);
  } catch (error: any) {
    logger.error(`Failed to load event ${file}`, sanitizeErrorForLogging(error));
  }
}
logger.success(`Loaded ${eventCount} events`);

/**
 * Ensures an interaction is deferred to prevent timeout errors
 * @param interaction - The interaction to defer
 * @param options - Optional defer configuration (ephemeral, etc.)
 * @returns true if deferred, false if already replied/deferred
 */
async function ensureDeferred(
  interaction: any,
  options?: { ephemeral?: boolean },
): Promise<boolean> {
  if (interaction.deferred || interaction.replied) {
    return false;
  }

  try {
    await interaction.deferReply(options);
    return true;
  } catch (error) {
    return false;
  }
}

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    logger.warn(`Command ${interaction.commandName} not found`);
    return;
  }

  // Prevent double execution
  if ((interaction as any)._handled) {
    logger.debug(`Interaction already handled for ${interaction.commandName}`);
    return;
  }
  (interaction as any)._handled = true;

  // Detect and save user language automatically
  const { getLocale } = require("./utils/i18n");
  getLocale(interaction);

  // Performance monitoring - start timer
  const commandStartTime = Date.now();

  // Check cooldown using CooldownManager
  const cooldownAmount = command.cooldown ? command.cooldown * 1000 : 1000;
  const onCooldown = await globalCooldownManager.handleCooldown(
    interaction,
    interaction.commandName,
    cooldownAmount,
  );

  if (onCooldown) {
    return; // CooldownManager already replied to user
  }

  const allowedWhenPunished = [
    "help",
    "ping",
    "inventory",
    "profile",
    "avatar",
    "bounties",
  ];
  if (!allowedWhenPunished.includes(interaction.commandName)) {
    const punishment = isPunished(interaction.user.id);

    if (punishment) {
      const remaining = getRemainingTime(interaction.user.id) || 0;
      return interaction.reply({
        content: `🔒 **You're in jail!**\n\n${punishment.reason}\n\n⏰ Time remaining: **${formatTime(remaining)}**\n\nYou cannot use this command while serving your sentence!\n\n✅ Allowed: /help, /ping, /inventory, /profile, /bounties`,
        flags: MessageFlags.Ephemeral,
      });
    }
  }

  // Auto-defer for commands with autoDefer metadata
  // This prevents "Unknown interaction" errors for commands that take >3 seconds
  if (command.autoDefer) {
    const deferOptions = command.autoDefer.ephemeral
      ? { ephemeral: true }
      : undefined;
    await ensureDeferred(interaction, deferOptions);
  }

  try {
    await command.execute(interaction);

    // Performance monitoring - measure command time
    measureCommandTime(interaction.commandName, commandStartTime);

    if (interaction.guild) {
      const options = interaction.options.data
        .map(
          (opt) =>
            `${opt.name}: ${opt.value || opt.user?.id || opt.channel?.id || "N/A"}`,
        )
        .join(", ");
      Logger.log(client, interaction.guild.id, "command", {
        user: interaction.user,
        command: interaction.commandName,
        channelId: interaction.channel?.id || "DM",
        options: options || "None",
      });
    }
  } catch (error) {
    // Use centralized error handler
    await ErrorHandler.handleCommandError(
      error,
      interaction,
      interaction.commandName,
    );
  }
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  // Throttled XP gain - only process once per minute per user to save memory
  if (canGainXp(message.author.id)) {
    const xpAmount = Math.floor(Math.random() * 11) + 15; // 15-25 XP
    const xpResult = addXp(message.author.id, xpAmount);

    if (xpResult.leveledUp) {
      logger.debug(
        `${message.author.tag} has leveled up to level ${xpResult.newLevel}!`,
      );
    }
  }

  const prefix = "!";
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift()?.toLowerCase();

  // !ping - Latency check
  if (commandName === "ping") {
    const latency = Date.now() - message.createdTimestamp;
    await message.reply(
      `🏓 Pong! Latency: ${latency}ms | API: ${Math.round(client.ws.ping)}ms`,
    );
    return;
  }

  // !help - Help menu
  if (commandName === "ajuda" || commandName === "help") {
    await message.reply({
      embeds: [
        {
          title: "🤠 Sheriff Bot - Commands",
          description:
            "**Prefix Commands:** Use `!` before these commands\n**Slash Commands:** Use `/` for full features\n\n**Most commands work better with `/` (Slash Commands)**",
          color: 0xf4a460,
          fields: [
            {
              name: "🔧 Basic Commands",
              value:
                "`!ping` - Check latency\n`!help` - This menu\n`!invite` - Invite the bot\n`!info` - Bot information",
              inline: false,
            },
            {
              name: "💰 Economy",
              value:
                "`!daily` - Daily reward\n`!profile` - Your profile\n`!inventory` - Your inventory\n`!leaderboard` - Top users",
              inline: false,
            },
            {
              name: "⭐ Recommended",
              value:
                "Use `/help` for the complete command list with all features!",
              inline: false,
            },
          ],
          footer: {
            text: "Sheriff Bot - Wild West Discord Bot",
          },
        },
      ],
    });
    return;
  }

  // !invite - Bot invite link
  if (commandName === "invite" || commandName === "convite") {
    const clientId = process.env.DISCORD_CLIENT_ID || process.env.CLIENT_ID;
    if (!clientId) {
      await message.reply("❌ Bot invite link not configured.");
      return;
    }

    await message.reply({
      embeds: [
        {
          title: "🤠 Invite Sheriff Bot",
          description: `Click the link below to add Sheriff Bot to your server!\n\n[**Add to Server**](https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=8&scope=bot%20applications.commands)`,
          color: 0xf4a460,
          footer: {
            text: "Sheriff Bot - Bringing Wild West to Discord",
          },
        },
      ],
    });
    return;
  }

  // !info - Bot information
  if (commandName === "info" || commandName === "about") {
    const uptime = client.uptime || 0;
    const days = Math.floor(uptime / 86400000);
    const hours = Math.floor(uptime / 3600000) % 24;
    const minutes = Math.floor(uptime / 60000) % 60;

    await message.reply({
      embeds: [
        {
          title: "🤠 Sheriff Bot Information",
          description:
            "Wild West themed Discord bot with economy, games, and more!",
          color: 0xf4a460,
          fields: [
            {
              name: "📊 Statistics",
              value: `**Servers:** ${client.guilds.cache.size}\n**Users:** ${client.users.cache.size}\n**Commands:** 45`,
              inline: true,
            },
            {
              name: "⏰ Uptime",
              value: `${days}d ${hours}h ${minutes}m`,
              inline: true,
            },
            {
              name: "🎮 Features",
              value:
                "• Economy System\n• Mini Games\n• Mining System\n• Bounty System\n• Moderation Tools",
              inline: false,
            },
          ],
          footer: {
            text: "Made with ❤️ by gomezfy",
          },
        },
      ],
    });
    return;
  }

  // !daily - Daily reward (simplified)
  if (commandName === "daily" || commandName === "diario") {
    await message.reply({
      embeds: [
        {
          title: "💰 Daily Reward",
          description:
            "To claim your daily reward with streak bonuses and full features, use:\n\n`/daily`\n\nThe slash command includes:\n• Streak system\n• Bonus rewards\n• XP gains\n• Better interface",
          color: 0xf4a460,
          footer: {
            text: "Tip: Use /daily for the full experience!",
          },
        },
      ],
    });
    return;
  }

  // !profile - View profile
  if (commandName === "profile" || commandName === "perfil") {
    await message.reply({
      embeds: [
        {
          title: "👤 Your Profile",
          description:
            "To view your full profile with stats, badges, and custom background, use:\n\n`/profile`\n\nThe slash command includes:\n• Visual profile card\n• Statistics\n• Level & XP\n• Custom backgrounds",
          color: 0xf4a460,
          footer: {
            text: "Tip: Use /profile for the visual card!",
          },
        },
      ],
    });
    return;
  }

  // !inventory - View inventory
  if (
    commandName === "inventory" ||
    commandName === "inv" ||
    commandName === "inventario"
  ) {
    await message.reply({
      embeds: [
        {
          title: "🎒 Your Inventory",
          description:
            "To view your complete inventory with all items, use:\n\n`/inventory`\n\nThe slash command shows:\n• All your items\n• Item quantities\n• Item values\n• Better organization",
          color: 0xf4a460,
          footer: {
            text: "Tip: Use /inventory for full details!",
          },
        },
      ],
    });
    return;
  }

  // !leaderboard - Top users
  if (
    commandName === "leaderboard" ||
    commandName === "top" ||
    commandName === "rank"
  ) {
    await message.reply({
      embeds: [
        {
          title: "🏆 Leaderboard",
          description:
            "To see the full leaderboard with rankings, use:\n\n`/leaderboard`\n\nThe slash command includes:\n• Top 10 richest users\n• Total wealth\n• Rankings\n• Visual display",
          color: 0xf4a460,
          footer: {
            text: "Tip: Use /leaderboard for the full rankings!",
          },
        },
      ],
    });
    return;
  }

  // Unknown command
  await message.reply({
    content: `❌ Unknown command: \`!${commandName}\`\n\nTry \`!help\` to see available commands!`,
    allowedMentions: { repliedUser: false },
  });
});

process.on("unhandledRejection", (error: Error) => {
  logger.error("[UNHANDLED REJECTION]", sanitizeErrorForLogging(error));
});

process.on("uncaughtException", (error: Error) => {
  logger.error("[UNCAUGHT EXCEPTION]", sanitizeErrorForLogging(error));
  process.exit(1);
});

client.on("error", (error: Error) => {
  logger.error("[CLIENT ERROR]", sanitizeErrorForLogging(error));
});

client.on("warn", (info: string) => {
  logger.warn(`[CLIENT WARNING] ${info}`);
});

client.on("shardError", (error: Error) => {
  logger.error("[SHARD ERROR]", sanitizeErrorForLogging(error));
});

const token = process.env.DISCORD_TOKEN;

if (!token) {
  logger.error("Discord token not found!");
  logger.error("Configure the DISCORD_TOKEN environment variable");
  process.exit(1);
}

logger.info("Token found, attempting login...");

// Setup production optimizations
logger.section("Production Optimizations");
setupGracefulShutdown(client);
setupMemoryOptimization();
setupPerformanceMonitoring(client);

// Health check endpoint (lazy-loaded only when needed)
if (process.env.ENABLE_HEALTH_CHECK === "true") {
  import("express")
    .then(({ default: express }) => {
      const app = express();

      app.get("/health", (req: any, res: any) => {
        const status = healthCheck.getStatus();
        const metrics = performanceMonitor.getMetrics();

        res.json({
          status: status.healthy ? "healthy" : "unhealthy",
          uptime: performanceMonitor.getUptime(),
          memory: performanceMonitor.getMemoryUsage(),
          guilds: client.guilds.cache.size,
          users: client.users.cache.size,
          metrics: metrics,
          errors: status.errors,
        });
      });

      const healthPort = process.env.HEALTH_PORT || 3001;
      app.listen(healthPort, () => {
        logger.success(`Health check endpoint running on port ${healthPort}`);
      });
    })
    .catch((err) => {
      logger.error("Failed to load health check server", sanitizeErrorForLogging(err as Error));
    });
}

client
  .login(token)
  .then(() => {
    logger.section("Bot Systems");
    
    // Start automatic territory income system
    logger.info("Starting territory income system");
    startAutomaticTerritoryIncome(client);

    // Start automatic mining notification system
    logger.info("Starting mining notification system");
    startMiningNotifications(client);

    // Start automatic expedition checker system
    logger.info("Starting expedition checker system");
    startExpeditionChecker(client);

    // Start warehouse statistics hourly reset
    logger.info("Starting warehouse stats reset");
    startWarehouseStatsReset();

    // Start daily rewards scheduler
    logger.info("Starting daily rewards scheduler");
    startDailyRewardsScheduler(client);

    // Start automatic mute expiration checker
    logger.info("Starting mute expiration checker");
    const { checkExpiredMutes } = require("./utils/muteManager");
    setInterval(() => {
      const expiredKeys = checkExpiredMutes();
      if (expiredKeys.length > 0) {
        logger.debug(`${expiredKeys.length} mute(s) expired and removed`);
      }
    }, 60000); // Check every minute

    healthCheck.markHealthy();
    logger.success("All systems operational!");
  })
  .catch((error: Error) => {
    const sanitizedError = sanitizeErrorForLogging(error);
    logger.error("Login failed", sanitizedError);
    healthCheck.markUnhealthy(`Login failed: ${error.message}`);

    if (error.message.includes("token")) {
      logger.divider();
      logger.warn("TOKEN ERROR - Possible solutions:");
      logger.info("1. Verify the token is correct");
      logger.info("2. Generate a new token at: https://discord.com/developers/applications");
      logger.info("3. Configure DISCORD_TOKEN environment variable");
    }

    if (error.message.includes("intents")) {
      logger.divider();
      logger.warn("INTENTS ERROR - Possible solutions:");
      logger.info("1. Access: https://discord.com/developers/applications");
      logger.info("2. Go to Bot > Privileged Gateway Intents");
      logger.info("3. Enable all options (Presence, Server Members, Message Content)");
    }

    process.exit(1);
  });
