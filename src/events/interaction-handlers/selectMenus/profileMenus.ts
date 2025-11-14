import { StringSelectMenuInteraction, EmbedBuilder } from 'discord.js';
import { setUserColorTheme } from '@/utils/profileManager';
import { getThemeById, getThemeNameLocalized } from '@/utils/profileColorThemes';
import { t, getLocale } from '@/utils/i18n';

export async function handleSelectColorTheme(
  interaction: StringSelectMenuInteraction,
): Promise<void> {
  const selectedThemeId = interaction.values[0];
  const locale = getLocale(interaction);
  const success = setUserColorTheme(interaction.user.id, selectedThemeId);

  if (!success) {
    await interaction.update({
      embeds: [
        new EmbedBuilder()
          .setColor('#ED4245')
          .setTitle('❌ ' + t(interaction, 'error'))
          .setDescription(t(interaction, 'profile_colors_error'))
          .setTimestamp(),
      ],
      components: [],
    });
    return;
  }

  const theme = getThemeById(selectedThemeId);
  const themeName = getThemeNameLocalized(selectedThemeId, locale);

  await interaction.update({
    embeds: [
      new EmbedBuilder()
        .setColor('#57F287')
        .setTitle(`${theme.emoji} ${t(interaction, 'profile_colors_changed')}`)
        .setDescription(
          t(interaction, 'profile_colors_success', { theme: themeName }),
        )
        .setTimestamp(),
    ],
    components: [],
  });
}
