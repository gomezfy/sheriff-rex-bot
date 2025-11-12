import { EmbedBuilder, ChatInputCommandInteraction } from "discord.js";

export async function showProgressBar(
  interaction: ChatInputCommandInteraction,
  title: string,
  description: string,
  duration: number,
  color: string = "#B8860B",
): Promise<void> {
  const steps = 10;
  const stepDuration = duration / steps;

  for (let i = 0; i <= steps; i++) {
    const percentage = Math.floor((i / steps) * 100);
    const filledBlocks = Math.floor((i / steps) * 20);
    const emptyBlocks = 20 - filledBlocks;
    const progressBar = "█".repeat(filledBlocks) + "░".repeat(emptyBlocks);

    const embed = new EmbedBuilder()
      .setColor(color as any)
      .setTitle(title)
      .setDescription(`**${description}**\n\n\`${progressBar}\` ${percentage}%`)
      .setTimestamp();

    try {
      if (i === 0) {
        await interaction.editReply({
          embeds: [embed],
          components: [],
          files: [],
        });
      } else {
        await interaction.editReply({ embeds: [embed] });
      }
    } catch (error) {
      console.error("Error updating progress bar:", error);
    }

    if (i < steps) {
      await new Promise((resolve) => setTimeout(resolve, stepDuration));
    }
  }
}

export function createProgressBarString(
  percentage: number,
  length: number = 20,
  fillChar: string = "█",
  emptyChar: string = "░",
): string {
  const filledBlocks = Math.floor((percentage / 100) * length);
  const emptyBlocks = length - filledBlocks;
  return fillChar.repeat(filledBlocks) + emptyChar.repeat(emptyBlocks);
}
