import { ButtonInteraction, EmbedBuilder, MessageFlags } from "discord.js";
import {
  approveJoinRequest,
  rejectJoinRequest,
  getRequestById,
  getUserGuild,
  leaveGuild,
  kickMember,
  promoteMember,
  demoteMember,
} from "@/utils/guildManager";
import { tUser } from "@/utils/i18n";

export async function handleGuildButtons(
  interaction: ButtonInteraction,
): Promise<boolean> {
  const { customId, user } = interaction;

  if (customId.startsWith("guild_approve_")) {
    await handleApproveRequest(interaction, customId);
    return true;
  }

  if (customId.startsWith("guild_reject_")) {
    await handleRejectRequest(interaction, customId);
    return true;
  }

  if (customId === "guild_info") {
    await handleGuildInfo(interaction);
    return true;
  }

  if (customId === "guild_members") {
    await handleGuildMembers(interaction);
    return true;
  }

  if (customId === "guild_leave") {
    await handleGuildLeave(interaction);
    return true;
  }

  if (customId.startsWith("kick_member_")) {
    await handleKickMember(interaction, customId);
    return true;
  }

  if (customId.startsWith("promote_member_")) {
    await handlePromoteMember(interaction, customId);
    return true;
  }

  if (customId.startsWith("demote_member_")) {
    await handleDemoteMember(interaction, customId);
    return true;
  }

  return false;
}

async function handleApproveRequest(
  interaction: ButtonInteraction,
  customId: string,
): Promise<void> {
  const requestId = customId.replace("guild_approve_", "");
  const request = getRequestById(requestId);

  if (!request) {
    await interaction.reply({
      content: tUser(interaction.user.id, "guild_request_not_found"),
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const result = approveJoinRequest(requestId);

  const embed = new EmbedBuilder()
    .setColor(result.success ? "#57F287" : "#ED4245")
    .setTitle(
      result.success
        ? tUser(interaction.user.id, "guild_request_approved_title")
        : tUser(interaction.user.id, "guild_request_error"),
    )
    .setDescription(result.message)
    .setTimestamp();

  await interaction.update({
    embeds: [embed],
    components: [],
  });

  if (result.success && result.guild) {
    try {
      const applicant = await interaction.client.users.fetch(request.userId);

      const notificationEmbed = new EmbedBuilder()
        .setColor("#57F287")
        .setTitle(tUser(applicant.id, "guild_request_accepted_title"))
        .setDescription(
          tUser(applicant.id, "guild_request_accepted_desc").replace(
            "{guild}",
            result.guild.name,
          ),
        )
        .setTimestamp();

      await applicant.send({ embeds: [notificationEmbed] });
    } catch (error) {
      console.error("Failed to send DM to applicant:", error);
    }
  }
}

async function handleRejectRequest(
  interaction: ButtonInteraction,
  customId: string,
): Promise<void> {
  const requestId = customId.replace("guild_reject_", "");
  const request = getRequestById(requestId);

  if (!request) {
    await interaction.reply({
      content: tUser(interaction.user.id, "guild_request_not_found"),
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const result = rejectJoinRequest(requestId);

  const embed = new EmbedBuilder()
    .setColor(result.success ? "#FFA500" : "#ED4245")
    .setTitle(
      result.success
        ? tUser(interaction.user.id, "guild_request_rejected_title")
        : tUser(interaction.user.id, "guild_request_error"),
    )
    .setDescription(result.message)
    .setTimestamp();

  await interaction.update({
    embeds: [embed],
    components: [],
  });

  if (result.success && result.userId && result.guildName) {
    try {
      const applicant = await interaction.client.users.fetch(result.userId);

      const notificationEmbed = new EmbedBuilder()
        .setColor("#ED4245")
        .setTitle(tUser(applicant.id, "guild_request_denied_title"))
        .setDescription(
          tUser(applicant.id, "guild_request_denied_desc").replace(
            "{guild}",
            result.guildName,
          ),
        )
        .setTimestamp();

      await applicant.send({ embeds: [notificationEmbed] });
    } catch (error) {
      console.error("Failed to send DM to applicant:", error);
    }
  }
}

async function handleGuildInfo(interaction: ButtonInteraction): Promise<void> {
  const userGuild = getUserGuild(interaction.user.id);

  if (!userGuild) {
    await interaction.reply({
      content: tUser(interaction.user.id, "guild_not_found"),
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const embed = new EmbedBuilder()
    .setColor("#5865F2")
    .setTitle(`🏰 ${userGuild.name}`)
    .setDescription(userGuild.description)
    .addFields(
      {
        name: tUser(interaction.user.id, "guild_leader"),
        value: `<@${userGuild.leaderId}>`,
        inline: true,
      },
      {
        name: tUser(interaction.user.id, "guild_members"),
        value: `${userGuild.members.length}/${userGuild.settings.maxMembers}`,
        inline: true,
      },
      {
        name: tUser(interaction.user.id, "guild_level"),
        value: `${userGuild.level}`,
        inline: true,
      },
      {
        name: tUser(interaction.user.id, "guild_xp"),
        value: `${userGuild.xp} XP`,
        inline: true,
      },
      {
        name: tUser(interaction.user.id, "guild_type"),
        value: userGuild.settings.isPublic
          ? tUser(interaction.user.id, "guild_type_public")
          : tUser(interaction.user.id, "guild_type_private"),
        inline: true,
      },
      {
        name: tUser(interaction.user.id, "guild_created"),
        value: `<t:${Math.floor(userGuild.createdAt / 1000)}:R>`,
        inline: true,
      },
    )
    .setTimestamp();

  await interaction.reply({
    embeds: [embed],
    flags: MessageFlags.Ephemeral,
  });
}

async function handleGuildMembers(
  interaction: ButtonInteraction,
): Promise<void> {
  const userGuild = getUserGuild(interaction.user.id);

  if (!userGuild) {
    await interaction.reply({
      content: tUser(interaction.user.id, "guild_not_found"),
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const membersList = userGuild.members
    .map((member, index) => {
      const roleIcon = member.role === "leader" ? "👑" : "👤";
      const joinedDate = `<t:${Math.floor(member.joinedAt / 1000)}:R>`;
      return `${index + 1}. ${roleIcon} <@${member.userId}> - ${tUser(interaction.user.id, "guild_joined")} ${joinedDate}`;
    })
    .join("\n");

  const embed = new EmbedBuilder()
    .setColor("#FFD700")
    .setTitle(
      tUser(interaction.user.id, "guild_members_title").replace(
        "{guild}",
        userGuild.name,
      ),
    )
    .setDescription(
      membersList || tUser(interaction.user.id, "guild_no_members"),
    )
    .addFields({
      name: tUser(interaction.user.id, "guild_stats"),
      value: `**${tUser(interaction.user.id, "guild_total")}:** ${userGuild.members.length}/${userGuild.settings.maxMembers}`,
      inline: false,
    })
    .setFooter({
      text: `${userGuild.name} • ${tUser(interaction.user.id, "guild_level")} ${userGuild.level}`,
    })
    .setTimestamp();

  await interaction.reply({
    embeds: [embed],
    flags: MessageFlags.Ephemeral,
  });
}

async function handleGuildLeave(interaction: ButtonInteraction): Promise<void> {
  const userGuild = getUserGuild(interaction.user.id);

  if (!userGuild) {
    await interaction.reply({
      content: tUser(interaction.user.id, "guild_not_found"),
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const result = leaveGuild(interaction.user.id);

  const embed = new EmbedBuilder()
    .setColor(result.success ? "#57F287" : "#ED4245")
    .setTitle(
      result.success
        ? tUser(interaction.user.id, "guild_left_title")
        : tUser(interaction.user.id, "guild_error"),
    )
    .setDescription(result.message)
    .setTimestamp();

  await interaction.reply({
    embeds: [embed],
    flags: MessageFlags.Ephemeral,
  });
}

async function handleKickMember(
  interaction: ButtonInteraction,
  customId: string,
): Promise<void> {
  const memberId = customId.replace("kick_member_", "");
  const result = kickMember(interaction.user.id, memberId);

  const embed = new EmbedBuilder()
    .setColor(result.success ? "#57F287" : "#ED4245")
    .setTitle(
      result.success
        ? tUser(interaction.user.id, "guild_member_kicked_title")
        : tUser(interaction.user.id, "guild_error"),
    )
    .setDescription(result.message)
    .setTimestamp();

  await interaction.update({
    embeds: [embed],
    components: [],
  });
}

async function handlePromoteMember(
  interaction: ButtonInteraction,
  customId: string,
): Promise<void> {
  const memberId = customId.replace("promote_member_", "");
  const result = promoteMember(interaction.user.id, memberId);

  const embed = new EmbedBuilder()
    .setColor(result.success ? "#57F287" : "#ED4245")
    .setTitle(
      result.success
        ? tUser(interaction.user.id, "guild_member_promoted_title")
        : tUser(interaction.user.id, "guild_error"),
    )
    .setDescription(result.message)
    .setTimestamp();

  await interaction.update({
    embeds: [embed],
    components: [],
  });
}

async function handleDemoteMember(
  interaction: ButtonInteraction,
  customId: string,
): Promise<void> {
  const memberId = customId.replace("demote_member_", "");
  const result = demoteMember(interaction.user.id, memberId);

  const embed = new EmbedBuilder()
    .setColor(result.success ? "#57F287" : "#ED4245")
    .setTitle(
      result.success
        ? tUser(interaction.user.id, "guild_member_demoted_title")
        : tUser(interaction.user.id, "guild_error"),
    )
    .setDescription(result.message)
    .setTimestamp();

  await interaction.update({
    embeds: [embed],
    components: [],
  });
}
