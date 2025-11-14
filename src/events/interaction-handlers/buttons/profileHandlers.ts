import {
  ButtonInteraction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  MessageFlags,
} from 'discord.js';
import { getUserBackgrounds, getRarityEmoji } from '@/utils/backgroundManager';
import { createPublicProfile } from '@/commands/profile/profile';

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
