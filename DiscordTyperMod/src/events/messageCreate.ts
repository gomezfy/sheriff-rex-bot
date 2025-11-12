import { Events, Message } from "discord.js";
import { addXp } from "../utils/xpManager";
import { checkAndGrantRewards } from "../utils/levelRewards";
import { canGainXp } from "../utils/messageThrottler";

export const name = Events.MessageCreate;
export const once = false;

export async function execute(message: Message) {
  if (message.author.bot || !message.guild || !message.member) {
    return;
  }

  if (canGainXp(message.author.id)) {
    const xpAmount = Math.floor(Math.random() * 11) + 15;
    const result = addXp(message.author.id, xpAmount);

    if (result.leveledUp) {
      try {
        const grantedRoles = await checkAndGrantRewards(
          message.member,
          result.newLevel,
        );

        let replyText = `🎉 Parabéns ${message.author}! Você subiu para o nível **${result.newLevel}**!`;

        if (grantedRoles.length > 0) {
          replyText += `\n🎁 Você ganhou ${grantedRoles.length > 1 ? "os roles" : "o role"}: **${grantedRoles.join(", ")}**!`;
        }

        if ("send" in message.channel) {
          const levelUpMessage = await message.channel.send(replyText);
          setTimeout(() => levelUpMessage.delete().catch(() => {}), 10000);
        }
      } catch (error) {
        console.error("Error handling level up:", error);
      }
    }
  }
}
