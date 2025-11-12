import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
  Colors,
} from "discord.js";
import { addLevelReward, getLevelRewards } from "../../utils/levelRewards";

export const data = new SlashCommandBuilder()
  .setName("addreward")
  .setDescription("🤠 Adicionar recompensa de role por nível")
  .setDescriptionLocalizations({
    "en-US": "🤠 Add level role reward",
    "es-ES": "🤠 Añadir recompensa de rol por nivel",
  })
  .addIntegerOption((option) =>
    option
      .setName("nivel")
      .setNameLocalizations({
        "en-US": "level",
        "es-ES": "nivel",
      })
      .setDescription("O nível necessário")
      .setDescriptionLocalizations({
        "en-US": "Required level",
        "es-ES": "Nivel requerido",
      })
      .setMinValue(1)
      .setMaxValue(100)
      .setRequired(true),
  )
  .addRoleOption((option) =>
    option
      .setName("role")
      .setDescription("O role para dar como recompensa")
      .setDescriptionLocalizations({
        "en-US": "The role to give as reward",
        "es-ES": "El rol para dar como recompensa",
      })
      .setRequired(true),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .setDMPermission(false);

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) {
    return interaction.reply({
      content: "❌ Este comando só pode ser usado em servidores!",
      ephemeral: true,
    });
  }

  const level = interaction.options.getInteger("nivel", true);
  const role = interaction.options.getRole("role", true);

  const result = addLevelReward(interaction.guild.id, level, role.id);

  const rewards = getLevelRewards(interaction.guild.id);

  const embed = new EmbedBuilder()
    .setColor(Colors.Gold)
    .setTitle("🎁 Recompensa de Nível Configurada")
    .setDescription(result.message)
    .addFields(
      {
        name: "📊 Nível",
        value: level.toString(),
        inline: true,
      },
      {
        name: "🎭 Role",
        value: `<@&${role.id}>`,
        inline: true,
      },
      {
        name: "📋 Total de Recompensas",
        value: rewards.length.toString(),
        inline: true,
      },
    )
    .setTimestamp();

  if (rewards.length > 0) {
    const rewardsList = rewards
      .map((r) => `Nível **${r.level}**: <@&${r.roleId}>`)
      .join("\n");
    embed.addFields({
      name: "🎁 Todas as Recompensas",
      value: rewardsList.slice(0, 1000),
    });
  }

  await interaction.reply({ embeds: [embed] });
}
