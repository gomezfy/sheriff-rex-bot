import {
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandsOnlyBuilder,
  ChatInputCommandInteraction,
  Collection,
  User,
  Guild,
} from "discord.js";

/**
 * Valid command builder types from Discord.js
 *
 * - SlashCommandBuilder: Base command builder
 * - SlashCommandOptionsOnlyBuilder: Builder after adding options (no subcommands allowed)
 * - SlashCommandSubcommandsOnlyBuilder: Builder after adding subcommands (no options allowed)
 */
export type CommandData =
  | SlashCommandBuilder
  | SlashCommandOptionsOnlyBuilder
  | SlashCommandSubcommandsOnlyBuilder;

/**
 * Auto-defer configuration for commands that may take longer than 3 seconds
 *
 * @property ephemeral - Whether the deferred reply should be ephemeral (only visible to the user)
 * @property timeoutMs - Optional timeout in milliseconds (mainly for documentation)
 */
export interface AutoDeferConfig {
  ephemeral?: boolean;
  timeoutMs?: number;
}

/**
 * Command interface - All commands must implement this structure
 *
 * @property data - The slash command builder configuration (strongly typed Discord.js builders)
 * @property execute - The async function that executes when the command is called
 * @property cooldown - Optional cooldown time in seconds between command uses
 * @property autoDefer - Optional configuration for automatic deferral to prevent timeout errors
 *
 * @example
 * ```typescript
 * const command: Command = {
 *   data: new SlashCommandBuilder()
 *     .setName('ping')
 *     .setDescription('Replies with Pong!'),
 *   async execute(interaction) {
 *     await interaction.reply('Pong!');
 *   },
 *   cooldown: 5,
 *   autoDefer: { ephemeral: false }
 * };
 * ```
 */
export interface Command {
  data: CommandData;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
  cooldown?: number;
  autoDefer?: AutoDeferConfig;
}

/**
 * Extended Discord Client with commands collection
 *
 * @property commands - Collection of all registered slash commands
 */
export interface BotClient {
  commands: Collection<string, Command>;
}

/**
 * Economy data structure - Maps user IDs to their economy data
 */
export interface EconomyData {
  [userId: string]: UserEconomyData;
}

/**
 * User economy data
 *
 * @property gold - Amount of gold coins
 * @property silver - Amount of silver coins
 * @property saloon_tokens - Amount of premium tokens
 * @property bank - Amount stored in bank
 * @property lastUpdated - Timestamp of last update
 */
export interface UserEconomyData {
  gold: number;
  silver: number;
  saloon_tokens: number;
  bank: number;
  lastUpdated?: number;
}

/**
 * Daily reward system
 */
export interface DailyData {
  [userId: string]: DailyUserData;
}

export interface DailyUserData {
  lastClaim: number;
  streak: number;
}

/**
 * Inventory system
 */
export interface InventoryData {
  [userId: string]: UserInventory;
}

export interface UserInventory {
  items: InventoryItem[];
  maxWeight: number;
  currentWeight: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  weight: number;
  value: number;
  type: ItemType;
}

export type ItemType =
  | "currency"
  | "resource"
  | "tool"
  | "consumable"
  | "treasure"
  | "special";

/**
 * Mining system
 */
export interface MiningData {
  [userId: string]: MiningUserData;
}

export interface MiningUserData {
  backpackCapacity: number;
  lastMiningTime: number;
  totalMined: number;
  activeMining?: ActiveMining;
}

export interface ActiveMining {
  startTime: number;
  duration: number;
  type: "solo" | "coop";
  participants?: string[];
  expectedRewards: number;
}

/**
 * Bounty system
 */
export interface BountyData {
  [targetId: string]: Bounty[];
}

export interface Bounty {
  id: string;
  targetId: string;
  issuerId: string;
  amount: number;
  reason: string;
  timestamp: number;
  active: boolean;
}

/**
 * Profile system
 */
export interface ProfileData {
  [userId: string]: UserProfile;
}

export interface UserProfile {
  userId: string;
  username: string;
  level: number;
  xp: number;
  customBackground?: string;
  badges: string[];
  stats: PlayerStats;
  settings: ProfileSettings;
}

export interface PlayerStats {
  gamesPlayed: number;
  bountiesCaptured: number;
  miningSessions: number;
  totalEarnings: number;
  totalSpent: number;
}

export interface ProfileSettings {
  language: LanguageCode;
  showStats: boolean;
  privateProfile: boolean;
}

export type LanguageCode = "en-US" | "pt-BR" | "es-ES" | "fr";

/**
 * XP system
 */
export interface XPData {
  [userId: string]: XPUserData;
}

export interface XPUserData {
  xp: number;
  level: number;
  lastMessage?: number;
}

export interface XPResult {
  success: boolean;
  newXP: number;
  newLevel: number;
  leveledUp: boolean;
  xpGained: number;
}

/**
 * Territory system
 */
export interface TerritoryData {
  [territoryId: string]: Territory;
}

export interface Territory {
  id: string;
  name: string;
  ownerId: string | null;
  controlledGuildId: string | null;
  income: number;
  defenseLevel: number;
  lastIncomeTime: number;
}

/**
 * Game session types
 */
export interface GameSession {
  id: string;
  type: GameType;
  participants: string[];
  bet: number;
  startTime: number;
  active: boolean;
}

export type GameType = "dice" | "duel" | "roulette" | "bankrob" | "poker";

/**
 * Cooldown management
 */
export interface CooldownMap extends Map<string, Map<string, number>> {}

/**
 * Transaction result
 */
export interface TransactionResult {
  success: boolean;
  message?: string;
  error?: string;
  newBalance?: number;
}

/**
 * Punishment system
 */
export interface PunishmentData {
  [userId: string]: Punishment;
}

export interface Punishment {
  userId: string;
  reason: string;
  startTime: number;
  duration: number;
  active: boolean;
}

/**
 * Logger event types
 */
export type LogEventType =
  | "command"
  | "error"
  | "warning"
  | "transaction"
  | "bounty"
  | "mining"
  | "admin";

export interface LogEntry {
  timestamp: number;
  type: LogEventType;
  guildId: string;
  userId?: string;
  details: Record<string, any>;
}

/**
 * Cache entry
 */
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  uptime: number;
  memoryUsage: NodeJS.MemoryUsage;
  commandsExecuted: number;
  averageCommandTime: number;
  errors: number;
}

/**
 * Environment variables
 */
export interface EnvironmentConfig {
  DISCORD_TOKEN: string;
  CLIENT_ID: string;
  DISCORD_CLIENT_SECRET?: string;
  SESSION_SECRET?: string;
  DATABASE_URL?: string;
  NODE_ENV?: "development" | "production";
  LOW_MEMORY?: string;
  ENABLE_HEALTH_CHECK?: string;
}

/**
 * Error types
 */
export class BotError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: Record<string, any>,
  ) {
    super(message);
    this.name = "BotError";
  }
}

export class EconomyError extends BotError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, "ECONOMY_ERROR", details);
    this.name = "EconomyError";
  }
}

export class InventoryError extends BotError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, "INVENTORY_ERROR", details);
    this.name = "InventoryError";
  }
}

export class DatabaseError extends BotError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, "DATABASE_ERROR", details);
    this.name = "DatabaseError";
  }
}

export class GuildError extends BotError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, "GUILD_ERROR", details);
    this.name = "GuildError";
  }
}

/**
 * Player Guild system (renamed to avoid conflict with Discord.js Guild)
 */
export interface GuildData {
  [guildId: string]: PlayerGuild;
}

export interface PlayerGuild {
  id: string;
  name: string;
  description: string;
  leaderId: string;
  createdAt: number;
  members: GuildMember[];
  level: number;
  xp: number;
  settings: GuildSettings;
}

export interface GuildMember {
  userId: string;
  joinedAt: number;
  role: GuildRole;
}

export type GuildRole = "leader" | "co-leader" | "member";

export interface GuildSettings {
  maxMembers: number;
  isPublic: boolean;
  requireApproval: boolean;
}

export interface UserGuildData {
  [userId: string]: string | null;
}

export interface GuildOperationResult {
  success: boolean;
  message: string;
  guild?: PlayerGuild;
}

export interface JoinRequest {
  id: string;
  userId: string;
  guildId: string;
  requestedAt: number;
  status: "pending" | "approved" | "rejected";
}

export interface JoinRequestData {
  [requestId: string]: JoinRequest;
}
