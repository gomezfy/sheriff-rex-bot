import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  ComponentType,
  MessageFlags,
} from "discord.js";
import {
  TERRITORIES,
  getTerritory,
  getUserTerritories,
  ownsTerritory,
  purchaseTerritory,
  getTerritoryCount,
} from "../../utils/territoryManager";
import {
  getSilverCoinEmoji,
  getMoneybagEmoji,
  getDartEmoji,
  getStatsEmoji,
  getCheckEmoji,
  getCancelEmoji,
  getGreenCircle,
  getRedCircle,
  getGiftEmoji,
  getClipboardEmoji,
  getPartyEmoji,
  getBuildingEmoji,
} from "../../utils/customEmojis";
import { t } from "../../utils/i18n";
import { applyLocalizations } from "../../utils/commandLocalizations";
import { getUserSilver, removeUserSilver } from "../../utils/dataManager";
import { unlockFrameByTerritory } from "../../utils/frameManager";

export default {
  data: applyLocalizations(
    new SlashCommandBuilder()
      .setName("territories")
      .setDescription(
        "🏛️ Browse and purchase valuable territories in the Wild West",
      ),
    "territories",
  ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const userId = interaction.user.id;
    let currentIndex = 0;
    let currentInteraction: any = interaction; // Track the current interaction for translations

    const silverEmoji = getSilverCoinEmoji();

    // Helper to get translated territory data
    const getTerritoryTranslation = (territoryId: string, field: string) => {
      return t(currentInteraction, `territory_${territoryId}_${field}`);
    };

    // Function to create embed for current territory
    const createTerritoryEmbed = (index: number) => {
      // Always fetch fresh data
      const userSilver = getUserSilver(userId);
      const ownedTerritories = getUserTerritories(userId);
      const territory = TERRITORIES[index];
      const owned = ownsTerritory(userId, territory.id);

      // Get translated data
      const territoryName = getTerritoryTranslation(territory.id, "name");
      const territoryDesc = getTerritoryTranslation(territory.id, "desc");

      // Build benefits list from translations (filter empty ones)
      const benefits = [
        getTerritoryTranslation(territory.id, "benefit_1"),
        getTerritoryTranslation(territory.id, "benefit_2"),
      ].filter((b) => b && b.trim().length > 0);

      const benefitsText = benefits.join("\n");

      const embed = new EmbedBuilder()
        .setColor(territory.color)
        .setTitle(`${territory.emoji} ${territoryName.toUpperCase()}`)
        .setDescription(territoryDesc)
        .addFields(
          {
            name: `${getMoneybagEmoji()} ${t(currentInteraction, "territories_price")}`,
            value: `${territory.price.toLocaleString()} ${silverEmoji} ${t(currentInteraction, "silver_coins")}`,
            inline: true,
          },
          {
            name: `${getDartEmoji()} ${t(currentInteraction, "territories_rarity")}`,
            value: t(currentInteraction, `rarity_${territory.rarity}`),
            inline: true,
          },
          {
            name: `${getStatsEmoji()} ${t(currentInteraction, "territories_status")}`,
            value: owned
              ? `${getCheckEmoji()} **${t(currentInteraction, "territories_owned")}**`
              : userSilver >= territory.price
                ? `${getGreenCircle()} **${t(currentInteraction, "territories_available")}**`
                : `${getRedCircle()} **${t(currentInteraction, "territories_insufficient")}**`,
            inline: true,
          },
          {
            name: `${getGiftEmoji()} ${t(currentInteraction, "territories_benefits")}`,
            value: benefitsText,
            inline: false,
          },
        )
        .setFooter({
          text: t(currentInteraction, "territories_footer", {
            current: index + 1,
            total: TERRITORIES.length,
            owned: ownedTerritories.length,
          }),
        })
        .setTimestamp();

      // Add image if available
      if (territory.image) {
        embed.setImage(territory.image);
      }

      return embed;
    };

    // Function to create navigation buttons
    const createButtons = (index: number) => {
      // Always fetch fresh data
      const userSilver = getUserSilver(userId);
      const ownedTerritories = getUserTerritories(userId);
      const territory = TERRITORIES[index];
      const owned = ownsTerritory(userId, territory.id);
      const canAfford = userSilver >= territory.price;

      const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("prev")
          .setLabel(t(currentInteraction, "territories_prev"))
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(index === 0),
        new ButtonBuilder()
          .setCustomId("purchase")
          .setLabel(
            owned
              ? t(currentInteraction, "territories_owned")
              : t(currentInteraction, "territories_buy", {
                  price: (territory.price / 1000).toFixed(0),
                }),
          )
          .setStyle(
            owned
              ? ButtonStyle.Success
              : canAfford
                ? ButtonStyle.Primary
                : ButtonStyle.Danger,
          )
          .setDisabled(owned || !canAfford),
        new ButtonBuilder()
          .setCustomId("next")
          .setLabel(t(currentInteraction, "territories_next"))
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(index === TERRITORIES.length - 1),
      );

      const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("my_territories")
          .setLabel(t(currentInteraction, "territories_my_territories"))
          .setStyle(ButtonStyle.Success)
          .setDisabled(ownedTerritories.length === 0),
        new ButtonBuilder()
          .setCustomId("close")
          .setLabel(t(currentInteraction, "territories_close"))
          .setStyle(ButtonStyle.Danger),
      );

      return [row1, row2];
    };

    // Send initial message
    const initialEmbed = createTerritoryEmbed(currentIndex);
    const initialButtons = createButtons(currentIndex);

    const response = await interaction.reply({
      embeds: [initialEmbed],
      components: initialButtons,
    });

    // Create collector
    const collector = response.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 300000, // 5 minutes
    });

    collector.on("collect", async (i) => {
      // Update current interaction for translations
      currentInteraction = i;

      // Only allow the command user to interact
      if (i.user.id !== userId) {
        return i.reply({
          content: `${getCancelEmoji()} ${t(i, "territories_not_yours")}`,
          flags: MessageFlags.Ephemeral,
        });
      }

      if (i.customId === "prev") {
        currentIndex = Math.max(0, currentIndex - 1);
        await i.update({
          embeds: [createTerritoryEmbed(currentIndex)],
          components: createButtons(currentIndex),
        });
      } else if (i.customId === "next") {
        currentIndex = Math.min(TERRITORIES.length - 1, currentIndex + 1);
        await i.update({
          embeds: [createTerritoryEmbed(currentIndex)],
          components: createButtons(currentIndex),
        });
      } else if (i.customId === "purchase") {
        const territory = TERRITORIES[currentIndex];
        const currentSilver = getUserSilver(userId);

        // Double-check affordability
        if (currentSilver < territory.price) {
          return i.reply({
            content: `${getCancelEmoji()} ${t(i, "territories_need_more", { amount: (territory.price - currentSilver).toLocaleString() })} ${silverEmoji}`,
            flags: MessageFlags.Ephemeral,
          });
        }

        // Double-check ownership
        if (ownsTerritory(userId, territory.id)) {
          return i.reply({
            content: `${getCancelEmoji()} ${t(i, "territories_already_own")}`,
            flags: MessageFlags.Ephemeral,
          });
        }

        // Process purchase
        const removed = await removeUserSilver(userId, territory.price);
        if (!removed) {
          return i.reply({
            content: `${getCancelEmoji()} ${t(i, "territories_transaction_failed")}`,
            flags: MessageFlags.Ephemeral,
          });
        }

        const success = purchaseTerritory(
          userId,
          territory.id,
          territory.price,
        );
        if (!success) {
          // Refund if purchase failed
          const { addUserSilver } = require("../../utils/dataManager");
          await addUserSilver(userId, territory.price);
          return i.reply({
            content: `${getCancelEmoji()} ${t(i, "territories_purchase_failed")}`,
            flags: MessageFlags.Ephemeral,
          });
        }

        // Unlock exclusive frames for this territory
        unlockFrameByTerritory(userId, territory.id);

        // Success!
        const territoryName = getTerritoryTranslation(territory.id, "name");
        const purchaseBenefits = [
          getTerritoryTranslation(territory.id, "benefit_1"),
          getTerritoryTranslation(territory.id, "benefit_2"),
        ].filter((b) => b && b.trim().length > 0);
        const purchaseBenefitsText = purchaseBenefits.join("\n");

        const successEmbed = new EmbedBuilder()
          .setColor(0x00ff00)
          .setTitle(`${getPartyEmoji()} ${t(i, "territories_purchased_title")}`)
          .setDescription(
            t(i, "territories_purchased_desc", {
              name: `${territory.emoji} ${territoryName}`,
            }),
          )
          .addFields(
            {
              name: `${getMoneybagEmoji()} ${t(i, "territories_amount_paid")}`,
              value: `${territory.price.toLocaleString()} ${silverEmoji} ${t(i, "silver_coins")}`,
              inline: true,
            },
            {
              name: `${getMoneybagEmoji()} ${t(i, "territories_remaining_balance")}`,
              value: `${(currentSilver - territory.price).toLocaleString()} ${silverEmoji}`,
              inline: true,
            },
            {
              name: `${getGiftEmoji()} ${t(i, "territories_benefits_unlocked")}`,
              value: purchaseBenefitsText,
              inline: false,
            },
          )
          .setFooter({
            text: t(i, "territories_now_own", {
              count: getTerritoryCount(userId),
            }),
          })
          .setTimestamp();

        await i.reply({
          embeds: [successEmbed],
          flags: MessageFlags.Ephemeral,
        });

        // Update the main message
        await interaction.editReply({
          embeds: [createTerritoryEmbed(currentIndex)],
          components: createButtons(currentIndex),
        });
      } else if (i.customId === "my_territories") {
        const owned = getUserTerritories(userId);
        const territoriesInfo = owned
          .map((id) => {
            const terr = getTerritory(id);
            if (!terr) return null;
            const terrName = getTerritoryTranslation(terr.id, "name");
            const terrRarity = t(i, `rarity_${terr.rarity}`);
            return `${terr.emoji} **${terrName}** - ${terrRarity}`;
          })
          .filter(Boolean)
          .join("\n");

        const myTerritoriesEmbed = new EmbedBuilder()
          .setColor(0xffd700)
          .setTitle(`${getBuildingEmoji()} ${t(i, "territories_my_title")}`)
          .setDescription(territoriesInfo || t(i, "territories_no_territories"))
          .addFields({
            name: `${getStatsEmoji()} ${t(i, "territories_statistics")}`,
            value: t(i, "territories_owned_count", {
              owned: owned.length,
              total: TERRITORIES.length,
              percentage: Math.round((owned.length / TERRITORIES.length) * 100),
            }),
            inline: false,
          })
          .setFooter({ text: t(i, "territories_keep_expanding") })
          .setTimestamp();

        await i.reply({
          embeds: [myTerritoriesEmbed],
          flags: MessageFlags.Ephemeral,
        });
      } else if (i.customId === "close") {
        await i.update({
          content: t(i, "territories_browser_closed"),
          embeds: [],
          components: [],
        });
        collector.stop();
      }
    });

    collector.on("end", async (collected) => {
      if (collected.size === 0) {
        await interaction
          .editReply({
            components: [],
          })
          .catch(() => {});
      }
    });
  },
};
