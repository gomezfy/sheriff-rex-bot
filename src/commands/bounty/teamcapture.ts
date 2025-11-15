import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  MessageFlags,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from "discord.js";
import { applyLocalizations } from "../../utils/commandLocalizations";
import {
  successEmbed,
  errorEmbed,
  warningEmbed,
  formatCurrency,
} from "../../utils/embeds";
import { t } from "../../utils/i18n";
import { getBountyByTarget } from "../../utils/dataManager";
import { teamCaptureManager } from "../../utils/teamCaptureManager";
import {
  getCowboysEmoji,
  getDartEmoji,
  getMoneybagEmoji,
  getTimerEmoji,
  getStatsEmoji,
  getCowboyEmoji,
} from "../../utils/customEmojis";

const TEAM_CAPTURE_COOLDOWN = 45 * 60 * 1000; // 45 minutes (longer than solo)
const teamCaptureData: { [userId: string]: number } = {};

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

export default {
  data: applyLocalizations(
    new SlashCommandBuilder()
      .setName("team-capture")
      .setDescription("Form a team to capture a wanted outlaw and share the reward")
      .addUserOption((option) =>
        option
          .setName("outlaw")
          .setDescription("The wanted outlaw to capture")
          .setRequired(true),
      )
      .addIntegerOption((option) =>
        option
          .setName("team-size")
          .setDescription("Maximum team size (2-5 members)")
          .setRequired(false)
          .setMinValue(2)
          .setMaxValue(5),
      ),
    "team-capture",
  ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const leader = interaction.user;
    const target = interaction.options.getUser("outlaw", true);
    const maxTeamSize = interaction.options.getInteger("team-size") || 3;

    // Validation: Bot check
    if (target.bot) {
      const embed = errorEmbed(
        t(interaction, "bounty_invalid_target"),
        t(interaction, "bounty_cant_target_bot"),
        t(interaction, "bounty_choose_real_outlaw"),
      );
      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // Validation: Self-target check
    if (target.id === leader.id) {
      const embed = warningEmbed(
        t(interaction, "bounty_self_not_allowed"),
        t(interaction, "bounty_cant_target_self"),
        t(interaction, "bounty_mighty_strange"),
      );
      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // Validation: Server only
    if (!interaction.guild) {
      const embed = errorEmbed(
        t(interaction, "bounty_server_only"),
        t(interaction, "bounty_command_server_only"),
        t(interaction, "bounty_try_in_server"),
      );
      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // Validation: Target must be in server
    try {
      await interaction.guild.members.fetch(target.id);
    } catch (error) {
      const embed = errorEmbed(
        t(interaction, "bounty_not_in_server"),
        t(interaction, "bounty_user_not_here", { user: target.tag }),
        t(interaction, "bounty_must_be_present"),
      );
      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // Cooldown check
    const now = Date.now();
    const lastCapture = teamCaptureData[leader.id] || 0;
    if (now - lastCapture < TEAM_CAPTURE_COOLDOWN) {
      const timeLeft = TEAM_CAPTURE_COOLDOWN - (now - lastCapture);
      const minutesLeft = Math.ceil(timeLeft / 60000);

      const embed = warningEmbed(
        "⏰ Team Cooldown Active",
        `You need to rest before organizing another team hunt!\n\n**Time remaining:** ${minutesLeft} minutes`,
        "Team hunts require more preparation than solo captures.",
      );
      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // Check if bounty exists
    const bounty: Bounty = getBountyByTarget(target.id);
    if (!bounty) {
      const embed = errorEmbed(
        t(interaction, "bounty_no_bounty_found"),
        t(interaction, "bounty_user_not_wanted", { user: target.tag }),
        t(interaction, "bounty_see_active"),
      );
      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // Check if user is already in a team for this target
    if (teamCaptureManager.isUserInTeamForTarget(leader.id, target.id)) {
      const embed = warningEmbed(
        "🤝 Already in Team",
        "You're already part of a team hunting this outlaw!",
        "Wait for the current hunt to complete or leave the team first.",
      );
      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await interaction.deferReply();

    // Create buttons for team recruitment - minimalist design
    const joinButton = new ButtonBuilder()
      .setCustomId(`team_join_${target.id}`)
      .setLabel("Join")
      .setStyle(ButtonStyle.Success);

    const leaveButton = new ButtonBuilder()
      .setCustomId(`team_leave_${target.id}`)
      .setLabel("Leave")
      .setStyle(ButtonStyle.Secondary);

    const startButton = new ButtonBuilder()
      .setCustomId(`team_start_${target.id}`)
      .setLabel("Start")
      .setStyle(ButtonStyle.Primary);

    const cancelButton = new ButtonBuilder()
      .setCustomId(`team_cancel_${target.id}`)
      .setLabel("Cancel")
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      joinButton,
      leaveButton,
      startButton,
      cancelButton,
    );

    // Calculate reward per member
    const rewardPerMember = Math.floor(bounty.totalAmount / maxTeamSize);

    // Create team recruitment embed
    const recruitEmbed = new EmbedBuilder()
      .setColor("#FFA500")
      .setTitle(`${getCowboyEmoji()} TEAM HUNT - Recruiting Members!`)
      .setDescription(
        `**${leader.tag}** is forming a hunting party to capture **${target.tag}**!\n\n` +
        `Join forces to increase your chances of success!\n` +
        `The bounty will be split equally among all team members.`
      )
      .addFields(
        {
          name: `${getDartEmoji()} Target`,
          value: target.tag,
          inline: true,
        },
        {
          name: `${getMoneybagEmoji()} Total Bounty`,
          value: formatCurrency(bounty.totalAmount, "silver"),
          inline: true,
        },
        {
          name: `${getCowboysEmoji()} Team Size`,
          value: `1/${maxTeamSize}`,
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
          value: "+10% per member",
          inline: true,
        },
        {
          name: `${getCowboyEmoji()} Team Leader`,
          value: leader.tag,
          inline: false,
        },
        {
          name: `${getCowboysEmoji()} Current Members`,
          value: `1. ${leader.tag} (Leader)`,
          inline: false,
        },
      )
      .setFooter({
        text: "Click 'Join Team' to participate! Minimum 2 members required.",
      })
      .setTimestamp();

    const message = await interaction.editReply({
      embeds: [recruitEmbed],
      components: [row],
    });

    // Create team in manager
    teamCaptureManager.createTeam(
      leader,
      target,
      bounty.totalAmount,
      interaction.guild.id,
      interaction.channel!.id,
      message.id,
      maxTeamSize,
    );

    // Record cooldown timestamp
    teamCaptureData[leader.id] = Date.now();
  },
};

// Export for use in button handlers
export { teamCaptureData, TEAM_CAPTURE_COOLDOWN };
