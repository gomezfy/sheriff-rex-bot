import { ButtonInteraction, StringSelectMenuInteraction } from "discord.js";

type ButtonHandler = (interaction: ButtonInteraction) => Promise<void>;
type SelectMenuHandler = (interaction: StringSelectMenuInteraction) => Promise<void>;

interface ButtonPattern {
  pattern: RegExp;
  handler: ButtonHandler;
  description?: string;
}

interface SelectMenuPattern {
  pattern: RegExp;
  handler: SelectMenuHandler;
  description?: string;
}

export class ComponentRegistry {
  private buttonHandlers: Map<string, ButtonHandler> = new Map();
  private buttonPatterns: ButtonPattern[] = [];
  private selectMenuHandlers: Map<string, SelectMenuHandler> = new Map();
  private selectMenuPatterns: SelectMenuPattern[] = [];

  registerButton(customId: string, handler: ButtonHandler, description?: string): void {
    this.buttonHandlers.set(customId, handler);
  }

  registerButtonPattern(
    pattern: RegExp,
    handler: ButtonHandler,
    description?: string,
  ): void {
    this.buttonPatterns.push({ pattern, handler, description });
  }

  registerSelectMenu(
    customId: string,
    handler: SelectMenuHandler,
    description?: string,
  ): void {
    this.selectMenuHandlers.set(customId, handler);
  }

  registerSelectMenuPattern(
    pattern: RegExp,
    handler: SelectMenuHandler,
    description?: string,
  ): void {
    this.selectMenuPatterns.push({ pattern, handler, description });
  }

  async handleButton(interaction: ButtonInteraction): Promise<boolean> {
    const customId = interaction.customId;

    const exactHandler = this.buttonHandlers.get(customId);
    if (exactHandler) {
      await exactHandler(interaction);
      return true;
    }

    for (const { pattern, handler } of this.buttonPatterns) {
      if (pattern.test(customId)) {
        await handler(interaction);
        return true;
      }
    }

    return false;
  }

  async handleSelectMenu(interaction: StringSelectMenuInteraction): Promise<boolean> {
    const customId = interaction.customId;

    const exactHandler = this.selectMenuHandlers.get(customId);
    if (exactHandler) {
      await exactHandler(interaction);
      return true;
    }

    for (const { pattern, handler } of this.selectMenuPatterns) {
      if (pattern.test(customId)) {
        await handler(interaction);
        return true;
      }
    }

    return false;
  }

  unregisterButton(customId: string): void {
    this.buttonHandlers.delete(customId);
  }

  unregisterSelectMenu(customId: string): void {
    this.selectMenuHandlers.delete(customId);
  }

  getRegisteredButtons(): string[] {
    return Array.from(this.buttonHandlers.keys());
  }

  getRegisteredSelectMenus(): string[] {
    return Array.from(this.selectMenuHandlers.keys());
  }

  clear(): void {
    this.buttonHandlers.clear();
    this.buttonPatterns = [];
    this.selectMenuHandlers.clear();
    this.selectMenuPatterns = [];
  }
}

export const componentRegistry = new ComponentRegistry();
