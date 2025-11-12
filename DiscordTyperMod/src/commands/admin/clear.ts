import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
  Colors,
  TextChannel,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("clear")
  .setDescription("🤠 Limpar mensagens do canal")
  .setDescriptionLocalizations({
    "en-US": "🤠 Clear messages from channel",
    "es-ES": "🤠 Limpiar mensajes del canal",
  })
  .addIntegerOption((option) =>
    option
      .setName("quantidade")
      .setNameLocalizations({
        "en-US": "amount",
        "es-ES": "cantidad",
      })
      .setDescription("Número de mensagens para deletar (1-100)")
      .setDescriptionLocalizations({
        "en-US": "Number of messages to delete (1-100)",
        "es-ES": "Número de mensajes para eliminar (1-100)",
      })
      .setMinValue(1)
      .setMaxValue(100)
      .setRequired(true),
  )
  .addUserOption((option) =>
    option
      .setName("usuario")
      .setNameLocalizations({
        "en-US": "user",
        "es-ES": "usuario",
      })
      .setDescription("Deletar apenas mensagens deste usuário (opcional)")
      .setDescriptionLocalizations({
        "en-US": "Delete only messages from this user (optional)",
        "es-ES": "Eliminar solo mensajes de este usuario (opcional)",
      })
      .setRequired(false),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
  .setDMPermission(false);

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild || !interaction.channel) {
    return interaction.reply({
      content: "❌ Este comando só pode ser usado em canais de servidor!",
      ephemeral: true,
    });
  }

  const amount = interaction.options.getInteger("quantidade", true);
  const targetUser = interaction.options.getUser("usuario");

  await interaction.deferReply({ ephemeral: true });

  try {
    const channel = interaction.channel as TextChannel;
    const messages = await channel.messages.fetch({ limit: 100 });

    let messagesToDelete = messages.filter((msg) => {
      const isRecent =
        Date.now() - msg.createdTimestamp < 14 * 24 * 60 * 60 * 1000;
      if (!isRecent) return false;
      if (targetUser) {
        return msg.author.id === targetUser.id;
      }
      return true;
    });

    const limitedMessages = Array.from(messagesToDelete.values()).slice(
      0,
      amount,
    );
    if (limitedMessages.length === 0) {
      return interaction.editReply({
        content: "❌ Nenhuma mensagem encontrada para deletar!",
      });
    }

    await channel.bulkDelete(limitedMessages, true);

    const embed = new EmbedBuilder()
      .setColor(Colors.Green)
      .setTitle("🗑️ Mensagens Deletadas")
      .setDescription(
        `✅ ${limitedMessages.length} mensagem(ns) deletada(s) com sucesso!`,
      )
      .addFields({
        name: "👮 Moderador",
        value: interaction.user.tag,
      })
      .setTimestamp();

    if (targetUser) {
      embed.addFields({
        name: "👤 Filtrado por",
        value: targetUser.tag,
      });
    }

    await interaction.editReply({ embeds: [embed] });
  } catch (error: any) {
    console.error("Error clearing messages:", error);
    await interaction.editReply({
      content: `❌ Erro ao deletar mensagens: ${error.message}`,
    });
  }
}
