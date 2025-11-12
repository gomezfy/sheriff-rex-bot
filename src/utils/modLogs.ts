import { readData, writeData } from "./database";
import {
  EmbedBuilder,
  TextChannel,
  User,
  GuildMember,
  Message,
  Guild,
  Colors,
} from "discord.js";

export interface ModLogConfig {
  [guildId: string]: {
    channelId: string;
    events: {
      messageDelete: boolean;
      messageEdit: boolean;
      memberJoin: boolean;
      memberLeave: boolean;
      memberBan: boolean;
      memberUnban: boolean;
      memberKick: boolean;
      roleUpdate: boolean;
      channelUpdate: boolean;
      warnAdd: boolean;
      muteAdd: boolean;
    };
  };
}

function getModLogConfig(): ModLogConfig {
  try {
    return readData("mod-logs.json");
  } catch (error) {
    return {};
  }
}

function saveModLogConfig(data: ModLogConfig): void {
  writeData("mod-logs.json", data);
}

export function setModLogChannel(
  guildId: string,
  channelId: string,
): { success: boolean; message: string } {
  const config = getModLogConfig();

  if (!config[guildId]) {
    config[guildId] = {
      channelId,
      events: {
        messageDelete: true,
        messageEdit: true,
        memberJoin: true,
        memberLeave: true,
        memberBan: true,
        memberUnban: true,
        memberKick: true,
        roleUpdate: true,
        channelUpdate: true,
        warnAdd: true,
        muteAdd: true,
      },
    };
  } else {
    config[guildId].channelId = channelId;
  }

  saveModLogConfig(config);
  return {
    success: true,
    message: "✅ Canal de logs configurado com sucesso!",
  };
}

export function getModLogChannel(guildId: string): string | null {
  const config = getModLogConfig();
  return config[guildId]?.channelId || null;
}

export function isEventEnabled(guildId: string, event: string): boolean {
  const config = getModLogConfig();
  if (!config[guildId]) return false;
  return (
    config[guildId].events[event as keyof (typeof config)[string]["events"]] ||
    false
  );
}

export async function logMessageDelete(message: Message): Promise<void> {
  if (!message.guild || message.author.bot) return;

  const channelId = getModLogChannel(message.guild.id);
  if (!channelId || !isEventEnabled(message.guild.id, "messageDelete")) return;

  try {
    const logChannel = message.guild.channels.cache.get(
      channelId,
    ) as TextChannel;
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setColor(Colors.Red)
      .setTitle("🗑️ Mensagem Deletada")
      .setDescription(
        `**Autor:** ${message.author.tag}\n**Canal:** ${message.channel}`,
      )
      .addFields(
        {
          name: "📝 Conteúdo",
          value: message.content || "*[Sem conteúdo de texto]*",
        },
        {
          name: "📅 Data",
          value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
        },
      )
      .setFooter({ text: `ID: ${message.id}` })
      .setTimestamp();

    await logChannel.send({ embeds: [embed] });
  } catch (error) {
    console.error("Error logging message delete:", error);
  }
}

export async function logMessageEdit(
  oldMessage: Message,
  newMessage: Message,
): Promise<void> {
  if (!newMessage.guild || newMessage.author.bot) return;
  if (oldMessage.content === newMessage.content) return;

  const channelId = getModLogChannel(newMessage.guild.id);
  if (!channelId || !isEventEnabled(newMessage.guild.id, "messageEdit")) return;

  try {
    const logChannel = newMessage.guild.channels.cache.get(
      channelId,
    ) as TextChannel;
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setColor(Colors.Yellow)
      .setTitle("✏️ Mensagem Editada")
      .setDescription(
        `**Autor:** ${newMessage.author.tag}\n**Canal:** ${newMessage.channel}\n**[Ir para mensagem](${newMessage.url})**`,
      )
      .addFields(
        {
          name: "📝 Antes",
          value: oldMessage.content?.slice(0, 1000) || "*[Sem conteúdo]*",
        },
        {
          name: "📝 Depois",
          value: newMessage.content?.slice(0, 1000) || "*[Sem conteúdo]*",
        },
      )
      .setFooter({ text: `ID: ${newMessage.id}` })
      .setTimestamp();

    await logChannel.send({ embeds: [embed] });
  } catch (error) {
    console.error("Error logging message edit:", error);
  }
}

export async function logMemberJoin(member: GuildMember): Promise<void> {
  const channelId = getModLogChannel(member.guild.id);
  if (!channelId || !isEventEnabled(member.guild.id, "memberJoin")) return;

  try {
    const logChannel = member.guild.channels.cache.get(
      channelId,
    ) as TextChannel;
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setColor(Colors.Green)
      .setTitle("👋 Membro Entrou")
      .setDescription(`**Usuário:** ${member.user.tag}\n**ID:** ${member.id}`)
      .addFields(
        {
          name: "📅 Conta Criada",
          value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`,
          inline: true,
        },
        {
          name: "📊 Total de Membros",
          value: member.guild.memberCount.toString(),
          inline: true,
        },
      )
      .setThumbnail(member.user.displayAvatarURL())
      .setTimestamp();

    await logChannel.send({ embeds: [embed] });
  } catch (error) {
    console.error("Error logging member join:", error);
  }
}

export async function logMemberLeave(member: GuildMember): Promise<void> {
  const channelId = getModLogChannel(member.guild.id);
  if (!channelId || !isEventEnabled(member.guild.id, "memberLeave")) return;

  try {
    const logChannel = member.guild.channels.cache.get(
      channelId,
    ) as TextChannel;
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setColor(Colors.Orange)
      .setTitle("👋 Membro Saiu")
      .setDescription(`**Usuário:** ${member.user.tag}\n**ID:** ${member.id}`)
      .addFields({
        name: "📊 Total de Membros",
        value: member.guild.memberCount.toString(),
      })
      .setThumbnail(member.user.displayAvatarURL())
      .setTimestamp();

    await logChannel.send({ embeds: [embed] });
  } catch (error) {
    console.error("Error logging member leave:", error);
  }
}

export async function logMemberBan(
  guild: Guild,
  user: User,
  reason?: string,
): Promise<void> {
  const channelId = getModLogChannel(guild.id);
  if (!channelId || !isEventEnabled(guild.id, "memberBan")) return;

  try {
    const logChannel = guild.channels.cache.get(channelId) as TextChannel;
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setColor(Colors.DarkRed)
      .setTitle("🔨 Membro Banido")
      .setDescription(`**Usuário:** ${user.tag}\n**ID:** ${user.id}`)
      .addFields({
        name: "📝 Motivo",
        value: reason || "*Nenhum motivo fornecido*",
      })
      .setThumbnail(user.displayAvatarURL())
      .setTimestamp();

    await logChannel.send({ embeds: [embed] });
  } catch (error) {
    console.error("Error logging member ban:", error);
  }
}

export async function logWarn(
  guild: Guild,
  user: User,
  moderator: User,
  reason: string,
  warnCount: number,
): Promise<void> {
  const channelId = getModLogChannel(guild.id);
  if (!channelId || !isEventEnabled(guild.id, "warnAdd")) return;

  try {
    const logChannel = guild.channels.cache.get(channelId) as TextChannel;
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setColor(Colors.Orange)
      .setTitle("⚠️ Aviso Aplicado")
      .setDescription(
        `**Usuário:** ${user.tag}\n**Moderador:** ${moderator.tag}`,
      )
      .addFields(
        {
          name: "📝 Motivo",
          value: reason,
        },
        {
          name: "📊 Total de Avisos",
          value: warnCount.toString(),
        },
      )
      .setThumbnail(user.displayAvatarURL())
      .setTimestamp();

    await logChannel.send({ embeds: [embed] });
  } catch (error) {
    console.error("Error logging warn:", error);
  }
}

export async function logMute(
  guild: Guild,
  user: User,
  moderator: User,
  reason: string,
  duration: number,
): Promise<void> {
  const channelId = getModLogChannel(guild.id);
  if (!channelId || !isEventEnabled(guild.id, "muteAdd")) return;

  try {
    const logChannel = guild.channels.cache.get(channelId) as TextChannel;
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setColor(Colors.DarkGrey)
      .setTitle("🔇 Membro Silenciado")
      .setDescription(
        `**Usuário:** ${user.tag}\n**Moderador:** ${moderator.tag}`,
      )
      .addFields(
        {
          name: "📝 Motivo",
          value: reason,
        },
        {
          name: "⏱️ Duração",
          value: `${duration} minutos`,
        },
      )
      .setThumbnail(user.displayAvatarURL())
      .setTimestamp();

    await logChannel.send({ embeds: [embed] });
  } catch (error) {
    console.error("Error logging mute:", error);
  }
}
