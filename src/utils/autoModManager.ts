/**
 * AutoMod Manager for Sheriff Bot
 * Manages Discord AutoMod rules to earn the AutoMod badge
 * Requirement: 100+ active AutoMod rules across all servers
 */

import {
  Guild,
  AutoModerationRule,
  AutoModerationRuleTriggerType,
  AutoModerationRuleEventType,
  AutoModerationActionType,
  PermissionFlagsBits,
} from "discord.js";

export interface AutoModRuleConfig {
  name: string;
  eventType: AutoModerationRuleEventType;
  triggerType: AutoModerationRuleTriggerType;
  triggerMetadata?: {
    keywordFilter?: string[];
    regexPatterns?: string[];
    presets?: number[];
    mentionTotalLimit?: number;
  };
  actions: Array<{
    type: AutoModerationActionType;
    metadata?: {
      channelId?: string;
      durationSeconds?: number;
      customMessage?: string;
    };
  }>;
  enabled?: boolean;
  exemptRoles?: string[];
  exemptChannels?: string[];
}

/**
 * Default AutoMod rule configurations for the western theme
 */
export const WESTERN_AUTOMOD_RULES: Omit<AutoModRuleConfig, "actions">[] = [
  {
    name: "🤠 Sheriff - Spam Protection",
    eventType: AutoModerationRuleEventType.MessageSend,
    triggerType: AutoModerationRuleTriggerType.Spam,
    enabled: true,
  },
  {
    name: "🤠 Sheriff - Mention Spam (5 limit)",
    eventType: AutoModerationRuleEventType.MessageSend,
    triggerType: AutoModerationRuleTriggerType.MentionSpam,
    triggerMetadata: {
      mentionTotalLimit: 5,
    },
    enabled: true,
  },
  {
    name: "🤠 Sheriff - Sexual Content Block",
    eventType: AutoModerationRuleEventType.MessageSend,
    triggerType: AutoModerationRuleTriggerType.KeywordPreset,
    triggerMetadata: {
      presets: [1, 3], // 1 = Profanity, 3 = Sexual Content
    },
    enabled: true,
  },
  {
    name: "🤠 Sheriff - Profanity Filter",
    eventType: AutoModerationRuleEventType.MessageSend,
    triggerType: AutoModerationRuleTriggerType.Keyword,
    triggerMetadata: {
      keywordFilter: ["scam", "free nitro", "discord.gift", "steal"],
    },
    enabled: true,
  },
  {
    name: "🤠 Sheriff - Invite Links Block",
    eventType: AutoModerationRuleEventType.MessageSend,
    triggerType: AutoModerationRuleTriggerType.Keyword,
    triggerMetadata: {
      regexPatterns: [
        "discord\\.gg\\/[a-zA-Z0-9]+",
        "discord\\.com\\/invite\\/[a-zA-Z0-9]+",
      ],
    },
    enabled: true,
  },
  {
    name: "🤠 Sheriff - Suspicious Links",
    eventType: AutoModerationRuleEventType.MessageSend,
    triggerType: AutoModerationRuleTriggerType.Keyword,
    triggerMetadata: {
      regexPatterns: ["bit\\.ly", "tinyurl\\.com", "grabify"],
    },
    enabled: true,
  },
];

export class AutoModManager {
  /**
   * Creates default AutoMod rules in a guild
   * @param guild
   * @param logChannelId
   */
  static async setupDefaultRules(
    guild: Guild,
    logChannelId?: string,
  ): Promise<AutoModerationRule[]> {
    const createdRules: AutoModerationRule[] = [];

    // Check bot permissions
    const botMember = await guild.members.fetch(guild.client.user.id);
    if (!botMember.permissions.has(PermissionFlagsBits.ManageGuild)) {
      throw new Error(
        'Bot needs "Manage Server" permission to create AutoMod rules',
      );
    }

    // Default actions for all rules
    const defaultActions = [
      { type: AutoModerationActionType.BlockMessage },
      ...(logChannelId
        ? [
            {
              type: AutoModerationActionType.SendAlertMessage,
              metadata: { channelId: logChannelId },
            },
          ]
        : []),
    ];

    for (const ruleConfig of WESTERN_AUTOMOD_RULES) {
      try {
        const rule = await guild.autoModerationRules.create({
          name: ruleConfig.name,
          eventType: ruleConfig.eventType,
          triggerType: ruleConfig.triggerType,
          triggerMetadata: ruleConfig.triggerMetadata as any,
          actions: defaultActions as any,
          enabled: ruleConfig.enabled ?? true,
          exemptRoles: ruleConfig.exemptRoles,
          exemptChannels: ruleConfig.exemptChannels,
        });

        createdRules.push(rule);
      } catch (error: any) {
        // Skip if rule already exists or max rules reached
        if (error.code === 50035 || error.code === 160004) {
          continue;
        }
        console.error(
          `Failed to create rule "${ruleConfig.name}":`,
          error.message,
        );
      }
    }

    return createdRules;
  }

  /**
   * Gets total AutoMod rules count across all guilds (shard-aware)
   * @param client
   */
  static async getTotalRulesCount(client: any): Promise<number> {
    if (!client.shard) {
      // Single shard or no sharding - use local cache
      const guilds = Array.from(client.guilds.cache.values() as any);
      let totalCount = 0;

      for (const guild of guilds) {
        try {
          const rules = await (guild as any).autoModerationRules.fetch();
          totalCount += rules.size;
        } catch (error) {
          console.error(
            `Failed to fetch rules for guild ${(guild as any).name}:`,
            error,
          );
        }
      }

      return totalCount;
    }

    // Multi-shard - aggregate across all shards
    const results = await client.shard.broadcastEval(async (c: any) => {
      let count = 0;
      for (const guild of c.guilds.cache.values() as any) {
        try {
          const rules = await (guild as any).autoModerationRules.fetch();
          count += rules.size;
        } catch (error) {
          // Skip guilds we can't access
        }
      }
      return count;
    });

    return results.reduce((acc: number, val: number) => acc + val, 0);
  }

  /**
   * Gets detailed rules information for all guilds (shard-aware)
   * @param client
   */
  static async getDetailedRulesInfo(client: any): Promise<{
    totalRules: number;
    guildsWithRules: number;
    totalGuilds: number;
    rulesPerGuild: Map<string, number>;
    badgeProgress: number;
  }> {
    if (!client.shard) {
      // Single shard or no sharding - use local cache
      const guilds = Array.from(client.guilds.cache.values() as any);
      const rulesPerGuild = new Map<string, number>();
      let totalRules = 0;
      let guildsWithRules = 0;

      for (const guild of guilds) {
        try {
          const rules = await (guild as any).autoModerationRules.fetch();
          const count = rules.size;

          if (count > 0) {
            guildsWithRules++;
            rulesPerGuild.set((guild as any).name, count);
            totalRules += count;
          }
        } catch (error) {
          console.error(
            `Failed to fetch rules for guild ${(guild as any).name}:`,
            error,
          );
        }
      }

      const badgeProgress = Math.min(100, (totalRules / 100) * 100);

      return {
        totalRules,
        guildsWithRules,
        totalGuilds: guilds.length,
        rulesPerGuild,
        badgeProgress,
      };
    }

    // Multi-shard - aggregate across all shards
    const shardResults = await client.shard.broadcastEval(async (c: any) => {
      const guildsInfo: Array<{ name: string; count: number }> = [];
      let totalRules = 0;
      let guildsWithRules = 0;

      for (const guild of c.guilds.cache.values() as any) {
        try {
          const rules = await (guild as any).autoModerationRules.fetch();
          const count = rules.size;

          if (count > 0) {
            guildsWithRules++;
            guildsInfo.push({ name: (guild as any).name, count });
            totalRules += count;
          }
        } catch (error) {
          // Skip guilds we can't access
        }
      }

      return {
        guildsInfo,
        totalRules,
        guildsWithRules,
        totalGuilds: c.guilds.cache.size,
      };
    });

    // Aggregate results from all shards
    const rulesPerGuild = new Map<string, number>();
    let totalRules = 0;
    let guildsWithRules = 0;
    let totalGuilds = 0;

    for (const result of shardResults) {
      totalRules += result.totalRules;
      guildsWithRules += result.guildsWithRules;
      totalGuilds += result.totalGuilds;

      for (const guild of result.guildsInfo) {
        rulesPerGuild.set(guild.name, guild.count);
      }
    }

    const badgeProgress = Math.min(100, (totalRules / 100) * 100);

    return {
      totalRules,
      guildsWithRules,
      totalGuilds,
      rulesPerGuild,
      badgeProgress,
    };
  }

  /**
   * Removes all AutoMod rules from a guild
   * @param guild
   */
  static async clearGuildRules(guild: Guild): Promise<number> {
    const rules = await guild.autoModerationRules.fetch();
    let deletedCount = 0;

    for (const rule of rules.values()) {
      try {
        await rule.delete();
        deletedCount++;
      } catch (error) {
        console.error(`Failed to delete rule "${rule.name}":`, error);
      }
    }

    return deletedCount;
  }

  /**
   * Creates a custom AutoMod rule
   * @param guild
   * @param config
   */
  static async createCustomRule(
    guild: Guild,
    config: AutoModRuleConfig,
  ): Promise<AutoModerationRule> {
    const botMember = await guild.members.fetch(guild.client.user.id);
    if (!botMember.permissions.has(PermissionFlagsBits.ManageGuild)) {
      throw new Error(
        'Bot needs "Manage Server" permission to create AutoMod rules',
      );
    }

    return await guild.autoModerationRules.create({
      name: config.name,
      eventType: config.eventType,
      triggerType: config.triggerType,
      triggerMetadata: config.triggerMetadata as any,
      actions: config.actions as any,
      enabled: config.enabled ?? true,
      exemptRoles: config.exemptRoles,
      exemptChannels: config.exemptChannels,
    });
  }
}
