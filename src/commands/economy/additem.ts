import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  MessageFlags,
} from "discord.js";
import {
  isOwner,
  adminRateLimiter,
  isValidCurrencyAmount,
  MAX_CURRENCY_AMOUNT,
} from "../../utils/security";
import { addItem, ITEMS } from "../../utils/inventoryManager";
import { getCustomEmoji } from "../../utils/emojiUploader";

// Items that have dedicated commands and should not be added via /additem
const EXCLUDED_ITEMS = ["gold", "silver", "saloon_token"];

// Filter items for the command choices
const AVAILABLE_ITEMS = Object.keys(ITEMS).filter(
  (itemId) => !EXCLUDED_ITEMS.includes(itemId),
);

export default {
  data: new SlashCommandBuilder()
    .setName("additem")
    .setDescription("[OWNER ONLY] Add special items to a user's inventory")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to give the item to")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("item")
        .setDescription("The item to add")
        .setRequired(true)
        .addChoices(
          ...AVAILABLE_ITEMS.map((itemId) => ({
            name: ITEMS[itemId].name,
            value: itemId,
          })),
        ),
    )
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("Amount of items to add")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(MAX_CURRENCY_AMOUNT),
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
    const itemId = interaction.options.getString("item", true);
    const amount = interaction.options.getInteger("amount", true);

    // Security: Validate amount
    if (!isValidCurrencyAmount(amount)) {
      await interaction.editReply({
        content: `❌ Invalid amount! Must be between 1 and ${MAX_CURRENCY_AMOUNT.toLocaleString()}.`,
      });
      return;
    }

    // Validate item exists
    const item = ITEMS[itemId];
    if (!item) {
      await interaction.editReply({
        content: `❌ Invalid item ID: ${itemId}`,
      });
      return;
    }

    // Additional security: Prevent adding excluded items
    if (EXCLUDED_ITEMS.includes(itemId)) {
      await interaction.editReply({
        content: `❌ Cannot add ${item.name}. Use dedicated commands: /addgold, /addsilver, or /addtokens`,
      });
      return;
    }

    // addItem already uses transaction lock internally
    const result = await addItem(targetUser.id, itemId, amount);

    if (!result.success) {
      await interaction.editReply({
        content: `❌ Failed to add item: ${result.error}`,
      });
      return;
    }

    // Get the item emoji (custom or fallback)
    const itemEmoji = item.customEmoji
      ? getCustomEmoji(item.customEmoji, item.emoji)
      : item.emoji;

    const embed = new EmbedBuilder()
      .setColor("#00FF00")
      .setTitle("✅ Item Added!")
      .setDescription(
        `Successfully added **${amount.toLocaleString()} ${itemEmoji} ${item.name}** to ${targetUser.tag}!`,
      )
      .addFields(
        { name: "👤 User", value: `${targetUser}`, inline: true },
        { name: "📦 Item", value: `${itemEmoji} ${item.name}`, inline: true },
        {
          name: "🔢 Amount",
          value: `${amount.toLocaleString()}`,
          inline: true,
        },
        {
          name: "📊 Total",
          value: `${result.totalQuantity.toLocaleString()}`,
          inline: true,
        },
      )
      .setFooter({ text: "Manual addition by bot owner" })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
