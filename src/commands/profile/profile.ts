import {
  SlashCommandBuilder,
  AttachmentBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  User,
  MessageFlags,
} from "discord.js";
import { getInventory } from "../../utils/inventoryManager";
import { commandRateLimiter } from "../../utils/security";
import { getAllBackgrounds } from "../../utils/backgroundManager";
import { getUserXp, getXpForLevel } from "../../utils/xpManager";
import { getUserProfile } from "../../utils/profileManager";
import { parseTextWithEmojis } from "../../utils/emojiMapper";
const {
  getCustomEmojiPath,
  CUSTOM_EMOJIS,
} = require("../../utils/customEmojis");
import { createCanvas, loadImage, GlobalFonts } from "@napi-rs/canvas";
import { t, getLocale } from "../../utils/i18n";
import { applyLocalizations } from "../../utils/commandLocalizations";
import fs from "fs";
import path from "path";

// Register Nunito font
GlobalFonts.registerFromPath(
  path.join(process.cwd(), "assets/fonts/Nunito-Bold.ttf"),
  "Nunito",
);
GlobalFonts.registerFromPath(
  path.join(process.cwd(), "assets/fonts/Nunito-SemiBold.ttf"),
  "Nunito SemiBold",
);
GlobalFonts.registerFromPath(
  path.join(process.cwd(), "assets/fonts/Nunito-Regular.ttf"),
  "Nunito Regular",
);

export default {
  data: applyLocalizations(
    new SlashCommandBuilder()
      .setName("profile")
      .setDescription("View your cowboy profile card")
      .setContexts([0, 1, 2]) // Guild, BotDM, PrivateChannel
      .setIntegrationTypes([0, 1]) // Guild Install, User Install
      .addUserOption((option) =>
        option
          .setName("user")
          .setDescription("View another cowboy's profile")
          .setRequired(false),
      ),
    "profile",
  ),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    // Rate limiting: 5 second cooldown
    const cooldownMs = 5000;
    if (
      !commandRateLimiter.canExecute("profile", interaction.user.id, cooldownMs)
    ) {
      const remaining = commandRateLimiter.getRemainingCooldown(
        "profile",
        interaction.user.id,
        cooldownMs,
      );
      const seconds = Math.ceil(remaining / 1000);
      await interaction.reply({
        content: `⏱️ ${t(interaction, "error_cooldown_wait", { seconds: seconds.toString() })}`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const isInGuild = interaction.guild !== null;
    await interaction.deferReply({ ephemeral: isInGuild });

    const targetUser = interaction.options.getUser("user") || interaction.user;

    const inventory = getInventory(targetUser.id);
    const silver = inventory.items["silver"] || 0;
    const saloonTokens = inventory.items["saloon_token"] || 0;
    const xpData = getUserXp(targetUser.id);
    const profile = getUserProfile(targetUser.id);

    const card = await createProfileCard(
      targetUser,
      {
        silver,
        saloonTokens,
        xp: xpData.xp,
        level: xpData.level,
        bio: profile.bio,
        background: profile.background,
        phrase: profile.phrase,
      },
      interaction,
    );

    const isOwnProfile = targetUser.id === interaction.user.id;

    if (isOwnProfile) {
      const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("edit_bio")
          .setLabel(t(interaction, "profile_edit_bio"))
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId("edit_phrase")
          .setLabel("Editar Frase")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId("change_background")
          .setLabel(t(interaction, "profile_change_bg"))
          .setStyle(ButtonStyle.Secondary),
      );

      const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("shop_backgrounds")
          .setLabel(t(interaction, "profile_shop_bg"))
          .setStyle(ButtonStyle.Secondary),
      );

      await interaction.editReply({ files: [card], components: [row1, row2] });
    } else {
      await interaction.editReply({ files: [card] });
    }
  },
};

async function createProfileCard(
  user: User,
  stats: any,
  interaction: ChatInputCommandInteraction,
): Promise<AttachmentBuilder> {
  const canvas = createCanvas(1536, 1024);
  const ctx = canvas.getContext("2d");

  // Load custom background or use default hosted image
  let backgroundLoaded = false;
  if (stats.background) {
    // Find background by filename in backgroundManager
    const allBackgrounds = getAllBackgrounds();
    const bgData = allBackgrounds.find(
      (bg) => bg.filename === stats.background,
    );

    // Try to load from hosted URL first (if available)
    if (bgData?.imageUrl) {
      try {
        const bgImage = await loadImage(bgData.imageUrl);
        ctx.drawImage(bgImage, 0, 0, 1536, 1024);
        backgroundLoaded = true;
      } catch (error) {
        console.error(`Error loading ${stats.background} from URL:`, error);
      }
    }

    // Fallback to local file if URL failed or not available
    if (!backgroundLoaded) {
      try {
        const bgPath = path.join(
          process.cwd(),
          "assets",
          "profile-backgrounds",
          stats.background,
        );
        if (fs.existsSync(bgPath)) {
          const bgImage = await loadImage(bgPath);
          ctx.drawImage(bgImage, 0, 0, 1536, 1024);
          backgroundLoaded = true;
        }
      } catch (error) {
        console.error("Error loading custom background from file:", error);
      }
    }
  }

  // Default background: use hosted image
  if (!backgroundLoaded) {
    try {
      const defaultBgImage = await loadImage(
        "https://i.postimg.cc/RZhF5hYv/IMG-3267.png",
      );
      ctx.drawImage(defaultBgImage, 0, 0, 1536, 1024);
      backgroundLoaded = true;
    } catch (error) {
      console.error("Error loading default background from URL:", error);
      // Fallback gradient if URL fails
      const gradient = ctx.createLinearGradient(0, 0, 1536, 1024);
      gradient.addColorStop(0, "#0a7ea4");
      gradient.addColorStop(0.5, "#1d8fb5");
      gradient.addColorStop(1, "#2ba5c9");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1536, 1024);
    }
  }

  // Semi-transparent overlay (darker to improve readability)
  ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
  ctx.fillRect(0, 0, 1536, 1024);

  // "Rex" signature in top right (stylized handwriting)
  ctx.save();
  ctx.font = "italic bold 120px Nunito";
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.textAlign = "right";
  ctx.fillText("Rex", 1450, 130);
  ctx.restore();

  // Avatar square (top left corner)
  const avatarSize = 260;
  const avatarX = 50;
  const avatarY = 50;
  const avatarRadius = 20; // Rounded corners radius

  try {
    const avatarURL = user.displayAvatarURL({ extension: "png", size: 512 });
    const avatar = await loadImage(avatarURL);

    // Black square background
    ctx.fillStyle = "#000000";
    roundRect(ctx, avatarX - 8, avatarY - 8, avatarSize + 16, avatarSize + 16, avatarRadius + 8);
    ctx.fill();

    // White inner border
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 4;
    roundRect(ctx, avatarX - 4, avatarY - 4, avatarSize + 8, avatarSize + 8, avatarRadius + 4);
    ctx.stroke();

    // Draw avatar (square with rounded corners)
    ctx.save();
    roundRect(ctx, avatarX, avatarY, avatarSize, avatarSize, avatarRadius);
    ctx.clip();
    ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
    ctx.restore();
  } catch (error) {
    console.error("Error loading avatar:", error);
  }

  // Username next to avatar (horizontal) - Display Name@username format
  ctx.save();
  const usernameX = 350;
  const usernameY = 195;

  // Display name in large font
  ctx.font = "bold 100px Nunito";
  ctx.fillStyle = "#FFFFFF";
  ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
  ctx.shadowBlur = 15;

  // Use globalName (display name) if available, otherwise use username
  const displayName = (user as any).globalName || user.username;
  ctx.fillText(displayName, usernameX, usernameY);
  const displayNameWidth = ctx.measureText(displayName).width;

  // @username in smaller font
  ctx.font = "bold 60px Nunito";
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  ctx.fillText(
    `@${user.username}`,
    usernameX + displayNameWidth + 15,
    usernameY,
  );

  ctx.restore();

  // Stats section (left side, below avatar, stacked vertically)
  const statsX = 80;
  let statsY = 420;
  const statSpacing = 120;

  // Helper function to draw stat with emoji and value
  async function drawStat(
    emoji: string,
    emojiPath: string | null,
    value: string,
    label: string = "",
  ) {
    ctx.save();

    const emojiSize = 60;
    const emojiY = statsY - 40;

    // Try to load custom emoji image
    if (emojiPath) {
      try {
        const emojiImg = await loadImage(emojiPath);
        ctx.drawImage(emojiImg, statsX, emojiY, emojiSize, emojiSize);
      } catch (error) {
        // Fallback to Unicode emoji
        ctx.font = "bold 50px Nunito";
        ctx.fillText(emoji, statsX, statsY);
      }
    } else {
      // Use Unicode emoji
      ctx.font = "bold 50px Nunito";
      ctx.fillText(emoji, statsX, statsY);
    }

    // Value text
    ctx.font = "bold 48px Nunito";
    ctx.fillStyle = "#FFFFFF";
    ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
    ctx.shadowBlur = 8;

    if (label) {
      ctx.fillText(label + " " + value, statsX + 80, statsY);
    } else {
      ctx.fillText(value, statsX + 80, statsY);
    }

    ctx.restore();
    statsY += statSpacing;
  }

  // Stats in order:
  // 1. Saloon Tokens (🎫) - sem RC
  await drawStat(
    "🎫",
    CUSTOM_EMOJIS.SALOON_TOKEN,
    stats.saloonTokens.toLocaleString(),
    "",
  );

  // 2. Silver Coins (🪙)
  await drawStat(
    "🪙",
    CUSTOM_EMOJIS.SILVER_COIN,
    stats.silver.toLocaleString(),
    "",
  );

  // 3. Level with XP (⭐)
  const currentXP = stats.xp;
  const xpForCurrentLevel = getXpForLevel(stats.level);
  const xpForNextLevel = getXpForLevel(stats.level + 1);
  const xpInCurrentLevel = currentXP;

  ctx.save();
  const starEmojiSize = 60;
  const starY = statsY - 40;

  try {
    const starImg = await loadImage(CUSTOM_EMOJIS.STAR);
    ctx.drawImage(starImg, statsX, starY, starEmojiSize, starEmojiSize);
  } catch (error) {
    ctx.font = "bold 50px Nunito";
    ctx.fillText("⭐", statsX, statsY);
  }

  ctx.font = "bold 48px Nunito";
  ctx.fillStyle = "#FFFFFF";
  ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
  ctx.shadowBlur = 8;
  ctx.fillText(
    `${t(interaction, "profile_level")} ${stats.level}`,
    statsX + 80,
    statsY,
  );

  // XP in smaller text
  ctx.font = "bold 28px Nunito";
  ctx.fillStyle = "#CCCCCC";
  ctx.fillText(`${xpInCurrentLevel} XP`, statsX + 80, statsY + 35);
  ctx.restore();
  statsY += statSpacing;

  // "Sobre Mim" section (mais pro canto direito) - increased size
  const bioX = 700;
  const bioY = 360;
  const bioWidth = 700;
  const bioHeight = 280;

  // Semi-transparent dark box for bio
  ctx.fillStyle = "rgba(0, 30, 60, 0.75)";
  roundRect(ctx, bioX, bioY, bioWidth, bioHeight, 15);
  ctx.fill();

  // Border
  ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
  ctx.lineWidth = 3;
  roundRect(ctx, bioX, bioY, bioWidth, bioHeight, 15);
  ctx.stroke();

  // "Sobre Mim" title
  ctx.save();
  ctx.font = "bold 32px Nunito";
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText(t(interaction, "profile_about_me"), bioX + 25, bioY + 45);
  ctx.restore();

  // Bio text
  ctx.save();
  ctx.font = "28px Nunito Regular";
  ctx.fillStyle = "#E5E5E5";
  await wrapTextWithEmojis(
    ctx,
    stats.bio || t(interaction, "profile_no_bio"),
    bioX + 25,
    bioY + 90,
    bioWidth - 50,
    38,
    interaction,
  );
  ctx.restore();

  // Dropdown button icon (bottom right of bio box)
  const buttonX = bioX + bioWidth - 70;
  const buttonY = bioY + bioHeight - 60;
  const buttonSize = 50;

  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  roundRect(ctx, buttonX, buttonY, buttonSize, buttonSize, 10);
  ctx.fill();

  ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
  ctx.lineWidth = 2;
  roundRect(ctx, buttonX, buttonY, buttonSize, buttonSize, 10);
  ctx.stroke();

  // Dropdown icon (chevron down)
  ctx.save();
  ctx.font = "bold 32px Nunito";
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.fillText("▼", buttonX + buttonSize / 2, buttonY + 35);
  ctx.restore();

  // Frase personalizada (na parte inferior do card)
  if (stats.phrase && stats.phrase.trim() !== "") {
    const phraseY = 750;
    const phraseBoxHeight = 180;
    const phraseBoxPadding = 40;

    // Caixa semi-transparente para a frase
    ctx.fillStyle = "rgba(212, 175, 55, 0.15)";
    roundRect(ctx, 80, phraseY, 1376, phraseBoxHeight, 20);
    ctx.fill();

    // Borda dourada
    ctx.strokeStyle = "rgba(212, 175, 55, 0.6)";
    ctx.lineWidth = 3;
    roundRect(ctx, 80, phraseY, 1376, phraseBoxHeight, 20);
    ctx.stroke();

    // Aspas decorativas
    ctx.save();
    ctx.font = "italic bold 80px Nunito";
    ctx.fillStyle = "rgba(212, 175, 55, 0.4)";
    ctx.fillText("\"", 110, phraseY + 85);
    ctx.restore();

    // Texto da frase
    ctx.save();
    ctx.font = "italic 40px Nunito";
    ctx.fillStyle = "#FFFFFF";
    ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
    ctx.shadowBlur = 10;
    ctx.textAlign = "center";
    
    // Quebrar texto se for muito longo
    const maxPhraseWidth = 1200;
    const phraseWords = stats.phrase.split(" ");
    let currentLine = "";
    let lineY = phraseY + 75;
    
    for (const word of phraseWords) {
      const testLine = currentLine + word + " ";
      const testWidth = ctx.measureText(testLine).width;
      
      if (testWidth > maxPhraseWidth && currentLine !== "") {
        ctx.fillText(currentLine.trim(), 768, lineY);
        currentLine = word + " ";
        lineY += 50;
      } else {
        currentLine = testLine;
      }
    }
    ctx.fillText(currentLine.trim(), 768, lineY);
    ctx.restore();

    // Aspas de fechamento
    ctx.save();
    ctx.font = "italic bold 80px Nunito";
    ctx.fillStyle = "rgba(212, 175, 55, 0.4)";
    ctx.textAlign = "right";
    ctx.fillText("\"", 1426, phraseY + 150);
    ctx.restore();
  }

  return new AttachmentBuilder(canvas.toBuffer("image/png"), {
    name: "profile.png",
  });
}

function roundRect(
  ctx: any,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

async function wrapTextWithEmojis(
  ctx: any,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  if (!text || text.trim() === "") {
    ctx.fillText(t(interaction, "profile_no_bio"), x, y);
    return;
  }

  const parts = parseTextWithEmojis(text);
  const emojiSize = 20;
  const maxLines = 5;
  let currentLine: any[] = [];
  let currentWidth = 0;
  let lineCount = 0;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];

    if (part.type === "text") {
      const words = part.value.split(" ");

      for (let w = 0; w < words.length; w++) {
        const word = words[w] + (w < words.length - 1 ? " " : "");
        const wordWidth = ctx.measureText(word).width;

        if (currentWidth + wordWidth > maxWidth && currentLine.length > 0) {
          await drawLineWithEmojis(
            ctx,
            currentLine,
            x,
            y + lineCount * lineHeight,
            emojiSize,
          );
          lineCount++;

          if (lineCount >= maxLines) return;

          currentLine = [{ type: "text", value: word }];
          currentWidth = wordWidth;
        } else {
          currentLine.push({ type: "text", value: word });
          currentWidth += wordWidth;
        }
      }
    } else if (part.type === "emoji") {
      if (currentWidth + emojiSize > maxWidth && currentLine.length > 0) {
        await drawLineWithEmojis(
          ctx,
          currentLine,
          x,
          y + lineCount * lineHeight,
          emojiSize,
        );
        lineCount++;

        if (lineCount >= maxLines) return;

        currentLine = [part];
        currentWidth = emojiSize;
      } else {
        currentLine.push(part);
        currentWidth += emojiSize;
      }
    }
  }

  if (currentLine.length > 0 && lineCount < maxLines) {
    await drawLineWithEmojis(
      ctx,
      currentLine,
      x,
      y + lineCount * lineHeight,
      emojiSize,
    );
  }
}

async function drawLineWithEmojis(
  ctx: any,
  parts: any[],
  x: number,
  y: number,
  emojiSize: number,
): Promise<void> {
  let currentX = x;

  for (const part of parts) {
    if (part.type === "text") {
      ctx.fillText(part.value, currentX, y);
      currentX += ctx.measureText(part.value).width;
    } else if (part.type === "emoji" && part.path) {
      try {
        const emojiImg = await loadImage(part.path);
        ctx.drawImage(
          emojiImg,
          currentX,
          y - emojiSize + 4,
          emojiSize,
          emojiSize,
        );
        currentX += emojiSize + 2;
      } catch (error) {
        ctx.fillText(part.value, currentX, y);
        currentX += ctx.measureText(part.value).width;
      }
    }
  }
}
