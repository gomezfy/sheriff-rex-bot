import { ModalSubmitInteraction, EmbedBuilder, MessageFlags } from "discord.js";
import { setUserBio, setUserPhrase } from "@/utils/profileManager";
import { createGuild } from "@/utils/guildManager";
import { tUser } from "@/utils/i18n";

export async function handleProfileModals(
  interaction: ModalSubmitInteraction,
): Promise<boolean> {
  const { customId } = interaction;

  if (customId === "bio_modal") {
    await handleBioModal(interaction);
    return true;
  }

  if (customId === "phrase_modal") {
    await handlePhraseModal(interaction);
    return true;
  }

  if (customId === "guild_create_modal_new") {
    await handleGuildCreateModal(interaction);
    return true;
  }

  return false;
}

async function handleBioModal(
  interaction: ModalSubmitInteraction,
): Promise<void> {
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

async function handlePhraseModal(
  interaction: ModalSubmitInteraction,
): Promise<void> {
  const phraseText = interaction.fields.getTextInputValue("phrase_text");

  setUserPhrase(interaction.user.id, phraseText);

  const embed = new EmbedBuilder()
    .setColor("#D4AF37")
    .setTitle("✅ Frase Atualizada!")
    .setDescription("Sua frase pessoal foi atualizada com sucesso.")
    .addFields({
      name: "💬 Nova Frase",
      value: phraseText || "*(removida)*",
      inline: false,
    })
    .setFooter({ text: "Use /profile para ver seu card atualizado" })
    .setTimestamp();

  await interaction.reply({
    embeds: [embed],
    flags: MessageFlags.Ephemeral,
  });
}

async function handleGuildCreateModal(
  interaction: ModalSubmitInteraction,
): Promise<void> {
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
