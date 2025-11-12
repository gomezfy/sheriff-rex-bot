import { ChatInputCommandInteraction, MessageFlags } from "discord.js";
import { CooldownMap } from "../types";

/**
 * Cooldown Manager - Manages command cooldowns for users
 */
export class CooldownManager {
  private cooldowns: CooldownMap = new Map();
  private readonly defaultCooldown: number;

  constructor(defaultCooldown: number = 1000) {
    this.defaultCooldown = defaultCooldown;
  }

  /**
   * Check if a user is on cooldown for a specific command
   * @param commandName - The name of the command
   * @param userId - The user's Discord ID
   * @param customCooldown - Optional custom cooldown duration in milliseconds
   * @returns Object with isOnCooldown status and timeLeft in seconds
   */
  public check(
    commandName: string,
    userId: string,
    customCooldown?: number,
  ): { isOnCooldown: boolean; timeLeft: number } {
    const now = Date.now();
    const cooldownAmount = customCooldown || this.defaultCooldown;

    if (!this.cooldowns.has(commandName)) {
      this.cooldowns.set(commandName, new Map());
    }

    const timestamps = this.cooldowns.get(commandName)!;
    const lastUsed = timestamps.get(userId);

    if (lastUsed) {
      const expirationTime = lastUsed + cooldownAmount;
      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000;
        return { isOnCooldown: true, timeLeft };
      }
    }

    return { isOnCooldown: false, timeLeft: 0 };
  }

  /**
   * Set a cooldown for a user on a specific command
   * @param commandName - The name of the command
   * @param userId - The user's Discord ID
   * @param customCooldown - Optional custom cooldown duration in milliseconds
   */
  public set(
    commandName: string,
    userId: string,
    customCooldown?: number,
  ): void {
    const now = Date.now();
    const cooldownAmount = customCooldown || this.defaultCooldown;

    if (!this.cooldowns.has(commandName)) {
      this.cooldowns.set(commandName, new Map());
    }

    const timestamps = this.cooldowns.get(commandName)!;
    timestamps.set(userId, now);

    // Auto-cleanup after cooldown expires
    setTimeout(() => {
      timestamps.delete(userId);
    }, cooldownAmount);
  }

  /**
   * Handle cooldown check and automatically reply to interaction if on cooldown
   * Safely handles both replied and deferred interactions
   * @param interaction - The command interaction
   * @param commandName - The name of the command
   * @param customCooldown - Optional custom cooldown duration in milliseconds
   * @returns true if user is on cooldown (and reply was sent), false if not on cooldown
   */
  public async handleCooldown(
    interaction: ChatInputCommandInteraction,
    commandName: string,
    customCooldown?: number,
  ): Promise<boolean> {
    const { isOnCooldown, timeLeft } = this.check(
      commandName,
      interaction.user.id,
      customCooldown,
    );

    if (isOnCooldown) {
      const message = `⏰ Please wait ${timeLeft.toFixed(1)}s before using \`/${commandName}\` again.`;

      // Handle different interaction states
      if (interaction.replied || interaction.deferred) {
        await interaction.editReply({ content: message });
      } else {
        await interaction.reply({
          content: message,
          flags: MessageFlags.Ephemeral,
        });
      }
      return true;
    }

    this.set(commandName, interaction.user.id, customCooldown);
    return false;
  }

  /**
   * Clear cooldown for a specific user on a command
   * @param commandName - The name of the command
   * @param userId - The user's Discord ID
   */
  public clear(commandName: string, userId: string): void {
    const timestamps = this.cooldowns.get(commandName);
    if (timestamps) {
      timestamps.delete(userId);
    }
  }

  /**
   * Clear all cooldowns for a command
   * @param commandName - The name of the command
   */
  public clearCommand(commandName: string): void {
    this.cooldowns.delete(commandName);
  }

  /**
   * Clear all cooldowns
   */
  public clearAll(): void {
    this.cooldowns.clear();
  }

  /**
   * Get statistics about current cooldowns
   */
  public getStats(): { totalCommands: number; totalUsers: number } {
    let totalUsers = 0;
    for (const timestamps of this.cooldowns.values()) {
      totalUsers += timestamps.size;
    }

    return {
      totalCommands: this.cooldowns.size,
      totalUsers,
    };
  }
}

/**
 * Global cooldown manager instance
 */
export const globalCooldownManager = new CooldownManager(1000);
