import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
  Colors,
} from "discord.js";
import { getUserWarns } from "../../utils/warnManager";

export const data = new SlashCommandBuilder()
  .setName("warnings")
  .setDescription("🤠 Ver os avisos de um membro")
  .setDescriptionLocalizations({
    "en-US": "🤠 View warnings of a member",
    "es-ES": "🤠 Ver advertencias de un miembro",
  })
  .addUserOption((option) =>
    option
      .setName("usuario")
      .setNameLocalizations({
        "en-US": "user",
        "es-ES": "usuario",
      })
      .setDescription("O membro para ver os avisos")
      .setDescriptionLocalizations({
        "en-US": "The member to check warnings",
        "es-ES": "El miembro para ver advertencias",
      })
      .setRequired(false),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .setDMPermission(false);

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) {
    return interaction.reply({
      content: "❌ Este comando só pode ser usado em servidores!",
      ephemeral: true,
    });
  }

  const target = interaction.options.getUser("usuario") || interaction.user;
  const warns = getUserWarns(target.id, interaction.guild.id);

  if (warns.length === 0) {
    return interaction.reply({
      content: `✅ ${target.id === interaction.user.id ? "Você não possui" : `${target} não possui`} nenhum aviso!`,
      ephemeral: true,
    });
  }

  const embed = new EmbedBuilder()
    .setColor(Colors.Orange)
    .setTitle(`⚠️ Avisos de ${target.tag}`)
    .setDescription(`Total de avisos: **${warns.length}**`)
    .setThumbnail(target.displayAvatarURL())
    .setTimestamp();

  const warnsText = warns
    .slice(0, 10)
    .map((warn, index) => {
      const date = new Date(warn.timestamp);
      return `**${index + 1}.** <t:${Math.floor(warn.timestamp / 1000)}:R>\n📝 ${warn.reason}\n🆔 \`${warn.warnId}\``;
    })
    .join("\n\n");

  embed.addFields({
    name: "📋 Histórico de Avisos",
    value: warnsText,
  });

  if (warns.length > 10) {
    embed.setFooter({ text: `Mostrando 10 de ${warns.length} avisos` });
  }

  await interaction.reply({ embeds: [embed], ephemeral: true });
}
