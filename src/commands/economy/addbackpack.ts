import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  MessageFlags,
} from "discord.js";
import { upgradeBackpack } from "../../utils/inventoryManager";

const OWNER_ID = process.env.OWNER_ID;

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
    if (interaction.user.id !== OWNER_ID) {
      await interaction.reply({
        content: "❌ This command is only available to the bot owner!",
        flags: [MessageFlags.Ephemeral],
      });
      return;
    }

    const targetUser = interaction.options.getUser("user", true);

    const result = upgradeBackpack(targetUser.id, 500);

    if (!result.success) {
      await interaction.reply({
        content: `❌ Failed to upgrade backpack: ${result.error}`,
        flags: [MessageFlags.Ephemeral],
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

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  },
};
