import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  Message,
  MessageFlags,
} from "discord.js";
import { getUserSilver, addUserSilver } from "../../utils/dataManager";
import { addItem } from "../../utils/inventoryManager";
const {
  applyPunishment,
  isPunished,
  formatTime,
  getRemainingTime,
} = require("../../utils/punishmentManager");
import { createAutoWanted } from "../../utils/autoWanted";
import {
  getMuteEmoji,
  getBankEmoji,
  getMoneybagEmoji,
  getRevolverEmoji,
  getCowboysEmoji,
  getSilverCoinEmoji,
  getGoldBarEmoji,
  getClockEmoji,
  getCancelEmoji,
  getBalanceEmoji,
  getAlarmEmoji,
  getRunningCowboyEmoji,
  getDartEmoji,
  getWarningEmoji,
} from "../../utils/customEmojis";
import { t, getLocale } from "../../utils/i18n";
import { formatDuration } from "../../utils/embeds";

const activeRobberies = new Map();
const cooldowns = new Map();

export default {
  data: new SlashCommandBuilder()
    .setName("bankrob")
    .setDescription(
      "Start a bank robbery! Find a partner and rob the bank together!",
    )
    .addUserOption((option) =>
      option
        .setName("partner")
        .setDescription("Choose your partner for the robbery")
        .setRequired(true),
    ),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const userId = interaction.user.id;
    const partner = interaction.options.getUser("partner", true);

    // Can't rob with yourself
    if (partner.id === userId) {
      const cancelEmoji = getCancelEmoji();
      await interaction.reply({
        content: `${cancelEmoji} ${t(interaction, "bankrob_cant_rob_alone")}`,
        flags: [MessageFlags.Ephemeral],
      });
      return;
    }

    // Can't rob with bots
    if (partner.bot) {
      const cancelEmoji = getCancelEmoji();
      await interaction.reply({
        content: `${cancelEmoji} ${t(interaction, "bankrob_bots_cant_help")}`,
        flags: [MessageFlags.Ephemeral],
      });
      return;
    }

    // Check if user is punished (in jail)
    const punishment = isPunished(userId);
    if (punishment) {
      const remaining = getRemainingTime(userId);
      const lockEmoji = getMuteEmoji();
      const timerEmoji = getClockEmoji();
      await interaction.reply({
        content: `${lockEmoji} **${t(interaction, "bankrob_in_jail")}**\n\n${punishment.reason}\n\n${timerEmoji} ${t(interaction, "bankrob_time_remaining")}: **${formatTime(remaining)}**\n\n${t(interaction, "bankrob_in_jail_desc")}`,
        flags: [MessageFlags.Ephemeral],
      });
      return;
    }

    const now = Date.now();
    const cooldownAmount = 300000; // 5 minutes

    if (cooldowns.has(userId)) {
      const expirationTime = cooldowns.get(userId) + cooldownAmount;

      if (now < expirationTime) {
        const timeLeft = Math.ceil((expirationTime - now) / 1000 / 60);
        const timerEmoji = getClockEmoji();
        await interaction.reply({
          content: `${timerEmoji} ${t(interaction, "bankrob_sheriff_watching", { time: timeLeft })}`,
          flags: [MessageFlags.Ephemeral],
        });
        return;
      }
    }

    if (activeRobberies.has(userId)) {
      const cancelEmoji = getCancelEmoji();
      await interaction.reply({
        content: `${cancelEmoji} ${t(interaction, "bankrob_already_active")}`,
        flags: [MessageFlags.Ephemeral],
      });
      return;
    }

    const joinButton = new ButtonBuilder()
      .setCustomId(`bankrob_join_${userId}`)
      .setLabel(t(interaction, "bankrob_join_btn"))
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(joinButton);

    const bankEmoji = getBankEmoji();
    const clockEmoji = getClockEmoji();
    const silverEmoji = getSilverCoinEmoji();
    const goldEmoji = getGoldBarEmoji();
    const revolverEmoji = getRevolverEmoji();
    const cowboysEmoji = getCowboysEmoji();

    const embed = new EmbedBuilder()
      .setColor("#FF0000")
      .setTitle(`${bankEmoji} ${t(interaction, "bankrob_title")}`)
      .setDescription(
        t(interaction, "bankrob_invite_desc", {
          user: interaction.user.username,
          partner: partner.username,
          job: t(interaction, "bankrob_dangerous_job"),
          clock: clockEmoji
        }),
      )
      .setImage("https://i.postimg.cc/76fgG5FZ/IMG-3260.png")
      .addFields(
        {
          name: `${silverEmoji} ${t(interaction, "bankrob_silver_reward")}`,
          value: t(interaction, "bankrob_silver_split"),
          inline: true,
        },
        {
          name: `${goldEmoji} ${t(interaction, "bankrob_gold_bonus")}`,
          value: t(interaction, "bankrob_gold_split"),
          inline: true,
        },
        {
          name: `${clockEmoji} ${t(interaction, "bankrob_duration")}`,
          value: t(interaction, "bankrob_3_minutes"),
          inline: true,
        },
        {
          name: `${getWarningEmoji()} ${t(interaction, "bankrob_risk")}`,
          value: t(interaction, "bankrob_risk_capture"),
          inline: true,
        },
      )
      .setFooter({
        text: t(interaction, "bankrob_footer_join", { partner: partner.username }),
      })
      .setTimestamp();

    const response = await interaction.reply({
      embeds: [embed],
      components: [row],
    });
    const message = await response.fetch();

    activeRobberies.set(userId, {
      initiator: interaction.user,
      message: message,
      started: false,
      partner: null,
      channelId: interaction.channelId,
    });

    const collector = message.createMessageComponentCollector({
      filter: (i) => i.customId === `bankrob_join_${userId}`,
      time: 60000,
    });

    collector.on("collect", async (i) => {
      const cancelEmoji = getCancelEmoji();
      const lockEmoji = getMuteEmoji();
      const timerEmoji = getClockEmoji();

      // Only the invited partner can join
      if (i.user.id !== partner.id) {
        await i.reply({
          content: `${cancelEmoji} ${t(i, "bankrob_invitation_only", { partner: partner.username })}`,
          flags: [MessageFlags.Ephemeral],
        });
        return;
      }

      // Check if partner is also not punished
      const partnerPunishment = isPunished(i.user.id);
      if (partnerPunishment) {
        const remaining = getRemainingTime(i.user.id);
        await i.reply({
          content: `${lockEmoji} ${t(i, "bankrob_partner_in_jail")}\n\n${timerEmoji} ${t(i, "bankrob_partner_jail_time", { time: formatTime(remaining) })}`,
          flags: [MessageFlags.Ephemeral],
        });
        return;
      }

      const robbery = activeRobberies.get(userId);
      if (!robbery || robbery.started) {
        await i.reply({
          content: `${cancelEmoji} ${t(i, "bankrob_already_started")}`,
          flags: [MessageFlags.Ephemeral],
        });
        return;
      }

      robbery.partner = i.user;
      robbery.started = true;

      const createProgressBar = (percent: number): string => {
        const filled = Math.round(percent / 5);
        const empty = 20 - filled;
        const bar = "█".repeat(filled) + "░".repeat(empty);
        return bar;
      };

      const updateRobberyProgress = async (
        message: Message,
        percent: number,
        timeLeft: string,
      ): Promise<void> => {
        const progressBar = createProgressBar(percent);
        const embed = new EmbedBuilder()
          .setColor(
            percent < 50 ? "#FFD700" : percent < 80 ? "#FFA500" : "#FF4500",
          )
          .setTitle(`${bankEmoji} ${t(interaction, "bankrob_in_progress")}`)
          .setDescription(
            t(interaction, "bankrob_progress_bar_desc", {
              user1: interaction.user.username,
              user2: i.user.username,
              bar: progressBar,
              percent: percent,
              clock: clockEmoji,
              timeLeft: timeLeft
            }),
          )
          .setFooter({ text: t(interaction, "bankrob_sheriff_patrol") })
          .setTimestamp();

        try {
          await message.edit({ embeds: [embed], components: [] });
        } catch (error) {
          console.error("Error updating progress:", error);
        }
      };

      const startEmbed = new EmbedBuilder()
        .setColor("#FFD700")
        .setTitle(`${bankEmoji} ${t(interaction, "bankrob_started_title")}`)
        .setDescription(
          t(interaction, "bankrob_progress_bar_desc", {
            user1: interaction.user.username,
            user2: i.user.username,
            bar: createProgressBar(0),
            percent: 0,
            clock: clockEmoji,
            timeLeft: "3m 0s"
          }),
        )
        .setFooter({ text: t(interaction, "bankrob_sheriff_patrol") })
        .setTimestamp();

      await i.update({ embeds: [startEmbed], components: [] });

      const totalDuration = 180000;
      const updateInterval = 10000;
      let elapsed = 0;

      const progressInterval = setInterval(async () => {
        elapsed += updateInterval;
        const maxPercent = 95;
        const percent = Math.min(
          Math.round((elapsed / totalDuration) * maxPercent),
          maxPercent,
        );
        const remainingMs = totalDuration - elapsed;
        const minutes = Math.floor(remainingMs / 60000);
        const seconds = Math.floor((remainingMs % 60000) / 1000);
        const timeLeft = `${minutes}m ${seconds}s`;

        if (elapsed >= totalDuration) {
          clearInterval(progressInterval);
        } else {
          await updateRobberyProgress(message, percent, timeLeft);
        }
      }, updateInterval);

      setTimeout(async () => {
        clearInterval(progressInterval);
        try {
          const outcomeRoll = Math.random();

          // 70% success, 20% partial escape, 10% total capture
          let outcome;
          if (outcomeRoll < 0.7) {
            outcome = "success"; // Both escape
          } else if (outcomeRoll < 0.9) {
            outcome = "partial"; // One escapes, one captured
          } else {
            outcome = "fail"; // Both captured
          }

          // Silver Coins reward (800-1500)
          const silverReward =
            Math.floor(Math.random() * (1500 - 800 + 1)) + 800;
          const silverPerPerson = Math.floor(silverReward / 2);

          // Gold Bars bonus (2 bars fixed)
          const goldBars = 2;
          const goldPerPerson = Math.floor(goldBars / 2);
          const extraGold = goldBars % 2;

          await updateRobberyProgress(message, 100, "0m 0s");
          await new Promise((resolve) => setTimeout(resolve, 500));

          if (outcome === "success") {
            // BOTH ESCAPE SUCCESSFULLY
            const initiatorSilverResult = await addUserSilver(
              userId,
              silverPerPerson,
            );
            const partnerSilverResult = await addUserSilver(
              i.user.id,
              silverPerPerson,
            );

            let initiatorGoldResult = await addItem(userId, "gold", goldPerPerson);
            let partnerGoldResult = await addItem(
              i.user.id,
              "gold",
              goldPerPerson + extraGold,
            );

            // Chance de encontrar diamante (15% para cada pessoa)
            let initiatorDiamondResult = { success: false };
            let partnerDiamondResult = { success: false };
            if (Math.random() < 0.15) {
              initiatorDiamondResult = await addItem(userId, "diamond", 1);
            }
            if (Math.random() < 0.15) {
              partnerDiamondResult = await addItem(i.user.id, "diamond", 1);
            }

            let initiatorLoot: string[] = [];
            let partnerLoot: string[] = [];
            let warnings: string[] = [];
            const warningEmoji = getWarningEmoji();

            if (initiatorSilverResult.success)
              initiatorLoot.push(`${silverPerPerson} ${silverEmoji}`);
            else
              warnings.push(
                `${warningEmoji} ${t(interaction, "bankrob_bag_heavy_silver", { user: interaction.user.username })}`,
              );

            if (initiatorGoldResult.success)
              initiatorLoot.push(`${goldPerPerson} ${goldEmoji}`);
            else
              warnings.push(
                `${warningEmoji} ${t(interaction, "bankrob_bag_heavy_gold", { user: interaction.user.username })}`,
              );

            if (initiatorDiamondResult.success) initiatorLoot.push(`1 💎`);

            if (partnerSilverResult.success)
              partnerLoot.push(`${silverPerPerson} ${silverEmoji}`);
            else
              warnings.push(
                `${warningEmoji} ${t(interaction, "bankrob_bag_heavy_silver", { user: i.user.username })}`,
              );

            if (partnerGoldResult.success)
              partnerLoot.push(`${goldPerPerson + extraGold} ${goldEmoji}`);
            else
              warnings.push(
                `${warningEmoji} ${t(interaction, "bankrob_bag_heavy_gold", { user: i.user.username })}`,
              );

            if (partnerDiamondResult.success) partnerLoot.push(`1 💎`);

            const moneybagEmoji = getMoneybagEmoji();
            const successEmbed = new EmbedBuilder()
              .setColor(warnings.length > 0 ? "#FFA500" : "#00FF00")
              .setTitle(t(interaction, "bankrob_success_title"))
              .setDescription(
                t(interaction, "bankrob_success_desc", {
                  user1: interaction.user.username,
                  user2: i.user.username
                }),
              )
              .addFields(
                {
                  name: `${moneybagEmoji} ${t(interaction, "bankrob_total_haul")}`,
                  value: t(interaction, "bankrob_haul_value", {
                    silver: silverReward,
                    silverEmoji: silverEmoji,
                    gold: goldBars,
                    goldEmoji: goldEmoji
                  }),
                  inline: false,
                },
                {
                  name: `${interaction.user.username}${t(interaction, "bankrob_share")}`,
                  value:
                    initiatorLoot.length > 0
                      ? initiatorLoot.join(" + ")
                      : `${cancelEmoji} ${t(interaction, "bankrob_nothing")}`,
                  inline: true,
                },
                {
                  name: `${i.user.username}${t(interaction, "bankrob_share")}`,
                  value:
                    partnerLoot.length > 0
                      ? partnerLoot.join(" + ")
                      : `${cancelEmoji} ${t(interaction, "bankrob_nothing")}`,
                  inline: true,
                },
              )
              .setFooter({
                text:
                  warnings.length > 0
                    ? t(interaction, "bankrob_lost_loot")
                    : t(interaction, "bankrob_spend_wisely"),
              })
              .setTimestamp();

            if (warnings.length > 0) {
              successEmbed.addFields({
                name: `${warningEmoji} ${t(interaction, "bankrob_warnings")}`,
                value: warnings.join("\n"),
                inline: false,
              });
            }

            if (interaction.channel && "send" in interaction.channel) {
              await interaction.channel.send({ embeds: [successEmbed] });
            }
          } else if (outcome === "partial") {
            // ONE ESCAPES, ONE CAPTURED
            const whoEscapes = Math.random() < 0.5 ? "initiator" : "partner";
            const escapee =
              whoEscapes === "initiator" ? interaction.user : i.user;
            const captured =
              whoEscapes === "initiator" ? i.user : interaction.user;

            // Escapee gets ALL the loot
            const escapeeId = escapee.id;
            const silverResult = await addUserSilver(escapeeId, silverReward);
            const goldResult = await addItem(escapeeId, "gold", goldBars);

            // Chance de encontrar diamante (15% de chance)
            let diamondResult = { success: false };
            if (Math.random() < 0.15) {
              diamondResult = await addItem(escapeeId, "diamond", 1);
            }

            let loot: string[] = [];
            if (silverResult.success)
              loot.push(`${silverReward} ${silverEmoji}`);
            if (goldResult.success) loot.push(`${goldBars} ${goldEmoji}`);
            if (diamondResult.success) loot.push(`1 💎`);

            // Apply punishment to captured person (30 min jail)
            applyPunishment(captured.id, t(interaction, "bankrob_punishment_reason"));

            // Apply Discord timeout (30 minutes) - only if bot has permissions
            try {
              if (interaction.guild) {
                const capturedMember = await interaction.guild.members.fetch(
                  captured.id,
                );
                const botMember = await interaction.guild.members.fetchMe();

                // Check if bot has MODERATE_MEMBERS permission
                if (botMember.permissions.has("ModerateMembers")) {
                  await capturedMember.timeout(
                    30 * 60 * 1000,
                    t(interaction, "bankrob_punishment_reason"),
                  );
                }
              }
            } catch (error) {
              // Silently fail - timeout is optional bonus feature
            }

            // Create automatic wanted poster ONLY for ESCAPEE
            const wantedResult = await createAutoWanted(
              interaction.client,
              interaction.guildId || "",
              escapee,
              silverReward,
            );

            const balanceEmoji = getBalanceEmoji();
            const alarmEmoji = getAlarmEmoji();
            const runningEmoji = getRunningCowboyEmoji();
            const lockEmoji = getMuteEmoji();
            const dartEmoji = getDartEmoji();
            const moneybagEmoji = getMoneybagEmoji();

            const partialEmbed = new EmbedBuilder()
              .setColor("#FFA500")
              .setTitle(`${balanceEmoji} ${t(interaction, "bankrob_partial_escape")}`)
              .setDescription(
                t(interaction, "bankrob_partial_desc", {
                  escapee: escapee.username,
                  captured: captured.username,
                  alarm: alarmEmoji,
                  lock: lockEmoji
                }),
              )
              .addFields(
                {
                  name: `${moneybagEmoji} ${t(interaction, "bankrob_total_haul")}`,
                  value: `${silverReward} ${silverEmoji} + ${goldBars} ${goldEmoji}`,
                  inline: false,
                },
                {
                  name: `${runningEmoji} ${t(interaction, "bankrob_escaped")}`,
                  value: `${escapee.username}\n${loot.length > 0 ? loot.join(" + ") : t(interaction, "bankrob_nothing")}`,
                  inline: true,
                },
                {
                  name: `${lockEmoji} ${t(interaction, "bankrob_captured")}`,
                  value: `${captured.username}\n${t(interaction, "bankrob_timeout_30min")}`,
                  inline: true,
                },
                {
                  name: `${dartEmoji} ${t(interaction, "bankrob_bounty_placed")}`,
                  value: wantedResult.success && wantedResult.amount 
                    ? t(interaction, "bankrob_bounty_value", {
                        silverEmoji: silverEmoji,
                        amount: wantedResult.amount.toLocaleString()
                      })
                    : t(interaction, "bankrob_system_error"),
                  inline: false,
                },
              )
              .setFooter({
                text: t(interaction, "bankrob_escapee_wanted", { escapee: escapee.username }),
              })
              .setTimestamp();

            if (interaction.channel && "send" in interaction.channel) {
              await interaction.channel.send({ embeds: [partialEmbed] });
            }
          } else {
            // BOTH CAPTURED
            applyPunishment(userId, t(interaction, "bankrob_punishment_reason"));
            applyPunishment(i.user.id, t(interaction, "bankrob_punishment_reason"));

            // Apply Discord timeout to both (30 minutes) - only if bot has permissions
            try {
              if (interaction.guild) {
                const initiatorMember =
                  await interaction.guild.members.fetch(userId);
                const partnerMember = await interaction.guild.members.fetch(
                  i.user.id,
                );
                const botMember = await interaction.guild.members.fetchMe();

                // Check if bot has MODERATE_MEMBERS permission
                if (botMember.permissions.has("ModerateMembers")) {
                  await initiatorMember.timeout(
                    30 * 60 * 1000,
                    t(interaction, "bankrob_punishment_reason"),
                  );
                  await partnerMember.timeout(
                    30 * 60 * 1000,
                    t(interaction, "bankrob_punishment_reason"),
                  );
                }
              }
            } catch (error) {
              // Silently fail - timeout is optional bonus feature
            }

            const alarmEmoji = getAlarmEmoji();
            const lockEmoji = getMuteEmoji();

            const failEmbed = new EmbedBuilder()
              .setColor("#FF0000")
              .setTitle(`${alarmEmoji} ${t(interaction, "bankrob_both_captured")}`)
              .setDescription(
                t(interaction, "bankrob_both_caught_desc", {
                  user1: interaction.user.username,
                  user2: i.user.username,
                  lock: lockEmoji
                }),
              )
              .addFields(
                {
                  name: `${lockEmoji} ${t(interaction, "bankrob_punishment")}`,
                  value: t(interaction, "bankrob_timeout_30min"),
                  inline: true,
                },
                { name: t(interaction, "bankrob_lost"), value: t(interaction, "bankrob_all_loot"), inline: true },
              )
              .setFooter({
                text: t(interaction, "bankrob_crime_no_pay"),
              })
              .setTimestamp();

            if (interaction.channel && "send" in interaction.channel) {
              await interaction.channel.send({ embeds: [failEmbed] });
            }
          }

          activeRobberies.delete(userId);
          cooldowns.set(userId, Date.now());
          cooldowns.set(i.user.id, Date.now());

          setTimeout(() => {
            cooldowns.delete(userId);
            cooldowns.delete(i.user.id);
          }, cooldownAmount);
        } catch (error) {
          console.error("Error during bank robbery:", error);
          activeRobberies.delete(userId);
        }
      }, 180000);

      collector.stop();
    });

    collector.on("end", (collected) => {
      if (collected.size === 0) {
        const cancelEmoji = getCancelEmoji();
        const failEmbed = new EmbedBuilder()
          .setColor("#808080")
          .setTitle(`${cancelEmoji} ${t(interaction, "bankrob_cancelled")}`)
          .setDescription(
            t(interaction, "bankrob_no_partner"),
          )
          .setFooter({ text: t(interaction, "bankrob_better_luck") })
          .setTimestamp();

        message.edit({ embeds: [failEmbed], components: [] });
        activeRobberies.delete(userId);
      }
    });
  },
};
