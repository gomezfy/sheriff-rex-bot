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
import {
  getCowboyEmoji,
  getScrollEmoji,
  getCancelEmoji,
  getCheckEmoji,
  getTimerEmoji,
} from "../../utils/customEmojis";
import { t } from "../../utils/i18n";
import { isOwner } from "../../utils/security";
import {
  handleLogs,
  handleAnnouncementSend,
  handleAnnouncementTemplate,
  handleAnnouncementHistory,
  handleWanted,
  handleAutoMod,
  handleAutoModAll,
  handleGenerateCode,
  handleIdioma,
  handleMigrate,
  handleServidor,
  handleUploadEmojis,
} from "./handlers";

const OWNER_ID = process.env.OWNER_ID;

// =============== WELCOME HELPER ===============
function isValidUrl(string: string): boolean {
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;
  }
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


