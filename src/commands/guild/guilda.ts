import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  MessageFlags,
  StringSelectMenuBuilder,
  ComponentType,
  User,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ButtonInteraction,
  StringSelectMenuInteraction,
  Collection,
  Interaction,
} from "discord.js";
import {
  getUserGuild,
  isUserInGuild,
  getAllGuilds,
  createGuild,
  leaveGuild,
  joinGuild,
  createJoinRequest,
  approveJoinRequest,
  rejectJoinRequest,
  getRequestById,
  deleteJoinRequest,
  kickMember,
  promoteMember,
  demoteMember,
} from "../../utils/guildManager";
import { tUser } from "../../utils/i18n";

export default {
  data: new SlashCommandBuilder()
    .setName("guilda")
    .setDescription("🏰 Sistema de Guildas - Crie ou entre em uma guilda!"),

  async execute(interaction: ChatInputCommandInteraction) {
    const userGuild = getUserGuild(interaction.user.id);
    const isInGuild = isUserInGuild(interaction.user.id);

    if (isInGuild && userGuild) {
      const memberCount = userGuild.members.length;
      const maxMembers = userGuild.settings.maxMembers;
      const isLeader = userGuild.leaderId === interaction.user.id;

      const guildEmbed = new EmbedBuilder()
        .setColor("#FFD700")
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
            value: `${memberCount}/${maxMembers}`,
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
        .setFooter({
          text: isLeader
            ? tUser(interaction.user.id, "guild_role_leader")
            : tUser(interaction.user.id, "guild_role_member"),
        })
        .setTimestamp();

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("guild_info")
          .setLabel(tUser(interaction.user.id, "guild_btn_info"))
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("guild_members")
          .setLabel(tUser(interaction.user.id, "guild_btn_members"))
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId("guild_leave")
          .setLabel(tUser(interaction.user.id, "guild_btn_leave"))
          .setStyle(ButtonStyle.Danger),
      );

      await interaction.reply({
        embeds: [guildEmbed],
        components: [row],
        flags: MessageFlags.Ephemeral,
      });

      const guildReply = await interaction.fetchReply();

      // Collector para os botões da guilda
      const guildCollector = guildReply.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 300000, // 5 minutos
      });

      guildCollector.on(
        "collect",
        async (buttonInteraction: ButtonInteraction) => {
          if (buttonInteraction.user.id !== interaction.user.id) {
            await buttonInteraction.reply({
              content: tUser(
                buttonInteraction.user.id,
                "guild_not_your_interaction",
              ),
              flags: MessageFlags.Ephemeral,
            });
            return;
          }

          if (buttonInteraction.customId === "guild_members") {
            // IMPORTANTE: Responder IMEDIATAMENTE para evitar timeout
            await buttonInteraction.deferReply({
              flags: MessageFlags.Ephemeral,
            });

            const currentGuild = getUserGuild(interaction.user.id);
            if (!currentGuild) {
              await buttonInteraction.editReply({
                content: "❌ Você não está mais em uma guilda!",
              });
              return;
            }

            const userMember = currentGuild.members.find(
              (m) => m.userId === interaction.user.id,
            );
            const canManage =
              userMember &&
              (userMember.role === "leader" || userMember.role === "co-leader");

            // Buscar dados atualizados da guilda
            const freshGuild = getUserGuild(interaction.user.id);
            if (!freshGuild) {
              await buttonInteraction.editReply({
                content: "❌ Você não está mais em uma guilda!",
              });
              return;
            }

            // Mostrar lista de membros com botões de ação
            const membersEmbed = new EmbedBuilder()
              .setColor("#FFD700")
              .setTitle(`👥 Membros de ${freshGuild.name}`)
              .setDescription(
                `Total: ${freshGuild.members.length}/${freshGuild.settings.maxMembers} membros`,
              )
              .setTimestamp();

            // Organizar membros por cargo
            const leader = freshGuild.members.find((m) => m.role === "leader");
            const coLeaders = freshGuild.members.filter(
              (m) => m.role === "co-leader",
            );
            const members = freshGuild.members.filter(
              (m) => m.role === "member",
            );

            if (leader) {
              membersEmbed.addFields({
                name: "👑 Líder",
                value: `<@${leader.userId}>`,
                inline: false,
              });
            }

            if (coLeaders.length > 0) {
              membersEmbed.addFields({
                name: "⭐ Co-líderes",
                value: coLeaders.map((m) => `<@${m.userId}>`).join("\n"),
                inline: false,
              });
            }

            if (members.length > 0) {
              membersEmbed.addFields({
                name: "🔷 Membros",
                value: members.map((m) => `<@${m.userId}>`).join("\n"),
                inline: false,
              });
            }

            // Sempre mostrar o menu de gerenciar membros para todos
            const freshUserMember = freshGuild.members.find(
              (m) => m.userId === interaction.user.id,
            );
            const freshCanManage =
              freshUserMember &&
              (freshUserMember.role === "leader" ||
                freshUserMember.role === "co-leader");

            membersEmbed.setFooter({
              text: freshCanManage
                ? "Use o menu abaixo para gerenciar membros"
                : "Use o menu abaixo para visualizar membros",
            });

            // Criar menu de seleção de membros (usar IDs, mais rápido)
            const filteredMembers = freshGuild.members.filter(
              (m) => m.userId !== interaction.user.id,
            );

            if (filteredMembers.length > 0) {
              // Buscar informações dos membros para mostrar @username
              const memberOptions = await Promise.all(
                filteredMembers.slice(0, 25).map(async (m) => {
                  const roleEmoji =
                    m.role === "leader"
                      ? "👑"
                      : m.role === "co-leader"
                        ? "⭐"
                        : "🔷";
                  const roleName =
                    m.role === "leader"
                      ? "Líder"
                      : m.role === "co-leader"
                        ? "Co-líder"
                        : "Membro";

                  let username = m.userId;
                  try {
                    const user = await interaction.client.users.fetch(m.userId);
                    username = user.username;
                  } catch (error) {
                    // Se não conseguir buscar, usa o ID
                  }

                  return {
                    label: `${roleEmoji} @${username}`,
                    description: roleName,
                    value: m.userId,
                  };
                }),
              );

              const memberSelect = new StringSelectMenuBuilder()
                .setCustomId("guild_member_select")
                .setPlaceholder("📋 Selecione um membro para gerenciar")
                .addOptions(memberOptions); // Já limitado a 25 acima

              const selectRow =
                new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
                  memberSelect,
                );

              const memberSelectReply = await buttonInteraction.editReply({
                embeds: [membersEmbed],
                components: [selectRow],
              });

              // Collector para o menu de seleção de membros
              const memberSelectCollector =
                memberSelectReply.createMessageComponentCollector({
                  componentType: ComponentType.StringSelect,
                  time: 120000, // 2 minutos
                });

              memberSelectCollector.on(
                "collect",
                async (selectInteraction: StringSelectMenuInteraction) => {
                  if (selectInteraction.user.id !== interaction.user.id) {
                    await selectInteraction.reply({
                      content: tUser(
                        selectInteraction.user.id,
                        "guild_not_your_interaction",
                      ),
                      flags: MessageFlags.Ephemeral,
                    });
                    return;
                  }

                  // Buscar dados atualizados novamente
                  const latestGuild = getUserGuild(interaction.user.id);
                  if (!latestGuild) {
                    await selectInteraction.reply({
                      content: "❌ Você não está mais em uma guilda!",
                      flags: MessageFlags.Ephemeral,
                    });
                    return;
                  }

                  const latestUserMember = latestGuild.members.find(
                    (m) => m.userId === interaction.user.id,
                  );
                  const latestCanManage =
                    latestUserMember &&
                    (latestUserMember.role === "leader" ||
                      latestUserMember.role === "co-leader");

                  // Verificar permissões PRIMEIRO antes de processar
                  if (!latestCanManage) {
                    await selectInteraction.reply({
                      content:
                        "❌ **Você não tem cargo para isso!**\n\nApenas o líder e co-líderes podem gerenciar membros da guilda.",
                      flags: MessageFlags.Ephemeral,
                    });
                    return;
                  }

                  const selectedUserId = selectInteraction.values[0];
                  const selectedMember = latestGuild.members.find(
                    (m) => m.userId === selectedUserId,
                  );

                  if (!selectedMember) {
                    await selectInteraction.reply({
                      content: "❌ Membro não encontrado!",
                      flags: MessageFlags.Ephemeral,
                    });
                    return;
                  }

                  // Buscar informações do usuário selecionado
                  let selectedUser: User;
                  try {
                    selectedUser =
                      await interaction.client.users.fetch(selectedUserId);
                  } catch (error) {
                    await selectInteraction.reply({
                      content:
                        "❌ Não foi possível buscar informações deste usuário.",
                      flags: MessageFlags.Ephemeral,
                    });
                    return;
                  }

                  // Criar embed com informações do membro selecionado
                  const roleEmoji =
                    selectedMember.role === "leader"
                      ? "👑"
                      : selectedMember.role === "co-leader"
                        ? "⭐"
                        : "🔷";
                  const roleName =
                    selectedMember.role === "leader"
                      ? "Líder"
                      : selectedMember.role === "co-leader"
                        ? "Co-líder"
                        : "Membro";

                  const memberInfoEmbed = new EmbedBuilder()
                    .setColor("#5865F2")
                    .setTitle(`${roleEmoji} Gerenciar Membro`)
                    .setDescription(`**${selectedUser.username}**`)
                    .addFields(
                      { name: "Cargo", value: roleName, inline: true },
                      {
                        name: "Entrou em",
                        value: `<t:${Math.floor(selectedMember.joinedAt / 1000)}:R>`,
                        inline: true,
                      },
                    )
                    .setThumbnail(selectedUser.displayAvatarURL())
                    .setTimestamp();

                  // Criar botões de ação baseado nas permissões (usar dados atualizados)
                  const isLeader = latestUserMember?.role === "leader";
                  const actionButtons: ButtonBuilder[] = [];

                  // Botão de expulsar (líder e co-líder podem expulsar membros normais)
                  if (selectedMember.role === "member") {
                    actionButtons.push(
                      new ButtonBuilder()
                        .setCustomId(`guild_kick_${selectedUserId}`)
                        .setLabel("Expulsar")
                        .setEmoji("🚪")
                        .setStyle(ButtonStyle.Danger),
                    );
                  }

                  // Botão de promover (apenas líder pode promover)
                  if (isLeader && selectedMember.role === "member") {
                    actionButtons.push(
                      new ButtonBuilder()
                        .setCustomId(`guild_promote_${selectedUserId}`)
                        .setLabel("Promover a Co-líder")
                        .setEmoji("⭐")
                        .setStyle(ButtonStyle.Success),
                    );
                  }

                  // Botão de rebaixar (apenas líder pode rebaixar)
                  if (isLeader && selectedMember.role === "co-leader") {
                    actionButtons.push(
                      new ButtonBuilder()
                        .setCustomId(`guild_demote_${selectedUserId}`)
                        .setLabel("Rebaixar a Membro")
                        .setEmoji("🔻")
                        .setStyle(ButtonStyle.Secondary),
                    );

                    // Co-líder não pode ser expulso, apenas rebaixado
                    actionButtons.push(
                      new ButtonBuilder()
                        .setCustomId(`guild_kick_${selectedUserId}`)
                        .setLabel("Expulsar")
                        .setEmoji("🚪")
                        .setStyle(ButtonStyle.Danger),
                    );
                  }

                  // Botão de cancelar
                  actionButtons.push(
                    new ButtonBuilder()
                      .setCustomId("guild_manage_cancel")
                      .setLabel("Cancelar")
                      .setEmoji("❌")
                      .setStyle(ButtonStyle.Secondary),
                  );

                  if (
                    actionButtons.length === 0 ||
                    selectedMember.role === "leader"
                  ) {
                    await selectInteraction.reply({
                      content: "❌ Você não pode gerenciar este membro!",
                      flags: MessageFlags.Ephemeral,
                    });
                    return;
                  }

                  const actionRow =
                    new ActionRowBuilder<ButtonBuilder>().addComponents(
                      actionButtons,
                    );

                  await selectInteraction.reply({
                    embeds: [memberInfoEmbed],
                    components: [actionRow],
                    flags: MessageFlags.Ephemeral,
                  });

                  const manageReply = await selectInteraction.fetchReply();

                  // Collector para os botões de ação
                  const actionCollector =
                    manageReply.createMessageComponentCollector({
                      componentType: ComponentType.Button,
                      time: 60000, // 1 minuto
                    });

                  actionCollector.on(
                    "collect",
                    async (actionInteraction: ButtonInteraction) => {
                      if (actionInteraction.user.id !== interaction.user.id) {
                        await actionInteraction.reply({
                          content: tUser(
                            actionInteraction.user.id,
                            "guild_not_your_interaction",
                          ),
                          flags: MessageFlags.Ephemeral,
                        });
                        return;
                      }

                      if (
                        actionInteraction.customId === "guild_manage_cancel"
                      ) {
                        await actionInteraction.update({
                          content: "❌ Operação cancelada.",
                          embeds: [],
                          components: [],
                        });
                        return;
                      }

                      // Processar ações
                      if (
                        actionInteraction.customId.startsWith("guild_kick_")
                      ) {
                        const targetId = actionInteraction.customId.replace(
                          "guild_kick_",
                          "",
                        );
                        const result = kickMember(
                          interaction.user.id,
                          targetId,
                        );

                        await actionInteraction.update({
                          content: result.message,
                          embeds: [],
                          components: [],
                        });

                        // Notificar o usuário expulso
                        if (result.success) {
                          try {
                            const kickedUser =
                              await interaction.client.users.fetch(targetId);
                            await kickedUser.send({
                              content: `🚪 Você foi expulso da guilda **${latestGuild.name}** por <@${interaction.user.id}>.`,
                            });
                          } catch (error) {
                            // Usuário pode ter DMs desativadas
                          }
                        }
                      } else if (
                        actionInteraction.customId.startsWith("guild_promote_")
                      ) {
                        const targetId = actionInteraction.customId.replace(
                          "guild_promote_",
                          "",
                        );
                        const result = promoteMember(
                          interaction.user.id,
                          targetId,
                        );

                        await actionInteraction.update({
                          content: result.message,
                          embeds: [],
                          components: [],
                        });

                        // Notificar o usuário promovido
                        if (result.success) {
                          try {
                            const promotedUser =
                              await interaction.client.users.fetch(targetId);
                            await promotedUser.send({
                              content: `⭐ Você foi promovido a Co-líder da guilda **${latestGuild.name}**! Parabéns!`,
                            });
                          } catch (error) {
                            // Usuário pode ter DMs desativadas
                          }
                        }
                      } else if (
                        actionInteraction.customId.startsWith("guild_demote_")
                      ) {
                        const targetId = actionInteraction.customId.replace(
                          "guild_demote_",
                          "",
                        );
                        const result = demoteMember(
                          interaction.user.id,
                          targetId,
                        );

                        await actionInteraction.update({
                          content: result.message,
                          embeds: [],
                          components: [],
                        });

                        // Notificar o usuário rebaixado
                        if (result.success) {
                          try {
                            const demotedUser =
                              await interaction.client.users.fetch(targetId);
                            await demotedUser.send({
                              content: `🔻 Você foi rebaixado a Membro na guilda **${latestGuild.name}**.`,
                            });
                          } catch (error) {
                            // Usuário pode ter DMs desativadas
                          }
                        }
                      }

                      actionCollector.stop();
                      memberSelectCollector.stop();
                    },
                  );

                  actionCollector.on(
                    "end",
                    async (
                      collected: Collection<string, ButtonInteraction>,
                    ) => {
                      if (collected.size === 0) {
                        try {
                          await manageReply.edit({
                            content: "⏱️ Tempo esgotado! Operação cancelada.",
                            embeds: [],
                            components: [],
                          });
                        } catch (error) {
                          // Mensagem já foi editada ou deletada
                        }
                      }
                    },
                  );
                },
              );

              memberSelectCollector.on(
                "end",
                async (
                  collected: Collection<string, StringSelectMenuInteraction>,
                ) => {
                  if (collected.size === 0) {
                    try {
                      await memberSelectReply.edit({
                        content: "⏱️ Tempo esgotado! Seleção cancelada.",
                        components: [],
                      });
                    } catch (error) {
                      // Mensagem já foi editada ou deletada
                    }
                  }
                },
              );
            } else {
              await buttonInteraction.editReply({
                embeds: [membersEmbed],
                content: "📝 Você é o único membro da guilda.",
              });
            }
          } else if (buttonInteraction.customId === "guild_info") {
            const currentGuild = getUserGuild(interaction.user.id);
            if (!currentGuild) {
              await buttonInteraction.reply({
                content: "❌ Você não está mais em uma guilda!",
                flags: MessageFlags.Ephemeral,
              });
              return;
            }

            // Mostrar informações detalhadas da guilda
            const infoEmbed = new EmbedBuilder()
              .setColor("#5865F2")
              .setTitle(`ℹ️ Informações de ${currentGuild.name}`)
              .setDescription(currentGuild.description)
              .addFields(
                {
                  name: "👑 Líder",
                  value: `<@${currentGuild.leaderId}>`,
                  inline: true,
                },
                {
                  name: "📊 Nível",
                  value: `${currentGuild.level}`,
                  inline: true,
                },
                {
                  name: "⭐ XP",
                  value: `${currentGuild.xp}`,
                  inline: true,
                },
                {
                  name: "👥 Membros",
                  value: `${currentGuild.members.length}/${currentGuild.settings.maxMembers}`,
                  inline: true,
                },
                {
                  name: "🔓 Tipo",
                  value: currentGuild.settings.isPublic ? "Pública" : "Privada",
                  inline: true,
                },
                {
                  name: "📅 Criada",
                  value: `<t:${Math.floor(currentGuild.createdAt / 1000)}:R>`,
                  inline: true,
                },
              )
              .setTimestamp();

            await buttonInteraction.reply({
              embeds: [infoEmbed],
              flags: MessageFlags.Ephemeral,
            });
          } else if (buttonInteraction.customId === "guild_leave") {
            const currentGuild = getUserGuild(interaction.user.id);
            if (!currentGuild) {
              await buttonInteraction.reply({
                content: "❌ Você não está mais em uma guilda!",
                flags: MessageFlags.Ephemeral,
              });
              return;
            }

            // Confirmar saída da guilda
            const confirmRow =
              new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                  .setCustomId("guild_leave_confirm")
                  .setLabel("✅ Confirmar")
                  .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                  .setCustomId("guild_leave_cancel")
                  .setLabel("❌ Cancelar")
                  .setStyle(ButtonStyle.Secondary),
              );

            const confirmEmbed = new EmbedBuilder()
              .setColor("#FF0000")
              .setTitle("⚠️ Confirmar Saída")
              .setDescription(
                `Tem certeza que deseja sair de **${currentGuild.name}**?`,
              )
              .setFooter({ text: "Esta ação não pode ser desfeita" });

            await buttonInteraction.reply({
              embeds: [confirmEmbed],
              components: [confirmRow],
              flags: MessageFlags.Ephemeral,
            });

            const leaveReply = await buttonInteraction.fetchReply();

            const leaveCollector = leaveReply.createMessageComponentCollector({
              componentType: ComponentType.Button,
              time: 60000, // 1 minuto
            });

            leaveCollector.on(
              "collect",
              async (confirmInteraction: ButtonInteraction) => {
                // Validar se é o usuário correto
                if (confirmInteraction.user.id !== interaction.user.id) {
                  await confirmInteraction.reply({
                    content: tUser(
                      confirmInteraction.user.id,
                      "guild_not_your_interaction",
                    ),
                    flags: MessageFlags.Ephemeral,
                  });
                  return;
                }

                if (confirmInteraction.customId === "guild_leave_confirm") {
                  const result = leaveGuild(interaction.user.id);
                  await confirmInteraction.update({
                    content: result.message,
                    embeds: [],
                    components: [],
                  });
                  guildCollector.stop();
                } else {
                  await confirmInteraction.update({
                    content: "❌ Saída cancelada.",
                    embeds: [],
                    components: [],
                  });
                }
              },
            );
          }
        },
      );

      guildCollector.on("end", async () => {
        try {
          await guildReply.edit({ components: [] });
        } catch (error) {
          // Mensagem já foi editada ou deletada
        }
      });
    } else {
      const welcomeEmbed = new EmbedBuilder()
        .setColor("#5865F2")
        .setTitle(tUser(interaction.user.id, "guild_welcome_title"))
        .setDescription(tUser(interaction.user.id, "guild_welcome_desc"))
        .setFooter({
          text: tUser(interaction.user.id, "guild_footer"),
        })
        .setTimestamp();

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("guild_create")
          .setLabel(tUser(interaction.user.id, "guild_btn_create"))
          .setEmoji("⚔️")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId("guild_join")
          .setLabel(tUser(interaction.user.id, "guild_btn_join"))
          .setEmoji("🏰")
          .setStyle(ButtonStyle.Primary),
      );

      await interaction.reply({
        embeds: [welcomeEmbed],
        components: [row],
        flags: MessageFlags.Ephemeral,
      });

      const reply = await interaction.fetchReply();

      const collector = reply.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 300000,
      });

      collector.on("collect", async (i: ButtonInteraction) => {
        if (i.user.id !== interaction.user.id) {
          await i.reply({
            content: tUser(i.user.id, "guild_not_your_interaction"),
            flags: MessageFlags.Ephemeral,
          });
          return;
        }

        if (i.customId === "guild_create") {
          const modal = new ModalBuilder()
            .setCustomId("guild_create_modal_new")
            .setTitle(tUser(i.user.id, "guild_create_title"));

          const nameInput = new TextInputBuilder()
            .setCustomId("guild_name")
            .setLabel(tUser(i.user.id, "guild_create_name"))
            .setStyle(TextInputStyle.Short)
            .setMinLength(3)
            .setMaxLength(30)
            .setRequired(true);

          const descInput = new TextInputBuilder()
            .setCustomId("guild_description")
            .setLabel(tUser(i.user.id, "guild_create_description"))
            .setStyle(TextInputStyle.Paragraph)
            .setMinLength(10)
            .setMaxLength(200)
            .setRequired(true);

          const privacyInput = new TextInputBuilder()
            .setCustomId("guild_privacy")
            .setLabel(tUser(i.user.id, "guild_create_privacy"))
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("pública ou privada")
            .setMinLength(6)
            .setMaxLength(10)
            .setRequired(true);

          const firstRow =
            new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput);
          const secondRow =
            new ActionRowBuilder<TextInputBuilder>().addComponents(descInput);
          const thirdRow =
            new ActionRowBuilder<TextInputBuilder>().addComponents(
              privacyInput,
            );

          modal.addComponents(firstRow, secondRow, thirdRow);

          await i.showModal(modal);
        } else if (i.customId === "guild_join") {
          const guilds = getAllGuilds();

          if (guilds.length === 0) {
            await i.reply({
              content: tUser(i.user.id, "guild_no_guilds"),
              flags: MessageFlags.Ephemeral,
            });
            return;
          }

          const options = guilds.slice(0, 25).map((g) => ({
            label: g.name,
            description: `${g.members.length}/${g.settings.maxMembers} ${tUser(i.user.id, "guild_members")} • ${g.settings.isPublic ? "🔓" : "🔒"} ${g.settings.isPublic ? tUser(i.user.id, "guild_type_public") : tUser(i.user.id, "guild_type_private")}`,
            value: g.id,
          }));

          const selectMenu = new StringSelectMenuBuilder()
            .setCustomId("guild_select")
            .setPlaceholder(tUser(i.user.id, "guild_select_placeholder"))
            .addOptions(options);

          const selectRow =
            new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
              selectMenu,
            );

          await i.reply({
            content: tUser(i.user.id, "guild_select_guild"),
            components: [selectRow],
            flags: MessageFlags.Ephemeral,
          });

          const selectReply = await i.fetchReply();

          const selectCollector = selectReply.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            time: 60000,
          });

          selectCollector.on(
            "collect",
            async (selectInteraction: StringSelectMenuInteraction) => {
              if (selectInteraction.user.id !== i.user.id) {
                await selectInteraction.reply({
                  content: tUser(
                    selectInteraction.user.id,
                    "guild_not_your_interaction",
                  ),
                  flags: MessageFlags.Ephemeral,
                });
                return;
              }

              const guildId = selectInteraction.values[0];
              const selectedGuild = guilds.find((g) => g.id === guildId);

              if (!selectedGuild) {
                await selectInteraction.reply({
                  content: tUser(selectInteraction.user.id, "guild_not_found"),
                  flags: MessageFlags.Ephemeral,
                });
                return;
              }

              if (selectedGuild.settings.isPublic) {
                const result = joinGuild(selectInteraction.user.id, guildId);
                await selectInteraction.reply({
                  content: result.message,
                  flags: MessageFlags.Ephemeral,
                });
              } else {
                const requestResult = createJoinRequest(
                  selectInteraction.user.id,
                  guildId,
                );

                if (!requestResult.success) {
                  await selectInteraction.reply({
                    content: requestResult.message,
                    flags: MessageFlags.Ephemeral,
                  });
                  return;
                }

                try {
                  const leader = await interaction.client.users.fetch(
                    selectedGuild.leaderId,
                  );

                  const requestEmbed = new EmbedBuilder()
                    .setColor("#FFA500")
                    .setTitle(tUser(leader.id, "guild_request_title"))
                    .setDescription(
                      tUser(leader.id, "guild_request_desc")
                        .replace("{user}", `<@${selectInteraction.user.id}>`)
                        .replace("{guild}", selectedGuild.name),
                    )
                    .addFields(
                      {
                        name: tUser(leader.id, "guild_request_user"),
                        value: `<@${selectInteraction.user.id}> (${selectInteraction.user.tag})`,
                        inline: false,
                      },
                      {
                        name: tUser(leader.id, "guild_request_guild"),
                        value: selectedGuild.name,
                        inline: false,
                      },
                    )
                    .setTimestamp();

                  const approveRow =
                    new ActionRowBuilder<ButtonBuilder>().addComponents(
                      new ButtonBuilder()
                        .setCustomId(`guild_approve_${requestResult.requestId}`)
                        .setLabel(tUser(leader.id, "guild_request_approve"))
                        .setStyle(ButtonStyle.Success),
                      new ButtonBuilder()
                        .setCustomId(`guild_reject_${requestResult.requestId}`)
                        .setLabel(tUser(leader.id, "guild_request_reject"))
                        .setStyle(ButtonStyle.Danger),
                    );

                  await leader.send({
                    embeds: [requestEmbed],
                    components: [approveRow],
                  });

                  await selectInteraction.reply({
                    content: requestResult.message,
                    flags: MessageFlags.Ephemeral,
                  });
                } catch (error) {
                  // DM failed - delete the pending request so user can retry
                  if (requestResult.requestId) {
                    deleteJoinRequest(requestResult.requestId);
                  }

                  await selectInteraction.reply({
                    content: tUser(
                      selectInteraction.user.id,
                      "guild_request_dm_error",
                    ),
                    flags: MessageFlags.Ephemeral,
                  });
                }
              }

              selectCollector.stop();
            },
          );

          selectCollector.on(
            "end",
            async (
              collected: Collection<string, StringSelectMenuInteraction>,
            ) => {
              if (collected.size === 0) {
                try {
                  await selectReply.edit({
                    content: tUser(i.user.id, "guild_timeout"),
                    components: [],
                  });
                } catch (error) {
                  // Mensagem já foi editada ou deletada
                }
              }
            },
          );
        }
      });

      collector.on(
        "end",
        async (collected: Collection<string, ButtonInteraction>) => {
          if (collected.size > 0) return;

          try {
            await reply.edit({
              components: [],
            });
          } catch (error) {
            // Mensagem já foi editada ou deletada
          }
        },
      );
    }
  },
};
