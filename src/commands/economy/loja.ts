import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  AttachmentBuilder,
} from "discord.js";
import path from "path";
import { getActivePackages, createPaymentPreference } from "../../utils/mercadoPagoService";
import { getRexBuckEmoji, getInfoEmoji, getMoneybagEmoji } from "../../utils/customEmojis";
import { applyLocalizations } from "../../utils/commandLocalizations";

const commandBuilder = new SlashCommandBuilder()
  .setName("loja")
  .setDescription("🛒 Compre RexBucks com PIX ou Cartão")
  .setContexts([0, 1, 2])
  .setIntegrationTypes([0, 1]);

export default {
  data: applyLocalizations(commandBuilder, "loja"),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply({ ephemeral: true });

    try {
      const packages = await getActivePackages();

      if (packages.length === 0) {
        const embed = new EmbedBuilder()
          .setColor(0xf39c12)
          .setTitle(`${getInfoEmoji()} Loja Indisponível`)
          .setDescription("Nenhum pacote de RexBucks disponível no momento. Tente novamente mais tarde.")
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
        return;
      }

      const embed = new EmbedBuilder()
        .setColor(0x3498db)
        .setTitle(`${getMoneybagEmoji()} 🤠 Loja de RexBucks - Sheriff Rex`)
        .setDescription(
          `**Compre RexBucks e desbloqueie recursos premium!**\n\n` +
          `${getRexBuckEmoji()} **RexBucks** é a moeda premium do servidor\n` +
          `💳 Aceita **PIX** e **Cartão de Crédito**\n` +
          `⚡ Crédito **instantâneo** após aprovação do pagamento\n\n` +
          `**📦 Pacotes Disponíveis:**`
        )
        .setFooter({
          text: "Clique em um pacote para comprar • Pagamento via Mercado Pago",
        })
        .setTimestamp();

      packages.forEach((pkg, index) => {
        const bonus = pkg.bonusRexBucks > 0 ? ` (+${pkg.bonusRexBucks} bônus!)` : '';
        embed.addFields({
          name: `${index + 1}. ${pkg.name} - ${pkg.displayPrice}`,
          value: 
            `${getRexBuckEmoji()} **${pkg.totalRexBucks.toLocaleString()} RexBucks**${bonus}\n` +
            `📝 ${pkg.description}`,
          inline: false,
        });
      });

      const rows: ActionRowBuilder<ButtonBuilder>[] = [];
      let currentRow = new ActionRowBuilder<ButtonBuilder>();
      
      packages.forEach((pkg, index) => {
        if (index > 0 && index % 5 === 0) {
          rows.push(currentRow);
          currentRow = new ActionRowBuilder<ButtonBuilder>();
        }

        currentRow.addComponents(
          new ButtonBuilder()
            .setCustomId(`buy_rexbucks_${pkg.id}`)
            .setLabel(`${pkg.name}`)
            .setStyle(ButtonStyle.Success)
            .setEmoji('💰')
        );
      });

      if (currentRow.components.length > 0) {
        rows.push(currentRow);
      }

      const response = await interaction.editReply({
        embeds: [embed],
        components: rows,
      });

      const collector = response.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 300000,
      });

      collector.on('collect', async (buttonInteraction) => {
        if (buttonInteraction.user.id !== interaction.user.id) {
          await buttonInteraction.reply({
            content: '❌ Esta loja não é para você! Use `/loja` para abrir sua própria loja.',
            ephemeral: true,
          });
          return;
        }

        const packageId = buttonInteraction.customId.replace('buy_rexbucks_', '');
        await buttonInteraction.deferUpdate();

        const selectedPackage = packages.find(p => p.id === packageId);
        if (!selectedPackage) {
          await buttonInteraction.followUp({
            content: '❌ Pacote não encontrado.',
            ephemeral: true,
          });
          return;
        }

        const confirmEmbed = new EmbedBuilder()
          .setColor(0xf39c12)
          .setTitle('⏳ Gerando Link de Pagamento...')
          .setDescription(
            `**Pacote:** ${selectedPackage.name}\n` +
            `**Valor:** ${selectedPackage.displayPrice}\n` +
            `**RexBucks:** ${getRexBuckEmoji()} ${selectedPackage.totalRexBucks.toLocaleString()}\n\n` +
            `Aguarde enquanto geramos seu link de pagamento...`
          )
          .setTimestamp();

        await buttonInteraction.editReply({
          embeds: [confirmEmbed],
          components: [],
        });

        const result = await createPaymentPreference(
          interaction.user.id,
          interaction.user.username,
          packageId
        );

        if (result.success && result.url) {
          const successEmbed = new EmbedBuilder()
            .setColor(0x2ecc71)
            .setTitle('✅ Link de Pagamento Gerado!')
            .setDescription(
              `**Pacote:** ${selectedPackage.name}\n` +
              `**Valor:** ${selectedPackage.displayPrice}\n` +
              `**RexBucks:** ${getRexBuckEmoji()} ${selectedPackage.totalRexBucks.toLocaleString()}\n\n` +
              `🔗 **[CLIQUE AQUI PARA PAGAR](${result.url})**\n\n` +
              `💳 **Formas de Pagamento:**\n` +
              `• PIX (aprovação instantânea)\n` +
              `• Cartão de Crédito (até 12x)\n` +
              `• Boleto Bancário\n\n` +
              `⚡ Após a aprovação do pagamento, seus RexBucks serão creditados automaticamente!\n` +
              `📧 Você receberá uma notificação quando o pagamento for aprovado.`
            )
            .setFooter({
              text: "Link válido por 30 minutos • Pagamento seguro via Mercado Pago",
            })
            .setTimestamp();

          const payButton = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
              .setLabel('💳 Abrir Pagamento')
              .setStyle(ButtonStyle.Link)
              .setURL(result.url)
          );

          await buttonInteraction.editReply({
            embeds: [successEmbed],
            components: [payButton],
          });
        } else {
          const errorEmbed = new EmbedBuilder()
            .setColor(0xe74c3c)
            .setTitle('❌ Erro ao Gerar Pagamento')
            .setDescription(
              result.error || 'Não foi possível gerar o link de pagamento. Tente novamente mais tarde.'
            )
            .setTimestamp();

          await buttonInteraction.editReply({
            embeds: [errorEmbed],
            components: [],
          });
        }

        collector.stop();
      });

      collector.on('end', async (collected, reason) => {
        if (reason === 'time' && collected.size === 0) {
          try {
            const timeoutEmbed = new EmbedBuilder()
              .setColor(0x95a5a6)
              .setTitle(`${getMoneybagEmoji()} Loja de RexBucks`)
              .setDescription('⏰ Tempo esgotado. Use `/loja` novamente para fazer uma compra.')
              .setTimestamp();

            await interaction.editReply({
              embeds: [timeoutEmbed],
              components: [],
            });
          } catch (error) {
            console.error('Error updating message after timeout:', error);
          }
        }
      });
    } catch (error) {
      console.error("Error in loja command:", error);

      const embed = new EmbedBuilder()
        .setColor(0xe74c3c)
        .setTitle("❌ Erro")
        .setDescription("Ocorreu um erro ao carregar a loja. Tente novamente mais tarde.")
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    }
  },
};
