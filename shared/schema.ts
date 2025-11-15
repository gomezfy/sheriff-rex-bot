import { pgTable, text, integer, boolean, timestamp, jsonb, real, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  userId: text('user_id').primaryKey(),
  username: text('username').notNull(),
  
  gold: integer('gold').notNull().default(0),
  silver: integer('silver').notNull().default(0),
  saloonTokens: integer('saloon_tokens').notNull().default(0),
  bank: integer('bank').notNull().default(0),
  rexBucks: integer('rex_bucks').notNull().default(0),
  
  level: integer('level').notNull().default(1),
  xp: integer('xp').notNull().default(0),
  lastMessage: timestamp('last_message'),
  
  lastClaimDaily: timestamp('last_claim_daily'),
  dailyStreak: integer('daily_streak').notNull().default(0),
  
  customBackground: text('custom_background'),
  isVip: boolean('is_vip').notNull().default(false),
  badges: jsonb('badges').notNull().default([]),
  
  gamesPlayed: integer('games_played').notNull().default(0),
  bountiesCaptured: integer('bounties_captured').notNull().default(0),
  miningSessions: integer('mining_sessions').notNull().default(0),
  totalEarnings: integer('total_earnings').notNull().default(0),
  totalSpent: integer('total_spent').notNull().default(0),
  
  language: text('language').notNull().default('pt-BR'),
  showStats: boolean('show_stats').notNull().default(true),
  privateProfile: boolean('private_profile').notNull().default(false),
  
  backpackCapacity: integer('backpack_capacity').notNull().default(100),
  lastMiningTime: timestamp('last_mining_time'),
  totalMined: integer('total_mined').notNull().default(0),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const inventoryItems = pgTable('inventory_items', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.userId, { onDelete: 'cascade' }),
  itemId: text('item_id').notNull(),
  name: text('name').notNull(),
  quantity: integer('quantity').notNull().default(1),
  weight: real('weight').notNull(),
  value: integer('value').notNull(),
  type: text('type').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  userItemUnique: unique().on(table.userId, table.itemId),
}));

export const bounties = pgTable('bounties', {
  id: text('id').primaryKey(),
  targetId: text('target_id').notNull().references(() => users.userId, { onDelete: 'cascade' }),
  issuerId: text('issuer_id').notNull().references(() => users.userId, { onDelete: 'cascade' }),
  amount: integer('amount').notNull(),
  reason: text('reason').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  active: boolean('active').notNull().default(true),
});

export const activeMining = pgTable('active_mining', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.userId, { onDelete: 'cascade' }),
  startTime: timestamp('start_time').notNull(),
  duration: integer('duration').notNull(),
  type: text('type').notNull(),
  participants: jsonb('participants'),
  expectedRewards: integer('expected_rewards').notNull(),
});

export const territories = pgTable('territories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  ownerId: text('owner_id').references(() => users.userId, { onDelete: 'set null' }),
  controlledGuildId: text('controlled_guild_id'),
  income: integer('income').notNull().default(0),
  defenseLevel: integer('defense_level').notNull().default(1),
  lastIncomeTime: timestamp('last_income_time').notNull().defaultNow(),
});

export const punishments = pgTable('punishments', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.userId, { onDelete: 'cascade' }),
  reason: text('reason').notNull(),
  startTime: timestamp('start_time').notNull(),
  duration: integer('duration').notNull(),
  active: boolean('active').notNull().default(true),
});

export const playerGuilds = pgTable('player_guilds', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description').notNull(),
  leaderId: text('leader_id').notNull().references(() => users.userId, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  level: integer('level').notNull().default(1),
  xp: integer('xp').notNull().default(0),
  maxMembers: integer('max_members').notNull().default(10),
  isPublic: boolean('is_public').notNull().default(true),
  requireApproval: boolean('require_approval').notNull().default(false),
});

export const guildMembers = pgTable('guild_members', {
  id: text('id').primaryKey(),
  guildId: text('guild_id').notNull().references(() => playerGuilds.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.userId, { onDelete: 'cascade' }),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
  role: text('role').notNull().default('member'),
});

export const guildJoinRequests = pgTable('guild_join_requests', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.userId, { onDelete: 'cascade' }),
  guildId: text('guild_id').notNull().references(() => playerGuilds.id, { onDelete: 'cascade' }),
  requestedAt: timestamp('requested_at').notNull().defaultNow(),
  status: text('status').notNull().default('pending'),
});

export const logs = pgTable('logs', {
  id: text('id').primaryKey(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  type: text('type').notNull(),
  guildId: text('guild_id').notNull(),
  userId: text('user_id'),
  details: jsonb('details').notNull(),
});

export const rexBuckTransactions = pgTable('rex_buck_transactions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.userId, { onDelete: 'cascade' }),
  amount: integer('amount').notNull(),
  type: text('type').notNull(),
  redemptionCode: text('redemption_code'),
  balanceBefore: integer('balance_before').notNull(),
  balanceAfter: integer('balance_after').notNull(),
  metadata: jsonb('metadata'),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
});

export const welcomeSettings = pgTable('welcome_settings', {
  guildId: text('guild_id').primaryKey(),
  channelId: text('channel_id'),
  message: text('message'),
  enabled: boolean('enabled').notNull().default(false),
});

export const redemptionCodes = pgTable('redemption_codes', {
  code: text('code').primaryKey(),
  productId: text('product_id').notNull(),
  productName: text('product_name').notNull(),
  tokens: integer('tokens').notNull().default(0),
  coins: integer('coins').notNull().default(0),
  rexBucks: integer('rex_bucks').notNull().default(0),
  vip: boolean('vip').notNull().default(false),
  background: boolean('background').notNull().default(false),
  backpack: integer('backpack'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  createdBy: text('created_by').notNull(),
  redeemed: boolean('redeemed').notNull().default(false),
  redeemedBy: text('redeemed_by'),
  redeemedAt: timestamp('redeemed_at'),
});

export const rexBuckPackages = pgTable('rex_buck_packages', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  amountRexBucks: integer('amount_rexbucks').notNull(),
  bonusRexBucks: integer('bonus_rexbucks').notNull().default(0),
  priceCents: integer('price_cents').notNull(),
  currency: text('currency').notNull().default('BRL'),
  active: boolean('active').notNull().default(true),
  displayOrder: integer('display_order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const mercadoPagoPayments = pgTable('mercadopago_payments', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.userId, { onDelete: 'cascade' }),
  packageId: text('package_id').notNull().references(() => rexBuckPackages.id),
  externalReference: text('external_reference').notNull().unique(),
  preferenceId: text('preference_id'),
  mpPaymentId: text('mp_payment_id').unique(),
  status: text('status').notNull().default('pending'),
  amount: integer('amount').notNull(),
  currency: text('currency').notNull().default('BRL'),
  paidAt: timestamp('paid_at'),
  rawPayload: jsonb('raw_payload'),
  processed: boolean('processed').notNull().default(false),
  rexBuckTransactionId: text('rex_buck_transaction_id'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  inventoryItems: many(inventoryItems),
  issuedBounties: many(bounties, { relationName: 'issuer' }),
  targetedBounties: many(bounties, { relationName: 'target' }),
  activeMining: many(activeMining),
  territories: many(territories),
  punishments: many(punishments),
  guildMemberships: many(guildMembers),
  guildJoinRequests: many(guildJoinRequests),
  rexBuckTransactions: many(rexBuckTransactions),
}));

export const inventoryItemsRelations = relations(inventoryItems, ({ one }) => ({
  user: one(users, {
    fields: [inventoryItems.userId],
    references: [users.userId],
  }),
}));

export const bountiesRelations = relations(bounties, ({ one }) => ({
  target: one(users, {
    fields: [bounties.targetId],
    references: [users.userId],
    relationName: 'target',
  }),
  issuer: one(users, {
    fields: [bounties.issuerId],
    references: [users.userId],
    relationName: 'issuer',
  }),
}));

export const activeMiningRelations = relations(activeMining, ({ one }) => ({
  user: one(users, {
    fields: [activeMining.userId],
    references: [users.userId],
  }),
}));

export const territoriesRelations = relations(territories, ({ one }) => ({
  owner: one(users, {
    fields: [territories.ownerId],
    references: [users.userId],
  }),
}));

export const punishmentsRelations = relations(punishments, ({ one }) => ({
  user: one(users, {
    fields: [punishments.userId],
    references: [users.userId],
  }),
}));

export const playerGuildsRelations = relations(playerGuilds, ({ one, many }) => ({
  leader: one(users, {
    fields: [playerGuilds.leaderId],
    references: [users.userId],
  }),
  members: many(guildMembers),
  joinRequests: many(guildJoinRequests),
}));

export const guildMembersRelations = relations(guildMembers, ({ one }) => ({
  guild: one(playerGuilds, {
    fields: [guildMembers.guildId],
    references: [playerGuilds.id],
  }),
  user: one(users, {
    fields: [guildMembers.userId],
    references: [users.userId],
  }),
}));

export const guildJoinRequestsRelations = relations(guildJoinRequests, ({ one }) => ({
  user: one(users, {
    fields: [guildJoinRequests.userId],
    references: [users.userId],
  }),
  guild: one(playerGuilds, {
    fields: [guildJoinRequests.guildId],
    references: [playerGuilds.id],
  }),
}));

export const rexBuckTransactionsRelations = relations(rexBuckTransactions, ({ one }) => ({
  user: one(users, {
    fields: [rexBuckTransactions.userId],
    references: [users.userId],
  }),
}));

export const redemptionCodesRelations = relations(redemptionCodes, ({ one }) => ({
  redeemedByUser: one(users, {
    fields: [redemptionCodes.redeemedBy],
    references: [users.userId],
  }),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type InventoryItem = typeof inventoryItems.$inferSelect;
export type InsertInventoryItem = typeof inventoryItems.$inferInsert;
export type Bounty = typeof bounties.$inferSelect;
export type InsertBounty = typeof bounties.$inferInsert;
export type Territory = typeof territories.$inferSelect;
export type InsertTerritory = typeof territories.$inferInsert;
export type Punishment = typeof punishments.$inferSelect;
export type InsertPunishment = typeof punishments.$inferInsert;
export type PlayerGuild = typeof playerGuilds.$inferSelect;
export type InsertPlayerGuild = typeof playerGuilds.$inferInsert;
export type GuildMember = typeof guildMembers.$inferSelect;
export type InsertGuildMember = typeof guildMembers.$inferInsert;
export type WelcomeSetting = typeof welcomeSettings.$inferSelect;
export type InsertWelcomeSetting = typeof welcomeSettings.$inferInsert;
export type RexBuckTransaction = typeof rexBuckTransactions.$inferSelect;
export type InsertRexBuckTransaction = typeof rexBuckTransactions.$inferInsert;
export type RedemptionCode = typeof redemptionCodes.$inferSelect;
export type InsertRedemptionCode = typeof redemptionCodes.$inferInsert;
