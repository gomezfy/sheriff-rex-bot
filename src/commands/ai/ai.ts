import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  MessageFlags,
  EmbedBuilder,
} from "discord.js";
import { openRouterService, ChatMessage } from "../../utils/openRouterService";
import {
  SHERIFF_BOT_CONTEXT,
  SHERIFF_PERSONALITY_PROMPT,
} from "../../utils/sheriffContext";
import { t } from "../../utils/i18n";
import { getEmoji } from "../../utils/customEmojis";

const cooldowns = new Map<string, number>();
const COOLDOWN_TIME = 10000;
const MAX_MESSAGE_LENGTH = 500;

export = {
  data: new SlashCommandBuilder()
    .setName("ai")
    .setDescription("Chat with Sheriff Rex - Your Wild West AI assistant! 🤠")
    .setDescriptionLocalizations({
      "pt-BR":
        "Converse com Sheriff Rex - Seu assistente IA do Velho Oeste! 🤠",
      "en-US": "Chat with Sheriff Rex - Your Wild West AI assistant! 🤠",
      "es-ES": "Chatea con Sheriff Rex - ¡Tu asistente IA del Viejo Oeste! 🤠",
    })
    .addStringOption((option) =>
      option
        .setName("prompt")
        .setDescription("Your message to the AI")
        .setDescriptionLocalizations({
          "pt-BR": "Sua mensagem para a IA",
          "en-US": "Your message to the AI",
          "es-ES": "Tu mensaje para la IA",
        })
        .setRequired(true)
        .setMaxLength(MAX_MESSAGE_LENGTH),
    )
    .addStringOption((option) =>
      option
        .setName("model")
        .setDescription(
          "AI model to use (default: meta-llama/llama-3.3-70b-instruct:free)",
        )
        .setDescriptionLocalizations({
          "pt-BR":
            "Modelo de IA a usar (padrão: meta-llama/llama-3.3-70b-instruct:free)",
          "en-US":
            "AI model to use (default: meta-llama/llama-3.3-70b-instruct:free)",
          "es-ES":
            "Modelo de IA a usar (predeterminado: meta-llama/llama-3.3-70b-instruct:free)",
        })
        .setRequired(false),
    )
    .setContexts([0, 1, 2])
    .setIntegrationTypes([0, 1]),

  cooldown: 10,

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const userId = interaction.user.id;
    const now = Date.now();

    const cooldownExpiry = cooldowns.get(userId);
    if (cooldownExpiry && now < cooldownExpiry) {
      const timeLeft = Math.ceil((cooldownExpiry - now) / 1000);
      await interaction.reply({
        content: `${getEmoji("cowboy")} ${t(interaction, "ai_cooldown", { time: timeLeft })}`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (!openRouterService.isConfigured()) {
      await interaction.reply({
        content: `${getEmoji("cancel")} ${t(interaction, "ai_not_configured")}`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const prompt = interaction.options.getString("prompt", true);
    const model = interaction.options.getString("model") || undefined;

    await interaction.deferReply();

    try {
      const messages: ChatMessage[] = [
        {
          role: "system",
          content: `${SHERIFF_PERSONALITY_PROMPT}\n\n${SHERIFF_BOT_CONTEXT}`,
        },
        {
          role: "user",
          content: prompt,
        },
      ];

      const response = await openRouterService.chat(messages, model, 800);

      if (response.length > 1900) {
        const chunks = response.match(/.{1,1900}/g) || [response];
        await interaction.editReply({
          content: `${getEmoji("info")} **${t(interaction, "ai_response")}**\n\n${chunks[0]}`,
        });

        for (let i = 1; i < chunks.length; i++) {
          await interaction.followUp({
            content: chunks[i],
          });
        }
      } else {
        const embed = new EmbedBuilder()
          .setColor(0xd4af37)
          .setTitle(
            `${getEmoji("cowboy")} ${t(interaction, "ai_sheriff_title")}`,
          )
          .setDescription(response)
          .setFooter({
            text: t(interaction, "ai_model_footer", {
              model: model || openRouterService.getDefaultModel(),
              user: interaction.user.tag,
            }),
          })
          .setTimestamp();

        await interaction.editReply({
          embeds: [embed],
        });
      }

      cooldowns.set(userId, now + COOLDOWN_TIME);
      setTimeout(() => cooldowns.delete(userId), COOLDOWN_TIME);
    } catch (error: any) {
      console.error("Error in /ai command:", error);

      const errorMessage = error.message || "Unknown error occurred";

      await interaction.editReply({
        content: `${getEmoji("cancel")} **${t(interaction, "ai_error")}**\n${errorMessage}`,
      });
    }
  },
};
