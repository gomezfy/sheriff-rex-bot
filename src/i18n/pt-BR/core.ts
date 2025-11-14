export const coreTranslations = {
  cooldown:
    "Devagar, parceiro! Até os cavalos precisam descansar. Volta daqui a {time}! 🐴",
  error: "Essa não, parceiro! Meu cavalo tropeçou e derrubou tudo... 🤠",
  inventory_full:
    "Peraí, cowboy! Tá carregando o rancho inteiro nas costas? Libera espaço aí! 🎒",

  ping_pong: "🏓 Pong!",
  ping_latency: "Latência do Bot",
  ping_api_latency: "Latência da API",
  ping_uptime: "Tempo Online",
  ping_status: "Status",
  ping_calculating: "🏓 Calculando latência...",
  ping_excellent: "✅ Excelente",
  ping_good: "🟢 Bom",
  ping_medium: "🟡 Médio",
  ping_slow: "🟠 Lento",
  ping_critical: "🔴 Crítico",

  daily_title: "Recompensa Diária",
  daily_already_claimed:
    "Você já reivindicou sua recompensa diária!\n\n**Tempo restante:** {time}\n**Sequência atual:** {streak} dia{plural}",
  daily_come_back: "Volte amanhã!",
  daily_failed_title: "Recompensa Diária Falhou",
  daily_inventory_too_full:
    "{error}\n\nSeu inventário está muito cheio para reivindicar esta recompensa!",
  daily_free_space: "Libere espaço e tente novamente!",
  daily_streak_broken: "Sua sequência foi quebrada! Começando de novo.",
  daily_claimed_success: "Recompensa diária reivindicada com sucesso!",
  daily_comeback_24h: "Volte em 24 horas!",
  daily_field_silver: "Moedas de Prata",
  daily_field_tokens: "Saloon Tokens",
  daily_field_xp: "XP Ganho",
  daily_field_streak: "Sequência",
  daily_field_bonus: "Bônus",
  daily_day: "dia",
  daily_days: "dias",

  auto_daily_reward_title: "🌟 Recompensas Diárias Entregues!",
  auto_daily_reward_desc:
    "*O xerife passou pela cidade e deixou um presente para você!*\n\n" +
    "╭─────────────────╮\n" +
    "│ {token} **{tokenAmount}** Saloon Tokens\n" +
    "│ {gold} **{goldAmount}** Barras de Ouro\n" +
    "│ 🎟️ **{sealAmount}** Selos\n" +
    "╰─────────────────╯\n\n" +
    "*Suas recompensas foram adicionadas ao inventário.*",
  auto_daily_reward_footer:
    "Próximas recompensas amanhã às {hour}:00 • Sheriff Rex",
  auto_daily_inventory_full_title: "⚠️ Inventário Cheio!",
  auto_daily_inventory_full_desc:
    "*O xerife tentou entregar suas recompensas, mas sua mochila está lotada!*\n\n" +
    "**📦 Espaço necessário:** ~{needed}kg\n" +
    "**📦 Espaço disponível:** {available}kg\n\n" +
    "*Venda ou organize itens para liberar espaço e receber suas recompensas.*",
  auto_daily_inventory_full_footer: "Use /inventory para ver seus itens • Sheriff Rex",

  inventory_private_title: "Inventário Privado",
  inventory_private_desc:
    "Por questões de privacidade, você só pode ver seu próprio inventário.",
  inventory_private_footer: "Use /inventory sem parâmetros para ver o seu",
  inventory_title: "Mochila de {username}",
  inventory_subtitle: "Gerencie seus itens, moedas e espaço no inventário.",
  inventory_currency: "Moedas",
  inventory_stats: "Estatísticas do Inventário",
  inventory_stats_items:
    "**Itens:** {items}\n**Tipos:** {types}/50\n**Peso:** {weight}kg / {maxWeight}kg",
  inventory_items: "Itens na Mochila",
  inventory_empty:
    "*Sua mochila está vazia. Comece a trabalhar ou minerar para coletar itens!*",
  inventory_capacity: "Capacidade de Peso",
  inventory_next_upgrade:
    "\n💡 **Próximo Upgrade:** {capacity}kg por **${price}** na loja",
  inventory_max_capacity: "\n✨ **Capacidade máxima alcançada!**",
  inventory_nearly_full_warning:
    "⚠️ Sua mochila está quase cheia! Use /give para transferir itens ou aumente sua capacidade.",
  inventory_full_warning:
    "🚨 MOCHILA CHEIA! Você não pode coletar mais itens até liberar espaço.",
  inventory_transfer_hint:
    "Use /give para transferir itens para outros jogadores",

  profile_edit_bio: "Editar Bio",
  profile_edit_phrase: "Editar Frase",
  profile_change_bg: "Mudar Fundo",
  profile_change_frame: "Trocar Moldura",
  profile_shop_bg: "Loja de Fundos",
  profile_shop_frames: "Loja de Molduras",
  profile_show_public: "Exibir no Chat",
  profile_level: "Nível",
  profile_about_me: "Sobre Mim",
  profile_no_bio: "Nenhuma bio definida ainda...",

  bg_shop_title: "🛒 Loja de Fundos",
  bg_shop_price: "Preço",
  bg_shop_status: "Status",
  bg_shop_tokens: "Saloon Tokens",
  bg_shop_free: "✅ GRÁTIS",
  bg_shop_owned: "✅ Já Possui",
  bg_shop_available: "✅ Disponível",
  bg_shop_can_purchase: "💰 Pode Comprar",
  bg_shop_not_enough: "❌ Tokens insuficientes",
  bg_shop_your_tokens: "Seus Tokens",
  bg_shop_footer: "Fundo {current} de {total}",
  bg_shop_btn_back: "Voltar",
  bg_shop_btn_next: "Próximo",
  bg_shop_btn_owned: "Possui",
  bg_shop_btn_claim: "Resgatar",
  bg_shop_btn_buy: "{price} 🎫",

  frame_shop_title: "🖼️ Loja de Molduras",
  frame_shop_price: "Preço",
  frame_shop_status: "Status",
  frame_shop_owned: "✅ Já Possui",
  frame_shop_available: "✅ Disponível",
  frame_shop_can_purchase: "💰 Pode Comprar",
  frame_shop_not_enough: "❌ Tokens insuficientes",
  frame_shop_your_tokens: "Seus Tokens",
  frame_shop_footer: "Moldura {current} de {total}",
  frame_shop_btn_back: "Voltar",
  frame_shop_btn_next: "Próximo",
  frame_shop_btn_owned: "Possui",
  frame_shop_btn_claim: "Resgatar",
  frame_shop_btn_buy: "{price} 🎫",

  help_title: "📖 Central de Ajuda do Sheriff Rex",
  help_intro:
    "*Seja bem-vindo ao Velho Oeste, parceiro! Aqui está tudo que você precisa saber para começar sua jornada.*",
  help_getting_started: "🌵 Como Começar",
  help_starting_guide:
    "Use `/daily` para pegar suas recompensas diárias\nExplore `/profile` para ver seu progresso\nConfira `/inventory` para ver seus itens\nVisite a `/shop` para comprar equipamentos",
  help_economy: "💰 Sistema de Economia",
  help_economy_info:
    "**Moedas de Prata**: Use em compras básicas\n**Saloon Tokens**: Moeda premium para itens especiais\n**Barras de Ouro**: Investimento de longo prazo",
  help_commands: "⚙️ Categorias de Comandos",
  help_use_command: "Use `/help <categoria>` para mais detalhes",
  help_support: "🤝 Precisa de Ajuda?",
  help_support_info:
    "Entre em contato com o suporte do servidor ou visite nossa documentação completa",
  help_footer: "Sheriff Rex • Sistema de Ajuda Interativo",
};
