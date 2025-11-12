import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { applyLocalizations } from "../../utils/commandLocalizations";
import { warningEmbed, formatCurrency, infoEmbed } from "../../utils/embeds";
import {
  getDartEmoji,
  getMoneybagEmoji,
  getScrollEmoji,
  getCowboysEmoji,
  getStarEmoji,
} from "../../utils/customEmojis";
import { t } from "../../utils/i18n";
import { getAllBounties } from "../../utils/dataManager";

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
      .setName("bounties")
      .setDescription("View all active bounties"),
    "bounties",
  ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const bounties: Bounty[] = getAllBounties();

    if (bounties.length === 0) {
      const embed = warningEmbed(
        t(interaction, "bounty_no_active"),
        t(interaction, "bounty_west_peaceful"),
        t(interaction, "bounty_use_wanted"),
      );

      await interaction.reply({ embeds: [embed] });
      return;
    }

    let bountiesInServer: Bounty[] = [];

    if (interaction.guild) {
      for (const bounty of bounties) {
        try {
          await interaction.guild.members.fetch(bounty.targetId);
          bountiesInServer.push(bounty);
        } catch (error) {
          // Usuário não está no servidor, não incluir na lista
        }
      }
    } else {
      bountiesInServer = bounties;
    }

    if (bountiesInServer.length === 0) {
      const embed = warningEmbed(
        t(interaction, "bounty_no_outlaws_server"),
        t(interaction, "bounty_all_fled"),
        t(interaction, "bounty_use_wanted"),
      );

      await interaction.reply({ embeds: [embed] });
      return;
    }

    const sortedBounties = bountiesInServer.sort(
      (a, b) => b.totalAmount - a.totalAmount,
    );
    let description = t(interaction, "bounty_most_wanted") + "\n\n";
    const moneyEmoji = getMoneybagEmoji();
    const groupEmoji = getCowboysEmoji();

    for (const bounty of sortedBounties.slice(0, 10)) {
      const starEmoji = getStarEmoji();
      const stars = starEmoji.repeat(
        Math.min(Math.floor(bounty.totalAmount / 5000), 5),
      );

      description += `${stars} **${bounty.targetTag}**\n`;
      description += `   ${moneyEmoji} ${t(interaction, "bounty_reward")}: ${formatCurrency(bounty.totalAmount, "silver")}\n`;
      description += `   ${groupEmoji} ${t(interaction, "bounty_contributors")}: ${bounty.contributors.length}\n\n`;
    }

    if (bountiesInServer.length > 10) {
      description += t(interaction, "bounty_more_outlaws", {
        count: bountiesInServer.length - 10,
      });
    }

    const embed = infoEmbed(
      `${getScrollEmoji()} ${t(interaction, "bounty_active_bounties")}`,
      description,
    )
      .addFields(
        {
          name: `${getDartEmoji()} ${t(interaction, "bounty_total_bounties")}`,
          value: bountiesInServer.length.toString(),
          inline: true,
        },
        {
          name: `${getMoneybagEmoji()} ${t(interaction, "bounty_total_rewards")}`,
          value: formatCurrency(
            bountiesInServer.reduce((sum, b) => sum + b.totalAmount, 0),
            "silver",
          ),
          inline: true,
        },
      )
      .setFooter({ text: t(interaction, "bounty_hunt_claim") });

    await interaction.reply({ embeds: [embed] });
  },
};
