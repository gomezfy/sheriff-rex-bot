import { Events, GuildMember, PartialGuildMember } from "discord.js";
import { logMemberLeave } from "../utils/modLogs";

export const name = Events.GuildMemberRemove;
export const once = false;

export async function execute(member: GuildMember | PartialGuildMember) {
  if (member.partial) {
    try {
      await member.fetch();
    } catch (error) {
      return;
    }
  }

  await logMemberLeave(member as GuildMember);
}
