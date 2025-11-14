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

      // Fall through to legacy handlers below...
      // ✅ MIGRATED to ComponentRegistry: edit_bio, edit_phrase, change_background, profile_show_public,
      //    shop_backgrounds, shop_frames, change_frame, carousel navigation, purchase handlers

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

      // Guild Join Request Approve
      if (interaction.customId.startsWith("guild_approve_")) {
        const requestId = interaction.customId.replace("guild_approve_", "");
        const request = getRequestById(requestId);

        if (!request) {
          await interaction.reply({
            content: tUser(interaction.user.id, "guild_request_not_found"),
            flags: MessageFlags.Ephemeral,
          });
          return;
        }

        const result = approveJoinRequest(requestId);

        const embed = new EmbedBuilder()
          .setColor(result.success ? "#57F287" : "#ED4245")
          .setTitle(
            result.success
              ? tUser(interaction.user.id, "guild_request_approved_title")
              : tUser(interaction.user.id, "guild_request_error"),
          )
          .setDescription(result.message)
          .setTimestamp();

        await interaction.update({
          embeds: [embed],
          components: [],
        });

        if (result.success && result.guild) {
          try {
            const applicant = await interaction.client.users.fetch(
              request.userId,
            );

            const notificationEmbed = new EmbedBuilder()
              .setColor("#57F287")
              .setTitle(tUser(applicant.id, "guild_request_accepted_title"))
              .setDescription(
                tUser(applicant.id, "guild_request_accepted_desc").replace(
                  "{guild}",
                  result.guild.name,
                ),
              )
              .setTimestamp();

            await applicant.send({ embeds: [notificationEmbed] });
          } catch (error) {
            console.error("Failed to send DM to applicant:", error);
          }
        }
      }

      // Guild Join Request Reject
      if (interaction.customId.startsWith("guild_reject_")) {
        const requestId = interaction.customId.replace("guild_reject_", "");
        const request = getRequestById(requestId);

        if (!request) {
          await interaction.reply({
            content: tUser(interaction.user.id, "guild_request_not_found"),
            flags: MessageFlags.Ephemeral,
          });
          return;
        }

        const result = rejectJoinRequest(requestId);

        const embed = new EmbedBuilder()
          .setColor(result.success ? "#FFA500" : "#ED4245")
          .setTitle(
            result.success
              ? tUser(interaction.user.id, "guild_request_rejected_title")
              : tUser(interaction.user.id, "guild_request_error"),
          )
          .setDescription(result.message)
          .setTimestamp();

        await interaction.update({
          embeds: [embed],
          components: [],
        });

        if (result.success && result.userId && result.guildName) {
          try {
            const applicant = await interaction.client.users.fetch(
              result.userId,
            );

            const notificationEmbed = new EmbedBuilder()
              .setColor("#ED4245")
              .setTitle(tUser(applicant.id, "guild_request_denied_title"))
              .setDescription(
                tUser(applicant.id, "guild_request_denied_desc").replace(
                  "{guild}",
                  result.guildName,
                ),
              )
              .setTimestamp();

            await applicant.send({ embeds: [notificationEmbed] });
          } catch (error) {
            console.error("Failed to send DM to applicant:", error);
          }
        }
      }

      // Guild Info Button
      if (interaction.customId === "guild_info") {
        const userGuild = getUserGuild(interaction.user.id);

        if (!userGuild) {
          await interaction.reply({
            content: tUser(interaction.user.id, "guild_not_found"),
            flags: MessageFlags.Ephemeral,
          });
          return;
        }

        const embed = new EmbedBuilder()
          .setColor("#5865F2")
          .setTitle(`🏰 ${userGuild.name}`)
          .setDescription(userGuild.description)
          .addFields(
            {
              name: tUser(interaction.user.id, "guild_leader"),
              value: `<@${userGuild.leaderId}>`,
              inline: true,
            },
            {
              name: tUser(interaction.user.id, "guild_members"),
              value: `${userGuild.members.length}/${userGuild.settings.maxMembers}`,
              inline: true,
            },
            {
              name: tUser(interaction.user.id, "guild_level"),
              value: `${userGuild.level}`,
              inline: true,
            },
            {
              name: tUser(interaction.user.id, "guild_xp"),
              value: `${userGuild.xp} XP`,
              inline: true,
            },
            {
              name: tUser(interaction.user.id, "guild_type"),
              value: userGuild.settings.isPublic
                ? tUser(interaction.user.id, "guild_type_public")
                : tUser(interaction.user.id, "guild_type_private"),
              inline: true,
            },
            {
              name: tUser(interaction.user.id, "guild_created"),
              value: `<t:${Math.floor(userGuild.createdAt / 1000)}:R>`,
              inline: true,
            },
          )
          .setTimestamp();

        await interaction.reply({
          embeds: [embed],
          flags: MessageFlags.Ephemeral,
        });
      }

      // Guild Members Button
      if (interaction.customId === "guild_members") {
        const userGuild = getUserGuild(interaction.user.id);

        if (!userGuild) {
          await interaction.reply({
            content: tUser(interaction.user.id, "guild_not_found"),
            flags: MessageFlags.Ephemeral,
          });
          return;
        }

        const membersList = userGuild.members
          .map((member, index) => {
            const roleIcon = member.role === "leader" ? "👑" : "👤";
            const joinedDate = `<t:${Math.floor(member.joinedAt / 1000)}:R>`;
            return `${index + 1}. ${roleIcon} <@${member.userId}> - ${tUser(interaction.user.id, "guild_joined")} ${joinedDate}`;
          })
          .join("\n");

        const embed = new EmbedBuilder()
          .setColor("#FFD700")
          .setTitle(
            tUser(interaction.user.id, "guild_members_title").replace(
              "{guild}",
              userGuild.name,
            ),
          )
          .setDescription(
            membersList || tUser(interaction.user.id, "guild_no_members"),
          )
          .addFields({
            name: tUser(interaction.user.id, "guild_stats"),
            value: `**${tUser(interaction.user.id, "guild_total")}:** ${userGuild.members.length}/${userGuild.settings.maxMembers}`,
            inline: false,
          })
          .setFooter({
            text: `${userGuild.name} • ${tUser(interaction.user.id, "guild_level")} ${userGuild.level}`,
          })
          .setTimestamp();

        await interaction.reply({
          embeds: [embed],
          flags: MessageFlags.Ephemeral,
        });
      }

      // Guild Leave Button
      if (interaction.customId === "guild_leave") {
        const userGuild = getUserGuild(interaction.user.id);

        if (!userGuild) {
          await interaction.reply({
            content: tUser(interaction.user.id, "guild_not_found"),
            flags: MessageFlags.Ephemeral,
          });
          return;
        }

        const result = leaveGuild(interaction.user.id);

        const embed = new EmbedBuilder()
          .setColor(result.success ? "#57F287" : "#ED4245")
          .setTitle(
            result.success
              ? tUser(interaction.user.id, "guild_left_title")
              : tUser(interaction.user.id, "guild_error"),
          )
          .setDescription(result.message)
          .setTimestamp();

        await interaction.reply({
          embeds: [embed],
          flags: MessageFlags.Ephemeral,
        });
      }
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

    if (interaction.isButton()) {
      // Kick Member Button
      if (interaction.customId.startsWith("kick_member_")) {
        const targetId = interaction.customId.replace("kick_member_", "");
        const result = kickMember(interaction.user.id, targetId);

        const embed = new EmbedBuilder()
          .setColor(result.success ? "#57F287" : "#ED4245")
          .setTitle(result.success ? "✅ Membro Expulso" : "❌ Erro")
          .setDescription(result.message)
          .setTimestamp();

        await interaction.update({
          embeds: [embed],
          components: [],
        });
      }

      // Promote Member Button
      if (interaction.customId.startsWith("promote_member_")) {
        const targetId = interaction.customId.replace("promote_member_", "");
        const result = promoteMember(interaction.user.id, targetId);

        const embed = new EmbedBuilder()
          .setColor(result.success ? "#57F287" : "#ED4245")
          .setTitle(result.success ? "✅ Membro Promovido" : "❌ Erro")
          .setDescription(result.message)
          .setTimestamp();

        await interaction.update({
          embeds: [embed],
          components: [],
        });
      }

      // Demote Member Button
      if (interaction.customId.startsWith("demote_member_")) {
        const targetId = interaction.customId.replace("demote_member_", "");
        const result = demoteMember(interaction.user.id, targetId);

        const embed = new EmbedBuilder()
          .setColor(result.success ? "#57F287" : "#ED4245")
          .setTitle(result.success ? "✅ Membro Rebaixado" : "❌ Erro")
          .setDescription(result.message)
          .setTimestamp();

        await interaction.update({
          embeds: [embed],
          components: [],
        });
      }
    }

    if (interaction.isModalSubmit()) {
      if (interaction.customId === "bio_modal") {
        const bioText = interaction.fields.getTextInputValue("bio_text");

        setUserBio(interaction.user.id, bioText);

        const embed = new EmbedBuilder()
          .setColor("#57F287")
          .setTitle("✅ Bio Updated!")
          .setDescription("Your profile bio has been updated successfully.")
          .addFields({ name: "📝 New Bio", value: bioText, inline: false })
          .setFooter({ text: "Use /profile to see your updated card" })
          .setTimestamp();

        await interaction.reply({
          embeds: [embed],
          flags: MessageFlags.Ephemeral,
        });
      }

      if (interaction.customId === "phrase_modal") {
        const phraseText = interaction.fields.getTextInputValue("phrase_text");

        setUserPhrase(interaction.user.id, phraseText);

        const embed = new EmbedBuilder()
          .setColor("#D4AF37")
          .setTitle("✅ Frase Atualizada!")
          .setDescription("Sua frase pessoal foi atualizada com sucesso.")
          .addFields({ name: "💬 Nova Frase", value: phraseText || "*(removida)*", inline: false })
          .setFooter({ text: "Use /profile para ver seu card atualizado" })
          .setTimestamp();

        await interaction.reply({
          embeds: [embed],
          flags: MessageFlags.Ephemeral,
        });
      }

      if (interaction.customId === "guild_create_modal_new") {
        const guildName = interaction.fields.getTextInputValue("guild_name");
        const guildDescription =
          interaction.fields.getTextInputValue("guild_description");
        const privacyInput = interaction.fields
          .getTextInputValue("guild_privacy")
          .toLowerCase()
          .trim();

        let isPublic = true;
        const privateTerms = [
          "privada",
          "private",
          "priv",
          "no",
          "não",
          "nao",
          "false",
        ];
        const publicTerms = [
          "pública",
          "publica",
          "public",
          "pub",
          "yes",
          "sim",
          "true",
        ];

        if (privateTerms.some((term) => privacyInput.includes(term))) {
          isPublic = false;
        } else if (publicTerms.some((term) => privacyInput.includes(term))) {
          isPublic = true;
        } else {
          await interaction.reply({
            content: tUser(interaction.user.id, "guild_invalid_privacy"),
            flags: MessageFlags.Ephemeral,
          });
          return;
        }

        const result = await createGuild(
          interaction.user.id,
          guildName,
          guildDescription,
          isPublic,
        );

        const embed = new EmbedBuilder()
          .setColor(result.success ? "#57F287" : "#ED4245")
          .setTitle(
            result.success
              ? tUser(interaction.user.id, "guild_created_title")
              : "❌ Erro",
          )
          .setDescription(result.message)
          .setTimestamp();

        if (result.success && result.guild) {
          embed.addFields(
            {
              name: `🏰 ${tUser(interaction.user.id, "guild_name")}`,
              value: result.guild.name,
              inline: true,
            },
            {
              name: `👑 ${tUser(interaction.user.id, "guild_leader")}`,
              value: `<@${interaction.user.id}>`,
              inline: true,
            },
            {
              name: `🔓 ${tUser(interaction.user.id, "guild_type")}`,
              value: result.guild.settings.isPublic
                ? tUser(interaction.user.id, "guild_type_public")
                : tUser(interaction.user.id, "guild_type_private"),
              inline: true,
            },
            {
              name: `📝 ${tUser(interaction.user.id, "guild_description")}`,
              value: result.guild.description,
              inline: false,
            },
          );
        }

        await interaction.reply({
          embeds: [embed],
          flags: MessageFlags.Ephemeral,
        });
      }
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
