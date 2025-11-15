/**
 * Icon Manager - Gerencia ícones SVG do Feather e emojis personalizados do Discord
 * Mapeamento de ícones para cada tipo de ação/botão do bot
 */

import { Client, GuildEmoji } from "discord.js";
import fs from "fs";
import path from "path";

export interface IconMapping {
  action: string;
  iconName: string;
  fallbackEmoji: string;
  description: string;
}

/**
 * Mapeamento completo de ações para ícones Feather
 */
export const ICON_MAPPINGS: IconMapping[] = [
  // Embed Builder
  { action: "eb_basic", iconName: "file-text", fallbackEmoji: "📄", description: "Informações básicas" },
  { action: "eb_author", iconName: "user", fallbackEmoji: "👥", description: "Autor" },
  { action: "eb_images", iconName: "image", fallbackEmoji: "🖼", description: "Imagens" },
  { action: "eb_footer", iconName: "arrow-down", fallbackEmoji: "⬇", description: "Rodapé" },
  { action: "eb_addfield", iconName: "plus-circle", fallbackEmoji: "➕", description: "Adicionar campo" },
  { action: "eb_managefields", iconName: "edit-3", fallbackEmoji: "📝", description: "Gerenciar campos" },
  { action: "eb_color", iconName: "droplet", fallbackEmoji: "🎨", description: "Cor" },
  { action: "eb_timestamp", iconName: "clock", fallbackEmoji: "🕐", description: "Timestamp" },
  { action: "eb_template", iconName: "file", fallbackEmoji: "📑", description: "Templates" },
  { action: "eb_import", iconName: "download", fallbackEmoji: "📥", description: "Importar" },
  { action: "eb_export", iconName: "upload", fallbackEmoji: "📤", description: "Exportar" },
  { action: "eb_clear", iconName: "trash-2", fallbackEmoji: "🗑", description: "Limpar" },
  { action: "eb_send", iconName: "send", fallbackEmoji: "✉", description: "Enviar" },
  { action: "eb_cancel", iconName: "x-circle", fallbackEmoji: "❌", description: "Cancelar" },
  
  // Guild (Guilda)
  { action: "guild_info", iconName: "info", fallbackEmoji: "ℹ️", description: "Informações da guilda" },
  { action: "guild_members", iconName: "users", fallbackEmoji: "👥", description: "Membros" },
  { action: "guild_leave", iconName: "log-out", fallbackEmoji: "🚪", description: "Sair da guilda" },
  { action: "guild_confirm_leave", iconName: "check", fallbackEmoji: "✅", description: "Confirmar saída" },
  { action: "guild_cancel", iconName: "x", fallbackEmoji: "❌", description: "Cancelar" },
  { action: "guild_kick", iconName: "user-x", fallbackEmoji: "👢", description: "Expulsar membro" },
  { action: "guild_promote", iconName: "arrow-up", fallbackEmoji: "⬆️", description: "Promover" },
  { action: "guild_demote", iconName: "arrow-down", fallbackEmoji: "⬇️", description: "Rebaixar" },
  
  // Duel (Duelo)
  { action: "duel_attack", iconName: "zap", fallbackEmoji: "⚡", description: "Ataque rápido" },
  { action: "duel_defend", iconName: "shield", fallbackEmoji: "🛡", description: "Defender" },
  { action: "duel_special", iconName: "target", fallbackEmoji: "🎯", description: "Ataque especial" },
  
  // Shop (Loja)
  { action: "shop_prev", iconName: "chevron-left", fallbackEmoji: "◀️", description: "Anterior" },
  { action: "shop_next", iconName: "chevron-right", fallbackEmoji: "▶️", description: "Próximo" },
  { action: "shop_buy", iconName: "shopping-cart", fallbackEmoji: "🛒", description: "Comprar" },
  { action: "shop_close", iconName: "x", fallbackEmoji: "❌", description: "Fechar" },
  
  // Profile (Perfil)
  { action: "profile_edit", iconName: "edit", fallbackEmoji: "✏️", description: "Editar perfil" },
  { action: "profile_background", iconName: "image", fallbackEmoji: "🖼", description: "Alterar fundo" },
  { action: "profile_frame", iconName: "square", fallbackEmoji: "🖼️", description: "Moldura" },
  
  // Territory (Territórios)
  { action: "territory_prev", iconName: "chevron-left", fallbackEmoji: "⬅️", description: "Território anterior" },
  { action: "territory_next", iconName: "chevron-right", fallbackEmoji: "➡️", description: "Próximo território" },
  { action: "territory_purchase", iconName: "dollar-sign", fallbackEmoji: "💰", description: "Comprar território" },
  { action: "territory_my", iconName: "map", fallbackEmoji: "🗺️", description: "Meus territórios" },
  { action: "territory_close", iconName: "x", fallbackEmoji: "❌", description: "Fechar" },
  
  // Mining (Mineração)
  { action: "mine_progress", iconName: "activity", fallbackEmoji: "📊", description: "Ver progresso" },
  { action: "mine_claim", iconName: "gift", fallbackEmoji: "🎁", description: "Reclamar recompensa" },
  
  // Poll (Enquete)
  { action: "poll_confirm", iconName: "check-circle", fallbackEmoji: "✅", description: "Confirmar enquete" },
  { action: "poll_cancel", iconName: "x-circle", fallbackEmoji: "❌", description: "Cancelar enquete" },
  
  // Economy (Economia)
  { action: "economy_bank", iconName: "credit-card", fallbackEmoji: "💳", description: "Banco" },
  { action: "economy_transfer", iconName: "arrow-right-circle", fallbackEmoji: "💸", description: "Transferir" },
  { action: "economy_work", iconName: "briefcase", fallbackEmoji: "💼", description: "Trabalhar" },
  
  // General Actions
  { action: "confirm", iconName: "check", fallbackEmoji: "✅", description: "Confirmar" },
  { action: "cancel", iconName: "x", fallbackEmoji: "❌", description: "Cancelar" },
  { action: "delete", iconName: "trash-2", fallbackEmoji: "🗑️", description: "Deletar" },
  { action: "refresh", iconName: "refresh-cw", fallbackEmoji: "🔄", description: "Atualizar" },
  { action: "settings", iconName: "settings", fallbackEmoji: "⚙️", description: "Configurações" },
  { action: "help", iconName: "help-circle", fallbackEmoji: "❓", description: "Ajuda" },
  { action: "search", iconName: "search", fallbackEmoji: "🔍", description: "Buscar" },
  { action: "filter", iconName: "filter", fallbackEmoji: "🔍", description: "Filtrar" },
  { action: "star", iconName: "star", fallbackEmoji: "⭐", description: "Favoritar" },
  { action: "lock", iconName: "lock", fallbackEmoji: "🔒", description: "Trancar" },
  { action: "unlock", iconName: "unlock", fallbackEmoji: "🔓", description: "Destrancar" },
];

/**
 * Cache de emojis personalizados do Discord
 */
const emojiCache = new Map<string, GuildEmoji>();

/**
 * Obtém o emoji correto para uma ação
 * @param action Nome da ação
 * @param client Cliente do Discord (opcional, para usar emojis personalizados)
 * @returns String do emoji (personalizado ou fallback)
 */
export function getIconEmoji(action: string, client?: Client): string {
  const mapping = ICON_MAPPINGS.find((m) => m.action === action);
  
  if (!mapping) {
    return "❔"; // Emoji padrão para ações desconhecidas
  }
  
  // Se temos um cliente, tentar usar emoji personalizado
  if (client) {
    const customEmoji = emojiCache.get(mapping.iconName);
    if (customEmoji) {
      return `<:${customEmoji.name}:${customEmoji.id}>`;
    }
  }
  
  // Usar emoji de fallback
  return mapping.fallbackEmoji;
}

/**
 * Faz upload de todos os ícones SVG como emojis personalizados para um servidor
 * @param client Cliente do Discord
 * @param guildId ID do servidor onde fazer upload dos emojis
 */
export async function uploadIconsToGuild(
  client: Client,
  guildId: string,
): Promise<void> {
  const guild = client.guilds.cache.get(guildId);
  
  if (!guild) {
    throw new Error(`Guild ${guildId} não encontrada`);
  }
  
  const iconsPath = path.join(process.cwd(), "assets", "icons");
  
  if (!fs.existsSync(iconsPath)) {
    throw new Error("Pasta de ícones não encontrada");
  }
  
  console.log(`📤 Fazendo upload de ícones para ${guild.name}...`);
  
  // Obter lista de ícones únicos necessários
  const uniqueIcons = new Set(ICON_MAPPINGS.map((m) => m.iconName));
  
  let uploaded = 0;
  let skipped = 0;
  
  for (const iconName of uniqueIcons) {
    const iconPath = path.join(iconsPath, `${iconName}.svg`);
    
    if (!fs.existsSync(iconPath)) {
      console.log(`⚠️  Ícone ${iconName}.svg não encontrado, pulando...`);
      skipped++;
      continue;
    }
    
    try {
      // Verificar se o emoji já existe
      const existingEmoji = guild.emojis.cache.find(
        (e) => e.name === `feather_${iconName.replace(/-/g, "_")}`,
      );
      
      if (existingEmoji) {
        emojiCache.set(iconName, existingEmoji);
        skipped++;
        continue;
      }
      
      // Converter SVG para PNG (Discord não aceita SVG direto)
      // Por enquanto, vamos apenas registrar que precisamos fazer isso
      console.log(`⏭️  SVG encontrado: ${iconName}.svg (necessita conversão para PNG)`);
      skipped++;
      
    } catch (error) {
      console.error(`❌ Erro ao processar ${iconName}:`, error);
    }
  }
  
  console.log(`\n✅ Upload completo!`);
  console.log(`   - Uploaded: ${uploaded}`);
  console.log(`   - Skipped: ${skipped}`);
  console.log(`\nℹ️  Nota: Os ícones SVG precisam ser convertidos para PNG antes do upload.`);
  console.log(`   Por enquanto, o bot usará os emojis Unicode de fallback.`);
}

/**
 * Lista todos os ícones disponíveis
 */
export function listAvailableIcons(): void {
  console.log("\n📋 Ícones disponíveis:\n");
  
  const categories = new Map<string, IconMapping[]>();
  
  ICON_MAPPINGS.forEach((mapping) => {
    const category = mapping.action.split("_")[0];
    if (!categories.has(category)) {
      categories.set(category, []);
    }
    categories.get(category)!.push(mapping);
  });
  
  categories.forEach((mappings, category) => {
    console.log(`\n${category.toUpperCase()}:`);
    mappings.forEach((m) => {
      console.log(`  ${m.fallbackEmoji} ${m.action.padEnd(25)} → ${m.iconName}.svg (${m.description})`);
    });
  });
  
  console.log(`\n📊 Total: ${ICON_MAPPINGS.length} ícones mapeados`);
}

/**
 * Obtém o caminho para um ícone SVG
 * @param action Nome da ação
 * @returns Caminho para o arquivo SVG
 */
export function getIconPath(action: string): string | null {
  const mapping = ICON_MAPPINGS.find((m) => m.action === action);
  
  if (!mapping) {
    return null;
  }
  
  return path.join(process.cwd(), "assets", "icons", `${mapping.iconName}.svg`);
}
