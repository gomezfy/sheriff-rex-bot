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
      .setName("clearbounty")
      .setDescription("Remove a bounty (Admin only)")
      .addUserOption((option) =>
        option
          .setName("user")
          .setDescription("User to clear bounty from")
          .setRequired(true),
      ),
    "clearbounty",
  ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.memberPermissions?.has("Administrator")) {
      const embed = errorEmbed(
        t(interaction, "bounty_permission_denied"),
        t(interaction, "bounty_admin_only"),
        t(interaction, "bounty_contact_admin"),
      );
      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const target = interaction.options.getUser("user", true);
    const bounty: Bounty = getBountyByTarget(target.id);

    if (!bounty) {
      const embed = warningEmbed(
        t(interaction, "bounty_no_bounty_found"),
        t(interaction, "bounty_user_no_bounty", { user: target.tag }),
        t(interaction, "bounty_nothing_to_clear"),
      );
      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    removeBounty(target.id);

    const embed = successEmbed(
      t(interaction, "bounty_cleared"),
      t(interaction, "bounty_admin_cleared", { user: target.tag }),
      t(interaction, "bounty_no_longer_wanted"),
    ).addFields(
      {
        name: t(interaction, "bounty_target"),
        value: target.tag,
        inline: true,
      },
      {
        name: t(interaction, "bounty_amount_cleared"),
        value: formatCurrency(bounty.totalAmount, "silver"),
        inline: true,
      },
      {
        name: t(interaction, "bounty_cleared_by"),
        value: interaction.user.tag,
        inline: true,
      },
    );

    await interaction.reply({ embeds: [embed] });
  },
};
