import { ButtonInteraction } from "discord.js";
import { handleTeamCaptureButton } from "@/interactions/teamCaptureButtons";

/**
 * Handle all team capture related button interactions
 */
export async function handleTeamCaptureButtons(
  interaction: ButtonInteraction
): Promise<void> {
  await handleTeamCaptureButton(interaction);
}
