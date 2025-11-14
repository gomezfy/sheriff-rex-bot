import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  MessageFlags,
  ComponentType,
  AttachmentBuilder,
} from "discord.js";
import {
  getUserSilver,
  removeUserSilver,
  addBounty,
} from "../../utils/dataManager";
import { addItem } from "../../utils/inventoryManager";
import {
  isPunished,
  getRemainingTime,
  formatTime,
} from "../../utils/punishmentManager";
import { generateWantedPoster } from "../../utils/wantedPoster";
import {
  getCowboyHorseEmoji,
  getSilverCoinEmoji,
  getCheckEmoji,
  getCancelEmoji,
  getWarningEmoji,
  getClockEmoji,
  getRevolverEmoji,
  getMuteEmoji,
} from "../../utils/customEmojis";
import { t, getLocale, tLocale } from "../../utils/i18n";
import { Command } from "../../types";
import { createProgressBarString } from "../../utils/progressBar";

const cooldowns = new Map<string, number>();
const activeHeists = new Map<string, Set<string>>();
const heistTimers = new Map<string, NodeJS.Timeout>();
const COOLDOWN_TIME = 300000; // 5 minutos
const ENTRY_FEE = 1000; // 1000 Silver Coins para tentar
const HEIST_DURATION = 120000; // 2 minutos para formar o grupo
const ROBBERY_DURATION = 300000; // 5 minutos para executar o roubo

function createHeistButtons(locale: string): ActionRowBuilder<ButtonBuilder> {
  const joinLabel = tLocale(locale, "roubo_btn_join");
  const cancelLabel = tLocale(locale, "roubo_btn_cancel");

  const joinButton = new ButtonBuilder()
    .setCustomId("join_heist")
    .setLabel(joinLabel)
    .setStyle(ButtonStyle.Secondary);

  const cancelButton = new ButtonBuilder()
    .setCustomId("cancel_heist")
    .setLabel(cancelLabel)
    .setStyle(ButtonStyle.Secondary);

  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    joinButton,
    cancelButton,
  );
}

function buildHeistEmbed(
  organizerTag: string,
  participants: Set<string>,
  requiredPlayers: number,
  locale: string,
  remainingSeconds: number,
  client: any,
): EmbedBuilder {
  const participantsList = Array.from(participants)
    .map((id, index) => {
      const user = client.users.cache.get(id);
      return `${index + 1}. ${user?.tag || "Unknown"}`;
    })
    .join("\n");

  const percentage = Math.floor((remainingSeconds / 120) * 100);
  const progressBar = createProgressBarString(percentage, 15, "█", "░");
  const timeLeft = Math.ceil(remainingSeconds);

  const title = tLocale(locale, "roubo_title");
  const organizing = tLocale(locale, "roubo_organizing");
  const details = tLocale(locale, "roubo_details");
  const playersNeeded = tLocale(locale, "roubo_players_needed");
  const cattleToSteal = tLocale(locale, "roubo_cattle_to_steal");
  const cattleOptions = tLocale(locale, "roubo_cattle_options");
  const costPer = tLocale(locale, "roubo_cost_per_person");
  const warning = tLocale(locale, "roubo_warning");
  const warningText = tLocale(locale, "roubo_warning_text");
  const participantsLabel = tLocale(locale, "roubo_participants_label");
  const timeRemaining = tLocale(locale, "roubo_time_remaining");
  const footerText = tLocale(locale, "roubo_footer_join");
  const random = tLocale(locale, "roubo_random_word");

  return new EmbedBuilder()
    .setColor(0xff6b35)
    .setTitle(title)
    .setImage("https://i.postimg.cc/52WZvCpc/IMG-3332.png")
    .setDescription(
      `**${organizerTag}** ${organizing}\n\n**${details}**\n${playersNeeded}: **${requiredPlayers}**\n${cattleToSteal}: **${cattleOptions}** (${random})\n${costPer}: **${ENTRY_FEE.toLocaleString()} Silver**\n\n**${warning}:** ${warningText}\n\n**${participantsLabel} (${participants.size}/${requiredPlayers}):**\n${participantsList}\n\n**${timeRemaining}:** ${timeLeft}s\n\`${progressBar}\``,
    )
    .setFooter({
      text: footerText,
    })
    .setTimestamp();
}

export const data = new SlashCommandBuilder()
  .setName("roubo")
  .setDescription(
    "🐄 Roubo de gado cooperativo! Escolha de 2 a 4 jogadores para roubar gado!",
  )
  .addIntegerOption((option) =>
    option
      .setName("participantes")
      .setDescription("Número de participantes necessários (2-4)")
      .setRequired(true)
      .addChoices(
        { name: "2 jogadores", value: 2 },
        { name: "3 jogadores", value: 3 },
        { name: "4 jogadores", value: 4 },
      ),
  );

export async function execute(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  const userId = interaction.user.id;
  const locale = getLocale(interaction);
  const requiredPlayers = interaction.options.getInteger("participantes", true);

  const punishment = isPunished(userId);
  if (punishment) {
    const remaining = getRemainingTime(userId) || 0;
    const lockEmoji = getMuteEmoji();
    const timerEmoji = getClockEmoji();
    await interaction.reply({
      content: `${lockEmoji} **${tLocale(locale, "roubo_in_jail_cooldown")}**\n\n${punishment.reason}\n\n${timerEmoji} ${tLocale(locale, "roubo_time_remaining_punishment")}: **${formatTime(remaining)}**`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const now = Date.now();
  if (cooldowns.has(userId)) {
    const cooldownTimestamp = cooldowns.get(userId);
    if (cooldownTimestamp) {
      const expirationTime = cooldownTimestamp + COOLDOWN_TIME;
      if (now < expirationTime) {
        const timeLeft = Math.ceil((expirationTime - now) / 1000);
        const timerEmoji = getClockEmoji();
        await interaction.reply({
          content: `${timerEmoji} ${tLocale(locale, "roubo_cooldown_wait", { time: timeLeft })}`,
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
    }
  }

  const userSilver = getUserSilver(userId);
  if (userSilver < ENTRY_FEE) {
    const cancelEmoji = getCancelEmoji();
    await interaction.reply({
      content: `${cancelEmoji} ${tLocale(locale, "roubo_entry_fee_required", { amount: ENTRY_FEE.toLocaleString() })}`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const heistId = `${interaction.channelId}-${Date.now()}`;
  const participants = new Set<string>();
  participants.add(userId);
  activeHeists.set(heistId, participants);

  const startEmbed = buildHeistEmbed(
    interaction.user.tag,
    participants,
    requiredPlayers,
    locale,
    120,
    interaction.client,
  );

  await interaction.reply({
    embeds: [startEmbed],
    components: [createHeistButtons(locale)],
  });

  const response = await interaction.fetchReply();
  const collector = response.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: HEIST_DURATION,
  });

  let heistStarted = false;
  const startTime = Date.now();

  const progressInterval = setInterval(async () => {
    const currentParticipants = activeHeists.get(heistId);
    if (!currentParticipants || heistStarted) {
      clearInterval(progressInterval);
      return;
    }

    const elapsed = Date.now() - startTime;
    const remainingMs = HEIST_DURATION - elapsed;
    const remainingSeconds = Math.max(0, remainingMs / 1000);

    if (remainingSeconds <= 0) {
      clearInterval(progressInterval);
      return;
    }

    const updatedEmbed = buildHeistEmbed(
      interaction.user.tag,
      currentParticipants,
      requiredPlayers,
      locale,
      remainingSeconds,
      interaction.client,
    );

    try {
      await interaction.editReply({
        embeds: [updatedEmbed],
        components: [createHeistButtons(locale)],
      });
    } catch (error) {
      clearInterval(progressInterval);
    }
  }, 5000);

  heistTimers.set(heistId, progressInterval);

  collector.on("collect", async (i) => {
    const currentParticipants = activeHeists.get(heistId) || new Set();

    if (i.customId === "cancel_heist") {
      if (i.user.id !== userId) {
        await i.reply({
          content: `❌ ${tLocale(locale, "roubo_only_organizer_cancel")}`,
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      const interval = heistTimers.get(heistId);
      if (interval) {
        clearInterval(interval);
        heistTimers.delete(heistId);
      }

      const cancelEmoji = getCancelEmoji();
      await i.update({
        content: `${cancelEmoji} ${tLocale(locale, "roubo_cancelled")}`,
        embeds: [],
        components: [],
      });
      activeHeists.delete(heistId);
      collector.stop();
      return;
    }

    if (i.customId === "join_heist") {
      if (currentParticipants.has(i.user.id)) {
        await i.reply({
          content: tLocale(locale, "roubo_already_in"),
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      if (currentParticipants.size >= requiredPlayers) {
        await i.reply({
          content: tLocale(locale, "roubo_heist_full"),
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      const joinerSilver = getUserSilver(i.user.id);
      if (joinerSilver < ENTRY_FEE) {
        await i.reply({
          content: `❌ ${tLocale(locale, "roubo_need_silver", { amount: ENTRY_FEE.toLocaleString() })}`,
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      const joinerPunishment = isPunished(i.user.id);
      if (joinerPunishment) {
        await i.reply({
          content: `🔒 ${tLocale(locale, "roubo_in_jail")}`,
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      currentParticipants.add(i.user.id);
      activeHeists.set(heistId, currentParticipants);

      const elapsed = Date.now() - startTime;
      const remainingMs = HEIST_DURATION - elapsed;
      const remainingSeconds = Math.max(0, remainingMs / 1000);

      const updateEmbed = buildHeistEmbed(
        interaction.user.tag,
        currentParticipants,
        requiredPlayers,
        locale,
        remainingSeconds,
        i.client,
      );

      if (currentParticipants.size < requiredPlayers) {
        await i.update({
          embeds: [updateEmbed],
          components: [createHeistButtons(locale)],
        });
      } else {
        heistStarted = true;

        const interval = heistTimers.get(heistId);
        if (interval) {
          clearInterval(interval);
          heistTimers.delete(heistId);
        }

        await i.update({
          content: `**${tLocale(locale, "roubo_group_complete")}**`,
          embeds: [updateEmbed],
          components: [],
        });

        collector.stop("started");

        setTimeout(async () => {
          await showRobberyProgress(
            interaction,
            Array.from(currentParticipants),
            locale,
          );
          await executeHeist(
            interaction,
            Array.from(currentParticipants),
            locale,
            heistId,
            requiredPlayers,
          );
        }, 3000);
      }
    }
  });

  collector.on("end", async (_, reason) => {
    const interval = heistTimers.get(heistId);
    if (interval) {
      clearInterval(interval);
      heistTimers.delete(heistId);
    }

    if (reason === "time" && !heistStarted) {
      activeHeists.delete(heistId);
      await interaction
        .editReply({
          content: `⏰ ${tLocale(locale, "roubo_time_expired")}`,
          embeds: [],
          components: [],
        })
        .catch(() => {});
    }
  });
}

async function showRobberyProgress(
  interaction: ChatInputCommandInteraction,
  participants: string[],
  locale: string,
): Promise<void> {
  const progressTitle = tLocale(locale, "roubo_starting");
  const progressDesc = tLocale(locale, "roubo_progress_desc");
  const beQuiet = tLocale(locale, "roubo_be_quiet");
  const rancherPatrol = tLocale(locale, "roubo_rancher_patrol");
  const participantsLabel = tLocale(locale, "roubo_participants_label");
  const progressLabel = tLocale(locale, "roubo_progress_label");
  const timeRemainingLabel = tLocale(locale, "roubo_time_remaining");
  const inProgressFooter = tLocale(locale, "roubo_in_progress");

  const steps = 10;
  const stepDuration = ROBBERY_DURATION / steps;

  for (let i = 0; i <= steps; i++) {
    const percentage = Math.floor((i / steps) * 100);
    const progressBar = createProgressBarString(percentage, 20, "█", "░");
    const timeRemaining = Math.ceil(
      ((steps - i) / steps) * (ROBBERY_DURATION / 1000),
    );
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    const timeDisplay = `${minutes}:${seconds.toString().padStart(2, "0")}`;

    const embed = new EmbedBuilder()
      .setColor(0xff8c00)
      .setTitle(progressTitle)
      .setDescription(
        `${progressDesc}\n\n**${participantsLabel}:** ${participants.length}\n\n**${progressLabel}:**\n\`${progressBar}\` ${percentage}%\n\n**${timeRemainingLabel}:** ${timeDisplay}\n\n${beQuiet}\n${rancherPatrol}`,
      )
      .setFooter({
        text: inProgressFooter,
      })
      .setTimestamp();

    try {
      await interaction.editReply({ embeds: [embed], components: [] });
    } catch (error) {
      console.error("Error updating progress bar:", error);
    }

    if (i < steps) {
      await new Promise((resolve) => setTimeout(resolve, stepDuration));
    }
  }
}

async function executeHeist(
  interaction: ChatInputCommandInteraction,
  participants: string[],
  locale: string,
  heistId: string,
  requiredPlayers: number,
): Promise<void> {
  for (const participantId of participants) {
    const silver = getUserSilver(participantId);
    if (silver < ENTRY_FEE) {
      await interaction.followUp({
        content: `❌ ${tLocale(locale, "roubo_insufficient_silver")}`,
      });
      activeHeists.delete(heistId);
      return;
    }
    await removeUserSilver(participantId, ENTRY_FEE);
    cooldowns.set(participantId, Date.now());
  }

  const cattleOptions = [8, 12, 20];
  const totalCattle =
    cattleOptions[Math.floor(Math.random() * cattleOptions.length)];
  const successRate = 65; // 65% de chance de sucesso (ajustado para melhor balanceamento)

  const random = Math.random() * 100;
  const success = random < successRate;

  if (success) {
    const cattlePerPlayer = Math.floor(totalCattle / participants.length);
    const remainder = totalCattle % participants.length;

    for (let i = 0; i < participants.length; i++) {
      const participantId = participants[i];
      const cattleAmount =
        i === 0 ? cattlePerPlayer + remainder : cattlePerPlayer;
      await addItem(participantId, "cattle", cattleAmount);
    }

    const checkEmoji = getCheckEmoji();
    const horseEmoji = getCowboyHorseEmoji();
    const cattleWord = tLocale(locale, "roubo_cattle_word");

    const participantsList = await Promise.all(
      participants.map(async (id, index) => {
        const user = await interaction.client.users.fetch(id);
        const cattle =
          index === 0 ? cattlePerPlayer + remainder : cattlePerPlayer;
        return `${index + 1}. ${user.tag} - **${cattle} ${cattleWord}**`;
      }),
    );

    const successTitle = tLocale(locale, "roubo_success_title");
    const successDesc = tLocale(locale, "roubo_success_desc", {
      cattle: totalCattle,
    });
    const distributionLabel = tLocale(locale, "roubo_distribution");
    const addedInventory = tLocale(locale, "roubo_added_inventory");
    const totalCattleLabel = tLocale(locale, "roubo_total_cattle");
    const participantsLabel = tLocale(locale, "roubo_participants_count");
    const teamworkFooter = tLocale(locale, "roubo_teamwork");

    const successEmbed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle(`${checkEmoji} ${successTitle}`)
      .setDescription(
        `${horseEmoji} **${successDesc}**\n\n**${distributionLabel}:**\n${participantsList.join("\n")}\n\n${addedInventory}`,
      )
      .addFields(
        {
          name: totalCattleLabel,
          value: totalCattle.toString(),
          inline: true,
        },
        {
          name: participantsLabel,
          value: participants.length.toString(),
          inline: true,
        },
      )
      .setFooter({
        text: teamworkFooter,
      })
      .setTimestamp();

    await interaction.followUp({
      embeds: [successEmbed],
    });

    activeHeists.delete(heistId);
  } else {
    const bountyAmount = 8000;
    const crimeReason = tLocale(locale, "roubo_title");

    const warningEmoji = getWarningEmoji();
    const revolverEmoji = getRevolverEmoji();
    const sheriffId = interaction.client.user!.id;
    const sheriffTag = "🚨 Sheriff";

    const wantedPosters: AttachmentBuilder[] = [];
    const participantsList = await Promise.all(
      participants.map(async (id, index) => {
        const user = await interaction.client.users.fetch(id);

        addBounty(id, user.tag, sheriffId, sheriffTag, bountyAmount);

        const poster = await generateWantedPoster(user, bountyAmount, locale);
        wantedPosters.push(
          new AttachmentBuilder(poster, { name: `wanted-${id}.png` }),
        );

        return `${index + 1}. ${user.tag}`;
      }),
    );

    const failTitle = tLocale(locale, "roubo_fail_title");
    const failDesc = tLocale(locale, "roubo_fail_desc");
    const allWanted = tLocale(locale, "roubo_all_wanted");
    const bountyPerHead = tLocale(locale, "roubo_bounty_per_head");
    const reason = tLocale(locale, "roubo_reason");
    const wantedList = tLocale(locale, "roubo_wanted_list");
    const watchBountyHunters = tLocale(locale, "roubo_watch_bounty_hunters");
    const crimeFooter = tLocale(locale, "roubo_crime_sometimes");

    const failEmbed = new EmbedBuilder()
      .setColor(0xff0000)
      .setTitle(`${warningEmoji} ${failTitle}`)
      .setDescription(
        `${revolverEmoji} **${failDesc}**\n\n**${allWanted}**\n${bountyPerHead}: **${bountyAmount.toLocaleString()} Silver**\n${reason}: **${crimeReason}**\n\n**${wantedList}:**\n${participantsList.join("\n")}\n\n${watchBountyHunters}`,
      )
      .setFooter({
        text: crimeFooter,
      })
      .setTimestamp();

    await interaction.followUp({
      embeds: [failEmbed],
      files: wantedPosters,
    });

    activeHeists.delete(heistId);
  }
}
