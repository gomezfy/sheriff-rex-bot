import { ChatInputCommandInteraction, MessageFlags } from "discord.js";
import {
  BotError,
  EconomyError,
  InventoryError,
  DatabaseError,
} from "../types";
import { sanitizeErrorForLogging } from "./security";
import Logger from "./logger";

/**
 * ErrorHandler - Centralized error handling system for bot commands
 *
 * Provides consistent error handling across all commands with:
 * - User-friendly error messages
 * - Secure error logging (sanitized to prevent information leakage)
 * - Support for different interaction states (replied, deferred, new)
 * - Custom error types for different domains (Economy, Inventory, Database)
 *
 * @example
 * ```typescript
 * try {
 *   await someRiskyOperation();
 * } catch (error) {
 *   await ErrorHandler.handleCommandError(error, interaction, 'commandName');
 * }
 * ```
 */
export class ErrorHandler {
  /**
   * Handle command errors and send appropriate response to user
   * @param error - The error that occurred
   * @param interaction - The command interaction
   * @param commandName - The name of the command that failed
   */
  public static async handleCommandError(
    error: unknown,
    interaction: ChatInputCommandInteraction,
    commandName: string,
  ): Promise<void> {
    console.error(`Error executing ${commandName}:`, error);

    // Log the error securely
    if (interaction.guild) {
      Logger.log(interaction.client, interaction.guild.id, "error", {
        command: commandName,
        user: interaction.user,
        error: sanitizeErrorForLogging(error),
      });
    }

    // Determine user-friendly error message
    let userMessage: string;

    if (error instanceof EconomyError) {
      userMessage = `💰 **Economy Error**\n${error.message}`;
    } else if (error instanceof InventoryError) {
      userMessage = `🎒 **Inventory Error**\n${error.message}`;
    } else if (error instanceof DatabaseError) {
      userMessage = `💾 **Database Error**\n${error.message}\n\nPlease try again later.`;
    } else if (error instanceof BotError) {
      userMessage = `⚠️ **Error**\n${error.message}`;
    } else if (error instanceof Error) {
      userMessage = `❌ **An error occurred**\n${error.message}`;
    } else {
      userMessage = "❌ An unexpected error occurred. Please try again later.";
    }

    // Send error message to user
    try {
      if (interaction.replied) {
        // Already replied, can't send error
        console.log(`Cannot send error message - interaction already replied`);
      } else if (interaction.deferred) {
        // Deferred, use editReply
        await interaction.editReply({ content: userMessage });
      } else {
        // Not replied or deferred, use reply
        await interaction.reply({
          content: userMessage,
          flags: MessageFlags.Ephemeral,
        });
      }
    } catch (replyError) {
      console.error("Failed to send error message to user:", replyError);
    }
  }

  /**
   * Wrap an async function with error handling
   * @param fn - The async function to wrap
   * @param commandName - The name of the command
   * @returns Wrapped function with automatic error handling
   */
  public static wrapCommand(
    fn: (interaction: ChatInputCommandInteraction) => Promise<void>,
    commandName: string,
  ): (interaction: ChatInputCommandInteraction) => Promise<void> {
    return async (interaction: ChatInputCommandInteraction): Promise<void> => {
      try {
        await fn(interaction);
      } catch (error) {
        await ErrorHandler.handleCommandError(error, interaction, commandName);
      }
    };
  }

  /**
   * Create a safe error message for users (hides sensitive details)
   * @param error - The error to create message from
   * @returns User-safe error message
   */
  public static getSafeErrorMessage(error: unknown): string {
    if (error instanceof BotError) {
      return error.message;
    } else if (error instanceof Error) {
      // Remove any potential sensitive information
      const safeMessage = error.message
        .replace(/\/home\/[^\s]+/g, "[path]")
        .replace(/token[^\s]*/gi, "[token]")
        .replace(/password[^\s]*/gi, "[password]")
        .replace(/secret[^\s]*/gi, "[secret]");
      return safeMessage;
    }
    return "An unexpected error occurred";
  }

  /**
   * Log error with context
   * @param error - The error to log
   * @param context - Additional context about the error
   */
  public static logError(
    error: unknown,
    context: Record<string, any> = {},
  ): void {
    const errorInfo = {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      type: error instanceof Error ? error.constructor.name : typeof error,
      ...context,
    };

    console.error("Error logged:", JSON.stringify(errorInfo, null, 2));
  }
}

/**
 * Decorator for automatic error handling (TypeScript decorator)
 * Usage: @handleErrors('commandName')
 * @param commandName
 */
export function handleErrors(commandName: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;

    descriptor.value = async function (
      interaction: ChatInputCommandInteraction,
    ) {
      try {
        return await originalMethod.call(this, interaction);
      } catch (error) {
        await ErrorHandler.handleCommandError(error, interaction, commandName);
      }
    };

    return descriptor;
  };
}
