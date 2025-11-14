import { Client, EmbedBuilder, TextChannel } from "discord.js";
import { readData, writeData } from "./database";
import { addItem } from "./inventoryManager";
import { addUserSilver } from "./dataManager";
import { addXp } from "./xpManager";
import { tUser } from "./i18n";
import {
  getSilverCoinEmoji,
  getGoldBarEmoji,
  getCheckEmoji,
  getMoneybagEmoji,
  getStatsEmoji,
  getStarEmoji,
} from "./customEmojis";

interface ExpeditionParty {
  leader: string;
  members: string[];
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

interface UserExpeditionData {
  activeExpedition?: {
    partyId: string;
    isLeader: boolean;
  };
  lastExpedition?: number;
  totalExpeditions: number;
}

function calculateRewards(duration: number, partySize: number) {
  const EXPEDITION_DURATION_SHORT = 3 * 60 * 60 * 1000;

  if (duration === EXPEDITION_DURATION_SHORT) {
    return {
      silverMin: 10000,
      silverMax: 30000,
      goldBars: 8,
      wheatMin: 2000,
      wheatMax: 6000,
      honey: 10,
      xp: 1000,
    };
  } else {
    return {
      silverMin: 40000,
      silverMax: 100000,
      goldBars: 25,
      wheatMin: 8000,
      wheatMax: 15000,
      honey: 35,
      xp: 3500,
    };
  }
}

function distributeFairly(total: number, partySize: number): number[] {
  const base = Math.floor(total / partySize);
  const remainder = total % partySize;

  const distribution: number[] = [];

  for (let i = 0; i < partySize; i++) {
    if (i < remainder) {
      distribution.push(base + 1);
    } else {
      distribution.push(base);
    }
  }

  return distribution;
}

async function sendNotification(
  client: Client,
  memberId: string,
  memberRewards: {
    silver: number;
    gold: number;
    wheat: number;
    honey: number;
    xp: number;
  },
  totalRewards: {
    silver: number;
    gold: number;
    wheat: number;
    honey: number;
    xp: number;
  },
  partySize: number,
  duration: number,
  guildId?: string,
  channelId?: string,
): Promise<boolean> {
  const silverEmoji = getSilverCoinEmoji();
  const goldEmoji = getGoldBarEmoji();
  const checkEmoji = getCheckEmoji();
  const moneybagEmoji = getMoneybagEmoji();
  const statsEmoji = getStatsEmoji();
  const starEmoji = getStarEmoji();

  const durationText = duration === 3 * 60 * 60 * 1000 ? "3h" : "10h";

  const rewardsSection =
    partySize > 1
      ? tUser(memberId, "expedition_dm_rewards_divided", {
          moneybag: moneybagEmoji,
          count: partySize,
        })
      : tUser(memberId, "expedition_dm_rewards_solo");

  const totalSection =
    partySize > 1
      ? tUser(memberId, "expedition_dm_total_section", {
          stats: statsEmoji,
          silver: silverEmoji,
          silverAmount: totalRewards.silver.toLocaleString(),
          gold: goldEmoji,
          goldAmount: totalRewards.gold,
          wheat: "🌾",
          wheatAmount: totalRewards.wheat.toLocaleString(),
          honey: "🍯",
          honeyAmount: totalRewards.honey,
          star: starEmoji,
          xpAmount: totalRewards.xp.toLocaleString(),
        })
      : "";

  const description = `${tUser(memberId, "expedition_dm_complete_desc", { duration: durationText })}${rewardsSection}\n${silverEmoji} **${memberRewards.silver.toLocaleString()}** ${tUser(memberId, "silver_coins")}\n${goldEmoji} **${memberRewards.gold}x** ${tUser(memberId, "gold_bars")}\n🌾 **${memberRewards.wheat.toLocaleString()}x** ${tUser(memberId, "wheat_item")}\n🍯 **${memberRewards.honey}x** ${tUser(memberId, "honey_item")}\n${starEmoji} **+${memberRewards.xp.toLocaleString()} XP**${totalSection}`;

  const dmEmbed = new EmbedBuilder()
    .setColor("#00FF00")
    .setTitle(
      tUser(memberId, "expedition_dm_complete_title", { check: checkEmoji }),
    )
    .setDescription(description)
    .setFooter({ text: tUser(memberId, "expedition_dm_footer") });

  try {
    const user = await client.users.fetch(memberId);
    await user.send({ embeds: [dmEmbed] });
    console.log(`✅ DM enviada para ${memberId}`);
    return true;
  } catch (error) {
    console.log(
      `⚠️ Não foi possível enviar DM para ${memberId}, tentando canal do servidor...`,
    );

    if (guildId && channelId) {
      try {
        const guild = await client.guilds.fetch(guildId);
        const channel = await guild.channels.fetch(channelId);

        if (channel && channel.isTextBased()) {
          await (channel as TextChannel).send({
            content: `<@${memberId}>`,
            embeds: [dmEmbed],
          });
          console.log(`✅ Notificação enviada no canal para ${memberId}`);
          return true;
        }
      } catch (channelError) {
        console.log(
          `❌ Falha ao enviar notificação no canal para ${memberId}:`,
          channelError,
        );
      }
    }

    return false;
  }
}

export async function checkCompletedExpeditions(
  client: Client,
): Promise<number> {
  try {
    const expeditionData: any = readData("expedition.json");
    if (!expeditionData.parties) return 0;

    const now = Date.now();
    let completedCount = 0;

    const partyIds = Object.keys(expeditionData.parties);

    for (const partyId of partyIds) {
      const party: ExpeditionParty = expeditionData.parties[partyId];

      if (party.endTime <= now && !party.rewardsGiven) {
        console.log(`🗺️ Processando expedição completada: ${partyId}`);

        const rewards = calculateRewards(party.duration, party.members.length);
        const silverCoins =
          Math.floor(
            Math.random() * (rewards.silverMax - rewards.silverMin + 1),
          ) + rewards.silverMin;
        const goldBars = rewards.goldBars;
        const wheat =
          Math.floor(
            Math.random() * (rewards.wheatMax - rewards.wheatMin + 1),
          ) + rewards.wheatMin;
        const honey = rewards.honey;
        const xp = rewards.xp;

        const partySize = party.members.length;

        const silverDistribution = distributeFairly(silverCoins, partySize);
        const goldDistribution = distributeFairly(goldBars, partySize);
        const wheatDistribution = distributeFairly(wheat, partySize);
        const honeyDistribution = distributeFairly(honey, partySize);
        const xpDistribution = distributeFairly(xp, partySize);

        party.totalRewards = {
          silver: silverCoins,
          gold: goldBars,
          wheat: wheat,
          honey: honey,
          xp: xp,
        };

        for (let i = 0; i < party.members.length; i++) {
          const memberId = party.members[i];

          try {
            const memberRewards = {
              silver: silverDistribution[i],
              gold: goldDistribution[i],
              wheat: wheatDistribution[i],
              honey: honeyDistribution[i],
              xp: xpDistribution[i],
            };

            await addUserSilver(memberId, memberRewards.silver);
            await addItem(memberId, "gold", memberRewards.gold);
            await addItem(memberId, "wheat", memberRewards.wheat);
            await addItem(memberId, "honey", memberRewards.honey);
            addXp(memberId, memberRewards.xp);

            if (!expeditionData[memberId]) {
              expeditionData[memberId] = { totalExpeditions: 0 };
            }
            const memberData = expeditionData[memberId] as UserExpeditionData;
            memberData.activeExpedition = undefined;
            memberData.lastExpedition = now;
            memberData.totalExpeditions =
              (memberData.totalExpeditions || 0) + 1;

            const notificationSent = await sendNotification(
              client,
              memberId,
              memberRewards,
              party.totalRewards,
              partySize,
              party.duration,
              party.guildId,
              party.channelId,
            );

            if (!party.dmSent) party.dmSent = {};
            party.dmSent[memberId] = notificationSent;

            console.log(
              `✅ Recompensas dadas para ${memberId}: ${memberRewards.silver} silver, ${memberRewards.gold} gold, ${memberRewards.wheat} wheat, ${memberRewards.honey} honey`,
            );
          } catch (error) {
            console.log(
              `❌ Erro ao processar recompensas para ${memberId}:`,
              error,
            );
          }
        }

        party.rewardsGiven = true;
        completedCount++;

        // CRITICAL: Save immediately after processing each expedition to prevent duplication
        writeData("expedition.json", expeditionData);

        console.log(
          `✅ Expedição ${partyId} completada e recompensas distribuídas`,
        );
      }

      if (party.rewardsGiven && party.endTime + 60 * 60 * 1000 < now) {
        delete expeditionData.parties[partyId];
        writeData("expedition.json", expeditionData);
        console.log(`🗑️ Expedição antiga removida: ${partyId}`);
      }
    }

    return completedCount;
  } catch (error) {
    console.error("❌ Erro ao verificar expedições completadas:", error);
    return 0;
  }
}

export function startExpeditionChecker(client: Client): NodeJS.Timeout {
  console.log("🗺️ Iniciando verificador automático de expedições");

  const interval = setInterval(async () => {
    try {
      const completed = await checkCompletedExpeditions(client);
      if (completed > 0) {
        console.log(
          `🗺️ ${completed} expedição(ões) completada(s) e processada(s)`,
        );
      }
    } catch (error) {
      console.error("❌ Erro no verificador de expedições:", error);
    }
  }, 60 * 1000);

  console.log("✅ Verificador de expedições ativo - verifica a cada 1 minuto");

  return interval;
}
