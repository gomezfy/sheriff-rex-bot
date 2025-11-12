import {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
  MessageFlags,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ChannelSelectMenuBuilder,
  ChannelType,
  AttachmentBuilder,
  GuildMember,
} from "discord.js";
import {
  setWelcomeConfig,
  removeWelcomeConfig,
  getWelcomeConfig,
} from "../../utils/dataManager";
import { buildWelcomeEmbed } from "../../utils/welcomeEmbedBuilder";
import { t, getLocale } from "../../utils/i18n";

/**
 * Professional Welcome System Command
 * Minimalist interface with import/export functionality and automatic translations (PT-BR and EN-US)
 */
export default {
  data: new SlashCommandBuilder()
    .setName("welcome")
    .setDescription("🤠 Professional welcome message system")
    .setDescriptionLocalizations({
      "pt-BR": "🤠 Sistema profissional de mensagens de boas-vindas",
    })
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) {
      await interaction.reply({
        content: "❌ This command can only be used in a server!",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const locale = getLocale(interaction);
    const config = getWelcomeConfig(interaction.guild.id);

    // Create main control panel
    const embed = new EmbedBuilder()
      .setColor(config?.enabled ? 0x57f287 : 0x5865f2)
      .setTitle(t(interaction, "welcome_panel_title"))
      .setDescription(t(interaction, "welcome_panel_description"))
      .addFields(
        {
          name: t(interaction, "welcome_status_field"),
          value: config?.enabled
            ? `✅ ${t(interaction, "welcome_status_enabled")}`
            : `❌ ${t(interaction, "welcome_status_disabled")}`,
          inline: true,
        },
        {
          name: t(interaction, "welcome_channel_field"),
          value: config?.channelId
            ? `<#${config.channelId}>`
            : t(interaction, "welcome_not_set"),
          inline: true,
        },
      )
      .setFooter({ text: t(interaction, "welcome_panel_footer") })
      .setTimestamp();

    // Create buttons
    const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("welcome_configure")
        .setLabel(t(interaction, "welcome_btn_configure"))
        .setEmoji("⚙️")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("welcome_view")
        .setLabel(t(interaction, "welcome_btn_view"))
        .setEmoji("👁️")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(!config),
      new ButtonBuilder()
        .setCustomId("welcome_toggle")
        .setLabel(
          config?.enabled
            ? t(interaction, "welcome_btn_disable")
            : t(interaction, "welcome_btn_enable"),
        )
        .setEmoji(config?.enabled ? "❌" : "✅")
        .setStyle(config?.enabled ? ButtonStyle.Danger : ButtonStyle.Success)
        .setDisabled(!config),
    );

    const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("welcome_test")
        .setLabel(t(interaction, "welcome_btn_test"))
        .setEmoji("🧪")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(!config?.enabled),
      new ButtonBuilder()
        .setCustomId("welcome_import")
        .setLabel(t(interaction, "welcome_btn_import"))
        .setEmoji("📥")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("welcome_export")
        .setLabel(t(interaction, "welcome_btn_export"))
        .setEmoji("📤")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(!config),
    );

    const response = await interaction.reply({
      embeds: [embed],
      components: [row1, row2],
      flags: MessageFlags.Ephemeral,
    });

    // Button collector
    const collector = response.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 600_000, // 10 minutes
    });

    collector.on("collect", async (i) => {
      if (i.user.id !== interaction.user.id) {
        await i.reply({
          content: t(interaction, "welcome_error_not_your_panel"),
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      try {
        switch (i.customId) {
          case "welcome_configure":
            await handleConfigure(i);
            break;
          case "welcome_view":
            await handleView(i);
            break;
          case "welcome_toggle":
            await handleToggle(i);
            break;
          case "welcome_test":
            await handleTest(i);
            break;
          case "welcome_import":
            await handleImport(i);
            break;
          case "welcome_export":
            await handleExport(i);
            break;
        }
      } catch (error) {
        console.error("Welcome button error:", error);
        await i.reply({
          content: t(interaction, "welcome_error_generic"),
          flags: MessageFlags.Ephemeral,
        });
      }
    });

    collector.on("end", async () => {
      try {
        await interaction.editReply({ components: [] });
      } catch (error) {
        // Message might have been deleted
      }
    });
  },
};

/**
 * Handle configuration modal
 */
async function handleConfigure(interaction: any): Promise<void> {
  const modal = new ModalBuilder()
    .setCustomId("welcome_config_modal")
    .setTitle(t(interaction, "welcome_modal_title"));

  const currentConfig = getWelcomeConfig(interaction.guild.id);

  const channelInput = new TextInputBuilder()
    .setCustomId("channel_id")
    .setLabel(t(interaction, "welcome_modal_channel_label"))
    .setPlaceholder(t(interaction, "welcome_modal_channel_placeholder"))
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setValue(currentConfig?.channelId || "");

  const messageInput = new TextInputBuilder()
    .setCustomId("message")
    .setLabel(t(interaction, "welcome_modal_message_label"))
    .setPlaceholder(t(interaction, "welcome_modal_message_placeholder"))
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)
    .setValue(
      currentConfig?.message ||
        '{\n  "title": "🤠 Welcome!",\n  "description": "Welcome {@user} to **{server}**!\\n\\nYou are member **#{guild.size}**!",\n  "color": 5865242,\n  "thumbnail": "{user.avatar}",\n  "footer": {"text": "Enjoy the server!", "icon_url": "{guild.icon}"}\n}',
    );

  const imageInput = new TextInputBuilder()
    .setCustomId("image")
    .setLabel(t(interaction, "welcome_modal_image_label"))
    .setPlaceholder(t(interaction, "welcome_modal_image_placeholder"))
    .setStyle(TextInputStyle.Short)
    .setRequired(false)
    .setValue(currentConfig?.image || "");

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(channelInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(messageInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(imageInput),
  );

  await interaction.showModal(modal);

  // Wait for modal submission
  try {
    const submitted = await interaction.awaitModalSubmit({
      time: 300_000, // 5 minutes
      filter: (i: any) =>
        i.customId === "welcome_config_modal" &&
        i.user.id === interaction.user.id,
    });

    const channelId = submitted.fields.getTextInputValue("channel_id").trim();
    const message = submitted.fields.getTextInputValue("message").trim();
    const image = submitted.fields.getTextInputValue("image").trim() || null;

    // Validate channel
    const channel = await interaction.guild.channels
      .fetch(channelId)
      .catch(() => null);
    if (!channel || channel.type !== ChannelType.GuildText) {
      await submitted.reply({
        content: `❌ ${t(interaction, "welcome_error_invalid_channel")}`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // Validate JSON if provided
    if (message.startsWith("{")) {
      try {
        JSON.parse(message);
      } catch {
        await submitted.reply({
          content: `❌ ${t(interaction, "welcome_error_invalid_json")}`,
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
    }

    // Validate image URL if provided
    if (image && !isValidUrl(image)) {
      await submitted.reply({
        content: `❌ ${t(interaction, "welcome_error_invalid_url")}`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // Save configuration
    const config = {
      channelId,
      message,
      image,
      enabled: true,
      updatedAt: Date.now(),
    };

    setWelcomeConfig(interaction.guild.id, config);

    const successEmbed = new EmbedBuilder()
      .setColor(0x57f287)
      .setTitle(`✅ ${t(interaction, "welcome_config_saved")}`)
      .setDescription(t(interaction, "welcome_config_saved_desc"))
      .addFields(
        {
          name: `📢 ${t(interaction, "welcome_channel_field")}`,
          value: `<#${channelId}>`,
          inline: true,
        },
        {
          name: `📝 ${t(interaction, "welcome_message_field")}`,
          value:
            message.length > 100 ? message.substring(0, 100) + "..." : message,
          inline: false,
        },
      )
      .setTimestamp();

    if (image) {
      successEmbed.addFields({
        name: "🖼️ " + t(interaction, "welcome_image_field"),
        value: `[${t(interaction, "welcome_view_image")}](${image})`,
        inline: true,
      });
    }

    await submitted.reply({
      embeds: [successEmbed],
      flags: MessageFlags.Ephemeral,
    });

    // Update original panel
    await updatePanel(interaction);
  } catch (error) {
    // Modal timed out or was cancelled
  }
}

/**
 * Handle view configuration
 */
async function handleView(interaction: any): Promise<void> {
  const config = getWelcomeConfig(interaction.guild.id);

  if (!config) {
    await interaction.reply({
      content: `❌ ${t(interaction, "welcome_not_configured")}`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle(t(interaction, "welcome_current_config"))
    .addFields(
      {
        name: `📊 ${t(interaction, "welcome_status_field")}`,
        value: config.enabled
          ? `✅ ${t(interaction, "welcome_status_enabled")}`
          : `❌ ${t(interaction, "welcome_status_disabled")}`,
        inline: true,
      },
      {
        name: `📢 ${t(interaction, "welcome_channel_field")}`,
        value: `<#${config.channelId}>`,
        inline: true,
      },
      {
        name: `📝 ${t(interaction, "welcome_message_field")}`,
        value:
          "```json\n" +
          (config.message.length > 500
            ? config.message.substring(0, 500) + "..."
            : config.message) +
          "\n```",
        inline: false,
      },
      {
        name: `📋 ${t(interaction, "welcome_placeholders_field")}`,
        value: t(interaction, "welcome_placeholders_list"),
        inline: false,
      },
    )
    .setFooter({ text: t(interaction, "welcome_view_footer") })
    .setTimestamp(config.updatedAt);

  if (config.image) {
    embed.addFields({
      name: "🖼️ " + t(interaction, "welcome_image_field"),
      value: `[${t(interaction, "welcome_view_image")}](${config.image})`,
      inline: true,
    });
    embed.setThumbnail(config.image);
  }

  await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
}

/**
 * Handle toggle enable/disable
 */
async function handleToggle(interaction: any): Promise<void> {
  const config = getWelcomeConfig(interaction.guild.id);

  if (!config) {
    await interaction.reply({
      content: `❌ ${t(interaction, "welcome_not_configured")}`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  config.enabled = !config.enabled;
  config.updatedAt = Date.now();
  setWelcomeConfig(interaction.guild.id, config);

  const embed = new EmbedBuilder()
    .setColor(config.enabled ? 0x57f287 : 0xed4245)
    .setTitle(
      config.enabled
        ? `✅ ${t(interaction, "welcome_enabled_title")}`
        : `❌ ${t(interaction, "welcome_disabled_title")}`,
    )
    .setDescription(
      config.enabled
        ? t(interaction, "welcome_enabled_desc")
        : t(interaction, "welcome_disabled_desc"),
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });

  // Update original panel
  await updatePanel(interaction);
}

/**
 * Handle test message
 */
async function handleTest(interaction: any): Promise<void> {
  const config = getWelcomeConfig(interaction.guild.id);

  if (!config || !config.enabled) {
    await interaction.reply({
      content: `❌ ${t(interaction, "welcome_test_error_disabled")}`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const channel = await interaction.guild.channels
    .fetch(config.channelId)
    .catch(() => null);
  if (!channel || !("send" in channel)) {
    await interaction.reply({
      content: `❌ ${t(interaction, "welcome_error_channel_not_found")}`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  try {
    const member = await interaction.guild.members.fetch(interaction.user.id);
    const messagePayload = buildWelcomeEmbed(config, member);

    await channel.send(messagePayload);

    const embed = new EmbedBuilder()
      .setColor(0x57f287)
      .setTitle(`✅ ${t(interaction, "welcome_test_sent")}`)
      .setDescription(
        `${t(interaction, "welcome_test_sent_desc")} <#${channel.id}>`,
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  } catch (error) {
    console.error("Test welcome error:", error);
    await interaction.reply({
      content: `❌ ${t(interaction, "welcome_test_error")}`,
      flags: MessageFlags.Ephemeral,
    });
  }
}

/**
 * Handle import configuration
 */
async function handleImport(interaction: any): Promise<void> {
  const modal = new ModalBuilder()
    .setCustomId("welcome_import_modal")
    .setTitle(t(interaction, "welcome_import_title"));

  const jsonInput = new TextInputBuilder()
    .setCustomId("json_config")
    .setLabel(t(interaction, "welcome_import_label"))
    .setPlaceholder(t(interaction, "welcome_import_placeholder"))
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(jsonInput),
  );

  await interaction.showModal(modal);

  try {
    const submitted = await interaction.awaitModalSubmit({
      time: 300_000,
      filter: (i: any) =>
        i.customId === "welcome_import_modal" &&
        i.user.id === interaction.user.id,
    });

    const jsonConfig = submitted.fields.getTextInputValue("json_config").trim();

    let config: any;
    try {
      config = JSON.parse(jsonConfig);
    } catch {
      await submitted.reply({
        content: `❌ ${t(interaction, "welcome_error_invalid_json")}`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // Validate required fields
    if (!config.channelId || !config.message) {
      await submitted.reply({
        content: `❌ ${t(interaction, "welcome_import_error_missing")}`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // Validate channel exists
    const channel = await interaction.guild.channels
      .fetch(config.channelId)
      .catch(() => null);
    if (!channel || channel.type !== ChannelType.GuildText) {
      await submitted.reply({
        content: `❌ ${t(interaction, "welcome_error_invalid_channel")}`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    config.enabled = config.enabled !== false;
    config.updatedAt = Date.now();

    setWelcomeConfig(interaction.guild.id, config);

    const successEmbed = new EmbedBuilder()
      .setColor(0x57f287)
      .setTitle(`✅ ${t(interaction, "welcome_import_success")}`)
      .setDescription(t(interaction, "welcome_import_success_desc"))
      .addFields({
        name: `📢 ${t(interaction, "welcome_channel_field")}`,
        value: `<#${config.channelId}>`,
        inline: true,
      })
      .setTimestamp();

    await submitted.reply({
      embeds: [successEmbed],
      flags: MessageFlags.Ephemeral,
    });
    await updatePanel(interaction);
  } catch (error) {
    // Modal timed out
  }
}

/**
 * Handle export configuration
 */
async function handleExport(interaction: any): Promise<void> {
  const config = getWelcomeConfig(interaction.guild.id);

  if (!config) {
    await interaction.reply({
      content: `❌ ${t(interaction, "welcome_not_configured")}`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const jsonString = JSON.stringify(config, null, 2);
  const buffer = Buffer.from(jsonString, "utf-8");
  const attachment = new AttachmentBuilder(buffer, {
    name: `welcome-config-${interaction.guild.id}.json`,
  });

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle(`📤 ${t(interaction, "welcome_export_title")}`)
    .setDescription(t(interaction, "welcome_export_desc"))
    .setTimestamp();

  await interaction.reply({
    embeds: [embed],
    files: [attachment],
    flags: MessageFlags.Ephemeral,
  });
}

/**
 * Update main panel
 */
async function updatePanel(interaction: any): Promise<void> {
  try {
    const config = getWelcomeConfig(interaction.guild.id);

    const embed = new EmbedBuilder()
      .setColor(config?.enabled ? 0x57f287 : 0x5865f2)
      .setTitle(t(interaction, "welcome_panel_title"))
      .setDescription(t(interaction, "welcome_panel_description"))
      .addFields(
        {
          name: t(interaction, "welcome_status_field"),
          value: config?.enabled
            ? `✅ ${t(interaction, "welcome_status_enabled")}`
            : `❌ ${t(interaction, "welcome_status_disabled")}`,
          inline: true,
        },
        {
          name: t(interaction, "welcome_channel_field"),
          value: config?.channelId
            ? `<#${config.channelId}>`
            : t(interaction, "welcome_not_set"),
          inline: true,
        },
      )
      .setFooter({ text: t(interaction, "welcome_panel_footer") })
      .setTimestamp();

    const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("welcome_configure")
        .setLabel(t(interaction, "welcome_btn_configure"))
        .setEmoji("⚙️")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("welcome_view")
        .setLabel(t(interaction, "welcome_btn_view"))
        .setEmoji("👁️")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(!config),
      new ButtonBuilder()
        .setCustomId("welcome_toggle")
        .setLabel(
          config?.enabled
            ? t(interaction, "welcome_btn_disable")
            : t(interaction, "welcome_btn_enable"),
        )
        .setEmoji(config?.enabled ? "❌" : "✅")
        .setStyle(config?.enabled ? ButtonStyle.Danger : ButtonStyle.Success)
        .setDisabled(!config),
    );

    const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("welcome_test")
        .setLabel(t(interaction, "welcome_btn_test"))
        .setEmoji("🧪")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(!config?.enabled),
      new ButtonBuilder()
        .setCustomId("welcome_import")
        .setLabel(t(interaction, "welcome_btn_import"))
        .setEmoji("📥")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("welcome_export")
        .setLabel(t(interaction, "welcome_btn_export"))
        .setEmoji("📤")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(!config),
    );

    // Get the original message
    const originalMessage = await interaction.message.fetch();
    await originalMessage.edit({ embeds: [embed], components: [row1, row2] });
  } catch (error) {
    // Could not update panel
    console.error("Failed to update welcome panel:", error);
  }
}

/**
 * Validate URL
 */
function isValidUrl(string: string): boolean {
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
