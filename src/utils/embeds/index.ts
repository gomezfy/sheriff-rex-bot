// Re-export all embed templates and builders from a central barrel file
export { BasicEmbedTemplates } from "./templates/basicEmbeds";
export { ThemeEmbedTemplates } from "./templates/themeEmbeds";
export { SpecialEmbedTemplates } from "./templates/specialEmbeds";
export { EmbedFieldBuilder } from "./builders/fieldBuilder";
export {
  formatNumber,
  formatTime,
  createProgressBar,
  truncateText,
} from "./formatters";

// Combined EmbedTemplates class for backward compatibility
import { BasicEmbedTemplates } from "./templates/basicEmbeds";
import { ThemeEmbedTemplates } from "./templates/themeEmbeds";
import { SpecialEmbedTemplates } from "./templates/specialEmbeds";

export class EmbedTemplates {
  static success = BasicEmbedTemplates.success;
  static error = BasicEmbedTemplates.error;
  static warning = BasicEmbedTemplates.warning;
  static info = BasicEmbedTemplates.info;
  static gold = BasicEmbedTemplates.gold;
  static western = ThemeEmbedTemplates.western;
  static bounty = ThemeEmbedTemplates.bounty;
  static mining = ThemeEmbedTemplates.mining;
  static leaderboard = ThemeEmbedTemplates.leaderboard;
  static announcement = ThemeEmbedTemplates.announcement;
  static profile = SpecialEmbedTemplates.profile;
  static economy = SpecialEmbedTemplates.economy;
  static cooldown = SpecialEmbedTemplates.cooldown;
  static pagination = SpecialEmbedTemplates.pagination;
}
