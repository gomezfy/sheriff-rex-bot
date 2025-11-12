import {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ChatInputCommandInteraction,
  MessageFlags,
  EmbedBuilder,
} from "discord.js";
import { t, getLocale } from "../../utils/i18n";
import { applyLocalizations } from "../../utils/commandLocalizations";
import {
  getMoneybagEmoji,
  getSlotMachineEmoji,
  getPickaxeEmoji,
  getRevolverEmoji,
  getCowboyEmoji,
  getInfoEmoji,
} from "../../utils/customEmojis";

function getMainEmbed(interaction: ChatInputCommandInteraction): EmbedBuilder {
  const locale = getLocale(interaction);
  const cowboyEmoji = getCowboyEmoji();

  const description =
    locale === "pt-BR"
      ? "**Bem-vindo ao Sheriff Bot!** 🤠\n\nBot temático do Velho Oeste com **44 comandos** incluindo economia, jogos, mineração, IA e sistema de recompensas!\n\n**🆕 Novidades:**\n• 🏛️ Armazém do Estado - Compre e venda recursos\n• 🤖 Sheriff Rex AI - Assistente inteligente\n• 🗺️ Sistema de Expedições ao Deserto (1-3 jogadores)\n• 🎟️ Requer Selos para participar\n• 🔒 Sistema de segurança aprimorado\n\nSelecione uma categoria no menu abaixo para ver os comandos disponíveis."
      : locale === "es-ES"
        ? "**¡Bienvenido a Sheriff Bot!** 🤠\n\n¡Bot temático del Viejo Oeste con **44 comandos** incluyendo economía, juegos, minería, IA y sistema de recompensas!\n\n**🆕 Novedades:**\n• 🏛️ Almacén del Estado - Compra y vende recursos\n• 🤖 Sheriff Rex AI - Asistente inteligente\n• 🗺️ Sistema de Expediciones al Desierto (1-3 jugadores)\n• 🎟️ Requiere Sellos para participar\n• 🔒 Sistema de seguridad mejorado\n\nSelecciona una categoría en el menú de abajo para ver los comandos disponibles."
        : locale === "fr"
          ? "**Bienvenue sur Sheriff Bot!** 🤠\n\nBot thématique du Far West avec **44 commandes** incluant économie, jeux, minage, IA et système de primes!\n\n**🆕 Nouveautés:**\n• 🏛️ Entrepôt de l'État - Achetez et vendez des ressources\n• 🤖 Sheriff Rex AI - Assistant intelligent\n• 🗺️ Système d'Expéditions dans le Désert (1-3 joueurs)\n• 🎟️ Requiert des Sceaux pour participer\n• 🔒 Système de sécurité amélioré\n\nSélectionnez une catégorie dans le menu ci-dessous pour voir les commandes disponibles."
          : "**Welcome to Sheriff Bot!** 🤠\n\nWild West themed bot with **44 commands** including economy, gambling, mining, AI and bounty system!\n\n**🆕 New Features:**\n• 🏛️ State Warehouse - Buy and sell resources\n• 🤖 Sheriff Rex AI - Intelligent assistant\n• 🗺️ Desert Expedition System (1-3 players)\n• 🎟️ Requires Seals to participate\n• 🔒 Enhanced security system\n\nSelect a category from the menu below to view available commands.";

  return new EmbedBuilder()
    .setColor(0xffd700)
    .setTitle(`${cowboyEmoji} ${t(interaction, "help_title")}`)
    .setDescription(description)
    .setThumbnail(
      "https://cdn.discordapp.com/avatars/1426734768111747284/77c49c0e33e64e32cc5bc42f9e6cfe82.png",
    )
    .setFooter({ text: t(interaction, "help_footer") })
    .setTimestamp();
}

function getCategoryEmbed(
  interaction: ChatInputCommandInteraction,
  category: string,
): EmbedBuilder {
  const locale = getLocale(interaction);
  const cowboyEmoji = getCowboyEmoji();

  const dmText: Record<string, string> = {
    "pt-BR": "(DM)",
    "en-US": "(DM)",
    "es-ES": "(MP)",
    fr: "(MP)",
  };

  const serverText: Record<string, string> = {
    "pt-BR": "(Server)",
    "en-US": "(Server)",
    "es-ES": "(Server)",
    fr: "(Server)",
  };

  const embed = new EmbedBuilder()
    .setColor(0xffd700)
    .setThumbnail(
      "https://cdn.discordapp.com/avatars/1426734768111747284/77c49c0e33e64e32cc5bc42f9e6cfe82.png",
    )
    .setFooter({ text: t(interaction, "help_footer") })
    .setTimestamp();

  switch (category) {
    case "economy": {
      const moneyEmoji = getMoneybagEmoji();
      const economyCommands =
        locale === "pt-BR"
          ? `\`/daily\` ${dmText[locale]} - Recompensa diária
\`/expedition\` ${dmText[locale]} - Expedição ao deserto (3h/10h, 1-3 jogadores)
\`/armazem\` ${dmText[locale]} - Armazém do Estado (comprar/vender recursos)
\`/give\` ${serverText[locale]} - Transferir moedas/itens
\`/inventory\` ${dmText[locale]} - Ver seu inventário
\`/leaderboard\` ${dmText[locale]} - Top 10 jogadores
\`/redeem\` ${dmText[locale]} - Resgatar códigos
\`/middleman\` ${dmText[locale]} - Converter moedas
\`/territories\` ${serverText[locale]} - Sistema de territórios

**🎟️ Requisitos de Selos para Expedições:**
• 3h: 12 selos por pessoa
• 10h solo: 30 selos
• 10h grupo: 10 selos por pessoa`
          : locale === "es-ES"
            ? `\`/daily\` ${dmText[locale]} - Recompensa diaria
\`/expedition\` ${dmText[locale]} - Expedición al desierto (3h/10h, 1-3 jugadores)
\`/armazem\` ${dmText[locale]} - Almacén del Estado (comprar/vender recursos)
\`/give\` ${serverText[locale]} - Transferir monedas/objetos
\`/inventory\` ${dmText[locale]} - Ver tu inventario
\`/leaderboard\` ${dmText[locale]} - Top 10 jugadores
\`/redeem\` ${dmText[locale]} - Canjear códigos
\`/middleman\` ${dmText[locale]} - Convertir monedas
\`/territories\` ${serverText[locale]} - Sistema de territorios

**🎟️ Requisitos de Sellos para Expediciones:**
• 3h: 12 sellos por persona
• 10h solo: 30 sellos
• 10h grupo: 10 sellos por persona`
            : locale === "fr"
              ? `\`/daily\` ${dmText[locale]} - Récompense quotidienne
\`/expedition\` ${dmText[locale]} - Expédition dans le désert (3h/10h, 1-3 joueurs)
\`/armazem\` ${dmText[locale]} - Entrepôt de l'État (acheter/vendre ressources)
\`/give\` ${serverText[locale]} - Transférer monnaie/objets
\`/inventory\` ${dmText[locale]} - Voir votre inventaire
\`/leaderboard\` ${dmText[locale]} - Top 10 joueurs
\`/redeem\` ${dmText[locale]} - Codes de rachat
\`/middleman\` ${dmText[locale]} - Convertir monnaie
\`/territories\` ${serverText[locale]} - Système de territoires

**🎟️ Exigences de Sceaux pour Expéditions:**
• 3h: 12 sceaux par personne
• 10h solo: 30 sceaux
• 10h groupe: 10 sceaux par personne`
              : `\`/daily\` ${dmText[locale]} - Daily reward
\`/expedition\` ${dmText[locale]} - Desert expedition (3h/10h, 1-3 players)
\`/armazem\` ${dmText[locale]} - State Warehouse (buy/sell resources)
\`/give\` ${serverText[locale]} - Transfer coins/items
\`/inventory\` ${dmText[locale]} - View your inventory
\`/leaderboard\` ${dmText[locale]} - Top 10 players
\`/redeem\` ${dmText[locale]} - Redeem codes
\`/middleman\` ${dmText[locale]} - Convert currency
\`/territories\` ${serverText[locale]} - Territory system

**🎟️ Seal Requirements for Expeditions:**
• 3h: 12 seals per person
• 10h solo: 30 seals
• 10h party: 10 seals per person`;

      embed
        .setTitle(`${moneyEmoji} ${t(interaction, "help_economy_title")}`)
        .setDescription(economyCommands);
      break;
    }

    case "gambling": {
      const slotEmoji = getSlotMachineEmoji();
      const gamblingCommands =
        locale === "pt-BR"
          ? `\`/dice\` ${serverText[locale]} - Duelo de dados
\`/bankrob\` ${serverText[locale]} - Assalto cooperativo
\`/duel\` ${serverText[locale]} - Duelo PvP (HP system)
\`/roubo\` ${serverText[locale]} - Roubo de gado em grupo (2-4 jogadores)
\`/roulette\` ${serverText[locale]} - Roleta de cassino`
          : locale === "es-ES"
            ? `\`/dice\` ${serverText[locale]} - Duelo de dados
\`/bankrob\` ${serverText[locale]} - Asalto cooperativo
\`/duel\` ${serverText[locale]} - Duelo PvP (HP system)
\`/roubo\` ${serverText[locale]} - Robo de ganado en grupo (2-4 jugadores)
\`/roulette\` ${serverText[locale]} - Ruleta de casino`
            : locale === "fr"
              ? `\`/dice\` ${serverText[locale]} - Duel de dés
\`/bankrob\` ${serverText[locale]} - Braquage coopératif
\`/duel\` ${serverText[locale]} - Duel PvP (HP system)
\`/roubo\` ${serverText[locale]} - Vol de bétail en groupe (2-4 joueurs)
\`/roulette\` ${serverText[locale]} - Roulette de casino`
              : `\`/dice\` ${serverText[locale]} - Dice duel
\`/bankrob\` ${serverText[locale]} - Cooperative heist
\`/duel\` ${serverText[locale]} - PvP duel (HP system)
\`/roubo\` ${serverText[locale]} - Cattle heist (2-4 players)
\`/roulette\` ${serverText[locale]} - Casino roulette`;

      embed
        .setTitle(`${slotEmoji} ${t(interaction, "help_gambling_title")}`)
        .setDescription(gamblingCommands);
      break;
    }

    case "mining": {
      const pickaxeEmoji = getPickaxeEmoji();
      const miningCommands =
        locale === "pt-BR"
          ? `\`/mine\` ${serverText[locale]} - Minerar ouro (Solo/Cooperativo)`
          : locale === "es-ES"
            ? `\`/mine\` ${serverText[locale]} - Minar oro (Solo/Cooperativo)`
            : locale === "fr"
              ? `\`/mine\` ${serverText[locale]} - Miner de l'or (Solo/Coopératif)`
              : `\`/mine\` ${serverText[locale]} - Mine gold (Solo/Cooperative)`;

      embed
        .setTitle(`${pickaxeEmoji} ${t(interaction, "help_mining_title")}`)
        .setDescription(miningCommands);
      break;
    }

    case "profile": {
      const profileCommands =
        locale === "pt-BR"
          ? `\`/profile\` ${dmText[locale]} - Ver perfil com estatísticas
\`/avatar\` ${dmText[locale]} - Customizar avatar do perfil
\`/inventory\` ${dmText[locale]} - Ver inventário completo`
          : locale === "es-ES"
            ? `\`/profile\` ${dmText[locale]} - Ver perfil con estadísticas
\`/avatar\` ${dmText[locale]} - Personalizar avatar del perfil
\`/inventory\` ${dmText[locale]} - Ver inventario completo`
            : locale === "fr"
              ? `\`/profile\` ${dmText[locale]} - Voir profil avec statistiques
\`/avatar\` ${dmText[locale]} - Personnaliser avatar du profil
\`/inventory\` ${dmText[locale]} - Voir inventaire complet`
              : `\`/profile\` ${dmText[locale]} - View profile with stats
\`/avatar\` ${dmText[locale]} - Customize profile avatar
\`/inventory\` ${dmText[locale]} - View complete inventory`;

      embed
        .setTitle(`👤 ${t(interaction, "help_profile_title")}`)
        .setDescription(profileCommands);
      break;
    }

    case "bounty": {
      const revolverEmoji = getRevolverEmoji();
      const bountyCommands =
        locale === "pt-BR"
          ? `\`/wanted\` ${serverText[locale]} - Colocar recompensa em alguém
\`/bounties\` ${serverText[locale]} - Ver recompensas ativas
\`/capture\` ${serverText[locale]} - Capturar procurado
\`/clearbounty\` ${serverText[locale]} - Limpar sua recompensa`
          : locale === "es-ES"
            ? `\`/wanted\` ${serverText[locale]} - Poner recompensa a alguien
\`/bounties\` ${serverText[locale]} - Ver recompensas activas
\`/capture\` ${serverText[locale]} - Capturar buscado
\`/clearbounty\` ${serverText[locale]} - Limpiar tu recompensa`
            : locale === "fr"
              ? `\`/wanted\` ${serverText[locale]} - Mettre une prime sur quelqu'un
\`/bounties\` ${serverText[locale]} - Voir primes actives
\`/capture\` ${serverText[locale]} - Capturer recherché
\`/clearbounty\` ${serverText[locale]} - Effacer votre prime`
              : `\`/wanted\` ${serverText[locale]} - Put bounty on someone
\`/bounties\` ${serverText[locale]} - View active bounties
\`/capture\` ${serverText[locale]} - Capture wanted person
\`/clearbounty\` ${serverText[locale]} - Clear your bounty`;

      embed
        .setTitle(`${revolverEmoji} ${t(interaction, "help_bounty_title")}`)
        .setDescription(bountyCommands);
      break;
    }

    case "admin": {
      const adminCommands =
        locale === "pt-BR"
          ? `**Configurações do Servidor:**
\`/announcement\` - Sistema de anúncios
\`/setwelcome\` - Configurar mensagens de boas-vindas
\`/setlogs\` - Configurar canal de logs
\`/servidor\` - Informações do servidor
\`/uploademojis\` - Gerenciar emojis customizados

**🔒 Sistemas de Segurança Ativos:**
• Rate limiting: 5s cooldown em /profile e /leaderboard
• Confirmação automática para transações ≥10,000 silver
• Logs de segurança com retenção de 30 dias
• Backups automáticos diários (mantém 7 dias)`
          : locale === "es-ES"
            ? `**Configuraciones del Servidor:**
\`/announcement\` - Sistema de anuncios
\`/setwelcome\` - Configurar mensajes de bienvenida
\`/setlogs\` - Configurar canal de registros
\`/servidor\` - Información del servidor
\`/uploademojis\` - Gestionar emojis personalizados

**🔒 Sistemas de Seguridad Activos:**
• Rate limiting: 5s cooldown en /profile y /leaderboard
• Confirmación automática para transacciones ≥10,000 silver
• Registros de seguridad con retención de 30 días
• Copias de seguridad automáticas diarias (mantiene 7 días)`
            : locale === "fr"
              ? `**Configurations du Serveur:**
\`/announcement\` - Système d'annonces
\`/setwelcome\` - Configurer messages de bienvenue
\`/setlogs\` - Configurer canal de journaux
\`/servidor\` - Informations du serveur
\`/uploademojis\` - Gérer les émojis personnalisés

**🔒 Systèmes de Sécurité Actifs:**
• Rate limiting: 5s cooldown sur /profile et /leaderboard
• Confirmation automatique pour transactions ≥10,000 silver
• Journaux de sécurité avec rétention de 30 jours
• Sauvegardes automatiques quotidiennes (conserve 7 jours)`
              : `**Server Configuration:**
\`/announcement\` - Announcement system
\`/setwelcome\` - Setup welcome messages
\`/setlogs\` - Setup logs channel
\`/servidor\` - Server information
\`/uploademojis\` - Manage custom emojis

**🔒 Active Security Systems:**
• Rate limiting: 5s cooldown on /profile and /leaderboard
• Automatic confirmation for transactions ≥10,000 silver
• Security logs with 30-day retention
• Daily automatic backups (keeps 7 days)`;

      embed
        .setTitle(`⚙️ ${t(interaction, "help_admin_title")}`)
        .setDescription(adminCommands);
      break;
    }

    case "ai": {
      const aiCommands =
        locale === "pt-BR"
          ? `\`/ai\` ${dmText[locale]} - Conversar com Sheriff Rex AI
\`/models\` ${dmText[locale]} - Ver modelos de AI disponíveis

**🤠 Sheriff Rex AI:**
Assistente AI temático do velho oeste que conhece todos os comandos e sistemas do bot!`
          : locale === "es-ES"
            ? `\`/ai\` ${dmText[locale]} - Hablar con Sheriff Rex AI
\`/models\` ${dmText[locale]} - Ver modelos de AI disponibles

**🤠 Sheriff Rex AI:**
¡Asistente AI temático del viejo oeste que conoce todos los comandos y sistemas del bot!`
            : locale === "fr"
              ? `\`/ai\` ${dmText[locale]} - Parler avec Sheriff Rex AI
\`/models\` ${dmText[locale]} - Voir les modèles AI disponibles

**🤠 Sheriff Rex AI:**
Assistant AI thématique du Far West qui connaît toutes les commandes et systèmes du bot!`
              : `\`/ai\` ${dmText[locale]} - Chat with Sheriff Rex AI
\`/models\` ${dmText[locale]} - View available AI models

**🤠 Sheriff Rex AI:**
Wild West themed AI assistant that knows all bot commands and systems!`;

      embed
        .setTitle(
          `🤖 ${locale === "pt-BR" ? "Inteligência Artificial" : locale === "es-ES" ? "Inteligencia Artificial" : locale === "fr" ? "Intelligence Artificielle" : "Artificial Intelligence"}`,
        )
        .setDescription(aiCommands);
      break;
    }

    case "utility": {
      const infoEmoji = getInfoEmoji();
      const utilityCommands =
        locale === "pt-BR"
          ? `\`/help\` - Este menu de ajuda
\`/ping\` - Ver latência do bot
\`/poll\` - Criar enquete
\`/idioma\` - Mudar idioma`
          : locale === "es-ES"
            ? `\`/help\` - Este menú de ayuda
\`/ping\` - Ver latencia del bot
\`/poll\` - Crear encuesta
\`/idioma\` - Cambiar idioma`
            : locale === "fr"
              ? `\`/help\` - Ce menu d'aide
\`/ping\` - Voir latence du bot
\`/poll\` - Créer sondage
\`/idioma\` - Changer la langue`
              : `\`/help\` - This help menu
\`/ping\` - View bot latency
\`/poll\` - Create poll
\`/idioma\` - Change language`;

      embed
        .setTitle(`${infoEmoji} ${t(interaction, "help_utility_title")}`)
        .setDescription(utilityCommands);
      break;
    }

    default:
      embed
        .setTitle(`${cowboyEmoji} ${t(interaction, "help_title")}`)
        .setDescription(t(interaction, "help_overview_desc"));
  }

  return embed;
}

function getCategorySelectMenu(
  interaction: ChatInputCommandInteraction,
  isAdmin: boolean = false,
): ActionRowBuilder<StringSelectMenuBuilder> {
  const locale = getLocale(interaction);

  const categoryNames = {
    ai:
      locale === "pt-BR"
        ? "Inteligência Artificial"
        : locale === "es-ES"
          ? "Inteligencia Artificial"
          : locale === "fr"
            ? "Intelligence Artificielle"
            : "AI",
    economy:
      locale === "pt-BR"
        ? "Economia"
        : locale === "es-ES"
          ? "Economía"
          : locale === "fr"
            ? "Économie"
            : "Economy",
    gambling:
      locale === "pt-BR"
        ? "Jogos"
        : locale === "es-ES"
          ? "Juegos"
          : locale === "fr"
            ? "Jeux"
            : "Gambling",
    mining:
      locale === "pt-BR"
        ? "Mineração"
        : locale === "es-ES"
          ? "Minería"
          : locale === "fr"
            ? "Minage"
            : "Mining",
    profile:
      locale === "pt-BR"
        ? "Perfil"
        : locale === "es-ES"
          ? "Perfil"
          : locale === "fr"
            ? "Profil"
            : "Profile",
    bounty:
      locale === "pt-BR"
        ? "Recompensas"
        : locale === "es-ES"
          ? "Recompensas"
          : locale === "fr"
            ? "Primes"
            : "Bounty",
    utility:
      locale === "pt-BR"
        ? "Utilidades"
        : locale === "es-ES"
          ? "Utilidades"
          : locale === "fr"
            ? "Utilitaires"
            : "Utility",
  };

  const options = [
    new StringSelectMenuOptionBuilder()
      .setLabel(categoryNames.ai)
      .setValue("ai")
      .setEmoji("🤖"),
    new StringSelectMenuOptionBuilder()
      .setLabel(categoryNames.economy)
      .setValue("economy")
      .setEmoji("💰"),
    new StringSelectMenuOptionBuilder()
      .setLabel(categoryNames.gambling)
      .setValue("gambling")
      .setEmoji("🎰"),
    new StringSelectMenuOptionBuilder()
      .setLabel(categoryNames.mining)
      .setValue("mining")
      .setEmoji("⛏️"),
    new StringSelectMenuOptionBuilder()
      .setLabel(categoryNames.profile)
      .setValue("profile")
      .setEmoji("👤"),
    new StringSelectMenuOptionBuilder()
      .setLabel(categoryNames.bounty)
      .setValue("bounty")
      .setEmoji("🔫"),
    new StringSelectMenuOptionBuilder()
      .setLabel(categoryNames.utility)
      .setValue("utility")
      .setEmoji("ℹ️"),
  ];

  // Add admin category if user has permissions
  if (isAdmin) {
    const adminLabel =
      locale === "pt-BR"
        ? "Admin"
        : locale === "es-ES"
          ? "Admin"
          : locale === "fr"
            ? "Admin"
            : "Admin";
    options.push(
      new StringSelectMenuOptionBuilder()
        .setLabel(adminLabel)
        .setValue("admin")
        .setEmoji("⚙️"),
    );
  }

  const placeholder =
    locale === "pt-BR"
      ? "Selecione uma categoria..."
      : locale === "es-ES"
        ? "Selecciona una categoría..."
        : locale === "fr"
          ? "Sélectionnez une catégorie..."
          : "Select a category...";

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId("help_category_select")
    .setPlaceholder(placeholder)
    .addOptions(options);

  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    selectMenu,
  );
}

export = {
  data: applyLocalizations(
    new SlashCommandBuilder()
      .setName("help")
      .setDescription("Shows all available commands and their descriptions")
      .setContexts([0, 1, 2])
      .setIntegrationTypes([0, 1]),
    "help",
  ),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const isAdmin =
      interaction.memberPermissions?.has("Administrator") || false;
    const mainEmbed = getMainEmbed(interaction);
    const selectMenu = getCategorySelectMenu(interaction, isAdmin);

    await interaction.reply({
      embeds: [mainEmbed],
      components: [selectMenu],
      flags: MessageFlags.Ephemeral,
    });
  },

  // Handler para o select menu
  async handleSelectMenu(interaction: any): Promise<void> {
    if (!interaction.isStringSelectMenu()) return;
    if (interaction.customId !== "help_category_select") return;

    const category = interaction.values[0];
    const isAdmin =
      interaction.memberPermissions?.has("Administrator") || false;

    const categoryEmbed = getCategoryEmbed(interaction, category);
    const selectMenu = getCategorySelectMenu(interaction, isAdmin);

    await interaction.update({
      embeds: [categoryEmbed],
      components: [selectMenu],
    });
  },
};
