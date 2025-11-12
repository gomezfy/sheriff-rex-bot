import { Events, Message, PartialMessage } from "discord.js";
import { logMessageEdit } from "../utils/modLogs";

export const name = Events.MessageUpdate;
export const once = false;

export async function execute(
  oldMessage: Message | PartialMessage,
  newMessage: Message | PartialMessage,
) {
  if (oldMessage.partial) {
    try {
      await oldMessage.fetch();
    } catch (error) {
      return;
    }
  }

  if (newMessage.partial) {
    try {
      await newMessage.fetch();
    } catch (error) {
      return;
    }
  }

  await logMessageEdit(oldMessage as Message, newMessage as Message);
}
