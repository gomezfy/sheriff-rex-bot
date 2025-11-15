import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  AttachmentBuilder,
  ChatInputCommandInteraction,
  MessageFlags,
} from "discord.js";
import fs from "fs";
import path from "path";
import {
  getGoldBarEmoji,
  getCowboyEmoji,
  getPickaxeEmoji,
  getCheckEmoji,
  getSparklesEmoji,
  getMoneybagEmoji,
  getBackpackEmoji,
  getCancelEmoji,
  getStatsEmoji,
  getCowboysEmoji,
  getTimerEmoji,
  getDiamondEmoji,
  getMuteEmoji,
} from "../../utils/customEmojis";
import {
  cleanupOldSessions,
  getActiveSessions,
  getUnclaimedSessions,
  getMiningStats,
  formatTime as formatMiningTime,
} from "../../utils/miningTracker";
import { ownsTerritory } from "../../utils/territoryManager";
import { t, getLocale } from "../../utils/i18n";
import { applyLocalizations } from "../../utils/commandLocalizations";
import { formatDuration } from "../../utils/embeds";
const {
  addItem,
  getInventory,
  removeItem,
  transferItem,
  getItem,
} = require("../../utils/inventoryManager");
const {
  addUserSilver,
  getUserSilver,
  removeUserSilver,
} = require("../../utils/dataManager");
import { readData, writeData } from "../../utils/database";

const SOLO_DURATION = 90 * 60 * 1000; // 1h30m (90 minutos)
const COOP_DURATION = 30 * 60 * 1000; // 30 minutos

function getMiningData() {
  return readData("mining.json");
}

function saveMiningData(data: any) {
  writeData("mining.json", data);
}

function getActiveMining(userId: string) {
  const data = getMiningData();
  if (!data[userId]) return null;

  const mining = data[userId];
  if (mining.claimed) return null;

  return mining;
}

function startMining(
  userId: string,
  type: "solo" | "coop",
  partnerId?: string,
  goldAmount?: number,
) {
  const data = getMiningData();
  let duration = type === "solo" ? SOLO_DURATION : COOP_DURATION;

  // Apply 50% mining boost if user owns Gold Mine Shares
  const hasGoldMineShares = ownsTerritory(userId, "gold_mine_shares");
  if (hasGoldMineShares) {
    duration = Math.floor(duration * 0.5); // 50% faster = 50% of original time
  }

  // Check if user has a pickaxe for double mining output (only for solo)
  const hasPickaxe = type === "solo" && getItem(userId, "pickaxe") > 0;

  const now = Date.now();

  // Calculate base gold amount
  let calculatedGold: number;
  if (goldAmount !== undefined) {
    // Use provided goldAmount (for coop)
    calculatedGold = goldAmount;
  } else {
    // Calculate for solo mining
    if (hasPickaxe) {
      calculatedGold = Math.floor(Math.random() * 13) + 16; // 16-28 bars with pickaxe
    } else {
      calculatedGold = Math.floor(Math.random() * 3) + 1; // 1-3 bars without pickaxe
    }
  }

  data[userId] = {
    type,
    startTime: now,
    endTime: now + duration,
    claimed: false,
    goldAmount: calculatedGold,
    partnerId: partnerId || null,
    boosted: hasGoldMineShares, // Track if this session had the boost
    pickaxeBonus: hasPickaxe, // Track if user had pickaxe bonus
  };

  saveMiningData(data);
  
  return { goldAmount: calculatedGold, hasPickaxe };
}

function claimMining(userId: string) {
  const data = getMiningData();
  if (!data[userId]) return false;

  data[userId].claimed = true;
  saveMiningData(data);
  return true;
}

function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

export default {
  data: applyLocalizations(
    new SlashCommandBuilder()
      .setName("mine")
      .setDescription("Mine for gold in the mountains! Solo or cooperative")
      .setContexts([0, 1, 2])
      .setIntegrationTypes([0, 1]),
    "mine",
  ),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const userId = interaction.user.id;

    // Defer reply immediately to prevent timeout - most responses are public
    await interaction.deferReply().catch(() => {});

    // Clean up old claimed sessions (older than 24 hours)
    cleanupOldSessions();

    // Verificar se usuário está em uma expedição ativa
    const expeditionData = readData("expedition.json");
    const userData = expeditionData[userId];

    if (userData?.activeExpedition) {
      const partyId = userData.activeExpedition.partyId;
      const party = expeditionData.parties?.[partyId];

      if (party && party.endTime > Date.now()) {
        const timeLeft = party.endTime - Date.now();
        const embed = new EmbedBuilder()
          .setColor("#FFA500")
          .setTitle(`🗺️ ${t(interaction, "mine_blocked_expedition_title")}`)
          .setDescription(t(interaction, "mine_blocked_expedition_desc"))
          .addFields({
            name: t(interaction, "expedition_time_left"),
            value: formatDuration(timeLeft),
            inline: false,
          })
          .setFooter({
            text: t(interaction, "mine_blocked_expedition_footer"),
          });

        await interaction.editReply({ embeds: [embed] });
        return;
      }
    }

    // Verificar se já está minerando
    const activeMining = getActiveMining(userId);

    if (activeMining) {
      const now = Date.now();
      const timeLeft = activeMining.endTime - now;

      if (timeLeft > 0) {
        // Ainda está minerando
        const goldEmoji = getGoldBarEmoji();
        const progressBar = Math.floor(
          ((now - activeMining.startTime) /
            (activeMining.endTime - activeMining.startTime)) *
            20,
        );
        const bar = "█".repeat(progressBar) + "░".repeat(20 - progressBar);

        const viewSessionsButton = new ButtonBuilder()
          .setCustomId("view_sessions_progress")
          .setLabel(t(interaction, "mine_sessions_btn"))
          .setStyle(ButtonStyle.Secondary);

        const progressRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
          viewSessionsButton,
        );

        const mineType =
          activeMining.type === "solo"
            ? `${getPickaxeEmoji()} ${t(interaction, "mine_solo")}`
            : `${getCowboysEmoji()} ${t(interaction, "mine_coop")}`;
        const goldBarText = t(interaction, "gold_bars");

        const embed = new EmbedBuilder()
          .setColor(0xffd700)
          .setTitle(
            `${getPickaxeEmoji()} ${t(interaction, "mine_in_progress")}`,
          )
          .setDescription(
            `${t(interaction, "mine_currently_mining")}\n\n${bar}\n\n**${t(interaction, "mine_time_remaining")}:** ${formatTime(timeLeft)}\n**${t(interaction, "mine_type")}:** ${mineType}\n**${t(interaction, "mine_expected_reward")}:** ${activeMining.goldAmount} ${goldEmoji} ${goldBarText}`,
          )
          .setFooter({ text: t(interaction, "mine_come_back") })
          .setTimestamp();

        const reply = await interaction.editReply({
          embeds: [embed],
          components: [progressRow],
        });

        // Handler for view sessions button in progress state
        const progressCollector = reply.createMessageComponentCollector({
          time: 300000,
        });

        progressCollector.on("collect", async (i) => {
          if (i.customId === "view_sessions_progress") {
            const activeSessions = getActiveSessions();
            const unclaimedSessions = getUnclaimedSessions();
            const stats = getMiningStats();
            const nowTime = Date.now();

            const sessionsEmbed = new EmbedBuilder()
              .setColor(0xffd700)
              .setTitle(`${getPickaxeEmoji()} ${t(i, "mine_sessions_tracker")}`)
              .setDescription(t(i, "mine_current_operations"))
              .addFields({
                name: `${getStatsEmoji()} ${t(i, "mine_overview")}`,
                value: `\`\`\`yaml
${t(i, "mine_active_sessions")}: ${stats.totalActive}
${t(i, "mine_solo_mining_label")}: ${stats.soloMining}
${t(i, "mine_cooperative_label")}: ${stats.coopMining}
${t(i, "mine_ready_to_claim")}: ${stats.unclaimed}
${t(i, "mine_pending_gold")}: ${stats.totalGoldPending} ${goldEmoji}
\`\`\``,
                inline: false,
              });

            if (activeSessions.length > 0) {
              const activeList = activeSessions
                .slice(0, 10)
                .map(({ userId: uid, session }) => {
                  const timeLeft = session.endTime - nowTime;
                  const progress = Math.floor(
                    ((nowTime - session.startTime) /
                      (session.endTime - session.startTime)) *
                      10,
                  );
                  const progressBar =
                    "█".repeat(progress) + "░".repeat(10 - progress);
                  return `<@${uid}>\n${progressBar} \`${formatMiningTime(timeLeft)}\` • ${session.type === "solo" ? `${getPickaxeEmoji()} Solo` : `${getCowboysEmoji()} Coop`} • ${session.goldAmount} ${goldEmoji}`;
                })
                .join("\n\n");

              sessionsEmbed.addFields({
                name: `${getTimerEmoji()} ${t(i, "mine_active_mining")}`,
                value:
                  activeList +
                  (activeSessions.length > 10
                    ? `\n\n_+${activeSessions.length - 10} ${t(i, "mine_more")}_`
                    : ""),
                inline: false,
              });
            }

            if (unclaimedSessions.length > 0) {
              const unclaimedList = unclaimedSessions
                .slice(0, 5)
                .map(({ userId: uid, session }) => {
                  return `<@${uid}> • ${session.type === "solo" ? `${getPickaxeEmoji()}` : `${getCowboysEmoji()}`} • ${session.goldAmount} ${goldEmoji}`;
                })
                .join("\n");

              sessionsEmbed.addFields({
                name: `${getCheckEmoji()} ${t(i, "mine_ready_to_claim")}`,
                value:
                  unclaimedList +
                  (unclaimedSessions.length > 5
                    ? `\n_+${unclaimedSessions.length - 5} ${t(i, "mine_more")}_`
                    : ""),
                inline: false,
              });
            }

            if (activeSessions.length === 0 && unclaimedSessions.length === 0) {
              sessionsEmbed.addFields({
                name: `${getMuteEmoji()} ${t(i, "mine_no_active_sessions")}`,
                value: t(i, "mine_no_one_mining"),
                inline: false,
              });
            }

            sessionsEmbed
              .setFooter({
                text: `${getPickaxeEmoji()} ${t(i, "mine_sessions_realtime")}`,
              })
              .setTimestamp();
            await i.reply({
              embeds: [sessionsEmbed],
              flags: MessageFlags.Ephemeral,
            });
          }
        });

        return;
      } else {
        // Mineração completa - pode coletar
        const claimButton = new ButtonBuilder()
          .setCustomId("claim_mining")
          .setLabel(t(interaction, "mine_collect_btn"))
          .setStyle(ButtonStyle.Success);

        const viewSessionsClaimButton = new ButtonBuilder()
          .setCustomId("view_sessions_claim")
          .setLabel(t(interaction, "mine_sessions_btn"))
          .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
          claimButton,
          viewSessionsClaimButton,
        );

        const goldEmoji = getGoldBarEmoji();

        const goldBarText = t(interaction, "gold_bars");

        const embed = new EmbedBuilder()
          .setColor(0x00ff00)
          .setTitle(`${getCheckEmoji()} ${t(interaction, "mine_complete")}`)
          .setDescription(
            `${t(interaction, "mine_complete_desc")}\n\n${getMoneybagEmoji()} **${t(interaction, "mine_reward")}:** ${activeMining.goldAmount} ${goldEmoji} ${goldBarText}!\n\n${t(interaction, "mine_click_to_join")}`,
          )
          .setFooter({ text: t(interaction, "mine_great_work") })
          .setTimestamp();

        await interaction.editReply({ embeds: [embed], components: [row] });

        const response = await interaction.fetchReply();
        const collector = response.createMessageComponentCollector({
          time: 300000,
        }); // 5 min to collect

        collector.on("collect", async (i) => {
          if (i.customId === "view_sessions_claim") {
            const activeSessions = getActiveSessions();
            const unclaimedSessions = getUnclaimedSessions();
            const stats = getMiningStats();
            const nowTime = Date.now();

            const sessionsEmbed = new EmbedBuilder()
              .setColor(0xffd700)
              .setTitle(
                `${getPickaxeEmoji()} ${t(interaction, "mine_sessions_tracker")}`,
              )
              .setDescription(t(interaction, "mine_current_operations"))
              .addFields({
                name: `${getStatsEmoji()} ${t(interaction, "mine_overview")}`,
                value: `\`\`\`yaml
${t(interaction, "mine_active_sessions")}: ${stats.totalActive}
${t(interaction, "mine_solo_mining_label")}: ${stats.soloMining}
${t(interaction, "mine_cooperative_label")}: ${stats.coopMining}
${t(interaction, "mine_ready_to_claim")}: ${stats.unclaimed}
${t(interaction, "mine_pending_gold")}: ${stats.totalGoldPending} ${goldEmoji}
\`\`\``,
                inline: false,
              });

            if (activeSessions.length > 0) {
              const activeList = activeSessions
                .slice(0, 10)
                .map(({ userId: uid, session }) => {
                  const timeLeft = session.endTime - nowTime;
                  const progress = Math.floor(
                    ((nowTime - session.startTime) /
                      (session.endTime - session.startTime)) *
                      10,
                  );
                  const progressBar =
                    "█".repeat(progress) + "░".repeat(10 - progress);
                  return `<@${uid}>\n${progressBar} \`${formatMiningTime(timeLeft)}\` • ${session.type === "solo" ? `${getPickaxeEmoji()} Solo` : `${getCowboysEmoji()} Coop`} • ${session.goldAmount} ${goldEmoji}`;
                })
                .join("\n\n");

              sessionsEmbed.addFields({
                name: `${getTimerEmoji()} ${t(interaction, "mine_active_mining")}`,
                value:
                  activeList +
                  (activeSessions.length > 10
                    ? `\n\n_+${activeSessions.length - 10} ${t(interaction, "mine_more")}_`
                    : ""),
                inline: false,
              });
            }

            if (unclaimedSessions.length > 0) {
              const unclaimedList = unclaimedSessions
                .slice(0, 5)
                .map(({ userId: uid, session }) => {
                  return `<@${uid}> • ${session.type === "solo" ? `${getPickaxeEmoji()}` : `${getCowboysEmoji()}`} • ${session.goldAmount} ${goldEmoji}`;
                })
                .join("\n");

              sessionsEmbed.addFields({
                name: `${getCheckEmoji()} ${t(interaction, "mine_ready_to_claim")}`,
                value:
                  unclaimedList +
                  (unclaimedSessions.length > 5
                    ? `\n_+${unclaimedSessions.length - 5} ${t(interaction, "mine_more")}_`
                    : ""),
                inline: false,
              });
            }

            if (activeSessions.length === 0 && unclaimedSessions.length === 0) {
              sessionsEmbed.addFields({
                name: `${getMuteEmoji()} ${t(interaction, "mine_no_active_sessions")}`,
                value: t(interaction, "mine_no_one_mining"),
                inline: false,
              });
            }

            sessionsEmbed
              .setFooter({
                text: `${getPickaxeEmoji()} ${t(interaction, "mine_sessions_realtime")}`,
              })
              .setTimestamp();
            return i.reply({
              embeds: [sessionsEmbed],
              flags: MessageFlags.Ephemeral,
            });
          }

          if (i.customId !== "claim_mining") return;
          if (i.user.id !== userId) {
            return i.reply({
              content: `❌ ${t(interaction, "mine_not_yours")}`,
              flags: MessageFlags.Ephemeral,
            });
          }

          await i.deferUpdate();

          const addResult = await addItem(userId, "gold", activeMining.goldAmount);

          if (!addResult.success) {
            return i.editReply({
              embeds: [
                {
                  color: 0xff0000,
                  title: `⚠️ ${t(interaction, "mine_collection_failed")}`,
                  description: `${addResult.error}\n\n${t(interaction, "mine_inventory_heavy")}`,
                  footer: { text: t(interaction, "mine_gold_waiting") },
                },
              ],
              components: [],
            });
          }

          // Chance de encontrar diamante (20% de chance)
          let foundDiamond = false;
          const diamondChance = Math.random();
          if (diamondChance < 0.2) {
            const diamondResult = await addItem(userId, "diamond", 1);
            if (diamondResult.success) {
              foundDiamond = true;
            }
          }

          claimMining(userId);

          const userInventory = getInventory(userId);
          const checkEmoji = getCheckEmoji();
          const sparklesEmoji = getSparklesEmoji();
          const backpackEmoji = getBackpackEmoji();

          const goldBarText = t(interaction, "gold_bars");
          const weightText = t(interaction, "weight");

          const locale = getLocale(i);
          const diamondText = foundDiamond
            ? `\n${sparklesEmoji} **${locale === "pt-BR" ? "BÔNUS RARO" : "RARE BONUS"}:** +1 ${getDiamondEmoji()} ${locale === "pt-BR" ? "Diamante" : "Diamond"}!`
            : "";

          await i.editReply({
            embeds: [
              {
                color: foundDiamond ? 0x00ffff : 0xffd700,
                title: `${checkEmoji} ${getPickaxeEmoji()} ${t(interaction, "mine_collected")} ${sparklesEmoji}`,
                description: `\`\`\`diff\n+ ${t(interaction, "mine_you_collected")} ${activeMining.goldAmount} ${goldEmoji} ${goldBarText}!\n\`\`\`${diamondText}\n${backpackEmoji} **${weightText}:** ${addResult.newWeight.toFixed(2)}kg / ${userInventory.maxWeight}kg`,
                footer: {
                  text: `${getCowboyEmoji()} ${t(interaction, "mine_can_mine_again")}`,
                },
                timestamp: new Date().toISOString(),
              },
            ],
            components: [],
          });

          collector.stop();
        });

        return;
      }
    }

    // Não está minerando - mostrar opções
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("mine_solo")
        .setLabel(t(interaction, "mine_alone_duration"))
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("mine_coop")
        .setLabel(t(interaction, "mine_find_partner"))
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("view_sessions")
        .setLabel(t(interaction, "mine_sessions_btn"))
        .setStyle(ButtonStyle.Secondary),
    );

    const goldEmoji = getGoldBarEmoji();

    const embed = new EmbedBuilder()
      .setColor(0xffd700)
      .setTitle(`${getPickaxeEmoji()} ${t(interaction, "mine_title")}`)
      .setImage("https://i.postimg.cc/T3N1ytf4/IMG-3258.png")
      .setDescription(t(interaction, "mine_choose"))
      .addFields(
        {
          name: `${getPickaxeEmoji()} ${t(interaction, "mine_solo_mining_label")}`,
          value: `\`\`\`yaml\n${t(interaction, "mine_duration_1h30")}\n${t(interaction, "mine_reward_1_3")}\n${t(interaction, "mine_players_1")}\`\`\``,
          inline: true,
        },
        {
          name: `${getCowboysEmoji()} ${t(interaction, "mine_coop")}`,
          value: `\`\`\`yaml\n${t(interaction, "mine_duration_30min")}\n${t(interaction, "mine_reward_4_6_split")}\n${t(interaction, "mine_players_2")}\`\`\``,
          inline: true,
        },
      )
      .setFooter({ text: t(interaction, "mine_auto_come_back") })
      .setTimestamp();

    await interaction.editReply({
      embeds: [embed],
      components: [row],
    });

    const response = await interaction.fetchReply();

    // Collector para os botões
    const collector = response.createMessageComponentCollector({ time: 60000 });

    collector.on("collect", async (i) => {
      if (i.customId === "view_sessions") {
        // Show mining sessions
        const activeSessions = getActiveSessions();
        const unclaimedSessions = getUnclaimedSessions();
        const stats = getMiningStats();
        const now = Date.now();

        const sessionsEmbed = new EmbedBuilder()
          .setColor(0xffd700)
          .setTitle(`${getPickaxeEmoji()} ${t(i, "mine_sessions_tracker")}`)
          .setDescription(t(i, "mine_current_operations"))
          .addFields({
            name: `${getStatsEmoji()} ${t(i, "mine_overview")}`,
            value: `\`\`\`yaml
${t(i, "mine_active_sessions")}: ${stats.totalActive}
${t(i, "mine_solo_mining_label")}: ${stats.soloMining}
${t(i, "mine_cooperative_label")}: ${stats.coopMining}
${t(i, "mine_ready_to_claim")}: ${stats.unclaimed}
${t(i, "mine_pending_gold")}: ${stats.totalGoldPending} ${goldEmoji}
\`\`\``,
            inline: false,
          });

        // Show active mining sessions
        if (activeSessions.length > 0) {
          const activeList = activeSessions
            .slice(0, 10)
            .map(({ userId: uid, session }) => {
              const timeLeft = session.endTime - now;
              const progress = Math.floor(
                ((now - session.startTime) /
                  (session.endTime - session.startTime)) *
                  10,
              );
              const progressBar =
                "█".repeat(progress) + "░".repeat(10 - progress);
              return `<@${uid}>\n${progressBar} \`${formatMiningTime(timeLeft)}\` • ${session.type === "solo" ? `${getPickaxeEmoji()} Solo` : `${getCowboysEmoji()} Coop`} • ${session.goldAmount} ${goldEmoji}`;
            })
            .join("\n\n");

          sessionsEmbed.addFields({
            name: `⏳ ${t(i, "mine_active_mining")}`,
            value:
              activeList +
              (activeSessions.length > 10
                ? `\n\n_+${activeSessions.length - 10} ${t(i, "mine_more")}_`
                : ""),
            inline: false,
          });
        }

        // Show unclaimed sessions
        if (unclaimedSessions.length > 0) {
          const unclaimedList = unclaimedSessions
            .slice(0, 5)
            .map(({ userId: uid, session }) => {
              return `<@${uid}> • ${session.type === "solo" ? `${getPickaxeEmoji()}` : `${getCowboysEmoji()}`} • ${session.goldAmount} ${goldEmoji}`;
            })
            .join("\n");

          sessionsEmbed.addFields({
            name: `${getCheckEmoji()} ${t(i, "mine_ready_to_claim")}`,
            value:
              unclaimedList +
              (unclaimedSessions.length > 5
                ? `\n_+${unclaimedSessions.length - 5} ${t(i, "mine_more")}_`
                : ""),
            inline: false,
          });
        }

        if (activeSessions.length === 0 && unclaimedSessions.length === 0) {
          sessionsEmbed.addFields({
            name: `💤 ${t(i, "mine_no_active_sessions")}`,
            value: t(i, "mine_no_one_mining_start"),
            inline: false,
          });
        }

        sessionsEmbed
          .setFooter({
            text: `${getPickaxeEmoji()} ${t(i, "mine_sessions_realtime")}`,
          })
          .setTimestamp();

        await i.reply({
          embeds: [sessionsEmbed],
          flags: MessageFlags.Ephemeral,
        });
      } else if (i.customId === "mine_solo") {
        // Verify user for solo mining
        if (i.user.id !== interaction.user.id) {
          return i.reply({
            content: `${getCancelEmoji()} ${t(i, "mine_not_yours")}`,
            flags: MessageFlags.Ephemeral,
          });
        }

        const hasBoost = ownsTerritory(userId, "gold_mine_shares");
        const miningResult = startMining(userId, "solo");

        const durationText = hasBoost
          ? t(i, "mine_duration_1h30_boosted")
          : t(i, "mine_duration_1h30");
        const boostBadge = hasBoost ? t(i, "mine_boost_badge") : "";
        const pickaxeBadge = miningResult.hasPickaxe ? `\n⛏️ **${t(i, "mine_pickaxe_bonus")}** (16-28 ${t(i, "gold_bars")})` : "";

        await i.update({
          embeds: [
            {
              color: 0xffd700,
              title: `${getPickaxeEmoji()} ${t(i, "mine_solo_started")}`,
              description: `${t(i, "mine_started_mining")}\n\n${getTimerEmoji()} **${t(i, "mine_duration")}:** ${durationText}\n${getDiamondEmoji()} **${t(i, "mine_expected")}:** ${miningResult.goldAmount} ${goldEmoji} ${t(i, "gold_bars")}${boostBadge}${pickaxeBadge}\n\n${t(i, "mine_automatic")}\n**${t(i, "mine_come_back_in")}**`,
              footer: {
                text: `${getPickaxeEmoji()} ${t(i, "mine_check_progress")}`,
              },
              timestamp: new Date().toISOString(),
            },
          ],
          components: [],
        });
      } else if (i.customId === "mine_coop") {
        // Verify user for cooperative mining
        if (i.user.id !== interaction.user.id) {
          return i.reply({
            content: `${getCancelEmoji()} ${t(i, "mine_not_yours")}`,
            flags: MessageFlags.Ephemeral,
          });
        }

        // Mineração cooperativa - criar convite
        const hasBoostCoop = ownsTerritory(userId, "gold_mine_shares");
        const coopDurationText = hasBoostCoop
          ? t(i, "mine_duration_30min_boosted")
          : t(i, "mine_duration_30min");

        const inviteRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId("join_mining")
            .setLabel(t(i, "mine_find_partner"))
            .setStyle(ButtonStyle.Success),
        );

        await i.update({
          embeds: [
            {
              color: 0x00ff00,
              title: `${getCowboysEmoji()} ${t(i, "mine_looking_partner")}`,
              description: `${t(i, "mine_is_looking")}\n\n${goldEmoji} **${t(i, "mine_total_reward")}:** ${t(i, "mine_split_between")}\n${getTimerEmoji()} **${t(i, "mine_duration")}:** ${coopDurationText}\n\n**${t(i, "mine_click_to_join")}**`,
              footer: { text: t(i, "mine_first_person") },
            },
          ],
          components: [inviteRow],
        });

        // Collector para convite cooperativo
        const coopCollector = response.createMessageComponentCollector({
          time: 120000,
        });

        coopCollector.on("collect", async (coopI) => {
          if (coopI.customId !== "join_mining") return;

          if (coopI.user.id === interaction.user.id) {
            return coopI.reply({
              content: `${getCancelEmoji()} ${t(coopI, "mine_cannot_join_self")}`,
              flags: MessageFlags.Ephemeral,
            });
          }

          const partnerId = coopI.user.id;

          // Verificar se parceiro já está minerando
          const partnerMining = getActiveMining(partnerId);
          if (partnerMining) {
            return coopI.reply({
              content: `${getCancelEmoji()} ${t(coopI, "mine_already_mining")}`,
              flags: MessageFlags.Ephemeral,
            });
          }

          // Iniciar mineração cooperativa
          const goldAmount = Math.floor(Math.random() * 3) + 4; // 4-6 gold
          const goldPerPerson = Math.floor(goldAmount / 2);
          const remainder = goldAmount % 2;

          // Distribuição justa: remainder vai para o owner (quem iniciou a mineração)
          const ownerGold = goldPerPerson + (remainder === 1 ? 1 : 0);
          const partnerGold = goldPerPerson;

          startMining(userId, "coop", partnerId, ownerGold);
          startMining(partnerId, "coop", userId, partnerGold);

          // Check if owner has boost for displaying correct duration
          const ownerHasBoost = ownsTerritory(userId, "gold_mine_shares");
          const coopDuration = ownerHasBoost
            ? t(coopI, "mine_duration_30min_boosted")
            : t(coopI, "mine_duration_30min");

          await coopI.update({
            embeds: [
              {
                color: 0xffd700,
                title: `${getPickaxeEmoji()} ${t(coopI, "mine_coop_started")}`,
                description: `**${interaction.user.username}** e **${coopI.user.username}** ${t(coopI, "mine_mining_together")}\n\n${getTimerEmoji()} **${t(coopI, "mine_duration")}:** ${coopDuration}\n${getDiamondEmoji()} **${t(coopI, "mine_total_gold")}:** ${goldAmount} ${goldEmoji} ${t(coopI, "gold_bars")}\n\n**${interaction.user.username}:** ${ownerGold} ${goldEmoji}\n**${coopI.user.username}:** ${partnerGold} ${goldEmoji}\n\n${t(coopI, "mine_automatic")}\n**${t(coopI, "mine_come_back_in")}**`,
                footer: {
                  text: `${getPickaxeEmoji()} ${t(coopI, "mine_check_progress")}`,
                },
                timestamp: new Date().toISOString(),
              },
            ],
            components: [],
          });

          coopCollector.stop();
        });

        coopCollector.on("end", async (collected) => {
          if (collected.size === 0) {
            await response.edit({
              embeds: [
                {
                  color: 0x808080,
                  title: `${getTimerEmoji()} ${t(interaction, "mine_invitation_expired")}`,
                  description: `${t(interaction, "mine_no_one_joined")}`,
                  footer: { text: t(interaction, "mine_better_luck") },
                },
              ],
              components: [],
            });
          }
        });

        collector.stop();
      }
    });

    collector.on("end", async (collected) => {
      if (collected.size === 0) {
        await response.edit({
          embeds: [
            {
              color: 0x808080,
              title: `⏰ ${t(interaction, "mine_invitation_expired")}`,
              description: `${t(interaction, "mine_no_one_joined")}`,
              footer: { text: t(interaction, "mine_better_luck") },
            },
          ],
          components: [],
        });
      }
    });
  },
};
