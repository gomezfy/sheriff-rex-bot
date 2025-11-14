/**
 * Transaction Lock Manager
 * Prevents race conditions in economy operations by ensuring
 * only one operation per user can run at a time
 * 
 * Fixed implementation using promise chaining to serialize access
 */

class TransactionLockManager {
  private locks: Map<string, Promise<void>> = new Map();
  private lockTimeout: number = 30000; // 30 seconds max lock time

  /**
   * Acquire a lock for a user
   * Returns a promise that resolves when the lock is acquired
   * Uses promise chaining to ensure serial execution
   * @param userId
   */
  async acquire(userId: string): Promise<() => void> {
    // Get current lock promise or create resolved one
    const currentLock = this.locks.get(userId) || Promise.resolve();

    // Create new lock promise that will be resolved when this operation completes
    let releaseLock: () => void;
    const newLockPromise = new Promise<void>((resolve) => {
      releaseLock = resolve;
    });

    // Chain the new lock to wait for the current one
    const chainedPromise = currentLock.then(() => newLockPromise);
    this.locks.set(userId, chainedPromise);

    // Wait for the current lock to release before proceeding
    await currentLock;

    // Set timeout to auto-release stuck locks
    const timeoutId = setTimeout(() => {
      if (this.locks.get(userId) === chainedPromise) {
        console.warn(`⚠️  Lock timeout for user ${userId} - force releasing`);
        releaseLock();
        this.locks.delete(userId);
      }
    }, this.lockTimeout);

    // Return release function that clears timeout and resolves the lock
    return () => {
      clearTimeout(timeoutId);
      releaseLock();
      // Clean up if this is the last lock in the chain
      if (this.locks.get(userId) === chainedPromise) {
        this.locks.delete(userId);
      }
    };
  }

  /**
   * Execute a function with a lock
   * Automatically acquires and releases the lock
   * @param userId
   * @param fn
   */
  async withLock<T>(userId: string, fn: () => T | Promise<T>): Promise<T> {
    const release = await this.acquire(userId);

    try {
      const result = await Promise.resolve(fn());
      return result;
    } finally {
      release();
    }
  }

  /**
   * Execute a function with multiple locks (for transfers between users)
   * Locks are acquired in sorted order to prevent deadlocks
   * @param userIds
   * @param fn
   */
  async withMultipleLocks<T>(
    userIds: string[],
    fn: () => T | Promise<T>,
  ): Promise<T> {
    // Sort user IDs to prevent deadlocks (always acquire in same order)
    const sortedIds = [...new Set(userIds)].sort();

    const releases: Array<() => void> = [];

    try {
      // Acquire all locks in order
      for (const userId of sortedIds) {
        const release = await this.acquire(userId);
        releases.push(release);
      }

      // Execute the function
      const result = await Promise.resolve(fn());
      return result;
    } finally {
      // Release all locks in reverse order
      for (const release of releases.reverse()) {
        release();
      }
    }
  }

  /**
   * Check if a user currently has a lock
   * @param userId
   */
  isLocked(userId: string): boolean {
    return this.locks.has(userId);
  }

  /**
   * Get statistics about current locks
   */
  getStats(): { totalLocks: number; lockedUsers: string[] } {
    return {
      totalLocks: this.locks.size,
      lockedUsers: Array.from(this.locks.keys()),
    };
  }
}

export const transactionLock = new TransactionLockManager();
