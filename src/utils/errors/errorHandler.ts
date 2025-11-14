import {
  ChatInputCommandInteraction,
  ButtonInteraction,
  StringSelectMenuInteraction,
  ModalSubmitInteraction,
} from "discord.js";
import { BaseBotError, CooldownError, InventoryFullError } from "./BaseBotError";
import { t } from "../i18n";

type AnyInteraction =
  | ChatInputCommandInteraction
  | ButtonInteraction
  | StringSelectMenuInteraction
  | ModalSubmitInteraction;

export async function handleInteractionError(
  interaction: AnyInteraction,
  error: unknown,
): Promise<void> {
  console.error(`Error in interaction ${interaction.id}:`, error);

  let errorMessage: string;
  let ephemeral = true;

  if (error instanceof CooldownError) {
    errorMessage = t(interaction, "cooldown", {
      time: formatTime(error.remainingTime),
    });
  } else if (error instanceof InventoryFullError) {
    errorMessage = t(interaction, "inventory_full");
  } else if (error instanceof BaseBotError) {
    errorMessage = error.message;
  } else if (error instanceof Error) {
    errorMessage = t(interaction, "error");
    console.error(`Unexpected error: ${error.stack}`);
  } else {
    errorMessage = t(interaction, "error");
    console.error(`Unknown error:`, error);
  }

  try {
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: errorMessage,
        ephemeral,
      });
    } else {
      await interaction.reply({
        content: errorMessage,
        ephemeral,
      });
    }
  } catch (replyError) {
    console.error("Failed to send error message:", replyError);
  }
}

function formatTime(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

export function logError(context: string, error: unknown): void {
  const timestamp = new Date().toISOString();
  const errorInfo =
    error instanceof Error
      ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        }
      : { raw: error };

  console.error(`[${timestamp}] ${context}:`, errorInfo);
}
