import {
  ButtonInteraction,
  EmbedBuilder,
  MessageFlags,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
} from 'discord.js';
import {
  showBackgroundCarousel,
  showFrameCarousel,
} from '../utils/shopCarousels';
import {
  getAllFrames,
  getFrameById,
  getUserFrames,
  userOwnsFrame,
  purchaseFrame,
  getRarityEmoji as getFrameRarityEmoji,
} from '@/utils/frameManager';
import {
  getAllBackgrounds,
  getBackgroundById,
  getUserBackgrounds,
  purchaseBackground,
  userOwnsBackground,
  getRarityEmoji as getBgRarityEmoji,
} from '@/utils/backgroundManager';
import {
  getInventory,
  saveInventory,
} from '@/utils/inventoryManager';
import { getUserGold } from '@/utils/dataManager';
import { getSaloonTokenEmoji } from '@/utils/customEmojis';
import { tUser } from '@/utils/i18n';

export async function handleShopBackgrounds(
  interaction: ButtonInteraction,
): Promise<void> {
  await showBackgroundCarousel(interaction, 0);
}

export async function handleShopFrames(
  interaction: ButtonInteraction,
): Promise<void> {
  await showFrameCarousel(interaction, 0);
}

export async function handleChangeFrame(
  interaction: ButtonInteraction,
): Promise<void> {
  const userFramesData = getUserFrames(interaction.user.id);
  const ownedFrameIds = userFramesData.ownedFrames;

  if (ownedFrameIds.length === 0) {
    await interaction.reply({
      content:
        '🖼️ Você não possui nenhuma moldura ainda! Visite a loja de molduras para comprar.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const ownedFrames = ownedFrameIds
    .map((id) => getFrameById(id))
    .filter((f) => f !== null);

  if (ownedFrames.length === 0) {
    await interaction.reply({
      content: '❌ Erro ao carregar suas molduras.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const options = [
    new StringSelectMenuOptionBuilder()
      .setLabel('Sem Moldura')
      .setDescription('Remover moldura do perfil')
      .setValue('no_frame')
      .setEmoji('❌'),
    ...ownedFrames.map((frame) =>
      new StringSelectMenuOptionBuilder()
        .setLabel(frame.name)
        .setDescription(frame.description.substring(0, 100))
        .setValue(frame.id)
        .setEmoji(getFrameRarityEmoji(frame.rarity)),
    ),
  ];

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('select_frame')
    .setPlaceholder('Escolha uma moldura...')
    .addOptions(options);

  const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    selectMenu,
  );

  const embed = new EmbedBuilder()
    .setColor('#5865F2')
    .setTitle('🖼️ Selecionar Moldura')
    .setDescription('Escolha uma moldura da sua coleção:')
    .setFooter({ text: 'Seu perfil será atualizado automaticamente' });

  await interaction.reply({
    embeds: [embed],
    components: [row],
    flags: MessageFlags.Ephemeral,
  });
}

export async function handleCarouselNavigation(
  interaction: ButtonInteraction,
): Promise<void> {
  const [_, action, indexStr] = interaction.customId.split('_');
  const currentIndex = parseInt(indexStr);

  if (action === 'next' || action === 'prev') {
    const allBackgrounds = getAllBackgrounds();
    let newIndex = currentIndex;

    if (action === 'next') {
      newIndex = (currentIndex + 1) % allBackgrounds.length;
    } else {
      newIndex = currentIndex - 1;
      if (newIndex < 0) {
        newIndex = allBackgrounds.length - 1;
      }
    }

    await showBackgroundCarousel(interaction, newIndex, true);
  }
}

export async function handleFrameCarouselNavigation(
  interaction: ButtonInteraction,
): Promise<void> {
  const [_, _carousel, action, indexStr] = interaction.customId.split('_');
  const currentIndex = parseInt(indexStr);

  if (action === 'next' || action === 'prev') {
    const allFrames = getAllFrames();
    let newIndex = currentIndex;

    if (action === 'next') {
      newIndex = (currentIndex + 1) % allFrames.length;
    } else {
      newIndex = currentIndex - 1;
      if (newIndex < 0) {
        newIndex = allFrames.length - 1;
      }
    }

    await showFrameCarousel(interaction, newIndex, true);
  }
}

export async function handleBuyFrame(
  interaction: ButtonInteraction,
): Promise<void> {
  const parts = interaction.customId.split('_');
  const frameId = parts.slice(2, -1).join('_');
  const currentIndex = parseInt(parts[parts.length - 1]);
  const frame = getFrameById(frameId);

  if (!frame) {
    await interaction.reply({
      content: '❌ Moldura não encontrada!',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const inventory = getInventory(interaction.user.id);
  const userTokens = inventory.items['saloon_token'] || 0;

  if (userOwnsFrame(interaction.user.id, frameId)) {
    await interaction.update({
      embeds: [
        new EmbedBuilder()
          .setColor('#ED4245')
          .setTitle('❌ Compra Falhou')
          .setDescription('Você já possui esta moldura!')
          .setFooter({ text: 'Retornando para a loja...' }),
      ],
      components: [],
    });

    setTimeout(async () => {
      await showFrameCarousel(interaction, currentIndex, true);
    }, 2000);
    return;
  }

  if (userTokens < frame.price) {
    await interaction.update({
      embeds: [
        new EmbedBuilder()
          .setColor('#ED4245')
          .setTitle('❌ Tokens Insuficientes')
          .setDescription(
            `Você precisa de ${getSaloonTokenEmoji()} ${frame.price.toLocaleString()} Saloon Tokens.\nVocê tem apenas ${getSaloonTokenEmoji()} ${userTokens.toLocaleString()}.`,
          )
          .setFooter({ text: 'Retornando para a loja...' }),
      ],
      components: [],
    });

    setTimeout(async () => {
      await showFrameCarousel(interaction, currentIndex, true);
    }, 2000);
    return;
  }

  inventory.items['saloon_token'] = userTokens - frame.price;
  saveInventory(interaction.user.id, inventory);

  const success = purchaseFrame(interaction.user.id, frameId);

  if (success) {
    await interaction.update({
      embeds: [
        new EmbedBuilder()
          .setColor('#57F287')
          .setTitle('✅ Compra Realizada!')
          .setDescription(`Você comprou a moldura **${frame.name}**!`)
          .addFields(
            { name: '🖼️ Moldura', value: frame.name, inline: true },
            {
              name: '💰 Preço',
              value: `${getSaloonTokenEmoji()} ${frame.price.toLocaleString()}`,
              inline: true,
            },
            {
              name: '💳 Saldo Restante',
              value: `${getSaloonTokenEmoji()} ${(userTokens - frame.price).toLocaleString()}`,
              inline: true,
            },
          )
          .setImage(frame.imageUrl)
          .setFooter({ text: 'Retornando para a loja...' }),
      ],
      components: [],
    });

    setTimeout(async () => {
      await showFrameCarousel(interaction, currentIndex, true);
    }, 3000);
  } else {
    await interaction.update({
      embeds: [
        new EmbedBuilder()
          .setColor('#ED4245')
          .setTitle('❌ Erro na Compra')
          .setDescription('Ocorreu um erro ao processar sua compra.')
          .setFooter({ text: 'Retornando para a loja...' }),
      ],
      components: [],
    });

    setTimeout(async () => {
      await showFrameCarousel(interaction, currentIndex, true);
    }, 2000);
  }
}

export async function handleBuyBackground(
  interaction: ButtonInteraction,
): Promise<void> {
  const parts = interaction.customId.split('_');
  const bgId = parts.slice(2, -1).join('_');
  const currentIndex = parseInt(parts[parts.length - 1]);
  const bg = getBackgroundById(bgId);

  if (!bg) {
    await interaction.reply({
      content: '❌ Background não encontrado!',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const userTokens = getUserGold(interaction.user.id);

  if (userOwnsBackground(interaction.user.id, bgId)) {
    await interaction.update({
      embeds: [
        new EmbedBuilder()
          .setColor('#ED4245')
          .setTitle('❌ Compra Falhou')
          .setDescription('Você já possui este background!')
          .setFooter({ text: 'Retornando para a loja...' }),
      ],
      components: [],
    });

    setTimeout(async () => {
      await showBackgroundCarousel(interaction, currentIndex, true);
    }, 2000);
    return;
  }

  if (!bg.free && userTokens < bg.price) {
    await interaction.update({
      embeds: [
        new EmbedBuilder()
          .setColor('#ED4245')
          .setTitle('❌ Tokens Insuficientes')
          .setDescription(
            `Você precisa de ${getSaloonTokenEmoji()} ${bg.price.toLocaleString()} tokens.\nVocê tem apenas ${getSaloonTokenEmoji()} ${userTokens.toLocaleString()}.`,
          )
          .setFooter({ text: 'Retornando para a loja...' }),
      ],
      components: [],
    });

    setTimeout(async () => {
      await showBackgroundCarousel(interaction, currentIndex, true);
    }, 2000);
    return;
  }

  const result = await purchaseBackground(interaction.user.id, bgId);

  if (result.success) {
    await interaction.update({
      embeds: [
        new EmbedBuilder()
          .setColor('#57F287')
          .setTitle(bg.free ? '✅ Background Obtido!' : '✅ Compra Realizada!')
          .setDescription(`Você ${bg.free ? 'obteve' : 'comprou'} o background **${bg.name}**!`)
          .addFields([
            { name: '🖼️ Background', value: bg.name, inline: true },
            bg.free
              ? { name: '💰 Preço', value: 'Grátis', inline: true }
              : {
                  name: '💰 Preço',
                  value: `${getSaloonTokenEmoji()} ${bg.price.toLocaleString()}`,
                  inline: true,
                },
          ])
          .setFooter({ text: 'Retornando para a loja...' }),
      ],
      components: [],
    });

    setTimeout(async () => {
      await showBackgroundCarousel(interaction, currentIndex, true);
    }, 3000);
  } else {
    await interaction.update({
      embeds: [
        new EmbedBuilder()
          .setColor('#ED4245')
          .setTitle('❌ Erro na Compra')
          .setDescription('Ocorreu um erro ao processar sua compra.')
          .setFooter({ text: 'Retornando para a loja...' }),
      ],
      components: [],
    });

    setTimeout(async () => {
      await showBackgroundCarousel(interaction, currentIndex, true);
    }, 2000);
  }
}
