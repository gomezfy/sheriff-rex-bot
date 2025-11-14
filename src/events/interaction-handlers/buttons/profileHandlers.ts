import {
  ButtonInteraction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  MessageFlags,
  EmbedBuilder,
} from 'discord.js';
import { getUserBackgrounds, getRarityEmoji } from '@/utils/backgroundManager';
import { createPublicProfile } from '@/commands/profile/profile';
import { COLOR_THEMES, getThemeNameLocalized } from '@/utils/profileColorThemes';
import { getLocale } from '@/utils/i18n';

export async function handleEditBio(interaction: ButtonInteraction): Promise<void> {
  const modal = new ModalBuilder()
    .setCustomId('bio_modal')
    .setTitle('Edit Your Bio');

  const bioInput = new TextInputBuilder()
    .setCustomId('bio_text')
    .setLabel('About Me (max 200 characters)')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('A mysterious cowboy wandering the Wild West...')
    .setMaxLength(200)
    .setRequired(true);

  const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(
    bioInput,
  );
  modal.addComponents(firstActionRow);

  await interaction.showModal(modal);
}

export async function handleEditPhrase(
  interaction: ButtonInteraction,
): Promise<void> {
  const modal = new ModalBuilder()
    .setCustomId('phrase_modal')
    .setTitle('Editar Frase do Perfil');

  const phraseInput = new TextInputBuilder()
    .setCustomId('phrase_text')
    .setLabel('Sua frase pessoal (max 100 caracteres)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Ex: O corajoso não teme o desafio...')
    .setMaxLength(100)
    .setRequired(false);

  const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(
    phraseInput,
  );
  modal.addComponents(firstActionRow);

  await interaction.showModal(modal);
}

export async function handleChangeBackground(
  interaction: ButtonInteraction,
): Promise<void> {
  const ownedBackgrounds = getUserBackgrounds(interaction.user.id);

  if (ownedBackgrounds.length === 0) {
    await interaction.reply({
      content:
        '❌ You don\'t own any backgrounds! Click "🛒 Shop Backgrounds" to purchase some.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('select_background')
    .setPlaceholder('Choose a background...')
    .addOptions(
      ownedBackgrounds.map((bg) =>
        new StringSelectMenuOptionBuilder()
          .setLabel(bg.name)
          .setDescription(bg.description.substring(0, 100))
          .setValue(bg.id)
          .setEmoji(getRarityEmoji(bg.rarity)),
      ),
    );

  const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    selectMenu,
  );

  await interaction.reply({
    content: '🖼️ Choose your background:',
    components: [row],
    flags: MessageFlags.Ephemeral,
  });
}

export async function handleProfileShowPublic(
  interaction: ButtonInteraction,
): Promise<void> {
  await createPublicProfile(interaction);
}

export async function handleChangeColors(
  interaction: ButtonInteraction,
): Promise<void> {
  const locale = getLocale(interaction);
  const { t } = await import('@/utils/i18n');
  
  const options = COLOR_THEMES.map((theme) =>
    new StringSelectMenuOptionBuilder()
      .setLabel(getThemeNameLocalized(theme.id, locale))
      .setDescription(theme.name)
      .setValue(theme.id)
      .setEmoji(theme.emoji),
  );

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('select_color_theme')
    .setPlaceholder(t(interaction, 'profile_colors_placeholder'))
    .addOptions(options);

  const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    selectMenu,
  );

  const embed = new EmbedBuilder()
    .setColor('#5865F2')
    .setTitle(t(interaction, 'profile_colors_title'))
    .setDescription(t(interaction, 'profile_colors_desc'))
    .setFooter({ text: t(interaction, 'profile_colors_footer') });

  await interaction.reply({
    embeds: [embed],
    components: [row],
    flags: MessageFlags.Ephemeral,
  });
}
