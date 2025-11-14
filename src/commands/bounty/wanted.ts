import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  MessageFlags,
  AttachmentBuilder,
} from "discord.js";
import { applyLocalizations } from "../../utils/commandLocalizations";
import {
  successEmbed,
  errorEmbed,
  warningEmbed,
  formatCurrency,
} from "../../utils/embeds";
import { generateWantedPoster } from "../../utils/wantedPoster";
import { getDartEmoji } from "../../utils/customEmojis";
import { t, getLocale } from "../../utils/i18n";
import { addBounty, getBountyByTarget } from "../../utils/dataManager";
import { getItem, removeItem } from "../../utils/inventoryManager";

const MIN_BOUNTY = 100;

export default {
  data: applyLocalizations(
    new SlashCommandBuilder()
      .setName("wanted")
      .setDescription("Place a bounty on a wanted user")
      .addUserOption((option) =>
        option
          .setName("user")
          .setDescription("The outlaw you want to place a bounty on")
          .setRequired(true),
      )
      .addIntegerOption((option) =>
        option
          .setName("amount")
          .setDescription("Bounty amount (minimum 100 Silver Coins)")
          .setRequired(true)
          .setMinValue(MIN_BOUNTY),
      )
      .addStringOption((option) =>
        option
          .setName("reason")
          .setDescription("Why are they wanted?")
          .setRequired(false),
      ),
    "wanted",
  ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const target = interaction.options.getUser("user", true);
    const amount = interaction.options.getInteger("amount", true);
    const reason =
      interaction.options.getString("reason") ||
      t(interaction, "bounty_general_mischief");

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

    if (target.id === interaction.user.id) {
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

    const existingBounty = getBountyByTarget(target.id);
    if (existingBounty) {
      const embed = warningEmbed(
        t(interaction, "bounty_already_active"),
        t(interaction, "bounty_user_has_bounty", {
          user: target.tag,
          amount: formatCurrency(existingBounty.totalAmount, "silver"),
        }),
        t(interaction, "bounty_wait_cleared"),
      );
      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const currentSilver = getItem(interaction.user.id, "silver") || 0;
    if (currentSilver < amount) {
      const embed = errorEmbed(
        t(interaction, "bounty_insufficient_funds"),
        t(interaction, "bounty_not_enough_silver", {
          required: formatCurrency(amount, "silver"),
          current: formatCurrency(currentSilver, "silver"),
        }),
        t(interaction, "bounty_earn_more"),
      );
      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await interaction.deferReply();

    const removeResult = await removeItem(interaction.user.id, "silver", amount);
    if (!removeResult.success) {
      const embed = errorEmbed(
        t(interaction, "bounty_transaction_failed"),
        t(interaction, "bounty_could_not_deduct", {
          error: removeResult.error,
        }),
        t(interaction, "bounty_try_again"),
      );
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    addBounty(
      target.id,
      target.tag,
      interaction.user.id,
      interaction.user.tag,
      amount,
    );

    const userLocale = getLocale(interaction);
    const poster = await generateWantedPoster(target, amount, userLocale);
    const attachment = new AttachmentBuilder(poster, {
      name: `wanted-${target.id}.png`,
    });

    const embed = successEmbed(
      `${getDartEmoji()} ${t(interaction, "bounty_placed")}`,
      `${t(interaction, "bounty_now_wanted", { user: target.tag })}\n\n${t(interaction, "bounty_reason", { reason })}`,
      t(interaction, "bounty_hunters_can_capture"),
    )
      .setImage(`attachment://wanted-${target.id}.png`)
      .addFields(
        {
          name: t(interaction, "bounty_target"),
          value: target.tag,
          inline: true,
        },
        {
          name: t(interaction, "bounty_reward"),
          value: formatCurrency(amount, "silver"),
          inline: true,
        },
        {
          name: t(interaction, "bounty_posted_by"),
          value: interaction.user.tag,
          inline: true,
        },
      );

    await interaction.editReply({ embeds: [embed], files: [attachment] });
  },
};
