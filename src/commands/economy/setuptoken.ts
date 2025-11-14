import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  MessageFlags,
} from "discord.js";
import { isOwner, adminRateLimiter } from "../../utils/security";
import { addItem, getInventory } from "../../utils/inventoryManager";

export default {
  data: new SlashCommandBuilder()
    .setName("setuptoken")
    .setDescription(
      "[OWNER ONLY] Give a new user starter tokens (100 Saloon Tokens)",
    )
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The new user to give starter tokens to")
        .setRequired(true),
    )
    .setDefaultMemberPermissions(0),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    // Security: Validate owner
    if (!(await isOwner(interaction))) {
      return;
    }

    // Security: Rate limit admin commands
    if (!adminRateLimiter.canExecute(interaction.user.id)) {
      const remaining = adminRateLimiter.getRemainingCooldown(
        interaction.user.id,
      );
      await interaction.reply({
        content: `⏰ Please wait ${(remaining / 1000).toFixed(1)}s before using another admin command.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const targetUser = interaction.options.getUser("user", true);
    const starterAmount = 100;

    const inventory = getInventory(targetUser.id);
    const currentTokens = inventory.items["saloon_token"] || 0;

    if (currentTokens >= starterAmount) {
      await interaction.reply({
        content: `⚠️ ${targetUser.tag} already has ${currentTokens.toLocaleString()} 🎫 Saloon Tokens. They don't need starter tokens!`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const result = await addItem(targetUser.id, "saloon_token", starterAmount);

    if (!result.success) {
      await interaction.reply({
        content: `❌ Failed to add tokens: ${result.error}`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor("#FFD700")
      .setTitle("✅ Starter Tokens Given!")
      .setDescription(
        `Successfully gave **${starterAmount.toLocaleString()} 🎫** starter tokens to ${targetUser.tag}!`,
      )
      .addFields(
        { name: "👤 User", value: `${targetUser}`, inline: true },
        {
          name: "🎫 Amount",
          value: `${starterAmount.toLocaleString()} Saloon Tokens`,
          inline: true,
        },
      )
      .setFooter({ text: "Welcome gift for new users!" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  },
};
