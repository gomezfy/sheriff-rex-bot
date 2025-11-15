import {
  ButtonInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
} from "discord.js";
import { teamCaptureManager } from "../utils/teamCaptureManager";
import { getBountyByTarget, removeBounty } from "../utils/dataManager";
import { addItem } from "../utils/inventoryManager";
import { formatCurrency, successEmbed, errorEmbed } from "../utils/embeds";
import {
  getCowboysEmoji,
  getDartEmoji,
  getMoneybagEmoji,
  getTimerEmoji,
  getStatsEmoji,
  getCowboyEmoji,
  getCheckEmoji,
  getCancelEmoji,
  getRunningCowboyEmoji,
  getTrophyEmoji,
  getAlarmEmoji,
  getBalanceEmoji,
  getDustEmoji,
  getPartyEmoji,
} from "../utils/customEmojis";

// Import cooldown data from team-capture command
let teamCaptureData: { [userId: string]: number };
try {
  const teamCaptureModule = require("../commands/bounty/teamcapture");
  teamCaptureData = teamCaptureModule.teamCaptureData || {};
} catch (error) {
  teamCaptureData = {};
}

interface Bounty {
  targetId: string;
  targetTag: string;
  totalAmount: number;
  contributors: Array<{
    id: string;
    tag: string;
    amount: number;
  }>;
  createdAt: number;
  updatedAt: number;
}

export async function handleTeamCaptureButton(
  interaction: ButtonInteraction
): Promise<void> {
  const [action, type, targetId] = interaction.customId.split("_");

  if (action !== "team") return;

  const teamData = teamCaptureManager.getTeamByMessage(interaction.message.id);

  if (!teamData) {
    await interaction.reply({
      content: "❌ This team hunt has expired or doesn't exist anymore.",
      ephemeral: true,
    });
    return;
  }

  const { teamId, team } = teamData;

  switch (type) {
    case "join":
      await handleJoinTeam(interaction, teamId, team);
      break;
    case "leave":
      await handleLeaveTeam(interaction, teamId, team);
      break;
    case "start":
      await handleStartHunt(interaction, teamId, team);
      break;
    case "cancel":
      await handleCancelHunt(interaction, teamId, team);
      break;
  }
}

async function handleJoinTeam(
  interaction: ButtonInteraction,
  teamId: string,
  team: any
): Promise<void> {
  const result = teamCaptureManager.addMember(teamId, interaction.user);

  if (!result.success) {
    await interaction.reply({
      content: `${getCancelEmoji()} ${result.error}`,
      ephemeral: true,
    });
    return;
  }

  // Update the embed
  await updateTeamEmbed(interaction, teamId, team);

  await interaction.reply({
    content: `${getCheckEmoji()} You've joined the hunting party! Good luck, partner!`,
    ephemeral: true,
  });
}

async function handleLeaveTeam(
  interaction: ButtonInteraction,
  teamId: string,
  team: any
): Promise<void> {
  if (!team.members.some((m: any) => m.id === interaction.user.id)) {
    await interaction.reply({
      content: `${getCancelEmoji()} You're not in this team!`,
      ephemeral: true,
    });
    return;
  }

  if (team.leaderId === interaction.user.id) {
    // Leader is leaving, cancel the hunt
    await handleCancelHunt(interaction, teamId, team);
    return;
  }

  teamCaptureManager.removeMember(teamId, interaction.user.id);
  await updateTeamEmbed(interaction, teamId, team);

  await interaction.reply({
    content: "You've left the team.",
    ephemeral: true,
  });
}

async function handleStartHunt(
  interaction: ButtonInteraction,
  teamId: string,
  team: any
): Promise<void> {
  // Only leader can start
  if (team.leaderId !== interaction.user.id) {
    await interaction.reply({
      content: `${getCancelEmoji()} Only the team leader can start the hunt!`,
      ephemeral: true,
    });
    return;
  }

  if (team.members.length < 2) {
    await interaction.reply({
      content: `${getCancelEmoji()} You need at least 2 members to start a team hunt!`,
      ephemeral: true,
    });
    return;
  }

  if (team.status !== "ready" && team.status !== "recruiting") {
    await interaction.reply({
      content: `${getCancelEmoji()} This hunt is no longer active!`,
      ephemeral: true,
    });
    return;
  }

  await interaction.deferUpdate();

  // Check if bounty still exists
  const bounty: Bounty = getBountyByTarget(team.targetId);
  if (!bounty) {
    const embed = errorEmbed(
      `${getCancelEmoji()} Bounty No Longer Active`,
      `The bounty on **${team.targetTag}** has been removed or claimed!`,
      "Better luck next time, partner.",
    );

    await interaction.editReply({
      embeds: [embed],
      components: [],
    });

    teamCaptureManager.completeTeam(teamId);
    return;
  }

  // Calculate success rate based on team size
  const baseSuccessRate = 0.5;
  const teamBonus = (team.members.length - 1) * 0.1; // +10% per additional member
  const successRate = Math.min(0.9, baseSuccessRate + teamBonus);

  const captureChance = Math.random();

  if (captureChance > successRate) {
    // Hunt failed
    const embed = new EmbedBuilder()
      .setColor("#FF6B6B")
      .setTitle(`${getDustEmoji()} ${getRunningCowboyEmoji()} The Outlaw Escaped!`)
      .setDescription(
        `Despite your team's best efforts, **${team.targetTag}** managed to slip away!\n\n` +
        `The outlaw outsmarted your hunting party this time.`
      )
      .addFields(
        {
          name: `${getDartEmoji()} Target`,
          value: team.targetTag,
          inline: true,
        },
        {
          name: `${getMoneybagEmoji()} Lost Reward`,
          value: formatCurrency(bounty.totalAmount, "silver"),
          inline: true,
        },
        {
          name: `${getCowboysEmoji()} Team Size`,
          value: `${team.members.length} hunters`,
          inline: true,
        },
        {
          name: `${getStatsEmoji()} Success Rate`,
          value: `${(successRate * 100).toFixed(0)}%`,
          inline: true,
        },
        {
          name: "🎲 Roll Result",
          value: `${(captureChance * 100).toFixed(1)}% (needed ≤${(successRate * 100).toFixed(0)}%)`,
          inline: true,
        },
        {
          name: `${getCowboysEmoji()} Team Members`,
          value: team.members.map((m: any, i: number) => 
            `${i + 1}. ${m.tag}${i === 0 ? " (Leader)" : ""}`
          ).join("\n"),
          inline: false,
        },
      )
      .setFooter({ text: "Try again with a larger team for better odds!" })
      .setTimestamp();

    await interaction.editReply({
      embeds: [embed],
      components: [],
    });

    teamCaptureManager.completeTeam(teamId);
    return;
  }

  // Hunt successful! Distribute rewards
  const rewardSplit = teamCaptureManager.calculateRewardSplit(teamId);

  if (!rewardSplit) {
    await interaction.editReply({
      content: `${getCancelEmoji()} Error calculating rewards!`,
      components: [],
    });
    return;
  }

  const rewardResults: Array<{ tag: string; amount: number; success: boolean }> = [];

  for (const member of team.members) {
    const reward = rewardSplit.get(member.id) || 0;
    const result = await addItem(member.id, "silver", reward);
    rewardResults.push({
      tag: member.tag,
      amount: reward,
      success: result.success,
    });
  }

  // Remove bounty
  removeBounty(team.targetId);

  // Create success embed
  const embed = new EmbedBuilder()
    .setColor("#51CF66")
    .setTitle(`${getPartyEmoji()} ${getTrophyEmoji()} OUTLAW CAPTURED - Team Victory!`)
    .setDescription(
      `**Excellent teamwork!** Your hunting party successfully captured **${team.targetTag}**!\n\n` +
      `The bounty has been split among all team members.`
    )
    .addFields(
      {
        name: `${getDartEmoji()} Captured Outlaw`,
        value: team.targetTag,
        inline: true,
      },
      {
        name: `${getMoneybagEmoji()} Total Bounty`,
        value: formatCurrency(bounty.totalAmount, "silver"),
        inline: true,
      },
      {
        name: `${getCowboysEmoji()} Team Size`,
        value: `${team.members.length} hunters`,
        inline: true,
      },
      {
        name: `${getStatsEmoji()} Success Rate`,
        value: `${(successRate * 100).toFixed(0)}%`,
        inline: true,
      },
      {
        name: "🎲 Roll Result",
        value: `${(captureChance * 100).toFixed(1)}% (needed ≤${(successRate * 100).toFixed(0)}%)`,
        inline: true,
      },
      {
        name: `${getBalanceEmoji()} Justice Served`,
        value: `${getCheckEmoji()} Captured`,
        inline: true,
      },
      {
        name: `${getMoneybagEmoji()} Reward Distribution`,
        value: rewardResults
          .map((r) => 
            `${r.success ? getCheckEmoji() : getCancelEmoji()} ${r.tag}: ${formatCurrency(r.amount, "silver")}`
          )
          .join("\n"),
        inline: false,
      },
    )
    .setFooter({ text: `Teamwork makes the dream work! ${getCowboysEmoji()}` })
    .setTimestamp();

  await interaction.editReply({
    embeds: [embed],
    components: [],
  });

  // Update cooldown for all team members
  const now = Date.now();
  for (const member of team.members) {
    teamCaptureData[member.id] = now;
  }

  teamCaptureManager.completeTeam(teamId);
}

async function handleCancelHunt(
  interaction: ButtonInteraction,
  teamId: string,
  team: any
): Promise<void> {
  if (team.leaderId !== interaction.user.id) {
    await interaction.reply({
      content: `${getCancelEmoji()} Only the team leader can cancel the hunt!`,
      ephemeral: true,
    });
    return;
  }

  await interaction.deferUpdate();

  const embed = new EmbedBuilder()
    .setColor("#868E96")
    .setTitle(`${getCancelEmoji()} Team Hunt Cancelled`)
    .setDescription(
      `The team leader **${team.leaderTag}** has cancelled this hunting party.`
    )
    .addFields(
      {
        name: `${getDartEmoji()} Target`,
        value: team.targetTag,
        inline: true,
      },
      {
        name: `${getCowboysEmoji()} Team Members`,
        value: `${team.members.length}/${team.maxMembers}`,
        inline: true,
      },
    )
    .setTimestamp();

  await interaction.editReply({
    embeds: [embed],
    components: [],
  });

  teamCaptureManager.completeTeam(teamId);
}

async function updateTeamEmbed(
  interaction: ButtonInteraction,
  teamId: string,
  team: any
): Promise<void> {
  const updatedTeam = teamCaptureManager.getTeam(teamId);
  if (!updatedTeam) return;

  const bounty = getBountyByTarget(updatedTeam.targetId);
  if (!bounty) return;

  const rewardPerMember = Math.floor(
    updatedTeam.bountyAmount / updatedTeam.maxMembers
  );

  const membersList = updatedTeam.members
    .map((m, i) => `${i + 1}. ${m.tag}${i === 0 ? " (Leader)" : ""}`)
    .join("\n");

  const embed = new EmbedBuilder()
    .setColor(updatedTeam.status === "ready" ? "#51CF66" : "#FFA500")
    .setTitle(`${getCowboyEmoji()} TEAM HUNT - Recruiting Members!`)
    .setDescription(
      `**${updatedTeam.leaderTag}** is forming a hunting party to capture **${updatedTeam.targetTag}**!\n\n` +
      `Join forces to increase your chances of success!\n` +
      `The bounty will be split equally among all team members.`
    )
    .addFields(
      {
        name: `${getDartEmoji()} Target`,
        value: updatedTeam.targetTag,
        inline: true,
      },
      {
        name: `${getMoneybagEmoji()} Total Bounty`,
        value: formatCurrency(updatedTeam.bountyAmount, "silver"),
        inline: true,
      },
      {
        name: `${getCowboysEmoji()} Team Size`,
        value: `${updatedTeam.members.length}/${updatedTeam.maxMembers}`,
        inline: true,
      },
      {
        name: `💵 Reward Per Member`,
        value: `~${formatCurrency(rewardPerMember, "silver")}`,
        inline: true,
      },
      {
        name: `${getTimerEmoji()} Time Limit`,
        value: "5 minutes",
        inline: true,
      },
      {
        name: `${getStatsEmoji()} Success Rate Bonus`,
        value: `${50 + (updatedTeam.members.length - 1) * 10}%`,
        inline: true,
      },
      {
        name: `${getCowboyEmoji()} Team Leader`,
        value: updatedTeam.leaderTag,
        inline: false,
      },
      {
        name: `${getCowboysEmoji()} Current Members`,
        value: membersList,
        inline: false,
      },
    )
    .setFooter({
      text:
        updatedTeam.status === "ready"
          ? "Team is ready! Leader can start the hunt."
          : "Click 'Join Team' to participate! Minimum 2 members required.",
    })
    .setTimestamp();

  await interaction.message.edit({ embeds: [embed] });
}
