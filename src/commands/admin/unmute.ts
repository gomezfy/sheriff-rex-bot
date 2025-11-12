import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
  Colors,
} from "discord.js";
import { unmuteUser } from "../../utils/muteManager";

export const data = new SlashCommandBuilder()
  .setName("unmute")
  .setDescription("🤠 Dessilenciar um membro")
  .setDescriptionLocalizations({
    "en-US": "🤠 Unmute a member",
    "es-ES": "🤠 Desilenciar a un miembro",
  })
  .addUserOption((option) =>
    option
      .setName("usuario")
      .setNameLocalizations({
        "en-US": "user",
        "es-ES": "usuario",
      })
      .setDescription("O membro para dessilenciar")
      .setDescriptionLocalizations({
        "en-US": "The member to unmute",
        "es-ES": "El miembro a desilenciar",
      })
      .setRequired(true),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .setDMPermission(false);

export async function execute(interaction: ChatInputCommandInteraction) {
  const target = interaction.options.getUser("usuario", true);

  if (!interaction.guild) {
    return interaction.reply({
      content: "❌ Este comando só pode ser usado em servidores!",
      ephemeral: true,
    });
  }

  const member = await interaction.guild.members
    .fetch(target.id)
    .catch(() => null);
  if (!member) {
    return interaction.reply({
      content: "❌ Membro não encontrado no servidor!",
      ephemeral: true,
    });
  }

  const result = await unmuteUser(member);

  const embed = new EmbedBuilder()
    .setColor(result.success ? Colors.Green : Colors.Red)
    .setTitle(result.success ? "✅ Membro Dessilenciado" : "❌ Erro")
    .setDescription(
      result.success ? `${target} foi dessilenciado!` : result.message,
    )
    .addFields({
      name: "👮 Moderador",
      value: interaction.user.tag,
    })
    .setThumbnail(target.displayAvatarURL())
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
