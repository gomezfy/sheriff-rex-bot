import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  MessageFlags,
  EmbedBuilder,
} from "discord.js";
import { openRouterService } from "../../utils/openRouterService";
import { t } from "../../utils/i18n";
import { getEmoji } from "../../utils/customEmojis";

export = {
  data: new SlashCommandBuilder()
    .setName("models")
    .setDescription("List available AI models from OpenRouter")
    .setDescriptionLocalizations({
      "pt-BR": "Listar modelos de IA disponíveis do OpenRouter",
      "en-US": "List available AI models from OpenRouter",
      "es-ES": "Listar modelos de IA disponibles de OpenRouter",
    })
    .addBooleanOption((option) =>
      option
        .setName("free")
        .setDescription("Show only free models")
        .setDescriptionLocalizations({
          "pt-BR": "Mostrar apenas modelos gratuitos",
          "en-US": "Show only free models",
          "es-ES": "Mostrar solo modelos gratuitos",
        })
        .setRequired(false),
    )
    .setContexts([0, 1, 2])
    .setIntegrationTypes([0, 1]),

  cooldown: 30,

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const cancelEmoji = getEmoji("cancel");

    if (!openRouterService.isConfigured()) {
      await interaction.reply({
        content: `${cancelEmoji} ${t(interaction, "models_not_configured")}`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      const showFreeOnly = interaction.options.getBoolean("free") || false;
      const models = await openRouterService.getAvailableModels();

      let filteredModels = models;
      if (showFreeOnly) {
        filteredModels = models.filter((model) => {
          const promptPrice = parseFloat(model.pricing.prompt || "0");
          const completionPrice = parseFloat(model.pricing.completion || "0");
          return (
            !isNaN(promptPrice) &&
            !isNaN(completionPrice) &&
            promptPrice === 0 &&
            completionPrice === 0
          );
        });
      }

      if (filteredModels.length === 0) {
        await interaction.editReply({
          content: `${cancelEmoji} ${t(interaction, "models_no_models")}`,
        });
        return;
      }

      const topModels = filteredModels.slice(0, 10);

      const title = showFreeOnly
        ? t(interaction, "models_title_free")
        : t(interaction, "models_title");

      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle(`🤖 ${title}`)
        .setDescription(
          `${t(interaction, "models_showing", { shown: topModels.length, total: filteredModels.length })}\n\n${t(interaction, "models_use_with_ai")}`,
        )
        .setFooter({
          text: t(interaction, "ai_powered_by"),
        })
        .setTimestamp();

      for (const model of topModels) {
        const promptPrice = parseFloat(model.pricing.prompt || "0");
        const completionPrice = parseFloat(model.pricing.completion || "0");

        if (isNaN(promptPrice) || isNaN(completionPrice)) {
          continue;
        }

        const price =
          promptPrice === 0 && completionPrice === 0
            ? `🆓 **${t(interaction, "models_free")}**`
            : `💰 ${t(interaction, "models_price", { price: (promptPrice * 1000000).toFixed(2) })}`;

        const contextInfo = model.context_length
          ? `\n📝 ${t(interaction, "models_context", { tokens: model.context_length.toLocaleString() })}`
          : "";

        embed.addFields({
          name: model.name || model.id,
          value: `\`${model.id}\`\n${price}${contextInfo}`,
          inline: false,
        });
      }

      if (filteredModels.length > 10) {
        embed.addFields({
          name: `📋 ${t(interaction, "models_more_title")}`,
          value: t(interaction, "models_more_desc", {
            count: filteredModels.length - 10,
          }),
          inline: false,
        });
      }

      await interaction.editReply({
        embeds: [embed],
      });
    } catch (error: any) {
      console.error("Error in /models command:", error);

      const errorMessage = error.message || "Unknown error occurred";

      await interaction.editReply({
        content: `${cancelEmoji} **${t(interaction, "models_error")}**\n${errorMessage}`,
      });
    }
  },
};
