import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  MessageFlags,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  ComponentType,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ButtonInteraction,
  StringSelectMenuInteraction,
  ModalSubmitInteraction,
} from "discord.js";
const {
  getUserGold,
  addUserGold,
  removeUserGold,
} = require("../../utils/dataManager");
import { t, getLocale } from "../../utils/i18n";
import { applyLocalizations } from "../../utils/commandLocalizations";
import {
  getSaloonTokenEmoji,
  getSlotMachineEmoji,
} from "../../utils/customEmojis";
import { formatDuration } from "../../utils/embeds";

const cooldowns = new Map();
const activeGames = new Map();

const rouletteNumbers = [
  { number: 0, color: "🟢" },
  { number: 1, color: "🔴" },
  { number: 2, color: "⚫" },
  { number: 3, color: "🔴" },
  { number: 4, color: "⚫" },
  { number: 5, color: "🔴" },
  { number: 6, color: "⚫" },
  { number: 7, color: "🔴" },
  { number: 8, color: "⚫" },
  { number: 9, color: "🔴" },
  { number: 10, color: "⚫" },
  { number: 11, color: "⚫" },
  { number: 12, color: "🔴" },
  { number: 13, color: "⚫" },
  { number: 14, color: "🔴" },
  { number: 15, color: "⚫" },
  { number: 16, color: "🔴" },
  { number: 17, color: "⚫" },
  { number: 18, color: "🔴" },
  { number: 19, color: "🔴" },
  { number: 20, color: "⚫" },
  { number: 21, color: "🔴" },
  { number: 22, color: "⚫" },
  { number: 23, color: "🔴" },
  { number: 24, color: "⚫" },
  { number: 25, color: "🔴" },
  { number: 26, color: "⚫" },
  { number: 27, color: "🔴" },
  { number: 28, color: "⚫" },
  { number: 29, color: "⚫" },
  { number: 30, color: "🔴" },
  { number: 31, color: "⚫" },
  { number: 32, color: "🔴" },
  { number: 33, color: "⚫" },
  { number: 34, color: "🔴" },
  { number: 35, color: "⚫" },
  { number: 36, color: "🔴" },
];

function getNumberColor(num: number): string {
  const entry = rouletteNumbers.find((r) => r.number === num);
  return entry ? entry.color : "⚪";
}

function isRed(num: number): boolean {
  return getNumberColor(num) === "🔴";
}

function isBlack(num: number): boolean {
  return getNumberColor(num) === "⚫";
}

interface GameSession {
  betType: string | null;
  betAmount: number | null;
  specificNumber: number | null;
  userId: string;
  locale: string;
}

const gameSessions = new Map<string, GameSession>();

export default {
  data: applyLocalizations(
    new SlashCommandBuilder()
      .setName("roulette")
      .setDescription("🎰 Spin the roulette wheel at the Saloon!"),
    "roulette",
  ),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const player = interaction.user;
    const locale = getLocale(interaction);
    const tokenEmoji = getSaloonTokenEmoji();
    const slotEmoji = getSlotMachineEmoji();

    const now = Date.now();
    const cooldownAmount = 5000;

    if (cooldowns.has(player.id)) {
      const expirationTime = cooldowns.get(player.id) + cooldownAmount;
      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000;
        await interaction.reply({
          content: t(interaction, "roulette_cooldown").replace(
            "{time}",
            timeLeft.toFixed(1),
          ),
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
    }

    if (activeGames.has(player.id)) {
      await interaction.reply({
        content: t(interaction, "roulette_already_active"),
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const playerGold = getUserGold(player.id);

    // Criar sessão de jogo
    gameSessions.set(player.id, {
      betType: null,
      betAmount: null,
      specificNumber: null,
      userId: player.id,
      locale: locale,
    });

    // Criar interface inicial
    const betTypeRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("roulette_red")
        .setLabel(t(interaction, "roulette_bet_red"))
        .setEmoji("🔴")
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId("roulette_black")
        .setLabel(t(interaction, "roulette_bet_black"))
        .setEmoji("⚫")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("roulette_number")
        .setLabel(t(interaction, "roulette_bet_number"))
        .setEmoji("🔢")
        .setStyle(ButtonStyle.Primary),
    );

    const betTypeRow2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("roulette_even")
        .setLabel(t(interaction, "roulette_bet_even"))
        .setEmoji("📊")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("roulette_odd")
        .setLabel(t(interaction, "roulette_bet_odd"))
        .setEmoji("📊")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("roulette_low")
        .setLabel(t(interaction, "roulette_bet_low"))
        .setEmoji("📉")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("roulette_high")
        .setLabel(t(interaction, "roulette_bet_high"))
        .setEmoji("📈")
        .setStyle(ButtonStyle.Primary),
    );

    const amountMenu =
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("roulette_amount")
          .setPlaceholder(t(interaction, "roulette_select_amount"))
          .addOptions([
            { label: "10 Tokens", value: "10" },
            { label: "25 Tokens", value: "25" },
            { label: "50 Tokens", value: "50" },
            { label: "100 Tokens", value: "100" },
            { label: "250 Tokens", value: "250" },
            { label: "500 Tokens", value: "500" },
            { label: "1000 Tokens", value: "1000" },
          ]),
      );

    const embed = new EmbedBuilder()
      .setColor(0xffd700)
      .setTitle(`${slotEmoji} ${t(interaction, "roulette_ui_title")}`)
      .setDescription(
        `**${t(interaction, "roulette_ui_balance")}:** ${playerGold} ${tokenEmoji}`,
      )
      .setFooter({ text: t(interaction, "roulette_good_luck") })
      .setTimestamp();

    await interaction.reply({
      embeds: [embed],
      components: [betTypeRow, betTypeRow2, amountMenu],
      flags: MessageFlags.Ephemeral,
    });

    const response = await interaction.fetchReply();

    // Collector para botões e menus
    const collector = response.createMessageComponentCollector({
      filter: (i) => i.user.id === player.id,
      time: 120000, // 2 minutos
    });

    collector.on("collect", async (i) => {
      const session = gameSessions.get(player.id);
      if (!session) return;

      // Botões de tipo de aposta
      if (
        i.customId.startsWith("roulette_") &&
        !i.customId.includes("amount") &&
        !i.customId.includes("spin")
      ) {
        const betType = i.customId.replace("roulette_", "");

        if (betType === "number") {
          // Abrir modal para escolher número
          const modal = new ModalBuilder()
            .setCustomId("roulette_number_modal")
            .setTitle(t(interaction, "roulette_bet_number"));

          const numberInput = new TextInputBuilder()
            .setCustomId("number_input")
            .setLabel(t(interaction, "roulette_enter_number"))
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("0-36")
            .setMinLength(1)
            .setMaxLength(2)
            .setRequired(true);

          const actionRow =
            new ActionRowBuilder<TextInputBuilder>().addComponents(numberInput);
          modal.addComponents(actionRow);

          await (i as ButtonInteraction).showModal(modal);
          return;
        }

        session.betType = betType;
        session.specificNumber = null;

        // Se já tiver valor selecionado, mostrar botão de GIRAR
        if (session.betAmount) {
          const spinButton =
            new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder()
                .setCustomId("roulette_spin")
                .setLabel(t(interaction, "roulette_ui_spin"))
                .setEmoji("🎰")
                .setStyle(ButtonStyle.Success),
            );

          await (i as ButtonInteraction).update({
            embeds: [
              new EmbedBuilder()
                .setColor(0x00ff00)
                .setTitle(`${slotEmoji} ${t(interaction, "roulette_ui_ready")}`)
                .setDescription(
                  `╔═══════════════════════════╗\n` +
                    `║  ${t(interaction, "roulette_your_bet")}  ║\n` +
                    `╚═══════════════════════════╝\n\n` +
                    `**${t(interaction, "roulette_bet_type")}:** ${t(interaction, `roulette_bet_${betType}`)}\n` +
                    `**${t(interaction, "roulette_bet_amount")}:** ${session.betAmount} ${tokenEmoji}\n\n` +
                    `${t(interaction, "roulette_ui_click_to_spin")}`,
                ),
            ],
            components: [spinButton],
          });
        } else {
          await (i as ButtonInteraction).update({
            embeds: [
              new EmbedBuilder()
                .setColor(0xffd700)
                .setTitle(`${slotEmoji} ${t(interaction, "roulette_ui_title")}`)
                .setDescription(
                  `✅ **${t(interaction, "roulette_ui_bet_selected")}:** ${t(interaction, `roulette_bet_${betType}`)}\n\n` +
                    `${t(interaction, "roulette_ui_now_select_amount")}`,
                ),
            ],
            components: [betTypeRow, betTypeRow2, amountMenu],
          });
        }
      }

      // Menu de quantia
      if (i.customId === "roulette_amount") {
        const amount = parseInt((i as StringSelectMenuInteraction).values[0]);
        session.betAmount = amount;

        const currentGold = getUserGold(player.id);
        if (currentGold < amount) {
          await (i as StringSelectMenuInteraction).update({
            embeds: [
              new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle(
                  "❌ " +
                    t(interaction, "roulette_insufficient_tokens").split(
                      ".",
                    )[0],
                )
                .setDescription(
                  t(interaction, "roulette_insufficient_tokens")
                    .replace("{current}", currentGold.toString())
                    .replace("{bet}", amount.toString())
                    .replace("{emoji}", tokenEmoji),
                ),
            ],
            components: [],
          });
          gameSessions.delete(player.id);
          return;
        }

        // Só mostrar botão de GIRAR se ambos tipo e valor estiverem selecionados
        if (!session.betType) {
          await (i as StringSelectMenuInteraction).update({
            embeds: [
              new EmbedBuilder()
                .setColor(0xffa500)
                .setTitle(`${slotEmoji} ${t(interaction, "roulette_ui_title")}`)
                .setDescription(
                  `✅ **${t(interaction, "roulette_bet_amount")}:** ${amount} ${tokenEmoji}\n\n` +
                    `⚠️ ${t(interaction, "roulette_ui_select_bet_type")}`,
                ),
            ],
            components: [betTypeRow, betTypeRow2, amountMenu],
          });
          return;
        }

        // Adicionar botão de GIRAR
        const spinButton = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId("roulette_spin")
            .setLabel(t(interaction, "roulette_ui_spin"))
            .setEmoji("🎰")
            .setStyle(ButtonStyle.Success),
        );

        const betTypeName =
          session.betType === "number" && session.specificNumber !== null
            ? `${t(interaction, "roulette_bet_number")} (${session.specificNumber})`
            : t(interaction, `roulette_bet_${session.betType}`);

        await (i as StringSelectMenuInteraction).update({
          embeds: [
            new EmbedBuilder()
              .setColor(0x00ff00)
              .setTitle(`${slotEmoji} ${t(interaction, "roulette_ui_ready")}`)
              .setDescription(
                `╔═══════════════════════════╗\n` +
                  `║  ${t(interaction, "roulette_your_bet")}  ║\n` +
                  `╚═══════════════════════════╝\n\n` +
                  `**${t(interaction, "roulette_bet_type")}:** ${betTypeName}\n` +
                  `**${t(interaction, "roulette_bet_amount")}:** ${amount} ${tokenEmoji}\n\n` +
                  `${t(interaction, "roulette_ui_click_to_spin")}`,
              ),
          ],
          components: [spinButton],
        });
      }

      // Botão de GIRAR
      if (i.customId === "roulette_spin") {
        if (!session.betType || !session.betAmount) {
          await (i as ButtonInteraction).reply({
            content: t(interaction, "roulette_specify_both"),
            flags: MessageFlags.Ephemeral,
          });
          return;
        }

        activeGames.set(player.id, true);
        removeUserGold(player.id, session.betAmount);

        const betTypeName =
          session.betType === "number" && session.specificNumber !== null
            ? `${t(interaction, "roulette_bet_number")} (${session.specificNumber})`
            : t(interaction, `roulette_bet_${session.betType}`);

        const spinningEmbed = new EmbedBuilder()
          .setColor(0xffd700)
          .setTitle(`${slotEmoji} ${t(interaction, "roulette_title_spinning")}`)
          .setDescription(
            `╔═══════════════════════════╗\n` +
              `║  ${t(interaction, "roulette_your_bet")}  ║\n` +
              `╚═══════════════════════════╝\n\n` +
              `**${t(interaction, "roulette_bet_amount")}:** ${session.betAmount} ${tokenEmoji}\n` +
              `**${t(interaction, "roulette_bet_type")}:** ${betTypeName}\n\n` +
              `🌀 ${t(interaction, "roulette_spinning")}\n\n` +
              `⏳ ${t(interaction, "roulette_determining")}`,
          )
          .setFooter({ text: t(interaction, "roulette_good_luck") })
          .setTimestamp();

        await (i as ButtonInteraction).update({
          embeds: [spinningEmbed],
          components: [],
        });

        setTimeout(async () => {
          const result = Math.floor(Math.random() * 37);
          const resultColor = getNumberColor(result);

          let won = false;
          let multiplier = 0;

          switch (session.betType) {
            case "red":
              won = isRed(result);
              multiplier = 2;
              break;
            case "black":
              won = isBlack(result);
              multiplier = 2;
              break;
            case "number":
              won = result === session.specificNumber;
              multiplier = 36;
              break;
            case "even":
              won = result !== 0 && result % 2 === 0;
              multiplier = 2;
              break;
            case "odd":
              won = result % 2 !== 0;
              multiplier = 2;
              break;
            case "low":
              won = result >= 1 && result <= 18;
              multiplier = 2;
              break;
            case "high":
              won = result >= 19 && result <= 36;
              multiplier = 2;
              break;
          }

          let resultEmbed: EmbedBuilder;

          if (won) {
            const winnings = session.betAmount! * multiplier;
            addUserGold(player.id, winnings);
            const profit = winnings - session.betAmount!;
            const newBalance = getUserGold(player.id);

            resultEmbed = new EmbedBuilder()
              .setColor(0x00ff00)
              .setTitle(`🎉 ${t(interaction, "roulette_title_win")}`)
              .setDescription(
                `╔═══════════════════════════╗\n` +
                  `║  ${t(interaction, "roulette_result")}  ║\n` +
                  `╚═══════════════════════════╝\n\n` +
                  `**${t(interaction, "roulette_ball_landed")}** ${resultColor} **${result}**\n\n` +
                  `✨ ${t(interaction, "roulette_bet_won").replace("{bet}", betTypeName)}\n\n` +
                  `━━━━━━━━━━━━━━━━━━━━━━━━━`,
              )
              .addFields(
                {
                  name: `💰 ${t(interaction, "roulette_winnings")}`,
                  value: `${winnings} ${tokenEmoji} **(${multiplier}x)**`,
                  inline: true,
                },
                {
                  name: `📈 ${t(interaction, "roulette_profit")}`,
                  value: `+${profit} ${tokenEmoji}`,
                  inline: true,
                },
                {
                  name: `${tokenEmoji} ${t(interaction, "roulette_new_balance")}`,
                  value: `**${newBalance}** ${tokenEmoji}`,
                  inline: false,
                },
              )
              .setFooter({ text: t(interaction, "roulette_congratulations") })
              .setTimestamp();
          } else {
            const newBalance = getUserGold(player.id);

            resultEmbed = new EmbedBuilder()
              .setColor(0xff0000)
              .setTitle(`💸 ${t(interaction, "roulette_title_loss")}`)
              .setDescription(
                `╔═══════════════════════════╗\n` +
                  `║  ${t(interaction, "roulette_result")}  ║\n` +
                  `╚═══════════════════════════╝\n\n` +
                  `**${t(interaction, "roulette_ball_landed")}** ${resultColor} **${result}**\n\n` +
                  `😔 ${t(interaction, "roulette_bet_lost").replace("{bet}", betTypeName)}\n\n` +
                  `━━━━━━━━━━━━━━━━━━━━━━━━━`,
              )
              .addFields(
                {
                  name: `💸 ${t(interaction, "roulette_loss")}`,
                  value: `-${session.betAmount} ${tokenEmoji}`,
                  inline: true,
                },
                {
                  name: `${tokenEmoji} ${t(interaction, "roulette_new_balance")}`,
                  value: `**${newBalance}** ${tokenEmoji}`,
                  inline: true,
                },
              )
              .setFooter({ text: t(interaction, "roulette_better_luck") })
              .setTimestamp();
          }

          await i.editReply({ embeds: [resultEmbed], components: [] });
          activeGames.delete(player.id);
          gameSessions.delete(player.id);
          cooldowns.set(player.id, Date.now());
          setTimeout(() => cooldowns.delete(player.id), cooldownAmount);
        }, 3000);
      }
    });

    // Handler para o modal de número (usando listener único para evitar memory leak)
    const modalHandler = async (modalInteraction: any) => {
      if (!modalInteraction.isModalSubmit()) return;
      if (modalInteraction.customId !== "roulette_number_modal") return;
      if (modalInteraction.user.id !== player.id) return;

      const session = gameSessions.get(player.id);
      if (!session) return;

      const numberStr = (
        modalInteraction as ModalSubmitInteraction
      ).fields.getTextInputValue("number_input");
      const number = parseInt(numberStr);

      if (isNaN(number) || number < 0 || number > 36) {
        await modalInteraction.reply({
          content: t(interaction, "roulette_invalid_number"),
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      session.betType = "number";
      session.specificNumber = number;

      await modalInteraction.deferUpdate();

      // Se já tiver valor selecionado, mostrar botão de GIRAR
      if (session.betAmount) {
        const spinButton = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId("roulette_spin")
            .setLabel(t(interaction, "roulette_ui_spin"))
            .setEmoji("🎰")
            .setStyle(ButtonStyle.Success),
        );

        await response.edit({
          embeds: [
            new EmbedBuilder()
              .setColor(0x00ff00)
              .setTitle(`${slotEmoji} ${t(interaction, "roulette_ui_ready")}`)
              .setDescription(
                `╔═══════════════════════════╗\n` +
                  `║  ${t(interaction, "roulette_your_bet")}  ║\n` +
                  `╚═══════════════════════════╝\n\n` +
                  `**${t(interaction, "roulette_bet_type")}:** ${t(interaction, "roulette_bet_number")} (${number})\n` +
                  `**${t(interaction, "roulette_bet_amount")}:** ${session.betAmount} ${tokenEmoji}\n\n` +
                  `${t(interaction, "roulette_ui_click_to_spin")}`,
              ),
          ],
          components: [spinButton],
        });
      } else {
        await response.edit({
          embeds: [
            new EmbedBuilder()
              .setColor(0xffd700)
              .setTitle(`${slotEmoji} ${t(interaction, "roulette_ui_title")}`)
              .setDescription(
                `✅ **${t(interaction, "roulette_ui_bet_selected")}:** ${t(interaction, "roulette_bet_number")} (${number})\n\n` +
                  `${t(interaction, "roulette_ui_now_select_amount")}`,
              ),
          ],
          components: [betTypeRow, betTypeRow2, amountMenu],
        });
      }

      // Remover listener após uso
      interaction.client.off("interactionCreate", modalHandler);
    };

    interaction.client.on("interactionCreate", modalHandler);

    collector.on("end", () => {
      // Limpar todas as sessões e listeners
      if (gameSessions.has(player.id)) {
        gameSessions.delete(player.id);
      }
      if (activeGames.has(player.id)) {
        activeGames.delete(player.id);
      }
      // Remover listener se ainda existir
      interaction.client.off("interactionCreate", modalHandler);
    });
  },
};
