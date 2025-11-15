/**
 * Script para fazer upload dos ícones PNG como emojis personalizados no Discord
 * USO: npm run upload-icons <GUILD_ID>
 */

import { Client, GatewayIntentBits } from "discord.js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { ICON_MAPPINGS } from "../src/utils/iconManager";

dotenv.config();

const ICONS_PNG_DIR = path.join(process.cwd(), "assets", "icons-png");

async function uploadIconsToDiscord(guildId: string): Promise<void> {
  const token = process.env.DISCORD_TOKEN;
  
  if (!token) {
    console.error("❌ DISCORD_TOKEN não encontrado no .env");
    process.exit(1);
  }
  
  if (!guildId) {
    console.error("❌ Uso: npm run upload-icons <GUILD_ID>");
    process.exit(1);
  }
  
  console.log("🤖 Iniciando bot Discord...");
  
  const client = new Client({
    intents: [GatewayIntentBits.Guilds],
  });
  
  client.once("ready", async () => {
    console.log(`✅ Bot conectado como ${client.user?.tag}\n`);
    
    const guild = client.guilds.cache.get(guildId);
    
    if (!guild) {
      console.error(`❌ Guild ${guildId} não encontrada`);
      client.destroy();
      process.exit(1);
    }
    
    console.log(`📤 Fazendo upload de emojis para: ${guild.name}\n`);
    
    // Verificar limite de emojis
    const maxEmojis = guild.premiumTier === 0 ? 50 :
                      guild.premiumTier === 1 ? 100 :
                      guild.premiumTier === 2 ? 150 : 250;
    
    const currentEmojis = guild.emojis.cache.size;
    console.log(`📊 Emojis atuais: ${currentEmojis}/${maxEmojis}`);
    
    if (!fs.existsSync(ICONS_PNG_DIR)) {
      console.error(`❌ Pasta ${ICONS_PNG_DIR} não encontrada`);
      console.log("Execute primeiro: npm run convert-icons");
      client.destroy();
      process.exit(1);
    }
    
    // Obter lista de ícones únicos necessários
    const uniqueIcons = new Set(ICON_MAPPINGS.map((m) => m.iconName));
    
    let uploaded = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const iconName of uniqueIcons) {
      const pngPath = path.join(ICONS_PNG_DIR, `${iconName}.png`);
      const emojiName = `feather_${iconName.replace(/-/g, "_")}`;
      
      if (!fs.existsSync(pngPath)) {
        console.log(`⚠️  ${iconName}.png não encontrado, pulando...`);
        skipped++;
        continue;
      }
      
      // Verificar se o emoji já existe
      const existingEmoji = guild.emojis.cache.find((e) => e.name === emojiName);
      
      if (existingEmoji) {
        console.log(`⏭️  Emoji ${emojiName} já existe, pulando...`);
        skipped++;
        continue;
      }
      
      // Verificar limite
      if (currentEmojis + uploaded >= maxEmojis) {
        console.error(`\n❌ Limite de emojis atingido (${maxEmojis})`);
        break;
      }
      
      try {
        const emoji = await guild.emojis.create({
          attachment: pngPath,
          name: emojiName,
        });
        
        console.log(`✅ Upload: ${emojiName} → ${emoji.id}`);
        uploaded++;
        
        // Delay para evitar rate limit
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error: any) {
        console.error(`❌ Erro ao fazer upload de ${emojiName}:`, error.message);
        errors++;
      }
    }
    
    console.log(`\n📊 Resumo:`);
    console.log(`   ✅ Uploaded: ${uploaded}`);
    console.log(`   ⏭️  Pulados: ${skipped}`);
    console.log(`   ❌ Erros: ${errors}`);
    console.log(`   📊 Total de emojis no servidor: ${currentEmojis + uploaded}/${maxEmojis}`);
    
    client.destroy();
    process.exit(0);
  });
  
  await client.login(token);
}

// Pegar GUILD_ID dos argumentos
const guildId = process.argv[2];
uploadIconsToDiscord(guildId).catch(console.error);
