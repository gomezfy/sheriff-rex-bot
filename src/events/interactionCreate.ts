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
} from "discord.js";
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

/**
 *
 * @param interaction
 * @param index
 * @param isUpdate
 */
async function showBackgroundCarousel(
  interaction: any,
  index: number,
  isUpdate: boolean = false,
): Promise<void> {
  const allBackgrounds = getAllBackgrounds();
  const bg = allBackgrounds[index];
  const userTokens = getUserGold(interaction.user.id);
  const owned = userOwnsBackground(interaction.user.id, bg.id);

  const saloonEmoji = getSaloonTokenEmoji();
  
  const embed = new EmbedBuilder()
    .setColor(getRarityColor(bg.rarity))
    .setTitle(tUser(interaction.user.id, "bg_shop_title"))
    .setDescription(
      `**${getRarityEmoji(bg.rarity)} ${bg.name}** - ${bg.rarity.toUpperCase()}\n\n${bg.description}\n\n**${tUser(interaction.user.id, "bg_shop_price")}:** ${bg.free ? tUser(interaction.user.id, "bg_shop_free") : `${saloonEmoji} ${bg.price.toLocaleString()} ${tUser(interaction.user.id, "bg_shop_tokens")}`}\n**${tUser(interaction.user.id, "bg_shop_status")}:** ${owned ? tUser(interaction.user.id, "bg_shop_owned") : bg.free ? tUser(interaction.user.id, "bg_shop_available") : userTokens >= bg.price ? tUser(interaction.user.id, "bg_shop_can_purchase") : tUser(interaction.user.id, "bg_shop_not_enough")}\n\n**${tUser(interaction.user.id, "bg_shop_your_tokens")}:** ${saloonEmoji} ${userTokens.toLocaleString()}`,
    )
    .setFooter({
      text: tUser(interaction.user.id, "bg_shop_footer", {
        current: (index + 1).toString(),
        total: allBackgrounds.length.toString(),
      }),
    })
    .setTimestamp();

  // Add background image - use hosted URL if available, otherwise local file
  const files = [];
  if (bg.imageUrl) {
    // Use hosted image URL
    embed.setImage(bg.imageUrl);
  } else {
    // Fallback to local file
    const backgroundsDir = path.join(
      process.cwd(),
      "assets",
      "profile-backgrounds",
    );
    const bgPath = path.join(backgroundsDir, bg.filename);

    if (fs.existsSync(bgPath)) {
      const attachment = new AttachmentBuilder(bgPath, {
        name: `preview.${bg.filename.split(".").pop()}`,
      });
      files.push(attachment);
      embed.setImage(`attachment://preview.${bg.filename.split(".").pop()}`);
    }
  }

  // Navigation and purchase buttons - minimal design
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`carousel_prev_${index}`)
      .setLabel("◀")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(index === 0),
    new ButtonBuilder()
      .setCustomId(`buy_bg_${bg.id}_${index}`)
      .setLabel(
        owned
          ? tUser(interaction.user.id, "bg_shop_btn_owned")
          : bg.free
            ? tUser(interaction.user.id, "bg_shop_btn_claim")
            : "Comprar",
      )
      .setStyle(
        owned
          ? ButtonStyle.Secondary
          : bg.free
            ? ButtonStyle.Success
            : userTokens >= bg.price
              ? ButtonStyle.Primary
              : ButtonStyle.Danger,
      )
      .setDisabled(owned || (bg.free === false && userTokens < bg.price)),
    new ButtonBuilder()
      .setCustomId(`carousel_next_${index}`)
      .setLabel("▶")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(index === allBackgrounds.length - 1),
  );

  if (isUpdate) {
    await interaction.update({ embeds: [embed], files, components: [row] });
  } else {
    await interaction.reply({
      embeds: [embed],
      files,
      components: [row],
      flags: MessageFlags.Ephemeral,
    });
  }
}

export = {
  name: Events.InteractionCreate,
  async execute(interaction: Interaction): Promise<void> {
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

      // Edit Bio Button
      if (interaction.customId === "edit_bio") {
        const modal = new ModalBuilder()
          .setCustomId("bio_modal")
          .setTitle("Edit Your Bio");

        const bioInput = new TextInputBuilder()
          .setCustomId("bio_text")
          .setLabel("About Me (max 200 characters)")
          .setStyle(TextInputStyle.Paragraph)
          .setPlaceholder("A mysterious cowboy wandering the Wild West...")
          .setMaxLength(200)
          .setRequired(true);

        const firstActionRow =
          new ActionRowBuilder<TextInputBuilder>().addComponents(bioInput);
        modal.addComponents(firstActionRow);

        await interaction.showModal(modal);
      }

      // Edit Phrase Button
      if (interaction.customId === "edit_phrase") {
        const modal = new ModalBuilder()
          .setCustomId("phrase_modal")
          .setTitle("Editar Frase do Perfil");

        const phraseInput = new TextInputBuilder()
          .setCustomId("phrase_text")
          .setLabel("Sua frase pessoal (max 100 caracteres)")
          .setStyle(TextInputStyle.Short)
          .setPlaceholder("Ex: O corajoso não teme o desafio...")
          .setMaxLength(100)
          .setRequired(false);

        const firstActionRow =
          new ActionRowBuilder<TextInputBuilder>().addComponents(phraseInput);
        modal.addComponents(firstActionRow);

        await interaction.showModal(modal);
      }

      // Change Background Button
      if (interaction.customId === "change_background") {
        const ownedBackgrounds = getUserBackgrounds(interaction.user.id);

        if (ownedBackgrounds.length === 0) {
          await interaction.reply({
            content:
              '❌ You don\'t own any backgrounds! Click "🛒 Shop Backgrounds" to purchase some.',
            flags: MessageFlags.Ephemeral,
          });
          return;
        }

        const selectMenu = new StringSelectMenuBuilder()
          .setCustomId("select_background")
          .setPlaceholder("Choose a background...")
          .addOptions(
            ownedBackgrounds.map((bg) =>
              new StringSelectMenuOptionBuilder()
                .setLabel(bg.name)
                .setDescription(bg.description.substring(0, 100))
                .setValue(bg.id)
                .setEmoji(getRarityEmoji(bg.rarity)),
            ),
          );

        const row =
          new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            selectMenu,
          );

        const embed = new EmbedBuilder()
          .setColor("#5865F2")
          .setTitle("🎨 Select Background")
          .setDescription("Choose a background from your collection:")
          .setFooter({ text: "Your profile will update automatically" });

        await interaction.reply({
          embeds: [embed],
          components: [row],
          flags: MessageFlags.Ephemeral,
        });
      }

      // Shop Backgrounds Button - Show carousel
      if (interaction.customId === "shop_backgrounds") {
        await showBackgroundCarousel(interaction, 0);
      }

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

      // Carousel Navigation
      if (interaction.customId.startsWith("carousel_")) {
        const [_, action, indexStr] = interaction.customId.split("_");
        const currentIndex = parseInt(indexStr);

        if (action === "next" || action === "prev") {
          const allBackgrounds = getAllBackgrounds();
          let newIndex = currentIndex;

          if (action === "next") {
            newIndex = (currentIndex + 1) % allBackgrounds.length;
          } else {
            newIndex = currentIndex - 1;
            if (newIndex < 0) {
              newIndex = allBackgrounds.length - 1;
            }
          }

          await showBackgroundCarousel(interaction, newIndex, true);
        }
      }

      // Purchase Background Buttons from carousel
      if (interaction.customId.startsWith("buy_bg_")) {
        const parts = interaction.customId.split("_");
        const bgId = parts.slice(2, -1).join("_"); // Handle IDs with underscores
        const currentIndex = parseInt(parts[parts.length - 1]);
        const background = getBackgroundById(bgId);

        if (!background) {
          await interaction.reply({
            content: "❌ Background not found!",
            flags: MessageFlags.Ephemeral,
          });
          return;
        }

        const userTokens = getUserGold(interaction.user.id);
        const result = purchaseBackground(interaction.user.id, bgId);

        if (result.success) {
          // Show success message temporarily
          const successEmbed = new EmbedBuilder()
            .setColor("#57F287")
            .setTitle("✅ Purchase Successful!")
            .setDescription(result.message)
            .addFields(
              { name: "🎨 Background", value: background.name, inline: true },
              {
                name: "💰 Price",
                value: `🎫 ${background.price.toLocaleString()}`,
                inline: true,
              },
              {
                name: "💳 Remaining",
                value: `🎫 ${(userTokens - background.price).toLocaleString()}`,
                inline: true,
              },
            )
            .setFooter({ text: "Returning to shop..." })
            .setTimestamp();

          await interaction.update({
            embeds: [successEmbed],
            files: [],
            components: [],
          });

          // Wait 2 seconds then return to carousel with updated state
          setTimeout(async () => {
            await showBackgroundCarousel(interaction, currentIndex, true);
          }, 2000);
        } else {
          // Show error briefly then return to carousel
          const errorEmbed = new EmbedBuilder()
            .setColor("#ED4245")
            .setTitle("❌ Purchase Failed")
            .setDescription(result.message)
            .setFooter({ text: "Returning to shop..." });

          await interaction.update({
            embeds: [errorEmbed],
            files: [],
            components: [],
          });

          // Wait 2 seconds then return to carousel
          setTimeout(async () => {
            await showBackgroundCarousel(interaction, currentIndex, true);
          }, 2000);
        }
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

        const result = createGuild(
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
  },
};
