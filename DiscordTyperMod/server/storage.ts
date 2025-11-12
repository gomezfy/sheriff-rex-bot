import { db } from './db';
import {
  users,
  inventoryItems,
  bounties,
  activeMining,
  territories,
  punishments,
  playerGuilds,
  guildMembers,
  guildJoinRequests,
  logs,
  welcomeSettings,
  type User,
  type InsertUser,
  type Bounty,
  type InsertBounty,
  type InventoryItem,
  type InsertInventoryItem,
  type WelcomeSetting,
  type InsertWelcomeSetting,
} from '../shared/schema';
import { eq, and, desc } from 'drizzle-orm';

export class DatabaseStorage {
  async getUser(userId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.userId, userId));
    return user || undefined;
  }

  async createUser(userId: string, username: string): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({ userId, username })
      .onConflictDoUpdate({
        target: users.userId,
        set: { username, updatedAt: new Date() },
      })
      .returning();
    return user;
  }

  async updateUserEconomy(
    userId: string,
    data: Partial<Pick<User, 'gold' | 'silver' | 'saloonTokens' | 'bank'>>
  ): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.userId, userId))
      .returning();
    return user;
  }

  async updateUserProfile(
    userId: string,
    data: Partial<Pick<User, 'customBackground' | 'badges' | 'language' | 'showStats' | 'privateProfile'>>
  ): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.userId, userId))
      .returning();
    return user;
  }

  async updateUserXP(userId: string, xp: number, level: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ xp, level, updatedAt: new Date() })
      .where(eq(users.userId, userId))
      .returning();
    return user;
  }

  async updateUserStats(
    userId: string,
    stats: Partial<Pick<User, 'gamesPlayed' | 'bountiesCaptured' | 'miningSessions' | 'totalEarnings' | 'totalSpent'>>
  ): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...stats, updatedAt: new Date() })
      .where(eq(users.userId, userId))
      .returning();
    return user;
  }

  async updateDailyStreak(userId: string, lastClaimDaily: Date, dailyStreak: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ lastClaimDaily, dailyStreak, updatedAt: new Date() })
      .where(eq(users.userId, userId))
      .returning();
    return user;
  }

  async getUserInventory(userId: string): Promise<InventoryItem[]> {
    return await db.select().from(inventoryItems).where(eq(inventoryItems.userId, userId));
  }

  async addInventoryItem(item: InsertInventoryItem): Promise<InventoryItem> {
    const [newItem] = await db.insert(inventoryItems).values(item).returning();
    return newItem;
  }

  async updateInventoryItem(id: string, quantity: number): Promise<InventoryItem> {
    const [item] = await db
      .update(inventoryItems)
      .set({ quantity })
      .where(eq(inventoryItems.id, id))
      .returning();
    return item;
  }

  async removeInventoryItem(id: string): Promise<void> {
    await db.delete(inventoryItems).where(eq(inventoryItems.id, id));
  }

  async getActiveBounties(): Promise<Bounty[]> {
    return await db.select().from(bounties).where(eq(bounties.active, true)).orderBy(desc(bounties.timestamp));
  }

  async getBountiesForTarget(targetId: string): Promise<Bounty[]> {
    return await db
      .select()
      .from(bounties)
      .where(and(eq(bounties.targetId, targetId), eq(bounties.active, true)));
  }

  async createBounty(bounty: InsertBounty): Promise<Bounty> {
    const [newBounty] = await db.insert(bounties).values(bounty).returning();
    return newBounty;
  }

  async deactivateBounty(id: string): Promise<void> {
    await db.update(bounties).set({ active: false }).where(eq(bounties.id, id));
  }

  async getWelcomeSettings(guildId: string): Promise<WelcomeSetting | undefined> {
    const [settings] = await db.select().from(welcomeSettings).where(eq(welcomeSettings.guildId, guildId));
    return settings || undefined;
  }

  async setWelcomeSettings(settings: InsertWelcomeSetting): Promise<WelcomeSetting> {
    const [result] = await db
      .insert(welcomeSettings)
      .values(settings)
      .onConflictDoUpdate({
        target: welcomeSettings.guildId,
        set: settings,
      })
      .returning();
    return result;
  }

  async getTopUsers(limit: number = 10): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(desc(users.gold))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
