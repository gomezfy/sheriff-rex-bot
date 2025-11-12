import { Events, Message, PartialMessage } from "discord.js";
import { logMessageDelete } from "../utils/modLogs";

export const name = Events.MessageDelete;
export const once = false;

export async function execute(message: Message | PartialMessage) {
  if (message.partial) {
    try {
      await message.fetch();
    } catch (error) {
      return;
    }
  }

  await logMessageDelete(message as Message);
}
