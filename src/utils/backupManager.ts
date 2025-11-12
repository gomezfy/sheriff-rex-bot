/**
 * Automatic backup system for JSON data files
 * Creates daily backups with rotation (keeps last 7 days)
 */

import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";
import { getDataPath } from "./database";

export class BackupManager {
  private dataDir: string;
  private backupDir: string;
  private maxBackups: number = 7; // Keep last 7 days
  private backupTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.dataDir = getDataPath("data");
    this.backupDir = path.join(this.dataDir, "backups");

    // Create backup directory if it doesn't exist
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
      console.log("📁 Created backup directory");
    }
  }

  /**
   * Starts automatic daily backups
   */
  startAutomaticBackups(): void {
    // Create first backup immediately
    this.createBackup();

    // Schedule daily backups at 3 AM
    const scheduleNextBackup = () => {
      const now = new Date();
      const next3AM = new Date();
      next3AM.setHours(3, 0, 0, 0);

      // If it's past 3 AM today, schedule for tomorrow
      if (now > next3AM) {
        next3AM.setDate(next3AM.getDate() + 1);
      }

      const msUntilBackup = next3AM.getTime() - now.getTime();

      this.backupTimer = setTimeout(() => {
        this.createBackup();
        scheduleNextBackup(); // Schedule next day
      }, msUntilBackup);

      const hoursUntil = Math.floor(msUntilBackup / (1000 * 60 * 60));
      console.log(`💾 Next automatic backup in ${hoursUntil} hours`);
    };

    scheduleNextBackup();
    console.log("✅ Automatic daily backups enabled");
  }

  /**
   * Stops automatic backups
   */
  stopAutomaticBackups(): void {
    if (this.backupTimer) {
      clearTimeout(this.backupTimer);
      this.backupTimer = null;
      console.log("⏹️  Automatic backups stopped");
    }
  }

  /**
   * Creates a backup of all data files
   */
  createBackup(): boolean {
    try {
      const timestamp = new Date()
        .toISOString()
        .replace(/:/g, "-")
        .split(".")[0];
      const backupFileName = `backup-${timestamp}.zip`;
      const backupPath = path.join(this.backupDir, backupFileName);

      const zip = new AdmZip();

      // Files to backup
      const filesToBackup = [
        "economy.json",
        "inventory.json",
        "bounties.json",
        "welcome.json",
        "logs.json",
        "wanted.json",
        "territories.json",
        "territory-income.json",
        "xp.json",
        "profiles.json",
        "guild-config.json",
        "expedition.json",
        "daily.json",
        "mining.json",
      ];

      let backedUpCount = 0;

      for (const file of filesToBackup) {
        const filePath = path.join(this.dataDir, file);
        if (fs.existsSync(filePath)) {
          zip.addLocalFile(filePath);
          backedUpCount++;
        }
      }

      // Write zip file
      zip.writeZip(backupPath);

      // Clean old backups
      this.rotateBackups();

      const sizeKB = (fs.statSync(backupPath).size / 1024).toFixed(2);
      console.log(
        `💾 Backup created: ${backupFileName} (${sizeKB} KB, ${backedUpCount} files)`,
      );

      return true;
    } catch (error: any) {
      console.error("❌ Failed to create backup:", error.message);
      return false;
    }
  }

  /**
   * Deletes old backups, keeping only the most recent ones
   */
  private rotateBackups(): void {
    try {
      const files = fs
        .readdirSync(this.backupDir)
        .filter((f) => f.startsWith("backup-") && f.endsWith(".zip"))
        .map((f) => ({
          name: f,
          path: path.join(this.backupDir, f),
          time: fs.statSync(path.join(this.backupDir, f)).mtime.getTime(),
        }))
        .sort((a, b) => b.time - a.time); // Sort by newest first

      // Delete old backups beyond maxBackups
      if (files.length > this.maxBackups) {
        const toDelete = files.slice(this.maxBackups);
        for (const file of toDelete) {
          fs.unlinkSync(file.path);
          console.log(`🗑️  Deleted old backup: ${file.name}`);
        }
      }
    } catch (error: any) {
      console.error("Failed to rotate backups:", error.message);
    }
  }

  /**
   * Restores data from a backup file
   * @param backupFileName
   */
  async restoreBackup(backupFileName: string): Promise<boolean> {
    try {
      const backupPath = path.join(this.backupDir, backupFileName);

      if (!fs.existsSync(backupPath)) {
        console.error(`Backup file not found: ${backupFileName}`);
        return false;
      }

      const zip = new AdmZip(backupPath);
      zip.extractAllTo(this.dataDir, true);

      console.log(`✅ Restored backup: ${backupFileName}`);
      return true;
    } catch (error: any) {
      console.error("Failed to restore backup:", error.message);
      return false;
    }
  }

  /**
   * Lists all available backups
   */
  listBackups(): Array<{ name: string; date: Date; sizeKB: number }> {
    try {
      return fs
        .readdirSync(this.backupDir)
        .filter((f) => f.startsWith("backup-") && f.endsWith(".zip"))
        .map((f) => {
          const filePath = path.join(this.backupDir, f);
          const stats = fs.statSync(filePath);
          return {
            name: f,
            date: stats.mtime,
            sizeKB: parseFloat((stats.size / 1024).toFixed(2)),
          };
        })
        .sort((a, b) => b.date.getTime() - a.date.getTime());
    } catch (error: any) {
      console.error("Failed to list backups:", error.message);
      return [];
    }
  }
}

// Export singleton instance
export const backupManager = new BackupManager();
