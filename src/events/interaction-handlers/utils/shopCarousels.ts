import {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags,
  ButtonInteraction,
} from 'discord.js';
import {
  getAllBackgrounds,
  getBackgroundById,
  getRarityColor,
  getRarityEmoji,
  userOwnsBackground,
} from '@/utils/backgroundManager';
import {
  getAllFramesTranslated,
  getFrameById,
  getRarityColor as getFrameRarityColor,
  getRarityEmoji as getFrameRarityEmoji,
  userOwnsFrame,
} from '@/utils/frameManager';
import { getUserGold } from '@/utils/dataManager';
import { getInventory } from '@/utils/inventoryManager';
import { getSaloonTokenEmoji } from '@/utils/customEmojis';
import { tUser } from '@/utils/i18n';
import path from 'path';
import fs from 'fs';

export async function showBackgroundCarousel(
  interaction: ButtonInteraction,
  index: number,
  isUpdate: boolean = false,
): Promise<void> {
  const allBackgrounds = getAllBackgrounds();
  const bg = allBackgrounds[index];
  const userTokens = getUserGold(interaction.user.id);
  const owned = userOwnsBackground(interaction.user.id, bg.id);

  const saloonEmoji = getSaloonTokenEmoji();

  const embed = new EmbedBuilder()
    .setColor(getRarityColor(bg.rarity))
    .setTitle(tUser(interaction.user.id, 'bg_shop_title'))
    .setDescription(
      `**${getRarityEmoji(bg.rarity)} ${bg.name}** - ${bg.rarity.toUpperCase()}\n\n${bg.description}\n\n**${tUser(interaction.user.id, 'bg_shop_price')}:** ${bg.free ? tUser(interaction.user.id, 'bg_shop_free') : `${saloonEmoji} ${bg.price.toLocaleString()} ${tUser(interaction.user.id, 'bg_shop_tokens')}`}\n**${tUser(interaction.user.id, 'bg_shop_status')}:** ${owned ? tUser(interaction.user.id, 'bg_shop_owned') : bg.free ? tUser(interaction.user.id, 'bg_shop_available') : userTokens >= bg.price ? tUser(interaction.user.id, 'bg_shop_can_purchase') : tUser(interaction.user.id, 'bg_shop_not_enough')}\n\n**${tUser(interaction.user.id, 'bg_shop_your_tokens')}:** ${saloonEmoji} ${userTokens.toLocaleString()}`,
    )
    .setFooter({
      text: tUser(interaction.user.id, 'bg_shop_footer', {
        current: (index + 1).toString(),
        total: allBackgrounds.length.toString(),
      }),
    })
    .setTimestamp();

  const files = [];
  if (bg.imageUrl) {
    embed.setImage(bg.imageUrl);
  } else {
    const backgroundsDir = path.join(
      process.cwd(),
      'assets',
      'profile-backgrounds',
    );
    const bgPath = path.join(backgroundsDir, bg.filename);

    if (fs.existsSync(bgPath)) {
      const attachment = new AttachmentBuilder(bgPath, {
        name: `preview.${bg.filename.split('.').pop()}`,
      });
      files.push(attachment);
      embed.setImage(`attachment://preview.${bg.filename.split('.').pop()}`);
    }
  }

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`carousel_prev_${index}`)
      .setLabel('◀')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(index === 0),
    new ButtonBuilder()
      .setCustomId(`buy_bg_${bg.id}_${index}`)
      .setLabel(
        owned
          ? tUser(interaction.user.id, 'bg_shop_btn_owned')
          : bg.free
            ? tUser(interaction.user.id, 'bg_shop_btn_claim')
            : 'Comprar',
      )
      .setStyle(
        owned
          ? ButtonStyle.Secondary
          : bg.free
            ? ButtonStyle.Success
            : userTokens >= bg.price
              ? ButtonStyle.Primary
              : ButtonStyle.Danger,
      )
      .setDisabled(owned || (bg.free === false && userTokens < bg.price)),
    new ButtonBuilder()
      .setCustomId(`carousel_next_${index}`)
      .setLabel('▶')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(index === allBackgrounds.length - 1),
  );

  if (isUpdate) {
    await interaction.update({ embeds: [embed], files, components: [row] });
  } else {
    await interaction.reply({
      embeds: [embed],
      files,
      components: [row],
      flags: MessageFlags.Ephemeral,
    });
  }
}

export async function showFrameCarousel(
  interaction: ButtonInteraction,
  index: number,
  isUpdate: boolean = false,
): Promise<void> {
  const allFrames = getAllFramesTranslated(interaction.user.id);
  const frame = allFrames[index];
  const inventory = getInventory(interaction.user.id);
  const userTokens = inventory.items['saloon_token'] || 0;
  const owned = userOwnsFrame(interaction.user.id, frame.id);

  const saloonEmoji = getSaloonTokenEmoji();

  const embed = new EmbedBuilder()
    .setColor(getFrameRarityColor(frame.rarity) as any)
    .setTitle(tUser(interaction.user.id, 'frame_shop_title'))
    .setDescription(
      `**${getFrameRarityEmoji(frame.rarity)} ${frame.name}** - ${frame.rarity.toUpperCase()}\n\n${frame.description}\n\n**${tUser(interaction.user.id, 'frame_shop_price')}:** ${saloonEmoji} ${frame.price.toLocaleString()} ${tUser(interaction.user.id, 'frame_shop_tokens')}\n**${tUser(interaction.user.id, 'frame_shop_status')}:** ${owned ? tUser(interaction.user.id, 'frame_shop_owned') : userTokens >= frame.price ? tUser(interaction.user.id, 'frame_shop_available') : tUser(interaction.user.id, 'frame_shop_not_enough')}\n\n**${tUser(interaction.user.id, 'frame_shop_your_tokens')}:** ${saloonEmoji} ${userTokens.toLocaleString()}`,
    )
    .setImage(frame.imageUrl)
    .setFooter({
      text: tUser(interaction.user.id, 'frame_shop_footer', {
        current: (index + 1).toString(),
        total: allFrames.length.toString(),
      }),
    })
    .setTimestamp();

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`frame_carousel_prev_${index}`)
      .setLabel('◀')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(index === 0),
    new ButtonBuilder()
      .setCustomId(`buy_frame_${frame.id}_${index}`)
      .setLabel(
        owned
          ? tUser(interaction.user.id, 'frame_shop_btn_owned')
          : tUser(interaction.user.id, 'frame_shop_btn_buy'),
      )
      .setStyle(
        owned
          ? ButtonStyle.Secondary
          : userTokens >= frame.price
            ? ButtonStyle.Success
            : ButtonStyle.Danger,
      )
      .setDisabled(owned || userTokens < frame.price),
    new ButtonBuilder()
      .setCustomId(`frame_carousel_next_${index}`)
      .setLabel('▶')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(index === allFrames.length - 1),
  );

  if (isUpdate) {
    await interaction.update({ embeds: [embed], components: [row] });
  } else {
    await interaction.reply({
      embeds: [embed],
      components: [row],
      flags: MessageFlags.Ephemeral,
    });
  }
}
