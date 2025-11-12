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
  TextChannel,
  Role,
  ChannelType,
  Colors,
} from "discord.js";
import * as fs from "fs";
import * as path from "path";
import {
  getCowboyEmoji,
  getScrollEmoji,
  getCancelEmoji,
  getCheckEmoji,
  getTimerEmoji,
} from "../../utils/customEmojis";
import {
  setLogConfig,
  removeLogConfig,
  getLogConfig,
} from "../../utils/dataManager";
import { setWantedConfig, getWantedConfig } from "../../utils/dataManager";
import { t, getLocale } from "../../utils/i18n";
import { AutoModManager } from "../../utils/autoModManager";
import { isOwner } from "../../utils/security";
import { addItem } from "../../utils/inventoryManager";
import { writeData, readData, getDataPath } from "../../utils/database";
import {
  uploadCustomEmojis,
  removeAllCustomEmojis,
  listCustomEmojis,
  syncServerEmojis,
} from "../../utils/emojiUploader";

const OWNER_ID = process.env.OWNER_ID;

// =============== ANNOUNCEMENT DATA STRUCTURES ===============
interface AnnouncementData {
  templates: Record<string, Template>;
  history: HistoryEntry[];
}

interface Template {
  name: string;
  title: string;
  message: string;
  color: string;
  thumbnail?: string;
  image?: string;
  footer?: string;
}

interface HistoryEntry {
  id: string;
  guildId: string;
  channelId: string;
  authorId: string;
  authorTag: string;
  title: string;
  timestamp: number;
}

const ANNOUNCEMENT_DATA_PATH = path.join(
  __dirname,
  "../../data/announcements.json",
);

function loadAnnouncementData(): AnnouncementData {
  try {
    if (!fs.existsSync(ANNOUNCEMENT_DATA_PATH)) {
      const defaultData: AnnouncementData = { templates: {}, history: [] };
      fs.writeFileSync(
        ANNOUNCEMENT_DATA_PATH,
        JSON.stringify(defaultData, null, 2),
      );
      return defaultData;
    }
    return JSON.parse(fs.readFileSync(ANNOUNCEMENT_DATA_PATH, "utf-8"));
  } catch (error) {
    return { templates: {}, history: [] };
  }
}

function saveAnnouncementData(data: AnnouncementData): void {
  fs.writeFileSync(ANNOUNCEMENT_DATA_PATH, JSON.stringify(data, null, 2));
}

function addToAnnouncementHistory(
  guildId: string,
  channelId: string,
  authorId: string,
  authorTag: string,
  title: string,
): void {
  const data = loadAnnouncementData();

  data.history.unshift({
    id: Date.now().toString(),
    guildId,
    channelId,
    authorId,
    authorTag,
    title,
    timestamp: Date.now(),
  });

  const guildHistory = data.history.filter((h) => h.guildId === guildId);
  const otherHistory = data.history.filter((h) => h.guildId !== guildId);
  data.history = [...guildHistory.slice(0, 100), ...otherHistory];

  saveAnnouncementData(data);
}

const COLOR_PRESETS: Record<string, { name: string; hex: string }> = {
  gold: { name: "🟡 Gold Rush", hex: "#FFD700" },
  red: { name: "🔴 Wanted Poster", hex: "#DC143C" },
  green: { name: "🟢 Sheriff Badge", hex: "#2ECC71" },
  blue: { name: "🔵 Saloon Night", hex: "#3498DB" },
  purple: { name: "🟣 Royal Purple", hex: "#9B59B6" },
  orange: { name: "🟠 Desert Sunset", hex: "#E67E22" },
  brown: { name: "🟤 Western Leather", hex: "#8B4513" },
  silver: { name: "⚪ Silver Coin", hex: "#C0C0C0" },
};

// =============== GENERATECODE DATA STRUCTURES ===============
const redemptionCodesPath = path.join(
  getDataPath("data"),
  "redemption-codes.json",
);

interface RedemptionCode {
  productId: string;
  productName: string;
  tokens: number;
  coins: number;
  vip: boolean;
  background: boolean;
  backpack?: number | boolean;
  createdAt: number;
  createdBy: string;
  redeemed: boolean;
}

interface Product {
  name: string;
  tokens: number;
  coins: number;
  vip: boolean;
  background: boolean;
  backpack?: number | boolean;
}

function loadRedemptionCodes(): Record<string, RedemptionCode> {
  try {
    return readData("redemption-codes.json");
  } catch (error) {
    console.error("Error loading redemption codes:", error);
    return {};
  }
}

function saveRedemptionCodes(data: Record<string, RedemptionCode>): void {
  writeData("redemption-codes.json", data);
}

function generateRedemptionCode(productId: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `SHERIFF-${productId.toUpperCase()}-${timestamp}-${random}`.toUpperCase();
}

// =============== IDIOMA DATA ===============
interface LocaleMessages {
  title: string;
  desc: string;
  detected: string;
  how: string;
  howDesc: string;
  supported: string;
  supportedList: string;
  footer: string;
}

// =============== MIGRATE DATA ===============
const economyFile = path.join(
  __dirname,
  "..",
  "..",
  "..",
  "data",
  "economy.json",
);
const backupFile = path.join(
  __dirname,
  "..",
  "..",
  "..",
  "data",
  "economy.backup.json",
);

// =============== WELCOME HELPER ===============
function isValidUrl(string: string): boolean {
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;
  }
}

// =============== AUTOMOD HELPER ===============
function createProgressBar(percentage: number): string {
  const filledBars = Math.floor(percentage / 5);
  const emptyBars = 20 - filledBars;
  const filled = "█".repeat(filledBars);
  const empty = "░".repeat(emptyBars);
  return `[${filled}${empty}] ${percentage.toFixed(1)}%`;
}

export default {
  data: new SlashCommandBuilder()
    .setName("admin")
    .setDescription("🛡️ Administrative commands for server management")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

    // ANNOUNCEMENT SUBCOMMAND GROUP
    .addSubcommandGroup((group) =>
      group
        .setName("announcement")
        .setDescription("🤠 Advanced announcement system with templates")
        .addSubcommand((sub) =>
          sub
            .setName("send")
            .setDescription("Send an advanced announcement with preview")
            .addChannelOption((option) =>
              option
                .setName("channel")
                .setDescription("Channel to send the announcement")
                .setRequired(true),
            )
            .addStringOption((option) =>
              option
                .setName("title")
                .setDescription("Announcement title")
                .setRequired(true),
            )
            .addStringOption((option) =>
              option
                .setName("message")
                .setDescription(
                  "Announcement message (supports \\n for new lines)",
                )
                .setRequired(true),
            )
            .addStringOption((option) =>
              option
                .setName("color_preset")
                .setDescription("Choose a Western-themed color preset")
                .addChoices(
                  { name: "🟡 Gold Rush (Default)", value: "gold" },
                  { name: "🔴 Wanted Poster", value: "red" },
                  { name: "🟢 Sheriff Badge", value: "green" },
                  { name: "🔵 Saloon Night", value: "blue" },
                  { name: "🟣 Royal Purple", value: "purple" },
                  { name: "🟠 Desert Sunset", value: "orange" },
                  { name: "🟤 Western Leather", value: "brown" },
                  { name: "⚪ Silver Coin", value: "silver" },
                )
                .setRequired(false),
            )
            .addStringOption((option) =>
              option
                .setName("thumbnail")
                .setDescription("Thumbnail URL (small image on top-right)")
                .setRequired(false),
            )
            .addStringOption((option) =>
              option
                .setName("image")
                .setDescription("Large image URL (banner at bottom)")
                .setRequired(false),
            )
            .addRoleOption((option) =>
              option
                .setName("mention_role")
                .setDescription("Role to mention (optional)")
                .setRequired(false),
            )
            .addBooleanOption((option) =>
              option
                .setName("mention_everyone")
                .setDescription("Mention @everyone (use with caution)")
                .setRequired(false),
            )
            .addBooleanOption((option) =>
              option
                .setName("mention_here")
                .setDescription("Mention @here (online members)")
                .setRequired(false),
            )
            .addStringOption((option) =>
              option
                .setName("footer")
                .setDescription("Custom footer text (optional)")
                .setRequired(false),
            ),
        )
        .addSubcommand((sub) =>
          sub
            .setName("template")
            .setDescription("Manage announcement templates")
            .addStringOption((option) =>
              option
                .setName("action")
                .setDescription("Action to perform")
                .addChoices(
                  { name: "Create", value: "create" },
                  { name: "Edit", value: "edit" },
                  { name: "List", value: "list" },
                  { name: "Use", value: "use" },
                  { name: "Delete", value: "delete" },
                )
                .setRequired(true),
            )
            .addStringOption((option) =>
              option
                .setName("name")
                .setDescription("Template name")
                .setRequired(false),
            )
            .addChannelOption((option) =>
              option
                .setName("channel")
                .setDescription('Channel to send (for "use" action)')
                .setRequired(false),
            )
            .addStringOption((option) =>
              option
                .setName("edit_field")
                .setDescription("The template field to edit")
                .setRequired(false)
                .addChoices(
                  { name: "Title", value: "title" },
                  { name: "Message", value: "message" },
                  { name: "Color", value: "color" },
                  { name: "Thumbnail", value: "thumbnail" },
                  { name: "Image", value: "image" },
                  { name: "Footer", value: "footer" },
                ),
            )
            .addStringOption((option) =>
              option
                .setName("new_value")
                .setDescription("The new value for the selected field")
                .setRequired(false),
            ),
        )
        .addSubcommand((sub) =>
          sub
            .setName("history")
            .setDescription("View announcement history")
            .addIntegerOption((option) =>
              option
                .setName("limit")
                .setDescription(
                  "Number of recent announcements to show (default: 10)",
                )
                .setMinValue(1)
                .setMaxValue(25)
                .setRequired(false),
            ),
        ),
    )

    // LOGS SUBCOMMAND GROUP
    .addSubcommandGroup((group) =>
      group
        .setName("logs")
        .setDescription("🛡️ Configure log system for the server")
        .addSubcommand((subcommand) =>
          subcommand
            .setName("set")
            .setDescription("Set up the log channel")
            .addChannelOption((option) =>
              option
                .setName("channel")
                .setDescription("Channel where logs will be sent")
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true),
            ),
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("view")
            .setDescription("View current log configuration"),
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("disable")
            .setDescription("Disable the log system"),
        ),
    )

    // WANTED SUBCOMMAND GROUP
    .addSubcommandGroup((group) =>
      group
        .setName("wanted")
        .setDescription("⚖️ Configure wanted poster channel")
        .addSubcommand((subcommand) =>
          subcommand
            .setName("set")
            .setDescription("Set the wanted poster channel")
            .addChannelOption((option) =>
              option
                .setName("channel")
                .setDescription(
                  "The channel where wanted posters will be posted",
                )
                .setRequired(true),
            ),
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("view")
            .setDescription("View current wanted poster channel configuration"),
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("disable")
            .setDescription(
              "Disable wanted poster channel (will use logs channel as fallback)",
            ),
        ),
    )

    // AUTOMOD SUBCOMMAND GROUP
    .addSubcommandGroup((group) =>
      group
        .setName("automod")
        .setDescription("🛡️ Manage AutoMod rules")
        .addSubcommand((subcommand) =>
          subcommand
            .setName("setup")
            .setDescription("Create default AutoMod rules in this server")
            .addChannelOption((option) =>
              option
                .setName("log-channel")
                .setDescription("Channel for AutoMod alerts (optional)")
                .setRequired(false),
            ),
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("status")
            .setDescription("Check AutoMod badge progress"),
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("clear")
            .setDescription("Remove all AutoMod rules from this server"),
        ),
    )

    // AUTOMODALL SUBCOMMAND GROUP (Owner only)
    .addSubcommandGroup((group) =>
      group
        .setName("automodall")
        .setDescription("🛡️ Setup AutoMod in ALL servers (Owner only)")
        .addSubcommand((subcommand) =>
          subcommand
            .setName("setup")
            .setDescription("Create AutoMod rules in all servers at once"),
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("clear")
            .setDescription("Remove AutoMod rules from all servers"),
        ),
    )

    // SIMPLE SUBCOMMANDS (no groups)
    .addSubcommand((sub) =>
      sub
        .setName("generatecode")
        .setDescription("[OWNER ONLY] Generate a redemption code manually")
        .addStringOption((option) =>
          option
            .setName("product")
            .setDescription("Product type")
            .setRequired(true)
            .addChoices(
              { name: "Starter Pack ($1.99)", value: "starter" },
              { name: "Popular Pack ($4.99)", value: "popular" },
              { name: "Gold Pack ($9.99)", value: "gold" },
              { name: "Ultimate Pack ($19.99)", value: "ultimate" },
              { name: "Small Backpack 200kg ($2.99)", value: "backpack_200" },
              { name: "Medium Backpack 300kg ($4.99)", value: "backpack_300" },
              { name: "Large Backpack 400kg ($6.99)", value: "backpack_400" },
              {
                name: "Ultimate Backpack 500kg ($9.99)",
                value: "backpack_500",
              },
            ),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName("idioma")
        .setDescription(
          "Check your language / Verificar seu idioma / Verificar tu idioma",
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName("migrate")
        .setDescription(
          "[OWNER ONLY] Migrate old economy.json balances to new inventory system",
        ),
    )
    .addSubcommand((sub) =>
      sub.setName("servidor").setDescription("Show server information"),
    )
    .addSubcommand((sub) =>
      sub
        .setName("uploademojis")
        .setDescription(
          "Manage custom emojis (upload, sync or remove from the server)",
        )
        .addStringOption((option) =>
          option
            .setName("action")
            .setDescription("Choose to upload, sync or remove custom emojis")
            .setRequired(true)
            .addChoices(
              { name: "Sync existing server emojis", value: "sync" },
              { name: "Upload emojis to server", value: "upload" },
              { name: "Remove all emojis from server", value: "remove" },
            ),
        ),
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const subcommandGroup = interaction.options.getSubcommandGroup(false);
    const subcommand = interaction.options.getSubcommand();

    // Handle subcommand groups
    if (subcommandGroup === "announcement") {
      if (subcommand === "send") {
        await handleAnnouncementSend(interaction);
      } else if (subcommand === "template") {
        await handleAnnouncementTemplate(interaction);
      } else if (subcommand === "history") {
        await handleAnnouncementHistory(interaction);
      }
    } else if (subcommandGroup === "logs") {
      await handleLogs(interaction, subcommand);
    } else if (subcommandGroup === "wanted") {
      await handleWanted(interaction, subcommand);
    } else if (subcommandGroup === "automod") {
      await handleAutoMod(interaction, subcommand);
    } else if (subcommandGroup === "automodall") {
      // Owner-only check
      if (!(await isOwner(interaction))) {
        return;
      }
      await handleAutoModAll(interaction, subcommand);
    }
    // Handle simple subcommands (no group)
    else if (subcommand === "generatecode") {
      await handleGenerateCode(interaction);
    } else if (subcommand === "idioma") {
      await handleIdioma(interaction);
    } else if (subcommand === "migrate") {
      await handleMigrate(interaction);
    } else if (subcommand === "servidor") {
      await handleServidor(interaction);
    } else if (subcommand === "uploademojis") {
      await handleUploadEmojis(interaction);
    }
  },
};

// =============== ANNOUNCEMENT HANDLERS ===============
async function handleAnnouncementSend(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  const channel = interaction.options.getChannel("channel", true);
  const title = interaction.options.getString("title", true);
  let message = interaction.options.getString("message", true);
  const colorPreset = interaction.options.getString("color_preset") || "gold";
  const thumbnail = interaction.options.getString("thumbnail");
  const image = interaction.options.getString("image");
  const mentionRole = interaction.options.getRole(
    "mention_role",
  ) as Role | null;
  const mentionEveryone =
    interaction.options.getBoolean("mention_everyone") || false;
  const mentionHere = interaction.options.getBoolean("mention_here") || false;
  const customFooter = interaction.options.getString("footer");

  message = message.replace(/\\n/g, "\n");

  if (!channel || !("send" in channel)) {
    await interaction.reply({
      content: `❌ The channel must be a text channel!`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (mentionEveryone || mentionHere) {
    if (
      !interaction.memberPermissions?.has(PermissionFlagsBits.MentionEveryone)
    ) {
      await interaction.reply({
        content: `❌ You need the "Mention Everyone" permission to use @everyone or @here mentions!`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
  }

  const colorHex = COLOR_PRESETS[colorPreset]?.hex || "#FFD700";
  const color = parseInt(colorHex.replace("#", ""), 16);

  const previewEmbed = new EmbedBuilder()
    .setColor(color)
    .setTitle(`📢 ${title}`)
    .setDescription(message)
    .addFields([
      {
        name: `📝 ${t(interaction, "announce_author")}`,
        value: `${interaction.user}`,
        inline: true,
      },
      {
        name: `📺 ${t(interaction, "announce_channel")}`,
        value: `${channel}`,
        inline: true,
      },
    ])
    .setTimestamp();

  if (thumbnail) previewEmbed.setThumbnail(thumbnail);
  if (image) previewEmbed.setImage(image);

  const footerText =
    customFooter ||
    `${t(interaction, "announce_author")}: ${interaction.user.tag}`;
  previewEmbed.setFooter({
    text: footerText,
    iconURL: interaction.user.displayAvatarURL(),
  });

  let mentionText = "";
  if (mentionEveryone) mentionText = "@everyone ";
  else if (mentionHere) mentionText = "@here ";
  else if (mentionRole) mentionText = `${mentionRole} `;

  const confirmRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("confirm_announcement")
      .setLabel(`✅ ${t(interaction, "announce_confirm")}`)
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId("cancel_announcement")
      .setLabel(`❌ ${t(interaction, "announce_cancel")}`)
      .setStyle(ButtonStyle.Danger),
  );

  const previewMessage = await interaction.reply({
    content: `**📋 ${t(interaction, "announce_preview")}**\n${mentionText ? `**Mentions:** ${mentionText}` : ""}`,
    embeds: [previewEmbed],
    components: [confirmRow],
    flags: MessageFlags.Ephemeral,
  });

  try {
    const buttonInteraction = await previewMessage.awaitMessageComponent({
      componentType: ComponentType.Button,
      time: 60000,
    });

    if (buttonInteraction.customId === "confirm_announcement") {
      const finalEmbed = new EmbedBuilder()
        .setColor(color)
        .setTitle(`📢 ${title}`)
        .setDescription(message)
        .setFooter({ text: footerText })
        .setTimestamp();

      if (thumbnail) finalEmbed.setThumbnail(thumbnail);
      if (image) finalEmbed.setImage(image);

      const sendOptions: any = { embeds: [finalEmbed] };
      if (mentionText) {
        sendOptions.content = mentionText.trim();
        if (mentionEveryone || mentionHere) {
          sendOptions.allowedMentions = { parse: ["everyone"] };
        }
      }

      await (channel as TextChannel).send(sendOptions);
      addToAnnouncementHistory(
        interaction.guildId!,
        channel.id,
        interaction.user.id,
        interaction.user.tag,
        title,
      );

      const successEmbed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle(`✅ ${t(interaction, "announce_success")}`)
        .setDescription(`${t(interaction, "announce_sent_to")} ${channel}`)
        .addFields([
          {
            name: `📝 ${t(interaction, "announce_author")}`,
            value: `${interaction.user}`,
            inline: true,
          },
          {
            name: `📺 ${t(interaction, "announce_channel")}`,
            value: `${channel}`,
            inline: true,
          },
        ])
        .setTimestamp()
        .setFooter({
          text: t(interaction, "announce_title"),
          iconURL: interaction.user.displayAvatarURL(),
        });

      await buttonInteraction.update({
        content: "",
        embeds: [successEmbed],
        components: [],
      });
    } else {
      const cancelEmbed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle(`❌ ${t(interaction, "announce_cancel")}`)
        .setDescription("The announcement was not sent.")
        .setTimestamp();

      await buttonInteraction.update({
        content: "",
        embeds: [cancelEmbed],
        components: [],
      });
    }
  } catch (error) {
    await interaction.editReply({
      content: "⏱️ Announcement preview expired. Please try again.",
      embeds: [],
      components: [],
    });
  }
}

async function handleAnnouncementTemplate(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  const action = interaction.options.getString("action", true);
  const name = interaction.options.getString("name");

  if (
    name &&
    (name === "__proto__" || name === "constructor" || name === "prototype")
  ) {
    await interaction.reply({
      content: "❌ Invalid template name.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  const channel = interaction.options.getChannel("channel");

  const data = loadAnnouncementData();

  if (action === "create") {
    if (!name) {
      await interaction.reply({
        content: "❌ Please provide a template name!",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (data.templates[name]) {
      await interaction.reply({
        content: `❌ A template named "${name}" already exists! Use a different name or delete the existing one first.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const exampleTemplate: Template = {
      name: name,
      title: "Your Title Here",
      message: "Your message here\nSupports multiple lines",
      color: "#FFD700",
      thumbnail: undefined,
      image: undefined,
      footer: `Template: ${name}`,
    };

    data.templates[name] = exampleTemplate;
    saveAnnouncementData(data);

    await interaction.reply({
      content: `✅ **Template "${name}" created!**\n\nUse \`/admin announcement template action:edit name:${name} ...\` to modify it.`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (action === "edit") {
    const field = interaction.options.getString("edit_field");
    const value = interaction.options.getString("new_value");

    if (!name || !field || value === null) {
      await interaction.reply({
        content:
          "❌ For editing, you must provide the template name, the field to edit, and the new value!",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (!data.templates[name]) {
      await interaction.reply({
        content: `❌ Template "${name}" not found!`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    (data.templates[name] as any)[field] = value;
    saveAnnouncementData(data);

    await interaction.reply({
      content: `✅ Template "${name}" updated! Field \`${field}\` is now set to \`${value}\`.`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (action === "list") {
    const templates = Object.values(data.templates);
    if (templates.length === 0) {
      await interaction.reply({
        content: "📝 No templates saved yet.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor("#FFD700")
      .setTitle("📝 Saved Announcement Templates")
      .setDescription(
        templates.map((t) => `**${t.name}**\n└ ${t.title}`).join("\n\n"),
      )
      .setFooter({ text: `Total: ${templates.length} templates` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    return;
  }

  if (action === "use") {
    if (!name || !channel) {
      await interaction.reply({
        content: "❌ Please provide both template name and channel!",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const template = data.templates[name];
    if (!template) {
      await interaction.reply({
        content: `❌ Template "${name}" not found!`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const color = parseInt(template.color.replace("#", ""), 16);
    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle(`📢 ${template.title}`)
      .setDescription(template.message)
      .setFooter({
        text: template.footer || `Announced by ${interaction.user.tag}`,
      })
      .setTimestamp();

    if (template.thumbnail) embed.setThumbnail(template.thumbnail);
    if (template.image) embed.setImage(template.image);

    if (!("send" in channel)) {
      await interaction.reply({
        content: "❌ The channel must be a text channel!",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await (channel as TextChannel).send({ embeds: [embed] });
    addToAnnouncementHistory(
      interaction.guildId!,
      channel.id,
      interaction.user.id,
      interaction.user.tag,
      template.title,
    );

    await interaction.reply({
      content: `✅ Template "${name}" sent to ${channel}!`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (action === "delete") {
    if (!name) {
      await interaction.reply({
        content: "❌ Please provide a template name!",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (!data.templates[name]) {
      await interaction.reply({
        content: `❌ Template "${name}" not found!`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    delete data.templates[name];
    saveAnnouncementData(data);

    await interaction.reply({
      content: `✅ Template "${name}" deleted!`,
      flags: MessageFlags.Ephemeral,
    });
  }
}

async function handleAnnouncementHistory(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  const limit = interaction.options.getInteger("limit") || 10;
  const data = loadAnnouncementData();

  const guildHistory = data.history.filter(
    (h) => h.guildId === interaction.guildId,
  );

  if (guildHistory.length === 0) {
    await interaction.reply({
      content: "📜 No announcement history found for this server.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const entries = guildHistory.slice(0, limit);

  const embed = new EmbedBuilder()
    .setColor("#FFD700")
    .setTitle("📜 Announcement History")
    .setDescription(
      entries
        .map((entry, i) => {
          const date = new Date(entry.timestamp);
          return `**${i + 1}.** ${entry.title}\n└ By ${entry.authorTag} in <#${entry.channelId}>\n└ <t:${Math.floor(entry.timestamp / 1000)}:R>`;
        })
        .join("\n\n"),
    )
    .setFooter({
      text: `Showing ${entries.length} of ${guildHistory.length} announcements`,
    })
    .setTimestamp();

  await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
}

// =============== LOGS HANDLERS ===============
async function handleLogs(
  interaction: ChatInputCommandInteraction,
  subcommand: string,
): Promise<void> {
  if (!interaction.guild) {
    await interaction.reply({
      content: "❌ This command can only be used in a server!",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (subcommand === "set") {
    const channel = interaction.options.getChannel("channel", true);

    const config = {
      channelId: channel.id,
      enabled: true,
      types: [
        "command",
        "error",
        "welcome",
        "leave",
        "economy",
        "bounty",
        "mining",
        "gambling",
        "admin",
      ],
    };

    setLogConfig(interaction.guild.id, config);

    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle(`✅ ${t(interaction, "logs_configured")}`)
      .setDescription(t(interaction, "logs_channel_set"))
      .addFields(
        {
          name: `📢 ${t(interaction, "announce_channel")}`,
          value: `<#${channel.id}>`,
          inline: false,
        },
        {
          name: `📋 ${t(interaction, "logs_events_tracked")}`,
          value: `✅ ${t(interaction, "logs_member_join")}\n✅ ${t(interaction, "logs_member_leave")}\n✅ ${t(interaction, "logs_message_delete")}\n✅ ${t(interaction, "logs_message_edit")}`,
          inline: false,
        },
      )
      .setFooter({
        text: t(interaction, "logs_title"),
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  } else if (subcommand === "view") {
    const config = getLogConfig(interaction.guild.id);

    if (!config) {
      await interaction.reply({
        content: `❌ ${t(interaction, "logs_not_configured")}`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const statusText = config.enabled
      ? `✅ ${t(interaction, "logs_enabled")}`
      : `❌ ${t(interaction, "logs_disabled")}`;

    const embed = new EmbedBuilder()
      .setColor(config.enabled ? 0x00ff00 : 0x808080)
      .setTitle(`🛡️ ${t(interaction, "logs_current_config")}`)
      .addFields(
        {
          name: `📊 ${t(interaction, "logs_status")}`,
          value: statusText,
          inline: true,
        },
        {
          name: `📢 ${t(interaction, "announce_channel")}`,
          value: `<#${config.channelId}>`,
          inline: true,
        },
        {
          name: `📋 ${t(interaction, "logs_events_tracked")}`,
          value:
            `✅ ${t(interaction, "logs_member_join")}\n` +
            `✅ ${t(interaction, "logs_member_leave")}\n` +
            `✅ ${t(interaction, "logs_message_delete")}\n` +
            `✅ ${t(interaction, "logs_message_edit")}`,
          inline: false,
        },
      )
      .setFooter({ text: t(interaction, "logs_title") });

    if (config.updatedAt) {
      embed.setTimestamp(config.updatedAt);
    }

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  } else if (subcommand === "disable") {
    const config = getLogConfig(interaction.guild.id);

    if (!config) {
      await interaction.reply({
        content: `❌ ${t(interaction, "logs_not_configured")}`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    removeLogConfig(interaction.guild.id);

    const embed = new EmbedBuilder()
      .setColor(0xff0000)
      .setTitle(`❌ ${t(interaction, "logs_removed")}`)
      .setDescription(t(interaction, "logs_removed_description"))
      .setTimestamp()
      .setFooter({ text: t(interaction, "logs_title") });

    await interaction.reply({ embeds: [embed] });
  }
}

// =============== WANTED HANDLERS ===============
async function handleWanted(
  interaction: ChatInputCommandInteraction,
  subcommand: string,
): Promise<void> {
  if (!interaction.guild) {
    await interaction.reply({
      content: "❌ This command can only be used in a server!",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (subcommand === "set") {
    const channel = interaction.options.getChannel("channel", true);

    if (!channel || !("send" in channel)) {
      await interaction.reply({
        content: "❌ The channel must be a text channel!",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    setWantedConfig(interaction.guild.id, {
      enabled: true,
      channelId: channel.id,
    });

    const embed = new EmbedBuilder()
      .setColor("#57F287")
      .setTitle("✅ Wanted Channel Configured!")
      .setDescription(`Wanted posters will now be posted in ${channel}`)
      .addFields(
        { name: "📢 Channel", value: `${channel}`, inline: true },
        {
          name: "🎯 Purpose",
          value: "Sheriff bounties & fugitives",
          inline: true,
        },
      )
      .setFooter({
        text: "Automatic wanted posters from /bankrob escapes will appear here!",
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  } else if (subcommand === "view") {
    const config = getWantedConfig(interaction.guild.id);

    if (!config || !config.enabled) {
      const embed = new EmbedBuilder()
        .setColor("#808080")
        .setTitle("📋 Wanted Channel Configuration")
        .setDescription(
          "Wanted poster channel is not configured.\n\n**Fallback:** Will use logs channel if configured.",
        )
        .addFields({
          name: "💡 Setup",
          value: "Use `/admin wanted set` to configure a channel",
          inline: false,
        })
        .setTimestamp();

      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const channel = interaction.guild.channels.cache.get(config.channelId);
    const channelText = channel
      ? `${channel}`
      : `Unknown channel (${config.channelId})`;

    const embed = new EmbedBuilder()
      .setColor("#FFD700")
      .setTitle("📋 Wanted Channel Configuration")
      .setDescription("Wanted poster channel is currently active.")
      .addFields(
        { name: "📢 Channel", value: channelText, inline: true },
        { name: "✅ Status", value: "Enabled", inline: true },
      )
      .setFooter({ text: "Use /admin wanted disable to turn off" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  } else if (subcommand === "disable") {
    const config = getWantedConfig(interaction.guild.id);

    if (!config || !config.enabled) {
      await interaction.reply({
        content: "⚠️ Wanted poster channel is already disabled!",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    setWantedConfig(interaction.guild.id, {
      enabled: false,
      channelId: null,
    });

    const embed = new EmbedBuilder()
      .setColor("#FFA500")
      .setTitle("⚠️ Wanted Channel Disabled")
      .setDescription(
        "Wanted posters will no longer be posted automatically.\n\n**Fallback:** Will use logs channel if configured.",
      )
      .setFooter({ text: "Use /admin wanted set to re-enable" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}

// =============== AUTOMOD HANDLERS ===============
async function handleAutoMod(
  interaction: ChatInputCommandInteraction,
  subcommand: string,
): Promise<void> {
  if (subcommand === "setup") {
    await interaction.deferReply();

    try {
      const guild = interaction.guild!;
      const logChannel = interaction.options.getChannel("log-channel");

      const rules = await AutoModManager.setupDefaultRules(
        guild,
        logChannel?.id,
      );

      const embed = new EmbedBuilder()
        .setColor(Colors.Green)
        .setTitle("🛡️ AutoMod Rules Created!")
        .setDescription(
          `Successfully created ${rules.length} AutoMod rules in **${guild.name}**`,
        )
        .addFields(
          rules.map((rule) => ({
            name: rule.name,
            value: `✅ Active`,
            inline: true,
          })),
        )
        .setFooter({
          text: "These rules help protect your server and earn the AutoMod badge!",
        })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error: any) {
      const errorEmbed = new EmbedBuilder()
        .setColor(Colors.Red)
        .setTitle("❌ Setup Failed")
        .setDescription(error.message || "Failed to create AutoMod rules")
        .setFooter({
          text: 'Make sure the bot has "Manage Server" permission',
        });

      await interaction.editReply({ embeds: [errorEmbed] });
    }
  } else if (subcommand === "status") {
    await interaction.deferReply();

    try {
      const info = await AutoModManager.getDetailedRulesInfo(
        interaction.client,
      );

      const progressBar = createProgressBar(info.badgeProgress);
      const badgeStatus =
        info.totalRules >= 100
          ? "✅ **Badge Earned!** (may take 12-24h to appear)"
          : `📊 **Progress:** ${info.totalRules}/100 rules`;

      const embed = new EmbedBuilder()
        .setColor(info.totalRules >= 100 ? Colors.Gold : Colors.Blue)
        .setTitle("🛡️ AutoMod Badge Progress")
        .setDescription(badgeStatus)
        .addFields(
          { name: "📈 Total Rules", value: `${info.totalRules}`, inline: true },
          {
            name: "🏛️ Servers with Rules",
            value: `${info.guildsWithRules}/${info.totalGuilds}`,
            inline: true,
          },
          {
            name: "🎯 Badge Progress",
            value: `${info.badgeProgress.toFixed(1)}%`,
            inline: true,
          },
          { name: "\u200B", value: progressBar, inline: false },
        )
        .setFooter({
          text: "Use /admin automod setup to create rules in more servers",
        })
        .setTimestamp();

      if (info.rulesPerGuild.size > 0) {
        const topServers = Array.from(info.rulesPerGuild.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, count]) => `• **${name}**: ${count} rules`)
          .join("\n");

        embed.addFields({
          name: "🏆 Top Servers",
          value: topServers || "No servers with rules yet",
          inline: false,
        });
      }

      await interaction.editReply({ embeds: [embed] });
    } catch (error: any) {
      const errorEmbed = new EmbedBuilder()
        .setColor(Colors.Red)
        .setTitle("❌ Status Check Failed")
        .setDescription(error.message || "Failed to fetch AutoMod status");

      await interaction.editReply({ embeds: [errorEmbed] });
    }
  } else if (subcommand === "clear") {
    await interaction.deferReply();

    try {
      const guild = interaction.guild!;
      const deletedCount = await AutoModManager.clearGuildRules(guild);

      const embed = new EmbedBuilder()
        .setColor(Colors.Orange)
        .setTitle("🗑️ AutoMod Rules Cleared")
        .setDescription(
          `Removed ${deletedCount} AutoMod rules from **${guild.name}**`,
        )
        .setFooter({ text: "Use /admin automod setup to create new rules" })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error: any) {
      const errorEmbed = new EmbedBuilder()
        .setColor(Colors.Red)
        .setTitle("❌ Clear Failed")
        .setDescription(error.message || "Failed to clear AutoMod rules");

      await interaction.editReply({ embeds: [errorEmbed] });
    }
  }
}

// =============== AUTOMODALL HANDLERS (Owner Only) ===============
async function handleAutoModAll(
  interaction: ChatInputCommandInteraction,
  subcommand: string,
): Promise<void> {
  if (subcommand === "setup") {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const client = interaction.client;
    const guilds = Array.from(client.guilds.cache.values());
    let successCount = 0;
    let failCount = 0;
    let totalRulesCreated = 0;
    const results: string[] = [];

    const progressEmbed = new EmbedBuilder()
      .setColor(Colors.Blue)
      .setTitle("🛡️ Setting up AutoMod...")
      .setDescription(`Processing ${guilds.length} servers...`)
      .setTimestamp();

    await interaction.editReply({ embeds: [progressEmbed] });

    for (const guild of guilds) {
      try {
        const rules = await AutoModManager.setupDefaultRules(guild);
        successCount++;
        totalRulesCreated += rules.length;
        results.push(`✅ **${guild.name}**: ${rules.length} rules created`);
      } catch (error: any) {
        failCount++;
        const errorMsg = error.message?.includes("permission")
          ? "Missing permissions"
          : "Failed";
        results.push(`❌ **${guild.name}**: ${errorMsg}`);
      }
    }

    const finalInfo = await AutoModManager.getDetailedRulesInfo(client);
    const badgeStatus =
      finalInfo.totalRules >= 100
        ? "🎉 **BADGE EARNED!** Wait 12-24h for it to appear on the bot profile"
        : `Need ${100 - finalInfo.totalRules} more rules for the badge`;

    const resultEmbed = new EmbedBuilder()
      .setColor(finalInfo.totalRules >= 100 ? Colors.Gold : Colors.Green)
      .setTitle("🛡️ AutoMod Setup Complete!")
      .setDescription(badgeStatus)
      .addFields(
        {
          name: "📊 Summary",
          value: `✅ Success: ${successCount}\n❌ Failed: ${failCount}\n📈 Total Rules: ${finalInfo.totalRules}`,
          inline: false,
        },
        {
          name: "📝 Details",
          value:
            results.slice(0, 10).join("\n") +
            (results.length > 10
              ? `\n*...and ${results.length - 10} more*`
              : ""),
          inline: false,
        },
      )
      .setFooter({
        text: `Created ${totalRulesCreated} new rules across ${successCount} servers`,
      })
      .setTimestamp();

    await interaction.editReply({ embeds: [resultEmbed] });
  } else if (subcommand === "clear") {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const client = interaction.client;
    const guilds = Array.from(client.guilds.cache.values());
    let totalDeleted = 0;
    let processedCount = 0;

    const progressEmbed = new EmbedBuilder()
      .setColor(Colors.Orange)
      .setTitle("🗑️ Clearing AutoMod rules...")
      .setDescription(`Processing ${guilds.length} servers...`)
      .setTimestamp();

    await interaction.editReply({ embeds: [progressEmbed] });

    for (const guild of guilds) {
      try {
        const deleted = await AutoModManager.clearGuildRules(guild);
        totalDeleted += deleted;
        processedCount++;
      } catch (error) {
        console.error(`Failed to clear rules in ${guild.name}:`, error);
      }
    }

    const resultEmbed = new EmbedBuilder()
      .setColor(Colors.Orange)
      .setTitle("🗑️ AutoMod Rules Cleared!")
      .setDescription(
        `Removed ${totalDeleted} rules from ${processedCount} servers`,
      )
      .setFooter({ text: "Use /admin automodall setup to create new rules" })
      .setTimestamp();

    await interaction.editReply({ embeds: [resultEmbed] });
  }
}

// =============== SIMPLE COMMAND HANDLERS ===============
async function handleGenerateCode(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  if (interaction.user.id !== OWNER_ID) {
    await interaction.reply({
      content: "❌ This command is only available to the bot owner!",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const productId = interaction.options.getString("product", true);

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  try {
    const PRODUCTS: Record<string, Product> = {
      starter: {
        name: "Starter Pack",
        tokens: 100,
        coins: 5000,
        vip: false,
        background: false,
      },
      popular: {
        name: "Popular Pack",
        tokens: 350,
        coins: 15000,
        vip: false,
        background: false,
      },
      gold: {
        name: "Gold Pack",
        tokens: 900,
        coins: 40000,
        vip: true,
        background: false,
      },
      ultimate: {
        name: "Ultimate Pack",
        tokens: 2500,
        coins: 100000,
        vip: true,
        background: true,
      },
      backpack_200: {
        name: "Small Backpack",
        tokens: 0,
        coins: 0,
        vip: false,
        background: false,
        backpack: 200,
      },
      backpack_300: {
        name: "Medium Backpack",
        tokens: 0,
        coins: 0,
        vip: false,
        background: false,
        backpack: 300,
      },
      backpack_400: {
        name: "Large Backpack",
        tokens: 0,
        coins: 0,
        vip: false,
        background: false,
        backpack: 400,
      },
      backpack_500: {
        name: "Ultimate Backpack",
        tokens: 0,
        coins: 0,
        vip: false,
        background: false,
        backpack: 500,
      },
    };

    const product = PRODUCTS[productId];
    const code = generateRedemptionCode(productId);

    const redemptionCodes = loadRedemptionCodes();

    redemptionCodes[code] = {
      productId: productId,
      productName: product.name,
      tokens: product.tokens,
      coins: product.coins,
      vip: product.vip,
      background: product.background,
      backpack: product.backpack || false,
      createdAt: Date.now(),
      createdBy: interaction.user.id,
      redeemed: false,
    };

    saveRedemptionCodes(redemptionCodes);

    const embed = new EmbedBuilder()
      .setColor("#FFD700")
      .setTitle("✅ Redemption Code Generated!")
      .setDescription(`**${product.name}** code created successfully!`)
      .addFields(
        { name: "🔑 Redemption Code", value: `\`${code}\``, inline: false },
        {
          name: "🎫 Saloon Tokens",
          value: `${product.tokens.toLocaleString()}`,
          inline: true,
        },
        {
          name: "🪙 Silver Coins",
          value: `${product.coins.toLocaleString()}`,
          inline: true,
        },
        { name: "\u200b", value: "\u200b", inline: true },
      )
      .setFooter({ text: "This code can be redeemed once using /redeem" })
      .setTimestamp();

    if (product.vip) {
      embed.addFields({
        name: "🌟 VIP Status",
        value: "Included",
        inline: true,
      });
    }

    if (product.background) {
      embed.addFields({
        name: "🎨 Exclusive Background",
        value: "Included",
        inline: true,
      });
    }

    if (product.backpack) {
      const capacity =
        typeof product.backpack === "number" ? product.backpack : 500;
      embed.addFields({
        name: "🎒 Backpack Upgrade",
        value: `Capacity: ${capacity}kg`,
        inline: true,
      });
    }

    await interaction.editReply({ embeds: [embed] });

    console.log(
      `📝 Code generated: ${code} for ${product.name} by ${interaction.user.tag}`,
    );
  } catch (error) {
    console.error("Error generating code:", error);
    await interaction.editReply({
      content: `❌ Error generating code: ${error instanceof Error ? error.message : "Unknown error"}`,
    });
  }
}

async function handleIdioma(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  const locale = getLocale(interaction);

  const cowboyEmoji = getCowboyEmoji();
  const messages: Record<string, LocaleMessages> = {
    "pt-BR": {
      title: "🌍 DETECÇÃO DE IDIOMA",
      desc: "Seu idioma foi detectado como **Português (Brasil)**!\n\nO bot irá responder automaticamente em português para você.",
      detected: "Idioma Detectado",
      how: "Como funciona?",
      howDesc:
        "O Discord informa ao bot qual idioma você usa. O bot detecta automaticamente e responde na sua língua!",
      supported: "Idiomas Suportados",
      supportedList:
        "🇧🇷 Português (Brasil)\n🇺🇸 English (USA)\n🇪🇸 Español (España)",
      footer: `${cowboyEmoji} Olá, parceiro!`,
    },
    "en-US": {
      title: "🌍 LANGUAGE DETECTION",
      desc: "Your language was detected as **English (USA)**!\n\nThe bot will automatically respond in English for you.",
      detected: "Detected Language",
      how: "How does it work?",
      howDesc:
        "Discord tells the bot which language you use. The bot automatically detects and responds in your language!",
      supported: "Supported Languages",
      supportedList:
        "🇧🇷 Português (Brasil)\n🇺🇸 English (USA)\n🇪🇸 Español (España)",
      footer: `${cowboyEmoji} Howdy, partner!`,
    },
    "es-ES": {
      title: "🌍 DETECCIÓN DE IDIOMA",
      desc: "¡Tu idioma fue detectado como **Español (España)**!\n\nEl bot responderá automáticamente en español para ti.",
      detected: "Idioma Detectado",
      how: "¿Cómo funciona?",
      howDesc:
        "Discord le dice al bot qué idioma usas. ¡El bot detecta automáticamente y responde en tu idioma!",
      supported: "Idiomas Soportados",
      supportedList:
        "🇧🇷 Português (Brasil)\n🇺🇸 English (USA)\n🇪🇸 Español (España)",
      footer: "¡Hola, compadre!",
    },
  };

  const msg = messages[locale];

  const embed = new EmbedBuilder()
    .setColor("#00FF00")
    .setTitle(msg.title)
    .setDescription(msg.desc)
    .addFields(
      { name: msg.detected, value: `\`${locale}\``, inline: true },
      { name: msg.how, value: msg.howDesc, inline: false },
      { name: msg.supported, value: msg.supportedList, inline: false },
    )
    .setFooter({ text: msg.footer })
    .setTimestamp();

  await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
}

async function handleMigrate(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  if (interaction.user.id !== OWNER_ID) {
    await interaction.reply({
      content: "❌ This command is only available to the bot owner!",
      flags: [MessageFlags.Ephemeral],
    });
    return;
  }

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  try {
    if (!fs.existsSync(economyFile)) {
      await interaction.editReply({
        content: "❌ Economy file not found! Nothing to migrate.",
      });
      return;
    }

    const economyData: Record<string, number> = JSON.parse(
      fs.readFileSync(economyFile, "utf8"),
    );

    let migrated = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const [userId, balance] of Object.entries(economyData)) {
      if (balance > 0) {
        const result = addItem(userId, "saloon_token", balance);

        if (result.success) {
          migrated++;
        } else {
          failed++;
          errors.push(`User ${userId}: ${result.error}`);
        }
      }
    }

    fs.copyFileSync(economyFile, backupFile);

    fs.writeFileSync(economyFile, JSON.stringify({}, null, 2));

    const embed = new EmbedBuilder()
      .setColor(failed > 0 ? "#FFD700" : "#00FF00")
      .setTitle("✅ Migration Complete!")
      .setDescription(
        `Successfully migrated old economy balances to inventory system.`,
      )
      .addFields(
        {
          name: "✅ Successfully Migrated",
          value: `${migrated} users`,
          inline: true,
        },
        { name: "❌ Failed", value: `${failed} users`, inline: true },
        { name: "📁 Backup", value: `economy.backup.json`, inline: false },
      )
      .setTimestamp();

    if (errors.length > 0 && errors.length <= 5) {
      embed.addFields({
        name: "⚠️ Errors",
        value: errors.slice(0, 5).join("\n"),
      });
    }

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error("Migration error:", error);
    await interaction.editReply({
      content: `❌ Migration failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    });
  }
}

async function handleServidor(
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

async function handleUploadEmojis(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  if (!interaction.guild) {
    await interaction.editReply({
      content: "❌ This command can only be used in a server!",
    });
    return;
  }

  const action = interaction.options.getString("action", true);

  try {
    let results;
    let title: string;
    let successLabel: string;

    if (action === "sync") {
      results = await syncServerEmojis(interaction.guild);
      title = "🔄 Emoji Synchronization Results";
      successLabel = "✅ Successfully Synced";
    } else if (action === "upload") {
      results = await uploadCustomEmojis(interaction.guild);
      title = "🎨 Custom Emoji Upload Results";
      successLabel = "✅ Successfully Uploaded/Updated";
    } else {
      results = await removeAllCustomEmojis(interaction.guild);
      title = "🗑️ Custom Emoji Removal Results";
      successLabel = "✅ Successfully Removed";
    }

    const embed = new EmbedBuilder()
      .setColor(results.failed === 0 ? "#00FF00" : "#FFA500")
      .setTitle(title)
      .setTimestamp();

    embed.addFields(
      {
        name: successLabel,
        value: `${results.success} emoji(s)`,
        inline: true,
      },
      {
        name: "❌ Failed",
        value: `${results.failed} emoji(s)`,
        inline: true,
      },
    );

    if (results.errors.length > 0) {
      const errorText = results.errors.slice(0, 10).join("\n");
      embed.addFields({
        name: "⚠️ Errors",
        value: `\`\`\`${errorText}\`\`\``,
        inline: false,
      });

      if (results.errors.length > 10) {
        embed.setFooter({
          text: `... and ${results.errors.length - 10} more errors`,
        });
      }
    }

    if (action === "upload") {
      const availableEmojis = listCustomEmojis();
      if (availableEmojis.length > 0) {
        embed.addFields({
          name: "📋 Available Custom Emojis",
          value: availableEmojis.map((name) => `\`${name}\``).join(", "),
          inline: false,
        });
      }
    }

    await interaction.editReply({ embeds: [embed] });
  } catch (error: any) {
    console.error("Error managing emojis:", error);

    const errorEmbed = new EmbedBuilder()
      .setColor("#FF0000")
      .setTitle("❌ Operation Failed")
      .setDescription(
        `An error occurred while managing emojis:\n\`\`\`${error.message}\`\`\``,
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [errorEmbed] });
  }
}
