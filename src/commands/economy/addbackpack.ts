import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  MessageFlags,
} from "discord.js";
import { upgradeBackpack } from "../../utils/inventoryManager";
import { isOwner, adminRateLimiter } from "../../utils/security";

export default {
  data: new SlashCommandBuilder()
    .setName("addbackpack")
    .setDescription("[OWNER ONLY] Manually upgrade a user's backpack to 500kg")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to upgrade")
        .setRequired(true),
    )
    .setDefaultMemberPermissions(0),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    // Security: Validate owner
    if (!(await isOwner(interaction))) {
      return;
    }

    // Security: Rate limit admin commands
    if (!adminRateLimiter.canExecute(interaction.user.id)) {
      const remaining = adminRateLimiter.getRemainingCooldown(
        interaction.user.id,
      );
      await interaction.editReply({
        content: `⏰ Please wait ${(remaining / 1000).toFixed(1)}s before using another admin command.`,
      });
      return;
    }

    const targetUser = interaction.options.getUser("user", true);

    const result = await upgradeBackpack(targetUser.id, 500);

    if (!result.success) {
      await interaction.editReply({
        content: `❌ Failed to upgrade backpack: ${result.error}`,
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor("#00FF00")
      .setTitle("✅ Backpack Upgraded!")
      .setDescription(`**${targetUser.tag}** now has a **500kg backpack**!`)
      .addFields(
        { name: "👤 User", value: `${targetUser}`, inline: true },
        { name: "🎒 New Capacity", value: "500kg", inline: true },
      )
      .setFooter({ text: "Manual upgrade by bot owner" })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
