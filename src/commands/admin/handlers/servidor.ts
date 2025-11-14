import { ChatInputCommandInteraction, EmbedBuilder, MessageFlags } from "discord.js";

export async function handleServidor(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  const { guild } = interaction;

  if (!guild) {
    await interaction.reply({
      content: "❌ This command can only be used in a server!",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const embed = new EmbedBuilder()
    .setTitle(`${guild.name} Information`)
    .setThumbnail(guild.iconURL({ size: 256 }))
    .setColor(0x5865f2)
    .addFields(
      { name: "👑 Owner", value: `<@${guild.ownerId}>`, inline: true },
      { name: "👥 Members", value: `${guild.memberCount}`, inline: true },
      {
        name: "📅 Created",
        value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`,
        inline: true,
      },
      {
        name: "💬 Channels",
        value: `${guild.channels.cache.size}`,
        inline: true,
      },
      { name: "🎭 Roles", value: `${guild.roles.cache.size}`, inline: true },
      { name: "😀 Emojis", value: `${guild.emojis.cache.size}`, inline: true },
    )
    .setFooter({ text: `ID: ${guild.id}` })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
