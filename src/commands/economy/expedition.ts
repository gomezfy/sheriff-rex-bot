import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  MessageFlags,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  EmbedBuilder,
  AttachmentBuilder,
  ComponentType,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  User,
} from "discord.js";
import { addXp } from "../../utils/xpManager";
import {
  economyEmbed,
  errorEmbed,
  warningEmbed,
  formatCurrency,
  formatDuration,
  field,
} from "../../utils/embeds";
import {
  getSilverCoinEmoji,
  getGoldBarEmoji,
  getCheckEmoji,
  getCrossEmoji,
  getCowboyEmoji,
  getCowboysEmoji,
  getClockEmoji,
  getTimerEmoji,
  getMoneybagEmoji,
  getStatsEmoji,
  getStarEmoji,
} from "../../utils/customEmojis";
import { t } from "../../utils/i18n";
import { applyLocalizations } from "../../utils/commandLocalizations";
import {
  addItem,
  removeItem,
  getItem,
  getInventory,
  calculateWeight,
} from "../../utils/inventoryManager";
import { readData, writeData } from "../../utils/database";
import { addUserSilver } from "../../utils/dataManager";
import path from "path";

const EXPEDITION_DURATION_SHORT = 3 * 60 * 60 * 1000; // 3 horas
const EXPEDITION_DURATION_LONG = 10 * 60 * 60 * 1000; // 10 horas
const EXPEDITION_COOLDOWN = 6 * 60 * 60 * 1000; // 6 horas de cooldown

// Seal requirements
const SEAL_COST_3H = 12; // 12 seals for 3h expedition
const SEAL_COST_10H_SOLO = 30; // 30 seals for 10h solo expedition
const SEAL_COST_10H_PARTY = 10; // 10 seals per person for 10h party expedition

interface ExpeditionParty {
  leader: string;
  members: string[]; // Includes leader
  duration: number;
  startTime: number;
  endTime: number;
  dmSent: { [userId: string]: boolean };
  guildId?: string;
  channelId?: string;
  rewardsGiven?: boolean;
  totalRewards?: {
    silver: number;
    gold: number;
    wheat: number;
    honey: number;
    xp: number;
  };
}

interface ActiveExpedition {
  partyId: string;
  isLeader: boolean;
}

interface UserExpeditionData {
  activeExpedition?: ActiveExpedition;
  lastExpedition?: number;
  totalExpeditions: number;
}

// Calculate rewards based on duration and party size
function calculateRewards(duration: number, partySize: number) {
  if (duration === EXPEDITION_DURATION_SHORT) {
    // 3 hours - base rewards
    return {
      silverMin: 4500,
      silverMax: 8800,
      goldBars: 9,
      wheatMin: 2000,
      wheatMax: 6000,
      honey: 10,
      xp: 1000,
    };
  } else {
    // 10 hours - much better rewards
    return {
      silverMin: 35000,
      silverMax: 55000,
      goldBars: 16,
      wheatMin: 8000,
      wheatMax: 15000,
      honey: 35,
      xp: 3500,
    };
  }
}

// Check if all members have enough inventory capacity
function checkInventoryCapacity(
  members: string[],
  duration: number,
): { hasCapacity: boolean; user?: string; needed: number } {
  const rewards = calculateRewards(duration, members.length);

  // Calculate maximum possible weight per person (worst case scenario)
  const maxGoldPerPerson = Math.ceil(rewards.goldBars / members.length) + 1;
  const maxWheatPerPerson = Math.ceil(rewards.wheatMax / members.length) + 1;
  const maxHoneyPerPerson = Math.ceil(rewards.honey / members.length) + 1;

  // Weight per item (from inventoryManager.ts)
  const goldWeight = 1; // 1kg per gold bar
  const wheatWeight = 0.0005; // 0.5g per wheat
  const honeyWeight = 0.05; // 50g per honey

  const maxWeightNeeded =
    maxGoldPerPerson * goldWeight +
    maxWheatPerPerson * wheatWeight +
    maxHoneyPerPerson * honeyWeight;

  for (const memberId of members) {
    const inventory = getInventory(memberId);
    const currentWeight = calculateWeight(inventory);
    const availableSpace = inventory.maxWeight - currentWeight;

    if (availableSpace < maxWeightNeeded) {
      return {
        hasCapacity: false,
        user: memberId,
        needed: Math.ceil(maxWeightNeeded - availableSpace),
      };
    }
  }

  return { hasCapacity: true, needed: 0 };
}

export default {
  data: applyLocalizations(
    new SlashCommandBuilder()
      .setName("expedition")
      .setDescription("Embark on a dangerous expedition through the desert!")
      .setContexts([0, 1, 2])
      .setIntegrationTypes([0, 1]),
    "expedition",
  ),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const userId = interaction.user.id;

    // Defer reply immediately to prevent timeout (ephemeral for privacy)
    await interaction.deferReply({ ephemeral: true }).catch(() => {});

    const expeditionData: any = readData("expedition.json");
    if (!expeditionData.parties) expeditionData.parties = {};

    const userData: UserExpeditionData = expeditionData[userId] || {
      totalExpeditions: 0,
    };

    const now = Date.now();

    // Check if user has active expedition
    if (userData.activeExpedition) {
      const partyId = userData.activeExpedition.partyId;
      const party = expeditionData.parties?.[partyId];

      if (party && party.endTime > now) {
        // Still on expedition
        const timeLeft = party.endTime - now;
        const progressBar = Math.floor(
          ((now - party.startTime) / (party.endTime - party.startTime)) * 20,
        );
        const bar = "█".repeat(progressBar) + "░".repeat(20 - progressBar);

        const durationHours =
          party.duration === EXPEDITION_DURATION_SHORT ? "3h" : "10h";
        const membersList = party.members
          .map((id: string) => `<@${id}>`)
          .join(", ");

        const embed = new EmbedBuilder()
          .setColor("#FFA500")
          .setTitle(`🗺️ ${t(interaction, "expedition_in_progress_title")}`)
          .setDescription(t(interaction, "expedition_in_progress_desc"))
          .addFields(
            {
              name: t(interaction, "expedition_party_members_label", {
                cowboys: getCowboysEmoji(),
              }),
              value: membersList,
              inline: false,
            },
            {
              name: t(interaction, "expedition_duration"),
              value: durationHours,
              inline: true,
            },
            {
              name: t(interaction, "expedition_time_left"),
              value: `\`${bar}\`\n${getClockEmoji()} ${formatDuration(timeLeft)}`,
              inline: false,
            },
          )
          .setFooter({ text: t(interaction, "expedition_in_progress_footer") });

        await interaction.editReply({ embeds: [embed] });
        return;
      } else if (party && party.endTime <= now) {
        // Expedition completed - rewards already given automatically
        const embed = new EmbedBuilder()
          .setColor("#00FF00")
          .setTitle(
            `${getCheckEmoji()} ${t(interaction, "expedition_complete_title")}`,
          )
          .setDescription(t(interaction, "expedition_already_complete"))
          .setFooter({ text: t(interaction, "expedition_start_new") });

        // Clear the stale expedition reference
        userData.activeExpedition = undefined;
        expeditionData[userId] = userData;
        writeData("expedition.json", expeditionData);

        await interaction.editReply({ embeds: [embed] });
        return;
      }
    }

    // Check cooldown
    if (userData.lastExpedition) {
      const timeSinceLastExpedition = now - userData.lastExpedition;
      const cooldownLeft = EXPEDITION_COOLDOWN - timeSinceLastExpedition;

      if (cooldownLeft > 0) {
        const embed = new EmbedBuilder()
          .setColor("#FFA500")
          .setTitle(
            `${getClockEmoji()} ${t(interaction, "expedition_cooldown_title")}`,
          )
          .setDescription(t(interaction, "expedition_cooldown_desc"))
          .addFields({
            name: t(interaction, "expedition_cooldown_time"),
            value: `${getClockEmoji()} ${formatDuration(cooldownLeft)}`,
            inline: false,
          })
          .setFooter({ text: t(interaction, "expedition_cooldown_footer") });

        await interaction.editReply({ embeds: [embed] });
        return;
      }
    }

    // Start new expedition - show options
    const silverEmoji = getSilverCoinEmoji();
    const goldEmoji = getGoldBarEmoji();

    const soloButton = new ButtonBuilder()
      .setCustomId(`expedition_solo_${userId}`)
      .setLabel(t(interaction, "expedition_solo_btn"))
      .setStyle(ButtonStyle.Primary)
      .setEmoji("🤠");

    const partyButton = new ButtonBuilder()
      .setCustomId(`expedition_party_${userId}`)
      .setLabel(t(interaction, "expedition_party_btn"))
      .setStyle(ButtonStyle.Success)
      .setEmoji("👥");

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      soloButton,
      partyButton,
    );

    const embed = new EmbedBuilder()
      .setColor("#FF8C00")
      .setTitle(`🗺️ ${t(interaction, "expedition_title")}`)
      .setDescription(
        `${t(interaction, "expedition_desc")}\n\n${t(interaction, "expedition_choose_type")}\n${t(interaction, "expedition_type_solo", { cowboy: getCowboyEmoji() })}\n${t(interaction, "expedition_type_party", { cowboys: getCowboysEmoji() })}`,
      )
      .addFields(
        {
          name: t(interaction, "expedition_duration_options"),
          value: `${t(interaction, "expedition_duration_3h")}\n${t(interaction, "expedition_duration_10h")}`,
          inline: false,
        },
        {
          name: t(interaction, "expedition_cooldown_label"),
          value: t(interaction, "expedition_cooldown_value"),
          inline: false,
        },
        {
          name: t(interaction, "expedition_seal_requirements"),
          value: `${t(interaction, "expedition_seal_3h")}\n${t(interaction, "expedition_seal_10h_solo")}\n${t(interaction, "expedition_seal_10h_party")}`,
          inline: false,
        },
        {
          name: t(interaction, "expedition_rewards_3h"),
          value: t(interaction, "expedition_rewards_3h_value", {
            silver: silverEmoji,
            gold: goldEmoji,
            star: getStarEmoji(),
          }),
          inline: true,
        },
        {
          name: t(interaction, "expedition_rewards_10h"),
          value: t(interaction, "expedition_rewards_10h_value", {
            silver: silverEmoji,
            gold: goldEmoji,
            star: getStarEmoji(),
          }),
          inline: true,
        },
      )
      .setImage("https://i.postimg.cc/YODZNLOB/IMG-3256.png")
      .setFooter({ text: t(interaction, "expedition_choose_wisely") });

    const response = await interaction.editReply({
      embeds: [embed],
      components: [row],
    });

    let userMadeChoice = false; // Track if user made a valid choice

    const collector = response.createMessageComponentCollector({
      filter: (i) => i.user.id === userId,
      time: 600000, // 10 minutes instead of 2
    });

    collector.on("collect", async (i) => {
      if (i.customId === `expedition_solo_${userId}`) {
        // Solo expedition - check seals first
        const userSeals = getItem(userId, "seal");

        // Check if user has at least minimum seals for any expedition
        if (userSeals < SEAL_COST_3H) {
          await i.reply({
            content: `${getCrossEmoji()} **Você não tem selos suficientes!**\n\n🎟️ Você tem: **${userSeals} selos**\n🎟️ Necessário: **${SEAL_COST_3H} selos** (expedição de 3h)\n\n*Use \`/inventory\` para verificar seus itens*`,
            flags: [MessageFlags.Ephemeral],
          });
          return;
        }

        // Mark that user made a valid choice
        userMadeChoice = true;
        collector.stop();

        await i.deferUpdate();

        const duration3hBtn = new ButtonBuilder()
          .setCustomId(`expedition_start_3h_solo_${userId}`)
          .setLabel(t(i, "expedition_btn_3h"))
          .setStyle(ButtonStyle.Primary)
          .setEmoji("🕐");

        const duration10hBtn = new ButtonBuilder()
          .setCustomId(`expedition_start_10h_solo_${userId}`)
          .setLabel(t(i, "expedition_btn_10h"))
          .setStyle(ButtonStyle.Success)
          .setEmoji("🕐")
          .setDisabled(userSeals < SEAL_COST_10H_SOLO);

        const backBtn = new ButtonBuilder()
          .setCustomId(`expedition_back_${userId}`)
          .setLabel(t(i, "expedition_btn_back"))
          .setStyle(ButtonStyle.Secondary)
          .setEmoji("◀️");

        const durationRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
          duration3hBtn,
          duration10hBtn,
          backBtn,
        );

        let descriptionText = t(i, "expedition_solo_select");
        descriptionText += `\n\n🎟️ **Seus selos:** ${userSeals}`;
        if (userSeals < SEAL_COST_10H_SOLO) {
          descriptionText += `\n⚠️ **Atenção:** Expedição de 10h requer **${SEAL_COST_10H_SOLO} selos**.`;
        }

        const durationEmbed = new EmbedBuilder()
          .setColor("#FF8C00")
          .setTitle(
            t(i, "expedition_solo_choose_duration", {
              cowboy: getCowboyEmoji(),
            }),
          )
          .setDescription(descriptionText)
          .addFields(
            {
              name: t(i, "expedition_3h_label", { clock: getClockEmoji() }),
              value: t(i, "expedition_3h_desc"),
              inline: true,
            },
            {
              name: t(i, "expedition_10h_label", { clock: getClockEmoji() }),
              value: t(i, "expedition_10h_desc"),
              inline: true,
            },
          )
          .setFooter({ text: t(i, "expedition_solo_duration_footer") });

        await i.editReply({
          embeds: [durationEmbed],
          components: [durationRow],
        });
      } else if (i.customId === `expedition_party_${userId}`) {
        // Party expedition - check seals first
        const userSeals = getItem(userId, "seal");

        // Check if user has at least minimum seals for any party expedition (10h requires 10 seals)
        const minSealsRequired = Math.min(SEAL_COST_3H, SEAL_COST_10H_PARTY);
        if (userSeals < minSealsRequired) {
          await i.reply({
            content: `${getCrossEmoji()} **Você não tem selos suficientes!**\n\n🎟️ Você tem: **${userSeals} selos**\n🎟️ Necessário: **${minSealsRequired} selos** (mínimo para expedição em grupo)\n\n*Use \`/inventory\` para verificar seus itens*`,
            flags: [MessageFlags.Ephemeral],
          });
          return;
        }

        // Mark that user made a valid choice
        userMadeChoice = true;
        collector.stop();

        await i.deferUpdate();

        const duration3hBtn = new ButtonBuilder()
          .setCustomId(`expedition_start_3h_party_${userId}`)
          .setLabel(t(i, "expedition_btn_3h_1to3"))
          .setStyle(ButtonStyle.Primary)
          .setEmoji("🕐")
          .setDisabled(userSeals < SEAL_COST_3H);

        const duration10hBtn = new ButtonBuilder()
          .setCustomId(`expedition_start_10h_party_${userId}`)
          .setLabel(t(i, "expedition_btn_10h_2to3"))
          .setStyle(ButtonStyle.Success)
          .setEmoji("🕐");

        const backBtn = new ButtonBuilder()
          .setCustomId(`expedition_back_${userId}`)
          .setLabel(t(i, "expedition_btn_back"))
          .setStyle(ButtonStyle.Secondary)
          .setEmoji("◀️");

        const durationRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
          duration3hBtn,
          duration10hBtn,
          backBtn,
        );

        let partyDescriptionText = t(i, "expedition_party_select");
        partyDescriptionText += `\n\n🎟️ **Seus selos:** ${userSeals}`;
        if (userSeals < SEAL_COST_3H) {
          partyDescriptionText += `\n⚠️ **Atenção:** Expedição de 3h requer **${SEAL_COST_3H} selos**.`;
        }

        const durationEmbed = new EmbedBuilder()
          .setColor("#FF8C00")
          .setTitle(
            t(i, "expedition_party_choose_duration", {
              cowboys: getCowboysEmoji(),
            }),
          )
          .setDescription(partyDescriptionText)
          .addFields(
            {
              name: t(i, "expedition_3h_party_label", {
                clock: getClockEmoji(),
              }),
              value: t(i, "expedition_3h_party_desc"),
              inline: true,
            },
            {
              name: t(i, "expedition_10h_party_label", {
                clock: getClockEmoji(),
              }),
              value: t(i, "expedition_10h_party_desc"),
              inline: true,
            },
          )
          .setFooter({ text: t(i, "expedition_party_duration_footer") });

        await i.editReply({
          embeds: [durationEmbed],
          components: [durationRow],
        });
      }
    });

    // Handle duration selection and party invites
    const secondCollector = response.createMessageComponentCollector({
      time: 600000, // 10 minutes - increased from 5
    });

    const pendingParties = new Map<
      string,
      {
        leader: string;
        duration: number;
        members: Set<string>;
        messageId: string;
        message: any;
      }
    >();

    secondCollector.on("collect", async (i) => {
      // Solo 3h
      if (
        i.customId === `expedition_start_3h_solo_${userId}` &&
        i.user.id === userId
      ) {
        const userSeals = getItem(userId, "seal");
        if (userSeals < SEAL_COST_3H) {
          await i.reply({
            content: t(i, "expedition_insufficient_seals", {
              cross: getCrossEmoji(),
              current: userSeals,
              required: SEAL_COST_3H,
            }),
            flags: [MessageFlags.Ephemeral],
          });
          return;
        }
        await startExpedition(
          i,
          userId,
          [userId],
          EXPEDITION_DURATION_SHORT,
          expeditionData,
        );
        secondCollector.stop();
      }
      // Solo 10h
      else if (
        i.customId === `expedition_start_10h_solo_${userId}` &&
        i.user.id === userId
      ) {
        const userSeals = getItem(userId, "seal");
        if (userSeals < SEAL_COST_10H_SOLO) {
          await i.reply({
            content: t(i, "expedition_insufficient_seals", {
              cross: getCrossEmoji(),
              current: userSeals,
              required: SEAL_COST_10H_SOLO,
            }),
            flags: [MessageFlags.Ephemeral],
          });
          return;
        }
        await startExpedition(
          i,
          userId,
          [userId],
          EXPEDITION_DURATION_LONG,
          expeditionData,
        );
        secondCollector.stop();
      }
      // Party 3h
      else if (
        i.customId === `expedition_start_3h_party_${userId}` &&
        i.user.id === userId
      ) {
        await showPartyInvite(
          i,
          userId,
          EXPEDITION_DURATION_SHORT,
          pendingParties,
        );
      }
      // Party 10h
      else if (
        i.customId === `expedition_start_10h_party_${userId}` &&
        i.user.id === userId
      ) {
        await showPartyInvite(
          i,
          userId,
          EXPEDITION_DURATION_LONG,
          pendingParties,
        );
      }
      // Back button
      else if (
        i.customId === `expedition_back_${userId}` &&
        i.user.id === userId
      ) {
        await i.update({
          embeds: [embed],
          components: [row],
        });
      }
      // Note: Party join/start logic is now handled by the partyCollector
      // created in showPartyInvite() on the public message
    });

    collector.on("end", () => {
      // Only clear components if user didn't make a valid choice (timed out)
      if (!userMadeChoice) {
        interaction.editReply({ components: [] }).catch(() => {});
      }
    });
  },
};

async function showPartyInvite(
  interaction: any,
  leaderId: string,
  duration: number,
  pendingParties: Map<string, any>,
) {
  await interaction.deferUpdate();

  const expeditionData: any = readData("expedition.json");
  const partyKey = `${leaderId}_${Date.now()}`;
  
  const durationText =
    duration === EXPEDITION_DURATION_SHORT
      ? t(interaction, "expedition_duration_3h_text")
      : t(interaction, "expedition_duration_10h_text");
  const minPlayers = duration === EXPEDITION_DURATION_LONG ? 2 : 1;
  const membersList = `<@${leaderId}>`;

  const joinButton = new ButtonBuilder()
    .setCustomId(`expedition_join_${partyKey}`)
    .setLabel(
      t(interaction, "expedition_btn_join", { current: 1 }),
    )
    .setStyle(ButtonStyle.Success)
    .setEmoji("✅");

  const startButton = new ButtonBuilder()
    .setCustomId(`expedition_start_party_${partyKey}`)
    .setLabel(t(interaction, "expedition_btn_start_party"))
    .setStyle(ButtonStyle.Primary)
    .setEmoji("🗺️")
    .setDisabled(minPlayers > 1);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    joinButton,
    startButton,
  );

  const embed = new EmbedBuilder()
    .setColor("#00FF00")
    .setTitle(
      t(interaction, "expedition_party_title", {
        cowboys: getCowboysEmoji(),
        duration: durationText,
      }),
    )
    .setDescription(
      `${t(interaction, "expedition_party_forming", { leader: leaderId })}\n\n**${t(interaction, "expedition_party_members", { current: 1 })}**\n${membersList}`,
    )
    .addFields(
      {
        name: t(interaction, "expedition_duration"),
        value: durationText,
        inline: true,
      },
      {
        name: t(interaction, "expedition_party_required"),
        value: t(interaction, "expedition_party_required_players", {
          min: minPlayers,
        }),
        inline: true,
      },
      {
        name: t(interaction, "expedition_party_rewards_divided"),
        value: t(interaction, "expedition_party_rewards_equally"),
        inline: false,
      },
    )
    .setFooter({ text: t(interaction, "expedition_party_footer") });

  // Send a PUBLIC follow-up message so everyone can see and join
  const publicMessage = await interaction.followUp({
    embeds: [embed],
    components: [row],
    ephemeral: false,
  });

  // Send confirmation to leader (ephemeral)
  await interaction.editReply({
    content: `${getCheckEmoji()} **Lobby de expedição criado!**\n\nSeus amigos agora podem ver a mensagem abaixo e clicar em "Entrar" para se juntar à expedição.`,
    embeds: [],
    components: [],
  });

  const party = {
    leader: leaderId,
    duration,
    members: new Set([leaderId]),
    messageId: publicMessage.id,
    message: publicMessage,
  };
  pendingParties.set(partyKey, party);

  // Create collector on the public message for join/start buttons
  const partyCollector = publicMessage.createMessageComponentCollector({
    time: 600000, // 10 minutes
  });

  partyCollector.on("collect", async (i: any) => {
    // Join party button
    if (i.customId === `expedition_join_${partyKey}`) {
      if (party.leader === i.user.id) {
        await i.reply({
          content: `${getCrossEmoji()} **Você já é o líder do grupo!**`,
          flags: [MessageFlags.Ephemeral],
        });
        return;
      }

      // Check if user already in party
      if (party.members.has(i.user.id)) {
        await i.reply({
          content: t(i, "expedition_already_joined", {
            cross: getCrossEmoji(),
          }),
          flags: [MessageFlags.Ephemeral],
        });
        return;
      }

      // Check party size limit
      if (party.members.size >= 3) {
        await i.reply({
          content: t(i, "expedition_party_full", {
            cross: getCrossEmoji(),
          }),
          flags: [MessageFlags.Ephemeral],
        });
        return;
      }

      // Check if user has active expedition
      const joinerData: UserExpeditionData | undefined =
        expeditionData[i.user.id];
      if (joinerData?.activeExpedition) {
        await i.reply({
          content: t(i, "expedition_already_active", {
            cross: getCrossEmoji(),
          }),
          flags: [MessageFlags.Ephemeral],
        });
        return;
      }

      // Check if user is on cooldown
      if (joinerData?.lastExpedition) {
        const timeSince = Date.now() - joinerData.lastExpedition;
        const cooldownLeft = EXPEDITION_COOLDOWN - timeSince;
        if (cooldownLeft > 0) {
          await i.reply({
            content: t(i, "expedition_on_cooldown", {
              cross: getCrossEmoji(),
              timeLeft: formatDuration(cooldownLeft),
            }),
            flags: [MessageFlags.Ephemeral],
          });
          return;
        }
      }

      // Check if user has enough seals
      const requiredSeals =
        party.duration === EXPEDITION_DURATION_SHORT
          ? SEAL_COST_3H
          : SEAL_COST_10H_PARTY;
      const userSeals = getItem(i.user.id, "seal");
      if (userSeals < requiredSeals) {
        await i.reply({
          content: t(i, "expedition_insufficient_seals", {
            cross: getCrossEmoji(),
            current: userSeals,
            required: requiredSeals,
          }),
          flags: [MessageFlags.Ephemeral],
        });
        return;
      }

      // Add to party
      party.members.add(i.user.id);

      await i.reply({
        content: t(i, "expedition_joined_party", {
          check: getCheckEmoji(),
          leader: party.leader,
          current: party.members.size,
        }),
        flags: [MessageFlags.Ephemeral],
      });

      // Update the main message to show new member
      await updatePartyMessage(i, party, pendingParties, partyKey);
    }
    // Start party expedition
    else if (i.customId === `expedition_start_party_${partyKey}`) {
      // Check if user is the leader
      if (party.leader !== i.user.id) {
        await i.reply({
          content: `${getCrossEmoji()} **Apenas o líder pode iniciar a expedição!**\n\n👑 **Líder:** <@${party.leader}>\n\nAguarde o líder iniciar a expedição.`,
          flags: [MessageFlags.Ephemeral],
        });
        return;
      }

      // Validate party size for 10h expedition
      if (
        party.duration === EXPEDITION_DURATION_LONG &&
        party.members.size < 2
      ) {
        await i.reply({
          content: t(i, "expedition_need_min_players", {
            cross: getCrossEmoji(),
          }),
          flags: [MessageFlags.Ephemeral],
        });
        return;
      }

      // Validate all members have enough seals
      const sealCost =
        party.duration === EXPEDITION_DURATION_SHORT
          ? SEAL_COST_3H
          : SEAL_COST_10H_PARTY;
      for (const memberId of party.members) {
        const memberSeals = getItem(memberId, "seal");
        if (memberSeals < sealCost) {
          await i.reply({
            content: t(i, "expedition_member_insufficient_seals", {
              cross: getCrossEmoji(),
              member: memberId,
              required: sealCost,
            }),
            flags: [MessageFlags.Ephemeral],
          });
          return;
        }
      }

      await startExpedition(
        i,
        party.leader,
        Array.from(party.members),
        party.duration,
        expeditionData,
      );
      pendingParties.delete(partyKey);
      partyCollector.stop();
    }
  });

  partyCollector.on("end", () => {
    // Disable buttons when collector expires
    if (pendingParties.has(partyKey)) {
      pendingParties.delete(partyKey);
      const disabledJoin = ButtonBuilder.from(joinButton).setDisabled(true);
      const disabledStart = ButtonBuilder.from(startButton).setDisabled(true);
      const disabledRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        disabledJoin,
        disabledStart,
      );
      publicMessage.edit({ components: [disabledRow] }).catch(() => {});
    }
  });
}

async function updatePartyMessage(
  interaction: any,
  party: any,
  pendingParties: Map<string, any>,
  partyKey?: string,
) {
  if (!partyKey) {
    // Find the party key
    for (const [key, p] of pendingParties.entries()) {
      if (p === party) {
        partyKey = key;
        break;
      }
    }
  }

  const durationText =
    party.duration === EXPEDITION_DURATION_SHORT
      ? t(interaction, "expedition_duration_3h_text")
      : t(interaction, "expedition_duration_10h_text");
  const minPlayers = party.duration === EXPEDITION_DURATION_LONG ? 2 : 1;
  const membersList = Array.from<string>(party.members as any)
    .map((id: string) => `<@${id}>`)
    .join("\n");

  const joinButton = new ButtonBuilder()
    .setCustomId(`expedition_join_${partyKey}`)
    .setLabel(
      t(interaction, "expedition_btn_join", { current: party.members.size }),
    )
    .setStyle(ButtonStyle.Success)
    .setEmoji("✅")
    .setDisabled(party.members.size >= 3);

  const startButton = new ButtonBuilder()
    .setCustomId(`expedition_start_party_${partyKey}`)
    .setLabel(t(interaction, "expedition_btn_start_party"))
    .setStyle(ButtonStyle.Primary)
    .setEmoji("🗺️")
    .setDisabled(party.members.size < minPlayers);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    joinButton,
    startButton,
  );

  const embed = new EmbedBuilder()
    .setColor("#00FF00")
    .setTitle(
      t(interaction, "expedition_party_title", {
        cowboys: getCowboysEmoji(),
        duration: durationText,
      }),
    )
    .setDescription(
      `${t(interaction, "expedition_party_forming", { leader: party.leader })}\n\n**${t(interaction, "expedition_party_members", { current: party.members.size })}**\n${membersList}`,
    )
    .addFields(
      {
        name: t(interaction, "expedition_duration"),
        value: durationText,
        inline: true,
      },
      {
        name: t(interaction, "expedition_party_required"),
        value: t(interaction, "expedition_party_required_players", {
          min: minPlayers,
        }),
        inline: true,
      },
      {
        name: t(interaction, "expedition_party_rewards_divided"),
        value: t(interaction, "expedition_party_rewards_equally"),
        inline: false,
      },
    )
    .setFooter({ text: t(interaction, "expedition_party_footer") });

  if (party.message) {
    await party.message.edit({
      embeds: [embed],
      components: [row],
    });
  } else {
    await interaction.editReply({
      embeds: [embed],
      components: [row],
    });
  }
}

async function startExpedition(
  interaction: any,
  leaderId: string,
  members: string[],
  duration: number,
  expeditionData: any,
) {
  await interaction.deferUpdate();

  // Check inventory capacity for all members
  const capacityCheck = checkInventoryCapacity(members, duration);
  if (!capacityCheck.hasCapacity) {
    await interaction.editReply({
      content: `${getCrossEmoji()} **Inventário cheio!**\n\n<@${capacityCheck.user}> não tem espaço suficiente no inventário para as recompensas da expedição.\n\n**Espaço necessário:** ~${capacityCheck.needed}kg\n\n💡 *Use \`/inventory\` para ver seu inventário ou venda/organize itens antes de partir.*`,
      components: [],
    });
    return;
  }

  // Double-check all members have enough seals before starting
  const sealCost =
    duration === EXPEDITION_DURATION_SHORT
      ? SEAL_COST_3H
      : members.length === 1
        ? SEAL_COST_10H_SOLO
        : SEAL_COST_10H_PARTY;

  for (const memberId of members) {
    const memberSeals = getItem(memberId, "seal");
    if (memberSeals < sealCost) {
      await interaction.editReply({
        content: t(interaction, "expedition_insufficient_seals", {
          cross: getCrossEmoji(),
          current: memberSeals,
          required: sealCost,
        }),
        components: [],
      });
      return;
    }
  }

  const startTime = Date.now();
  const endTime = startTime + duration;
  const partyId = `expedition_${leaderId}_${startTime}`;

  // Create party with guild and channel info for fallback notifications
  if (!expeditionData.parties) expeditionData.parties = {};
  expeditionData.parties[partyId] = {
    leader: leaderId,
    members,
    duration,
    startTime,
    endTime,
    dmSent: {},
    guildId: interaction.guildId || undefined,
    channelId: interaction.channelId || undefined,
    rewardsGiven: false,
  };

  // Consume seals from all members (after validation passed)
  for (const memberId of members) {
    await removeItem(memberId, "seal", sealCost);
  }

  // Update all members
  for (const memberId of members) {
    if (!expeditionData[memberId]) {
      expeditionData[memberId] = { totalExpeditions: 0 };
    }
    const memberData = expeditionData[memberId] as UserExpeditionData;
    memberData.activeExpedition = {
      partyId,
      isLeader: memberId === leaderId,
    };
  }

  writeData("expedition.json", expeditionData);

  const durationText =
    duration === EXPEDITION_DURATION_SHORT
      ? t(interaction, "expedition_duration_3h_text")
      : t(interaction, "expedition_duration_10h_text");
  const membersList = members.map((id) => `<@${id}>`).join(", ");

  const embed = new EmbedBuilder()
    .setColor("#00FF00")
    .setTitle(t(interaction, "expedition_started_title"))
    .setDescription(
      t(interaction, "expedition_started_desc", {
        check: getCheckEmoji(),
        duration: durationText,
      }),
    )
    .addFields(
      {
        name: t(interaction, "expedition_party_members_label", {
          cowboys: getCowboysEmoji(),
        }),
        value: membersList,
        inline: false,
      },
      {
        name: t(interaction, "expedition_duration"),
        value: durationText,
        inline: true,
      },
      {
        name: t(interaction, "expedition_estimated_return", {
          timer: getTimerEmoji(),
        }),
        value: `<t:${Math.floor(endTime / 1000)}:R>`,
        inline: true,
      },
    )
    .setFooter({ text: t(interaction, "expedition_started_footer") });

  await interaction.editReply({
    embeds: [embed],
    components: [],
  });

  // Rewards will be automatically processed by the expedition checker system
  // This prevents loss of rewards if the bot restarts during the expedition
  console.log(
    `🗺️ Expedição iniciada: ${partyId} - Término em ${new Date(endTime).toLocaleString()}`,
  );
}
