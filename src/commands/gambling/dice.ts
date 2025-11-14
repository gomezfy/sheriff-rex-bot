import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  MessageFlags,
  User,
} from "discord.js";
import { getUserGold, transferGold } from "../../utils/dataManager";
import { formatDuration } from "../../utils/embeds";
import { t } from "../../utils/i18n";
import { Command } from "../../types";
import { isValidBetAmount } from "../../utils/security";

/**
 * Cooldown management for dice game
 */
const cooldowns = new Map<string, number>();

/**
 * Active game sessions
 */
const activeGames = new Map<string, string>();

/**
 * Dice Command - Two-player dice guessing game with betting
 */
const command: Command = {
  data: new SlashCommandBuilder()
    .setName("dice")
    .setDescription("Challenge another player to a dice duel!")
    .addUserOption((option) =>
      option
        .setName("opponent")
        .setDescription("The player you want to challenge")
        .setRequired(true),
    )
    .addIntegerOption((option) =>
      option
        .setName("bet")
        .setDescription("Amount of Saloon Tokens to bet")
        .setRequired(true)
        .setMinValue(10)
        .setMaxValue(10000000),
    )
    .addIntegerOption((option) =>
      option
        .setName("guess")
        .setDescription("Your guess for the dice total (2-12)")
        .setRequired(true)
        .setMinValue(2)
        .setMaxValue(12),
    ),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const challenger = interaction.user;
    const opponent = interaction.options.getUser("opponent");
    const bet = interaction.options.getInteger("bet");
    const challengerGuess = interaction.options.getInteger("guess");

    if (!opponent || !bet || !challengerGuess) {
      await interaction.reply({
        content: t(interaction, "dice_specify_all"),
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const now = Date.now();
    const cooldownAmount = 10000;

    if (opponent.bot) {
      await interaction.reply({
        content: t(interaction, "dice_cant_challenge_bot"),
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (opponent.id === challenger.id) {
      await interaction.reply({
        content: t(interaction, "dice_cant_challenge_self"),
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (cooldowns.has(challenger.id)) {
      const challengerCooldown = cooldowns.get(challenger.id);
      if (challengerCooldown) {
        const expirationTime = challengerCooldown + cooldownAmount;
        if (now < expirationTime) {
          const timeLeft = (expirationTime - now) / 1000;
          await interaction.reply({
            content: t(interaction, "dice_cooldown_wait", {
              seconds: timeLeft.toFixed(1),
            }),
            flags: MessageFlags.Ephemeral,
          });
          return;
        }
      }
    }

    if (cooldowns.has(opponent.id)) {
      const opponentCooldown = cooldowns.get(opponent.id);
      if (opponentCooldown) {
        const expirationTime = opponentCooldown + cooldownAmount;
        if (now < expirationTime) {
          const timeLeft = (expirationTime - now) / 1000;
          await interaction.reply({
            content: t(interaction, "dice_opponent_cooldown", {
              user: opponent.tag,
              seconds: timeLeft.toFixed(1),
            }),
            flags: MessageFlags.Ephemeral,
          });
          return;
        }
      }
    }

    if (activeGames.has(challenger.id) || activeGames.has(opponent.id)) {
      await interaction.reply({
        content: t(interaction, "dice_already_active"),
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // Security: Validate bet amount
    if (!isValidBetAmount(bet)) {
      await interaction.reply({
        content: "❌ Invalid bet amount! Maximum bet is 10,000,000 tokens.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const challengerGold = getUserGold(challenger.id);
    const opponentGold = getUserGold(opponent.id);

    if (challengerGold < bet) {
      await interaction.reply({
        content: t(interaction, "dice_not_enough_tokens", {
          current: challengerGold,
          bet,
        }),
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (opponentGold < bet) {
      await interaction.reply({
        content: t(interaction, "dice_opponent_not_enough", {
          user: opponent.tag,
          amount: opponentGold,
        }),
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const gameId = `${challenger.id}_${Date.now()}`;

    const guessButtons: ButtonBuilder[] = [];
    for (let i = 2; i <= 12; i++) {
      guessButtons.push(
        new ButtonBuilder()
          .setCustomId(`dice_guess_${gameId}_${i}`)
          .setLabel(`${i}`)
          .setStyle(ButtonStyle.Secondary),
      );
    }

    const rows = [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        guessButtons.slice(0, 5),
      ),
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        guessButtons.slice(5, 10),
      ),
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        guessButtons.slice(10),
      ),
    ];

    const challengeEmbed = new EmbedBuilder()
      .setColor("#FFD700")
      .setTitle(t(interaction, "dice_challenge_title"))
      .setDescription(
        t(interaction, "dice_challenge_desc", {
          challenger: challenger.tag,
          opponent: opponent.tag,
          bet,
          guess: challengerGuess,
        }),
      )
      .setImage("https://i.postimg.cc/Ssffp0bs/IMG-3261.png")
      .addFields(
        {
          name: t(interaction, "dice_time_limit"),
          value: t(interaction, "dice_time_accept"),
          inline: true,
        },
        {
          name: t(interaction, "dice_winner_takes_all"),
          value: t(interaction, "dice_total_tokens", { total: bet * 2 }),
          inline: true,
        },
      )
      .setFooter({ text: t(interaction, "dice_choose_wisely") })
      .setTimestamp();

    await interaction.reply({
      content: t(interaction, "dice_challenged", { user: `${opponent}` }),
      embeds: [challengeEmbed],
      components: rows,
    });
    const message = await interaction.fetchReply();

    activeGames.set(challenger.id, gameId);
    activeGames.set(opponent.id, gameId);

    const collector = message.createMessageComponentCollector({
      filter: (i) =>
        i.user.id === opponent.id &&
        i.customId.startsWith(`dice_guess_${gameId}`),
      time: 30000,
      max: 1,
    });

    collector.on("collect", async (i) => {
      const opponentGuess = parseInt(i.customId.split("_").pop() || "0");

      const dice1 = Math.floor(Math.random() * 6) + 1;
      const dice2 = Math.floor(Math.random() * 6) + 1;
      const total = dice1 + dice2;

      const challengerDiff = Math.abs(total - challengerGuess);
      const opponentDiff = Math.abs(total - opponentGuess);

      let winner: User, loser: User, winnerGuess: number, loserGuess: number;

      if (challengerDiff < opponentDiff) {
        winner = challenger;
        loser = opponent;
        winnerGuess = challengerGuess;
        loserGuess = opponentGuess;
      } else if (opponentDiff < challengerDiff) {
        winner = opponent;
        loser = challenger;
        winnerGuess = opponentGuess;
        loserGuess = challengerGuess;
      } else {
        const tieEmbed = new EmbedBuilder()
          .setColor("#FFD700")
          .setTitle(t(i, "dice_tie_title"))
          .setDescription(t(i, "dice_tie_desc", { dice1, dice2, total }))
          .addFields(
            {
              name: t(i, "dice_challenger_guess", { user: challenger.tag }),
              value: t(i, "dice_diff", {
                guess: challengerGuess,
                diff: challengerDiff,
              }),
              inline: true,
            },
            {
              name: t(i, "dice_opponent_guess", { user: opponent.tag }),
              value: t(i, "dice_diff", {
                guess: opponentGuess,
                diff: opponentDiff,
              }),
              inline: true,
            },
            {
              name: t(i, "dice_result"),
              value: t(i, "dice_bets_returned"),
              inline: false,
            },
          )
          .setFooter({ text: t(i, "dice_perfectly_balanced") })
          .setTimestamp();

        await i.update({ embeds: [tieEmbed], components: [] });
        activeGames.delete(challenger.id);
        activeGames.delete(opponent.id);
        cooldowns.set(challenger.id, Date.now());
        cooldowns.set(opponent.id, Date.now());
        setTimeout(() => {
          cooldowns.delete(challenger.id);
          cooldowns.delete(opponent.id);
        }, cooldownAmount);
        return;
      }

      const transferResult = await transferGold(loser.id, winner.id, bet);

      if (!transferResult.success) {
        const fullInventoryEmbed = new EmbedBuilder()
          .setColor("#FF0000")
          .setTitle(t(i, "dice_inventory_full_title"))
          .setDescription(
            t(i, "dice_winner_inventory_full", {
              winner: winner.tag,
              loser: loser.tag,
              dice1,
              dice2,
              total,
            }),
          )
          .addFields(
            {
              name: t(i, "dice_winner_guess_label", { user: winner.tag }),
              value: t(i, "dice_difference", {
                guess: winnerGuess,
                diff: Math.abs(total - winnerGuess),
              }),
              inline: true,
            },
            {
              name: t(i, "dice_loser_guess_label", { user: loser.tag }),
              value: t(i, "dice_difference", {
                guess: loserGuess,
                diff: Math.abs(total - loserGuess),
              }),
              inline: true,
            },
          )
          .setFooter({ text: t(i, "dice_clean_inventory") })
          .setTimestamp();

        await i.update({ embeds: [fullInventoryEmbed], components: [] });
      } else {
        const winnerNewGold = getUserGold(winner.id);
        const loserNewGold = getUserGold(loser.id);

        const resultEmbed = new EmbedBuilder()
          .setColor("#00FF00")
          .setTitle(t(i, "dice_results_title"))
          .setDescription(
            t(i, "dice_showed", { dice1, dice2, total }) +
              "\n\n" +
              t(i, "dice_winner_wins", { winner: winner.tag, total: bet * 2 }),
          )
          .addFields(
            {
              name: t(i, "dice_winner_guess_label", { user: winner.tag }),
              value: t(i, "dice_difference", {
                guess: winnerGuess,
                diff: Math.abs(total - winnerGuess),
              }),
              inline: true,
            },
            {
              name: t(i, "dice_loser_guess_label", { user: loser.tag }),
              value: t(i, "dice_difference", {
                guess: loserGuess,
                diff: Math.abs(total - loserGuess),
              }),
              inline: true,
            },
            { name: "\u200B", value: "\u200B", inline: false },
            {
              name: t(i, "dice_tokens_label", { user: winner.tag }),
              value: t(i, "dice_tokens_amount", { amount: winnerNewGold }),
              inline: true,
            },
            {
              name: t(i, "dice_tokens_label", { user: loser.tag }),
              value: t(i, "dice_tokens_amount", { amount: loserNewGold }),
              inline: true,
            },
          )
          .setFooter({
            text: t(i, "dice_called_closest", { user: winner.tag }),
          })
          .setTimestamp();

        await i.update({ embeds: [resultEmbed], components: [] });
      }

      activeGames.delete(challenger.id);
      activeGames.delete(opponent.id);

      cooldowns.set(challenger.id, Date.now());
      cooldowns.set(opponent.id, Date.now());

      setTimeout(() => {
        cooldowns.delete(challenger.id);
        cooldowns.delete(opponent.id);
      }, cooldownAmount);
    });

    collector.on("end", (collected) => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setColor("#808080")
          .setTitle(t(interaction, "dice_challenge_expired"))
          .setDescription(
            t(interaction, "dice_no_response", { user: opponent.tag }),
          )
          .setFooter({ text: t(interaction, "dice_better_luck") })
          .setTimestamp();

        message.edit({ embeds: [timeoutEmbed], components: [] });
        activeGames.delete(challenger.id);
        activeGames.delete(opponent.id);
      }
    });
  },
};

export default command;
