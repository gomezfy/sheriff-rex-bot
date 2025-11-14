import { ButtonInteraction } from 'discord.js';

// Import carousel functions from interactionCreate
// These will need to be moved to a shared location
export async function handleShopBackgrounds(
  interaction: ButtonInteraction,
): Promise<void> {
  // This will call the showBackgroundCarousel function
  // For now, just acknowledge - will be implemented in next step
  await interaction.deferUpdate();
}

export async function handleShopFrames(
  interaction: ButtonInteraction,
): Promise<void> {
  // This will call the showFrameCarousel function
  // For now, just acknowledge - will be implemented in next step
  await interaction.deferUpdate();
}
