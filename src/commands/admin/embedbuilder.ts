import {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
  MessageFlags,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ComponentType,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ChannelType,
  TextChannel,
  ColorResolvable,
  ButtonInteraction,
  ModalSubmitInteraction,
  StringSelectMenuInteraction,
  Message,
} from "discord.js";
import { t } from "../../utils/i18n";
import {
  EMBED_TEMPLATES,
  getTemplateById,
  getTemplateName,
} from "../../utils/embeds/embedTemplates";
import {
  validateURL,
  validateImageURL,
  validateEmbedLimits,
} from "./embedbuilder/validation";
import { getIconEmoji } from "../../utils/iconManager";

interface EmbedData {
  title?: string;
  description?: string;
  color?: string;
  authorName?: string;
  authorIcon?: string;
  authorUrl?: string;
  thumbnail?: string;
  image?: string;
  footerText?: string;
  footerIcon?: string;
  timestamp?: boolean;
  url?: string;
  fields: Array<{ name: string; value: string; inline: boolean }>;
}

interface SessionData {
  embedData: EmbedData;
  channel: TextChannel;
  interaction: ChatInputCommandInteraction;
  userId: string;
  timeoutId?: NodeJS.Timeout;
  warningTimeoutId?: NodeJS.Timeout;
  collector?: any;
  replyMessage?: any;
  interactionChannel?: any;
}

const COLOR_PRESETS: Record<string, { name: string; hex: string }> = {
  blue: { name: "🔵 Discord Blue", hex: "#5865F2" },
  green: { name: "🟢 Success Green", hex: "#57F287" },
  red: { name: "🔴 Danger Red", hex: "#ED4245" },
  yellow: { name: "🟡 Warning Yellow", hex: "#FEE75C" },
  purple: { name: "🟣 Purple", hex: "#9B59B6" },
  orange: { name: "🟠 Orange", hex: "#E67E22" },
  pink: { name: "💗 Pink", hex: "#EB459E" },
  cyan: { name: "🩵 Cyan", hex: "#00D9FF" },
  lime: { name: "💚 Lime", hex: "#00FF7F" },
  brown: { name: "🟤 Brown (Western)", hex: "#8B4513" },
  gold: { name: "🏆 Gold (Western)", hex: "#D4A017" },
  crimson: { name: "❤️ Crimson (Western)", hex: "#8B0000" },
  tan: { name: "🎨 Tan (Western)", hex: "#D2B48C" },
  darkgreen: { name: "🌲 Dark Green", hex: "#2F4F2F" },
  gray: { name: "⚫ Gray", hex: "#99AAB5" },
  white: { name: "⚪ White", hex: "#FFFFFF" },
  black: { name: "⬛ Black", hex: "#000000" },
  navy: { name: "🔷 Navy", hex: "#000080" },
  teal: { name: "🩵 Teal", hex: "#008080" },
  magenta: { name: "💜 Magenta", hex: "#FF00FF" },
};

const embedSessions = new Map<string, SessionData>();

const SESSION_TIMEOUT = 1800000; // 30 minutos
const WARNING_TIME = 1500000; // 25 minutos (5 min antes de expirar)

function resetSessionTimeout(sessionId: string): void {
  const session = embedSessions.get(sessionId);
  if (!session) return;

  // Limpar timeouts anteriores
  if (session.timeoutId) {
    clearTimeout(session.timeoutId);
  }
  if (session.warningTimeoutId) {
    clearTimeout(session.warningTimeoutId);
  }

  // Aviso 5 minutos antes de expirar
  session.warningTimeoutId = setTimeout(async () => {
    const sess = embedSessions.get(sessionId);
    if (sess) {
      try {
        const user = await sess.interaction.client.users.fetch(sess.userId);
        await user.send(
          `⚠️ **Aviso de Inatividade - /embedbuilder**\n\nSua sessão de edição do embed expirará em 5 minutos. Faça qualquer edição para renovar o tempo.`,
        );
      } catch (error) {
        // Se DM falhar, envia mensagem no canal
        try {
          if (sess.interactionChannel) {
            await sess.interactionChannel.send(
              `<@${sess.userId}> ⚠️ Sua sessão de edição do embed expirará em 5 minutos! Faça qualquer edição para renovar.`,
            );
          }
        } catch (channelError) {
          console.error("Failed to send warning message:", channelError);
        }
      }
    }
  }, WARNING_TIME);

  // Timeout final
  session.timeoutId = setTimeout(async () => {
    const sess = embedSessions.get(sessionId);
    if (sess) {
      try {
        if (sess.replyMessage) {
          // Edita mensagem followUp diretamente (não-ephemeral, funciona indefinidamente)
          await sess.replyMessage.edit({
            content: `⏰ **Sessão Expirada**\n\nSua sessão de edição expirou após 30 minutos de inatividade. Use \`/embedbuilder\` novamente para criar um novo embed.`,
            embeds: [],
            components: [],
          });
        }
      } catch (error) {
        console.error("Error updating expired session message:", error);
      }
      if (sess.collector) sess.collector.stop();
      embedSessions.delete(sessionId);
    }
  }, SESSION_TIMEOUT);
}

export default {
  data: new SlashCommandBuilder()
    .setName("embedbuilder")
    .setDescription("Create professional embeds")
    .setDescriptionLocalizations({
      "pt-BR": "Criar embeds profissionais",
    })
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Channel to send the embed")
        .setDescriptionLocalizations({
          "pt-BR": "Canal para enviar o embed",
        })
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true),
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const channel = interaction.options.getChannel(
      "channel",
      true,
    ) as TextChannel;

    if (!channel || !("send" in channel)) {
      await interaction.reply({
        content: t(interaction, "eb_invalid_channel"),
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const sessionId = `${interaction.user.id}-${Date.now()}`;
    const embedData: EmbedData = {
      fields: [],
      timestamp: true,
      color: "#5865F2",
    };

    const previewEmbed = buildPreviewEmbed(embedData, interaction);
    const components = buildComponents(sessionId, embedData, interaction);

    // Reply ephemeral simples
    await interaction.reply({
      content: `✨ **${t(interaction, "eb_title")}**\n\n📝 **Editor Avançado de Embeds**\nUse os botões abaixo para criar seu embed personalizado.\n\n⏰ Sessão expira em 30 minutos de inatividade\n💡 Suporta imagens, campos, cores personalizadas e mais!`,
      flags: MessageFlags.Ephemeral,
    });

    // FollowUp não-ephemeral com preview (pode ser editado indefinidamente)
    const previewMessage = await interaction.followUp({
      content: `🔍 **${t(interaction, "eb_preview")}** | Canal de destino: ${channel}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      embeds: [previewEmbed],
      components,
    });

    embedSessions.set(sessionId, {
      embedData,
      channel,
      interaction,
      userId: interaction.user.id,
      replyMessage: previewMessage,
      interactionChannel: interaction.channel,
    });

    resetSessionTimeout(sessionId);
    setupCollectors(sessionId);
  },
};

function buildComponents(
  sessionId: string,
  embedData: EmbedData,
  interaction: ChatInputCommandInteraction,
): ActionRowBuilder<ButtonBuilder>[] {
  // ━━━ LINHA 1: 📝 EDITAR CONTEÚDO (3 botões) ━━━
  const rowContent = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`eb_basic_${sessionId}`)
      .setLabel("Conteúdo")
      .setStyle(ButtonStyle.Primary)
      .setEmoji(getIconEmoji("eb_basic")),
    new ButtonBuilder()
      .setCustomId(`eb_author_${sessionId}`)
      .setLabel("Autor")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji(getIconEmoji("eb_author")),
    new ButtonBuilder()
      .setCustomId(`eb_footer_${sessionId}`)
      .setLabel("Rodapé")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji(getIconEmoji("eb_footer")),
  );

  // ━━━ LINHA 2: 🎨 ESTILO & CAMPOS (5 botões) ━━━
  const rowStyle = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`eb_color_${sessionId}`)
      .setLabel("Cor")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji(getIconEmoji("eb_color")),
    new ButtonBuilder()
      .setCustomId(`eb_images_${sessionId}`)
      .setLabel("Imagens")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji(getIconEmoji("eb_images")),
    new ButtonBuilder()
      .setCustomId(`eb_timestamp_${sessionId}`)
      .setLabel(embedData.timestamp ? "⏱️ Remover" : "🕐 Timestamp")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji(embedData.timestamp ? "⏱" : "🕐"),
    new ButtonBuilder()
      .setCustomId(`eb_addfield_${sessionId}`)
      .setLabel("➕ Campo")
      .setStyle(ButtonStyle.Success)
      .setEmoji(getIconEmoji("eb_addfield")),
    new ButtonBuilder()
      .setCustomId(`eb_managefields_${sessionId}`)
      .setLabel(`Campos (${embedData.fields.length})`)
      .setStyle(embedData.fields.length > 0 ? ButtonStyle.Primary : ButtonStyle.Secondary)
      .setEmoji(getIconEmoji("eb_managefields"))
      .setDisabled(embedData.fields.length === 0),
  );

  // ━━━ LINHA 3: 🔧 FERRAMENTAS (4 botões) ━━━
  const rowTools = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`eb_template_${sessionId}`)
      .setLabel("Templates")
      .setStyle(ButtonStyle.Primary)
      .setEmoji(getIconEmoji("eb_template")),
    new ButtonBuilder()
      .setCustomId(`eb_import_${sessionId}`)
      .setLabel("Importar")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji(getIconEmoji("eb_import")),
    new ButtonBuilder()
      .setCustomId(`eb_export_${sessionId}`)
      .setLabel("Exportar")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji(getIconEmoji("eb_export")),
    new ButtonBuilder()
      .setCustomId(`eb_clear_${sessionId}`)
      .setLabel("Limpar")
      .setStyle(ButtonStyle.Danger)
      .setEmoji(getIconEmoji("eb_clear")),
  );

  // ━━━ LINHA 4: ✅ AÇÕES FINAIS (2 botões) ━━━
  const rowActions = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`eb_send_${sessionId}`)
      .setLabel("Enviar Embed")
      .setStyle(ButtonStyle.Success)
      .setEmoji(getIconEmoji("eb_send")),
    new ButtonBuilder()
      .setCustomId(`eb_cancel_${sessionId}`)
      .setLabel("Cancelar")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji(getIconEmoji("eb_cancel")),
  );

  return [rowContent, rowStyle, rowTools, rowActions];
}

async function updatePreview(sessionId: string): Promise<void> {
  const session = embedSessions.get(sessionId);
  if (!session) return;

  const { embedData, channel, interaction, replyMessage } = session;
  const previewEmbed = buildPreviewEmbed(embedData, interaction);
  const components = buildComponents(sessionId, embedData, interaction);

  const statsEmoji = embedData.fields.length > 0 ? "✏️" : "📝";
  const imageEmoji = (embedData.image || embedData.thumbnail) ? "🖼️" : "";
  const content = `🔍 **${t(interaction, "eb_preview")}** | Canal de destino: ${channel}\n${statsEmoji} ${embedData.fields.length} campos ${imageEmoji}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

  try {
    // Edita mensagem followUp não-ephemeral diretamente (funciona indefinidamente)
    await replyMessage.edit({
      content,
      embeds: [previewEmbed],
      components,
    });
  } catch (error) {
    console.error("Error updating preview:", error);
  }
}

async function setupCollectors(sessionId: string): Promise<void> {
  const session = embedSessions.get(sessionId);
  if (!session) return;

  const { userId, replyMessage } = session;

  const buttonCollector = replyMessage.createMessageComponentCollector({
    componentType: ComponentType.Button,
  });

  session.collector = buttonCollector;

  buttonCollector.on("collect", async (i: ButtonInteraction) => {
    if (i.user.id !== userId) {
      await i.reply({
        content: t(i, "eb_only_author"),
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const action = i.customId.split("_")[1];

    if (action === "basic") {
      await handleBasicModal(i, sessionId);
    } else if (action === "author") {
      await handleAuthorModal(i, sessionId);
    } else if (action === "images") {
      await handleImagesModal(i, sessionId);
    } else if (action === "footer") {
      await handleFooterModal(i, sessionId);
    } else if (action === "addfield") {
      await handleFieldModal(i, sessionId);
    } else if (action === "managefields") {
      await handleManageFieldsMenu(i, sessionId);
    } else if (action === "template") {
      await handleTemplateMenu(i, sessionId);
    } else if (action === "color") {
      await handleColorMenu(i, sessionId);
    } else if (action === "timestamp") {
      await handleTimestamp(i, sessionId);
    } else if (action === "clear") {
      await handleClear(i, sessionId);
    } else if (action === "import") {
      await handleImportJson(i, sessionId);
    } else if (action === "export") {
      await handleExportJson(i, sessionId);
    } else if (action === "send") {
      await handleSend(i, sessionId);
      buttonCollector.stop();
    } else if (action === "cancel") {
      await handleCancel(i, sessionId);
      buttonCollector.stop();
    }
  });

  buttonCollector.on("end", () => {
    const sess = embedSessions.get(sessionId);
    if (sess) {
      if (sess.timeoutId) clearTimeout(sess.timeoutId);
      if (sess.warningTimeoutId) clearTimeout(sess.warningTimeoutId);
      embedSessions.delete(sessionId);
    }
  });
}

async function handleBasicModal(
  interaction: ButtonInteraction,
  sessionId: string,
): Promise<void> {
  const session = embedSessions.get(sessionId);
  if (!session) return;

  const { embedData } = session;

  const modal = new ModalBuilder()
    .setCustomId(`eb_basic_modal_${sessionId}`)
    .setTitle(t(interaction, "eb_modal_basic_title"));

  const titleInput = new TextInputBuilder()
    .setCustomId("title")
    .setLabel(t(interaction, "eb_modal_basic_title_label"))
    .setStyle(TextInputStyle.Short)
    .setRequired(false)
    .setMaxLength(256)
    .setPlaceholder(t(interaction, "eb_modal_basic_title_placeholder"));

  if (embedData.title) titleInput.setValue(embedData.title);

  const descriptionInput = new TextInputBuilder()
    .setCustomId("description")
    .setLabel(t(interaction, "eb_modal_basic_desc_label"))
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(false)
    .setMaxLength(4000)
    .setPlaceholder(t(interaction, "eb_modal_basic_desc_placeholder") + " (use \\n para quebra de linha)");

  if (embedData.description) descriptionInput.setValue(embedData.description);

  const urlInput = new TextInputBuilder()
    .setCustomId("url")
    .setLabel(t(interaction, "eb_modal_basic_url_label"))
    .setStyle(TextInputStyle.Short)
    .setRequired(false)
    .setPlaceholder("https://example.com");

  if (embedData.url) urlInput.setValue(embedData.url);

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(titleInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(descriptionInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(urlInput),
  );

  await interaction.showModal(modal);

  const submitted = await interaction
    .awaitModalSubmit({
      time: 300000,
      filter: (i: ModalSubmitInteraction) =>
        i.customId === `eb_basic_modal_${sessionId}`,
    })
    .catch(() => null);

  if (submitted) {
    await submitted.deferUpdate();
    const session = embedSessions.get(sessionId);
    if (session) {
      const title = submitted.fields.getTextInputValue("title").trim();
      const description = submitted.fields
        .getTextInputValue("description")
        .trim();
      const url = submitted.fields.getTextInputValue("url").trim();

      session.embedData.title = title || undefined;
      session.embedData.description = description
        ? description.replace(/\\n/g, "\n")
        : undefined;
      session.embedData.url = url || undefined;

      resetSessionTimeout(sessionId);
      await updatePreview(sessionId);
    }
  }
}

async function handleAuthorModal(
  interaction: ButtonInteraction,
  sessionId: string,
): Promise<void> {
  const session = embedSessions.get(sessionId);
  if (!session) return;

  const { embedData } = session;

  const modal = new ModalBuilder()
    .setCustomId(`eb_author_modal_${sessionId}`)
    .setTitle(t(interaction, "eb_modal_author_title"));

  const nameInput = new TextInputBuilder()
    .setCustomId("name")
    .setLabel(t(interaction, "eb_modal_author_name_label"))
    .setStyle(TextInputStyle.Short)
    .setRequired(false)
    .setMaxLength(256)
    .setPlaceholder(t(interaction, "eb_modal_author_name_placeholder"));

  if (embedData.authorName) nameInput.setValue(embedData.authorName);

  const iconInput = new TextInputBuilder()
    .setCustomId("icon")
    .setLabel(t(interaction, "eb_modal_author_icon_label"))
    .setStyle(TextInputStyle.Short)
    .setRequired(false)
    .setPlaceholder(t(interaction, "eb_modal_author_icon_placeholder"));

  if (embedData.authorIcon) iconInput.setValue(embedData.authorIcon);

  const urlInput = new TextInputBuilder()
    .setCustomId("url")
    .setLabel(t(interaction, "eb_modal_author_url_label"))
    .setStyle(TextInputStyle.Short)
    .setRequired(false)
    .setPlaceholder(t(interaction, "eb_modal_author_url_placeholder"));

  if (embedData.authorUrl) urlInput.setValue(embedData.authorUrl);

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(iconInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(urlInput),
  );

  await interaction.showModal(modal);

  const submitted = await interaction
    .awaitModalSubmit({
      time: 300000,
      filter: (i: ModalSubmitInteraction) =>
        i.customId === `eb_author_modal_${sessionId}`,
    })
    .catch(() => null);

  if (submitted) {
    await submitted.deferUpdate();
    const session = embedSessions.get(sessionId);
    if (session) {
      const name = submitted.fields.getTextInputValue("name").trim();
      const icon = submitted.fields.getTextInputValue("icon").trim();
      const url = submitted.fields.getTextInputValue("url").trim();

      session.embedData.authorName = name || undefined;
      session.embedData.authorIcon = icon || undefined;
      session.embedData.authorUrl = url || undefined;

      resetSessionTimeout(sessionId);
      await updatePreview(sessionId);
    }
  }
}

async function handleImagesModal(
  interaction: ButtonInteraction,
  sessionId: string,
): Promise<void> {
  const session = embedSessions.get(sessionId);
  if (!session) return;

  const { embedData } = session;

  const modal = new ModalBuilder()
    .setCustomId(`eb_images_modal_${sessionId}`)
    .setTitle(t(interaction, "eb_modal_images_title"));

  const thumbnailInput = new TextInputBuilder()
    .setCustomId("thumbnail")
    .setLabel(t(interaction, "eb_modal_images_thumbnail_label"))
    .setStyle(TextInputStyle.Short)
    .setRequired(false)
    .setPlaceholder("https://example.com/image.png ou attachment://file.png");

  if (embedData.thumbnail) thumbnailInput.setValue(embedData.thumbnail);

  const imageInput = new TextInputBuilder()
    .setCustomId("image")
    .setLabel(t(interaction, "eb_modal_images_image_label"))
    .setStyle(TextInputStyle.Short)
    .setRequired(false)
    .setPlaceholder("https://example.com/image.png ou attachment://file.png");

  if (embedData.image) imageInput.setValue(embedData.image);

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(thumbnailInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(imageInput),
  );

  await interaction.showModal(modal);

  const submitted = await interaction
    .awaitModalSubmit({
      time: 300000,
      filter: (i: ModalSubmitInteraction) =>
        i.customId === `eb_images_modal_${sessionId}`,
    })
    .catch(() => null);

  if (submitted) {
    await submitted.deferUpdate();
    const session = embedSessions.get(sessionId);
    if (session) {
      const thumbnail = submitted.fields.getTextInputValue("thumbnail").trim();
      const image = submitted.fields.getTextInputValue("image").trim();

      const thumbnailValidation = validateImageURL(thumbnail);
      const imageValidation = validateImageURL(image);

      if (!thumbnailValidation.valid) {
        await submitted.followUp({
          content: `❌ Invalid thumbnail URL: ${thumbnailValidation.error}`,
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      if (!imageValidation.valid) {
        await submitted.followUp({
          content: `❌ Invalid image URL: ${imageValidation.error}`,
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      session.embedData.thumbnail = thumbnail || undefined;
      session.embedData.image = image || undefined;

      resetSessionTimeout(sessionId);
      await updatePreview(sessionId);
    }
  }
}

async function handleFooterModal(
  interaction: ButtonInteraction,
  sessionId: string,
): Promise<void> {
  const session = embedSessions.get(sessionId);
  if (!session) return;

  const { embedData } = session;

  const modal = new ModalBuilder()
    .setCustomId(`eb_footer_modal_${sessionId}`)
    .setTitle(t(interaction, "eb_modal_footer_title"));

  const textInput = new TextInputBuilder()
    .setCustomId("text")
    .setLabel(t(interaction, "eb_modal_footer_text_label"))
    .setStyle(TextInputStyle.Short)
    .setRequired(false)
    .setMaxLength(2048)
    .setPlaceholder(t(interaction, "eb_modal_footer_text_placeholder"));

  if (embedData.footerText) textInput.setValue(embedData.footerText);

  const iconInput = new TextInputBuilder()
    .setCustomId("icon")
    .setLabel(t(interaction, "eb_modal_footer_icon_label"))
    .setStyle(TextInputStyle.Short)
    .setRequired(false)
    .setPlaceholder(t(interaction, "eb_modal_footer_icon_placeholder"));

  if (embedData.footerIcon) iconInput.setValue(embedData.footerIcon);

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(textInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(iconInput),
  );

  await interaction.showModal(modal);

  const submitted = await interaction
    .awaitModalSubmit({
      time: 300000,
      filter: (i: ModalSubmitInteraction) =>
        i.customId === `eb_footer_modal_${sessionId}`,
    })
    .catch(() => null);

  if (submitted) {
    await submitted.deferUpdate();
    const session = embedSessions.get(sessionId);
    if (session) {
      const text = submitted.fields.getTextInputValue("text").trim();
      const icon = submitted.fields.getTextInputValue("icon").trim();

      session.embedData.footerText = text || undefined;
      session.embedData.footerIcon = icon || undefined;

      resetSessionTimeout(sessionId);
      await updatePreview(sessionId);
    }
  }
}

async function handleFieldModal(
  interaction: ButtonInteraction,
  sessionId: string,
): Promise<void> {
  const session = embedSessions.get(sessionId);
  if (!session) return;

  const { embedData } = session;

  if (embedData.fields.length >= 25) {
    await interaction.reply({
      content: `❌ ${t(interaction, "eb_field_max_reached")}`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const modal = new ModalBuilder()
    .setCustomId(`eb_field_modal_${sessionId}`)
    .setTitle(t(interaction, "eb_modal_field_title"));

  const nameInput = new TextInputBuilder()
    .setCustomId("name")
    .setLabel(t(interaction, "eb_modal_field_name_label"))
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(256)
    .setPlaceholder(t(interaction, "eb_modal_field_name_placeholder"));

  const valueInput = new TextInputBuilder()
    .setCustomId("value")
    .setLabel(t(interaction, "eb_modal_field_value_label"))
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)
    .setMaxLength(1024)
    .setPlaceholder(t(interaction, "eb_modal_field_value_placeholder"));

  const inlineInput = new TextInputBuilder()
    .setCustomId("inline")
    .setLabel(t(interaction, "eb_modal_field_inline_label"))
    .setStyle(TextInputStyle.Short)
    .setRequired(false)
    .setMaxLength(3)
    .setPlaceholder(t(interaction, "eb_modal_field_inline_placeholder"))
    .setValue("yes");

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(valueInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(inlineInput),
  );

  await interaction.showModal(modal);

  const submitted = await interaction
    .awaitModalSubmit({
      time: 300000,
      filter: (i: ModalSubmitInteraction) =>
        i.customId === `eb_field_modal_${sessionId}`,
    })
    .catch(() => null);

  if (submitted) {
    await submitted.deferUpdate();
    const session = embedSessions.get(sessionId);
    if (session) {
      const name = submitted.fields.getTextInputValue("name");
      const value = submitted.fields.getTextInputValue("value");
      const inlineStr = submitted.fields
        .getTextInputValue("inline")
        .toLowerCase();
      const inline =
        inlineStr === "yes" ||
        inlineStr === "y" ||
        inlineStr === "sim" ||
        inlineStr === "s" ||
        inlineStr === "true" ||
        inlineStr === "";

      session.embedData.fields.push({ name, value, inline });

      resetSessionTimeout(sessionId);
      await updatePreview(sessionId);
    }
  }
}

async function handleColorMenu(
  interaction: ButtonInteraction,
  sessionId: string,
): Promise<void> {
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId(`eb_color_select_${sessionId}`)
    .setPlaceholder(t(interaction, "eb_color_select_title"))
    .addOptions(
      Object.entries(COLOR_PRESETS).map(([key, preset]) =>
        new StringSelectMenuOptionBuilder()
          .setLabel(preset.name)
          .setValue(key)
          .setEmoji(preset.name.split(" ")[0]),
      ),
    );

  const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    selectMenu,
  );

  await interaction.reply({
    content: `🎨 **${t(interaction, "eb_color_select_title")}**`,
    components: [row],
    flags: MessageFlags.Ephemeral,
  });

  const collector = interaction.channel?.createMessageComponentCollector({
    componentType: ComponentType.StringSelect,
    time: 60000,
    filter: (i: StringSelectMenuInteraction) =>
      i.user.id === interaction.user.id &&
      i.customId === `eb_color_select_${sessionId}`,
  });

  if (!collector) return;

  collector.on("collect", async (i: StringSelectMenuInteraction) => {
    const colorKey = i.values[0];
    const session = embedSessions.get(sessionId);
    if (session) {
      session.embedData.color = COLOR_PRESETS[colorKey].hex;
      await i.update({
        content: `✅ ${t(i, "eb_color_set", { name: COLOR_PRESETS[colorKey].name })}`,
        components: [],
      });
      resetSessionTimeout(sessionId);
      await updatePreview(sessionId);
    }
    collector.stop();
  });
}

async function handleTemplateMenu(
  interaction: ButtonInteraction,
  sessionId: string,
): Promise<void> {
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId(`eb_template_select_${sessionId}`)
    .setPlaceholder("📋 Choose a template to load")
    .addOptions(
      EMBED_TEMPLATES.map((template) =>
        new StringSelectMenuOptionBuilder()
          .setLabel(getTemplateName(template, "pt-BR"))
          .setValue(template.id)
          .setDescription(template.description)
          .setEmoji(template.emoji),
      ),
    );

  const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    selectMenu,
  );

  await interaction.reply({
    content: `📋 **Escolha um Template**\n\nSelecione um template pré-definido para começar rapidamente. Você pode editar todos os campos depois.`,
    components: [row],
    flags: MessageFlags.Ephemeral,
  });

  const collector = interaction.channel?.createMessageComponentCollector({
    componentType: ComponentType.StringSelect,
    time: 60000,
    filter: (i: StringSelectMenuInteraction) =>
      i.user.id === interaction.user.id &&
      i.customId === `eb_template_select_${sessionId}`,
  });

  if (!collector) return;

  collector.on("collect", async (i: StringSelectMenuInteraction) => {
    const templateId = i.values[0];
    const template = getTemplateById(templateId);
    const session = embedSessions.get(sessionId);
    
    if (session && template) {
      session.embedData = {
        ...template.data,
        fields: [...template.data.fields],
      };
      
      await i.update({
        content: `✅ Template "${getTemplateName(template, "pt-BR")}" carregado com sucesso! Verifique o preview acima.`,
        components: [],
      });
      
      resetSessionTimeout(sessionId);
      await updatePreview(sessionId);
    }
    collector.stop();
  });
}

async function handleManageFieldsMenu(
  interaction: ButtonInteraction,
  sessionId: string,
): Promise<void> {
  const session = embedSessions.get(sessionId);
  if (!session) return;

  const { embedData } = session;

  if (embedData.fields.length === 0) {
    await interaction.reply({
      content: `ℹ️ Nenhum field foi adicionado ainda. Use o botão "➕ Add Field" para adicionar fields.`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId(`eb_fieldmanage_select_${sessionId}`)
    .setPlaceholder(`📝 Select a field to edit or remove (${embedData.fields.length} fields)`)
    .addOptions(
      embedData.fields.map((field, index) =>
        new StringSelectMenuOptionBuilder()
          .setLabel(`${index + 1}. ${field.name.substring(0, 80)}`)
          .setValue(String(index))
          .setDescription(
            `${field.value.substring(0, 80)} ${field.value.length > 80 ? "..." : ""}`,
          ),
      ),
    );

  const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    selectMenu,
  );

  await interaction.reply({
    content: `📝 **Gerenciar Fields**\n\nSelecione um field para editar ou remover:`,
    components: [row],
    flags: MessageFlags.Ephemeral,
  });

  const collector = interaction.channel?.createMessageComponentCollector({
    componentType: ComponentType.StringSelect,
    time: 60000,
    filter: (i: StringSelectMenuInteraction) =>
      i.user.id === interaction.user.id &&
      i.customId === `eb_fieldmanage_select_${sessionId}`,
  });

  if (!collector) return;

  collector.on("collect", async (i: StringSelectMenuInteraction) => {
    const fieldIndex = parseInt(i.values[0]);
    const sess = embedSessions.get(sessionId);
    
    if (!sess) {
      collector.stop();
      return;
    }

    const field = sess.embedData.fields[fieldIndex];

    const editBtn = new ButtonBuilder()
      .setCustomId(`eb_editfield_${sessionId}_${fieldIndex}`)
      .setLabel("✏️ Edit")
      .setStyle(ButtonStyle.Primary);

    const removeBtn = new ButtonBuilder()
      .setCustomId(`eb_removefield_${sessionId}_${fieldIndex}`)
      .setLabel("🗑️ Remove")
      .setStyle(ButtonStyle.Danger);

    const cancelBtn = new ButtonBuilder()
      .setCustomId(`eb_cancelfield_${sessionId}`)
      .setLabel("❌ Cancel")
      .setStyle(ButtonStyle.Secondary);

    const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      editBtn,
      removeBtn,
      cancelBtn,
    );

    await i.update({
      content: `**Field ${fieldIndex + 1}:**\n**Name:** ${field.name}\n**Value:** ${field.value}\n**Inline:** ${field.inline ? "Yes" : "No"}\n\nWhat would you like to do?`,
      components: [actionRow],
    });

    const btnCollector = i.message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 60000,
      filter: (btnI: ButtonInteraction) =>
        btnI.user.id === i.user.id &&
        btnI.customId.startsWith(`eb_`) &&
        btnI.customId.includes(sessionId),
    });

    btnCollector.on("collect", async (btnI: ButtonInteraction) => {
      const btnAction = btnI.customId.split("_")[1];

      if (btnAction === "editfield") {
        await handleEditField(btnI, sessionId, fieldIndex);
      } else if (btnAction === "removefield") {
        await handleRemoveField(btnI, sessionId, fieldIndex);
      } else if (btnAction === "cancelfield") {
        await btnI.update({
          content: `❌ Cancelled field management.`,
          components: [],
        });
      }

      btnCollector.stop();
      collector.stop();
    });
  });
}

async function handleEditField(
  interaction: ButtonInteraction,
  sessionId: string,
  fieldIndex: number,
): Promise<void> {
  const session = embedSessions.get(sessionId);
  if (!session) return;

  const field = session.embedData.fields[fieldIndex];
  if (!field) return;

  const modal = new ModalBuilder()
    .setCustomId(`eb_editfield_modal_${sessionId}_${fieldIndex}`)
    .setTitle(`Edit Field ${fieldIndex + 1}`);

  const nameInput = new TextInputBuilder()
    .setCustomId("name")
    .setLabel("Field Name")
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(256)
    .setValue(field.name);

  const valueInput = new TextInputBuilder()
    .setCustomId("value")
    .setLabel("Field Value")
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)
    .setMaxLength(1024)
    .setValue(field.value);

  const inlineInput = new TextInputBuilder()
    .setCustomId("inline")
    .setLabel("Inline? (yes/no)")
    .setStyle(TextInputStyle.Short)
    .setRequired(false)
    .setMaxLength(3)
    .setValue(field.inline ? "yes" : "no");

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(valueInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(inlineInput),
  );

  await interaction.showModal(modal);

  const submitted = await interaction
    .awaitModalSubmit({
      time: 300000,
      filter: (i: ModalSubmitInteraction) =>
        i.customId === `eb_editfield_modal_${sessionId}_${fieldIndex}`,
    })
    .catch(() => null);

  if (submitted) {
    const sess = embedSessions.get(sessionId);
    if (sess) {
      const name = submitted.fields.getTextInputValue("name");
      const value = submitted.fields.getTextInputValue("value");
      const inlineStr = submitted.fields
        .getTextInputValue("inline")
        .toLowerCase();
      const inline =
        inlineStr === "yes" ||
        inlineStr === "y" ||
        inlineStr === "sim" ||
        inlineStr === "s" ||
        inlineStr === "true";

      sess.embedData.fields[fieldIndex] = { name, value, inline };

      await submitted.reply({
        content: `✅ Field ${fieldIndex + 1} edited successfully!`,
        flags: MessageFlags.Ephemeral,
      });

      resetSessionTimeout(sessionId);
      await updatePreview(sessionId);
    }
  }
}

async function handleRemoveField(
  interaction: ButtonInteraction,
  sessionId: string,
  fieldIndex: number,
): Promise<void> {
  const session = embedSessions.get(sessionId);
  if (!session) return;

  session.embedData.fields.splice(fieldIndex, 1);

  await interaction.update({
    content: `✅ Field ${fieldIndex + 1} removed successfully!`,
    components: [],
  });

  resetSessionTimeout(sessionId);
  await updatePreview(sessionId);
}

async function handleTimestamp(
  interaction: ButtonInteraction,
  sessionId: string,
): Promise<void> {
  try {
    await interaction.deferUpdate();
    const session = embedSessions.get(sessionId);
    if (session) {
      session.embedData.timestamp = !session.embedData.timestamp;
      resetSessionTimeout(sessionId);
      await updatePreview(sessionId);
    }
  } catch (error) {
    console.error("Error in handleTimestamp:", error);
  }
}

async function handleClear(
  interaction: ButtonInteraction,
  sessionId: string,
): Promise<void> {
  try {
    await interaction.deferUpdate();
    const session = embedSessions.get(sessionId);
    if (session) {
      session.embedData = {
        fields: [],
        timestamp: true,
        color: "#5865F2",
      };
      resetSessionTimeout(sessionId);
      await updatePreview(sessionId);
    }
  } catch (error) {
    console.error("Error in handleClear:", error);
  }
}

function normalizeEmbedJson(rawJson: any): Partial<EmbedData> {
  const normalized: Partial<EmbedData> = {
    fields: [],
  };

  // Title
  if (rawJson.title) {
    normalized.title = rawJson.title;
  }

  // Description
  if (rawJson.description) {
    normalized.description = rawJson.description;
  }

  // URL
  if (rawJson.url) {
    normalized.url = rawJson.url;
  }

  // Color - convert from Discord number format to hex string
  if (rawJson.color !== undefined) {
    if (typeof rawJson.color === "number") {
      normalized.color = "#" + rawJson.color.toString(16).padStart(6, "0");
    } else if (typeof rawJson.color === "string") {
      normalized.color = rawJson.color;
    }
  }

  // Author - Discord format: {name, icon_url, url} -> Custom: {authorName, authorIcon, authorUrl}
  if (rawJson.author) {
    normalized.authorName = rawJson.author.name;
    normalized.authorIcon = rawJson.author.icon_url;
    normalized.authorUrl = rawJson.author.url;
  }

  // Custom format support
  if (rawJson.authorName) normalized.authorName = rawJson.authorName;
  if (rawJson.authorIcon) normalized.authorIcon = rawJson.authorIcon;
  if (rawJson.authorUrl) normalized.authorUrl = rawJson.authorUrl;

  // Thumbnail - Discord format: {url, width, height, ...} -> Custom: just url string
  if (rawJson.thumbnail) {
    if (typeof rawJson.thumbnail === "object" && rawJson.thumbnail.url) {
      normalized.thumbnail = rawJson.thumbnail.url;
    } else if (typeof rawJson.thumbnail === "string") {
      normalized.thumbnail = rawJson.thumbnail;
    }
  }

  // Image - Discord format: {url, width, height, ...} -> Custom: just url string
  if (rawJson.image) {
    if (typeof rawJson.image === "object" && rawJson.image.url) {
      normalized.image = rawJson.image.url;
    } else if (typeof rawJson.image === "string") {
      normalized.image = rawJson.image;
    }
  }

  // Footer - Discord format: {text, icon_url} -> Custom: {footerText, footerIcon}
  if (rawJson.footer) {
    normalized.footerText = rawJson.footer.text;
    normalized.footerIcon = rawJson.footer.icon_url;
  }

  // Custom format support
  if (rawJson.footerText) normalized.footerText = rawJson.footerText;
  if (rawJson.footerIcon) normalized.footerIcon = rawJson.footerIcon;

  // Timestamp
  if (rawJson.timestamp !== undefined) {
    if (typeof rawJson.timestamp === "boolean") {
      normalized.timestamp = rawJson.timestamp;
    } else if (typeof rawJson.timestamp === "string") {
      normalized.timestamp = true;
    }
  }

  // Fields - both formats should be compatible
  if (Array.isArray(rawJson.fields)) {
    normalized.fields = rawJson.fields.map((field: any) => ({
      name: field.name || "",
      value: field.value || "",
      inline: field.inline ?? false,
    }));
  }

  return normalized;
}

async function handleImportJson(
  interaction: ButtonInteraction,
  sessionId: string,
): Promise<void> {
  const modal = new ModalBuilder()
    .setCustomId(`eb_import_modal_${sessionId}`)
    .setTitle(t(interaction, "eb_modal_import_title"));

  const jsonInput = new TextInputBuilder()
    .setCustomId("json")
    .setLabel(t(interaction, "eb_modal_import_label"))
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)
    .setPlaceholder(t(interaction, "eb_modal_import_placeholder"));

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(jsonInput),
  );

  await interaction.showModal(modal);

  const submitted = await interaction
    .awaitModalSubmit({
      time: 300000,
      filter: (i: ModalSubmitInteraction) =>
        i.customId === `eb_import_modal_${sessionId}`,
    })
    .catch(() => null);

  if (submitted) {
    try {
      await submitted.deferUpdate();

      const session = embedSessions.get(sessionId);
      if (!session) {
        await submitted.followUp({
          content: "❌ Session expired",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      const jsonString = submitted.fields.getTextInputValue("json").trim();
      const parsed = JSON.parse(jsonString);

      // Convert Discord API format to custom format if needed
      const normalizedData = normalizeEmbedJson(parsed);

      // Update embed data
      session.embedData.title = normalizedData.title;
      session.embedData.description = normalizedData.description;
      session.embedData.color = normalizedData.color || "#5865F2";
      session.embedData.url = normalizedData.url;
      session.embedData.authorName = normalizedData.authorName;
      session.embedData.authorIcon = normalizedData.authorIcon;
      session.embedData.authorUrl = normalizedData.authorUrl;
      session.embedData.thumbnail = normalizedData.thumbnail;
      session.embedData.image = normalizedData.image;
      session.embedData.footerText = normalizedData.footerText;
      session.embedData.footerIcon = normalizedData.footerIcon;
      session.embedData.timestamp = normalizedData.timestamp ?? true;
      session.embedData.fields = normalizedData.fields || [];

      console.log("✅ JSON imported successfully, updating preview...");

      resetSessionTimeout(sessionId);

      // Update the preview
      await updatePreview(sessionId);

      // Send success feedback
      await submitted.followUp({
        content: `✅ ${t(submitted, "eb_import_success")}\n\n💡 **Dica:** Verifique o preview acima - ele foi atualizado com os dados importados!`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error("❌ Error importing JSON:", error);
      try {
        await submitted.followUp({
          content: `❌ ${t(submitted, "eb_import_error", { error: error instanceof Error ? error.message : "Invalid JSON" })}`,
          flags: MessageFlags.Ephemeral,
        });
      } catch (followUpError) {
        console.error("Failed to send error feedback:", followUpError);
      }
    }
  }
}

async function handleExportJson(
  interaction: ButtonInteraction,
  sessionId: string,
): Promise<void> {
  try {
    const session = embedSessions.get(sessionId);
    if (!session) return;

    const { embedData } = session;
    const jsonString = JSON.stringify(embedData, null, 2);

    resetSessionTimeout(sessionId);

    const codeBlock = `\`\`\`json\n${jsonString}\n\`\`\``;
    const fullMessage = `📤 **${t(interaction, "eb_export_title")}**\n${t(interaction, "eb_export_description")}\n\n${codeBlock}`;

    if (fullMessage.length > 2000) {
      const buffer = Buffer.from(jsonString, "utf-8");
      await interaction.reply({
        content: `📤 **${t(interaction, "eb_export_title")}**\n${t(interaction, "eb_export_description_file")}`,
        files: [
          {
            attachment: buffer,
            name: "embed.json",
          },
        ],
        flags: MessageFlags.Ephemeral,
      });
    } else {
      await interaction.reply({
        content: fullMessage,
        flags: MessageFlags.Ephemeral,
      });
    }
  } catch (error) {
    console.error("Error in handleExportJson:", error);
  }
}

async function handleSend(
  interaction: ButtonInteraction,
  sessionId: string,
): Promise<void> {
  try {
    const session = embedSessions.get(sessionId);
    if (!session) return;

    const { embedData, channel, timeoutId, warningTimeoutId, collector } =
      session;

    if (
      !embedData.title &&
      !embedData.description &&
      embedData.fields.length === 0
    ) {
      await interaction.reply({
        content: `❌ ${t(interaction, "eb_empty_embed")}`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const finalEmbed = buildFinalEmbed(embedData);

    await channel.send({ embeds: [finalEmbed] });

    await interaction.update({
      content: `✅ ${t(interaction, "eb_sent_success", { channel: channel.toString() })}`,
      embeds: [finalEmbed],
      components: [],
    });

    if (timeoutId) clearTimeout(timeoutId);
    if (warningTimeoutId) clearTimeout(warningTimeoutId);
    if (collector) collector.stop();
    embedSessions.delete(sessionId);
  } catch (error) {
    console.error("Error in handleSend:", error);
    try {
      await interaction.reply({
        content: `❌ ${t(interaction, "eb_send_error", { error: error instanceof Error ? error.message : "Unknown" })}`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (replyError) {
      console.error("Failed to send error message:", replyError);
    }
  }
}

async function handleCancel(
  interaction: ButtonInteraction,
  sessionId: string,
): Promise<void> {
  try {
    const session = embedSessions.get(sessionId);
    if (session) {
      if (session.timeoutId) clearTimeout(session.timeoutId);
      if (session.warningTimeoutId) clearTimeout(session.warningTimeoutId);
      if (session.collector) session.collector.stop();
    }
    embedSessions.delete(sessionId);
    await interaction.update({
      content: `❌ ${t(interaction, "eb_cancelled")}`,
      embeds: [],
      components: [],
    });
  } catch (error) {
    console.error("Error in handleCancel:", error);
  }
}

function buildPreviewEmbed(
  data: EmbedData,
  interaction: ChatInputCommandInteraction | ButtonInteraction,
): EmbedBuilder {
  const embed = new EmbedBuilder();

  if (data.color) {
    embed.setColor(data.color as ColorResolvable);
  }

  if (data.title) {
    embed.setTitle(data.title);
  } else {
    embed.setTitle(t(interaction, "eb_preview_title"));
  }

  if (data.description) {
    embed.setDescription(data.description);
  }

  if (data.url) {
    embed.setURL(data.url);
  }

  if (data.authorName) {
    embed.setAuthor({
      name: data.authorName,
      iconURL: data.authorIcon,
      url: data.authorUrl,
    });
  }

  if (data.thumbnail) {
    embed.setThumbnail(data.thumbnail);
  }

  if (data.image) {
    embed.setImage(data.image);
  }

  if (data.fields.length > 0) {
    embed.addFields(data.fields);
  }

  if (data.footerText) {
    embed.setFooter({
      text: data.footerText,
      iconURL: data.footerIcon,
    });
  }

  if (data.timestamp) {
    embed.setTimestamp();
  }

  return embed;
}

function buildFinalEmbed(data: EmbedData): EmbedBuilder {
  const embed = new EmbedBuilder();

  if (data.color) {
    embed.setColor(data.color as ColorResolvable);
  }

  if (data.title) {
    embed.setTitle(data.title);
  }

  if (data.description) {
    embed.setDescription(data.description);
  }

  if (data.url) {
    embed.setURL(data.url);
  }

  if (data.authorName) {
    embed.setAuthor({
      name: data.authorName,
      iconURL: data.authorIcon,
      url: data.authorUrl,
    });
  }

  if (data.thumbnail) {
    embed.setThumbnail(data.thumbnail);
  }

  if (data.image) {
    embed.setImage(data.image);
  }

  if (data.fields.length > 0) {
    embed.addFields(data.fields);
  }

  if (data.footerText) {
    embed.setFooter({
      text: data.footerText,
      iconURL: data.footerIcon,
    });
  }

  if (data.timestamp) {
    embed.setTimestamp();
  }

  return embed;
}
