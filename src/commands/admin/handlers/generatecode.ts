import { ChatInputCommandInteraction, EmbedBuilder, MessageFlags } from "discord.js";
import {
  loadRedemptionCodes,
  saveRedemptionCodes,
  generateRedemptionCode,
  PRODUCTS,
} from "../helpers/redemptionCodes";

const OWNER_ID = process.env.OWNER_ID;

export async function handleGenerateCode(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  if (interaction.user.id !== OWNER_ID) {
    await interaction.reply({
      content: "❌ This command is only available to the bot owner!",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const productId = interaction.options.getString("product", true);

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  try {
    const product = PRODUCTS[productId];
    const code = generateRedemptionCode(productId);

    const redemptionCodes = loadRedemptionCodes();

    redemptionCodes[code] = {
      productId: productId,
      productName: product.name,
      tokens: product.tokens,
      coins: product.coins,
      vip: product.vip,
      background: product.background,
      backpack: product.backpack || false,
      rexBucks: product.rexBucks || 0,
      createdAt: Date.now(),
      createdBy: interaction.user.id,
      redeemed: false,
    };

    saveRedemptionCodes(redemptionCodes);

    const embed = new EmbedBuilder()
      .setColor("#FFD700")
      .setTitle("✅ Redemption Code Generated!")
      .setDescription(`**${product.name}** code created successfully!`)
      .addFields(
        { name: "🔑 Redemption Code", value: `\`${code}\``, inline: false },
        {
          name: "🎫 Saloon Tokens",
          value: `${product.tokens.toLocaleString()}`,
          inline: true,
        },
        {
          name: "🪙 Silver Coins",
          value: `${product.coins.toLocaleString()}`,
          inline: true,
        },
        { name: "\u200b", value: "\u200b", inline: true },
      )
      .setFooter({ text: "This code can be redeemed once using /redeem" })
      .setTimestamp();

    if (product.vip) {
      embed.addFields({
        name: "🌟 VIP Status",
        value: "Included",
        inline: true,
      });
    }

    if (product.background) {
      embed.addFields({
        name: "🎨 Exclusive Background",
        value: "Included",
        inline: true,
      });
    }

    if (product.backpack) {
      const capacity =
        typeof product.backpack === "number" ? product.backpack : 500;
      embed.addFields({
        name: "🎒 Backpack Upgrade",
        value: `Capacity: ${capacity}kg`,
        inline: true,
      });
    }

    if (product.rexBucks && product.rexBucks > 0) {
      embed.addFields({
        name: "💵 RexBucks",
        value: `${product.rexBucks.toLocaleString()} RexBucks`,
        inline: true,
      });
    }

    await interaction.editReply({ embeds: [embed] });

    console.log(
      `📝 Code generated: ${code} for ${product.name} by ${interaction.user.tag}`,
    );
  } catch (error) {
    console.error("Error generating code:", error);
    await interaction.editReply({
      content: `❌ Error generating code: ${error instanceof Error ? error.message : "Unknown error"}`,
    });
  }
}
