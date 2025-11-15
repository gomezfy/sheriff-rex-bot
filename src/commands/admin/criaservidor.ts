import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
  Colors,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ChannelType,
} from "discord.js";
import { t } from "../../utils/i18n";
import {
  getAllTemplates,
  getTemplateById,
  ServerTemplate,
} from "../../utils/serverTemplates";

async function cleanupServer(
  interaction: ChatInputCommandInteraction,
  skipChannelId: string,
): Promise<{ channels: number; categories: number; roles: number }> {
  const guild = interaction.guild!;
  let channelsDeleted = 0;
  let categoriesDeleted = 0;
  let rolesDeleted = 0;

  const botMember = await guild.members.fetchMe();
  const botHighestRole = botMember.roles.highest;

  const skipChannel = await guild.channels
    .fetch(skipChannelId)
    .catch(() => null);
  if (!skipChannel) {
    console.warn(
      "⚠️ Could not fetch interaction channel for cleanup - aborting cleanup for safety",
    );
    throw new Error(
      "Could not fetch interaction channel. Cleanup aborted for safety.",
    );
  }

  const skipCategoryId = skipChannel.parentId || null;

  const allChannels = await guild.channels.fetch();

  for (const [id, channel] of allChannels) {
    if (!channel) continue;

    if (id === skipChannelId) continue;

    try {
      if (channel.type === ChannelType.GuildCategory) {
        if (id === skipCategoryId) {
          console.log(
            `Skipping category ${channel.name} because it contains the interaction channel`,
          );
          continue;
        }
        await channel.delete();
        categoriesDeleted++;
      } else {
        await channel.delete();
        channelsDeleted++;
      }
    } catch (error) {
      console.error(`Failed to delete channel ${channel.name}:`, error);
    }
  }

  const allRoles = await guild.roles.fetch();
  for (const [id, role] of allRoles) {
    if (!role) continue;
    if (role.id === guild.id) continue;
    if (role.managed) continue;
    if (role.position >= botHighestRole.position) continue;

    try {
      await role.delete();
      rolesDeleted++;
    } catch (error) {
      console.error(`Failed to delete role ${role.name}:`, error);
    }
  }

  return {
    channels: channelsDeleted,
    categories: categoriesDeleted,
    roles: rolesDeleted,
  };
}

async function createServerFromTemplate(
  interaction: ChatInputCommandInteraction,
  template: ServerTemplate,
): Promise<{
  roles: string[];
  categories: string[];
  channels: string[];
  errors: string[];
}> {
  const guild = interaction.guild!;
  const createdRoles: string[] = [];
  const createdCategories: string[] = [];
  const createdChannels: string[] = [];
  const errors: string[] = [];

  for (const roleData of template.roles) {
    try {
      const role = await guild.roles.create({
        name: roleData.name,
        color: roleData.color,
        hoist: roleData.hoist,
        mentionable: true,
        permissions: roleData.permissions,
        reason: `Criado por /criaservidor - Template: ${template.name}`,
      });

      createdRoles.push(role.name);
      await new Promise((resolve) => setTimeout(resolve, 300));
    } catch (error: any) {
      errors.push(`Cargo "${roleData.name}": ${error.message}`);
    }
  }

  for (const categoryData of template.categories) {
    try {
      const category = await guild.channels.create({
        name: categoryData.name,
        type: ChannelType.GuildCategory,
        reason: `Criado por /criaservidor - Template: ${template.name}`,
      });

      createdCategories.push(category.name);

      for (const channelData of categoryData.channels) {
        try {
          const channel = await guild.channels.create({
            name: channelData.name,
            type: channelData.type as
              | ChannelType.GuildText
              | ChannelType.GuildVoice
              | ChannelType.GuildAnnouncement,
            parent: category.id,
            topic: channelData.topic,
            reason: `Criado por /criaservidor - Template: ${template.name}`,
          });

          createdChannels.push(
            channelData.type === ChannelType.GuildVoice
              ? `🔊 ${channel.name}`
              : `#${channel.name}`,
          );
          await new Promise((resolve) => setTimeout(resolve, 300));
        } catch (error: any) {
          errors.push(`Canal "${channelData.name}": ${error.message}`);
        }
      }
    } catch (error: any) {
      errors.push(`Categoria "${categoryData.name}": ${error.message}`);
    }
  }

  return {
    roles: createdRoles,
    categories: createdCategories,
    channels: createdChannels,
    errors,
  };
}

export = {
  data: new SlashCommandBuilder()
    .setName("criaservidor")
    .setDescription(
      "🏛️ Cria estrutura profissional de servidor com templates prontos",
    )
    .setDescriptionLocalizations({
      "en-US": "🏛️ Create professional server structure with ready templates",
    })
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setContexts([0])
    .setIntegrationTypes([0]),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) {
      await interaction.reply({
        content: "❌ Este comando só pode ser usado em um servidor!",
        ephemeral: true,
      });
      return;
    }

    const templates = getAllTemplates();

    const selectMenuEmbed = new EmbedBuilder()
      .setColor(Colors.Blue)
      .setTitle("🏛️ Criar Servidor - Escolha um Template")
      .setDescription(
        "**Selecione um template profissional abaixo:**\n\n" +
          templates
            .map(
              (t) =>
                `${t.emoji} **${t.name}**\n└ ${t.description}\n└ ${t.roles.length} cargos, ${t.categories.length} categorias`,
            )
            .join("\n\n") +
          "\n\n⚠️ **Atenção:** Você poderá limpar canais e cargos existentes após escolher!",
      )
      .setFooter({ text: "Selecione um template no menu abaixo" })
      .setTimestamp();

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("select_template")
      .setPlaceholder("🎨 Escolha um template...")
      .addOptions(
        templates.map((template) =>
          new StringSelectMenuOptionBuilder()
            .setLabel(template.name)
            .setDescription(template.description.substring(0, 100))
            .setValue(template.id)
            .setEmoji(template.emoji),
        ),
      );

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      selectMenu,
    );

    await interaction.reply({
      embeds: [selectMenuEmbed],
      components: [row],
    });

    const response = await interaction.fetchReply();

    try {
      const selectInteraction = await response.awaitMessageComponent({
        filter: (i) => i.user.id === interaction.user.id,
        time: 120000,
      });

      if (!selectInteraction.isStringSelectMenu()) return;

      const selectedTemplateId = selectInteraction.values[0];
      const selectedTemplate = getTemplateById(selectedTemplateId);

      if (!selectedTemplate) {
        await selectInteraction.update({
          content: "❌ Template não encontrado!",
          embeds: [],
          components: [],
        });
        return;
      }

      const cleanupEmbed = new EmbedBuilder()
        .setColor(Colors.Orange)
        .setTitle("⚠️ Limpar Servidor Existente?")
        .setDescription(
          `**Você quer limpar o servidor antes de criar a nova estrutura?**\n\n` +
            `✅ **Limpar:** Remove TODOS os canais e cargos existentes\n` +
            `❌ **Pular:** Mantém tudo e adiciona a nova estrutura\n\n` +
            `⚠️ **AVISO:** Esta ação não pode ser desfeita!`,
        )
        .setFooter({ text: `Template: ${selectedTemplate.name}` })
        .setTimestamp();

      const confirmRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("cleanup_confirm")
          .setLabel("🗑️ Limpar Servidor")
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId("cleanup_skip")
          .setLabel("✅ Pular Limpeza")
          .setStyle(ButtonStyle.Success),
      );

      await selectInteraction.update({
        embeds: [cleanupEmbed],
        components: [confirmRow],
      });

      let shouldCleanup = false;
      try {
        const buttonResponse = await response.awaitMessageComponent({
          filter: (i) => i.user.id === interaction.user.id,
          time: 60000,
        });

        shouldCleanup = buttonResponse.customId === "cleanup_confirm";
        await buttonResponse.deferUpdate();
      } catch (error) {
        const timeoutEmbed = new EmbedBuilder()
          .setColor(Colors.Red)
          .setTitle("⏱️ Tempo Esgotado")
          .setDescription("Você demorou muito para responder. Tente novamente!")
          .setTimestamp();

        await selectInteraction.editReply({
          embeds: [timeoutEmbed],
          components: [],
        });
        return;
      }

      if (shouldCleanup) {
        const cleaningEmbed = new EmbedBuilder()
          .setColor(Colors.Yellow)
          .setTitle("🧹 Limpando Servidor...")
          .setDescription("Removendo canais e cargos existentes... Aguarde!")
          .setTimestamp();

        await interaction.editReply({
          embeds: [cleaningEmbed],
          components: [],
        });

        const cleanupStats = await cleanupServer(
          interaction,
          interaction.channelId,
        );

        const cleanedEmbed = new EmbedBuilder()
          .setColor(Colors.Green)
          .setTitle("✅ Servidor Limpo!")
          .setDescription(
            `**Removido:**\n` +
              `• ${cleanupStats.channels} canais\n` +
              `• ${cleanupStats.categories} categorias\n` +
              `• ${cleanupStats.roles} cargos`,
          )
          .setTimestamp();

        await interaction.editReply({ embeds: [cleanedEmbed], components: [] });

        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      const creatingEmbed = new EmbedBuilder()
        .setColor(Colors.Blue)
        .setTitle(`${selectedTemplate.emoji} Criando: ${selectedTemplate.name}`)
        .setDescription(
          `**Criando estrutura do servidor...**\n\n` +
            `• ${selectedTemplate.roles.length} cargos\n` +
            `• ${selectedTemplate.categories.length} categorias\n` +
            `• ${selectedTemplate.categories.reduce((sum, cat) => sum + cat.channels.length, 0)} canais\n\n` +
            `⏳ Aguarde, isso pode levar alguns minutos...`,
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [creatingEmbed], components: [] });

      const result = await createServerFromTemplate(
        interaction,
        selectedTemplate,
      );

      const successEmbed = new EmbedBuilder()
        .setColor(Colors.Green)
        .setTitle("✅ Servidor Criado com Sucesso!")
        .setDescription(
          `**Template aplicado:** ${selectedTemplate.emoji} ${selectedTemplate.name}`,
        )
        .addFields(
          {
            name: "👥 Cargos Criados",
            value: result.roles.length > 0 ? result.roles.join(", ") : "Nenhum",
            inline: false,
          },
          {
            name: "📁 Categorias Criadas",
            value:
              result.categories.length > 0
                ? result.categories.join(", ")
                : "Nenhuma",
            inline: false,
          },
          {
            name: "📝 Canais Criados",
            value:
              result.channels.length > 0
                ? result.channels.slice(0, 20).join(", ") +
                  (result.channels.length > 20
                    ? ` +${result.channels.length - 20} mais`
                    : "")
                : "Nenhum",
            inline: false,
          },
        )
        .setFooter({ text: `Solicitado por ${interaction.user.tag}` })
        .setTimestamp();

      if (result.errors.length > 0) {
        successEmbed.addFields({
          name: "⚠️ Erros Encontrados",
          value:
            result.errors.slice(0, 5).join("\n") +
            (result.errors.length > 5
              ? `\n+${result.errors.length - 5} erros`
              : ""),
          inline: false,
        });
      }

      await interaction.editReply({ embeds: [successEmbed], components: [] });
    } catch (error: any) {
      console.error("Error in /criaservidor:", error);

      const errorEmbed = new EmbedBuilder()
        .setColor(Colors.Red)
        .setTitle("❌ Erro ao Criar Servidor")
        .setDescription(error.message || "Erro desconhecido")
        .setFooter({ text: "Tente novamente em alguns minutos" })
        .setTimestamp();

      await interaction.editReply({ embeds: [errorEmbed], components: [] });
    }
  },
};
