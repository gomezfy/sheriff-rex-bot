import {
  ChatInputCommandInteraction,
  ButtonInteraction,
  StringSelectMenuInteraction,
  Interaction,
} from "discord.js";

const translations: Record<string, Record<string, string>> = {
  "pt-BR": {
    cooldown:
      "Devagar, parceiro! Até os cavalos precisam descansar. Volta daqui a {time}! 🐴",
    error: "Essa não, parceiro! Meu cavalo tropeçou e derrubou tudo... 🤠",
    inventory_full:
      "Peraí, cowboy! Tá carregando o rancho inteiro nas costas? Libera espaço aí! 🎒",

    // Ping Command
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

    // Daily Command
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

    // Automatic Daily Rewards
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

    // Inventory Command
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

    // Profile Command
    profile_edit_bio: "Editar Bio",
    profile_edit_phrase: "Editar Frase",
    profile_change_bg: "Mudar Fundo",
    profile_change_frame: "Trocar Moldura",
    profile_shop_bg: "Loja de Fundos",
    profile_shop_frames: "Loja de Molduras",
    profile_level: "Nível",
    profile_about_me: "Sobre Mim",
    profile_no_bio: "Nenhuma bio definida ainda...",

    // Background Shop
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

    // Frame Shop
    frame_shop_title: "🖼️ Loja de Molduras",
    frame_shop_price: "Preço",
    frame_shop_status: "Status",
    frame_shop_tokens: "Saloon Tokens",
    frame_shop_owned: "✅ Já possui",
    frame_shop_available: "💰 Disponível para compra",
    frame_shop_not_enough: "❌ Tokens insuficientes",
    frame_shop_your_tokens: "Seus tokens",
    frame_shop_footer: "Moldura {current} de {total}",
    frame_shop_btn_owned: "✅ Já possui",
    frame_shop_btn_buy: "💰 Comprar",

    mine_cooldown:
      "Você está cansado demais para minerar! Volte em: **{time}**",
    mine_title: "MINERAÇÃO DE OURO",
    mine_choose: "Escolha seu método de mineração:",
    mine_solo: "Mineração Solo",
    mine_solo_desc:
      "Duração: 90 minutos (45min com boost)\nRecompensa: 1-3 Barras de Ouro\nRisco: Baixo",
    mine_coop: "Mineração Cooperativa",
    mine_coop_desc:
      "Duração: 30 minutos (15min com boost)\nRecompensa: 4-6 Barras de Ouro (divididas)\nRisco: Alto",
    mine_gold_value: "1 Barra de Ouro = {value} Moedas de Prata",
    mine_progress: "Minerando ouro...",
    mine_success: "Você minerou {amount} Barra(s) de Ouro!",
    mine_value: "Valor",
    mine_next: "Próxima Mineração",
    mine_good_work: "Bom trabalho, parceiro!",
    mine_in_progress: "MINERANDO EM ANDAMENTO",
    mine_currently_mining: "Você está minerando ouro atualmente!",
    mine_time_remaining: "Tempo Restante",
    mine_type: "Tipo",
    mine_expected_reward: "Recompensa Esperada",
    mine_come_back: "Volte quando a mineração estiver completa!",
    mine_complete: "MINERAÇÃO COMPLETA!",
    mine_complete_desc: "Sua operação de mineração está completa!",
    mine_reward: "Recompensa",
    mine_collect_btn: "Coletar Ouro",
    mine_great_work: "Ótimo trabalho, parceiro!",
    mine_collection_failed: "COLETA FALHOU",
    mine_inventory_heavy:
      "Sua mochila está muito pesada para carregar o ouro!\n\nLibere espaço e use /mine novamente para coletar.",
    mine_gold_waiting: "O ouro vai esperar por você!",
    mine_collected: "OURO COLETADO!",
    mine_you_collected: "Você coletou",
    mine_can_mine_again:
      "Ótimo trabalho, parceiro! Você pode minerar novamente agora.",
    mine_sessions_btn: "Ver Sessões",
    mine_alone_duration: "Minerar Sozinho (1h30m)",
    mine_find_partner: "Encontrar Parceiro (30min)",
    mine_solo_started: "MINERAÇÃO SOLO INICIADA!",
    mine_started_mining: "Você começou a minerar ouro!",
    mine_duration: "Duração",
    mine_expected: "Esperado",
    mine_automatic: "A mineração acontecerá automaticamente.",
    mine_come_back_in: "Volte em 1h30m",
    mine_check_progress: "Use /mine para verificar o progresso!",
    mine_not_yours: "Este ouro não é seu!",
    mine_looking_partner: "PROCURANDO PARCEIRO DE MINERAÇÃO",
    mine_is_looking: "está procurando um parceiro de mineração!",
    mine_total_reward: "Recompensa Total",
    mine_split_between: "4-6 Barras de Ouro (divididas entre ambos)",
    mine_click_to_join: "Clique abaixo para participar!",
    mine_first_person: "A primeira pessoa a clicar participa!",
    mine_cannot_join_self: "Você não pode minerar consigo mesmo!",
    mine_already_mining:
      "Você já está minerando! Complete sua operação atual primeiro.",
    mine_coop_started: "MINERAÇÃO COOPERATIVA INICIADA!",
    mine_mining_together: "começaram a minerar juntos!",
    mine_total_gold: "Ouro Total",
    mine_invitation_expired: "CONVITE DE MINERAÇÃO EXPIRADO",
    mine_no_one_joined:
      "Ninguém participou da sua operação de mineração.\n\nTente novamente ou mine sozinho!",
    mine_better_luck: "Mais sorte da próxima vez!",
    mine_sessions_tracker: "RASTREADOR DE SESSÕES DE MINERAÇÃO",
    mine_current_operations: "Operações de mineração em andamento no servidor",
    mine_overview: "Visão Geral",
    mine_active_sessions: "Sessões Ativas",
    mine_solo_mining_label: "Mineração Solo",
    mine_cooperative_label: "Cooperativa",
    mine_ready_to_claim: "Pronto para Coletar",
    mine_pending_gold: "Ouro Pendente",
    mine_active_mining: "Mineração Ativa",
    mine_no_active_sessions: "Nenhuma Sessão Ativa",
    mine_no_one_mining: "Ninguém está minerando atualmente.",
    mine_no_one_mining_start:
      "Ninguém está minerando atualmente. Use os botões abaixo para começar!",
    mine_auto_come_back:
      "A mineração acontece automaticamente - volte quando terminar!",
    mine_duration_1h30: "Duração: 1h 30min",
    mine_duration_1h30_boosted: "45m (⚡ +50% boost!)",
    mine_duration_30min: "Duração: 30 minutos",
    mine_duration_30min_boosted: "15m (⚡ +50% boost!)",
    mine_boost_badge:
      "\n⛏️ **Ações da Mina de Ouro:** Mineração 50% mais rápida!",
    mine_reward_1_3: "Recompensa: 1-3 Barras de Ouro",
    mine_players_1: "Jogadores: 1",
    mine_reward_4_6_split: "Recompensa: 4-6 Barras de Ouro (divididas)",
    mine_players_2: "Jogadores: 2",
    mine_gold_value_label: "Valor do Ouro",
    mine_sessions_realtime: "Sessões de mineração atualizam em tempo real",
    mine_more: "mais...",
    mine_blocked_expedition_title: "Você está em uma Expedição!",
    mine_blocked_expedition_desc:
      "Você não pode minerar enquanto estiver em uma expedição ativa. Complete a expedição primeiro!",
    mine_blocked_expedition_footer:
      "Volte quando a expedição terminar para minerar novamente.",
    silver_coins: "Moedas de Prata",
    gold_bars: "Barras de Ouro",
    wheat_item: "Trigo",
    honey_item: "Mel",
    weight: "Peso",
    time_minutes: "{min} minutos",
    time_hours: "{hours}h {min}m",

    // Emoji Placeholders (PT-BR)
    emoji_pickaxe: "[PICARETA]",
    emoji_gold_bar: "[OURO]",
    emoji_silver_coin: "[PRATA]",
    emoji_cowboy: "[COWBOY]",
    emoji_cowboys: "[COWBOYS]",
    emoji_check: "[OK]",
    emoji_sparkles: "[BRILHO]",
    emoji_moneybag: "[SACO$]",
    emoji_backpack: "[MOCHILA]",
    emoji_cancel: "[X]",
    emoji_stats: "[STATS]",
    emoji_timer: "[TEMPO]",
    emoji_diamond: "[DIAMANTE]",
    emoji_mute: "[MUDO]",

    // Mining DM Notifications
    mine_dm_complete_title: "MINERAÇÃO COMPLETA!",
    mine_dm_complete_desc: "Sua operação de mineração foi concluída!",
    mine_dm_type_label: "Tipo de Mineração",
    mine_dm_type_solo: "{pickaxe} Mineração Solo",
    mine_dm_type_coop: "{cowboys} Mineração Cooperativa",
    mine_dm_gold_available: "Ouro Disponível",
    mine_dm_footer: "Use /mine para coletar seu ouro!",

    // Bank Robbery Command
    bankrob_cant_rob_alone: "Você não pode assaltar o banco sozinho! Escolha um parceiro.",
    bankrob_bots_cant_help: "Bots não podem ajudar você a assaltar um banco! Escolha um parceiro de verdade.",
    bankrob_invitation_only: "Este convite de assalto é apenas para **{partner}**!",
    bankrob_footer_join: "{partner}, clique no botão abaixo para participar!",
    bankrob_started_title: "ASSALTO AO BANCO INICIADO!",
    bankrob_time_left: "Tempo restante: **{time}**",
    bankrob_progress_bar_desc: "**{user1}** e **{user2}** estão assaltando o banco!\n\n**Progresso:**\n`{bar}` {percent}%\n\n{clock} {timeLeft}\n\nFique quieto e não atraia atenção!",
    bankrob_in_jail: "Você está na prisão!",
    bankrob_in_jail_desc:
      "Você não pode cometer crimes enquanto cumpre sua sentença!",
    bankrob_time_remaining: "Tempo restante",
    bankrob_sheriff_watching:
      "O xerife está de olho em você! Espere {time} minutos antes de tentar outro assalto.",
    bankrob_already_active:
      "Você já tem um assalto ativo! Espere terminar ou expirar.",
    bankrob_join_btn: "Participar do Assalto",
    bankrob_title: "ASSALTO AO BANCO",
    bankrob_planning: "está planejando um assalto ao banco!",
    bankrob_dangerous_job:
      "Este é um trabalho perigoso, parceiro. Precisamos de mais um fora-da-lei para fazer isso!",
    bankrob_partner_accept: "**{partner}**, você tem 60 segundos para aceitar!",
    bankrob_silver_reward: "Recompensa em Prata",
    bankrob_silver_split: "800-1.500 Moedas (divididas)",
    bankrob_gold_bonus: "Bônus de Ouro",
    bankrob_gold_split: "2 Barras de Ouro (divididas)",
    bankrob_duration: "Duração",
    bankrob_3_minutes: "3 minutos",
    bankrob_risk: "Risco",
    bankrob_risk_capture: "30% de chance de captura!",
    bankrob_invite_desc: "**{user}** convidou **{partner}** para assaltar o banco!\n\n{job}\n\n{clock} **{partner}**, você tem 60 segundos para aceitar!",
    bankrob_partner_in_jail:
      "Você está na prisão e não pode participar de assaltos!",
    bankrob_partner_jail_time: "Tempo restante: **{time}**",
    bankrob_already_started: "Este assalto já começou ou terminou!",
    bankrob_in_progress: "ASSALTO AO BANCO EM ANDAMENTO!",
    bankrob_robbing: "estão assaltando o banco!",
    bankrob_progress: "Progresso",
    bankrob_keep_quiet: "Fique quieto e não atraia atenção!",
    bankrob_sheriff_patrol: "O xerife pode estar em patrulha...",
    bankrob_success_title: "ASSALTO BEM-SUCEDIDO!",
    bankrob_success_desc:
      "**{user1}** e **{user2}** conseguiram assaltar o banco e escapar!\n\nVocês conseguiram escapar com o saque!",
    bankrob_total_haul: "Saque Total",
    bankrob_haul_value: "{silver} {silverEmoji} Moedas de Prata\n{gold} {goldEmoji} Barras de Ouro",
    bankrob_bounty_value: "{silverEmoji} {amount} Moedas de Prata",
    bankrob_share: "Parte de",
    bankrob_nothing: "Nada (inventário cheio)",
    bankrob_warnings: "Avisos",
    bankrob_spend_wisely: "Gaste com sabedoria antes que a lei apareça!",
    bankrob_lost_loot: "Algum saque foi perdido! Limpe seu inventário!",
    bankrob_bag_heavy_silver: "mochila de **{user}** muito pesada para Prata!",
    bankrob_bag_heavy_gold: "mochila de **{user}** muito pesada para Ouro!",
    bankrob_partial_escape: "FUGA PARCIAL!",
    bankrob_partial_desc: "**{escapee}** conseguiu escapar, mas **{captured}** foi capturado pelo Xerife!\n\n{alarm} O fugitivo agora está PROCURADO!\n{lock} **{captured} não pode enviar mensagens por 30 minutos!**",
    bankrob_escaped: "Escapou",
    bankrob_captured: "Capturado",
    bankrob_timeout_30min: "**30 min de timeout**",
    bankrob_bounty_placed: "Recompensa Colocada",
    bankrob_system_error: "Erro do sistema",
    bankrob_escapee_wanted: "{escapee} agora está procurado! Use /claim para capturá-lo!",
    bankrob_both_captured: "AMBOS CAPTURADOS!",
    bankrob_both_caught_desc: "**{user1}** e **{user2}** foram capturados pelo Xerife!\n\nNenhum saque foi roubado, e ambos os fora-da-lei estão na prisão agora!\n\n{lock} **Você não pode enviar mensagens por 30 minutos!**",
    bankrob_punishment: "Punição",
    bankrob_lost: "Perdido",
    bankrob_all_loot: "Todo o saque potencial",
    bankrob_crime_no_pay:
      "O crime não compensa quando o Xerife está de plantão!",
    bankrob_cancelled: "Assalto Cancelado",
    bankrob_no_partner:
      "Nenhum parceiro se juntou ao assalto. O plano foi abandonado.",
    bankrob_better_luck: "Mais sorte da próxima vez, parceiro!",
    bankrob_punishment_reason: "Capturado durante assalto ao banco",

    // Cattle Rustling (Roubo) Command
    roubo_title: "🐄 Roubo de Gado em Grupo",
    roubo_organizing: "🤠 está organizando um roubo de gado!",
    roubo_details: "🎯 Detalhes do Roubo:",
    roubo_players_needed: "👥 Jogadores necessários",
    roubo_cattle_to_steal: "🐄 Gado a roubar",
    roubo_cattle_options: "8, 12 ou 20 cabeças",
    roubo_cost_per_person: "💸 Custo por pessoa",
    roubo_warning: "⚠️ AVISO",
    roubo_warning_text:
      "Se o roubo falhar, TODOS os participantes ficarão procurados!",
    roubo_participants_label: "📋 Participantes",
    roubo_time_remaining: "⏱️ Tempo restante",
    roubo_footer_join: "👆 Clique no botão abaixo para participar!",
    roubo_btn_join: "Entrar",
    roubo_btn_cancel: "Cancelar",
    roubo_only_organizer_cancel: "❌ Apenas o organizador pode cancelar!",
    roubo_cancelled: "❌ Roubo cancelado pelo organizador.",
    roubo_already_in: "⚠️ Você já está participando deste roubo!",
    roubo_heist_full: "⚠️ O roubo já está cheio!",
    roubo_need_silver:
      "❌ Você precisa de **{amount}** Silver Coins para participar deste roubo!",
    roubo_in_jail: "🔒 Você está preso e não pode participar!",
    roubo_group_complete: "🎯 Grupo completo! Iniciando o roubo...",
    roubo_time_expired:
      "⏰ Tempo esgotado! Não foi possível reunir jogadores suficientes.",
    roubo_starting: "🐄 INICIANDO ROUBO DE GADO!",
    roubo_in_progress: "⚙️ O grupo está roubando gado...",
    roubo_progress_desc:
      "🤫 Os cowboys estão trabalhando silenciosamente para roubar o gado sem serem vistos!",
    roubo_be_quiet: "🤫 Fiquem quietos e não atraiam atenção!",
    roubo_rancher_patrol: "👀 O dono do rancho pode estar patrulhando...",
    roubo_success_title: "✅ Roubo Bem-Sucedido!",
    roubo_success_desc:
      "🐴 O grupo roubou {cattle} cabeças de gado!\n\nVocês conseguiram escapar sem serem vistos e dividiram o gado!",
    roubo_distribution: "📦 Distribuição do Gado",
    roubo_added_inventory:
      "✅ O gado foi adicionado ao inventário de cada participante!",
    roubo_total_cattle: "🐄 Total de Gado",
    roubo_participants_count: "👥 Participantes",
    roubo_teamwork: "🤝 Trabalho em equipe dá resultado!",
    roubo_fail_title: "⚠️ Roubo Fracassado!",
    roubo_fail_desc:
      "🔫 O grupo foi pego em flagrante!\n\nO dono do rancho viu vocês e chamou o xerife! Todos tiveram que fugir às pressas sem o gado.",
    roubo_all_wanted: "⚠️ TODOS OS PARTICIPANTES ESTÃO PROCURADOS!",
    roubo_bounty_per_head: "💰 Recompensa por cabeça",
    roubo_reason: "🔫 Motivo",
    roubo_wanted_list: "👥 Procurados",
    roubo_watch_bounty_hunters: "⚠️ Cuidado com os caçadores de recompensa!",
    roubo_crime_sometimes: "💀 O crime não compensa... às vezes.",
    roubo_insufficient_silver:
      "❌ Um dos participantes não tem silver suficiente! Roubo cancelado.",
    roubo_random_word: "🎲 aleatório",
    roubo_progress_label: "📊 Progresso",
    roubo_in_jail_cooldown: "🔒 Você está preso!",
    roubo_cooldown_wait:
      "⏰ Aguarde {time} segundos antes de tentar outro roubo!",
    roubo_time_remaining_punishment: "⏱️ Tempo restante",
    roubo_cattle_word: "gado",
    roubo_entry_fee_required:
      "❌ Você precisa de **{amount}** Silver Coins para participar deste roubo!",

    // Middleman Command
    middleman_title: "INTERMEDIÁRIO - CÂMBIO DE MOEDAS",
    middleman_welcome: "Bem-vindo ao Intermediário, parceiro!",
    middleman_description:
      "Troque seus itens valiosos por Moedas de Prata a taxas justas.",
    middleman_exchange_rates: "TAXAS DE CÂMBIO",
    middleman_your_inventory: "Seu Inventário",
    middleman_saloon_tokens: "Fichas Saloon",
    middleman_gold_bars: "Barras de Ouro",
    middleman_how_to_exchange: "Como Trocar",
    middleman_step1:
      "1. Clique em um botão abaixo para selecionar o que converter",
    middleman_step2: "2. Escolha quantos itens trocar",
    middleman_step3: "3. Receba Moedas de Prata instantaneamente!",
    middleman_fair_trades: "Trocas justas garantidas pelo Xerife!",
    middleman_tokens_to_silver: "Fichas → Prata",
    middleman_gold_to_silver: "Ouro → Prata",
    middleman_visit_shop: "Visitar Loja",
    middleman_not_for_you: "Esta troca não é para você!",
    middleman_no_tokens: "Você não tem nenhuma Ficha Saloon para converter!",
    middleman_no_gold: "Você não tem nenhuma Barra de Ouro para converter!",
    middleman_select_amount: "Selecione a quantidade para converter:",
    middleman_you_have_tokens: "Você tem",
    middleman_you_have_gold: "Você tem",
    middleman_select_tokens: "Selecione quantas Fichas converter",
    middleman_select_gold: "Selecione quantas Barras de Ouro converter",
    middleman_not_enough_tokens:
      "Você não tem Fichas Saloon suficientes! Você tem apenas",
    middleman_not_enough_gold:
      "Você não tem Barras de Ouro suficientes! Você tem apenas",
    middleman_error: "Erro",
    middleman_success_title: "TROCA BEM-SUCEDIDA!",
    middleman_converted_tokens: "Você converteu",
    middleman_converted_gold: "Você converteu",
    middleman_into: "em",
    middleman_tokens_converted: "Fichas Convertidas",
    middleman_gold_converted: "Ouro Convertido",
    middleman_silver_received: "Prata Recebida",
    middleman_thanks: "Obrigado por usar o serviço Intermediário!",
    middleman_token: "Ficha",
    middleman_tokens: "Fichas",
    middleman_bar: "Barra",
    middleman_bars: "Barras",
    middleman_all: "Tudo",

    // Redeem Command
    redeem_invalid_title: "Código Inválido",
    redeem_invalid_desc:
      "O código `{code}` não existe.\n\nCertifique-se de que você copiou corretamente da loja!",
    redeem_invalid_footer: "Compre produtos na loja do site",
    redeem_already_title: "Já Resgatado",
    redeem_already_desc:
      "Este código já foi usado!\n\n**Produto:** {product}\n**Resgatado em:** {date}",
    redeem_already_footer: "Cada código pode ser usado apenas uma vez",
    redeem_processing: "Processando sua compra...",
    redeem_upgrade_not_needed_title: "Upgrade Não Necessário",
    redeem_upgrade_not_needed_desc:
      "Você já tem uma mochila com **{current}kg** de capacidade!\n\nEste upgrade é para **{target}kg**, que você já tem ou excedeu.\n\n**Nota:** Seu código de resgate **não foi consumido** e pode ser dado a outro jogador.",
    redeem_upgrade_not_needed_footer:
      "Considere comprar um upgrade de nível superior",
    redeem_success_title: "Código Resgatado com Sucesso!",
    redeem_success_desc:
      "Obrigado pela sua compra! 🎉\n\n**Produto:** {product}\n**Código:** `{code}`",
    redeem_success_footer: "Aproveite suas recompensas, parceiro!",
    redeem_rewards: "Recompensas Recebidas",
    redeem_special_perks: "Vantagens especiais ativadas!",
    redeem_vip_status: "Status VIP",
    redeem_vip_activated:
      "Ativado! Você agora tem acesso a recursos exclusivos.",
    redeem_background: "Fundo Exclusivo",
    redeem_background_unlocked: "Desbloqueado! Use-o no seu perfil.",
    redeem_backpack: "Mochila Melhorada",
    redeem_backpack_upgraded:
      "Sua capacidade de inventário agora é **{capacity}kg**!",
    redeem_error_title: "Erro de Resgate",
    redeem_error_desc:
      "Ocorreu um erro ao processar seu código.\n\nTente novamente ou entre em contato com o suporte se o problema persistir.",
    redeem_error_footer: "Detalhes do erro foram registrados",
    redeem_inventory_upgraded: "Inventário melhorado para **{capacity}kg**",

    // Help Command Translations (Portuguese)
    help_title: "🤠 Sheriff Rex - Guia de Comandos",
    help_overview_desc:
      "**Bem-vindo ao Velho Oeste!** Sheriff Rex é um bot completo com sistema de economia, jogos, mineração e muito mais.\n\n📱 **Suporte a DM:** Alguns comandos funcionam em mensagens diretas!\n🎮 **34 Comandos Disponíveis**\n\n**Selecione uma categoria abaixo para ver os comandos:**",
    help_footer: "🌵 Use os botões para navegar entre as categorias",
    help_btn_economy: "💰 Economia",
    help_btn_gambling: "🎲 Gambling",
    help_btn_mining: "⛏️ Mineração",
    help_btn_profile: "👤 Perfil",
    help_btn_bounty: "🔫 Bounty",
    help_btn_admin: "⚙️ Admin",
    help_btn_utility: "🔧 Utilidade",
    help_btn_home: "🏠 Menu Inicial",
    help_btn_support: "🆘 Suporte",
    help_btn_invite: "➕ Adicionar Bot",
    help_btn_website: "🌐 Website",
    help_only_user: "❌ Apenas quem usou o comando pode navegar!",

    // Category Titles (Portuguese)
    help_economy_title: "💰 Economia & Trading",
    help_gambling_title: "🎲 Gambling & Jogos",
    help_mining_title: "⛏️ Sistema de Mineração",
    help_profile_title: "👤 Perfil & Customização",
    help_bounty_title: "🔫 Sistema de Bounty",
    help_admin_title: "⚙️ Administração do Servidor",
    help_utility_title: "🔧 Comandos de Utilidade",

    // Category Descriptions (Portuguese)
    help_economy_desc:
      "**Sistema econômico completo com moedas, itens e transferências.**\n\n🪙 **Silver Coins** - Moeda principal do servidor\n🥇 **Gold Bars** - Itens valiosos (1 barra = 700 Silver)\n🎟️ **Saloon Tokens** - Moeda premium para customizações\n💼 **Backpack System** - Sistema de mochila com upgrades",
    help_gambling_desc:
      "**Jogos de apostas e azar do Velho Oeste!**\n\n💰 Aposte suas Silver Coins\n🎰 Múltiplos jogos disponíveis\n🤝 Jogos solo e cooperativos\n⚠️ Aposte com responsabilidade!",
    help_mining_desc:
      "**Mine nas montanhas do Velho Oeste!**\n\n🥇 Encontre Gold Bars valiosas\n💎 Descubra minérios raros\n🤝 Mine sozinho ou em dupla\n⏰ Cooldowns estratégicos",
    help_profile_desc:
      "**Personalize seu perfil do Velho Oeste!**\n\n🎨 Backgrounds customizáveis\n📊 Sistema de XP e Níveis\n🖼️ Profile cards visuais\n✨ Efeito glassmorphism",
    help_bounty_desc:
      "**Caçada de recompensas no Velho Oeste!**\n\n💀 Coloque recompensas em jogadores\n🎯 Capture criminosos procurados\n💰 Ganhe recompensas em Silver\n⚖️ Sistema de justiça western",
    help_admin_desc:
      "**Comandos exclusivos para administradores!**\n\n🛡️ Requer permissões de admin\n🎛️ Configurações do servidor\n💸 Gerenciamento de economia\n📢 Sistema de anúncios avançado",
    help_utility_desc:
      "**Ferramentas úteis e informações do bot!**\n\n📊 Status e informações\n🌐 Configurações gerais\n❓ Ajuda e suporte\n⚡ Performance",

    // Territories Command
    territories_price: "Preço",
    territories_rarity: "Raridade",
    territories_status: "Status",
    territories_owned: "POSSUI",
    territories_available: "Disponível",
    territories_insufficient: "Fundos Insuficientes",
    territories_benefits: "Benefícios",
    territories_footer:
      "Território {current} de {total} • Você possui {owned}/{total} territórios",
    territories_prev: "Anterior",
    territories_next: "Próximo",
    territories_buy: "Comprar por {price}k",
    territories_my_territories: "Meus Territórios",
    territories_close: "Fechar",
    territories_not_yours: "Este navegador de territórios não é para você!",
    territories_need_more:
      "Você precisa de {amount} Moedas de Prata a mais para comprar este território!",
    territories_already_own: "Você já possui este território!",
    territories_transaction_failed: "Transação falhou! Tente novamente.",
    territories_purchase_failed: "Compra falhou! Sua prata foi reembolsada.",
    territories_purchased_title: "TERRITÓRIO COMPRADO!",
    territories_purchased_desc:
      "Parabéns! Você agora é o orgulhoso proprietário de **{name}**!",
    territories_amount_paid: "Valor Pago",
    territories_remaining_balance: "Saldo Restante",
    territories_benefits_unlocked: "Benefícios Desbloqueados",
    territories_now_own: "Você agora possui {count} territórios!",
    territories_my_title: "SEUS TERRITÓRIOS",
    territories_no_territories: "Você ainda não possui nenhum território.",
    territories_statistics: "Estatísticas",
    territories_owned_count:
      "**Possuídos:** {owned}/{total}\n**Conclusão:** {percentage}%",
    territories_keep_expanding: "Continue expandindo seu império!",
    territories_browser_closed:
      "Navegador de territórios fechado. Volte a qualquer momento!",

    // Territory Rarities
    rarity_common: "Comum",
    rarity_rare: "Raro",
    rarity_epic: "Épico",
    rarity_legendary: "Lendário",

    // Territory Names
    territory_saloon_business_name: "Negócio de Saloon",
    territory_saloon_business_desc:
      "Possua um saloon movimentado no coração da cidade! Sirva bebidas, organize eventos e veja as moedas chegarem.",
    territory_saloon_business_benefit_1:
      "💰 Gere 5.000 Moedas de Prata diariamente",
    territory_saloon_business_benefit_2: "",

    territory_gold_mine_shares_name: "Ações da Mina de Ouro",
    territory_gold_mine_shares_desc:
      "Invista na mina de ouro mais rica do Oeste! Suas ações trarão renda constante de metais preciosos.",
    territory_gold_mine_shares_benefit_1:
      "💰 Gere 12.000 Moedas de Prata diariamente",
    territory_gold_mine_shares_benefit_2:
      "⚡ Operações de mineração 50% mais rápidas",

    territory_ranch_name: "Rancho",
    territory_ranch_desc:
      "Construa seu próprio rancho com gado, cavalos e planícies abertas. O verdadeiro sonho de um cowboy!",
    territory_ranch_benefit_1: "💰 Gere 15.000 Moedas de Prata diariamente",
    territory_ranch_benefit_2: "🐄 Receba 8 Gado semanalmente",

    // Bounty Commands
    bounty_invalid_target: "Alvo Inválido",
    bounty_cant_target_bot:
      "Você não pode colocar recompensa em um bot, parceiro!",
    bounty_choose_real_outlaw: "Escolha um fora-da-lei de verdade",
    bounty_self_not_allowed: "Auto-Recompensa Não Permitida",
    bounty_cant_target_self: "Você não pode colocar recompensa em si mesmo!",
    bounty_mighty_strange: "Isso seria muito estranho, parceiro",
    bounty_already_active: "Recompensa Já Ativa",
    bounty_user_has_bounty:
      "**{user}** já tem uma recompensa ativa!\n\n**Recompensa Atual:** {amount}",
    bounty_wait_cleared: "Espere até ser removida antes de colocar uma nova",
    bounty_insufficient_funds: "Fundos Insuficientes",
    bounty_not_enough_silver:
      "Você não tem Moedas de Prata suficientes!\n\n**Necessário:** {required}\n**Você tem:** {current}",
    bounty_earn_more: "Ganhe mais prata primeiro",
    bounty_transaction_failed: "Transação Falhou",
    bounty_could_not_deduct:
      "Não foi possível deduzir Moedas de Prata: {error}",
    bounty_try_again: "Por favor, tente novamente",
    bounty_placed: "Recompensa Colocada!",
    bounty_now_wanted: "**{user}** agora está PROCURADO!",
    bounty_hunters_can_capture:
      "Caçadores de recompensas agora podem capturar este fora-da-lei!",
    bounty_target: "Alvo",
    bounty_reward: "Recompensa",
    bounty_posted_by: "👤 Postado Por",
    bounty_reason: "**Razão:** {reason}",
    bounty_server_only: "Apenas no Servidor",
    bounty_command_server_only:
      "Este comando só pode ser usado em um servidor!",
    bounty_try_in_server: "Tente usar este comando em um servidor",
    bounty_not_in_server: "Fora-da-lei Não Está no Servidor",
    bounty_user_not_here:
      "**{user}** não está neste servidor!\n\nVocê só pode capturar fora-da-lei que estão atualmente no servidor.",
    bounty_must_be_present:
      "O fora-da-lei deve estar presente para ser capturado",
    bounty_capture_cooldown: "Tempo de Recarga da Captura",
    bounty_need_rest:
      "Você precisa descansar antes de tentar outra captura!\n\n**Tempo restante:** {minutes} minutos",
    bounty_hunting_exhausting: "Caçar recompensas é trabalho exaustivo",
    bounty_no_bounty_found: "Nenhuma Recompensa Encontrada",
    bounty_user_not_wanted:
      "**{user}** não tem uma recompensa ativa!\n\nEles não estão procurados agora.",
    bounty_see_active: "Use /bounties para ver recompensas ativas",
    bounty_outlaw_escaped: "💨 Fora-da-lei Escapou!",
    bounty_managed_escape:
      "**{user}** conseguiu escapar!\n\nO fora-da-lei escapou pelos seus dedos e fugiu para o deserto.",
    bounty_better_luck: "Mais sorte da próxima vez, parceiro!",
    bounty_lost_reward: "💰 Recompensa Perdida",
    bounty_success_rate: "📊 Taxa de Sucesso",
    bounty_capture_failed: "Captura Falhou",
    bounty_inventory_full:
      "Seu inventário está muito cheio para carregar a recompensa!\n\n**Erro:** {error}",
    bounty_free_space_try: "Libere espaço e tente novamente",
    bounty_outlaw_captured: "🎯 Fora-da-lei Capturado!",
    bounty_hunter_captured:
      "**{hunter}** capturou com sucesso **{outlaw}**!\n\nA recompensa foi coletada!",
    bounty_justice_prevails: "A justiça prevalece no Velho Oeste!",
    bounty_hunter: "👤 Caçador",
    bounty_outlaw: "🎯 Fora-da-lei",
    bounty_permission_denied: "Permissão Negada",
    bounty_admin_only: "Apenas administradores podem remover recompensas!",
    bounty_contact_admin: "Entre em contato com um administrador do servidor",
    bounty_user_no_bounty: "**{user}** não tem uma recompensa ativa.",
    bounty_nothing_to_clear: "Nada para remover",
    bounty_cleared: "🚫 Recompensa Removida",
    bounty_admin_cleared:
      "Recompensa em **{user}** foi removida por um administrador.",
    bounty_no_longer_wanted: "O fora-da-lei não está mais procurado",
    bounty_amount_cleared: "💰 Valor Removido",
    bounty_cleared_by: "⚙️ Removido Por",
    bounty_no_active: "Nenhuma Recompensa Ativa",
    bounty_west_peaceful:
      "O Velho Oeste está tranquilo hoje!\n\nNenhum fora-da-lei está procurado atualmente.",
    bounty_use_wanted: "Use /wanted para colocar uma recompensa",
    bounty_no_outlaws_server: "Nenhum Fora-da-lei no Servidor",
    bounty_all_fled:
      "Nenhum fora-da-lei procurado está atualmente neste servidor!\n\nTodos os fora-da-lei fugiram.",
    bounty_most_wanted: "**Foras-da-lei Mais Procurados:**",
    bounty_contributors: "Contribuidores",
    bounty_more_outlaws: "*...e mais {count} fora-da-lei*",
    bounty_active_bounties: "Recompensas Ativas",
    bounty_total_bounties: "Total de Recompensas",
    bounty_total_rewards: "Recompensas Totais",
    bounty_hunt_claim:
      "Cace fora-da-lei e reivindique recompensas com /capture!",
    bounty_general_mischief: "Travessura e caos geral",

    // Wanted Poster Canvas Translations
    wanted_poster_title: "PROCURADO",
    wanted_poster_reward: "RECOMPENSA",
    wanted_poster_dead_or_alive: "VIVO OU MORTO",
    wanted_poster_silver: "PRATA",

    // Give Command
    give_invalid_recipient: "Destinatário Inválido",
    give_cant_give_bots: "Você não pode dar itens para bots, parceiro!",
    give_choose_real_player: "Escolha um jogador de verdade",
    give_self_transfer: "Auto-Transferência Não Permitida",
    give_cant_give_self: "Você não pode dar itens para si mesmo!",
    give_mighty_strange: "Isso seria muito estranho",
    give_transfer_failed: "Transferência Falhou",
    give_check_inventory: "Verifique seu inventário e tente novamente",
    give_transfer_success: "Transferência Bem-Sucedida!",
    give_you_gave: "Você deu {amount} para **{user}**",
    give_from: "De",
    give_to: "Para",
    give_item: "Item",
    give_quantity: "Quantidade",
    give_generosity: "Generosidade é uma virtude de cowboy!",

    // Dice Command
    dice_specify_all: "❌ Por favor, especifique oponente, aposta e palpite!",
    dice_cant_challenge_bot:
      "❌ Você não pode desafiar um bot para um jogo de dados, parceiro!",
    dice_cant_challenge_self: "❌ Você não pode desafiar a si mesmo, parceiro!",
    dice_cooldown_wait:
      "⏰ Calma aí! Espere {seconds} segundos antes de desafiar novamente.",
    dice_opponent_cooldown:
      "⏰ {user} ainda está se recuperando do último duelo! Precisa de {seconds} segundos.",
    dice_already_active: "❌ Um de vocês já está em um jogo de dados ativo!",
    dice_not_enough_tokens:
      "❌ Você não tem fichas suficientes! Você tem {current} Fichas Saloon mas tentou apostar {bet} Fichas Saloon.",
    dice_opponent_not_enough:
      "❌ {user} não tem fichas suficientes para esta aposta! Eles têm apenas {current} Fichas Saloon.",
    dice_challenge_title: "🎲 DESAFIO DE DADOS!",
    dice_challenge_desc:
      "**{challenger}** desafiou **{opponent}** para um duelo de dados!\n\n🎫 **Aposta:** {bet} Fichas Saloon\n🎯 **Palpite de {challenger}:** {guess}\n\n{opponent}, escolha seu palpite (2-12) abaixo!",
    dice_time_limit: "⏰ Tempo Limite",
    dice_time_accept: "30 segundos para aceitar",
    dice_winner_takes_all: "🏆 Vencedor Leva Tudo",
    dice_total_tokens: "{total} Fichas Saloon no total",
    dice_choose_wisely: "Escolha com sabedoria, parceiro!",
    dice_challenged: "{user}, você foi desafiado para um duelo de dados!",
    dice_tie_title: "🎲 DUELO DE DADOS - EMPATE!",
    dice_tie_desc:
      "**É um empate!** Ambos os jogadores estavam igualmente próximos!\n\n🎲 Dados: {dice1} + {dice2} = **{total}**",
    dice_challenger_guess: "Palpite de {user}",
    dice_opponent_guess: "Palpite de {user}",
    dice_diff: "{guess} (diff: {diff})",
    dice_result: "Resultado",
    dice_bets_returned: "Apostas retornadas para ambos os jogadores",
    dice_perfectly_balanced:
      "Sem vencedores, sem perdedores - perfeitamente equilibrado!",
    dice_inventory_full_title: "🎲 DUELO DE DADOS - INVENTÁRIO CHEIO!",
    dice_winner_inventory_full:
      "**{winner}** venceu mas seu inventário está muito pesado!\n\n🎲 Dados: {dice1} + {dice2} = **{total}**\n\n🚫 {winner} não conseguiu carregar o prêmio! A aposta é retornada para {loser}.",
    dice_clean_inventory: "Limpe seu inventário antes de duelar!",
    dice_results_title: "🎲 RESULTADOS DO DUELO DE DADOS!",
    dice_showed: "🎲 Os dados mostraram: {dice1} + {dice2} = **{total}**",
    dice_winner_wins: "🏆 **{winner} ganha {total} Fichas Saloon!**",
    dice_winner_guess_label: "🎯 Palpite de {user}",
    dice_loser_guess_label: "❌ Palpite de {user}",
    dice_difference: "{guess} (diferença: {diff})",
    dice_tokens_label: "🎫 Fichas de {user}",
    dice_tokens_amount: "{amount} Fichas Saloon",
    dice_called_closest: "{user} chegou mais perto!",
    dice_challenge_expired: "⏰ Desafio Expirado",
    dice_no_response: "{user} não respondeu a tempo. O desafio foi cancelado.",
    dice_better_luck: "Mais sorte da próxima vez!",

    // Duel Command
    duel_title: "DUELO DE COWBOYS",
    duel_challenge_title: "DESAFIO DE DUELO",
    duel_challenge_desc:
      "**{challenger}** desafia **{opponent}** para um duelo de cowboys!\n\n{bet_info}⏰ Aceite dentro de 60 segundos!",
    duel_bet_info: "💰 **Aposta:** {amount} Moedas de Prata\n",
    duel_no_bet: "💰 **Aposta:** Sem aposta\n",
    duel_accept_btn: "Aceitar Duelo",
    duel_decline_btn: "Recusar",
    duel_declined: "**{user}** recusou o duelo!",
    duel_accepted: "Duelo aceito! Sacar suas armas!",
    duel_first_turn: "O primeiro turno vai para **{user}**!",
    duel_current_turn: "Turno Atual",
    duel_hp: "HP: **{hp}/{maxHp}**",
    duel_quick_draw: "Saque Rápido",
    duel_take_cover: "Buscar Cobertura",
    duel_headshot: "Tiro na Cabeça",
    duel_complete: "DUELO COMPLETO",
    duel_winner: "**{user}** vence o duelo!",
    duel_won_coins: "Ganhou **{amount}** Moedas de Prata!",
    duel_timeout: "Duelo encerrado - sem resposta de **{user}**!",
    duel_challenge_expired: "Desafio de duelo expirado!",
    duel_cant_self: "Você não pode duelar consigo mesmo, parceiro!",
    duel_cant_bot: "Você não pode duelar com um bot!",
    duel_active_already: "Você já tem um duelo ativo com este jogador!",
    duel_participants_only:
      "Apenas os participantes do duelo podem usar estes botões!",
    duel_xp_gained: "XP Ganho",
    duel_xp_amount: "{user}: +{amount} XP",
    duel_xp_levelup: "Level {oldLevel} → {newLevel}",
    duel_action_attack: "**{user}** dispara um tiro rápido!",
    duel_action_attack_cover:
      "**{user}** dispara um tiro rápido mas **{target}** está protegido!",
    duel_action_defend: "**{user}** se esconde atrás de um barril!",
    duel_action_special: "**{user}** mira para um tiro na cabeça!",
    duel_action_special_cover:
      "**{user}** mira para um tiro na cabeça mas **{target}** está protegido!",
    duel_dealt_damage: "Causou **{damage}** de dano!",
    duel_dealt_damage_reduced: "Causou **{damage}** de dano (reduzido)!",
    duel_vs: "VS",

    // Roulette Command
    roulette_specify_both:
      "❌ Por favor, especifique valor da aposta e tipo de aposta!",
    roulette_must_specify_number:
      "❌ Você deve especificar um número quando apostar em um número específico!",
    roulette_cooldown:
      "⏰ Calma aí, parceiro! Espere {time} segundos antes de girar novamente.",
    roulette_already_active: "❌ Você já tem um jogo de roleta ativo!",
    roulette_insufficient_tokens:
      "❌ Você não tem fichas suficientes! Você tem {current} {emoji} mas tentou apostar {bet} {emoji}.",
    roulette_title_spinning: "ROLETA DO SALOON - Girando a Roda!",
    roulette_your_bet: "SUA APOSTA",
    roulette_bet_amount: "Valor",
    roulette_bet_type: "Tipo",
    roulette_spinning: "A roda está girando...",
    roulette_determining: "Determinando seu destino...",
    roulette_good_luck: "Boa sorte, parceiro!",
    roulette_title_win: "ROLETA - VOCÊ GANHOU!",
    roulette_title_loss: "ROLETA - Você Perdeu!",
    roulette_result: "RESULTADO",
    roulette_ball_landed: "A bola caiu em:",
    roulette_bet_won: "Sua aposta em {bet} ganhou!",
    roulette_bet_lost: "Sua aposta em {bet} não ganhou.",
    roulette_winnings: "Ganhos",
    roulette_profit: "Lucro",
    roulette_loss: "Perda",
    roulette_new_balance: "Novo Saldo",
    roulette_congratulations: "Parabéns, parceiro!",
    roulette_better_luck: "Mais sorte da próxima vez, parceiro!",
    roulette_bet_red: "Vermelho",
    roulette_bet_black: "Preto",
    roulette_bet_number: "Número Específico",
    roulette_bet_even: "Par",
    roulette_bet_odd: "Ímpar",
    roulette_bet_low: "Baixo (1-18)",
    roulette_bet_high: "Alto (19-36)",
    roulette_ui_title: "ROLETA DO SALOON",
    roulette_ui_welcome: "BEM-VINDO À ROLETA",
    roulette_ui_balance: "Seu Saldo",
    roulette_ui_step1: "1️⃣ Escolha o tipo de aposta",
    roulette_ui_step1_desc: "Clique em um dos botões acima",
    roulette_ui_step2: "2️⃣ Selecione o valor",
    roulette_ui_step2_desc: "Use o menu abaixo",
    roulette_ui_step3: "3️⃣ Gire a roleta",
    roulette_ui_step3_desc: 'Clique no botão "GIRAR"',
    roulette_select_amount: "💰 Selecione o valor da aposta",
    roulette_ui_bet_selected: "Aposta Selecionada",
    roulette_ui_now_select_amount:
      "💰 Agora selecione o valor da aposta no menu abaixo",
    roulette_ui_ready: "PRONTO PARA GIRAR!",
    roulette_ui_click_to_spin: "🎯 Clique no botão abaixo para girar a roleta!",
    roulette_ui_spin: "🎰 GIRAR ROLETA",
    roulette_ui_not_selected: "Não selecionado",
    roulette_ui_select_bet_type: "Agora escolha o tipo de aposta acima",
    roulette_enter_number: "Digite um número (0-36):",
    roulette_invalid_number:
      "❌ Número inválido! Por favor, digite um número entre 0 e 36.",

    // Music Command
    music_need_voice_channel:
      "❌ Você precisa estar em um canal de voz para tocar música!",
    music_searching: "🔍 Procurando sua música...",
    music_not_found:
      "❌ Não encontrei essa música. Tente novamente com um termo diferente.",
    music_now_playing: "🎵 Tocando Agora",
    music_added_to_queue: "➕ Adicionado à Fila",
    music_nothing_playing: "❌ Nada está tocando no momento!",
    music_paused: "⏸️ Música pausada!",
    music_could_not_pause: "❌ Não foi possível pausar a música.",
    music_resumed: "▶️ Música retomada!",
    music_could_not_resume: "❌ Não foi possível retomar a música.",
    music_skipped: "⏭️ Música pulada!",
    music_could_not_skip: "❌ Não foi possível pular a música.",
    music_stopped: "⏹️ Música parada e fila limpa!",
    music_queue_empty: "❌ A fila está vazia!",
    music_queue_title: "🎵 Fila de Músicas",
    music_now_playing_label: "🎵 Tocando Agora",
    music_up_next: "📋 Próximas",
    music_and_more: "E mais {count} música(s)...",
    music_loop_song_enabled: "🔂 Loop ativado para música atual!",
    music_loop_disabled: "🔂 Loop desativado!",
    music_loop_queue_enabled: "🔁 Loop de fila ativado!",
    music_volume_set: "🔊 Volume ajustado para {volume}%!",
    music_status_playing: "Tocando",
    music_status_paused: "Pausado",
    music_loop_mode_song: "🔂 Loop: Música",
    music_loop_mode_queue: "🔁 Loop: Fila",
    music_loop_mode_normal: "➡️ Normal",
    music_requested_by: "👤 Solicitado Por",
    music_queue_count: "📋 Fila",
    music_duration: "⏱️ Duração",
    music_volume: "🔊 Volume",
    music_status: "▶️ Status",
    music_use_buttons: "Use os botões abaixo para controlar a reprodução",
    music_songs: "música(s)",
    music_position_in_queue: "📊 Posição na Fila",
    music_btn_pause_resume: "⏸️ Pausar/Retomar",
    music_btn_skip: "⏭️ Pular",
    music_btn_loop: "🔂 Loop",
    music_btn_queue: "📋 Fila",
    music_btn_stop: "⏹️ Parar",
    music_btn_volume_down: "🔉 -10%",
    music_btn_volume_up: "🔊 +10%",
    music_more_songs: "+{count} mais música(s)",

    // Poll Command
    poll_title_create: "Votação",
    poll_title_quick: "Votação Rápida",
    poll_created_by: "criou uma votação!",
    poll_question_label: "Pergunta",
    poll_duration_label: "Duração",
    poll_multiple_choice_label: "Múltipla escolha",
    poll_yes_option: "Sim",
    poll_no_option: "Não",
    poll_maybe_option: "Talvez",
    poll_vote_now: "Vote agora!",
    poll_wants_opinion: "quer saber sua opinião!",
    poll_system_footer: "Sistema de Votações",
    poll_quick_footer: "Votação Rápida",
    poll_hour: "hora",
    poll_hours: "horas",

    // Announcement System
    announce_title: "Sistema de Anúncios",
    announce_preview: "Prévia do Anúncio",
    announce_confirm: "Confirmar Envio",
    announce_cancel: "Cancelar",
    announce_success: "Anúncio Enviado!",
    announce_sent_to: "Anúncio enviado para",
    announce_author: "Autor",
    announce_channel: "Canal",
    announce_template_saved: "Template Salvo!",
    announce_template_deleted: "Template Deletado!",
    announce_no_templates: "Nenhum template salvo",
    announce_select_color: "Selecione uma cor",

    // Welcome System
    welcome_title: "Sistema de Boas-Vindas",
    welcome_configured: "Boas-Vindas Configuradas!",
    welcome_channel_set: "Canal de boas-vindas configurado",
    welcome_message_set: "Mensagem personalizada definida",
    welcome_current_config: "Configuração Atual",
    welcome_status: "Status",
    welcome_enabled: "Ativado",
    welcome_disabled: "Desativado",
    welcome_test_message: "Mensagem de Teste",
    welcome_placeholders: "Placeholders Disponíveis",
    welcome_placeholder_user: "{user} - Menção do usuário",
    welcome_placeholder_username: "{username} - Nome do usuário",
    welcome_placeholder_server: "{server} - Nome do servidor",
    welcome_removed: "Sistema de boas-vindas removido",
    welcome_not_configured: "Sistema de boas-vindas não está configurado",
    welcome_panel_title: "🤠 Painel de Boas-Vindas",
    welcome_panel_description:
      "Configure mensagens de boas-vindas personalizadas para novos membros do servidor.",
    welcome_panel_footer: "Use os botões abaixo para gerenciar o sistema",
    welcome_status_field: "Status",
    welcome_channel_field: "Canal",
    welcome_not_set: "Não configurado",
    welcome_btn_configure: "Configurar",
    welcome_btn_view: "Visualizar",
    welcome_btn_enable: "Ativar",
    welcome_btn_disable: "Desativar",
    welcome_btn_test: "Testar",
    welcome_btn_import: "Importar",
    welcome_btn_export: "Exportar",
    welcome_modal_title: "Configurar Boas-Vindas",
    welcome_modal_channel_label: "ID do Canal (Cole aqui)",
    welcome_modal_channel_placeholder: "Ex: 1234567890123456789",
    welcome_modal_message_label: "Mensagem (Texto ou JSON)",
    welcome_modal_message_placeholder:
      "Digite texto simples ou JSON com embed completo...",
    welcome_modal_image_label: "URL da Imagem (Opcional)",
    welcome_modal_image_placeholder: "https://exemplo.com/imagem.png",
    welcome_config_saved: "Configuração Salva!",
    welcome_config_saved_desc:
      "Sistema de boas-vindas configurado com sucesso.",
    welcome_message_field: "Mensagem",
    welcome_image_field: "Imagem",
    welcome_view_image: "Ver Imagem",
    welcome_error_not_your_panel: "Este painel não é seu!",
    welcome_error_generic: "Erro ao processar ação. Tente novamente.",
    welcome_error_invalid_channel:
      "Canal inválido! Forneça um ID de canal de texto válido.",
    welcome_error_invalid_json: "JSON inválido! Verifique a sintaxe.",
    welcome_error_invalid_url:
      "URL inválida! Use um link começando com http:// ou https://",
    welcome_error_channel_not_found:
      "Canal não encontrado! Reconfigure o sistema.",
    welcome_status_enabled: "Ativado",
    welcome_status_disabled: "Desativado",
    welcome_enabled_title: "Sistema Ativado!",
    welcome_enabled_desc:
      "Mensagens de boas-vindas serão enviadas para novos membros.",
    welcome_disabled_title: "Sistema Desativado",
    welcome_disabled_desc: "Mensagens de boas-vindas não serão mais enviadas.",
    welcome_test_error_disabled:
      "Sistema desativado! Ative primeiro para testar.",
    welcome_test_sent: "Mensagem de Teste Enviada!",
    welcome_test_sent_desc: "Confira a mensagem em",
    welcome_test_error:
      "Erro ao enviar mensagem de teste. Verifique as permissões do bot.",
    welcome_import_title: "Importar Configuração",
    welcome_import_label: "Cole o JSON da configuração",
    welcome_import_placeholder: '{"channelId": "...", "message": "...", ...}',
    welcome_import_error_missing:
      "JSON incompleto! Campos obrigatórios: channelId, message",
    welcome_import_success: "Configuração Importada!",
    welcome_import_success_desc:
      "Sistema atualizado com a configuração importada.",
    welcome_export_title: "Configuração Exportada",
    welcome_export_desc:
      "Baixe o arquivo JSON para backup ou compartilhamento.",
    welcome_placeholders_field: "Placeholders",
    welcome_placeholders_list:
      "`{@user}` - Menção\n`{username}` - Nome\n`{server}` - Servidor\n`{guild.size}` - Total de membros\n`{user.avatar}` - Avatar\n`{guild.icon}` - Ícone do servidor",
    welcome_view_footer: "Configuração atual do sistema",

    // Logs System
    logs_title: "Sistema de Logs",
    logs_configured: "Logs Configurados!",
    logs_channel_set: "Canal de logs configurado com sucesso",
    logs_current_config: "Configuração Atual de Logs",
    logs_status: "Status",
    logs_enabled: "Ativado",
    logs_disabled: "Desativado",
    logs_events_tracked: "Eventos Monitorados",
    logs_member_join: "Entrada de membros",
    logs_member_leave: "Saída de membros",
    logs_message_delete: "Mensagens deletadas",
    logs_message_edit: "Mensagens editadas",
    logs_removed: "Sistema de logs removido",
    logs_removed_description:
      "Os logs não serão mais enviados para nenhum canal.",
    logs_not_configured: "Sistema de logs não está configurado",

    expedition_title: "Expedição ao Deserto",
    expedition_desc:
      "Embarque em uma expedição perigosa pelo deserto em busca de recursos valiosos!",
    expedition_duration: "Duração",
    expedition_rewards: "Possíveis Recompensas",
    expedition_start_btn: "Iniciar Expedição",
    expedition_in_progress_title: "Expedição em Andamento",
    expedition_in_progress_desc: "Você está em uma expedição pelo deserto!",
    expedition_time_left: "Tempo Restante",
    expedition_complete_title: "Expedição Completa!",
    expedition_complete_desc:
      "Você voltou da expedição e encontrou recursos valiosos!",
    expedition_rewards_found: "Recursos Encontrados",
    expedition_cooldown_title: "Período de Descanso",
    expedition_cooldown_desc:
      "Você já fez uma expedição recentemente! Descanse um pouco antes de partir novamente.",
    expedition_cooldown_time: "Próxima Expedição",
    expedition_solo_btn: "Expedição Solo",
    expedition_party_btn: "Convidar Amigos",
    expedition_choose_type: "Escolha o tipo de expedição:",
    expedition_type_solo: "🤠 **Solo:** Ir sozinho (qualquer duração)",
    expedition_type_party:
      "👥 **Grupo:** Convidar 1-2 amigos (recompensas divididas)",
    expedition_duration_options: "Opções de Duração",
    expedition_duration_3h: "**3 horas** - Recompensas padrão (1-3 jogadores)",
    expedition_duration_10h:
      "**10 horas** - Recompensas premium (2-3 jogadores apenas)",
    expedition_cooldown_label: "Intervalo",
    expedition_seal_requirements: "🎟️ Requisitos de Selos",
    expedition_seal_3h: "**12 Selos** para expedição de 3h",
    expedition_seal_10h_solo: "**30 Selos** para expedição solo de 10h",
    expedition_seal_10h_party:
      "**10 Selos por pessoa** para expedição em grupo de 10h",
    expedition_insufficient_seals:
      "{cross} Selos insuficientes! Você tem **{current}** mas precisa de **{required}** para esta expedição.",
    expedition_rewards_3h: "Recompensas (expedição 3h)",
    expedition_rewards_10h: "Recompensas (expedição 10h)",
    expedition_choose_wisely:
      "🏜️ Escolha com sabedoria! Recompensas são divididas entre os membros do grupo.",
    expedition_btn_3h: "3 Horas",
    expedition_btn_10h: "10 Horas",
    expedition_btn_back: "Voltar",
    expedition_btn_3h_1to3: "3 Horas (1-3 jogadores)",
    expedition_btn_10h_2to3: "10 Horas (2-3 jogadores)",
    expedition_solo_choose_duration:
      "{cowboy} Expedição Solo - Escolha a Duração",
    expedition_solo_select:
      "Selecione quanto tempo quer gastar nesta expedição:",
    expedition_3h_label: "{clock} 3 Horas",
    expedition_3h_desc: "Recompensas padrão - Completa mais rápido",
    expedition_10h_label: "{clock} 10 Horas",
    expedition_10h_desc: "Recompensas premium - Demora mais mas vale a pena!",
    expedition_party_choose_duration:
      "{cowboys} Expedição em Grupo - Escolha a Duração",
    expedition_party_select:
      "Selecione a duração da expedição. Você pode convidar amigos depois:",
    expedition_3h_party_label: "{clock} 3 Horas",
    expedition_3h_party_desc:
      "**1-3 jogadores permitidos**\nRecompensas padrão divididas",
    expedition_10h_party_label: "{clock} 10 Horas",
    expedition_10h_party_desc:
      "**2-3 jogadores obrigatórios**\nRecompensas premium divididas",
    expedition_party_title: "{cowboys} Grupo de Expedição - {duration}",
    expedition_party_forming:
      "<@{leader}> está formando um grupo de expedição!",
    expedition_party_members: "Membros Atuais ({current}/3):",
    expedition_party_required: "Requerido",
    expedition_party_required_players: "{min}-3 jogadores",
    expedition_party_rewards_divided: "Recompensas",
    expedition_party_rewards_equally:
      "Divididas igualmente entre todos os membros",
    expedition_party_footer:
      '🏜️ Clique em "Entrar no Grupo" para participar ou "Iniciar Expedição" quando estiver pronto!',
    expedition_btn_join: "Entrar no Grupo ({current}/3)",
    expedition_btn_start_party: "Iniciar Expedição",
    expedition_already_joined: "{cross} Você já entrou nesta expedição!",
    expedition_party_full:
      "{cross} Este grupo de expedição está cheio! (máx 3 membros)",
    expedition_already_active: "{cross} Você já tem uma expedição ativa!",
    expedition_on_cooldown:
      "{cross} Você ainda está descansando! Intervalo: {timeLeft}",
    expedition_joined_party:
      "{check} Você entrou no grupo de expedição de <@{leader}>! ({current}/3)",
    expedition_need_min_players:
      "{cross} Expedições de 10 horas requerem pelo menos 2 jogadores!",
    expedition_started_title: "🗺️ Expedição Iniciada!",
    expedition_started_desc:
      "{check} Seu grupo partiu para uma expedição de {duration} pelo deserto!",
    expedition_party_members_label: "{cowboys} Membros do Grupo",
    expedition_estimated_return: "{timer} Retorno Estimado",
    expedition_started_footer:
      "🏜️ Todos os membros receberão uma DM quando a expedição estiver completa!",
    expedition_dm_complete_title: "{check} Expedição Completa!",
    expedition_dm_complete_desc: "Sua expedição de {duration} está completa!",
    expedition_dm_rewards_divided:
      "\n\n{moneybag} **Recompensas divididas entre {count} membros**\n**Sua parte foi automaticamente adicionada:**",
    expedition_dm_rewards_solo:
      "\n\n**Suas recompensas foram automaticamente adicionadas:**",
    expedition_dm_total_section:
      "\n\n{stats} **Total Coletado pelo Grupo:**\n{silver} {silverAmount} Prata\n{gold} {goldAmount}x Ouro\n{wheat} {wheatAmount}x Trigo\n{honey} {honeyAmount}x Mel\n{star} {xpAmount} XP",
    expedition_dm_footer:
      "🏜️ Recompensas automaticamente adicionadas à sua conta!",
    expedition_already_complete:
      "Sua expedição está completa! Suas recompensas foram automaticamente adicionadas à sua conta quando a expedição terminou.\n\nVocê deve ter recebido uma DM com os detalhes. Confira seu inventário para ver as recompensas!",
    expedition_start_new: "🏜️ Inicie uma nova expedição quando estiver pronto!",
    expedition_in_progress_footer: "🏜️ Boa sorte na sua jornada!",
    expedition_cooldown_footer:
      "🏜️ Descanse e prepare-se para a próxima aventura!",
    expedition_solo_duration_footer: "🏜️ Escolha sua duração",
    expedition_party_duration_footer:
      "🏜️ As recompensas serão divididas entre todos os membros do grupo",
    expedition_duration_3h_text: "3 horas",
    expedition_duration_10h_text: "10 horas",
    expedition_cooldown_value: "**6 horas**",
    expedition_rewards_3h_value:
      "{silver} **4.500 - 8.800** Moedas de Prata\n{gold} **9x** Barras de Ouro\n🌾 **2.000 - 6.000** Trigo\n🍯 **10x** Mel\n{star} **+1.000 XP**",
    expedition_rewards_10h_value:
      "{silver} **35.000 - 55.000** Moedas de Prata\n{gold} **16x** Barras de Ouro\n🌾 **8.000 - 15.000** Trigo\n🍯 **35x** Mel\n{star} **+3.500 XP**",

    // Embed Builder
    eb_title: "Construtor de Embed",
    eb_target_channel: "Canal Destino",
    eb_preview: "Prévia",
    eb_invalid_channel: "O canal deve ser um canal de texto!",
    eb_btn_basic: "Básico",
    eb_btn_author: "Autor",
    eb_btn_images: "Imagens",
    eb_btn_footer: "Rodapé",
    eb_btn_fields: "Campo",
    eb_btn_color: "Cor",
    eb_btn_clear: "Limpar",
    eb_btn_timestamp: "Timestamp",
    eb_btn_remove_timestamp: "Remover",
    eb_btn_send: "Enviar",
    eb_btn_cancel: "Cancelar",
    eb_preview_title: "Prévia - Sem título",
    eb_only_author: "Apenas o criador pode usar estes botões!",
    eb_modal_basic_title: "Informações Básicas",
    eb_modal_basic_title_label: "Título (vazio p/ limpar)",
    eb_modal_basic_title_placeholder: "Digite o título...",
    eb_modal_basic_desc_label: "Descrição (vazio p/ limpar)",
    eb_modal_basic_desc_placeholder:
      "Digite a descrição... (use \\n para quebras)",
    eb_modal_basic_url_label: "URL do Título (vazio p/ limpar)",
    eb_modal_basic_url_placeholder: "https://exemplo.com",
    eb_modal_author_title: "Informações do Autor",
    eb_modal_author_name_label: "Nome do Autor (vazio p/ limpar)",
    eb_modal_author_name_placeholder: "Digite o nome...",
    eb_modal_author_icon_label: "URL do Ícone (vazio p/ limpar)",
    eb_modal_author_icon_placeholder: "https://exemplo.com/icone.png",
    eb_modal_author_url_label: "URL do Autor (vazio p/ limpar)",
    eb_modal_author_url_placeholder: "https://exemplo.com",
    eb_modal_images_title: "Imagens",
    eb_modal_images_thumbnail_label: "Miniatura (vazio p/ limpar)",
    eb_modal_images_thumbnail_placeholder: "https://exemplo.com/miniatura.png",
    eb_modal_images_image_label: "Imagem Banner (vazio p/ limpar)",
    eb_modal_images_image_placeholder: "https://exemplo.com/banner.png",
    eb_modal_footer_title: "Rodapé",
    eb_modal_footer_text_label: "Texto Rodapé (vazio p/ limpar)",
    eb_modal_footer_text_placeholder: "Digite o texto...",
    eb_modal_footer_icon_label: "Ícone Rodapé (vazio p/ limpar)",
    eb_modal_footer_icon_placeholder: "https://exemplo.com/icone.png",
    eb_modal_field_title: "Adicionar Campo",
    eb_modal_field_name_label: "Nome do Campo",
    eb_modal_field_name_placeholder: "Digite o nome...",
    eb_modal_field_value_label: "Valor do Campo",
    eb_modal_field_value_placeholder: "Digite o valor...",
    eb_modal_field_inline_label: "Em Linha? (sim/não)",
    eb_modal_field_inline_placeholder: "sim ou não (padrão: sim)",
    eb_field_max_reached: "Máximo de 25 campos atingido!",
    eb_color_select_title: "Selecione uma cor:",
    eb_color_set: "Cor definida: **{name}**",
    eb_empty_embed: "O embed deve ter título, descrição ou campos!",
    eb_sent_success: "Embed enviado para {channel}!",
    eb_send_error: "Erro ao enviar: {error}",
    eb_cancelled: "Construtor cancelado.",
    eb_btn_import: "Importar",
    eb_btn_export: "Exportar",
    eb_modal_import_title: "Importar JSON",
    eb_modal_import_label: "Cole o JSON do embed aqui",
    eb_modal_import_placeholder: '{"title": "Meu Embed", "description": "..."}',
    eb_import_success: "JSON importado com sucesso!",
    eb_import_error: "Erro ao importar JSON: {error}",
    eb_export_title: "Exportar JSON",
    eb_export_description: "Copie o JSON abaixo para salvar seu embed:",
    eb_export_description_file:
      "O JSON está muito grande! Baixe o arquivo anexado:",

    // Guild System
    guild_welcome_title: "🏰 Sistema de Guildas",
    guild_welcome_desc:
      "**Bem-vindo ao Sistema de Guildas do Sheriff Rex!**\n\n" +
      "🤝 **O que são Guildas?**\n" +
      "Guildas são grupos de cowboys que se unem para conquistar o Velho Oeste juntos!\n\n" +
      "✨ **Benefícios:**\n" +
      "• Jogue e trabalhe em equipe\n" +
      "• Ganhe XP e suba de nível como guilda\n" +
      "• Conquiste territórios juntos\n" +
      "• Chat exclusivo da guilda\n" +
      "• Rankings e recompensas especiais\n\n" +
      "💰 **Custo para criar:**\n" +
      "• 1000 🎫 Saloon Tokens\n\n" +
      "🎯 **Como começar?**\n" +
      "Escolha uma das opções abaixo:",
    guild_footer: "🤠 Sheriff Rex • Sistema de Guildas",
    guild_btn_create: "Criar Guilda",
    guild_btn_join: "Entrar em Guilda",
    guild_btn_info: "Informações",
    guild_btn_members: "Membros",
    guild_btn_leave: "Sair",
    guild_leader: "👑 Líder",
    guild_members: "👥 Membros",
    guild_level: "⭐ Nível",
    guild_xp: "📊 XP da Guilda",
    guild_type: "🔓 Tipo",
    guild_type_public: "Pública",
    guild_type_private: "Privada",
    guild_created: "📅 Criada em",
    guild_role_leader: "Sua função: 👑 Líder",
    guild_role_member: "Sua função: 👤 Membro",
    guild_not_your_interaction: "❌ Esta interação não é sua!",
    guild_no_guilds: "❌ Não há guildas disponíveis no momento!",
    guild_select_placeholder: "Escolha uma guilda",
    guild_select_guild: "🏰 Escolha uma guilda para entrar:",
    guild_not_found: "❌ Guilda não encontrada!",
    guild_timeout: "⏱️ Tempo esgotado! Tente novamente.",
    guild_request_title: "📬 Novo Pedido para Entrar na Guilda",
    guild_request_desc: "**{user}** quer entrar na sua guilda **{guild}**!",
    guild_request_user: "👤 Usuário",
    guild_request_guild: "🏰 Guilda",
    guild_request_approve: "Aceitar",
    guild_request_reject: "Recusar",
    guild_request_dm_error:
      "⚠️ Não foi possível enviar DM ao líder. O pedido foi criado!",
    guild_request_not_found: "❌ Pedido não encontrado!",
    guild_request_approved_title: "✅ Pedido Aprovado",
    guild_request_error: "❌ Erro ao Processar Pedido",
    guild_request_accepted_title: "🎉 Você foi aceito na guilda!",
    guild_request_accepted_desc:
      "Parabéns! Você agora faz parte da guilda **{guild}**!",
    guild_request_rejected_title: "📝 Pedido Recusado",
    guild_request_denied_title: "❌ Pedido Negado",
    guild_request_denied_desc:
      "Seu pedido para entrar na guilda **{guild}** foi recusado pelo líder.",
    guild_create_title: "Criar Nova Guilda",
    guild_create_name: "Nome da Guilda",
    guild_create_description: "Descrição da Guilda",
    guild_create_privacy: "Tipo (pública ou privada)",
    guild_invalid_privacy:
      '❌ **Tipo inválido!**\n\nDigite apenas "**pública**" ou "**privada**" no campo de tipo da guilda.',
    guild_created_title: "✅ Guilda Criada!",
    guild_name: "Nome",
    guild_description: "Descrição",
    guild_members_title: "👥 Membros da {guild}",
    guild_joined: "Entrou",
    guild_no_members: "Nenhum membro encontrado.",
    guild_stats: "📊 Estatísticas",
    guild_total: "Total",
    guild_left_title: "✅ Você saiu da guilda!",
    guild_error: "❌ Erro",

    // Server Setup Command (criaservidor)
    server_setup_title: "🏛️ Configurador de Servidor Profissional",
    server_setup_analyzing: "🤠 Sheriff Rex está analisando...",
    server_setup_analyzing_desc:
      "Analisando sua solicitação e planejando a estrutura do servidor...",
    server_setup_planning: "📋 Plano de Estrutura do Servidor",
    server_setup_creating: "*Criando agora...*",
    server_setup_cleanup_title: "🧹 Limpeza do Servidor",
    server_setup_cleanup_desc:
      "Deseja limpar canais/cargos/categorias existentes antes de criar a nova estrutura?",
    server_setup_cleanup_warning:
      "⚠️ **ATENÇÃO:** Isso irá **DELETAR PERMANENTEMENTE**:\n• Todos os canais (exceto este)\n• Todas as categorias\n• Todos os cargos (exceto @everyone e cargos do bot)\n\n**Esta ação é irreversível!**",
    server_setup_cleanup_confirm: "✅ Sim, Limpar Tudo",
    server_setup_cleanup_skip: "⏭️ Não, Manter Existentes",
    server_setup_cleaning: "🧹 Limpando Servidor...",
    server_setup_cleaning_desc:
      "Removendo canais, categorias e cargos existentes...",
    server_setup_cleaned: "✅ Servidor Limpo!",
    server_setup_cleaned_desc:
      "Removidos:\n• **{channels}** canais\n• **{categories}** categorias\n• **{roles}** cargos",
    server_setup_roles_label: "🎭 Cargos a criar",
    server_setup_categories_label: "📁 Categorias",
    server_setup_channels_label: "💬 Total de canais",
    server_setup_emojis_label: "😀 Emojis personalizados",
    server_setup_success_title: "✅ Servidor Configurado com Sucesso!",
    server_setup_success_desc:
      "Sheriff Rex configurou seu servidor, parceiro! 🤠",
    server_setup_roles_created: "🎭 Cargos Criados",
    server_setup_categories_created: "📁 Categorias Criadas",
    server_setup_channels_created: "💬 Canais Criados",
    server_setup_emojis_created: "😀 Emojis Adicionados",
    server_setup_errors: "⚠️ Avisos",
    server_setup_requested_by: "Solicitado por {user}",
    server_setup_error_title: "❌ Erro ao Criar Estrutura",
    server_setup_error_footer:
      "Tente reformular sua solicitação ou contate um admin",
    server_setup_no_description: "Nenhum",
    server_setup_and_more: "... e {count} mais",
    server_setup_none: "Nenhum",
    server_setup_timeout: "⏰ Tempo Esgotado",
    server_setup_timeout_desc:
      "Você não respondeu a tempo. Configuração cancelada.",
    server_setup_try_again: "Use /criaservidor novamente para tentar",
    server_setup_cancelled: "❌ Configuração Cancelada",
    server_setup_cancelled_desc:
      "A configuração do servidor foi cancelada pelo usuário.",
    server_setup_ai_error:
      "IA retornou JSON inválido. Tente reformular sua solicitação.",
    server_setup_invalid_structure:
      "Estrutura inválida da IA. Faltando cargos ou categorias.",

    warehouse_title: "Armazém do Estado",
    warehouse_desc:
      "Mercado compartilhado onde todos podem vender e comprar recursos!",
    warehouse_stats_hourly: "Estatísticas da Última Hora:",
    warehouse_stock_prices: "Estoque e Preços",
    warehouse_movement: "Movimentação (1h)",
    warehouse_total_value: "Valor Total em Estoque",
    warehouse_stock: "Estoque",
    warehouse_units: "unidades",
    warehouse_you_sell: "Você vende por",
    warehouse_you_buy: "Você compra por",
    warehouse_each: "cada",
    warehouse_sold: "vendidos",
    warehouse_bought: "comprados",
    warehouse_no_resources: "Nenhum recurso disponível",
    warehouse_no_movement: "Sem movimentação",
    warehouse_last_update: "Última atualização",
    warehouse_next_update: "Próxima em 1 hora",
    warehouse_btn_sell: "Vender",
    warehouse_btn_buy: "Comprar",
    warehouse_btn_refresh: "Atualizar",
    warehouse_btn_back: "Voltar",
    warehouse_sell_menu: "Selecione o recurso que deseja vender:",
    warehouse_buy_menu: "Selecione o recurso que deseja comprar:",
    warehouse_available: "disponíveis",
    warehouse_in_stock: "em estoque",
    warehouse_sell_for: "Venda por",
    warehouse_buy_for: "Compre por",
    warehouse_select_placeholder_sell: "Escolha o recurso para vender",
    warehouse_select_placeholder_buy: "Escolha o recurso para comprar",
    warehouse_no_items: "Você não tem {resource} para vender!",
    warehouse_out_of_stock:
      "Não há {resource} em estoque! Aguarde outros jogadores venderem.",
    warehouse_sell_title: "Vender {resource}",
    warehouse_buy_title: "Comprar {resource}",
    warehouse_you_have: "Você tem",
    warehouse_available_stock: "Estoque disponível",
    warehouse_price: "Preço",
    warehouse_enter_amount:
      'Digite a quantidade que deseja {action} (ou "cancelar" para voltar):',
    warehouse_action_sell: "vender",
    warehouse_action_buy: "comprar",
    warehouse_invalid_amount: "Quantidade inválida! Digite um número válido.",
    warehouse_insufficient_items:
      "Você não tem {amount} unidades de {resource}!",
    warehouse_insufficient_stock:
      "Não há {amount} unidades disponíveis! Estoque atual: {stock} unidades.",
    warehouse_insufficient_silver:
      "Você não tem Silver Coins suficientes!\nNecessário: **{needed}**\nVocê tem: **{current}**",
    warehouse_error_processing:
      "Erro ao processar {action}. Estoque insuficiente.",
    warehouse_sale_complete: "Venda Realizada - Armazém do Estado",
    warehouse_sale_success: "Você vendeu **{amount}x** {resource}!",
    warehouse_unit_price: "Preço unitário",
    warehouse_total_received: "Total recebido: {amount} Silver Coins",
    warehouse_sale_confirmed: "Venda confirmada!",
    warehouse_sold_items: "{amount}x {resource} vendidos",
    warehouse_received_dm: "Você recebeu **{amount} Silver Coins** na DM!",
    warehouse_purchase_confirmed: "Compra confirmada!",
    warehouse_bought_items: "{amount}x {resource} comprados",
    warehouse_total_paid: "Total pago: **{amount} Silver Coins**",
    warehouse_added_inventory:
      "Os recursos foram adicionados ao seu inventário!",
    warehouse_timeout: "Tempo esgotado! Use `/armazem` novamente.",
    warehouse_cancelled: "cancelada.",

    ai_cooldown:
      "Whoa there, partner! Give me {time} seconds to catch my breath before ya ask another question!",
    ai_not_configured:
      "**OpenRouter API não está configurado**\n\nO administrador do bot precisa configurar a variável de ambiente `OPENROUTER_API_KEY`.\n\nObtenha sua chave API em: https://openrouter.ai/keys",
    ai_response: "Resposta da IA:",
    ai_sheriff_title: "Sheriff Rex",
    ai_model_footer: "Modelo: {model} | Perguntado por {user}",
    ai_error: "Erro:",
    ai_powered_by: "Powered by OpenRouter",

    models_description: "Listar modelos de IA disponíveis do OpenRouter",
    models_free_option: "Mostrar apenas modelos gratuitos",
    models_not_configured:
      "**OpenRouter API não está configurado**\n\nO administrador do bot precisa configurar a variável de ambiente `OPENROUTER_API_KEY`.\n\nObtenha sua chave API em: https://openrouter.ai/keys",
    models_no_models:
      "Nenhum modelo encontrado que corresponda aos seus critérios.",
    models_title: "Modelos de IA Disponíveis",
    models_title_free: "Modelos de IA Disponíveis (Apenas Gratuitos)",
    models_showing: "Mostrando {shown} de {total} modelos",
    models_use_with_ai: "Use esses IDs de modelo com o comando `/ai`.",
    models_free: "GRÁTIS",
    models_price: "${price}/1M tokens de entrada",
    models_context: "Contexto: {tokens} tokens",
    models_more_title: "Mais Modelos",
    models_more_desc:
      "Há {count} modelos adicionais disponíveis. Visite https://openrouter.ai/models para ver todos os modelos.",
    models_error: "Erro:",
    models_unknown_error: "Erro desconhecido ocorreu",

    // Admin Commands - Moderation (PT-BR)
    warn_title: "Aviso Aplicado",
    warn_desc: "Membro recebeu um aviso do moderador",
    warn_member: "Membro",
    warn_reason: "Motivo",
    warn_moderator: "Moderador",
    warn_total_warns: "Total de Avisos",
    warn_id: "ID do Aviso",
    warn_footer: "Avisos são permanentes até serem removidos",

    warnings_title: "Avisos de {user}",
    warnings_desc: "Histórico completo de avisos",
    warnings_no_warns: "Este membro não tem avisos!",
    warnings_warn_entry:
      "**Aviso #{id}**\n**Motivo:** {reason}\n**Moderador:** {moderator}\n**Data:** {date}",
    warnings_footer: "Total: {count} aviso(s)",

    clear_success: "Mensagens Deletadas",
    clear_desc: "Deletadas com sucesso",
    clear_amount: "Quantidade",
    clear_channel: "Canal",
    clear_user_filter: "Usuário Filtrado",
    clear_messages: "{count} mensagens",
    clear_all_users: "Todos os usuários",

    clearwarns_success: "Avisos Removidos",
    clearwarns_all_desc: "Todos os avisos de {user} foram removidos",
    clearwarns_one_desc: "Aviso #{id} foi removido de {user}",
    clearwarns_cleared_by: "Removido por",
    clearwarns_total_removed: "Total Removido",
    clearwarns_no_warns: "{user} não tem avisos para remover!",
    clearwarns_warn_not_found: "Aviso #{id} não encontrado para {user}!",

    mute_success: "Membro Silenciado",
    mute_desc: "{user} foi silenciado temporariamente",
    mute_duration_label: "Duração",
    mute_reason_label: "Motivo",
    mute_moderator_label: "Moderador",
    mute_expires: "Expira em",
    mute_footer:
      "O membro será automaticamente dessilenciado quando o tempo expirar",

    unmute_success: "Membro Dessilenciado",
    unmute_desc: "{user} foi dessilenciado com sucesso",
    unmute_moderator: "Moderador",
    unmute_not_muted: "{user} não está silenciado!",

    addreward_success: "Recompensa Adicionada",
    addreward_desc: "Recompensa de nível configurada com sucesso",
    addreward_level: "Nível",
    addreward_role: "Role Recompensa",
    addreward_footer:
      "Membros receberão este role ao atingir o nível especificado",
    addreward_already_exists: "Já existe uma recompensa para o nível {level}!",
  },
  "en-US": {
    cooldown:
      "Whoa there, cowpoke! Even the fastest guns need a break. Come back in {time}! 🐴",
    error: "Well butter my biscuit! My horse done kicked the bucket... 🤠",
    inventory_full:
      "Hold up, partner! You carrying the whole ranch on your back! Lighten that load! 🎒",

    // Ping Command
    ping_pong: "🏓 Pong!",
    ping_latency: "Bot Latency",
    ping_api_latency: "API Latency",
    ping_uptime: "Uptime",
    ping_status: "Status",
    ping_calculating: "🏓 Calculating latency...",
    ping_excellent: "✅ Excellent",
    ping_good: "🟢 Good",
    ping_medium: "🟡 Medium",
    ping_slow: "🟠 Slow",
    ping_critical: "🔴 Critical",

    // Daily Command
    daily_title: "Daily Reward",
    daily_already_claimed:
      "You already claimed your daily reward!\n\n**Time remaining:** {time}\n**Current streak:** {streak} day{plural}",
    daily_come_back: "Come back tomorrow!",
    daily_failed_title: "Daily Reward Failed",
    daily_inventory_too_full:
      "{error}\n\nYour inventory is too full to claim this reward!",
    daily_free_space: "Free up space and try again!",
    daily_streak_broken: "Your streak was broken! Starting fresh.",
    daily_claimed_success: "Daily reward claimed successfully!",
    daily_comeback_24h: "Come back in 24 hours!",
    daily_field_silver: "Silver Coins",
    daily_field_tokens: "Saloon Tokens",
    daily_field_xp: "XP Earned",
    daily_field_streak: "Streak",
    daily_field_bonus: "Bonus",
    daily_day: "day",
    daily_days: "days",

    // Automatic Daily Rewards
    auto_daily_reward_title: "🌟 Daily Rewards Delivered!",
    auto_daily_reward_desc:
      "*The sheriff passed through town and left a gift for you!*\n\n" +
      "╭─────────────────╮\n" +
      "│ {token} **{tokenAmount}** Saloon Tokens\n" +
      "│ {gold} **{goldAmount}** Gold Bars\n" +
      "│ 🎟️ **{sealAmount}** Seals\n" +
      "╰─────────────────╯\n\n" +
      "*Your rewards have been added to your inventory.*",
    auto_daily_reward_footer:
      "Next rewards tomorrow at {hour}:00 • Sheriff Rex",
    auto_daily_inventory_full_title: "⚠️ Inventory Full!",
    auto_daily_inventory_full_desc:
      "*The sheriff tried to deliver your rewards, but your backpack is full!*\n\n" +
      "**📦 Space needed:** ~{needed}kg\n" +
      "**📦 Space available:** {available}kg\n\n" +
      "*Sell or organize items to free up space and receive your rewards.*",
    auto_daily_inventory_full_footer: "Use /inventory to see your items • Sheriff Rex",

    // Inventory Command
    inventory_private_title: "Private Inventory",
    inventory_private_desc:
      "For privacy reasons, you can only view your own inventory.",
    inventory_private_footer: "Use /inventory without parameters to see yours",
    inventory_title: "{username}'s Backpack",
    inventory_subtitle: "Manage your items, currency, and inventory space.",
    inventory_currency: "Currency",
    inventory_stats: "Inventory Stats",
    inventory_stats_items:
      "**Items:** {items}\n**Types:** {types}/50\n**Weight:** {weight}kg / {maxWeight}kg",
    inventory_items: "Items in Backpack",
    inventory_empty:
      "*Your backpack is empty. Start working or mining to collect items!*",
    inventory_capacity: "Weight Capacity",
    inventory_next_upgrade:
      "\n💡 **Next Upgrade:** {capacity}kg for **${price}** at the shop",
    inventory_max_capacity: "\n✨ **Maximum capacity reached!**",
    inventory_nearly_full_warning:
      "⚠️ Your backpack is nearly full! Use /give to transfer items or upgrade your capacity.",
    inventory_full_warning:
      "🚨 BACKPACK FULL! You cannot collect more items until you free up space.",
    inventory_transfer_hint: "Use /give to transfer items to other players",

    // Profile Command
    profile_edit_bio: "Edit Bio",
    profile_edit_phrase: "Edit Phrase",
    profile_change_bg: "Change Background",
    profile_change_frame: "Change Frame",
    profile_shop_bg: "Shop Backgrounds",
    profile_shop_frames: "Shop Frames",
    profile_level: "Level",
    profile_about_me: "About Me",
    profile_no_bio: "No bio set yet...",

    // Background Shop
    bg_shop_title: "🛒 Background Shop",
    bg_shop_price: "Price",
    bg_shop_status: "Status",
    bg_shop_tokens: "Saloon Tokens",
    bg_shop_free: "✅ FREE",
    bg_shop_owned: "✅ Already Owned",
    bg_shop_available: "✅ Available",
    bg_shop_can_purchase: "💰 Can Purchase",
    bg_shop_not_enough: "❌ Not enough tokens",
    bg_shop_your_tokens: "Your Tokens",
    bg_shop_footer: "Background {current} of {total}",
    bg_shop_btn_back: "Back",
    bg_shop_btn_next: "Next",
    bg_shop_btn_owned: "Owned",
    bg_shop_btn_claim: "Claim",
    bg_shop_btn_buy: "{price} 🎫",

    // Frame Shop
    frame_shop_title: "🖼️ Frame Shop",
    frame_shop_price: "Price",
    frame_shop_status: "Status",
    frame_shop_tokens: "Saloon Tokens",
    frame_shop_owned: "✅ Already owned",
    frame_shop_available: "💰 Available for purchase",
    frame_shop_not_enough: "❌ Not enough tokens",
    frame_shop_your_tokens: "Your tokens",
    frame_shop_footer: "Frame {current} of {total}",
    frame_shop_btn_owned: "✅ Already owned",
    frame_shop_btn_buy: "💰 Buy",

    mine_cooldown: "You're too tired to mine! Come back in: **{time}**",
    mine_title: "GOLD MINING",
    mine_choose: "Choose your mining method:",
    mine_solo: "Solo Mining",
    mine_solo_desc: "Duration: 50 minutes\nReward: 1-3 Gold Bars\nRisk: Low",
    mine_coop: "Cooperative Mining",
    mine_coop_desc:
      "Duration: 2 hours\nReward: 4-6 Gold Bars (split)\nRisk: High",
    mine_gold_value: "1 Gold Bar = {value} Silver Coins",
    mine_progress: "Mining for gold...",
    mine_success: "You mined {amount} Gold Bar(s)!",
    mine_value: "Value",
    mine_next: "Next Mining",
    mine_good_work: "Good work, partner!",
    mine_in_progress: "MINING IN PROGRESS",
    mine_currently_mining: "You're currently mining for gold!",
    mine_time_remaining: "Time Remaining",
    mine_type: "Type",
    mine_expected_reward: "Expected Reward",
    mine_come_back: "Come back when mining is complete!",
    mine_complete: "MINING COMPLETE!",
    mine_complete_desc: "Your mining operation is complete!",
    mine_reward: "Reward",
    mine_collect_btn: "Collect Gold",
    mine_great_work: "Great work, partner!",
    mine_collection_failed: "COLLECTION FAILED",
    mine_inventory_heavy:
      "Your saddlebag is too heavy to carry the gold!\n\nFree up some space and use /mine again to collect.",
    mine_gold_waiting: "The gold will wait for you!",
    mine_collected: "GOLD COLLECTED!",
    mine_you_collected: "You collected",
    mine_can_mine_again: "Great work, partner! You can mine again now.",
    mine_sessions_btn: "View Sessions",
    mine_alone_duration: "Mine Alone (1h30m)",
    mine_find_partner: "Find Partner (30min)",
    mine_solo_started: "SOLO MINING STARTED!",
    mine_started_mining: "You started mining for gold!",
    mine_duration: "Duration",
    mine_expected: "Expected",
    mine_automatic: "The mining will happen automatically.",
    mine_come_back_in: "Come back in 1h30m",
    mine_check_progress: "Use /mine to check progress!",
    mine_not_yours: "This gold is not yours!",
    mine_looking_partner: "LOOKING FOR MINING PARTNER",
    mine_is_looking: "is looking for a mining partner!",
    mine_total_reward: "Total Reward",
    mine_split_between: "4-6 Gold Bars (split between both)",
    mine_click_to_join: "Click below to join!",
    mine_first_person: "First person to click joins!",
    mine_cannot_join_self: "You cannot mine with yourself!",
    mine_already_mining:
      "You're already mining! Complete your current operation first.",
    mine_coop_started: "COOPERATIVE MINING STARTED!",
    mine_mining_together: "started mining together!",
    mine_total_gold: "Total Gold",
    mine_invitation_expired: "MINING INVITATION EXPIRED",
    mine_no_one_joined:
      "No one joined your mining operation.\n\nTry again or mine solo!",
    mine_better_luck: "Better luck next time!",
    mine_sessions_tracker: "MINING SESSIONS TRACKER",
    mine_current_operations: "Current mining operations across the server",
    mine_overview: "Overview",
    mine_active_sessions: "Active Sessions",
    mine_solo_mining_label: "Solo Mining",
    mine_cooperative_label: "Cooperative",
    mine_ready_to_claim: "Ready to Claim",
    mine_pending_gold: "Pending Gold",
    mine_active_mining: "Active Mining",
    mine_no_active_sessions: "No Active Sessions",
    mine_no_one_mining: "No one is currently mining.",
    mine_no_one_mining_start:
      "No one is currently mining. Use the buttons below to start!",
    mine_auto_come_back: "Mining happens automatically - come back when done!",
    mine_duration_1h30: "Duration: 1h 30min",
    mine_duration_1h30_boosted: "45m (⚡ +50% boost!)",
    mine_duration_30min: "Duration: 30 minutes",
    mine_duration_30min_boosted: "15m (⚡ +50% boost!)",
    mine_boost_badge: "\n⛏️ **Gold Mine Shares:** Mining 50% faster!",
    mine_reward_1_3: "Reward: 1-3 Gold Bars",
    mine_players_1: "Players: 1",
    mine_reward_4_6_split: "Reward: 4-6 Gold Bars (split)",
    mine_players_2: "Players: 2",
    mine_gold_value_label: "Gold Value",
    mine_sessions_realtime: "Mining sessions update in real-time",
    mine_more: "more...",
    mine_blocked_expedition_title: "You're on an Expedition!",
    mine_blocked_expedition_desc:
      "You can't mine while on an active expedition. Complete the expedition first!",
    mine_blocked_expedition_footer:
      "Come back when the expedition is over to mine again.",
    silver_coins: "Silver Coins",
    gold_bars: "Gold Bars",
    wheat_item: "Wheat",
    honey_item: "Honey",
    weight: "Weight",
    time_minutes: "{min} minutes",
    time_hours: "{hours}h {min}m",

    // Emoji Placeholders (EN-US)
    emoji_pickaxe: "[PICKAXE]",
    emoji_gold_bar: "[GOLD]",
    emoji_silver_coin: "[SILVER]",
    emoji_cowboy: "[COWBOY]",
    emoji_cowboys: "[COWBOYS]",
    emoji_check: "[CHECK]",
    emoji_sparkles: "[SPARKLES]",
    emoji_moneybag: "[MONEYBAG]",
    emoji_backpack: "[BACKPACK]",
    emoji_cancel: "[CANCEL]",
    emoji_stats: "[STATS]",
    emoji_timer: "[TIMER]",
    emoji_diamond: "[DIAMOND]",
    emoji_mute: "[MUTE]",

    // Mining DM Notifications
    mine_dm_complete_title: "MINING COMPLETE!",
    mine_dm_complete_desc: "Your mining operation has been completed!",
    mine_dm_type_label: "Mining Type",
    mine_dm_type_solo: "{pickaxe} Solo Mining",
    mine_dm_type_coop: "{cowboys} Cooperative Mining",
    mine_dm_gold_available: "Gold Available",
    mine_dm_footer: "Use /mine to collect your gold!",

    // Bank Robbery Command
    bankrob_cant_rob_alone: "You can't rob the bank alone! Choose a partner.",
    bankrob_bots_cant_help: "Bots can't help you rob a bank! Choose a real partner.",
    bankrob_invitation_only: "This robbery invitation is for **{partner}** only!",
    bankrob_footer_join: "{partner}, click the button below to join!",
    bankrob_started_title: "BANK ROBBERY STARTED!",
    bankrob_time_left: "Time remaining: **{time}**",
    bankrob_progress_bar_desc: "**{user1}** and **{user2}** are robbing the bank!\n\n**Progress:**\n`{bar}` {percent}%\n\n{clock} {timeLeft}\n\nKeep quiet and don't attract attention!",
    bankrob_in_jail: "You're in jail!",
    bankrob_in_jail_desc:
      "You cannot commit crimes while serving your sentence!",
    bankrob_time_remaining: "Time remaining",
    bankrob_sheriff_watching:
      "The sheriff's watching you closely! Wait {time} more minutes before attempting another robbery.",
    bankrob_already_active:
      "You already have an active robbery! Wait for it to finish or expire.",
    bankrob_join_btn: "Join the Robbery",
    bankrob_title: "BANK ROBBERY",
    bankrob_planning: "is planning a bank robbery!",
    bankrob_dangerous_job:
      "This is a dangerous job, partner. We need one more outlaw to pull this off!",
    bankrob_partner_accept: "**{partner}**, you have 60 seconds to accept!",
    bankrob_silver_reward: "Silver Reward",
    bankrob_silver_split: "800-1,500 Coins (split)",
    bankrob_gold_bonus: "Gold Bonus",
    bankrob_gold_split: "2 Gold Bars (split)",
    bankrob_duration: "Duration",
    bankrob_3_minutes: "3 minutes",
    bankrob_risk: "Risk",
    bankrob_risk_capture: "30% chance of capture!",
    bankrob_invite_desc: "**{user}** invited **{partner}** to rob the bank!\n\n{job}\n\n{clock} **{partner}**, you have 60 seconds to accept!",
    bankrob_partner_in_jail: "You're in jail and cannot join robberies!",
    bankrob_partner_jail_time: "Time remaining: **{time}**",
    bankrob_already_started: "This robbery has already started or ended!",
    bankrob_in_progress: "BANK ROBBERY IN PROGRESS!",
    bankrob_robbing: "are robbing the bank!",
    bankrob_progress: "Progress",
    bankrob_keep_quiet: "Keep quiet and don't attract attention!",
    bankrob_sheriff_patrol: "The sheriff might be on patrol...",
    bankrob_success_title: "ROBBERY SUCCESSFUL!",
    bankrob_success_desc:
      "**{user1}** and **{user2}** successfully robbed the bank and escaped!\n\nYou managed to escape with the loot!",
    bankrob_total_haul: "Total Haul",
    bankrob_haul_value: "{silver} {silverEmoji} Silver Coins\n{gold} {goldEmoji} Gold Bars",
    bankrob_bounty_value: "{silverEmoji} {amount} Silver Coins",
    bankrob_share: "'s Share",
    bankrob_nothing: "Nothing (inventory full)",
    bankrob_warnings: "Warnings",
    bankrob_spend_wisely: "Spend it wisely before the law catches up!",
    bankrob_lost_loot: "Some loot was lost! Clean your inventory!",
    bankrob_bag_heavy_silver: "**{user}**'s bag too heavy for Silver!",
    bankrob_bag_heavy_gold: "**{user}**'s bag too heavy for Gold!",
    bankrob_partial_escape: "PARTIAL ESCAPE!",
    bankrob_partial_desc: "**{escapee}** managed to escape, but **{captured}** was captured by the Sheriff!\n\n{alarm} The escapee is now WANTED!\n{lock} **{captured} cannot send messages for 30 minutes!**",
    bankrob_escaped: "Escaped",
    bankrob_captured: "Captured",
    bankrob_timeout_30min: "**30 min timeout**",
    bankrob_bounty_placed: "Bounty Placed",
    bankrob_system_error: "System error",
    bankrob_escapee_wanted: "{escapee} is now wanted! Use /claim to capture them!",
    bankrob_both_captured: "BOTH CAPTURED!",
    bankrob_both_caught_desc: "**{user1}** and **{user2}** were both caught by the Sheriff!\n\nNo loot was stolen, and both outlaws are now in jail!\n\n{lock} **You cannot send messages for 30 minutes!**",
    bankrob_punishment: "Punishment",
    bankrob_lost: "Lost",
    bankrob_all_loot: "All potential loot",
    bankrob_crime_no_pay: "Crime doesn't pay when the Sheriff is on duty!",
    bankrob_cancelled: "Robbery Cancelled",
    bankrob_no_partner:
      "No partner joined the robbery. The plan was abandoned.",
    bankrob_better_luck: "Better luck next time, partner!",
    bankrob_punishment_reason: "Captured during bank robbery",

    // Cattle Rustling (Roubo) Command
    roubo_title: "🐄 Group Cattle Rustling",
    roubo_organizing: "🤠 is organizing a cattle rustling!",
    roubo_details: "🎯 Heist Details:",
    roubo_players_needed: "👥 Players needed",
    roubo_cattle_to_steal: "🐄 Cattle to rustle",
    roubo_cattle_options: "8, 12 or 20 heads",
    roubo_cost_per_person: "💸 Cost per person",
    roubo_warning: "⚠️ WARNING",
    roubo_warning_text:
      "If the heist fails, ALL participants will become wanted!",
    roubo_participants_label: "📋 Participants",
    roubo_time_remaining: "⏱️ Time remaining",
    roubo_footer_join: "👆 Click the button below to join!",
    roubo_btn_join: "Join",
    roubo_btn_cancel: "Cancel",
    roubo_only_organizer_cancel: "❌ Only the organizer can cancel!",
    roubo_cancelled: "❌ Heist cancelled by the organizer.",
    roubo_already_in: "⚠️ You are already in this heist!",
    roubo_heist_full: "⚠️ The heist is already full!",
    roubo_need_silver:
      "❌ You need **{amount}** Silver Coins to join this rustling!",
    roubo_in_jail: "🔒 You're in jail and can't participate!",
    roubo_group_complete: "🎯 Group complete! Starting the heist...",
    roubo_time_expired: "⏰ Time expired! Could not gather enough players.",
    roubo_starting: "🐄 STARTING CATTLE RUSTLING!",
    roubo_in_progress: "⚙️ The group is rustling cattle...",
    roubo_progress_desc:
      "🤫 The cowboys are working quietly to steal the cattle without being seen!",
    roubo_be_quiet: "🤫 Stay quiet and don't attract attention!",
    roubo_rancher_patrol: "👀 The ranch owner might be on patrol...",
    roubo_success_title: "✅ Successful Rustling!",
    roubo_success_desc:
      "🐴 The group rustled {cattle} heads of cattle!\n\nYou managed to escape unseen and divided the cattle!",
    roubo_distribution: "📦 Cattle Distribution",
    roubo_added_inventory:
      "✅ The cattle has been added to each participant's inventory!",
    roubo_total_cattle: "🐄 Total Cattle",
    roubo_participants_count: "👥 Participants",
    roubo_teamwork: "🤝 Teamwork pays off!",
    roubo_fail_title: "⚠️ Rustling Failed!",
    roubo_fail_desc:
      "🔫 The group got caught red-handed!\n\nThe ranch owner spotted you and called the sheriff! Everyone had to flee empty-handed.",
    roubo_all_wanted: "⚠️ ALL PARTICIPANTS ARE NOW WANTED!",
    roubo_bounty_per_head: "💰 Bounty per head",
    roubo_reason: "🔫 Reason",
    roubo_wanted_list: "👥 Wanted",
    roubo_watch_bounty_hunters: "⚠️ Watch out for bounty hunters!",
    roubo_crime_sometimes: "💀 Crime doesn't pay... sometimes.",
    roubo_insufficient_silver:
      "❌ One of the participants doesn't have enough silver! Heist cancelled.",
    roubo_random_word: "🎲 random",
    roubo_progress_label: "📊 Progress",
    roubo_in_jail_cooldown: "🔒 You're in jail!",
    roubo_cooldown_wait:
      "⏰ Wait {time} seconds before attempting another rustling!",
    roubo_time_remaining_punishment: "⏱️ Time remaining",
    roubo_cattle_word: "cattle",
    roubo_entry_fee_required:
      "❌ You need **{amount}** Silver Coins to join this rustling!",

    // Middleman Command
    middleman_title: "MIDDLEMAN - CURRENCY EXCHANGE",
    middleman_welcome: "Welcome to the Middleman, partner!",
    middleman_description:
      "Exchange your valuable items for Silver Coins at fair rates.",
    middleman_exchange_rates: "EXCHANGE RATES",
    middleman_your_inventory: "Your Inventory",
    middleman_saloon_tokens: "Saloon Tokens",
    middleman_gold_bars: "Gold Bars",
    middleman_how_to_exchange: "How to Exchange",
    middleman_step1: "1. Click a button below to select what to convert",
    middleman_step2: "2. Choose how many items to exchange",
    middleman_step3: "3. Receive Silver Coins instantly!",
    middleman_fair_trades: "Fair trades guaranteed by the Sheriff!",
    middleman_tokens_to_silver: "Tokens → Silver",
    middleman_gold_to_silver: "Gold → Silver",
    middleman_visit_shop: "Visit Shop",
    middleman_not_for_you: "This exchange is not for you!",
    middleman_no_tokens: "You don't have any Saloon Tokens to convert!",
    middleman_no_gold: "You don't have any Gold Bars to convert!",
    middleman_select_amount: "Select amount to convert:",
    middleman_you_have_tokens: "You have",
    middleman_you_have_gold: "You have",
    middleman_select_tokens: "Select how many Tokens to convert",
    middleman_select_gold: "Select how many Gold Bars to convert",
    middleman_not_enough_tokens:
      "You don't have enough Saloon Tokens! You only have",
    middleman_not_enough_gold: "You don't have enough Gold Bars! You only have",
    middleman_error: "Error",
    middleman_success_title: "EXCHANGE SUCCESSFUL!",
    middleman_converted_tokens: "You converted",
    middleman_converted_gold: "You converted",
    middleman_into: "into",
    middleman_tokens_converted: "Tokens Converted",
    middleman_gold_converted: "Gold Converted",
    middleman_silver_received: "Silver Received",
    middleman_thanks: "Thanks for using the Middleman service!",
    middleman_token: "Token",
    middleman_tokens: "Tokens",
    middleman_bar: "Bar",
    middleman_bars: "Bars",
    middleman_all: "All",

    // Redeem Command
    redeem_invalid_title: "Invalid Code",
    redeem_invalid_desc:
      "The code `{code}` does not exist.\n\nMake sure you copied it correctly from the shop!",
    redeem_invalid_footer: "Buy products at the website shop",
    redeem_already_title: "Already Redeemed",
    redeem_already_desc:
      "This code has already been used!\n\n**Product:** {product}\n**Redeemed on:** {date}",
    redeem_already_footer: "Each code can only be used once",
    redeem_processing: "Processing your purchase...",
    redeem_upgrade_not_needed_title: "Upgrade Not Needed",
    redeem_upgrade_not_needed_desc:
      "You already have a backpack with **{current}kg** capacity!\n\nThis upgrade is for **{target}kg**, which you already have or exceeded.\n\n**Note:** Your redemption code was **not consumed** and can be given to another player.",
    redeem_upgrade_not_needed_footer: "Consider buying a higher tier upgrade",
    redeem_success_title: "Code Redeemed Successfully!",
    redeem_success_desc:
      "Thank you for your purchase! 🎉\n\n**Product:** {product}\n**Code:** `{code}`",
    redeem_success_footer: "Enjoy your rewards, partner!",
    redeem_rewards: "Rewards Received",
    redeem_special_perks: "Special perks activated!",
    redeem_vip_status: "VIP Status",
    redeem_vip_activated:
      "Activated! You now have access to exclusive features.",
    redeem_background: "Exclusive Background",
    redeem_background_unlocked: "Unlocked! Use it in your profile.",
    redeem_backpack: "Backpack Upgraded",
    redeem_backpack_upgraded:
      "Your inventory capacity is now **{capacity}kg**!",
    redeem_error_title: "Redemption Error",
    redeem_error_desc:
      "An error occurred while processing your code.\n\nPlease try again or contact support if the issue persists.",
    redeem_error_footer: "Error details have been logged",
    redeem_inventory_upgraded: "Inventory upgraded to **{capacity}kg**",

    // Help Command Translations (English)
    help_title: "🤠 Sheriff Rex - Command Guide",
    help_overview_desc:
      "**Welcome to the Wild West!** Sheriff Rex is a complete bot with economy system, games, mining and much more.\n\n📱 **DM Support:** Some commands work in direct messages!\n🎮 **34 Commands Available**\n\n**Select a category below to see the commands:**",
    help_footer: "🌵 Use the buttons to navigate between categories",
    help_btn_economy: "💰 Economy",
    help_btn_gambling: "🎲 Gambling",
    help_btn_mining: "⛏️ Mining",
    help_btn_profile: "👤 Profile",
    help_btn_bounty: "🔫 Bounty",
    help_btn_admin: "⚙️ Admin",
    help_btn_utility: "🔧 Utility",
    help_btn_home: "🏠 Home Menu",
    help_btn_support: "🆘 Support",
    help_btn_invite: "➕ Add Bot",
    help_btn_website: "🌐 Website",
    help_only_user: "❌ Only the command user can navigate!",

    // Category Titles (English)
    help_economy_title: "💰 Economy & Trading",
    help_gambling_title: "🎲 Gambling & Games",
    help_mining_title: "⛏️ Mining System",
    help_profile_title: "👤 Profile & Customization",
    help_bounty_title: "🔫 Bounty System",
    help_admin_title: "⚙️ Server Administration",
    help_utility_title: "🔧 Utility Commands",

    // Category Descriptions (English)
    help_economy_desc:
      "**Complete economic system with coins, items and transfers.**\n\n🪙 **Silver Coins** - Main server currency\n🥇 **Gold Bars** - Valuable items (1 bar = 700 Silver)\n🎟️ **Saloon Tokens** - Premium currency for customizations\n💼 **Backpack System** - Backpack system with upgrades",
    help_gambling_desc:
      "**Wild West gambling and games!**\n\n💰 Bet your Silver Coins\n🎰 Multiple games available\n🤝 Solo and cooperative games\n⚠️ Gamble responsibly!",
    help_mining_desc:
      "**Mine in the Wild West mountains!**\n\n🥇 Find valuable Gold Bars\n💎 Discover rare ores\n🤝 Mine alone or in pairs\n⏰ Strategic cooldowns",
    help_profile_desc:
      "**Personalize your Wild West profile!**\n\n🎨 Customizable backgrounds\n📊 XP and Level System\n🖼️ Visual profile cards\n✨ Glassmorphism effect",
    help_bounty_desc:
      "**Bounty hunting in the Wild West!**\n\n💀 Place bounties on players\n🎯 Capture wanted criminals\n💰 Earn Silver rewards\n⚖️ Western justice system",
    help_admin_desc:
      "**Exclusive commands for administrators!**\n\n🛡️ Requires admin permissions\n🎛️ Server settings\n💸 Economy management\n📢 Advanced announcement system",
    help_utility_desc:
      "**Useful tools and bot information!**\n\n📊 Status and information\n🌐 General settings\n❓ Help and support\n⚡ Performance",

    // Territories Command
    territories_price: "Price",
    territories_rarity: "Rarity",
    territories_status: "Status",
    territories_owned: "OWNED",
    territories_available: "Available",
    territories_insufficient: "Insufficient Funds",
    territories_benefits: "Benefits",
    territories_footer:
      "Territory {current} of {total} • You own {owned}/{total} territories",
    territories_prev: "Previous",
    territories_next: "Next",
    territories_buy: "Buy for {price}k",
    territories_my_territories: "My Territories",
    territories_close: "Close",
    territories_not_yours: "This territory browser is not for you!",
    territories_need_more:
      "You need {amount} more Silver Coins to purchase this territory!",
    territories_already_own: "You already own this territory!",
    territories_transaction_failed: "Transaction failed! Please try again.",
    territories_purchase_failed:
      "Purchase failed! Your silver has been refunded.",
    territories_purchased_title: "TERRITORY PURCHASED!",
    territories_purchased_desc:
      "Congratulations! You are now the proud owner of **{name}**!",
    territories_amount_paid: "Amount Paid",
    territories_remaining_balance: "Remaining Balance",
    territories_benefits_unlocked: "Benefits Unlocked",
    territories_now_own: "You now own {count} territories!",
    territories_my_title: "YOUR TERRITORIES",
    territories_no_territories: "You don't own any territories yet.",
    territories_statistics: "Statistics",
    territories_owned_count:
      "**Owned:** {owned}/{total}\n**Completion:** {percentage}%",
    territories_keep_expanding: "Keep expanding your empire!",
    territories_browser_closed: "Territory browser closed. Come back anytime!",

    // Territory Rarities
    rarity_common: "Common",
    rarity_rare: "Rare",
    rarity_epic: "Epic",
    rarity_legendary: "Legendary",

    // Territory Names
    territory_saloon_business_name: "Saloon Business",
    territory_saloon_business_desc:
      "Own a bustling saloon in the heart of town! Serve drinks, host events, and watch the coins roll in.",
    territory_saloon_business_benefit_1: "💰 Generate 5,000 Silver Coins daily",
    territory_saloon_business_benefit_2: "",

    territory_gold_mine_shares_name: "Gold Mine Shares",
    territory_gold_mine_shares_desc:
      "Invest in the richest gold mine in the West! Your shares will bring you steady income from precious metals.",
    territory_gold_mine_shares_benefit_1:
      "💰 Generate 12,000 Silver Coins daily",
    territory_gold_mine_shares_benefit_2: "⚡ 50% faster mining operations",

    territory_ranch_name: "Ranch",
    territory_ranch_desc:
      "Build your own ranch with cattle, horses, and wide open plains. A true cowboy's dream come true!",
    territory_ranch_benefit_1: "💰 Generate 15,000 Silver Coins daily",
    territory_ranch_benefit_2: "🐄 Receive 8 Cattle weekly",

    // Bounty Commands
    bounty_invalid_target: "Invalid Target",
    bounty_cant_target_bot: "You can't place a bounty on a bot, partner!",
    bounty_choose_real_outlaw: "Choose a real outlaw",
    bounty_self_not_allowed: "Self-Bounty Not Allowed",
    bounty_cant_target_self: "You can't place a bounty on yourself!",
    bounty_mighty_strange: "That would be mighty strange, partner",
    bounty_already_active: "Bounty Already Active",
    bounty_user_has_bounty:
      "**{user}** already has an active bounty!\n\n**Current Bounty:** {amount}",
    bounty_wait_cleared: "Wait until it's cleared before placing a new one",
    bounty_insufficient_funds: "Insufficient Funds",
    bounty_not_enough_silver:
      "You don't have enough Silver Coins!\n\n**Required:** {required}\n**You have:** {current}",
    bounty_earn_more: "Earn more silver first",
    bounty_transaction_failed: "Transaction Failed",
    bounty_could_not_deduct: "Could not deduct Silver Coins: {error}",
    bounty_try_again: "Please try again",
    bounty_placed: "Bounty Placed!",
    bounty_now_wanted: "**{user}** is now WANTED!",
    bounty_hunters_can_capture: "Bounty hunters can now capture this outlaw!",
    bounty_target: "Target",
    bounty_reward: "Reward",
    bounty_posted_by: "Posted By",
    bounty_reason: "**Reason:** {reason}",
    bounty_server_only: "Server Only",
    bounty_command_server_only: "This command can only be used in a server!",
    bounty_try_in_server: "Try using this command in a server",
    bounty_not_in_server: "Outlaw Not in Server",
    bounty_user_not_here:
      "**{user}** is not in this server!\n\nYou can only capture outlaws who are currently in the server.",
    bounty_must_be_present: "The outlaw must be present to be captured",
    bounty_capture_cooldown: "Capture Cooldown",
    bounty_need_rest:
      "You need to rest before attempting another capture!\n\n**Time remaining:** {minutes} minutes",
    bounty_hunting_exhausting: "Bounty hunting is exhausting work",
    bounty_no_bounty_found: "No Bounty Found",
    bounty_user_not_wanted:
      "**{user}** doesn't have an active bounty!\n\nThey're not wanted right now.",
    bounty_see_active: "Use /bounties to see active bounties",
    bounty_outlaw_escaped: "💨 Outlaw Escaped!",
    bounty_managed_escape:
      "**{user}** managed to escape!\n\nThe outlaw slipped through your fingers and fled into the desert.",
    bounty_better_luck: "Better luck next time, partner!",
    bounty_lost_reward: "💰 Lost Reward",
    bounty_success_rate: "📊 Success Rate",
    bounty_capture_failed: "Capture Failed",
    bounty_inventory_full:
      "Your inventory is too full to carry the reward!\n\n**Error:** {error}",
    bounty_free_space_try: "Free up space and try again",
    bounty_outlaw_captured: "🎯 Outlaw Captured!",
    bounty_hunter_captured:
      "**{hunter}** successfully captured **{outlaw}**!\n\nThe reward has been collected!",
    bounty_justice_prevails: "Justice prevails in the Wild West!",
    bounty_hunter: "👤 Hunter",
    bounty_outlaw: "🎯 Outlaw",
    bounty_permission_denied: "Permission Denied",
    bounty_admin_only: "Only administrators can clear bounties!",
    bounty_contact_admin: "Contact a server admin",
    bounty_user_no_bounty: "**{user}** doesn't have an active bounty.",
    bounty_nothing_to_clear: "Nothing to clear",
    bounty_cleared: "🚫 Bounty Cleared",
    bounty_admin_cleared:
      "Bounty on **{user}** has been cleared by an administrator.",
    bounty_no_longer_wanted: "The outlaw is no longer wanted",
    bounty_amount_cleared: "💰 Amount Cleared",
    bounty_cleared_by: "⚙️ Cleared By",
    bounty_no_active: "No Active Bounties",
    bounty_west_peaceful:
      "The Wild West is peaceful today!\n\nNo outlaws are currently wanted.",
    bounty_use_wanted: "Use /wanted to place a bounty",
    bounty_no_outlaws_server: "No Outlaws in Server",
    bounty_all_fled:
      "No wanted outlaws are currently in this server!\n\nAll the outlaws have fled.",
    bounty_most_wanted: "**Most Wanted Outlaws:**",
    bounty_contributors: "Contributors",
    bounty_more_outlaws: "*...and {count} more outlaws*",
    bounty_active_bounties: "Active Bounties",
    bounty_total_bounties: "Total Bounties",
    bounty_total_rewards: "Total Rewards",
    bounty_hunt_claim: "Hunt outlaws and claim rewards with /capture!",
    bounty_general_mischief: "General mischief and mayhem",

    // Wanted Poster Canvas Translations
    wanted_poster_title: "WANTED",
    wanted_poster_reward: "REWARD",
    wanted_poster_dead_or_alive: "DEAD OR ALIVE",
    wanted_poster_silver: "SILVER",

    // Give Command
    give_invalid_recipient: "Invalid Recipient",
    give_cant_give_bots: "You can't give items to bots, partner!",
    give_choose_real_player: "Choose a real player",
    give_self_transfer: "Self-Transfer Not Allowed",
    give_cant_give_self: "You can't give items to yourself!",
    give_mighty_strange: "That would be mighty strange",
    give_transfer_failed: "Transfer Failed",
    give_check_inventory: "Check your inventory and try again",
    give_transfer_success: "Transfer Successful!",
    give_you_gave: "You gave {amount} to **{user}**",
    give_from: "From",
    give_to: "To",
    give_item: "Item",
    give_quantity: "Quantity",
    give_generosity: "Generosity is a cowboy virtue!",

    // Dice Command
    dice_specify_all: "❌ Please specify both opponent, bet, and guess!",
    dice_cant_challenge_bot:
      "❌ You can't challenge a bot to a dice game, partner!",
    dice_cant_challenge_self: "❌ You can't challenge yourself, partner!",
    dice_cooldown_wait:
      "⏰ Hold your horses! Wait {seconds} more seconds before challenging again.",
    dice_opponent_cooldown:
      "⏰ {user} is still recovering from their last duel! They need {seconds} more seconds.",
    dice_already_active: "❌ One of you is already in an active dice game!",
    dice_not_enough_tokens:
      "❌ You don't have enough tokens! You have {current} Saloon Tokens but tried to bet {bet} Saloon Tokens.",
    dice_opponent_not_enough:
      "❌ {user} doesn't have enough tokens for this bet! They only have {current} Saloon Tokens.",
    dice_challenge_title: "🎲 DICE DUEL CHALLENGE!",
    dice_challenge_desc:
      "**{challenger}** has challenged **{opponent}** to a dice duel!\n\n🎫 **Bet:** {bet} Saloon Tokens\n🎯 **{challenger}'s Guess:** {guess}\n\n{opponent}, choose your guess (2-12) below!",
    dice_time_limit: "⏰ Time Limit",
    dice_time_accept: "30 seconds to accept",
    dice_winner_takes_all: "🏆 Winner Takes All",
    dice_total_tokens: "{total} Saloon Tokens total",
    dice_choose_wisely: "Choose wisely, partner!",
    dice_challenged: "{user}, you've been challenged to a dice duel!",
    dice_tie_title: "🎲 DICE DUEL - TIE!",
    dice_tie_desc:
      "**It's a tie!** Both players were equally close!\n\n🎲 Dice: {dice1} + {dice2} = **{total}**",
    dice_challenger_guess: "{user}'s Guess",
    dice_opponent_guess: "{user}'s Guess",
    dice_diff: "{guess} (diff: {diff})",
    dice_result: "Result",
    dice_bets_returned: "Bets returned to both players",
    dice_perfectly_balanced: "No winners, no losers - perfectly balanced!",
    dice_inventory_full_title: "🎲 DICE DUEL - INVENTORY FULL!",
    dice_winner_inventory_full:
      "**{winner}** won but their inventory is too heavy!\n\n🎲 Dice: {dice1} + {dice2} = **{total}**\n\n🚫 {winner} couldn't carry the prize! The bet is returned to {loser}.",
    dice_clean_inventory: "Clean out your inventory before dueling!",
    dice_results_title: "🎲 DICE DUEL RESULTS!",
    dice_showed: "🎲 The dice showed: {dice1} + {dice2} = **{total}**",
    dice_winner_wins: "🏆 **{winner} wins {total} Saloon Tokens!**",
    dice_winner_guess_label: "🎯 {user}'s Guess",
    dice_loser_guess_label: "❌ {user}'s Guess",
    dice_difference: "{guess} (difference: {diff})",
    dice_tokens_label: "🎫 {user}'s Tokens",
    dice_tokens_amount: "{amount} Saloon Tokens",
    dice_called_closest: "{user} called it closest!",
    dice_challenge_expired: "⏰ Challenge Expired",
    dice_no_response:
      "{user} didn't respond in time. The challenge has been cancelled.",
    dice_better_luck: "Better luck next time!",

    // Duel Command
    duel_title: "WESTERN DUEL",
    duel_challenge_title: "DUEL CHALLENGE",
    duel_challenge_desc:
      "**{challenger}** challenges **{opponent}** to a Western duel!\n\n{bet_info}⏰ Accept within 60 seconds!",
    duel_bet_info: "💰 **Bet:** {amount} Silver Coins\n",
    duel_no_bet: "💰 **Bet:** No bet\n",
    duel_accept_btn: "Accept Duel",
    duel_decline_btn: "Decline",
    duel_declined: "**{user}** declined the duel!",
    duel_accepted: "Duel accepted! Draw your weapons!",
    duel_first_turn: "First turn goes to **{user}**!",
    duel_current_turn: "Current Turn",
    duel_hp: "HP: **{hp}/{maxHp}**",
    duel_quick_draw: "Quick Draw",
    duel_take_cover: "Take Cover",
    duel_headshot: "Headshot",
    duel_complete: "DUEL COMPLETE",
    duel_winner: "**{user}** wins the duel!",
    duel_won_coins: "Won **{amount}** Silver Coins!",
    duel_timeout: "Duel ended - no response from **{user}**!",
    duel_challenge_expired: "Duel challenge expired!",
    duel_cant_self: "You can't duel yourself, partner!",
    duel_cant_bot: "You can't duel a bot!",
    duel_active_already: "You already have an active duel with this player!",
    duel_participants_only: "Only duel participants can use these buttons!",
    duel_xp_gained: "XP Gained",
    duel_xp_amount: "{user}: +{amount} XP",
    duel_xp_levelup: "Level {oldLevel} → {newLevel}",
    duel_action_attack: "**{user}** fires a quick shot!",
    duel_action_attack_cover:
      "**{user}** fires a quick shot but **{target}** is behind cover!",
    duel_action_defend: "**{user}** takes cover behind a barrel!",
    duel_action_special: "**{user}** aims for a headshot!",
    duel_action_special_cover:
      "**{user}** aims for a headshot but **{target}** is behind cover!",
    duel_dealt_damage: "Dealt **{damage}** damage!",
    duel_dealt_damage_reduced: "Dealt **{damage}** damage (reduced)!",
    duel_vs: "VS",

    // Roulette Command
    roulette_specify_both: "❌ Please specify both bet amount and bet type!",
    roulette_must_specify_number:
      "❌ You must specify a number when betting on a specific number!",
    roulette_cooldown:
      "⏰ Hold your horses! Wait {time} more seconds before spinning again.",
    roulette_already_active: "❌ You already have an active roulette game!",
    roulette_insufficient_tokens:
      "❌ You don't have enough tokens! You have {current} {emoji} but tried to bet {bet} {emoji}.",
    roulette_title_spinning: "SALOON ROULETTE - Spinning the Wheel!",
    roulette_your_bet: "YOUR BET",
    roulette_bet_amount: "Amount",
    roulette_bet_type: "Type",
    roulette_spinning: "The wheel is spinning...",
    roulette_determining: "Determining your fate...",
    roulette_good_luck: "Good luck, partner!",
    roulette_title_win: "ROULETTE - YOU WIN!",
    roulette_title_loss: "ROULETTE - You Lost!",
    roulette_result: "RESULT",
    roulette_ball_landed: "The ball landed on:",
    roulette_bet_won: "Your bet on {bet} won!",
    roulette_bet_lost: "Your bet on {bet} didn't win.",
    roulette_winnings: "Winnings",
    roulette_profit: "Profit",
    roulette_loss: "Loss",
    roulette_new_balance: "New Balance",
    roulette_congratulations: "Congratulations, partner!",
    roulette_better_luck: "Better luck next time, partner!",
    roulette_bet_red: "Red",
    roulette_bet_black: "Black",
    roulette_bet_number: "Specific Number",
    roulette_bet_even: "Even",
    roulette_bet_odd: "Odd",
    roulette_bet_low: "Low (1-18)",
    roulette_bet_high: "High (19-36)",
    roulette_ui_title: "SALOON ROULETTE",
    roulette_ui_welcome: "WELCOME TO ROULETTE",
    roulette_ui_balance: "Your Balance",
    roulette_ui_step1: "1️⃣ Choose bet type",
    roulette_ui_step1_desc: "Click one of the buttons above",
    roulette_ui_step2: "2️⃣ Select amount",
    roulette_ui_step2_desc: "Use the menu below",
    roulette_ui_step3: "3️⃣ Spin the wheel",
    roulette_ui_step3_desc: 'Click the "SPIN" button',
    roulette_select_amount: "💰 Select bet amount",
    roulette_ui_bet_selected: "Bet Selected",
    roulette_ui_now_select_amount:
      "💰 Now select the bet amount in the menu below",
    roulette_ui_ready: "READY TO SPIN!",
    roulette_ui_click_to_spin:
      "🎯 Click the button below to spin the roulette!",
    roulette_ui_spin: "🎰 SPIN ROULETTE",
    roulette_ui_not_selected: "Not selected",
    roulette_ui_select_bet_type: "Now choose the bet type above",
    roulette_enter_number: "Enter a number (0-36):",
    roulette_invalid_number:
      "❌ Invalid number! Please enter a number between 0 and 36.",

    // Music Command
    music_need_voice_channel:
      "❌ You need to be in a voice channel to play music!",
    music_searching: "🔍 Searching for your song...",
    music_not_found:
      "❌ Could not find that song. Please try again with a different search term.",
    music_now_playing: "🎵 Now Playing",
    music_added_to_queue: "➕ Added to Queue",
    music_nothing_playing: "❌ Nothing is currently playing!",
    music_paused: "⏸️ Paused the music!",
    music_could_not_pause: "❌ Could not pause the music.",
    music_resumed: "▶️ Resumed the music!",
    music_could_not_resume: "❌ Could not resume the music.",
    music_skipped: "⏭️ Skipped the current song!",
    music_could_not_skip: "❌ Could not skip the song.",
    music_stopped: "⏹️ Stopped the music and cleared the queue!",
    music_queue_empty: "❌ The queue is empty!",
    music_queue_title: "🎵 Music Queue",
    music_now_playing_label: "🎵 Now Playing",
    music_up_next: "📋 Up Next",
    music_and_more: "And {count} more song(s)...",
    music_loop_song_enabled: "🔂 Loop enabled for current song!",
    music_loop_disabled: "🔂 Loop disabled!",
    music_loop_queue_enabled: "🔁 Queue loop enabled!",
    music_volume_set: "🔊 Volume set to {volume}%!",
    music_status_playing: "Playing",
    music_status_paused: "Paused",
    music_loop_mode_song: "🔂 Loop: Song",
    music_loop_mode_queue: "🔁 Loop: Queue",
    music_loop_mode_normal: "➡️ Normal",
    music_requested_by: "👤 Requested By",
    music_queue_count: "📋 Queue",
    music_duration: "⏱️ Duration",
    music_volume: "🔊 Volume",
    music_status: "▶️ Status",
    music_use_buttons: "Use the buttons below to control playback",
    music_songs: "song(s)",
    music_position_in_queue: "📊 Position in Queue",
    music_btn_pause_resume: "⏸️ Pause/Resume",
    music_btn_skip: "⏭️ Skip",
    music_btn_loop: "🔂 Loop",
    music_btn_queue: "📋 Queue",
    music_btn_stop: "⏹️ Stop",
    music_btn_volume_down: "🔉 -10%",
    music_btn_volume_up: "🔊 +10%",
    music_more_songs: "+{count} more song(s)",

    // Poll Command
    poll_title_create: "Poll",
    poll_title_quick: "Quick Poll",
    poll_created_by: "created a poll!",
    poll_question_label: "Question",
    poll_duration_label: "Duration",
    poll_multiple_choice_label: "Multiple choice",
    poll_yes_option: "Yes",
    poll_no_option: "No",
    poll_maybe_option: "Maybe",
    poll_vote_now: "Vote now!",
    poll_wants_opinion: "wants your opinion!",
    poll_system_footer: "Polling System",
    poll_quick_footer: "Quick Poll",
    poll_hour: "hour",
    poll_hours: "hours",

    // Announcement System
    announce_title: "Announcement System",
    announce_preview: "Announcement Preview",
    announce_confirm: "Confirm Send",
    announce_cancel: "Cancel",
    announce_success: "Announcement Sent!",
    announce_sent_to: "Announcement sent to",
    announce_author: "Author",
    announce_channel: "Channel",
    announce_template_saved: "Template Saved!",
    announce_template_deleted: "Template Deleted!",
    announce_no_templates: "No templates saved",
    announce_select_color: "Select a color",

    // Welcome System
    welcome_title: "Welcome System",
    welcome_configured: "Welcome Configured!",
    welcome_channel_set: "Welcome channel configured",
    welcome_message_set: "Custom message set",
    welcome_current_config: "Current Configuration",
    welcome_status: "Status",
    welcome_enabled: "Enabled",
    welcome_disabled: "Disabled",
    welcome_test_message: "Test Message",
    welcome_placeholders: "Available Placeholders",
    welcome_placeholder_user: "{user} - User mention",
    welcome_placeholder_username: "{username} - Username",
    welcome_placeholder_server: "{server} - Server name",
    welcome_removed: "Welcome system removed",
    welcome_not_configured: "Welcome system is not configured",
    welcome_panel_title: "🤠 Welcome Panel",
    welcome_panel_description:
      "Configure custom welcome messages for new server members.",
    welcome_panel_footer: "Use the buttons below to manage the system",
    welcome_status_field: "Status",
    welcome_channel_field: "Channel",
    welcome_not_set: "Not configured",
    welcome_btn_configure: "Configure",
    welcome_btn_view: "View",
    welcome_btn_enable: "Enable",
    welcome_btn_disable: "Disable",
    welcome_btn_test: "Test",
    welcome_btn_import: "Import",
    welcome_btn_export: "Export",
    welcome_modal_title: "Configure Welcome",
    welcome_modal_channel_label: "Channel ID (Paste here)",
    welcome_modal_channel_placeholder: "Ex: 1234567890123456789",
    welcome_modal_message_label: "Message (Text or JSON)",
    welcome_modal_message_placeholder:
      "Enter plain text or JSON with complete embed...",
    welcome_modal_image_label: "Image URL (Optional)",
    welcome_modal_image_placeholder: "https://example.com/image.png",
    welcome_config_saved: "Configuration Saved!",
    welcome_config_saved_desc: "Welcome system configured successfully.",
    welcome_message_field: "Message",
    welcome_image_field: "Image",
    welcome_view_image: "View Image",
    welcome_error_not_your_panel: "This panel is not yours!",
    welcome_error_generic: "Error processing action. Please try again.",
    welcome_error_invalid_channel:
      "Invalid channel! Provide a valid text channel ID.",
    welcome_error_invalid_json: "Invalid JSON! Check syntax.",
    welcome_error_invalid_url:
      "Invalid URL! Use a link starting with http:// or https://",
    welcome_error_channel_not_found:
      "Channel not found! Reconfigure the system.",
    welcome_status_enabled: "Enabled",
    welcome_status_disabled: "Disabled",
    welcome_enabled_title: "System Enabled!",
    welcome_enabled_desc: "Welcome messages will be sent to new members.",
    welcome_disabled_title: "System Disabled",
    welcome_disabled_desc: "Welcome messages will no longer be sent.",
    welcome_test_error_disabled: "System disabled! Enable it first to test.",
    welcome_test_sent: "Test Message Sent!",
    welcome_test_sent_desc: "Check the message in",
    welcome_test_error: "Error sending test message. Check bot permissions.",
    welcome_import_title: "Import Configuration",
    welcome_import_label: "Paste the configuration JSON",
    welcome_import_placeholder: '{"channelId": "...", "message": "...", ...}',
    welcome_import_error_missing:
      "Incomplete JSON! Required fields: channelId, message",
    welcome_import_success: "Configuration Imported!",
    welcome_import_success_desc: "System updated with imported configuration.",
    welcome_export_title: "Configuration Exported",
    welcome_export_desc: "Download the JSON file for backup or sharing.",
    welcome_placeholders_field: "Placeholders",
    welcome_placeholders_list:
      "`{@user}` - Mention\n`{username}` - Name\n`{server}` - Server\n`{guild.size}` - Total members\n`{user.avatar}` - Avatar\n`{guild.icon}` - Server icon",
    welcome_view_footer: "Current system configuration",

    // Logs System
    logs_title: "Logs System",
    logs_configured: "Logs Configured!",
    logs_channel_set: "Logs channel configured successfully",
    logs_current_config: "Current Logs Configuration",
    logs_status: "Status",
    logs_enabled: "Enabled",
    logs_disabled: "Disabled",
    logs_events_tracked: "Tracked Events",
    logs_member_join: "Member joins",
    logs_member_leave: "Member leaves",
    logs_message_delete: "Deleted messages",
    logs_message_edit: "Edited messages",
    logs_removed: "Logs system removed",
    logs_removed_description: "Logs will no longer be sent to any channel.",
    logs_not_configured: "Logs system is not configured",

    // Admin Commands - Moderation (EN-US)
    warn_title: "Warning Issued",
    warn_desc: "Member received a warning from moderator",
    warn_member: "Member",
    warn_reason: "Reason",
    warn_moderator: "Moderator",
    warn_total_warns: "Total Warnings",
    warn_id: "Warning ID",
    warn_footer: "Warnings are permanent until removed",

    warnings_title: "{user} Warnings",
    warnings_desc: "Complete warning history",
    warnings_no_warns: "This member has no warnings!",
    warnings_warn_entry:
      "**Warning #{id}**\n**Reason:** {reason}\n**Moderator:** {moderator}\n**Date:** {date}",
    warnings_footer: "Total: {count} warning(s)",

    clear_success: "Messages Deleted",
    clear_desc: "Successfully deleted",
    clear_amount: "Amount",
    clear_channel: "Channel",
    clear_user_filter: "User Filter",
    clear_messages: "{count} messages",
    clear_all_users: "All users",

    clearwarns_success: "Warnings Removed",
    clearwarns_all_desc: "All warnings from {user} have been removed",
    clearwarns_one_desc: "Warning #{id} was removed from {user}",
    clearwarns_cleared_by: "Cleared by",
    clearwarns_total_removed: "Total Removed",
    clearwarns_no_warns: "{user} has no warnings to remove!",
    clearwarns_warn_not_found: "Warning #{id} not found for {user}!",

    mute_success: "Member Muted",
    mute_desc: "{user} has been temporarily muted",
    mute_duration_label: "Duration",
    mute_reason_label: "Reason",
    mute_moderator_label: "Moderator",
    mute_expires: "Expires at",
    mute_footer: "Member will be automatically unmuted when time expires",

    unmute_success: "Member Unmuted",
    unmute_desc: "{user} has been successfully unmuted",
    unmute_moderator: "Moderator",
    unmute_not_muted: "{user} is not muted!",

    addreward_success: "Reward Added",
    addreward_desc: "Level reward configured successfully",
    addreward_level: "Level",
    addreward_role: "Reward Role",
    addreward_footer:
      "Members will receive this role when they reach the specified level",
    addreward_already_exists: "A reward already exists for level {level}!",

    expedition_title: "Desert Expedition",
    expedition_desc:
      "Embark on a dangerous expedition through the desert in search of valuable resources!",
    expedition_duration: "Duration",
    expedition_rewards: "Possible Rewards",
    expedition_start_btn: "Start Expedition",
    expedition_in_progress_title: "Expedition in Progress",
    expedition_in_progress_desc: "You're on an expedition through the desert!",
    expedition_time_left: "Time Remaining",
    expedition_complete_title: "Expedition Complete!",
    expedition_complete_desc:
      "You returned from the expedition and found valuable resources!",
    expedition_rewards_found: "Resources Found",
    expedition_cooldown_title: "Rest Period",
    expedition_cooldown_desc:
      "You've already done an expedition recently! Rest a bit before departing again.",
    expedition_cooldown_time: "Next Expedition",
    expedition_solo_btn: "Solo Expedition",
    expedition_party_btn: "Invite Friends",
    expedition_choose_type: "Choose your expedition type:",
    expedition_type_solo: "{cowboy} **Solo:** Go alone (any duration)",
    expedition_type_party:
      "{cowboys} **Party:** Invite 1-2 friends (rewards divided)",
    expedition_duration_options: "Duration Options",
    expedition_duration_3h: "**3 hours** - Standard rewards (1-3 players)",
    expedition_duration_10h:
      "**10 hours** - Premium rewards (2-3 players only)",
    expedition_cooldown_label: "Cooldown",
    expedition_seal_requirements: "🎟️ Seal Requirements",
    expedition_seal_3h: "**12 Seals** for 3h expedition",
    expedition_seal_10h_solo: "**30 Seals** for 10h solo expedition",
    expedition_seal_10h_party:
      "**10 Seals per person** for 10h party expedition",
    expedition_insufficient_seals:
      "{cross} Insufficient seals! You have **{current}** but need **{required}** for this expedition.",
    expedition_rewards_3h: "Rewards (3h expedition)",
    expedition_rewards_10h: "Rewards (10h expedition)",
    expedition_choose_wisely:
      "🏜️ Choose wisely! Rewards are divided among party members.",
    expedition_btn_3h: "3 Hours",
    expedition_btn_10h: "10 Hours",
    expedition_btn_back: "Back",
    expedition_btn_3h_1to3: "3 Hours (1-3 players)",
    expedition_btn_10h_2to3: "10 Hours (2-3 players)",
    expedition_solo_choose_duration:
      "{cowboy} Solo Expedition - Choose Duration",
    expedition_solo_select:
      "Select how long you want to spend on this expedition:",
    expedition_3h_label: "{clock} 3 Hours",
    expedition_3h_desc: "Standard rewards - Complete faster",
    expedition_10h_label: "{clock} 10 Hours",
    expedition_10h_desc: "Premium rewards - Takes longer but worth it!",
    expedition_party_choose_duration:
      "{cowboys} Party Expedition - Choose Duration",
    expedition_party_select:
      "Select expedition duration. You can invite friends after selecting:",
    expedition_3h_party_label: "{clock} 3 Hours",
    expedition_3h_party_desc:
      "**1-3 players allowed**\nStandard rewards divided",
    expedition_10h_party_label: "{clock} 10 Hours",
    expedition_10h_party_desc:
      "**2-3 players required**\nPremium rewards divided",
    expedition_party_title: "{cowboys} Expedition Party - {duration}",
    expedition_party_forming: "<@{leader}> is forming an expedition party!",
    expedition_party_members: "Current Members ({current}/3):",
    expedition_party_required: "Required",
    expedition_party_required_players: "{min}-3 players",
    expedition_party_rewards_divided: "Rewards",
    expedition_party_rewards_equally: "Divided equally among all members",
    expedition_party_footer:
      '🏜️ Click "Join Party" to join or "Start Expedition" when ready!',
    expedition_btn_join: "Join Party ({current}/3)",
    expedition_btn_start_party: "Start Expedition",
    expedition_already_joined: "{cross} You already joined this expedition!",
    expedition_party_full:
      "{cross} This expedition party is full! (max 3 members)",
    expedition_already_active: "{cross} You already have an active expedition!",
    expedition_on_cooldown:
      "{cross} You're still resting! Cooldown: {timeLeft}",
    expedition_joined_party:
      "{check} You joined <@{leader}>'s expedition party! ({current}/3)",
    expedition_need_min_players:
      "{cross} 10-hour expeditions require at least 2 players!",
    expedition_started_title: "🗺️ Expedition Started!",
    expedition_started_desc:
      "{check} Your party departed on a {duration} expedition through the desert!",
    expedition_party_members_label: "{cowboys} Party Members",
    expedition_estimated_return: "{timer} Estimated Return",
    expedition_started_footer:
      "🏜️ All members will receive a DM when the expedition is complete!",
    expedition_dm_complete_title: "{check} Expedition Complete!",
    expedition_dm_complete_desc: "Your {duration} expedition is complete!",
    expedition_dm_rewards_divided:
      "\n\n{moneybag} **Rewards divided among {count} members**\n**Your share has been automatically added:**",
    expedition_dm_rewards_solo:
      "\n\n**Your rewards have been automatically added:**",
    expedition_dm_total_section:
      "\n\n{stats} **Total Collected by Party:**\n{silver} {silverAmount} Silver\n{gold} {goldAmount}x Gold\n{wheat} {wheatAmount}x Wheat\n{honey} {honeyAmount}x Honey\n{star} {xpAmount} XP",
    expedition_dm_footer: "🏜️ Rewards automatically added to your account!",
    expedition_already_complete:
      "Your expedition is complete! Your rewards were automatically added to your account when the expedition finished.\n\nYou should have received a DM with the details. Check your inventory to see your rewards!",
    expedition_start_new: "🏜️ Start a new expedition when ready!",
    expedition_in_progress_footer: "🏜️ Good luck on your journey!",
    expedition_cooldown_footer: "🏜️ Rest and prepare for the next adventure!",
    expedition_solo_duration_footer: "🏜️ Choose your duration",
    expedition_party_duration_footer:
      "🏜️ Rewards will be divided among all party members",
    expedition_duration_3h_text: "3 hours",
    expedition_duration_10h_text: "10 hours",
    expedition_cooldown_value: "**6 hours**",
    expedition_rewards_3h_value:
      "{silver} **4,500 - 8,800** Silver Coins\n{gold} **9x** Gold Bars\n🌾 **2,000 - 6,000** Wheat\n🍯 **10x** Honey\n{star} **+1,000 XP**",
    expedition_rewards_10h_value:
      "{silver} **35,000 - 55,000** Silver Coins\n{gold} **16x** Gold Bars\n🌾 **8,000 - 15,000** Wheat\n🍯 **35x** Honey\n{star} **+3,500 XP**",

    // Embed Builder
    eb_title: "Embed Builder",
    eb_target_channel: "Target Channel",
    eb_preview: "Preview",
    eb_invalid_channel: "Channel must be a text channel!",
    eb_btn_basic: "Basic",
    eb_btn_author: "Author",
    eb_btn_images: "Images",
    eb_btn_footer: "Footer",
    eb_btn_fields: "Field",
    eb_btn_color: "Color",
    eb_btn_clear: "Clear",
    eb_btn_timestamp: "Timestamp",
    eb_btn_remove_timestamp: "Remove",
    eb_btn_send: "Send",
    eb_btn_cancel: "Cancel",
    eb_preview_title: "Preview - No title set",
    eb_only_author: "Only the command author can use these buttons!",
    eb_modal_basic_title: "Basic Information",
    eb_modal_basic_title_label: "Title (leave empty to clear)",
    eb_modal_basic_title_placeholder: "Enter title...",
    eb_modal_basic_desc_label: "Description (leave empty to clear)",
    eb_modal_basic_desc_placeholder:
      "Enter description... (use \\n for breaks)",
    eb_modal_basic_url_label: "URL - Title Link (leave empty to clear)",
    eb_modal_basic_url_placeholder: "https://example.com",
    eb_modal_author_title: "Author Information",
    eb_modal_author_name_label: "Author Name (leave empty to clear)",
    eb_modal_author_name_placeholder: "Enter name...",
    eb_modal_author_icon_label: "Icon URL (leave empty to clear)",
    eb_modal_author_icon_placeholder: "https://example.com/icon.png",
    eb_modal_author_url_label: "Author URL (leave empty to clear)",
    eb_modal_author_url_placeholder: "https://example.com",
    eb_modal_images_title: "Images",
    eb_modal_images_thumbnail_label: "Thumbnail (leave empty to clear)",
    eb_modal_images_thumbnail_placeholder: "https://example.com/thumbnail.png",
    eb_modal_images_image_label: "Banner Image (leave empty to clear)",
    eb_modal_images_image_placeholder: "https://example.com/banner.png",
    eb_modal_footer_title: "Footer",
    eb_modal_footer_text_label: "Footer Text (leave empty to clear)",
    eb_modal_footer_text_placeholder: "Enter text...",
    eb_modal_footer_icon_label: "Footer Icon (leave empty to clear)",
    eb_modal_footer_icon_placeholder: "https://example.com/icon.png",
    eb_modal_field_title: "Add Field",
    eb_modal_field_name_label: "Field Name",
    eb_modal_field_name_placeholder: "Enter name...",
    eb_modal_field_value_label: "Field Value",
    eb_modal_field_value_placeholder: "Enter value...",
    eb_modal_field_inline_label: "Inline? (yes/no)",
    eb_modal_field_inline_placeholder: "yes or no (default: yes)",
    eb_field_max_reached: "Maximum of 25 fields reached!",
    eb_color_select_title: "Select a color:",
    eb_color_set: "Color set to **{name}**",
    eb_empty_embed: "Embed must have title, description or fields!",
    eb_sent_success: "Embed sent to {channel}!",
    eb_send_error: "Error sending embed: {error}",
    eb_cancelled: "Builder cancelled.",
    eb_btn_import: "Import",
    eb_btn_export: "Export",
    eb_modal_import_title: "Import JSON",
    eb_modal_import_label: "Paste the embed JSON here",
    eb_modal_import_placeholder: '{"title": "My Embed", "description": "..."}',
    eb_import_success: "JSON imported successfully!",
    eb_import_error: "Error importing JSON: {error}",
    eb_export_title: "Export JSON",
    eb_export_description: "Copy the JSON below to save your embed:",
    eb_export_description_file:
      "JSON is too large! Download the attached file:",

    // Guild System
    guild_welcome_title: "🏰 Guild System",
    guild_welcome_desc:
      "**Welcome to Sheriff Rex Guild System!**\n\n" +
      "🤝 **What are Guilds?**\n" +
      "Guilds are groups of cowboys who band together to conquer the Old West!\n\n" +
      "✨ **Benefits:**\n" +
      "• Play and work as a team\n" +
      "• Gain XP and level up as a guild\n" +
      "• Conquer territories together\n" +
      "• Exclusive guild chat\n" +
      "• Rankings and special rewards\n\n" +
      "💰 **Cost to create:**\n" +
      "• 1000 🎫 Saloon Tokens\n\n" +
      "🎯 **How to get started?**\n" +
      "Choose one of the options below:",
    guild_footer: "🤠 Sheriff Rex • Guild System",
    guild_btn_create: "Create Guild",
    guild_btn_join: "Join Guild",
    guild_btn_info: "Information",
    guild_btn_members: "Members",
    guild_btn_leave: "Leave",
    guild_leader: "👑 Leader",
    guild_members: "👥 Members",
    guild_level: "⭐ Level",
    guild_xp: "📊 Guild XP",
    guild_type: "🔓 Type",
    guild_type_public: "Public",
    guild_type_private: "Private",
    guild_created: "📅 Created at",
    guild_role_leader: "Your role: 👑 Leader",
    guild_role_member: "Your role: 👤 Member",
    guild_not_your_interaction: "❌ This interaction is not yours!",
    guild_no_guilds: "❌ No guilds available at the moment!",
    guild_select_placeholder: "Choose a guild",
    guild_select_guild: "🏰 Choose a guild to join:",
    guild_not_found: "❌ Guild not found!",
    guild_timeout: "⏱️ Time ran out! Try again.",
    guild_request_title: "📬 New Guild Join Request",
    guild_request_desc: "**{user}** wants to join your guild **{guild}**!",
    guild_request_user: "👤 User",
    guild_request_guild: "🏰 Guild",
    guild_request_approve: "Accept",
    guild_request_reject: "Decline",
    guild_request_dm_error:
      "⚠️ Could not send DM to leader. Request was created!",
    guild_request_not_found: "❌ Request not found!",
    guild_request_approved_title: "✅ Request Approved",
    guild_request_error: "❌ Error Processing Request",
    guild_request_accepted_title: "🎉 You were accepted to the guild!",
    guild_request_accepted_desc:
      "Congratulations! You are now part of the **{guild}** guild!",
    guild_request_rejected_title: "📝 Request Declined",
    guild_request_denied_title: "❌ Request Denied",
    guild_request_denied_desc:
      "Your request to join the **{guild}** guild was declined by the leader.",
    guild_create_title: "Create New Guild",
    guild_create_name: "Guild Name",
    guild_create_description: "Guild Description",
    guild_create_privacy: "Type (public or private)",
    guild_invalid_privacy:
      '❌ **Invalid type!**\n\nType only "**public**" or "**private**" in the guild type field.',
    guild_created_title: "✅ Guild Created!",
    guild_name: "Name",
    guild_description: "Description",
    guild_members_title: "👥 {guild} Members",
    guild_joined: "Joined",
    guild_no_members: "No members found.",
    guild_stats: "📊 Statistics",
    guild_total: "Total",
    guild_left_title: "✅ You left the guild!",
    guild_error: "❌ Error",

    // Server Setup Command (criaservidor)
    server_setup_title: "🏛️ Professional Server Setup",
    server_setup_analyzing: "🤠 Sheriff Rex is working...",
    server_setup_analyzing_desc:
      "Analyzing your request and planning the server structure...",
    server_setup_planning: "📋 Server Structure Plan",
    server_setup_creating: "*Creating now...*",
    server_setup_cleanup_title: "🧹 Server Cleanup",
    server_setup_cleanup_desc:
      "Do you want to clean up existing channels/roles/categories before creating the new structure?",
    server_setup_cleanup_warning:
      "⚠️ **WARNING:** This will **PERMANENTLY DELETE**:\n• All channels (except this one)\n• All categories\n• All roles (except @everyone and bot roles)\n\n**This action is irreversible!**",
    server_setup_cleanup_confirm: "✅ Yes, Clean Everything",
    server_setup_cleanup_skip: "⏭️ No, Keep Existing",
    server_setup_cleaning: "🧹 Cleaning Server...",
    server_setup_cleaning_desc:
      "Removing existing channels, categories, and roles...",
    server_setup_cleaned: "✅ Server Cleaned!",
    server_setup_cleaned_desc:
      "Removed:\n• **{channels}** channels\n• **{categories}** categories\n• **{roles}** roles",
    server_setup_roles_label: "🎭 Roles to create",
    server_setup_categories_label: "📁 Categories",
    server_setup_channels_label: "💬 Total channels",
    server_setup_emojis_label: "😀 Custom emojis",
    server_setup_success_title: "✅ Server Setup Complete!",
    server_setup_success_desc:
      "Sheriff Rex has set up your server, partner! 🤠",
    server_setup_roles_created: "🎭 Roles Created",
    server_setup_categories_created: "📁 Categories Created",
    server_setup_channels_created: "💬 Channels Created",
    server_setup_emojis_created: "😀 Emojis Added",
    server_setup_errors: "⚠️ Warnings",
    server_setup_requested_by: "Requested by {user}",
    server_setup_error_title: "❌ Error Creating Server Structure",
    server_setup_error_footer:
      "Try rephrasing your request or contact an admin",
    server_setup_no_description: "None",
    server_setup_and_more: "... and {count} more",
    server_setup_none: "None",
    server_setup_timeout: "⏰ Timeout",
    server_setup_timeout_desc: "You didn't respond in time. Setup cancelled.",
    server_setup_try_again: "Use /criaservidor again to try",
    server_setup_cancelled: "❌ Setup Cancelled",
    server_setup_cancelled_desc: "Server setup was cancelled by user.",
    server_setup_ai_error:
      "AI returned invalid JSON. Please try rephrasing your request.",
    server_setup_invalid_structure:
      "Invalid structure from AI. Missing roles or categories.",

    warehouse_title: "State Warehouse",
    warehouse_desc:
      "Shared marketplace where everyone can sell and buy resources!",
    warehouse_stats_hourly: "Last Hour Statistics:",
    warehouse_stock_prices: "Stock & Prices",
    warehouse_movement: "Movement (1h)",
    warehouse_total_value: "Total Stock Value",
    warehouse_stock: "Stock",
    warehouse_units: "units",
    warehouse_you_sell: "You sell for",
    warehouse_you_buy: "You buy for",
    warehouse_each: "each",
    warehouse_sold: "sold",
    warehouse_bought: "bought",
    warehouse_no_resources: "No resources available",
    warehouse_no_movement: "No movement",
    warehouse_last_update: "Last update",
    warehouse_next_update: "Next in 1 hour",
    warehouse_btn_sell: "Sell",
    warehouse_btn_buy: "Buy",
    warehouse_btn_refresh: "Refresh",
    warehouse_btn_back: "Back",
    warehouse_sell_menu: "Select the resource you want to sell:",
    warehouse_buy_menu: "Select the resource you want to buy:",
    warehouse_available: "available",
    warehouse_in_stock: "in stock",
    warehouse_sell_for: "Sell for",
    warehouse_buy_for: "Buy for",
    warehouse_select_placeholder_sell: "Choose resource to sell",
    warehouse_select_placeholder_buy: "Choose resource to buy",
    warehouse_no_items: "You don't have {resource} to sell!",
    warehouse_out_of_stock:
      "No {resource} in stock! Wait for other players to sell.",
    warehouse_sell_title: "Sell {resource}",
    warehouse_buy_title: "Buy {resource}",
    warehouse_you_have: "You have",
    warehouse_available_stock: "Available stock",
    warehouse_price: "Price",
    warehouse_enter_amount:
      'Enter the quantity you want to {action} (or "cancel" to go back):',
    warehouse_action_sell: "sell",
    warehouse_action_buy: "buy",
    warehouse_invalid_amount: "Invalid quantity! Enter a valid number.",
    warehouse_insufficient_items:
      "You don't have {amount} units of {resource}!",
    warehouse_insufficient_stock:
      "Not enough {amount} units available! Current stock: {stock} units.",
    warehouse_insufficient_silver:
      "You don't have enough Silver Coins!\nNeeded: **{needed}**\nYou have: **{current}**",
    warehouse_error_processing:
      "Error processing {action}. Insufficient stock.",
    warehouse_sale_complete: "Sale Complete - State Warehouse",
    warehouse_sale_success: "You sold **{amount}x** {resource}!",
    warehouse_unit_price: "Unit price",
    warehouse_total_received: "Total received: {amount} Silver Coins",
    warehouse_sale_confirmed: "Sale confirmed!",
    warehouse_sold_items: "{amount}x {resource} sold",
    warehouse_received_dm: "You received **{amount} Silver Coins** in DM!",
    warehouse_purchase_confirmed: "Purchase confirmed!",
    warehouse_bought_items: "{amount}x {resource} bought",
    warehouse_total_paid: "Total paid: **{amount} Silver Coins**",
    warehouse_added_inventory: "Resources have been added to your inventory!",
    warehouse_timeout: "Timeout! Use `/armazem` again.",
    warehouse_cancelled: "cancelled.",

    ai_cooldown:
      "Whoa there, partner! Give me {time} seconds to catch my breath before ya ask another question!",
    ai_not_configured:
      "**OpenRouter API is not configured**\n\nThe bot administrator needs to set up the `OPENROUTER_API_KEY` environment variable.\n\nGet your API key at: https://openrouter.ai/keys",
    ai_response: "AI Response:",
    ai_sheriff_title: "Sheriff Rex",
    ai_model_footer: "Model: {model} | Asked by {user}",
    ai_error: "Error:",
    ai_powered_by: "Powered by OpenRouter",

    models_description: "List available AI models from OpenRouter",
    models_free_option: "Show only free models",
    models_not_configured:
      "**OpenRouter API is not configured**\n\nThe bot administrator needs to set up the `OPENROUTER_API_KEY` environment variable.\n\nGet your API key at: https://openrouter.ai/keys",
    models_no_models: "No models found matching your criteria.",
    models_title: "Available AI Models",
    models_title_free: "Available AI Models (Free Only)",
    models_showing: "Showing {shown} of {total} models",
    models_use_with_ai: "Use these model IDs with the `/ai` command.",
    models_free: "FREE",
    models_price: "${price}/1M input tokens",
    models_context: "Context: {tokens} tokens",
    models_more_title: "More Models",
    models_more_desc:
      "There are {count} more models available. Visit https://openrouter.ai/models to see all models.",
    models_error: "Error:",
  },
  "es-ES": {
    cooldown:
      "¡Tranquilo, vaquero! Hasta los caballos necesitan siesta. ¡Vuelve en {time}! 🐴",
    error: "¡Caramba, compadre! Mi caballo tropezó y tiró todo... 🤠",
    inventory_full:
      "¡Oye vaquero! ¿Llevas el rancho entero en la espalda? ¡Libera espacio! 🎒",

    // Ping Command
    ping_pong: "🏓 ¡Pong!",
    ping_latency: "Latencia del Bot",
    ping_api_latency: "Latencia de la API",
    ping_uptime: "Tiempo en Línea",
    ping_status: "Estado",
    ping_calculating: "🏓 Calculando latencia...",
    ping_excellent: "✅ Excelente",
    ping_good: "🟢 Bueno",
    ping_medium: "🟡 Medio",
    ping_slow: "🟠 Lento",
    ping_critical: "🔴 Crítico",

    // Daily Command
    daily_title: "Recompensa Diaria",
    daily_already_claimed:
      "¡Ya reclamaste tu recompensa diaria!\n\n**Tiempo restante:** {time}\n**Racha actual:** {streak} día{plural}",
    daily_come_back: "¡Vuelve mañana!",
    daily_failed_title: "Recompensa Diaria Falló",
    daily_inventory_too_full:
      "{error}\n\n¡Tu inventario está muy lleno para reclamar esta recompensa!",
    daily_free_space: "¡Libera espacio e inténtalo de nuevo!",
    daily_streak_broken: "¡Tu racha se rompió! Empezando de nuevo.",
    daily_claimed_success: "¡Recompensa diaria reclamada con éxito!",
    daily_comeback_24h: "¡Vuelve en 24 horas!",
    daily_field_silver: "Monedas de Plata",
    daily_field_tokens: "Fichas Saloon",
    daily_field_xp: "XP Ganado",
    daily_field_streak: "Racha",
    daily_field_bonus: "Bonificación",
    daily_day: "día",
    daily_days: "días",

    // Automatic Daily Rewards
    auto_daily_reward_title: "🌟 ¡Recompensas Diarias Entregadas!",
    auto_daily_reward_desc:
      "*¡El sheriff pasó por el pueblo y dejó un regalo para ti!*\n\n" +
      "╭─────────────────╮\n" +
      "│ {token} **{tokenAmount}** Fichas Saloon\n" +
      "│ {gold} **{goldAmount}** Barras de Oro\n" +
      "│ 🎟️ **{sealAmount}** Sellos\n" +
      "╰─────────────────╯\n\n" +
      "*Tus recompensas han sido agregadas a tu inventario.*",
    auto_daily_reward_footer:
      "Próximas recompensas mañana a las {hour}:00 • Sheriff Rex",
    auto_daily_inventory_full_title: "⚠️ ¡Inventario Lleno!",
    auto_daily_inventory_full_desc:
      "*¡El sheriff intentó entregar tus recompensas, pero tu mochila está llena!*\n\n" +
      "**📦 Espacio necesario:** ~{needed}kg\n" +
      "**📦 Espacio disponible:** {available}kg\n\n" +
      "*Vende u organiza objetos para liberar espacio y recibir tus recompensas.*",
    auto_daily_inventory_full_footer: "Usa /inventory para ver tus objetos • Sheriff Rex",

    // Inventory Command
    inventory_private_title: "Inventario Privado",
    inventory_private_desc:
      "Por razones de privacidad, solo puedes ver tu propio inventario.",
    inventory_private_footer: "Usa /inventory sin parámetros para ver el tuyo",
    inventory_title: "Mochila de {username}",
    inventory_subtitle:
      "Gestiona tus objetos, monedas y espacio de inventario.",
    inventory_currency: "Monedas",
    inventory_stats: "Estadísticas del Inventario",
    inventory_stats_items:
      "**Objetos:** {items}\n**Tipos:** {types}/50\n**Peso:** {weight}kg / {maxWeight}kg",
    inventory_items: "Objetos en la Mochila",
    inventory_empty:
      "*Tu mochila está vacía. ¡Empieza a trabajar o minar para recolectar objetos!*",
    inventory_capacity: "Capacidad de Peso",
    inventory_next_upgrade:
      "\n💡 **Próxima Mejora:** {capacity}kg por **${price}** en la tienda",
    inventory_max_capacity: "\n✨ **¡Capacidad máxima alcanzada!**",
    inventory_nearly_full_warning:
      "⚠️ ¡Tu mochila está casi llena! Usa /give para transferir objetos o mejora tu capacidad.",
    inventory_full_warning:
      "🚨 ¡MOCHILA LLENA! No puedes recolectar más objetos hasta que liberes espacio.",
    inventory_transfer_hint:
      "Usa /give para transferir objetos a otros jugadores",

    // Profile Command
    profile_edit_bio: "Editar Bio",
    profile_change_bg: "Cambiar Fondo",
    profile_shop_bg: "Tienda de Fondos",
    profile_level: "Nivel",
    profile_about_me: "Sobre Mí",
    profile_no_bio: "Aún no hay biografía...",

    mine_cooldown: "¡Estás muy cansado para minar! Vuelve en: **{time}**",
    mine_title: "MINERÍA DE ORO",
    mine_choose: "Elige tu método de minería:",
    mine_solo: "Minería Solo",
    mine_solo_desc:
      "Duración: 50 minutos\nRecompensa: 1-3 Barras de Oro\nRiesgo: Bajo",
    mine_coop: "Minería Cooperativa",
    mine_coop_desc:
      "Duración: 2 horas\nRecompensa: 4-6 Barras de Oro (divididas)\nRiesgo: Alto",
    mine_gold_value: "1 Barra de Oro = {value} Monedas de Plata",
    mine_progress: "Minando oro...",
    mine_success: "¡Minaste {amount} Barra(s) de Oro!",
    mine_value: "Valor",
    mine_next: "Próxima Minería",
    mine_good_work: "¡Buen trabajo, compadre!",
    silver_coins: "Monedas de Plata",
    gold_bars: "Barras de Oro",
    wheat_item: "Trigo",
    honey_item: "Miel",
    weight: "Peso",
    time_minutes: "{min} minutos",
    time_hours: "{hours}h {min}m",

    // Redeem Command
    redeem_invalid_title: "Código Inválido",
    redeem_invalid_desc:
      "El código `{code}` no existe.\n\n¡Asegúrate de que lo copiaste correctamente de la tienda!",
    redeem_invalid_footer: "Compra productos en la tienda del sitio web",
    redeem_already_title: "Ya Canjeado",
    redeem_already_desc:
      "¡Este código ya fue usado!\n\n**Producto:** {product}\n**Canjeado el:** {date}",
    redeem_already_footer: "Cada código solo puede usarse una vez",
    redeem_processing: "Procesando tu compra...",
    redeem_upgrade_not_needed_title: "Mejora No Necesaria",
    redeem_upgrade_not_needed_desc:
      "¡Ya tienes una mochila con **{current}kg** de capacidad!\n\nEsta mejora es para **{target}kg**, que ya tienes o superaste.\n\n**Nota:** Tu código de canje **no fue consumido** y puede ser dado a otro jugador.",
    redeem_upgrade_not_needed_footer:
      "Considera comprar una mejora de nivel superior",
    redeem_success_title: "¡Código Canjeado Exitosamente!",
    redeem_success_desc:
      "¡Gracias por tu compra! 🎉\n\n**Producto:** {product}\n**Código:** `{code}`",
    redeem_success_footer: "¡Disfruta tus recompensas, compadre!",
    redeem_rewards: "Recompensas Recibidas",
    redeem_special_perks: "¡Ventajas especiales activadas!",
    redeem_vip_status: "Estado VIP",
    redeem_vip_activated:
      "¡Activado! Ahora tienes acceso a funciones exclusivas.",
    redeem_background: "Fondo Exclusivo",
    redeem_background_unlocked: "¡Desbloqueado! Úsalo en tu perfil.",
    redeem_backpack: "Mochila Mejorada",
    redeem_backpack_upgraded:
      "¡Tu capacidad de inventario ahora es **{capacity}kg**!",
    redeem_error_title: "Error de Canje",
    redeem_error_desc:
      "Ocurrió un error al procesar tu código.\n\nIntenta de nuevo o contacta al soporte si el problema persiste.",
    redeem_error_footer: "Los detalles del error han sido registrados",
    redeem_inventory_upgraded: "Inventario mejorado a **{capacity}kg**",

    // Help Command Translations (Spanish)
    help_title: "🤠 Sheriff Rex - Guía de Comandos",
    help_overview_desc:
      "**¡Bienvenido al Viejo Oeste!** Sheriff Rex es un bot completo con sistema de economía, juegos, minería y mucho más.\n\n📱 **Soporte MP:** ¡Algunos comandos funcionan en mensajes privados!\n🎮 **34 Comandos Disponibles**\n\n**Selecciona una categoría abajo para ver los comandos:**",
    help_footer: "🌵 Usa los botones para navegar entre categorías",
    help_btn_economy: "💰 Economía",
    help_btn_gambling: "🎲 Apuestas",
    help_btn_mining: "⛏️ Minería",
    help_btn_profile: "👤 Perfil",
    help_btn_bounty: "🔫 Recompensas",
    help_btn_admin: "⚙️ Admin",
    help_btn_utility: "🔧 Utilidad",
    help_btn_home: "🏠 Menú Inicial",
    help_btn_support: "🆘 Soporte",
    help_btn_invite: "➕ Agregar Bot",
    help_btn_website: "🌐 Sitio Web",
    help_only_user: "❌ ¡Solo quien usó el comando puede navegar!",

    // Category Titles (Spanish)
    help_economy_title: "💰 Economía & Trading",
    help_gambling_title: "🎲 Apuestas & Juegos",
    help_mining_title: "⛏️ Sistema de Minería",
    help_profile_title: "👤 Perfil & Personalización",
    help_bounty_title: "🔫 Sistema de Recompensas",
    help_admin_title: "⚙️ Administración del Servidor",
    help_utility_title: "🔧 Comandos de Utilidad",

    // Category Descriptions (Spanish)
    help_economy_desc:
      "**Sistema económico completo con monedas, objetos y transferencias.**\n\n🪙 **Monedas de Plata** - Moneda principal del servidor\n🥇 **Barras de Oro** - Objetos valiosos (1 barra = 700 Plata)\n🎟️ **Fichas Saloon** - Moneda premium para personalizaciones\n💼 **Sistema de Mochila** - Sistema de mochila con mejoras",
    help_gambling_desc:
      "**¡Juegos de azar y apuestas del Viejo Oeste!**\n\n💰 Apuesta tus Monedas de Plata\n🎰 Múltiples juegos disponibles\n🤝 Juegos solo y cooperativos\n⚠️ ¡Juega responsablemente!",
    help_mining_desc:
      "**¡Mina en las montañas del Viejo Oeste!**\n\n🥇 Encuentra valiosas Barras de Oro\n💎 Descubre minerales raros\n🤝 Mina solo o en pareja\n⏰ Tiempos de espera estratégicos",
    help_profile_desc:
      "**¡Personaliza tu perfil del Viejo Oeste!**\n\n🎨 Fondos personalizables\n📊 Sistema de XP y Niveles\n🖼️ Tarjetas de perfil visuales\n✨ Efecto glassmorphism",
    help_bounty_desc:
      "**¡Caza de recompensas en el Viejo Oeste!**\n\n💀 Coloca recompensas en jugadores\n🎯 Captura criminales buscados\n💰 Gana recompensas en Plata\n⚖️ Sistema de justicia western",
    help_admin_desc:
      "**¡Comandos exclusivos para administradores!**\n\n🛡️ Requiere permisos de admin\n🎛️ Configuraciones del servidor\n💸 Gestión de economía\n📢 Sistema de anuncios avanzado",
    help_utility_desc:
      "**¡Herramientas útiles e información del bot!**\n\n📊 Estado e información\n🌐 Configuraciones generales\n❓ Ayuda y soporte\n⚡ Rendimiento",

    // Territories Command
    territories_price: "Precio",
    territories_rarity: "Rareza",
    territories_status: "Estado",
    territories_owned: "POSEE",
    territories_available: "Disponible",
    territories_insufficient: "Fondos Insuficientes",
    territories_benefits: "Beneficios",
    territories_footer:
      "Territorio {current} de {total} • Posees {owned}/{total} territorios",
    territories_prev: "Anterior",
    territories_next: "Siguiente",
    territories_buy: "Comprar por {price}k",
    territories_my_territories: "Mis Territorios",
    territories_close: "Cerrar",
    territories_not_yours: "¡Este navegador de territorios no es para ti!",
    territories_need_more:
      "¡Necesitas {amount} Monedas de Plata más para comprar este territorio!",
    territories_already_own: "¡Ya posees este territorio!",
    territories_transaction_failed: "¡Transacción fallida! Inténtalo de nuevo.",
    territories_purchase_failed:
      "¡Compra fallida! Tu plata ha sido reembolsada.",
    territories_purchased_title: "¡TERRITORIO COMPRADO!",
    territories_purchased_desc:
      "¡Felicidades! Ahora eres el orgulloso propietario de **{name}**!",
    territories_amount_paid: "Monto Pagado",
    territories_remaining_balance: "Saldo Restante",
    territories_benefits_unlocked: "Beneficios Desbloqueados",
    territories_now_own: "¡Ahora posees {count} territorios!",
    territories_my_title: "TUS TERRITORIOS",
    territories_no_territories: "Aún no posees ningún territorio.",
    territories_statistics: "Estadísticas",
    territories_owned_count:
      "**Poseídos:** {owned}/{total}\n**Completado:** {percentage}%",
    territories_keep_expanding: "¡Sigue expandiendo tu imperio!",
    territories_browser_closed:
      "Navegador de territorios cerrado. ¡Vuelve cuando quieras, compadre!",

    // Territory Rarities
    rarity_common: "Común",
    rarity_rare: "Raro",
    rarity_epic: "Épico",
    rarity_legendary: "Legendario",

    // Bounty Commands
    bounty_invalid_target: "Objetivo Inválido",
    bounty_cant_target_bot:
      "¡No puedes poner una recompensa en un bot, compañero!",
    bounty_choose_real_outlaw: "Elige un forajido real",
    bounty_self_not_allowed: "Auto-Recompensa No Permitida",
    bounty_cant_target_self: "¡No puedes poner una recompensa en ti mismo!",
    bounty_mighty_strange: "Eso sería muy extraño, compañero",
    bounty_already_active: "Recompensa Ya Activa",
    bounty_user_has_bounty:
      "**{user}** ya tiene una recompensa activa!\n\n**Recompensa Actual:** {amount}",
    bounty_wait_cleared:
      "Espera hasta que se elimine antes de colocar una nueva",
    bounty_insufficient_funds: "Fondos Insuficientes",
    bounty_not_enough_silver:
      "¡No tienes suficientes Monedas de Plata!\n\n**Requerido:** {required}\n**Tienes:** {current}",
    bounty_earn_more: "Gana más plata primero",
    bounty_transaction_failed: "Transacción Fallida",
    bounty_could_not_deduct: "No se pudieron deducir Monedas de Plata: {error}",
    bounty_try_again: "Por favor, inténtalo de nuevo",
    bounty_placed: "¡Recompensa Colocada!",
    bounty_now_wanted: "¡**{user}** ahora está BUSCADO!",
    bounty_hunters_can_capture:
      "¡Los cazarrecompensas ahora pueden capturar a este forajido!",
    bounty_target: "🎯 Objetivo",
    bounty_reward: "Recompensa",
    bounty_posted_by: "👤 Publicado Por",
    bounty_reason: "**Razón:** {reason}",
    bounty_server_only: "Solo en Servidor",
    bounty_command_server_only:
      "¡Este comando solo se puede usar en un servidor!",
    bounty_try_in_server: "Intenta usar este comando en un servidor",
    bounty_not_in_server: "Forajido No Está en el Servidor",
    bounty_user_not_here:
      "¡**{user}** no está en este servidor!\n\nSolo puedes capturar forajidos que estén actualmente en el servidor.",
    bounty_must_be_present:
      "El forajido debe estar presente para ser capturado",
    bounty_capture_cooldown: "Tiempo de Espera de Captura",
    bounty_need_rest:
      "¡Necesitas descansar antes de intentar otra captura!\n\n**Tiempo restante:** {minutes} minutos",
    bounty_hunting_exhausting: "Cazar recompensas es un trabajo agotador",
    bounty_no_bounty_found: "No Se Encontró Recompensa",
    bounty_user_not_wanted:
      "¡**{user}** no tiene una recompensa activa!\n\nNo está buscado ahora.",
    bounty_see_active: "Usa /bounties para ver recompensas activas",
    bounty_outlaw_escaped: "💨 ¡Forajido Escapó!",
    bounty_managed_escape:
      "¡**{user}** logró escapar!\n\nEl forajido se escabulló por tus dedos y huyó al desierto.",
    bounty_better_luck: "¡Mejor suerte la próxima vez, compañero!",
    bounty_lost_reward: "💰 Recompensa Perdida",
    bounty_success_rate: "📊 Tasa de Éxito",
    bounty_capture_failed: "Captura Fallida",
    bounty_inventory_full:
      "¡Tu inventario está demasiado lleno para llevar la recompensa!\n\n**Error:** {error}",
    bounty_free_space_try: "Libera espacio e inténtalo de nuevo",
    bounty_outlaw_captured: "🎯 ¡Forajido Capturado!",
    bounty_hunter_captured:
      "¡**{hunter}** capturó exitosamente a **{outlaw}**!\n\n¡La recompensa ha sido cobrada!",
    bounty_justice_prevails: "¡La justicia prevalece en el Salvaje Oeste!",
    bounty_hunter: "👤 Cazador",
    bounty_outlaw: "🎯 Forajido",
    bounty_permission_denied: "Permiso Denegado",
    bounty_admin_only: "¡Solo los administradores pueden eliminar recompensas!",
    bounty_contact_admin: "Contacta a un administrador del servidor",
    bounty_user_no_bounty: "**{user}** no tiene una recompensa activa.",
    bounty_nothing_to_clear: "Nada que eliminar",
    bounty_cleared: "🚫 Recompensa Eliminada",
    bounty_admin_cleared:
      "La recompensa en **{user}** ha sido eliminada por un administrador.",
    bounty_no_longer_wanted: "El forajido ya no está buscado",
    bounty_amount_cleared: "💰 Cantidad Eliminada",
    bounty_cleared_by: "⚙️ Eliminado Por",
    bounty_no_active: "No Hay Recompensas Activas",
    bounty_west_peaceful:
      "¡El Salvaje Oeste está tranquilo hoy!\n\nNo hay forajidos buscados actualmente.",
    bounty_use_wanted: "Usa /wanted para colocar una recompensa",
    bounty_no_outlaws_server: "No Hay Forajidos en el Servidor",
    bounty_all_fled:
      "¡No hay forajidos buscados actualmente en este servidor!\n\nTodos los forajidos han huido.",
    bounty_most_wanted: "**Forajidos Más Buscados:**",
    bounty_contributors: "Contribuyentes",
    bounty_more_outlaws: "*...y {count} forajidos más*",
    bounty_active_bounties: "Recompensas Activas",
    bounty_total_bounties: "Total de Recompensas",
    bounty_total_rewards: "Recompensas Totales",
    bounty_hunt_claim: "¡Caza forajidos y reclama recompensas con /capture!",
    bounty_general_mischief: "Travesuras y caos general",

    // Wanted Poster Canvas Translations
    wanted_poster_title: "BUSCADO",
    wanted_poster_reward: "RECOMPENSA",
    wanted_poster_dead_or_alive: "VIVO O MUERTO",
    wanted_poster_silver: "PLATA",

    // Give Command
    give_invalid_recipient: "Destinatario Inválido",
    give_cant_give_bots: "¡No puedes dar objetos a bots, compañero!",
    give_choose_real_player: "Elige un jugador real",
    give_self_transfer: "Auto-Transferencia No Permitida",
    give_cant_give_self: "¡No puedes darte objetos a ti mismo!",
    give_mighty_strange: "Eso sería muy extraño",
    give_transfer_failed: "Transferencia Fallida",
    give_check_inventory: "Verifica tu inventario e inténtalo de nuevo",
    give_transfer_success: "¡Transferencia Exitosa!",
    give_you_gave: "Diste {amount} a **{user}**",
    give_from: "De",
    give_to: "Para",
    give_item: "Objeto",
    give_quantity: "Cantidad",
    give_generosity: "¡La generosidad es una virtud de cowboy!",

    // Dice Command
    dice_specify_all:
      "❌ ¡Por favor, especifica oponente, apuesta y predicción!",
    dice_cant_challenge_bot:
      "❌ ¡No puedes desafiar a un bot a un juego de dados, compañero!",
    dice_cant_challenge_self: "❌ ¡No puedes desafiarte a ti mismo, compañero!",
    dice_cooldown_wait:
      "⏰ ¡Espera! Espera {seconds} segundos más antes de desafiar de nuevo.",
    dice_opponent_cooldown:
      "⏰ ¡{user} todavía se está recuperando de su último duelo! Necesita {seconds} segundos más.",
    dice_already_active:
      "❌ ¡Uno de ustedes ya está en un juego de dados activo!",
    dice_not_enough_tokens:
      "❌ ¡No tienes suficientes fichas! Tienes {current} Fichas Saloon pero intentaste apostar {bet} Fichas Saloon.",
    dice_opponent_not_enough:
      "❌ ¡{user} no tiene suficientes fichas para esta apuesta! Solo tiene {current} Fichas Saloon.",
    dice_challenge_title: "🎲 ¡DESAFÍO DE DADOS!",
    dice_challenge_desc:
      "**{challenger}** ha desafiado a **{opponent}** a un duelo de dados!\n\n🎫 **Apuesta:** {bet} Fichas Saloon\n🎯 **Predicción de {challenger}:** {guess}\n\n{opponent}, elige tu predicción (2-12) abajo!",
    dice_time_limit: "⏰ Tiempo Límite",
    dice_time_accept: "30 segundos para aceptar",
    dice_winner_takes_all: "🏆 El Ganador se Lleva Todo",
    dice_total_tokens: "{total} Fichas Saloon en total",
    dice_choose_wisely: "¡Elige sabiamente, compañero!",
    dice_challenged: "¡{user}, has sido desafiado a un duelo de dados!",
    dice_tie_title: "🎲 DUELO DE DADOS - ¡EMPATE!",
    dice_tie_desc:
      "**¡Es un empate!** ¡Ambos jugadores estaban igualmente cerca!\n\n🎲 Dados: {dice1} + {dice2} = **{total}**",
    dice_challenger_guess: "Predicción de {user}",
    dice_opponent_guess: "Predicción de {user}",
    dice_diff: "{guess} (dif: {diff})",
    dice_result: "Resultado",
    dice_bets_returned: "Apuestas devueltas a ambos jugadores",
    dice_perfectly_balanced:
      "¡Sin ganadores, sin perdedores - perfectamente equilibrado!",
    dice_inventory_full_title: "🎲 DUELO DE DADOS - ¡INVENTARIO LLENO!",
    dice_winner_inventory_full:
      "**{winner}** ganó pero su inventario está demasiado pesado!\n\n🎲 Dados: {dice1} + {dice2} = **{total}**\n\n🚫 ¡{winner} no pudo cargar el premio! La apuesta se devuelve a {loser}.",
    dice_clean_inventory: "¡Limpia tu inventario antes de duelo!",
    dice_results_title: "🎲 ¡RESULTADOS DEL DUELO DE DADOS!",
    dice_showed: "🎲 Los dados mostraron: {dice1} + {dice2} = **{total}**",
    dice_winner_wins: "🏆 **¡{winner} gana {total} Fichas Saloon!**",
    dice_winner_guess_label: "🎯 Predicción de {user}",
    dice_loser_guess_label: "❌ Predicción de {user}",
    dice_difference: "{guess} (diferencia: {diff})",
    dice_tokens_label: "🎫 Fichas de {user}",
    dice_tokens_amount: "{amount} Fichas Saloon",
    dice_called_closest: "¡{user} estuvo más cerca!",
    dice_challenge_expired: "⏰ Desafío Expirado",
    dice_no_response:
      "{user} no respondió a tiempo. El desafío ha sido cancelado.",
    dice_better_luck: "¡Mejor suerte la próxima vez!",

    // Roulette Command
    roulette_specify_both:
      "❌ ¡Por favor, especifica el monto de la apuesta y el tipo de apuesta!",
    roulette_must_specify_number:
      "❌ ¡Debes especificar un número cuando apuestas a un número específico!",
    roulette_cooldown:
      "⏰ ¡Espera! Espera {time} segundos más antes de girar nuevamente.",
    roulette_already_active: "❌ ¡Ya tienes un juego de ruleta activo!",
    roulette_insufficient_tokens:
      "❌ ¡No tienes suficientes fichas! Tienes {current} {emoji} pero intentaste apostar {bet} {emoji}.",
    roulette_title_spinning: "RULETA DEL SALOON - ¡Girando la Rueda!",
    roulette_your_bet: "TU APUESTA",
    roulette_bet_amount: "Monto",
    roulette_bet_type: "Tipo",
    roulette_spinning: "La rueda está girando...",
    roulette_determining: "Determinando tu destino...",
    roulette_good_luck: "¡Buena suerte, compañero!",
    roulette_title_win: "RULETA - ¡GANASTE!",
    roulette_title_loss: "RULETA - ¡Perdiste!",
    roulette_result: "RESULTADO",
    roulette_ball_landed: "La bola cayó en:",
    roulette_bet_won: "¡Tu apuesta en {bet} ganó!",
    roulette_bet_lost: "Tu apuesta en {bet} no ganó.",
    roulette_winnings: "Ganancias",
    roulette_profit: "Ganancia",
    roulette_loss: "Pérdida",
    roulette_new_balance: "Nuevo Saldo",
    roulette_congratulations: "¡Felicitaciones, compañero!",
    roulette_better_luck: "¡Mejor suerte la próxima vez, compañero!",
    roulette_bet_red: "Rojo",
    roulette_bet_black: "Negro",
    roulette_bet_number: "Número Específico",
    roulette_bet_even: "Par",
    roulette_bet_odd: "Impar",
    roulette_bet_low: "Bajo (1-18)",
    roulette_bet_high: "Alto (19-36)",
    roulette_ui_title: "RULETA DEL SALOON",
    roulette_ui_welcome: "BIENVENIDO A LA RULETA",
    roulette_ui_balance: "Tu Saldo",
    roulette_ui_step1: "1️⃣ Elige el tipo de apuesta",
    roulette_ui_step1_desc: "Haz clic en uno de los botones arriba",
    roulette_ui_step2: "2️⃣ Selecciona el monto",
    roulette_ui_step2_desc: "Usa el menú abajo",
    roulette_ui_step3: "3️⃣ Gira la ruleta",
    roulette_ui_step3_desc: 'Haz clic en el botón "GIRAR"',
    roulette_select_amount: "💰 Selecciona el monto de la apuesta",
    roulette_ui_bet_selected: "Apuesta Seleccionada",
    roulette_ui_now_select_amount:
      "💰 Ahora selecciona el monto de la apuesta en el menú abajo",
    roulette_ui_ready: "¡LISTO PARA GIRAR!",
    roulette_ui_click_to_spin:
      "🎯 ¡Haz clic en el botón abajo para girar la ruleta!",
    roulette_ui_spin: "🎰 GIRAR RULETA",
    roulette_ui_not_selected: "No seleccionado",
    roulette_ui_select_bet_type: "Ahora elige el tipo de apuesta arriba",
    roulette_enter_number: "Ingresa un número (0-36):",
    roulette_invalid_number:
      "❌ ¡Número inválido! Por favor, ingresa un número entre 0 y 36.",

    // Music Command
    music_need_voice_channel:
      "❌ ¡Necesitas estar en un canal de voz para reproducir música!",
    music_searching: "🔍 Buscando tu canción...",
    music_not_found:
      "❌ No encontré esa canción. Intenta de nuevo con un término diferente.",
    music_now_playing: "🎵 Reproduciendo Ahora",
    music_added_to_queue: "➕ Añadido a la Cola",
    music_nothing_playing: "❌ ¡No hay nada reproduciéndose en este momento!",
    music_paused: "⏸️ ¡Música pausada!",
    music_could_not_pause: "❌ No se pudo pausar la música.",
    music_resumed: "▶️ ¡Música reanudada!",
    music_could_not_resume: "❌ No se pudo reanudar la música.",
    music_skipped: "⏭️ ¡Canción saltada!",
    music_could_not_skip: "❌ No se pudo saltar la canción.",
    music_stopped: "⏹️ ¡Música detenida y cola limpiada!",
    music_queue_empty: "❌ ¡La cola está vacía!",
    music_queue_title: "🎵 Cola de Música",
    music_now_playing_label: "🎵 Reproduciendo Ahora",
    music_up_next: "📋 Próximas",
    music_and_more: "Y {count} canción(es) más...",
    music_loop_song_enabled: "🔂 ¡Loop activado para la canción actual!",
    music_loop_disabled: "🔂 ¡Loop desactivado!",
    music_loop_queue_enabled: "🔁 ¡Loop de cola activado!",
    music_volume_set: "🔊 ¡Volumen ajustado a {volume}%!",
    music_status_playing: "Reproduciendo",
    music_status_paused: "Pausado",
    music_loop_mode_song: "🔂 Loop: Canción",
    music_loop_mode_queue: "🔁 Loop: Cola",
    music_loop_mode_normal: "➡️ Normal",
    music_requested_by: "👤 Solicitado Por",
    music_queue_count: "📋 Cola",
    music_duration: "⏱️ Duración",
    music_volume: "🔊 Volumen",
    music_status: "▶️ Estado",
    music_use_buttons:
      "Usa los botones de abajo para controlar la reproducción",
    music_songs: "canción(es)",
    music_position_in_queue: "📊 Posición en la Cola",
    music_btn_pause_resume: "⏸️ Pausar/Reanudar",
    music_btn_skip: "⏭️ Saltar",
    music_btn_loop: "🔂 Bucle",
    music_btn_queue: "📋 Cola",
    music_btn_stop: "⏹️ Detener",
    music_btn_volume_down: "🔉 -10%",
    music_btn_volume_up: "🔊 +10%",
    music_more_songs: "+{count} canción(es) más",

    // Poll Command
    poll_title_create: "Votación",
    poll_title_quick: "Votación Rápida",
    poll_created_by: "¡creó una votación!",
    poll_question_label: "Pregunta",
    poll_duration_label: "Duración",
    poll_multiple_choice_label: "Opción múltiple",
    poll_yes_option: "Sí",
    poll_no_option: "No",
    poll_maybe_option: "Tal vez",
    poll_vote_now: "¡Vota ahora!",
    poll_wants_opinion: "¡quiere tu opinión!",
    poll_system_footer: "Sistema de Votaciones",
    poll_quick_footer: "Votación Rápida",
    poll_hour: "hora",
    poll_hours: "horas",

    // Announcement System
    announce_title: "Sistema de Anuncios",
    announce_preview: "Vista Previa del Anuncio",
    announce_confirm: "Confirmar Envío",
    announce_cancel: "Cancelar",
    announce_success: "¡Anuncio Enviado!",
    announce_sent_to: "Anuncio enviado a",
    announce_author: "Autor",
    announce_channel: "Canal",
    announce_template_saved: "¡Plantilla Guardada!",
    announce_template_deleted: "¡Plantilla Eliminada!",
    announce_no_templates: "No hay plantillas guardadas",
    announce_select_color: "Selecciona un color",

    // Welcome System
    welcome_title: "Sistema de Bienvenida",
    welcome_configured: "¡Bienvenida Configurada!",
    welcome_channel_set: "Canal de bienvenida configurado",
    welcome_message_set: "Mensaje personalizado definido",
    welcome_current_config: "Configuración Actual",
    welcome_status: "Estado",
    welcome_enabled: "Activado",
    welcome_disabled: "Desactivado",
    welcome_test_message: "Mensaje de Prueba",
    welcome_placeholders: "Marcadores Disponibles",
    welcome_placeholder_user: "{user} - Mención del usuario",
    welcome_placeholder_username: "{username} - Nombre del usuario",
    welcome_placeholder_server: "{server} - Nombre del servidor",
    welcome_removed: "Sistema de bienvenida eliminado",
    welcome_not_configured: "El sistema de bienvenida no está configurado",

    // Logs System
    logs_title: "Sistema de Registros",
    logs_configured: "¡Registros Configurados!",
    logs_channel_set: "Canal de registros configurado correctamente",
    logs_current_config: "Configuración Actual de Registros",
    logs_status: "Estado",
    logs_enabled: "Activado",
    logs_disabled: "Desactivado",
    logs_events_tracked: "Eventos Monitoreados",
    logs_member_join: "Entrada de miembros",
    logs_member_leave: "Salida de miembros",
    logs_message_delete: "Mensajes eliminados",
    logs_message_edit: "Mensajes editados",
    logs_removed: "Sistema de registros eliminado",
    logs_removed_description: "Los registros ya no se enviarán a ningún canal.",
    logs_not_configured: "El sistema de registros no está configurado",
  },
  fr: {
    cooldown:
      "Doucement, cowboy ! Même les chevaux ont besoin de repos. Reviens dans {time} ! 🐴",
    error: "Sacrebleu, partenaire ! Mon cheval a trébuché... 🤠",
    inventory_full:
      "Hé cowboy ! Tu portes tout le ranch sur ton dos ? Libère de l'espace ! 🎒",

    // Ping Command
    ping_pong: "🏓 Pong !",
    ping_latency: "Latence du Bot",
    ping_api_latency: "Latence de l'API",
    ping_uptime: "Temps en Ligne",
    ping_status: "Statut",
    ping_calculating: "🏓 Calcul de la latence...",
    ping_excellent: "✅ Excellent",
    ping_good: "🟢 Bon",
    ping_medium: "🟡 Moyen",
    ping_slow: "🟠 Lent",
    ping_critical: "🔴 Critique",

    // Daily Command
    daily_title: "Récompense Quotidienne",
    daily_already_claimed:
      "Vous avez déjà réclamé votre récompense quotidienne !\n\n**Temps restant:** {time}\n**Série actuelle:** {streak} jour{plural}",
    daily_come_back: "Revenez demain !",
    daily_failed_title: "Récompense Quotidienne Échouée",
    daily_inventory_too_full:
      "{error}\n\nVotre inventaire est trop plein pour réclamer cette récompense !",
    daily_free_space: "Libérez de l'espace et réessayez !",
    daily_streak_broken: "Votre série a été brisée ! Recommencer.",
    daily_claimed_success: "Récompense quotidienne réclamée avec succès !",
    daily_comeback_24h: "Revenez dans 24 heures !",
    daily_field_silver: "Pièces d'Argent",
    daily_field_tokens: "Jetons Saloon",
    daily_field_xp: "XP Gagné",
    daily_field_streak: "Série",
    daily_field_bonus: "Bonus",
    daily_day: "jour",
    daily_days: "jours",

    // Automatic Daily Rewards
    auto_daily_reward_title: "🌟 Récompenses Quotidiennes Livrées !",
    auto_daily_reward_desc:
      "*Le shérif est passé en ville et a laissé un cadeau pour vous !*\n\n" +
      "╭─────────────────╮\n" +
      "│ {token} **{tokenAmount}** Jetons Saloon\n" +
      "│ {gold} **{goldAmount}** Barres d'Or\n" +
      "│ 🎟️ **{sealAmount}** Sceaux\n" +
      "╰─────────────────╯\n\n" +
      "*Vos récompenses ont été ajoutées à votre inventaire.*",
    auto_daily_reward_footer:
      "Prochaines récompenses demain à {hour}:00 • Sheriff Rex",
    auto_daily_inventory_full_title: "⚠️ Inventaire Plein !",
    auto_daily_inventory_full_desc:
      "*Le shérif a essayé de livrer vos récompenses, mais votre sac à dos est plein !*\n\n" +
      "**📦 Espace nécessaire :** ~{needed}kg\n" +
      "**📦 Espace disponible :** {available}kg\n\n" +
      "*Vendez ou organisez des objets pour libérer de l'espace et recevoir vos récompenses.*",
    auto_daily_inventory_full_footer: "Utilisez /inventory pour voir vos objets • Sheriff Rex",

    // Inventory Command
    inventory_private_title: "Inventaire Privé",
    inventory_private_desc:
      "Pour des raisons de confidentialité, vous ne pouvez voir que votre propre inventaire.",
    inventory_private_footer:
      "Utilisez /inventory sans paramètres pour voir le vôtre",
    inventory_title: "Sac de {username}",
    inventory_subtitle: "Gérez vos objets, monnaies et espace d'inventaire.",
    inventory_currency: "Monnaie",
    inventory_stats: "Statistiques d'Inventaire",
    inventory_stats_items:
      "**Objets:** {items}\n**Types:** {types}/50\n**Poids:** {weight}kg / {maxWeight}kg",
    inventory_items: "Objets dans le Sac",
    inventory_empty:
      "*Votre sac est vide. Commencez à travailler ou à miner pour collecter des objets !*",
    inventory_capacity: "Capacité de Poids",
    inventory_next_upgrade:
      "\n💡 **Prochaine Amélioration:** {capacity}kg pour **${price}** à la boutique",
    inventory_max_capacity: "\n✨ **Capacité maximale atteinte !**",
    inventory_nearly_full_warning:
      "⚠️ Votre sac est presque plein ! Utilisez /give pour transférer des objets ou améliorez votre capacité.",
    inventory_full_warning:
      "🚨 SAC PLEIN ! Vous ne pouvez pas collecter plus d'objets jusqu'à ce que vous libériez de l'espace.",
    inventory_transfer_hint:
      "Utilisez /give pour transférer des objets à d'autres joueurs",

    // Profile Command
    profile_edit_bio: "Modifier Bio",
    profile_change_bg: "Changer Fond",
    profile_shop_bg: "Boutique de Fonds",
    profile_level: "Niveau",
    profile_about_me: "À Propos",
    profile_no_bio: "Aucune bio définie...",

    mine_cooldown: "Tu es trop fatigué pour miner ! Reviens dans : **{time}**",
    mine_title: "MINE D'OR",
    mine_choose: "Choisis ta méthode de minage :",
    mine_solo: "Minage Solo",
    mine_solo_desc:
      "Durée : 50 minutes\nRécompense : 1-3 Lingots d'Or\nRisque : Faible",
    mine_coop: "Minage Coopératif",
    mine_coop_desc:
      "Durée : 2 heures\nRécompense : 4-6 Lingots d'Or (partagés)\nRisque : Élevé",
    mine_gold_value: "1 Lingot d'Or = {value} Pièces d'Argent",
    mine_progress: "Extraction d'or en cours...",
    mine_success: "Vous avez miné {amount} Lingot(s) d'Or !",
    mine_value: "Valeur",
    mine_next: "Prochain Minage",
    mine_good_work: "Bon travail, partenaire !",
    silver_coins: "Pièces d'Argent",
    gold_bars: "Lingots d'Or",
    wheat_item: "Blé",
    honey_item: "Miel",
    weight: "Poids",
    time_minutes: "{min} minutes",
    time_hours: "{hours}h {min}m",

    // Redeem Command
    redeem_invalid_title: "Code Invalide",
    redeem_invalid_desc:
      "Le code `{code}` n'existe pas.\n\nAssurez-vous de l'avoir copié correctement depuis la boutique !",
    redeem_invalid_footer: "Achetez des produits sur la boutique du site web",
    redeem_already_title: "Déjà Utilisé",
    redeem_already_desc:
      "Ce code a déjà été utilisé !\n\n**Produit:** {product}\n**Utilisé le:** {date}",
    redeem_already_footer: "Chaque code ne peut être utilisé qu'une seule fois",
    redeem_processing: "Traitement de votre achat...",
    redeem_upgrade_not_needed_title: "Amélioration Non Nécessaire",
    redeem_upgrade_not_needed_desc:
      "Vous avez déjà un sac avec **{current}kg** de capacité !\n\nCette amélioration est pour **{target}kg**, que vous avez déjà ou dépassé.\n\n**Note:** Votre code de réclamation **n'a pas été consommé** et peut être donné à un autre joueur.",
    redeem_upgrade_not_needed_footer:
      "Envisagez d'acheter une amélioration de niveau supérieur",
    redeem_success_title: "Code Utilisé avec Succès !",
    redeem_success_desc:
      "Merci pour votre achat ! 🎉\n\n**Produit:** {product}\n**Code:** `{code}`",
    redeem_success_footer: "Profitez de vos récompenses, partenaire !",
    redeem_rewards: "Récompenses Reçues",
    redeem_special_perks: "Avantages spéciaux activés !",
    redeem_vip_status: "Statut VIP",
    redeem_vip_activated:
      "Activé ! Vous avez maintenant accès à des fonctionnalités exclusives.",
    redeem_background: "Arrière-plan Exclusif",
    redeem_background_unlocked: "Débloqué ! Utilisez-le dans votre profil.",
    redeem_backpack: "Sac Amélioré",
    redeem_backpack_upgraded:
      "Votre capacité d'inventaire est maintenant de **{capacity}kg** !",
    redeem_error_title: "Erreur de Réclamation",
    redeem_error_desc:
      "Une erreur s'est produite lors du traitement de votre code.\n\nVeuillez réessayer ou contacter le support si le problème persiste.",
    redeem_error_footer: "Les détails de l'erreur ont été enregistrés",
    redeem_inventory_upgraded: "Inventaire amélioré à **{capacity}kg**",

    // Help Command Translations (French)
    help_title: "🤠 Sheriff Rex - Guide des Commandes",
    help_overview_desc:
      "**Bienvenue dans le Far West !** Sheriff Rex est un bot complet avec système d'économie, jeux, minage et bien plus.\n\n📱 **Support MP :** Certaines commandes fonctionnent en messages privés !\n🎮 **34 Commandes Disponibles**\n\n**Sélectionnez une catégorie ci-dessous pour voir les commandes:**",
    help_footer: "🌵 Utilisez les boutons pour naviguer entre les catégories",
    help_btn_economy: "💰 Économie",
    help_btn_gambling: "🎲 Jeux",
    help_btn_mining: "⛏️ Minage",
    help_btn_profile: "👤 Profil",
    help_btn_bounty: "🔫 Primes",
    help_btn_admin: "⚙️ Admin",
    help_btn_utility: "🔧 Utilitaire",
    help_btn_home: "🏠 Menu Principal",
    help_btn_support: "🆘 Support",
    help_btn_invite: "➕ Ajouter le Bot",
    help_btn_website: "🌐 Site Web",
    help_only_user: "❌ Seul celui qui a utilisé la commande peut naviguer !",

    // Category Titles (French)
    help_economy_title: "💰 Économie & Trading",
    help_gambling_title: "🎲 Jeux & Paris",
    help_mining_title: "⛏️ Système de Minage",
    help_profile_title: "👤 Profil & Personnalisation",
    help_bounty_title: "🔫 Système de Primes",
    help_admin_title: "⚙️ Administration du Serveur",
    help_utility_title: "🔧 Commandes Utilitaires",

    // Category Descriptions (French)
    help_economy_desc:
      "**Système économique complet avec monnaies, objets et transferts.**\n\n🪙 **Pièces d'Argent** - Monnaie principale du serveur\n🥇 **Lingots d'Or** - Objets précieux (1 lingot = 700 Argent)\n🎟️ **Jetons Saloon** - Monnaie premium pour personnalisations\n💼 **Système de Sac** - Système de sac avec améliorations",
    help_gambling_desc:
      "**Jeux de hasard et paris du Far West !**\n\n💰 Pariez vos Pièces d'Argent\n🎰 Plusieurs jeux disponibles\n🤝 Jeux solo et coopératifs\n⚠️ Jouez de manière responsable !",
    help_mining_desc:
      "**Exploitez les montagnes du Far West !**\n\n🥇 Trouvez de précieux Lingots d'Or\n💎 Découvrez des minerais rares\n🤝 Minez seul ou en duo\n⏰ Temps de récupération stratégiques",
    help_profile_desc:
      "**Personnalisez votre profil du Far West !**\n\n🎨 Arrière-plans personnalisables\n📊 Système d'XP et de Niveaux\n🖼️ Cartes de profil visuelles\n✨ Effet glassmorphism",
    help_bounty_desc:
      "**Chasse aux primes dans le Far West !**\n\n💀 Placez des primes sur les joueurs\n🎯 Capturez les criminels recherchés\n💰 Gagnez des récompenses en Argent\n⚖️ Système de justice western",
    help_admin_desc:
      "**Commandes exclusives pour les administrateurs !**\n\n🛡️ Nécessite des permissions admin\n🎛️ Paramètres du serveur\n💸 Gestion de l'économie\n📢 Système d'annonces avancé",
    help_utility_desc:
      "**Outils utiles et informations sur le bot !**\n\n📊 Statut et informations\n🌐 Paramètres généraux\n❓ Aide et support\n⚡ Performance",

    // Territories Command
    territories_price: "Prix",
    territories_rarity: "Rareté",
    territories_status: "Statut",
    territories_owned: "POSSÉDÉ",
    territories_available: "Disponible",
    territories_insufficient: "Fonds Insuffisants",
    territories_benefits: "Avantages",
    territories_footer:
      "Territoire {current} sur {total} • Vous possédez {owned}/{total} territoires",
    territories_prev: "Précédent",
    territories_next: "Suivant",
    territories_buy: "Acheter pour {price}k",
    territories_my_territories: "Mes Territoires",
    territories_close: "Fermer",
    territories_not_yours: "Ce navigateur de territoires n'est pas pour vous !",
    territories_need_more:
      "Vous avez besoin de {amount} Pièces d'Argent supplémentaires pour acheter ce territoire !",
    territories_already_own: "Vous possédez déjà ce territoire !",
    territories_transaction_failed: "Transaction échouée ! Veuillez réessayer.",
    territories_purchase_failed: "Achat échoué ! Votre argent a été remboursé.",
    territories_purchased_title: "TERRITOIRE ACHETÉ !",
    territories_purchased_desc:
      "Félicitations ! Vous êtes maintenant l'heureux propriétaire de **{name}** !",
    territories_amount_paid: "Montant Payé",
    territories_remaining_balance: "Solde Restant",
    territories_benefits_unlocked: "Avantages Débloqués",
    territories_now_own: "Vous possédez maintenant {count} territoires !",
    territories_my_title: "VOS TERRITOIRES",
    territories_no_territories: "Vous ne possédez encore aucun territoire.",
    territories_statistics: "Statistiques",
    territories_owned_count:
      "**Possédés:** {owned}/{total}\n**Complétion:** {percentage}%",
    territories_keep_expanding: "Continuez à étendre votre empire !",
    territories_browser_closed:
      "Navigateur de territoires fermé. Revenez quand vous voulez, partenaire !",

    // Territory Rarities
    rarity_common: "Commun",
    rarity_rare: "Rare",
    rarity_epic: "Épique",
    rarity_legendary: "Légendaire",

    // Bounty Commands
    bounty_invalid_target: "Cible Invalide",
    bounty_cant_target_bot:
      "Vous ne pouvez pas placer une prime sur un bot, partenaire !",
    bounty_choose_real_outlaw: "Choisissez un vrai hors-la-loi",
    bounty_self_not_allowed: "Auto-Prime Non Autorisée",
    bounty_cant_target_self:
      "Vous ne pouvez pas placer une prime sur vous-même !",
    bounty_mighty_strange: "Ce serait très étrange, partenaire",
    bounty_already_active: "Prime Déjà Active",
    bounty_user_has_bounty:
      "**{user}** a déjà une prime active!\n\n**Prime Actuelle:** {amount}",
    bounty_wait_cleared:
      "Attendez qu'elle soit supprimée avant d'en placer une nouvelle",
    bounty_insufficient_funds: "Fonds Insuffisants",
    bounty_not_enough_silver:
      "Vous n'avez pas assez de Pièces d'Argent!\n\n**Requis:** {required}\n**Vous avez:** {current}",
    bounty_earn_more: "Gagnez plus d'argent d'abord",
    bounty_transaction_failed: "Transaction Échouée",
    bounty_could_not_deduct:
      "Impossible de déduire les Pièces d'Argent: {error}",
    bounty_try_again: "Veuillez réessayer",
    bounty_placed: "Prime Placée!",
    bounty_now_wanted: "**{user}** est maintenant RECHERCHÉ!",
    bounty_hunters_can_capture:
      "Les chasseurs de primes peuvent maintenant capturer ce hors-la-loi!",
    bounty_target: "🎯 Cible",
    bounty_reward: "Récompense",
    bounty_posted_by: "👤 Publié Par",
    bounty_reason: "**Raison:** {reason}",
    bounty_server_only: "Serveur Uniquement",
    bounty_command_server_only:
      "Cette commande ne peut être utilisée que dans un serveur!",
    bounty_try_in_server: "Essayez d'utiliser cette commande dans un serveur",
    bounty_not_in_server: "Hors-la-loi Pas dans le Serveur",
    bounty_user_not_here:
      "**{user}** n'est pas dans ce serveur!\n\nVous ne pouvez capturer que les hors-la-loi actuellement dans le serveur.",
    bounty_must_be_present:
      "Le hors-la-loi doit être présent pour être capturé",
    bounty_capture_cooldown: "Temps de Recharge de Capture",
    bounty_need_rest:
      "Vous devez vous reposer avant de tenter une autre capture!\n\n**Temps restant:** {minutes} minutes",
    bounty_hunting_exhausting: "La chasse aux primes est un travail épuisant",
    bounty_no_bounty_found: "Aucune Prime Trouvée",
    bounty_user_not_wanted:
      "**{user}** n'a pas de prime active!\n\nIl n'est pas recherché en ce moment.",
    bounty_see_active: "Utilisez /bounties pour voir les primes actives",
    bounty_outlaw_escaped: "💨 Hors-la-loi S'est Échappé!",
    bounty_managed_escape:
      "**{user}** a réussi à s'échapper!\n\nLe hors-la-loi a glissé entre vos doigts et s'est enfui dans le désert.",
    bounty_better_luck: "Meilleure chance la prochaine fois, partenaire!",
    bounty_lost_reward: "💰 Récompense Perdue",
    bounty_success_rate: "📊 Taux de Réussite",
    bounty_capture_failed: "Capture Échouée",
    bounty_inventory_full:
      "Votre inventaire est trop plein pour porter la récompense!\n\n**Erreur:** {error}",
    bounty_free_space_try: "Libérez de l'espace et réessayez",
    bounty_outlaw_captured: "🎯 Hors-la-loi Capturé!",
    bounty_hunter_captured:
      "**{hunter}** a capturé avec succès **{outlaw}**!\n\nLa récompense a été collectée!",
    bounty_justice_prevails: "La justice prévaut dans le Far West!",
    bounty_hunter: "👤 Chasseur",
    bounty_outlaw: "🎯 Hors-la-loi",
    bounty_permission_denied: "Permission Refusée",
    bounty_admin_only:
      "Seuls les administrateurs peuvent supprimer les primes!",
    bounty_contact_admin: "Contactez un administrateur du serveur",
    bounty_user_no_bounty: "**{user}** n'a pas de prime active.",
    bounty_nothing_to_clear: "Rien à supprimer",
    bounty_cleared: "🚫 Prime Supprimée",
    bounty_admin_cleared:
      "La prime sur **{user}** a été supprimée par un administrateur.",
    bounty_no_longer_wanted: "Le hors-la-loi n'est plus recherché",
    bounty_amount_cleared: "💰 Montant Supprimé",
    bounty_cleared_by: "⚙️ Supprimé Par",
    bounty_no_active: "Aucune Prime Active",
    bounty_west_peaceful:
      "Le Far West est paisible aujourd'hui!\n\nAucun hors-la-loi n'est actuellement recherché.",
    bounty_use_wanted: "Utilisez /wanted pour placer une prime",
    bounty_no_outlaws_server: "Aucun Hors-la-loi dans le Serveur",
    bounty_all_fled:
      "Aucun hors-la-loi recherché n'est actuellement dans ce serveur!\n\nTous les hors-la-loi ont fui.",
    bounty_most_wanted: "**Hors-la-loi Les Plus Recherchés:**",
    bounty_contributors: "Contributeurs",
    bounty_more_outlaws: "*...et {count} hors-la-loi de plus*",
    bounty_active_bounties: "Primes Actives",
    bounty_total_bounties: "Total des Primes",
    bounty_total_rewards: "Récompenses Totales",
    bounty_hunt_claim:
      "Chassez les hors-la-loi et réclamez les récompenses avec /capture!",
    bounty_general_mischief: "Malice et chaos général",

    // Wanted Poster Canvas Translations
    wanted_poster_title: "RECHERCHÉ",
    wanted_poster_reward: "RÉCOMPENSE",
    wanted_poster_dead_or_alive: "MORT OU VIF",
    wanted_poster_silver: "ARGENT",

    // Give Command
    give_invalid_recipient: "Destinataire Invalide",
    give_cant_give_bots:
      "Vous ne pouvez pas donner d'objets aux bots, partenaire !",
    give_choose_real_player: "Choisissez un vrai joueur",
    give_self_transfer: "Auto-Transfert Non Autorisé",
    give_cant_give_self: "Vous ne pouvez pas vous donner des objets !",
    give_mighty_strange: "Ce serait très étrange",
    give_transfer_failed: "Transfert Échoué",
    give_check_inventory: "Vérifiez votre inventaire et réessayez",
    give_transfer_success: "Transfert Réussi !",
    give_you_gave: "Vous avez donné {amount} à **{user}**",
    give_from: "De",
    give_to: "À",
    give_item: "Objet",
    give_quantity: "Quantité",
    give_generosity: "La générosité est une vertu de cowboy !",

    // Dice Command
    dice_specify_all:
      "❌ Veuillez spécifier l'adversaire, la mise et la prédiction !",
    dice_cant_challenge_bot:
      "❌ Vous ne pouvez pas défier un bot à un jeu de dés, partenaire !",
    dice_cant_challenge_self:
      "❌ Vous ne pouvez pas vous défier vous-même, partenaire !",
    dice_cooldown_wait:
      "⏰ Doucement ! Attendez {seconds} secondes de plus avant de défier à nouveau.",
    dice_opponent_cooldown:
      "⏰ {user} se remet encore de son dernier duel ! Il a besoin de {seconds} secondes de plus.",
    dice_already_active: "❌ L'un de vous est déjà dans un jeu de dés actif !",
    dice_not_enough_tokens:
      "❌ Vous n'avez pas assez de jetons ! Vous avez {current} Jetons Saloon mais avez essayé de parier {bet} Jetons Saloon.",
    dice_opponent_not_enough:
      "❌ {user} n'a pas assez de jetons pour ce pari ! Il n'a que {current} Jetons Saloon.",
    dice_challenge_title: "🎲 DÉFI DE DÉS !",
    dice_challenge_desc:
      "**{challenger}** a défié **{opponent}** à un duel de dés !\n\n🎫 **Mise :** {bet} Jetons Saloon\n🎯 **Prédiction de {challenger} :** {guess}\n\n{opponent}, choisissez votre prédiction (2-12) ci-dessous !",
    dice_time_limit: "⏰ Temps Limite",
    dice_time_accept: "30 secondes pour accepter",
    dice_winner_takes_all: "🏆 Le Gagnant Prend Tout",
    dice_total_tokens: "{total} Jetons Saloon au total",
    dice_choose_wisely: "Choisissez judicieusement, partenaire !",
    dice_challenged: "{user}, vous avez été défié à un duel de dés !",
    dice_tie_title: "🎲 DUEL DE DÉS - ÉGALITÉ !",
    dice_tie_desc:
      "**C'est une égalité !** Les deux joueurs étaient également proches !\n\n🎲 Dés : {dice1} + {dice2} = **{total}**",
    dice_challenger_guess: "Prédiction de {user}",
    dice_opponent_guess: "Prédiction de {user}",
    dice_diff: "{guess} (diff : {diff})",
    dice_result: "Résultat",
    dice_bets_returned: "Mises retournées aux deux joueurs",
    dice_perfectly_balanced:
      "Pas de gagnants, pas de perdants - parfaitement équilibré !",
    dice_inventory_full_title: "🎲 DUEL DE DÉS - INVENTAIRE PLEIN !",
    dice_winner_inventory_full:
      "**{winner}** a gagné mais son inventaire est trop lourd !\n\n🎲 Dés : {dice1} + {dice2} = **{total}**\n\n🚫 {winner} n'a pas pu porter le prix ! La mise est retournée à {loser}.",
    dice_clean_inventory: "Videz votre inventaire avant de dueler !",
    dice_results_title: "🎲 RÉSULTATS DU DUEL DE DÉS !",
    dice_showed: "🎲 Les dés ont montré : {dice1} + {dice2} = **{total}**",
    dice_winner_wins: "🏆 **{winner} gagne {total} Jetons Saloon !**",
    dice_winner_guess_label: "🎯 Prédiction de {user}",
    dice_loser_guess_label: "❌ Prédiction de {user}",
    dice_difference: "{guess} (différence : {diff})",
    dice_tokens_label: "🎫 Jetons de {user}",
    dice_tokens_amount: "{amount} Jetons Saloon",
    dice_called_closest: "{user} était le plus proche !",
    dice_challenge_expired: "⏰ Défi Expiré",
    dice_no_response: "{user} n'a pas répondu à temps. Le défi a été annulé.",
    dice_better_luck: "Meilleure chance la prochaine fois !",

    // Roulette Command
    roulette_specify_both:
      "❌ Veuillez spécifier le montant du pari et le type de pari !",
    roulette_must_specify_number:
      "❌ Vous devez spécifier un numéro lorsque vous pariez sur un numéro spécifique !",
    roulette_cooldown:
      "⏰ Doucement ! Attendez {time} secondes de plus avant de tourner à nouveau.",
    roulette_already_active: "❌ Vous avez déjà un jeu de roulette actif !",
    roulette_insufficient_tokens:
      "❌ Vous n'avez pas assez de jetons ! Vous avez {current} {emoji} mais avez essayé de parier {bet} {emoji}.",
    roulette_title_spinning: "ROULETTE DU SALOON - Tournage de la Roue !",
    roulette_your_bet: "VOTRE PARI",
    roulette_bet_amount: "Montant",
    roulette_bet_type: "Type",
    roulette_spinning: "La roue tourne...",
    roulette_determining: "Détermination de votre destin...",
    roulette_good_luck: "Bonne chance, partenaire !",
    roulette_title_win: "ROULETTE - VOUS GAGNEZ !",
    roulette_title_loss: "ROULETTE - Vous Avez Perdu !",
    roulette_result: "RÉSULTAT",
    roulette_ball_landed: "La balle est tombée sur :",
    roulette_bet_won: "Votre pari sur {bet} a gagné !",
    roulette_bet_lost: "Votre pari sur {bet} n'a pas gagné.",
    roulette_winnings: "Gains",
    roulette_profit: "Profit",
    roulette_loss: "Perte",
    roulette_new_balance: "Nouveau Solde",
    roulette_congratulations: "Félicitations, partenaire !",
    roulette_better_luck: "Meilleure chance la prochaine fois, partenaire !",
    roulette_bet_red: "Rouge",
    roulette_bet_black: "Noir",
    roulette_bet_number: "Numéro Spécifique",
    roulette_bet_even: "Pair",
    roulette_bet_odd: "Impair",
    roulette_bet_low: "Bas (1-18)",
    roulette_bet_high: "Haut (19-36)",
    roulette_ui_title: "ROULETTE DU SALOON",
    roulette_ui_welcome: "BIENVENUE À LA ROULETTE",
    roulette_ui_balance: "Votre Solde",
    roulette_ui_step1: "1️⃣ Choisissez le type de pari",
    roulette_ui_step1_desc: "Cliquez sur l'un des boutons ci-dessus",
    roulette_ui_step2: "2️⃣ Sélectionnez le montant",
    roulette_ui_step2_desc: "Utilisez le menu ci-dessous",
    roulette_ui_step3: "3️⃣ Tournez la roue",
    roulette_ui_step3_desc: 'Cliquez sur le bouton "TOURNER"',
    roulette_select_amount: "💰 Sélectionnez le montant du pari",
    roulette_ui_bet_selected: "Pari Sélectionné",
    roulette_ui_now_select_amount:
      "💰 Maintenant sélectionnez le montant du pari dans le menu ci-dessous",
    roulette_ui_ready: "PRÊT À TOURNER !",
    roulette_ui_click_to_spin:
      "🎯 Cliquez sur le bouton ci-dessous pour tourner la roulette !",
    roulette_ui_spin: "🎰 TOURNER ROULETTE",
    roulette_ui_not_selected: "Non sélectionné",
    roulette_ui_select_bet_type:
      "Maintenant choisissez le type de pari ci-dessus",
    roulette_enter_number: "Entrez un numéro (0-36) :",
    roulette_invalid_number:
      "❌ Numéro invalide ! Veuillez entrer un numéro entre 0 et 36.",

    // Music Command
    music_need_voice_channel:
      "❌ Vous devez être dans un canal vocal pour jouer de la musique !",
    music_searching: "🔍 Recherche de votre chanson...",
    music_not_found:
      "❌ Je n'ai pas trouvé cette chanson. Réessayez avec un terme différent.",
    music_now_playing: "🎵 En Cours de Lecture",
    music_added_to_queue: "➕ Ajouté à la File",
    music_nothing_playing: "❌ Rien n'est en cours de lecture en ce moment !",
    music_paused: "⏸️ Musique en pause !",
    music_could_not_pause: "❌ Impossible de mettre en pause la musique.",
    music_resumed: "▶️ Musique reprise !",
    music_could_not_resume: "❌ Impossible de reprendre la musique.",
    music_skipped: "⏭️ Chanson sautée !",
    music_could_not_skip: "❌ Impossible de sauter la chanson.",
    music_stopped: "⏹️ Musique arrêtée et file effacée !",
    music_queue_empty: "❌ La file est vide !",
    music_queue_title: "🎵 File de Musique",
    music_now_playing_label: "🎵 En Cours de Lecture",
    music_up_next: "📋 À Suivre",
    music_and_more: "Et {count} chanson(s) de plus...",
    music_loop_song_enabled: "🔂 Boucle activée pour la chanson actuelle !",
    music_loop_disabled: "🔂 Boucle désactivée !",
    music_loop_queue_enabled: "🔁 Boucle de file activée !",
    music_volume_set: "🔊 Volume réglé à {volume}% !",
    music_status_playing: "En Lecture",
    music_status_paused: "En Pause",
    music_loop_mode_song: "🔂 Boucle: Chanson",
    music_loop_mode_queue: "🔁 Boucle: File",
    music_loop_mode_normal: "➡️ Normal",
    music_requested_by: "👤 Demandé Par",
    music_queue_count: "📋 File",
    music_duration: "⏱️ Durée",
    music_volume: "🔊 Volume",
    music_status: "▶️ Statut",
    music_use_buttons:
      "Utilisez les boutons ci-dessous pour contrôler la lecture",
    music_songs: "chanson(s)",
    music_position_in_queue: "📊 Position dans la File",
    music_btn_pause_resume: "⏸️ Pause/Reprendre",
    music_btn_skip: "⏭️ Passer",
    music_btn_loop: "🔂 Boucle",
    music_btn_queue: "📋 File",
    music_btn_stop: "⏹️ Arrêter",
    music_btn_volume_down: "🔉 -10%",
    music_btn_volume_up: "🔊 +10%",
    music_more_songs: "+{count} chanson(s) de plus",

    // Poll Command
    poll_title_create: "Sondage",
    poll_title_quick: "Sondage Rapide",
    poll_created_by: "a créé un sondage !",
    poll_question_label: "Question",
    poll_duration_label: "Durée",
    poll_multiple_choice_label: "Choix multiple",
    poll_yes_option: "Oui",
    poll_no_option: "Non",
    poll_maybe_option: "Peut-être",
    poll_vote_now: "Votez maintenant !",
    poll_wants_opinion: "veut votre avis !",
    poll_system_footer: "Système de Sondage",
    poll_quick_footer: "Sondage Rapide",
    poll_hour: "heure",
    poll_hours: "heures",

    // Announcement System
    announce_title: "Système d'Annonces",
    announce_preview: "Aperçu de l'Annonce",
    announce_confirm: "Confirmer l'Envoi",
    announce_cancel: "Annuler",
    announce_success: "Annonce Envoyée !",
    announce_sent_to: "Annonce envoyée à",
    announce_author: "Auteur",
    announce_channel: "Canal",
    announce_template_saved: "Modèle Sauvegardé !",
    announce_template_deleted: "Modèle Supprimé !",
    announce_no_templates: "Aucun modèle sauvegardé",
    announce_select_color: "Sélectionnez une couleur",

    // Welcome System
    welcome_title: "Système de Bienvenue",
    welcome_configured: "Bienvenue Configurée !",
    welcome_channel_set: "Canal de bienvenue configuré",
    welcome_message_set: "Message personnalisé défini",
    welcome_current_config: "Configuration Actuelle",
    welcome_status: "Statut",
    welcome_enabled: "Activé",
    welcome_disabled: "Désactivé",
    welcome_test_message: "Message de Test",
    welcome_placeholders: "Placeholders Disponibles",
    welcome_placeholder_user: "{user} - Mention de l'utilisateur",
    welcome_placeholder_username: "{username} - Nom d'utilisateur",
    welcome_placeholder_server: "{server} - Nom du serveur",
    welcome_removed: "Système de bienvenue supprimé",
    welcome_not_configured: "Le système de bienvenue n'est pas configuré",

    // Logs System
    logs_title: "Système de Logs",
    logs_configured: "Logs Configurés !",
    logs_channel_set: "Canal de logs configuré avec succès",
    logs_current_config: "Configuration Actuelle des Logs",
    logs_status: "Statut",
    logs_enabled: "Activé",
    logs_disabled: "Désactivé",
    logs_events_tracked: "Événements Surveillés",
    logs_member_join: "Arrivées de membres",
    logs_member_leave: "Départs de membres",
    logs_message_delete: "Messages supprimés",
    logs_message_edit: "Messages modifiés",
    logs_removed: "Système de logs supprimé",
    logs_removed_description: "Les logs ne seront plus envoyés à aucun canal.",
    logs_not_configured: "Le système de logs n'est pas configuré",
  },
};

const userLocales: Map<string, string> = new Map();

export function setUserLocale(userId: string, locale: string): void {
  userLocales.set(userId, locale);
}

export function getUserLocale(userId: string): string {
  return userLocales.get(userId) || "en-US";
}

export function getLocale(
  interaction:
    | ChatInputCommandInteraction
    | ButtonInteraction
    | StringSelectMenuInteraction
    | Interaction,
): string {
  const locale = interaction.locale || "en-US";

  if ("user" in interaction && interaction.user?.id) {
    setUserLocale(
      interaction.user.id,
      locale.startsWith("pt")
        ? "pt-BR"
        : locale.startsWith("es")
          ? "es-ES"
          : locale.startsWith("fr")
            ? "fr"
            : "en-US",
    );
  }

  if (locale.startsWith("pt")) {
    return "pt-BR";
  }
  if (locale.startsWith("es")) {
    return "es-ES";
  }
  if (locale.startsWith("fr")) {
    return "fr";
  }

  return "en-US";
}

export function t(
  interaction:
    | ChatInputCommandInteraction
    | ButtonInteraction
    | StringSelectMenuInteraction
    | Interaction,
  key: string,
  params: Record<string, any> = {},
): string {
  const locale = getLocale(interaction);
  let text = translations[locale][key] || translations["en-US"][key] || key;

  Object.keys(params).forEach((param) => {
    text = text.replace(`{${param}}`, params[param]);
  });

  return text;
}

export function tUser(
  userId: string,
  key: string,
  params: Record<string, any> = {},
): string {
  const locale = getUserLocale(userId);
  let text = translations[locale][key] || translations["en-US"][key] || key;

  Object.keys(params).forEach((param) => {
    text = text.replace(`{${param}}`, params[param]);
  });

  return text;
}

export function tLocale(
  locale: string,
  key: string,
  params: Record<string, any> = {},
): string {
  let text = translations[locale][key] || translations["en-US"][key] || key;

  Object.keys(params).forEach((param) => {
    text = text.replace(`{${param}}`, params[param]);
  });

  return text;
}

export { translations };
