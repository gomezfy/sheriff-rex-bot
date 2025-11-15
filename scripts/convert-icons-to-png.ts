/**
 * Script para converter ícones SVG para PNG para uso como emojis do Discord
 * Discord requer imagens PNG/GIF para emojis personalizados
 */

import { createCanvas, loadImage } from "@napi-rs/canvas";
import fs from "fs";
import path from "path";
import { ICON_MAPPINGS } from "../src/utils/iconManager";

const ICON_SIZE = 128; // Tamanho ideal para emojis do Discord (128x128)
const OUTPUT_DIR = path.join(process.cwd(), "assets", "icons-png");

/**
 * Converte um SVG para PNG
 */
async function convertSvgToPng(
  svgPath: string,
  outputPath: string,
): Promise<void> {
  // Ler o arquivo SVG
  const svgContent = fs.readFileSync(svgPath, "utf-8");
  
  // Criar um data URL do SVG
  const svgDataUrl = `data:image/svg+xml;base64,${Buffer.from(svgContent).toString("base64")}`;
  
  try {
    // Carregar a imagem SVG
    const image = await loadImage(svgDataUrl);
    
    // Criar canvas
    const canvas = createCanvas(ICON_SIZE, ICON_SIZE);
    const ctx = canvas.getContext("2d");
    
    // Fundo transparente
    ctx.clearRect(0, 0, ICON_SIZE, ICON_SIZE);
    
    // Desenhar a imagem centralizada e redimensionada
    const padding = 16; // Padding de 16px
    const size = ICON_SIZE - padding * 2;
    ctx.drawImage(image, padding, padding, size, size);
    
    // Salvar como PNG
    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(outputPath, buffer);
    
    console.log(`✅ Convertido: ${path.basename(svgPath)} → ${path.basename(outputPath)}`);
  } catch (error) {
    console.error(`❌ Erro ao converter ${svgPath}:`, error);
  }
}

/**
 * Converte todos os ícones necessários
 */
async function convertAllIcons(): Promise<void> {
  console.log("🎨 Convertendo ícones SVG para PNG...\n");
  
  // Criar diretório de saída se não existir
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  // Obter lista de ícones únicos necessários
  const uniqueIcons = new Set(ICON_MAPPINGS.map((m) => m.iconName));
  
  let converted = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const iconName of uniqueIcons) {
    const svgPath = path.join(process.cwd(), "assets", "icons", `${iconName}.svg`);
    const pngPath = path.join(OUTPUT_DIR, `${iconName}.png`);
    
    // Verificar se o SVG existe
    if (!fs.existsSync(svgPath)) {
      console.log(`⚠️  ${iconName}.svg não encontrado, pulando...`);
      skipped++;
      continue;
    }
    
    // Verificar se o PNG já existe
    if (fs.existsSync(pngPath)) {
      console.log(`⏭️  ${iconName}.png já existe, pulando...`);
      skipped++;
      continue;
    }
    
    try {
      await convertSvgToPng(svgPath, pngPath);
      converted++;
    } catch (error) {
      console.error(`❌ Erro ao converter ${iconName}:`, error);
      errors++;
    }
  }
  
  console.log(`\n📊 Resumo:`);
  console.log(`   ✅ Convertidos: ${converted}`);
  console.log(`   ⏭️  Pulados: ${skipped}`);
  console.log(`   ❌ Erros: ${errors}`);
  console.log(`\n📁 PNGs salvos em: ${OUTPUT_DIR}`);
}

// Executar conversão
convertAllIcons().catch(console.error);
