import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
  Colors,
} from "discord.js";
import { addWarn, getUserWarns } from "../../utils/warnManager";
import { logWarn } from "../../utils/modLogs";

export const data = new SlashCommandBuilder()
  .setName("warn")
  .setDescription("🤠 Dar um aviso a um membro do servidor")
  .setDescriptionLocalizations({
    "en-US": "🤠 Warn a server member",
    "es-ES": "🤠 Advertir a un miembro del servidor",
  })
  .addUserOption((option) =>
    option
      .setName("usuario")
      .setNameLocalizations({
        "en-US": "user",
        "es-ES": "usuario",
      })
      .setDescription("O membro que receberá o aviso")
      .setDescriptionLocalizations({
        "en-US": "The member to warn",
        "es-ES": "El miembro a advertir",
      })
      .setRequired(true),
  )
  .addStringOption((option) =>
    option
      .setName("motivo")
      .setNameLocalizations({
        "en-US": "reason",
        "es-ES": "motivo",
      })
      .setDescription("O motivo do aviso")
      .setDescriptionLocalizations({
        "en-US": "The reason for the warning",
        "es-ES": "El motivo de la advertencia",
      })
      .setRequired(true),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .setDMPermission(false);

export async function execute(interaction: ChatInputCommandInteraction) {
  const target = interaction.options.getUser("usuario", true);
  const reason = interaction.options.getString("motivo", true);

  if (!interaction.guild) {
    return interaction.reply({
      content: "❌ Este comando só pode ser usado em servidores!",
      ephemeral: true,
    });
  }

  if (target.bot) {
    return interaction.reply({
      content: "❌ Você não pode dar avisos a bots!",
      ephemeral: true,
    });
  }

  if (target.id === interaction.user.id) {
    return interaction.reply({
      content: "❌ Você não pode dar um aviso a si mesmo, parceiro!",
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

  const result = addWarn(
    target.id,
    interaction.guild.id,
    interaction.user.id,
    reason,
  );

  await logWarn(
    interaction.guild,
    target,
    interaction.user,
    reason,
    result.totalWarns,
  );

  const embed = new EmbedBuilder()
    .setColor(Colors.Orange)
    .setTitle("⚠️ Aviso Aplicado")
    .setDescription(`${target} recebeu um aviso!`)
    .addFields(
      {
        name: "👮 Moderador",
        value: interaction.user.tag,
        inline: true,
      },
      {
        name: "📊 Total de Avisos",
        value: result.totalWarns.toString(),
        inline: true,
      },
      {
        name: "📝 Motivo",
        value: reason,
      },
    )
    .setThumbnail(target.displayAvatarURL())
    .setFooter({ text: `ID do Aviso: ${result.warnId}` })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });

  try {
    const dmEmbed = new EmbedBuilder()
      .setColor(Colors.Orange)
      .setTitle(`⚠️ Você recebeu um aviso em ${interaction.guild.name}`)
      .addFields(
        {
          name: "📝 Motivo",
          value: reason,
        },
        {
          name: "📊 Total de Avisos",
          value: result.totalWarns.toString(),
        },
      )
      .setFooter({ text: "Evite acumular mais avisos para não ser punido!" })
      .setTimestamp();

    await member.send({ embeds: [dmEmbed] });
  } catch (error) {
    // Usuário pode ter DMs desabilitadas
  }
}
