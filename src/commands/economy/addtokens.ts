import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  MessageFlags,
} from "discord.js";
import { getSaloonTokenEmoji } from "../../utils/customEmojis";
import { transactionLock } from "../../utils/transactionLock";
import { addItem } from "../../utils/inventoryManager";

const OWNER_ID = process.env.OWNER_ID;

export default {
  data: new SlashCommandBuilder()
    .setName("addtokens")
    .setDescription(
      "[OWNER ONLY] Add Saloon Tokens to a user (alias for addgold)",
    )
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to give Saloon Tokens to")
        .setRequired(true),
    )
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("Amount of Saloon Tokens to add")
        .setRequired(true)
        .setMinValue(1),
    )
    .setDefaultMemberPermissions(0),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    if (interaction.user.id !== OWNER_ID) {
      await interaction.editReply({
        content: "❌ This command is only available to the bot owner!",
      });
      return;
    }

    const targetUser = interaction.options.getUser("user", true);
    const amount = interaction.options.getInteger("amount", true);

    // Use transaction lock to prevent race conditions
    const result = await transactionLock.withLock(targetUser.id, () =>
      addItem(targetUser.id, "saloon_token", amount),
    );

    if (!result.success) {
      await interaction.editReply({
        content: `❌ Failed to add tokens: ${result.error}`,
      });
      return;
    }

    const tokenEmoji = getSaloonTokenEmoji();

    const embed = new EmbedBuilder()
      .setColor("#FFD700")
      .setTitle("✅ Saloon Tokens Added!")
      .setDescription(
        `Successfully added **${amount.toLocaleString()} ${tokenEmoji}** to ${targetUser.tag}!`,
      )
      .addFields(
        { name: "👤 User", value: `${targetUser}`, inline: true },
        {
          name: "💰 Amount",
          value: `${amount.toLocaleString()} ${tokenEmoji}`,
          inline: true,
        },
      )
      .setFooter({ text: "Manual addition by bot owner" })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
