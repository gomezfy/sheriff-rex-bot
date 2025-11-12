/**
 * Message throttler to prevent excessive XP processing
 * Reduces memory usage by limiting how often users can gain XP
 */

const xpCooldowns = new Map<string, number>();
const XP_COOLDOWN = 60000; // 1 minute between XP gains

/**
 * Check if user can gain XP
 * @param userId - The user ID to check
 * @returns True if user can gain XP, false if on cooldown
 */
export function canGainXp(userId: string): boolean {
  const now = Date.now();
  const lastXp = xpCooldowns.get(userId);

  if (!lastXp || now - lastXp >= XP_COOLDOWN) {
    xpCooldowns.set(userId, now);
    return true;
  }

  return false;
}

/**
 * Clean up old cooldown entries (run periodically)
 * Prevents memory leaks from inactive users
 */
export function cleanupCooldowns(): void {
  const now = Date.now();
  for (const [userId, timestamp] of xpCooldowns.entries()) {
    if (now - timestamp > XP_COOLDOWN * 2) {
      xpCooldowns.delete(userId);
    }
  }
}

// Auto-cleanup every 5 minutes
setInterval(cleanupCooldowns, 5 * 60 * 1000);
