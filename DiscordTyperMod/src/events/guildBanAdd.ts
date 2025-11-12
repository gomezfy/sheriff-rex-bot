import { Events, GuildBan } from "discord.js";
import { logMemberBan } from "../utils/modLogs";

export const name = Events.GuildBanAdd;
export const once = false;

export async function execute(ban: GuildBan) {
  const auditLogs = await ban.guild.fetchAuditLogs({
    limit: 1,
    type: 22,
  });

  const banLog = auditLogs.entries.first();
  const reason = banLog?.reason || undefined;

  await logMemberBan(ban.guild, ban.user, reason);
}
