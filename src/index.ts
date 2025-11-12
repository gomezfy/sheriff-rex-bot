// Load environment variables (works both locally with .env and in production with system env)
import dotenv from "dotenv";
import { Client, Partials, Collection, Events, MessageFlags } from "discord.js";
import fs from "fs";
import path from "path";
import Logger from "./utils/logger";
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
import { addXp } from "./utils/xpManager";
import { initializeDatabase } from "./utils/database";
import {
  isPunished,
  getRemainingTime,
  formatTime,
} from "./utils/punishmentManager";
import { canGainXp } from "./utils/messageThrottler";

// Try to load .env file if it exists (for local development)
const envPath = path.join(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  console.log("📄 Loading .env file...");
  dotenv.config({ path: envPath });
} else {
  console.log("📦 Using system environment variables (production mode)");
}

// Debug: Log which variables are present (without exposing values)
console.log("🔍 Environment check:");
console.log("  - DISCORD_TOKEN:", process.env.DISCORD_TOKEN ? "✅ Present" : "❌ Missing");
console.log("  - DISCORD_CLIENT_ID:", process.env.DISCORD_CLIENT_ID ? "✅ Present" : "❌ Missing");
console.log("  - CLIENT_ID:", process.env.CLIENT_ID ? "✅ Present" : "❌ Missing");

// Validate environment variables before starting
console.log("🔐 Validating environment variables...");
try {
  validateEnvironment();
  console.log("📊 Environment info:", getSafeEnvironmentInfo());
} catch (error) {
  console.error("❌ Environment validation failed:", error);
  process.exit(1);
}

// Production mode - reduce console logs
const isProduction = process.env.NODE_ENV === "production";
const logInfo = (msg: string) => !isProduction && console.log(msg);

logInfo("🔄 Inicializando sistema de dados...");
initializeDatabase();

// Detect low memory environment
const isLowMemory =
  process.env.LOW_MEMORY === "true" ||
  (process.env.MEMORY_LIMIT && parseInt(process.env.MEMORY_LIMIT) < 100);

console.log(`🎯 Memory mode: ${isLowMemory ? "LOW MEMORY" : "PRODUCTION"}`);

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

const commandsPath = path.join(__dirname, "commands");
const commandCategories = fs.readdirSync(commandsPath).filter((item) => {
  const itemPath = path.join(commandsPath, item);
  return fs.statSync(itemPath).isDirectory();
});

let commandCount = 0;
for (const category of commandCategories) {
  const categoryPath = path.join(commandsPath, category);
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
        commandCount++;
      }
    } catch (error: any) {
      console.error(`❌ Error loading command ${file}:`, error.message);
    }
  }
}
console.log(`✅ Loaded ${commandCount} commands`);

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
  } catch (error: any) {
    console.error(`❌ Error loading event ${file}:`, error.message);
  }
}
console.log(`✅ Loaded ${eventCount} events`);

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
    console.error(`Command ${interaction.commandName} not found.`);
    return;
  }

  // Prevent double execution
  if ((interaction as any)._handled) {
    logInfo(`Interaction already handled for ${interaction.commandName}`);
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
      logInfo(
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
  console.error("❌ [UNHANDLED ERROR]:", error);
});

process.on("uncaughtException", (error: Error) => {
  console.error("❌ [UNCAUGHT EXCEPTION]:", error);
});

client.on("error", (error: Error) => {
  console.error("❌ [CLIENT ERROR]:", error);
});

client.on("warn", (info: string) => {
  console.warn("⚠️  [WARNING]:", info);
});

client.on("shardError", (error: Error) => {
  console.error("❌ [SHARD ERROR]:", error);
});

const token = process.env.DISCORD_TOKEN;

if (!token) {
  console.error("❌ ERROR: Discord token not found!");
  console.error("📝 Configure the DISCORD_TOKEN environment variable");
  process.exit(1);
}

console.log("🔐 Token found, attempting login...");

// Setup production optimizations
console.log("⚡ Setting up production optimizations...");
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
        console.log(
          `🏥 Health check endpoint: http://localhost:${healthPort}/health`,
        );
      });
    })
    .catch((err) => {
      console.error("❌ Failed to load health check server:", err);
    });
}

client
  .login(token)
  .then(() => {
    console.log("✅ Login successful!");
    console.log("🤠 Sheriff Bot is ready!\n");
    console.log("⚡ Production optimizations active");
    console.log(`📊 Monitoring ${client.guilds.cache.size} guilds`);

    // Start automatic territory income system
    startAutomaticTerritoryIncome(client);

    // Start automatic mining notification system
    startMiningNotifications(client);

    // Start automatic expedition checker system
    startExpeditionChecker(client);

    // Start warehouse statistics hourly reset
    startWarehouseStatsReset();

    // Start automatic mute expiration checker
    const { checkExpiredMutes } = require("./utils/muteManager");
    setInterval(() => {
      const expiredKeys = checkExpiredMutes();
      if (expiredKeys.length > 0) {
        console.log(`✅ ${expiredKeys.length} mute(s) expired and removed`);
      }
    }, 60000); // Check every minute

    healthCheck.markHealthy();
  })
  .catch((error: Error) => {
    console.error("❌ LOGIN ERROR:");
    console.error("Details:", error.message);
    healthCheck.markUnhealthy(`Login failed: ${error.message}`);

    if (error.message.includes("token")) {
      console.error("");
      console.error("💡 SOLUTION:");
      console.error("1. Verify the token is correct");
      console.error(
        "2. Generate a new token at: https://discord.com/developers/applications",
      );
      console.error("3. Configure DISCORD_TOKEN environment variable");
    }

    if (error.message.includes("intents")) {
      console.error("");
      console.error("💡 SOLUTION:");
      console.error("1. Access: https://discord.com/developers/applications");
      console.error("2. Go to Bot > Privileged Gateway Intents");
      console.error(
        "3. Enable all options (Presence, Server Members, Message Content)",
      );
    }

    process.exit(1);
  });
