import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ChatInputCommandInteraction,
  ComponentType,
  MessageFlags,
} from "discord.js";
import {
  getSilverCoinEmoji,
  getGoldBarEmoji,
  getSaloonTokenEmoji,
  getCurrencyEmoji,
  getBriefcaseEmoji,
  getCheckEmoji,
  getStatsEmoji,
  getCancelEmoji,
  getCowboyEmoji,
  getMoneybagEmoji,
} from "../../utils/customEmojis";
import { t, getLocale } from "../../utils/i18n";
import { getInventory, removeItem } from "../../utils/inventoryManager";
import { addUserSilver } from "../../utils/dataManager";

const TOKEN_TO_SILVER = 50; // 1 Saloon Token = 50 Silver Coins
const GOLD_TO_SILVER = 500; // 1 Gold Bar = 500 Silver Coins
const DIAMOND_TO_SILVER = 43000; // 1 Diamond = 43,000 Silver Coins

export default {
  data: new SlashCommandBuilder()
    .setName("middleman")
    .setDescription("Convert Saloon Tokens and Gold Bars to Silver Coins"),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const userId = interaction.user.id;
    const locale = getLocale(interaction);
    const inventory = getInventory(userId);
    const saloonTokens = inventory.items["saloon_token"] || 0;
    const goldBars = inventory.items["gold"] || 0;
    const diamonds = inventory.items["diamond"] || 0;

    const shopUrl = `https://${process.env.REPLIT_DEV_DOMAIN || "sheriff-bot.repl.co"}/shop.html`;

    const tokenEmoji = getSaloonTokenEmoji();
    const silverEmoji = getSilverCoinEmoji();
    const goldEmoji = getGoldBarEmoji();
    const currencyEmoji = getCurrencyEmoji();
    const briefcaseEmoji = getBriefcaseEmoji();

    const statsEmoji = getStatsEmoji();

    const embed = new EmbedBuilder()
      .setColor(0xffd700)
      .setTitle(`${currencyEmoji} ${t(interaction, "middleman_title")}`)
      .setImage("https://i.postimg.cc/pXYndQmf/IMG-3259.png")
      .setDescription(
        `**${t(interaction, "middleman_welcome")}**\n\n${t(interaction, "middleman_description")}\n\n**${statsEmoji} ${t(interaction, "middleman_exchange_rates")}**\n${tokenEmoji} 1 ${locale === "pt-BR" ? "Ficha Saloon" : "Saloon Token"} = **50** ${silverEmoji} ${t(interaction, "silver_coins")}\n${goldEmoji} 1 ${locale === "pt-BR" ? "Barra de Ouro" : "Gold Bar"} = **500** ${silverEmoji} ${t(interaction, "silver_coins")}\n💎 1 ${locale === "pt-BR" ? "Diamante" : "Diamond"} = **43,000** ${silverEmoji} ${t(interaction, "silver_coins")}`,
      )
      .addFields(
        {
          name: `${briefcaseEmoji} ${t(interaction, "middleman_your_inventory")}`,
          value: `\`\`\`yaml\n${t(interaction, "middleman_saloon_tokens")}: ${saloonTokens.toLocaleString()}\n${t(interaction, "middleman_gold_bars")}: ${goldBars.toLocaleString()}\n${locale === "pt-BR" ? "Diamantes" : "Diamonds"}: ${diamonds.toLocaleString()}\n\`\`\``,
          inline: false,
        },
        {
          name: `${currencyEmoji} ${t(interaction, "middleman_how_to_exchange")}`,
          value: `${t(interaction, "middleman_step1")}\n${t(interaction, "middleman_step2")}\n${t(interaction, "middleman_step3")}`,
          inline: false,
        },
      )
      .setFooter({ text: `🤠 ${t(interaction, "middleman_fair_trades")}` })
      .setTimestamp();

    const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("convert_tokens")
        .setLabel(t(interaction, "middleman_tokens_to_silver"))
        .setStyle(ButtonStyle.Primary)
        .setDisabled(saloonTokens === 0),
      new ButtonBuilder()
        .setCustomId("convert_gold")
        .setLabel(t(interaction, "middleman_gold_to_silver"))
        .setStyle(ButtonStyle.Success)
        .setDisabled(goldBars === 0),
      new ButtonBuilder()
        .setCustomId("convert_diamond")
        .setLabel("💎 → Silver")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(diamonds === 0),
      new ButtonBuilder()
        .setLabel(`🛒 ${t(interaction, "middleman_visit_shop")}`)
        .setStyle(ButtonStyle.Link)
        .setURL(shopUrl),
    );

    await interaction.reply({
      embeds: [embed],
      components: [buttons],
    });
    const response = await interaction.fetchReply();

    const collector = response.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 120000,
    });

    collector.on("collect", async (i) => {
      const cancelEmoji = getCancelEmoji();
      const locale = getLocale(i);

      if (i.user.id !== userId) {
        return i.reply({
          content: `${cancelEmoji} ${t(i, "middleman_not_for_you")}`,
          flags: MessageFlags.Ephemeral,
        });
      }

      if (i.customId === "convert_tokens") {
        const currentInventory = getInventory(userId);
        const currentTokens = currentInventory.items["saloon_token"] || 0;

        if (currentTokens === 0) {
          return i.reply({
            content: `${cancelEmoji} ${t(i, "middleman_no_tokens")}`,
            flags: MessageFlags.Ephemeral,
          });
        }

        const options = [
          new StringSelectMenuOptionBuilder()
            .setLabel(`1 Token → ${TOKEN_TO_SILVER} Silver`)
            .setValue("1"),
        ];

        if (currentTokens >= 5) {
          options.push(
            new StringSelectMenuOptionBuilder()
              .setLabel(`5 Tokens → ${TOKEN_TO_SILVER * 5} Silver`)
              .setValue("5"),
          );
        }

        if (currentTokens >= 10) {
          options.push(
            new StringSelectMenuOptionBuilder()
              .setLabel(`10 Tokens → ${TOKEN_TO_SILVER * 10} Silver`)
              .setValue("10"),
          );
        }

        if (currentTokens >= 25) {
          options.push(
            new StringSelectMenuOptionBuilder()
              .setLabel(`25 Tokens → ${TOKEN_TO_SILVER * 25} Silver`)
              .setValue("25"),
          );
        }

        options.push(
          new StringSelectMenuOptionBuilder()
            .setLabel(
              `All (${currentTokens} Tokens) → ${TOKEN_TO_SILVER * currentTokens} Silver`,
            )
            .setValue("all")
            .setEmoji(getMoneybagEmoji() || "💰"),
        );

        const selectMenu = new StringSelectMenuBuilder()
          .setCustomId("token_amount")
          .setPlaceholder(t(i, "middleman_select_tokens"))
          .addOptions(...options);

        const selectRow =
          new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            selectMenu,
          );

        await i.reply({
          content: `**${t(i, "middleman_select_amount")}**\n${t(i, "middleman_you_have_tokens")} **${currentTokens}** ${tokenEmoji} ${locale === "pt-BR" ? t(i, "middleman_tokens") : "Saloon Tokens"}`,
          components: [selectRow],
          flags: MessageFlags.Ephemeral,
        });

        const selectCollector = i.channel?.createMessageComponentCollector({
          componentType: ComponentType.StringSelect,
          time: 60000,
          filter: (si) =>
            si.user.id === userId && si.customId === "token_amount",
        });

        selectCollector?.on("collect", async (si) => {
          const amount =
            si.values[0] === "all" ? currentTokens : parseInt(si.values[0]);
          const finalInventory = getInventory(userId);
          const finalTokens = finalInventory.items["saloon_token"] || 0;

          const cancelEmoji = getCancelEmoji();
          const locale = getLocale(si);

          if (finalTokens < amount) {
            return si.update({
              content: `${cancelEmoji} ${t(si, "middleman_not_enough_tokens")} ${finalTokens}.`,
              components: [],
            });
          }

          const removeResult = await removeItem(userId, "saloon_token", amount);
          if (!removeResult.success) {
            return si.update({
              content: `${cancelEmoji} ${t(si, "middleman_error")}: ${removeResult.error}`,
              components: [],
            });
          }

          const silverAmount = amount * TOKEN_TO_SILVER;
          await addUserSilver(userId, silverAmount);

          const checkEmoji = getCheckEmoji();
          const successEmbed = new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle(`${checkEmoji} ${t(si, "middleman_success_title")}`)
            .setDescription(
              `${t(si, "middleman_converted_tokens")} **${amount}** ${tokenEmoji} ${locale === "pt-BR" ? (amount === 1 ? t(si, "middleman_token") : t(si, "middleman_tokens")) : "Saloon Token" + (amount > 1 ? "s" : "")} ${t(si, "middleman_into")} **${silverAmount.toLocaleString()}** ${silverEmoji} ${t(si, "silver_coins")}!`,
            )
            .addFields(
              {
                name: t(si, "middleman_tokens_converted"),
                value: `${amount} ${tokenEmoji}`,
                inline: true,
              },
              {
                name: t(si, "middleman_silver_received"),
                value: `${silverAmount.toLocaleString()} ${silverEmoji}`,
                inline: true,
              },
            )
            .setFooter({ text: t(si, "middleman_thanks") })
            .setTimestamp();

          await si.update({ embeds: [successEmbed], components: [] });
        });
      } else if (i.customId === "convert_gold") {
        const currentInventory = getInventory(userId);
        const currentGold = currentInventory.items["gold"] || 0;

        if (currentGold === 0) {
          return i.reply({
            content: `${cancelEmoji} ${t(i, "middleman_no_gold")}`,
            flags: MessageFlags.Ephemeral,
          });
        }

        const goldOptions = [
          new StringSelectMenuOptionBuilder()
            .setLabel(`1 Gold Bar → ${GOLD_TO_SILVER} Silver`)
            .setValue("1"),
        ];

        if (currentGold >= 5) {
          goldOptions.push(
            new StringSelectMenuOptionBuilder()
              .setLabel(`5 Gold Bars → ${GOLD_TO_SILVER * 5} Silver`)
              .setValue("5"),
          );
        }

        if (currentGold >= 10) {
          goldOptions.push(
            new StringSelectMenuOptionBuilder()
              .setLabel(`10 Gold Bars → ${GOLD_TO_SILVER * 10} Silver`)
              .setValue("10"),
          );
        }

        goldOptions.push(
          new StringSelectMenuOptionBuilder()
            .setLabel(
              `All (${currentGold} Bars) → ${GOLD_TO_SILVER * currentGold} Silver`,
            )
            .setValue("all")
            .setEmoji(getMoneybagEmoji() || "💰"),
        );

        const selectMenu = new StringSelectMenuBuilder()
          .setCustomId("gold_amount")
          .setPlaceholder(t(i, "middleman_select_gold"))
          .addOptions(...goldOptions);

        const selectRow =
          new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            selectMenu,
          );

        await i.reply({
          content: `**${t(i, "middleman_select_amount")}**\n${t(i, "middleman_you_have_gold")} **${currentGold}** ${goldEmoji} ${locale === "pt-BR" ? (currentGold === 1 ? t(i, "middleman_bar") : t(i, "middleman_bars")) : "Gold Bar" + (currentGold > 1 ? "s" : "")}`,
          components: [selectRow],
          flags: MessageFlags.Ephemeral,
        });

        const selectCollector = i.channel?.createMessageComponentCollector({
          componentType: ComponentType.StringSelect,
          time: 60000,
          filter: (si) =>
            si.user.id === userId && si.customId === "gold_amount",
        });

        selectCollector?.on("collect", async (si) => {
          const amount =
            si.values[0] === "all" ? currentGold : parseInt(si.values[0]);
          const finalInventory = getInventory(userId);
          const finalGold = finalInventory.items["gold"] || 0;

          const cancelEmoji = getCancelEmoji();
          const locale = getLocale(si);

          if (finalGold < amount) {
            return si.update({
              content: `${cancelEmoji} ${t(si, "middleman_not_enough_gold")} ${finalGold}.`,
              components: [],
            });
          }

          const removeResult = await removeItem(userId, "gold", amount);
          if (!removeResult.success) {
            return si.update({
              content: `${cancelEmoji} ${t(si, "middleman_error")}: ${removeResult.error}`,
              components: [],
            });
          }

          const silverAmount = amount * GOLD_TO_SILVER;
          await addUserSilver(userId, silverAmount);

          const checkEmoji = getCheckEmoji();
          const successEmbed = new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle(`${checkEmoji} ${t(si, "middleman_success_title")}`)
            .setDescription(
              `${t(si, "middleman_converted_gold")} **${amount}** ${goldEmoji} ${locale === "pt-BR" ? (amount === 1 ? t(si, "middleman_bar") : t(si, "middleman_bars")) + " de Ouro" : "Gold Bar" + (amount > 1 ? "s" : "")} ${t(si, "middleman_into")} **${silverAmount.toLocaleString()}** ${silverEmoji} ${t(si, "silver_coins")}!`,
            )
            .addFields(
              {
                name: t(si, "middleman_gold_converted"),
                value: `${amount} ${goldEmoji}`,
                inline: true,
              },
              {
                name: t(si, "middleman_silver_received"),
                value: `${silverAmount.toLocaleString()} ${silverEmoji}`,
                inline: true,
              },
            )
            .setFooter({ text: t(si, "middleman_thanks") })
            .setTimestamp();

          await si.update({ embeds: [successEmbed], components: [] });
        });
      } else if (i.customId === "convert_diamond") {
        const currentInventory = getInventory(userId);
        const currentDiamonds = currentInventory.items["diamond"] || 0;

        if (currentDiamonds === 0) {
          return i.reply({
            content: `${cancelEmoji} ${locale === "pt-BR" ? "Você não tem diamantes!" : "You don't have any diamonds!"}`,
            flags: MessageFlags.Ephemeral,
          });
        }

        const diamondOptions = [
          new StringSelectMenuOptionBuilder()
            .setLabel(
              `1 Diamond → ${DIAMOND_TO_SILVER.toLocaleString()} Silver`,
            )
            .setValue("1"),
        ];

        if (currentDiamonds >= 5) {
          diamondOptions.push(
            new StringSelectMenuOptionBuilder()
              .setLabel(
                `5 Diamonds → ${(DIAMOND_TO_SILVER * 5).toLocaleString()} Silver`,
              )
              .setValue("5"),
          );
        }

        if (currentDiamonds >= 10) {
          diamondOptions.push(
            new StringSelectMenuOptionBuilder()
              .setLabel(
                `10 Diamonds → ${(DIAMOND_TO_SILVER * 10).toLocaleString()} Silver`,
              )
              .setValue("10"),
          );
        }

        diamondOptions.push(
          new StringSelectMenuOptionBuilder()
            .setLabel(
              `All (${currentDiamonds} Diamonds) → ${(DIAMOND_TO_SILVER * currentDiamonds).toLocaleString()} Silver`,
            )
            .setValue("all")
            .setEmoji(getMoneybagEmoji() || "💰"),
        );

        const selectMenu = new StringSelectMenuBuilder()
          .setCustomId("diamond_amount")
          .setPlaceholder(
            locale === "pt-BR"
              ? "Selecione quantos diamantes vender"
              : "Select how many diamonds to sell",
          )
          .addOptions(...diamondOptions);

        const selectRow =
          new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            selectMenu,
          );

        await i.reply({
          content: `**${locale === "pt-BR" ? "Selecione a quantidade" : "Select amount"}**\n${locale === "pt-BR" ? "Você tem" : "You have"} **${currentDiamonds}** 💎 ${locale === "pt-BR" ? (currentDiamonds === 1 ? "Diamante" : "Diamantes") : "Diamond" + (currentDiamonds > 1 ? "s" : "")}`,
          components: [selectRow],
          flags: MessageFlags.Ephemeral,
        });

        const selectCollector = i.channel?.createMessageComponentCollector({
          componentType: ComponentType.StringSelect,
          time: 60000,
          filter: (si) =>
            si.user.id === userId && si.customId === "diamond_amount",
        });

        selectCollector?.on("collect", async (si) => {
          const amount =
            si.values[0] === "all" ? currentDiamonds : parseInt(si.values[0]);
          const finalInventory = getInventory(userId);
          const finalDiamonds = finalInventory.items["diamond"] || 0;

          const cancelEmoji = getCancelEmoji();
          const locale = getLocale(si);

          if (finalDiamonds < amount) {
            return si.update({
              content: `${cancelEmoji} ${locale === "pt-BR" ? `Você não tem diamantes suficientes! Você tem apenas ${finalDiamonds}.` : `You don't have enough diamonds! You only have ${finalDiamonds}.`}`,
              components: [],
            });
          }

          const removeResult = await removeItem(userId, "diamond", amount);
          if (!removeResult.success) {
            return si.update({
              content: `${cancelEmoji} ${locale === "pt-BR" ? "Erro" : "Error"}: ${removeResult.error}`,
              components: [],
            });
          }

          const silverAmount = amount * DIAMOND_TO_SILVER;
          await addUserSilver(userId, silverAmount);

          const checkEmoji = getCheckEmoji();
          const successEmbed = new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle(
              `${checkEmoji} ${locale === "pt-BR" ? "Conversão realizada com sucesso!" : "Conversion successful!"}`,
            )
            .setDescription(
              `${locale === "pt-BR" ? "Você converteu" : "You converted"} **${amount}** 💎 ${locale === "pt-BR" ? (amount === 1 ? "Diamante" : "Diamantes") : "Diamond" + (amount > 1 ? "s" : "")} ${locale === "pt-BR" ? "em" : "into"} **${silverAmount.toLocaleString()}** ${silverEmoji} ${t(si, "silver_coins")}!`,
            )
            .addFields(
              {
                name:
                  locale === "pt-BR"
                    ? "Diamantes convertidos"
                    : "Diamonds converted",
                value: `${amount} 💎`,
                inline: true,
              },
              {
                name:
                  locale === "pt-BR" ? "Pratas recebidas" : "Silver received",
                value: `${silverAmount.toLocaleString()} ${silverEmoji}`,
                inline: true,
              },
            )
            .setFooter({
              text:
                locale === "pt-BR"
                  ? "Obrigado por fazer negócio comigo!"
                  : "Thanks for doing business with me!",
            })
            .setTimestamp();

          await si.update({ embeds: [successEmbed], components: [] });
        });
      }
    });

    collector.on("end", () => {
      interaction.editReply({ components: [] }).catch(() => {});
    });
  },
};
