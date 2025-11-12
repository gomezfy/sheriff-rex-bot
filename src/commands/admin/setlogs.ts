import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
  Colors,
  ChannelType,
} from "discord.js";
import { setModLogChannel } from "../../utils/modLogs";

export const data = new SlashCommandBuilder()
  .setName("setlogs")
  .setDescription("🤠 Configurar canal de logs de moderação")
  .setDescriptionLocalizations({
    "en-US": "🤠 Set moderation logs channel",
    "es-ES": "🤠 Configurar canal de registros de moderación",
  })
  .addChannelOption((option) =>
    option
      .setName("canal")
      .setNameLocalizations({
        "en-US": "channel",
        "es-ES": "canal",
      })
      .setDescription("O canal para enviar os logs")
      .setDescriptionLocalizations({
        "en-US": "The channel to send logs",
        "es-ES": "El canal para enviar los registros",
      })
      .addChannelTypes(ChannelType.GuildText)
      .setRequired(true),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .setDMPermission(false);

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) {
    return interaction.reply({
      content: "❌ Este comando só pode ser usado em servidores!",
      ephemeral: true,
    });
  }

  const channel = interaction.options.getChannel("canal", true);

  const result = setModLogChannel(interaction.guild.id, channel.id);

  const embed = new EmbedBuilder()
    .setColor(Colors.Green)
    .setTitle("✅ Logs Configurados")
    .setDescription(`Canal de logs de moderação configurado: ${channel}`)
    .addFields(
      {
        name: "📋 Eventos Registrados",
        value: [
          "• Mensagens deletadas",
          "• Mensagens editadas",
          "• Membros entrando",
          "• Membros saindo",
          "• Bans",
          "• Avisos",
          "• Silenciamentos",
        ].join("\n"),
      },
      {
        name: "👮 Configurado por",
        value: interaction.user.tag,
      },
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
