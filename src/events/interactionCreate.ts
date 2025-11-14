import {
  Events,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  EmbedBuilder,
  Interaction,
  MessageFlags,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  AttachmentBuilder,
  UserSelectMenuBuilder,
} from "discord.js";
import { handleInteractionError } from "../utils/errors";
import { componentRegistry } from "../interactions";
import { setUserBio, setUserPhrase } from "../utils/profileManager";
import { handleGuildButtons } from "./interaction-handlers/buttons/guildManagement";
import { handleProfileModals } from "./interaction-handlers/modals/profileModals";
import {
  getUserBackgrounds,
  purchaseBackground,
  setUserBackground as setBgActive,
  getBackgroundById,
  getRarityEmoji,
  getAllBackgrounds,
  userOwnsBackground,
  getRarityColor,
} from "../utils/backgroundManager";
import {
  getAllFrames,
  getAllFramesTranslated,
  getFrameById,
  userOwnsFrame,
  purchaseFrame,
  setActiveFrame,
  getUserFrames,
  getRarityColor as getFrameRarityColor,
  getRarityEmoji as getFrameRarityEmoji,
} from "../utils/frameManager";
import { getUserGold } from "../utils/dataManager";
import {
  createGuild,
  getUserGuild,
  getPublicGuilds,
  joinGuild,
  leaveGuild,
  approveJoinRequest,
  rejectJoinRequest,
  getRequestById,
  kickMember,
  promoteMember,
  demoteMember,
} from "../utils/guildManager";
import { tUser } from "../utils/i18n";
import path from "path";
import fs from "fs";
import { getSaloonTokenEmoji } from "../utils/customEmojis";
import { getInventory, saveInventory } from "../utils/inventoryManager";

/**
 * ComponentRegistry Integration:
 * 
 * The registry is now integrated and will be checked BEFORE legacy handlers.
 * All shop, carousel, and profile handlers have been migrated to the ComponentRegistry.
 * 
 * ✅ FULLY MIGRATED:
 * - Profile handlers (edit_bio, edit_phrase, change_background, profile_show_public)
 * - Shop entry handlers (shop_backgrounds, shop_frames, change_frame)
 * - Carousel navigation (carousel_*, frame_carousel_*)
 * - Purchase handlers (buy_bg_*, buy_frame_*)
 * 
 * See src/events/interaction-handlers/ for handler implementations.
 */

export = {
  name: Events.InteractionCreate,
  async execute(interaction: Interaction): Promise<void> {
    try {
    if (interaction.isButton()) {
      // Ignore duel, mining and expedition buttons - they are handled by their command collectors
      if (
        interaction.customId.startsWith("duel_") ||
        interaction.customId.startsWith("mine_") ||
        interaction.customId.startsWith("join_mining") ||
        interaction.customId.startsWith("claim_mining") ||
        interaction.customId.startsWith("expedition_")
      ) {
        return;
      }

      // Try ComponentRegistry first (migrated handlers)
      const handled = await componentRegistry.handleButton(interaction);
      if (handled) {
        return; // Handler found and executed successfully
      }

      // Try guild management handlers
      const guildHandled = await handleGuildButtons(interaction);
      if (guildHandled) {
        return;
      }

      // Fall through to legacy handlers below...
      // ✅ MIGRATED to ComponentRegistry: edit_bio, edit_phrase, change_background, profile_show_public,
      //    shop_backgrounds, shop_frames, change_frame, carousel navigation, purchase handlers
      // ✅ MIGRATED to guildManagement: guild_approve, guild_reject, guild_info, guild_members,
      //    guild_leave, kick_member, promote_member, demote_member

      // Warehouse buttons
      if (
        interaction.customId === "warehouse_sell" ||
        interaction.customId === "warehouse_buy" ||
        interaction.customId === "warehouse_refresh" ||
        interaction.customId === "warehouse_back"
      ) {
        const { handleWarehouseButtons } = await import(
          "../commands/economy/armazem"
        );
        await handleWarehouseButtons(interaction);
      }

      // REMOVED: Guild handlers migrated to guildManagement.ts
      // Guild approve/reject/info/members/leave/kick/promote/demote are now handled by handleGuildButtons()
    }

    // Select Menu Handler
    if (interaction.isStringSelectMenu()) {
      // Try ComponentRegistry first (migrated handlers)
      const handled = await componentRegistry.handleSelectMenu(interaction);
      if (handled) {
        return; // Handler found and executed successfully
      }

      // Fall through to legacy handlers below...

      // Warehouse select menus
      if (
        interaction.customId === "warehouse_sell_select" ||
        interaction.customId === "warehouse_buy_select"
      ) {
        const { handleWarehouseSelects } = await import(
          "../commands/economy/armazem"
        );
        await handleWarehouseSelects(interaction);
        return;
      }

      // Help Category Select Menu
      if (interaction.customId === "help_category_select") {
        const helpCommandModule = await import("../commands/utility/help");
        const helpCommand = helpCommandModule.default || helpCommandModule;
        if (helpCommand.handleSelectMenu) {
          await helpCommand.handleSelectMenu(interaction);
        }
        return;
      }

      if (interaction.customId === "select_frame") {
        const selectedFrameId = interaction.values[0];

        if (selectedFrameId === "no_frame") {
          // Remove frame
          setActiveFrame(interaction.user.id, null);

          await interaction.update({
            embeds: [
              new EmbedBuilder()
                .setColor("#57F287")
                .setTitle("✅ Moldura Removida")
                .setDescription("Sua moldura foi removida com sucesso! Use `/profile` para ver.")
                .setTimestamp(),
            ],
            components: [],
          });
          return;
        }

        const frame = getFrameById(selectedFrameId);

        if (!frame) {
          await interaction.reply({
            content: "❌ Moldura não encontrada!",
            flags: MessageFlags.Ephemeral,
          });
          return;
        }

        if (!userOwnsFrame(interaction.user.id, selectedFrameId)) {
          await interaction.reply({
            content: "❌ Você não possui esta moldura!",
            flags: MessageFlags.Ephemeral,
          });
          return;
        }

        setActiveFrame(interaction.user.id, selectedFrameId);

        await interaction.update({
          embeds: [
            new EmbedBuilder()
              .setColor("#57F287")
              .setTitle("✅ Moldura Equipada")
              .setDescription(`Você equipou a moldura **${frame.name}**! Use \`/profile\` para ver.`)
              .setTimestamp(),
          ],
          components: [],
        });
      }

      if (interaction.customId === "select_background") {
        const selectedBgId = interaction.values[0];
        const background = getBackgroundById(selectedBgId);

        if (!background) {
          await interaction.reply({
            content: "❌ Background not found!",
            flags: MessageFlags.Ephemeral,
          });
          return;
        }

        const result = setBgActive(interaction.user.id, selectedBgId);

        if (result.success) {
          const embed = new EmbedBuilder()
            .setColor("#57F287")
            .setTitle("✅ Background Changed!")
            .setDescription(result.message)
            .addFields({
              name: "🎨 Active Background",
              value: `${getRarityEmoji(background.rarity)} ${background.name}`,
              inline: false,
            })
            .setFooter({ text: "Use /profile to see your updated card" })
            .setTimestamp();

          await interaction.update({ embeds: [embed], components: [] });
        } else {
          await interaction.reply({
            content: `❌ ${result.message}`,
            flags: MessageFlags.Ephemeral,
          });
        }
      }

      // Guild Member Management Select Menu
      if (interaction.customId === "guild_member_select") {
        const targetId = interaction.values[0];
        const userGuild = getUserGuild(interaction.user.id);

        if (!userGuild) {
          await interaction.reply({
            content: "❌ Você não está mais em uma guilda!",
            flags: MessageFlags.Ephemeral,
          });
          return;
        }

        const userMember = userGuild.members.find(
          (m) => m.userId === interaction.user.id,
        );
        const targetMember = userGuild.members.find(
          (m) => m.userId === targetId,
        );

        if (!userMember || !targetMember) {
          await interaction.reply({
            content: "❌ Membro não encontrado!",
            flags: MessageFlags.Ephemeral,
          });
          return;
        }

        const isLeader = userMember.role === "leader";
        const isCoLeader = userMember.role === "co-leader";

        const roleEmoji =
          targetMember.role === "leader"
            ? "👑"
            : targetMember.role === "co-leader"
              ? "⭐"
              : "🔷";
        const roleName =
          targetMember.role === "leader"
            ? "Líder"
            : targetMember.role === "co-leader"
              ? "Co-líder"
              : "Membro";

        const manageEmbed = new EmbedBuilder()
          .setColor("#5865F2")
          .setTitle(`${roleEmoji} Gerenciar Membro`)
          .setDescription(`**Membro:** <@${targetId}>\n**Cargo:** ${roleName}`)
          .setFooter({ text: "Selecione uma ação abaixo" })
          .setTimestamp();

        const actionButtons = new ActionRowBuilder<ButtonBuilder>();

        // Botão de expulsar (líder e co-líder podem, mas co-líder não pode expulsar outro co-líder)
        if ((isLeader || isCoLeader) && targetMember.role !== "leader") {
          const canKick =
            isLeader || (isCoLeader && targetMember.role !== "co-leader");
          if (canKick) {
            actionButtons.addComponents(
              new ButtonBuilder()
                .setCustomId(`kick_member_${targetId}`)
                .setLabel("🚫 Expulsar")
                .setStyle(ButtonStyle.Danger),
            );
          }
        }

        // Botões de promover/rebaixar (apenas líder)
        if (isLeader) {
          if (targetMember.role === "member") {
            actionButtons.addComponents(
              new ButtonBuilder()
                .setCustomId(`promote_member_${targetId}`)
                .setLabel("⭐ Promover a Co-líder")
                .setStyle(ButtonStyle.Success),
            );
          } else if (targetMember.role === "co-leader") {
            actionButtons.addComponents(
              new ButtonBuilder()
                .setCustomId(`demote_member_${targetId}`)
                .setLabel("🔻 Rebaixar a Membro")
                .setStyle(ButtonStyle.Secondary),
            );
          }
        }

        if (actionButtons.components.length > 0) {
          await interaction.reply({
            embeds: [manageEmbed],
            components: [actionButtons],
            flags: MessageFlags.Ephemeral,
          });
        } else {
          await interaction.reply({
            content: "❌ Você não tem permissão para gerenciar este membro.",
            flags: MessageFlags.Ephemeral,
          });
        }
      }
    }

    if (interaction.isModalSubmit()) {
      // Try profile modals handler
      const modalHandled = await handleProfileModals(interaction);
      if (modalHandled) {
        return;
      }

      // REMOVED: Modal handlers migrated to profileModals.ts
      // bio_modal, phrase_modal, and guild_create_modal_new are now handled by handleProfileModals()
    }
    } catch (error) {
      if (interaction.isRepliable()) {
        await handleInteractionError(interaction as any, error);
      } else {
        console.error('Error in interaction handler:', error);
      }
    }
  },
};
