import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
  Colors,
} from "discord.js";
import { clearWarns, removeWarn } from "../../utils/warnManager";

export const data = new SlashCommandBuilder()
  .setName("clearwarns")
  .setDescription("🤠 Limpar avisos de um membro")
  .setDescriptionLocalizations({
    "en-US": "🤠 Clear warnings from a member",
    "es-ES": "🤠 Limpiar advertencias de un miembro",
  })
  .addUserOption((option) =>
    option
      .setName("usuario")
      .setNameLocalizations({
        "en-US": "user",
        "es-ES": "usuario",
      })
      .setDescription("O membro para limpar os avisos")
      .setDescriptionLocalizations({
        "en-US": "The member to clear warnings",
        "es-ES": "El miembro para limpiar advertencias",
      })
      .setRequired(true),
  )
  .addStringOption((option) =>
    option
      .setName("warn_id")
      .setDescription(
        "ID específico do aviso para remover (opcional - remove apenas um)",
      )
      .setDescriptionLocalizations({
        "en-US": "Specific warn ID to remove (optional - removes only one)",
        "es-ES":
          "ID específico de advertencia para eliminar (opcional - elimina solo uno)",
      })
      .setRequired(false),
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

  const target = interaction.options.getUser("usuario", true);
  const warnId = interaction.options.getString("warn_id");

  let result;
  let description;

  if (warnId) {
    result = removeWarn(target.id, interaction.guild.id, warnId);
    description = result.success
      ? `✅ Um aviso foi removido de ${target}!`
      : result.message;
  } else {
    result = clearWarns(target.id, interaction.guild.id);
    description = `✅ Todos os avisos de ${target} foram limpos!\n📊 Total removido: **${result.clearedCount}**`;
  }

  const embed = new EmbedBuilder()
    .setColor(result.success ? Colors.Green : Colors.Red)
    .setTitle(result.success ? "✅ Avisos Removidos" : "❌ Erro")
    .setDescription(description)
    .addFields({
      name: "👮 Moderador",
      value: interaction.user.tag,
    })
    .setThumbnail(target.displayAvatarURL())
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
