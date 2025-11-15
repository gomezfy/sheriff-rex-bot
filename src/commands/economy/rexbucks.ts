import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import {
  getRexBuckBalance,
  getUserRexBuckData,
  getUserTransactionHistory,
} from "../../utils/rexBuckManager";
import { getRexBuckEmoji, getInfoEmoji, getCheckEmoji } from "../../utils/customEmojis";
import { applyLocalizations } from "../../utils/commandLocalizations";
import { t } from "../../utils/i18n";

const commandBuilder = new SlashCommandBuilder()
  .setName("rexbucks")
  .setDescription("💵 Check your RexBucks balance and transaction history")
  .setContexts([0, 1, 2])
  .setIntegrationTypes([0, 1])
  .addSubcommand((subcommand) =>
    subcommand
      .setName("balance")
      .setDescription("Check your RexBucks balance"),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("history")
      .setDescription("View your RexBucks transaction history")
      .addIntegerOption((option) =>
        option
          .setName("limit")
          .setDescription("Number of recent transactions to show (1-20)")
          .setMinValue(1)
          .setMaxValue(20)
          .setRequired(false),
      ),
  );

export default {
  data: applyLocalizations(commandBuilder, "rexbucks"),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const subcommand = interaction.options.getSubcommand();
    const userId = interaction.user.id;

    await interaction.deferReply({ ephemeral: true });

    try {
      if (subcommand === "balance") {
        const userData = await getUserRexBuckData(userId);

        const embed = new EmbedBuilder()
          .setColor(0x2ecc71)
          .setTitle(`${getRexBuckEmoji()} RexBucks Balance`)
          .setDescription(
            `**Current Balance:** ${getRexBuckEmoji()} **${userData.balance.toLocaleString()}** RexBucks`,
          )
          .addFields(
            {
              name: "📊 Statistics",
              value: [
                `**Total Transactions:** ${userData.totalTransactions}`,
              ].join("\n"),
              inline: false,
            },
            {
              name: `${getInfoEmoji()} About RexBucks`,
              value: [
                "💵 **RexBucks** is a premium currency",
                "🎫 Purchase RexBucks with real money",
                "🛒 Use them in the bot shop and features",
                "⚠️ **Non-refundable and non-transferable**",
              ].join("\n"),
              inline: false,
            },
          )
          .setFooter({
            text: "Use /rexbucks history to view transaction history",
          })
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
      } else if (subcommand === "history") {
        const limit = interaction.options.getInteger("limit") || 10;
        const transactions = await getUserTransactionHistory(userId, limit);

        if (transactions.length === 0) {
          const embed = new EmbedBuilder()
            .setColor(0xf39c12)
            .setTitle(`${getInfoEmoji()} No Transaction History`)
            .setDescription("You haven't made any RexBucks transactions yet.")
            .setFooter({
              text: "Purchase RexBucks to get started!",
            })
            .setTimestamp();

          await interaction.editReply({ embeds: [embed] });
          return;
        }

        const transactionList = transactions
          .map((tx: any, index: number) => {
            const typeEmoji = tx.amount > 0 ? "+" : "-";
            const typeLabel =
              tx.type === "redeem"
                ? "Redeemed"
                : tx.type === "purchase"
                  ? "Purchased"
                  : tx.type === "admin_add"
                    ? "Added by Admin"
                    : "Removed by Admin";
            const date = new Date(tx.timestamp).toLocaleString();

            return [
              `**${index + 1}.** ${typeLabel}`,
              `   ${typeEmoji}${Math.abs(tx.amount).toLocaleString()} RexBucks`,
              `   Balance: ${tx.balanceBefore.toLocaleString()} → ${tx.balanceAfter.toLocaleString()}`,
              `   ${date}`,
            ].join("\n");
          })
          .join("\n\n");

        const embed = new EmbedBuilder()
          .setColor(0x3498db)
          .setTitle(`${getRexBuckEmoji()} RexBucks Transaction History`)
          .setDescription(transactionList)
          .setFooter({
            text: `Showing last ${transactions.length} transaction(s)`,
          })
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
      }
    } catch (error) {
      console.error("Error in rexbucks command:", error);

      const embed = new EmbedBuilder()
        .setColor(0xe74c3c)
        .setTitle("❌ Error")
        .setDescription("An error occurred while fetching your RexBucks data.")
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    }
  },
};
