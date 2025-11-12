import { Guild } from "discord.js";
import { getDataPath } from "./database";
import fs from "fs";
import path from "path";

interface EmojiMapping {
  [key: string]: string; // name -> emoji ID format <:name:id>
}

const EMOJI_MAPPING_FILE = path.join(getDataPath("data"), "emoji-mapping.json");
const CUSTOM_EMOJIS_DIR = getDataPath("assets", "custom-emojis");

/**
 * Carrega o mapeamento de emojis do arquivo JSON
 */
export function loadEmojiMapping(): EmojiMapping {
  if (!fs.existsSync(EMOJI_MAPPING_FILE)) {
    return {};
  }
  try {
    const data = fs.readFileSync(EMOJI_MAPPING_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error loading emoji mapping:", error);
    return {};
  }
}

/**
 * Salva o mapeamento de emojis no arquivo JSON
 * @param mapping
 */
export function saveEmojiMapping(mapping: EmojiMapping): void {
  try {
    fs.writeFileSync(
      EMOJI_MAPPING_FILE,
      JSON.stringify(mapping, null, 2),
      "utf-8",
    );
  } catch (error) {
    console.error("Error saving emoji mapping:", error);
  }
}

/**
 * Faz upload de todos os emojis da pasta custom-emojis para o servidor Discord
 * @param guild
 */
export async function uploadCustomEmojis(
  guild: Guild,
): Promise<{ success: number; failed: number; errors: string[] }> {
  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[],
  };

  // Verifica se a pasta existe
  if (!fs.existsSync(CUSTOM_EMOJIS_DIR)) {
    results.errors.push("Custom emojis directory not found");
    return results;
  }

  // Lê todos os arquivos PNG da pasta
  const files = fs
    .readdirSync(CUSTOM_EMOJIS_DIR)
    .filter((file) => file.endsWith(".png") || file.endsWith(".gif"));

  if (files.length === 0) {
    results.errors.push("No emoji files found in custom-emojis folder");
    return results;
  }

  // Fetch emojis to update cache
  try {
    await guild.emojis.fetch();
  } catch (error: any) {
    results.errors.push(`Failed to fetch server emojis: ${error.message}`);
  }

  const mapping = loadEmojiMapping();

  // Process uploads in parallel with limit to avoid rate limiting
  const uploadPromises = files.map(async (file) => {
    try {
      const filePath = path.join(CUSTOM_EMOJIS_DIR, file);
      const emojiName = file.replace(/\.(png|gif)$/, "");

      // Verifica o tamanho do arquivo (máximo 256KB)
      const stats = fs.statSync(filePath);
      if (stats.size > 256 * 1024) {
        return {
          success: false,
          name: emojiName,
          error: `File too large (${Math.round(stats.size / 1024)}KB > 256KB)`,
        };
      }

      // Verifica se o emoji já existe no servidor (usando cache)
      const existingEmoji = guild.emojis.cache.find(
        (e) => e.name === emojiName,
      );

      if (existingEmoji) {
        // Atualiza o mapeamento com o emoji existente
        const prefix = existingEmoji.animated ? "a:" : ":";
        return {
          success: true,
          name: emojiName,
          emojiString: `<${prefix}${existingEmoji.name}:${existingEmoji.id}>`,
          wasExisting: true,
        };
      }

      // Faz upload do emoji para o servidor
      const emoji = await guild.emojis.create({
        attachment: filePath,
        name: emojiName,
        reason: "Custom emoji upload via Sheriff Rex Bot",
      });

      // Salva o mapeamento (usa sintaxe correta para animated)
      const prefix = emoji.animated ? "a:" : ":";
      return {
        success: true,
        name: emojiName,
        emojiString: `<${prefix}${emoji.name}:${emoji.id}>`,
        wasExisting: false,
      };
    } catch (error: any) {
      return {
        success: false,
        name: file.replace(/\.(png|gif)$/, ""),
        error: error.message,
      };
    }
  });

  // Wait for all uploads to complete
  const uploadResults = await Promise.allSettled(uploadPromises);

  // Process results
  for (const result of uploadResults) {
    if (result.status === "fulfilled") {
      const data = result.value;
      if (data.success && data.emojiString) {
        results.success++;
        mapping[data.name] = data.emojiString;
      } else {
        results.failed++;
        results.errors.push(`${data.name}: ${data.error || "Unknown error"}`);
      }
    } else {
      results.failed++;
      results.errors.push(`Unknown error: ${result.reason}`);
    }
  }

  // Salva o mapeamento atualizado
  saveEmojiMapping(mapping);

  return results;
}

/**
 * Sincroniza os emojis existentes do servidor com o mapeamento
 * Busca todos os emojis do servidor e atualiza o arquivo de mapeamento
 * @param guild
 */
export async function syncServerEmojis(
  guild: Guild,
): Promise<{ success: number; failed: number; errors: string[] }> {
  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[],
  };

  try {
    const serverEmojis = await guild.emojis.fetch();

    if (serverEmojis.size === 0) {
      results.errors.push("No emojis found on server");
      return results;
    }

    const mapping = loadEmojiMapping();

    serverEmojis.forEach((emoji) => {
      if (emoji.name) {
        const prefix = emoji.animated ? "a:" : ":";
        mapping[emoji.name] = `<${prefix}${emoji.name}:${emoji.id}>`;
        results.success++;
      }
    });

    saveEmojiMapping(mapping);
  } catch (error: any) {
    results.errors.push(`Failed to sync emojis: ${error.message}`);
  }

  return results;
}

/**
 * Obtém um emoji customizado pelo nome
 * @param name
 * @param fallback
 */
export function getCustomEmoji(name: string, fallback: string = "❓"): string {
  const mapping = loadEmojiMapping();
  return mapping[name] || fallback;
}

/**
 * Lista todos os emojis customizados disponíveis
 */
export function listCustomEmojis(): string[] {
  const mapping = loadEmojiMapping();
  return Object.keys(mapping);
}

/**
 * Remove um emoji do servidor e do mapeamento
 * @param guild
 * @param emojiName
 */
export async function removeCustomEmoji(
  guild: Guild,
  emojiName: string,
): Promise<boolean> {
  try {
    const mapping = loadEmojiMapping();
    const emojiString = mapping[emojiName];

    if (!emojiString) {
      return false;
    }

    // Extrai o ID do emoji
    const match = emojiString.match(/:(\d+)>/);
    if (!match) {
      return false;
    }

    const emojiId = match[1];
    const emoji = guild.emojis.cache.get(emojiId);

    if (emoji) {
      await emoji.delete("Removed via Sheriff Rex Bot");
    }

    // Remove do mapeamento
    delete mapping[emojiName];
    saveEmojiMapping(mapping);

    return true;
  } catch (error) {
    console.error("Error removing custom emoji:", error);
    return false;
  }
}

/**
 * Remove todos os emojis customizados do servidor Discord
 * Remove TODOS os emojis do servidor, independente do mapeamento
 * @param guild
 */
export async function removeAllCustomEmojis(
  guild: Guild,
): Promise<{ success: number; failed: number; errors: string[] }> {
  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[],
  };

  // Fetch all emojis from the server
  let serverEmojis;
  try {
    serverEmojis = await guild.emojis.fetch();
  } catch (error: any) {
    results.errors.push(`Failed to fetch server emojis: ${error.message}`);
    return results;
  }

  if (serverEmojis.size === 0) {
    results.errors.push("No emojis found on server");
    return results;
  }

  // Remove ALL emojis from the server (not just from mapping)
  const deletePromises = serverEmojis.map(async (emoji) => {
    try {
      await emoji.delete("Removed via Sheriff Rex Bot");
      return { success: true, name: emoji.name || emoji.id };
    } catch (error: any) {
      return {
        success: false,
        name: emoji.name || emoji.id,
        error: error.message,
      };
    }
  });

  // Wait for all deletions to complete
  const deleteResults = await Promise.allSettled(deletePromises);

  // Process results
  for (const result of deleteResults) {
    if (result.status === "fulfilled") {
      const { success, name, error } = result.value;
      if (success) {
        results.success++;
      } else {
        results.failed++;
        results.errors.push(`${name}: ${error}`);
      }
    } else {
      results.failed++;
      results.errors.push(`Unknown error: ${result.reason}`);
    }
  }

  // Clear the mapping file completely
  saveEmojiMapping({});

  return results;
}
