import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  MessageFlags,
} from "discord.js";
import { applyLocalizations } from "../../utils/commandLocalizations";
import {
  successEmbed,
  errorEmbed,
  warningEmbed,
  formatCurrency,
} from "../../utils/embeds";
import { t } from "../../utils/i18n";
import { getBountyByTarget, removeBounty } from "../../utils/dataManager";
import { addItem } from "../../utils/inventoryManager";

const CAPTURE_COOLDOWN = 30 * 60 * 1000;
const captureData: { [userId: string]: number } = {};

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
      .setName("capture")
      .setDescription("Capture a wanted criminal and earn the bounty")
      .addUserOption((option) =>
        option
          .setName("outlaw")
          .setDescription("The wanted outlaw to capture")
          .setRequired(true),
      ),
    "capture",
  ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const hunter = interaction.user;
    const target = interaction.options.getUser("outlaw", true);

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

    if (target.id === hunter.id) {
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

    const now = Date.now();
    const lastCapture = captureData[hunter.id] || 0;
    if (now - lastCapture < CAPTURE_COOLDOWN) {
      const timeLeft = CAPTURE_COOLDOWN - (now - lastCapture);
      const minutesLeft = Math.ceil(timeLeft / 60000);

      const embed = warningEmbed(
        t(interaction, "bounty_capture_cooldown"),
        t(interaction, "bounty_need_rest", { minutes: minutesLeft }),
        t(interaction, "bounty_hunting_exhausting"),
      );
      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

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

    const captureChance = Math.random();
    const baseSuccessRate = 0.5;

    if (captureChance > baseSuccessRate) {
      captureData[hunter.id] = now;

      const embed = warningEmbed(
        t(interaction, "bounty_outlaw_escaped"),
        t(interaction, "bounty_managed_escape", { user: target.tag }),
        t(interaction, "bounty_better_luck"),
      ).addFields(
        {
          name: t(interaction, "bounty_target"),
          value: target.tag,
          inline: true,
        },
        {
          name: t(interaction, "bounty_lost_reward"),
          value: formatCurrency(bounty.totalAmount, "silver"),
          inline: true,
        },
        {
          name: t(interaction, "bounty_success_rate"),
          value: `${(baseSuccessRate * 100).toFixed(0)}%`,
          inline: true,
        },
      );

      await interaction.reply({ embeds: [embed] });
      return;
    }

    const reward = bounty.totalAmount;
    const result = await addItem(hunter.id, "silver", reward);

    if (!result.success) {
      const embed = errorEmbed(
        t(interaction, "bounty_capture_failed"),
        t(interaction, "bounty_inventory_full", { error: result.error }),
        t(interaction, "bounty_free_space_try"),
      );
      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    removeBounty(target.id);
    captureData[hunter.id] = now;

    const embed = successEmbed(
      t(interaction, "bounty_outlaw_captured"),
      t(interaction, "bounty_hunter_captured", {
        hunter: hunter.tag,
        outlaw: target.tag,
      }),
      t(interaction, "bounty_justice_prevails"),
    ).addFields(
      {
        name: t(interaction, "bounty_hunter"),
        value: hunter.tag,
        inline: true,
      },
      {
        name: t(interaction, "bounty_outlaw"),
        value: target.tag,
        inline: true,
      },
      {
        name: t(interaction, "bounty_reward"),
        value: formatCurrency(reward, "silver"),
        inline: true,
      },
    );

    await interaction.reply({ embeds: [embed] });
  },
};
