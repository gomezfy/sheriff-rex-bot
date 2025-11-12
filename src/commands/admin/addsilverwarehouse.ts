import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  MessageFlags,
  EmbedBuilder,
} from "discord.js";
import { addTreasury, getTreasury } from "../../utils/warehouseManager";
import { getEmoji } from "../../utils/customEmojis";
import {
  isOwner,
  MAX_CURRENCY_AMOUNT,
  adminRateLimiter,
} from "../../utils/security";

export default {
  data: new SlashCommandBuilder()
    .setName("addsilverwarehouse")
    .setDescription(
      "👑 [OWNER ONLY] Add silver coins to the warehouse treasury",
    )
    .setDescriptionLocalizations({
      "pt-BR": "👑 [APENAS DONO] Adicionar moedas de prata ao cofre do armazém",
      "es-ES": "👑 [SOLO DUEÑO] Agregar monedas de plata al tesoro del almacén",
    })
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription(
          "Amount of silver coins to add to the warehouse treasury",
        )
        .setDescriptionLocalizations({
          "pt-BR":
            "Quantidade de moedas de prata para adicionar ao cofre do armazém",
          "es-ES":
            "Cantidad de monedas de plata para agregar al tesoro del almacén",
        })
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(MAX_CURRENCY_AMOUNT),
    )
    .setDefaultMemberPermissions(0),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    // Defer reply for better UX
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    // Security: Validate owner
    if (!(await isOwner(interaction))) {
      return;
    }

    // Security: Rate limit admin commands
    if (!adminRateLimiter.canExecute(interaction.user.id)) {
      const remaining = adminRateLimiter.getRemainingCooldown(
        interaction.user.id,
      );
      await interaction.editReply({
        content: `⏰ Aguarde ${(remaining / 1000).toFixed(1)}s antes de usar outro comando admin.`,
      });
      return;
    }

    const amount = interaction.options.getInteger("amount", true);
    const silverEmoji = getEmoji("silver_coin");
    const checkEmoji = getEmoji("check");
    const bankEmoji = getEmoji("bank");

    try {
      // Get current treasury
      const currentTreasury = getTreasury();

      // Add silver to warehouse treasury
      addTreasury(amount);

      // Get new treasury
      const newTreasury = getTreasury();

      // Create confirmation embed
      const embed = new EmbedBuilder()
        .setColor("#2ECC71")
        .setTitle(`${checkEmoji} Prata Adicionada ao Armazém`)
        .setDescription(
          `${bankEmoji} **Cofre do Armazém**\n\n` +
            `**Saldo Anterior:** ${currentTreasury.toLocaleString()} ${silverEmoji}\n` +
            `**Adicionado:** +${amount.toLocaleString()} ${silverEmoji}\n` +
            `**Novo Saldo:** ${newTreasury.toLocaleString()} ${silverEmoji}\n\n` +
            `*O armazém agora pode pagar até **${newTreasury.toLocaleString()}** ${silverEmoji} aos jogadores que vendem recursos!*`,
        )
        .addFields(
          {
            name: "👑 Executado por",
            value: `<@${interaction.user.id}>`,
            inline: true,
          },
          {
            name: "💰 Quantidade",
            value: `${amount.toLocaleString()} ${silverEmoji}`,
            inline: true,
          },
        )
        .setTimestamp()
        .setFooter({ text: "Sheriff Rex Bot - Comando Owner" });

      await interaction.editReply({ embeds: [embed] });

      console.log(
        `[OWNER COMMAND] ${interaction.user.tag} added ${amount} silver to warehouse treasury`,
      );
    } catch (error) {
      console.error("Error adding silver to warehouse:", error);
      await interaction.editReply({
        content: `❌ **Erro ao adicionar prata ao armazém!**\n\nOcorreu um erro ao processar o comando. Verifique os logs.`,
      });
    }
  },
};
