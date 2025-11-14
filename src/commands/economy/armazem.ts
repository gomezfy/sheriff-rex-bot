import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ComponentType,
  ChatInputCommandInteraction,
  ButtonInteraction,
  StringSelectMenuInteraction,
} from "discord.js";
import {
  getWarehouseStats,
  WAREHOUSE_RESOURCES,
  addStock,
  removeStock,
  recordTransaction,
  getPrice,
  getStock,
  addTreasury,
  removeTreasury,
  getTreasury,
} from "../../utils/warehouseManager";
import {
  getInventory,
  addItem,
  removeItem,
} from "../../utils/inventoryManager";
import {
  addUserSilver,
  getUserSilver,
  removeUserSilver,
} from "../../utils/dataManager";
import { Command } from "../../types";
import { t, getLocale } from "../../utils/i18n";
import { getEmoji } from "../../utils/customEmojis";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("armazem")
    .setDescription("🏛️ View and trade at the State Warehouse")
    .setDescriptionLocalizations({
      "pt-BR": "🏛️ Ver e negociar no Armazém do Estado",
      "es-ES": "🏛️ Ver y comerciar en el Almacén del Estado",
    }),

  async execute(interaction: ChatInputCommandInteraction) {
    await showWarehouse(interaction);
  },
};

async function showWarehouse(
  interaction: ChatInputCommandInteraction | ButtonInteraction,
  message?: string,
) {
  const stats = getWarehouseStats();
  const locale = getLocale(interaction);

  const warehouseEmoji = getEmoji("bank");
  const statsEmoji = getEmoji("stats");
  const silverEmoji = getEmoji("silver_coin");

  const embed = new EmbedBuilder()
    .setColor("#8B4513")
    .setTitle(`${warehouseEmoji} ${t(interaction, "warehouse_title")}`)
    .setDescription(
      message ||
        `**${t(interaction, "warehouse_desc")}**\n\n` +
          `${statsEmoji} **${t(interaction, "warehouse_stats_hourly")}**`,
    )
    .setTimestamp();

  let stockInfo = "";
  let hourlyStats = "";

  for (const resourceId in WAREHOUSE_RESOURCES) {
    const resource =
      WAREHOUSE_RESOURCES[resourceId as keyof typeof WAREHOUSE_RESOURCES];
    const stock = stats.stock[resourceId] || 0;
    const buyPrice = stats.prices[resourceId]?.buy || 0;
    const sellPrice = stats.prices[resourceId]?.sell || 0;

    const sold = stats.statistics.hourly[resourceId]?.sold || 0;
    const bought = stats.statistics.hourly[resourceId]?.bought || 0;

    stockInfo += `${resource.emoji} **${resource.name}**\n`;
    stockInfo += `├ ${t(interaction, "warehouse_stock")}: **${stock.toLocaleString()}** ${t(interaction, "warehouse_units")}\n`;
    stockInfo += `├ ${t(interaction, "warehouse_you_sell")}: **${sellPrice}** ${silverEmoji} ${t(interaction, "warehouse_each")}\n`;
    stockInfo += `└ ${t(interaction, "warehouse_you_buy")}: **${buyPrice}** ${silverEmoji} ${t(interaction, "warehouse_each")}\n\n`;

    hourlyStats += `**${resource.name}**: ${sold} ${t(interaction, "warehouse_sold")}, ${bought} ${t(interaction, "warehouse_bought")}\n`;
  }

  embed.addFields(
    {
      name: `${getEmoji("crate")} ${t(interaction, "warehouse_stock_prices")}`,
      value: stockInfo || t(interaction, "warehouse_no_resources"),
      inline: false,
    },
    {
      name: `${statsEmoji} ${t(interaction, "warehouse_movement")}`,
      value: hourlyStats || t(interaction, "warehouse_no_movement"),
      inline: false,
    },
    {
      name: `${getEmoji("moneybag")} ${t(interaction, "warehouse_total_value")}`,
      value: `**${stats.totalValue.toLocaleString()}** ${silverEmoji}`,
      inline: false,
    },
    {
      name: `💰 Cofre do Armazém`,
      value: `**${stats.treasury.toLocaleString()}** ${silverEmoji}`,
      inline: false,
    },
  );

  if (stats.statistics.lastReset) {
    const lastReset = new Date(stats.statistics.lastReset);
    const dateStr =
      locale === "pt-BR"
        ? lastReset.toLocaleString("pt-BR")
        : lastReset.toLocaleString("en-US");
    embed.setFooter({
      text: `${t(interaction, "warehouse_last_update")}: ${dateStr} | ${t(interaction, "warehouse_next_update")}`,
    });
  }

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("warehouse_sell")
      .setLabel(t(interaction, "warehouse_btn_sell"))
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId("warehouse_buy")
      .setLabel(t(interaction, "warehouse_btn_buy"))
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId("warehouse_refresh")
      .setLabel(t(interaction, "warehouse_btn_refresh"))
      .setStyle(ButtonStyle.Secondary),
  );

  if (interaction.isButton()) {
    await interaction.update({ embeds: [embed], components: [row] });
  } else {
    await interaction.reply({ embeds: [embed], components: [row] });
  }
}

export async function handleWarehouseButtons(interaction: ButtonInteraction) {
  const customId = interaction.customId;

  if (customId === "warehouse_refresh" || customId === "warehouse_back") {
    await showWarehouse(interaction);
    return;
  }

  if (customId === "warehouse_sell") {
    await showSellMenu(interaction);
    return;
  }

  if (customId === "warehouse_buy") {
    await showBuyMenu(interaction);
    return;
  }
}

async function showSellMenu(interaction: ButtonInteraction) {
  const inventory = getInventory(interaction.user.id);
  const options: StringSelectMenuOptionBuilder[] = [];
  const silverEmoji = getEmoji("silver_coin");

  for (const resourceId in WAREHOUSE_RESOURCES) {
    const resource =
      WAREHOUSE_RESOURCES[resourceId as keyof typeof WAREHOUSE_RESOURCES];
    const userAmount = inventory.items[resourceId] || 0;
    const sellPrice = getPrice(resourceId, "sell");

    options.push(
      new StringSelectMenuOptionBuilder()
        .setLabel(
          `${resource.name} (${userAmount} ${t(interaction, "warehouse_available")})`,
        )
        .setDescription(
          `${t(interaction, "warehouse_sell_for")} ${sellPrice} ${t(interaction, "warehouse_each")}`,
        )
        .setValue(resourceId),
    );
  }

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId("warehouse_sell_select")
    .setPlaceholder(t(interaction, "warehouse_select_placeholder_sell"))
    .addOptions(options);

  const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    selectMenu,
  );

  const backButton = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("warehouse_back")
      .setLabel(t(interaction, "warehouse_btn_back"))
      .setStyle(ButtonStyle.Secondary),
  );

  await interaction.update({
    content: `${getEmoji("moneybag")} **${t(interaction, "warehouse_sell_menu")}**`,
    components: [row, backButton],
    embeds: [],
  });
}

async function showBuyMenu(interaction: ButtonInteraction) {
  const options: StringSelectMenuOptionBuilder[] = [];
  const silverEmoji = getEmoji("silver_coin");

  for (const resourceId in WAREHOUSE_RESOURCES) {
    const resource =
      WAREHOUSE_RESOURCES[resourceId as keyof typeof WAREHOUSE_RESOURCES];
    const stock = getStock(resourceId);
    const buyPrice = getPrice(resourceId, "buy");

    options.push(
      new StringSelectMenuOptionBuilder()
        .setLabel(
          `${resource.name} (${stock} ${t(interaction, "warehouse_in_stock")})`,
        )
        .setDescription(
          `${t(interaction, "warehouse_buy_for")} ${buyPrice} ${t(interaction, "warehouse_each")}`,
        )
        .setValue(resourceId),
    );
  }

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId("warehouse_buy_select")
    .setPlaceholder(t(interaction, "warehouse_select_placeholder_buy"))
    .addOptions(options);

  const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    selectMenu,
  );

  const backButton = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("warehouse_back")
      .setLabel(t(interaction, "warehouse_btn_back"))
      .setStyle(ButtonStyle.Secondary),
  );

  await interaction.update({
    content: `${getEmoji("briefcase")} **${t(interaction, "warehouse_buy_menu")}**`,
    components: [row, backButton],
    embeds: [],
  });
}

export async function handleWarehouseSelects(
  interaction: StringSelectMenuInteraction,
) {
  const customId = interaction.customId;
  const resourceId = interaction.values[0];
  const resource =
    WAREHOUSE_RESOURCES[resourceId as keyof typeof WAREHOUSE_RESOURCES];

  if (customId === "warehouse_sell_select") {
    await handleSellInteraction(interaction, resourceId, resource);
  } else if (customId === "warehouse_buy_select") {
    await handleBuyInteraction(interaction, resourceId, resource);
  }
}

async function handleSellInteraction(
  interaction: StringSelectMenuInteraction,
  resourceId: string,
  resource: (typeof WAREHOUSE_RESOURCES)[keyof typeof WAREHOUSE_RESOURCES],
) {
  const inventory = getInventory(interaction.user.id);
  const userAmount = inventory.items[resourceId] || 0;
  const silverEmoji = getEmoji("silver_coin");
  const cancelEmoji = getEmoji("cancel");

  if (userAmount === 0) {
    await interaction.reply({
      content: `${cancelEmoji} ${t(interaction, "warehouse_no_items", { resource: `${resource.emoji} **${resource.name}**` })}`,
      ephemeral: true,
    });
    return;
  }

  await interaction.reply({
    content:
      `${getEmoji("moneybag")} **${t(interaction, "warehouse_sell_title", { resource: `${resource.emoji} ${resource.name}` })}**\n\n` +
      `${t(interaction, "warehouse_you_have")}: **${userAmount}** ${t(interaction, "warehouse_units")}\n` +
      `${t(interaction, "warehouse_price")}: **${getPrice(resourceId, "sell")}** ${silverEmoji} ${t(interaction, "warehouse_each")}\n\n` +
      `${t(interaction, "warehouse_enter_amount", { action: t(interaction, "warehouse_action_sell") })}`,
    ephemeral: false,
  });

  if (
    !interaction.channel ||
    !("createMessageCollector" in interaction.channel)
  ) {
    await interaction.followUp({
      content: `${cancelEmoji} Erro: Este canal não suporta esta funcionalidade. Tente usar o comando em um canal de texto normal.`,
      ephemeral: true,
    });
    return;
  }

  const filter = (m: { author: { id: string } }) => {
    console.log(
      `[Warehouse SELL] Message from ${m.author.id}, expected ${interaction.user.id}`,
    );
    return m.author.id === interaction.user.id;
  };

  const collector = interaction.channel.createMessageCollector({
    filter,
    time: 60000,
    max: 1,
  });

  console.log(
    `[Warehouse SELL] Collector created for user ${interaction.user.id} in channel ${interaction.channel.id}`,
  );

  collector.on("collect", async (msg) => {
    if (
      msg.content.toLowerCase() === "cancelar" ||
      msg.content.toLowerCase() === "cancel"
    ) {
      await msg.reply(
        `${cancelEmoji} ${t(interaction, "warehouse_action_sell", {})} ${t(interaction, "warehouse_cancelled")}`,
      );
      return;
    }

    const amount = parseInt(msg.content);

    if (isNaN(amount) || amount <= 0) {
      await msg.reply(
        `${cancelEmoji} ${t(interaction, "warehouse_invalid_amount")}`,
      );
      return;
    }

    if (amount > userAmount) {
      await msg.reply(
        `${cancelEmoji} ${t(interaction, "warehouse_insufficient_items", { amount, resource: resource.name })}`,
      );
      return;
    }

    const sellPrice = getPrice(resourceId, "sell");
    const totalEarned = amount * sellPrice;

    const currentTreasury = getTreasury();
    if (currentTreasury < totalEarned) {
      await msg.reply(
        `${cancelEmoji} **Armazém sem fundos!**\n\n` +
          `O armazém precisa de **${totalEarned.toLocaleString()}** ${silverEmoji} para comprar seus itens, ` +
          `mas o cofre só tem **${currentTreasury.toLocaleString()}** ${silverEmoji}.\n\n` +
          `⏳ Aguarde outros jogadores comprarem do armazém para acumular mais fundos no cofre!`,
      );
      return;
    }

    const treasurySuccess = removeTreasury(totalEarned);
    if (!treasurySuccess) {
      await msg.reply(
        `${cancelEmoji} **Erro ao processar pagamento!**\n\n` +
          `O cofre do armazém não tem fundos suficientes. Tente novamente mais tarde.`,
      );
      return;
    }

    await removeItem(interaction.user.id, resourceId, amount);
    addStock(resourceId, amount);
    recordTransaction(
      interaction.user.id,
      "sell",
      resourceId,
      amount,
      sellPrice,
    );

    await addUserSilver(interaction.user.id, totalEarned);

    try {
      const checkEmoji = getEmoji("check");
      const dmEmbed = new EmbedBuilder()
        .setColor("#2ECC71")
        .setTitle(`${checkEmoji} ${t(interaction, "warehouse_sale_complete")}`)
        .setDescription(
          `${t(interaction, "warehouse_sale_success", { amount, resource: `${resource.emoji} **${resource.name}**` })}\n\n` +
            `${t(interaction, "warehouse_unit_price")}: **${sellPrice}** ${silverEmoji}\n` +
            `**${t(interaction, "warehouse_total_received", { amount: totalEarned })}**`,
        )
        .setTimestamp();

      await interaction.user.send({ embeds: [dmEmbed] });
    } catch (error) {
      console.log("Could not send DM to user");
    }

    await msg.reply(
      `${getEmoji("check")} **${t(interaction, "warehouse_sale_confirmed")}**\n\n` +
        `${resource.emoji} **${t(interaction, "warehouse_sold_items", { amount, resource: resource.name })}**\n` +
        `${getEmoji("moneybag")} ${t(interaction, "warehouse_received_dm", { amount: totalEarned })}`,
    );
  });

  collector.on("end", (collected: { size: number }) => {
    if (collected.size === 0) {
      interaction.followUp({
        content: `${getEmoji("timer")} ${t(interaction, "warehouse_timeout")}`,
        ephemeral: true,
      });
    }
  });
}

async function handleBuyInteraction(
  interaction: StringSelectMenuInteraction,
  resourceId: string,
  resource: (typeof WAREHOUSE_RESOURCES)[keyof typeof WAREHOUSE_RESOURCES],
) {
  const stock = getStock(resourceId);
  const silverEmoji = getEmoji("silver_coin");
  const cancelEmoji = getEmoji("cancel");

  if (stock === 0) {
    await interaction.reply({
      content: `${cancelEmoji} ${t(interaction, "warehouse_out_of_stock", { resource: `${resource.emoji} **${resource.name}**` })}`,
      ephemeral: true,
    });
    return;
  }

  await interaction.reply({
    content:
      `${getEmoji("briefcase")} **${t(interaction, "warehouse_buy_title", { resource: `${resource.emoji} ${resource.name}` })}**\n\n` +
      `${t(interaction, "warehouse_available_stock")}: **${stock}** ${t(interaction, "warehouse_units")}\n` +
      `${t(interaction, "warehouse_price")}: **${getPrice(resourceId, "buy")}** ${silverEmoji} ${t(interaction, "warehouse_each")}\n\n` +
      `${t(interaction, "warehouse_enter_amount", { action: t(interaction, "warehouse_action_buy") })}`,
    ephemeral: false,
  });

  if (
    !interaction.channel ||
    !("createMessageCollector" in interaction.channel)
  ) {
    return;
  }

  const filter = (m: { author: { id: string } }) =>
    m.author.id === interaction.user.id;
  const collector = interaction.channel.createMessageCollector({
    filter,
    time: 60000,
    max: 1,
  });

  collector.on("collect", async (msg) => {
    if (
      msg.content.toLowerCase() === "cancelar" ||
      msg.content.toLowerCase() === "cancel"
    ) {
      await msg.reply(
        `${cancelEmoji} ${t(interaction, "warehouse_action_buy", {})} ${t(interaction, "warehouse_cancelled")}`,
      );
      return;
    }

    const amount = parseInt(msg.content);

    if (isNaN(amount) || amount <= 0) {
      await msg.reply(
        `${cancelEmoji} ${t(interaction, "warehouse_invalid_amount")}`,
      );
      return;
    }

    if (amount > stock) {
      await msg.reply(
        `${cancelEmoji} ${t(interaction, "warehouse_insufficient_stock", { amount, stock })}`,
      );
      return;
    }

    const buyPrice = getPrice(resourceId, "buy");
    const totalCost = amount * buyPrice;

    const userSilver = getUserSilver(interaction.user.id);

    if (userSilver < totalCost) {
      await msg.reply(
        `${cancelEmoji} ${t(interaction, "warehouse_insufficient_silver", { needed: totalCost, current: userSilver })}`,
      );
      return;
    }

    const success = removeStock(resourceId, amount);
    if (!success) {
      await msg.reply(
        `${cancelEmoji} ${t(interaction, "warehouse_error_processing", { action: t(interaction, "warehouse_action_buy") })}`,
      );
      return;
    }

    await addItem(interaction.user.id, resourceId, amount);
    recordTransaction(interaction.user.id, "buy", resourceId, amount, buyPrice);

    await removeUserSilver(interaction.user.id, totalCost);
    addTreasury(totalCost);

    await msg.reply(
      `${getEmoji("check")} **${t(interaction, "warehouse_purchase_confirmed")}**\n\n` +
        `${resource.emoji} **${t(interaction, "warehouse_bought_items", { amount, resource: resource.name })}**\n` +
        `${getEmoji("currency")} ${t(interaction, "warehouse_total_paid", { amount: totalCost })}\n\n` +
        `${t(interaction, "warehouse_added_inventory")}`,
    );
  });

  collector.on("end", (collected: { size: number }) => {
    if (collected.size === 0) {
      interaction.followUp({
        content: `${getEmoji("timer")} ${t(interaction, "warehouse_timeout")}`,
        ephemeral: true,
      });
    }
  });
}

export default Object.assign(command, {
  handleWarehouseButtons,
  handleWarehouseSelects,
});
