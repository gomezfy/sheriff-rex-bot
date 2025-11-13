import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  AttachmentBuilder,
  MessageFlags,
} from "discord.js";
import { createCanvas, loadImage, GlobalFonts } from "@napi-rs/canvas";
import * as path from "path";
import { commandRateLimiter } from "../../utils/security";
import { t } from "../../utils/i18n";
import { getTopUsers } from "../../utils/inventoryManager";
import { getXpLeaderboard } from "../../utils/xpManager";
import { getGuildLeaderboard } from "../../utils/guildManager";
import {
  getTrophyEmoji,
  getStatsEmoji,
  getSaloonTokenEmoji,
  getSilverCoinEmoji,
  getCowboyEmoji,
  getCancelEmoji,
} from "../../utils/customEmojis";
import { getActiveFrameUrl } from "../../utils/frameManager";

GlobalFonts.registerFromPath(
  path.join(process.cwd(), "assets", "fonts", "Nunito-Bold.ttf"),
  "Nunito-Bold",
);
GlobalFonts.registerFromPath(
  path.join(process.cwd(), "assets", "fonts", "Nunito-Regular.ttf"),
  "Nunito",
);
GlobalFonts.registerFromPath(
  path.join(process.cwd(), "assets", "fonts", "Nunito-SemiBold.ttf"),
  "Nunito-SemiBold",
);

interface UserData {
  userId: string;
  amount: number;
  level?: number;
}

function drawRoundedRect(
  ctx: any,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
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

function drawGlowEffect(
  ctx: any,
  x: number,
  y: number,
  radius: number,
  color: string,
) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, color);
  gradient.addColorStop(0.5, color.replace("1)", "0.3)"));
  gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
}

function drawBadge(ctx: any, x: number, y: number, rank: number) {
  const colors = [
    { bg: "#FFD700", border: "#FFA500", glow: "rgba(255, 215, 0, 0.6)" },
    { bg: "#C0C0C0", border: "#A8A8A8", glow: "rgba(192, 192, 192, 0.6)" },
    { bg: "#CD7F32", border: "#B8733C", glow: "rgba(205, 127, 50, 0.6)" },
  ];

  const color = colors[rank];

  // Glow effect
  drawGlowEffect(ctx, x, y, 30, color.glow);

  // Badge background
  ctx.save();
  ctx.beginPath();

  // Star shape
  const spikes = 8;
  const outerRadius = 28;
  const innerRadius = 14;
  let rot = (Math.PI / 2) * 3;
  let step = Math.PI / spikes;

  ctx.moveTo(x, y - outerRadius);
  for (let i = 0; i < spikes; i++) {
    ctx.lineTo(
      x + Math.cos(rot) * outerRadius,
      y + Math.sin(rot) * outerRadius,
    );
    rot += step;
    ctx.lineTo(
      x + Math.cos(rot) * innerRadius,
      y + Math.sin(rot) * innerRadius,
    );
    rot += step;
  }
  ctx.lineTo(x, y - outerRadius);
  ctx.closePath();

  // Fill badge
  const badgeGradient = ctx.createRadialGradient(x, y, 0, x, y, outerRadius);
  badgeGradient.addColorStop(0, color.bg);
  badgeGradient.addColorStop(1, color.border);
  ctx.fillStyle = badgeGradient;
  ctx.fill();

  // Border
  ctx.strokeStyle = color.border;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  // Rank number
  ctx.fillStyle = "#000000";
  ctx.font = "bold 18px Nunito-Bold";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`${rank + 1}`, x, y + 1);
}

async function createLeaderboardImage(
  topUsers: UserData[],
  category: string,
  interaction: ChatInputCommandInteraction,
  topGuilds: any[] = [],
): Promise<Buffer> {
  const canvas = createCanvas(1400, 900);
  const ctx = canvas.getContext("2d");

  // Modern gradient background
  const bgGradient = ctx.createLinearGradient(0, 0, 1400, 900);
  bgGradient.addColorStop(0, "#0f0c29");
  bgGradient.addColorStop(0.5, "#302b63");
  bgGradient.addColorStop(1, "#24243e");
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, 1400, 900);

  // Decorative circles pattern
  ctx.fillStyle = "rgba(255, 255, 255, 0.02)";
  for (let i = 0; i < 15; i++) {
    const x = Math.random() * 1400;
    const y = Math.random() * 900;
    const radius = Math.random() * 100 + 50;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Header section with modern styling
  const headerGradient = ctx.createLinearGradient(0, 30, 0, 150);
  headerGradient.addColorStop(0, "rgba(255, 215, 0, 0.15)");
  headerGradient.addColorStop(1, "rgba(255, 215, 0, 0.05)");
  ctx.fillStyle = headerGradient;
  drawRoundedRect(ctx, 40, 30, 1320, 120, 20);
  ctx.fill();

  // Border glow
  ctx.strokeStyle = "rgba(255, 215, 0, 0.5)";
  ctx.lineWidth = 3;
  drawRoundedRect(ctx, 40, 30, 1320, 120, 20);
  ctx.stroke();

  const isXp = category === "xp";
  const isGuild = category === "guild";
  const emojiFileName = isGuild
    ? "guild.png"
    : isXp
      ? "xp.png"
      : category === "tokens"
        ? "saloon_token.png"
        : "silver_coin.png";
  const name = isGuild
    ? "GUILDAS"
    : isXp
      ? "XP"
      : category === "tokens"
        ? "SALOON TOKENS"
        : "SILVER COINS";
  const color = isGuild
    ? "#9B59B6"
    : isXp
      ? "#3498DB"
      : category === "tokens"
        ? "#FFD700"
        : "#E8E8E8";
  const secondaryColor = isGuild
    ? "#8E44AD"
    : isXp
      ? "#2980B9"
      : category === "tokens"
        ? "#FFA500"
        : "#C0C0C0";

  // Load emoji image
  let emojiImage;
  try {
    const emojiPath = path.join(
      process.cwd(),
      "assets",
      "custom-emojis",
      emojiFileName,
    );
    emojiImage = await loadImage(emojiPath);
  } catch (error) {
    console.error(`Failed to load emoji ${emojiFileName}:`, error);
  }

  // Title with shadow
  ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
  ctx.shadowBlur = 15;
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 3;

  // Draw emoji image if loaded
  if (emojiImage) {
    ctx.drawImage(emojiImage, 600, 50, 50, 50);
  }

  ctx.fillStyle = color;
  ctx.font = "bold 56px Nunito-Bold";
  ctx.textAlign = "center";
  ctx.fillText(name, 750, 85);

  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
  ctx.font = "24px Nunito-SemiBold";
  ctx.fillText("LEADERBOARD", 700, 125);

  // Main leaderboard section
  const mainY = 180;

  // Left panel - Rankings
  ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
  drawRoundedRect(ctx, 40, mainY, 850, 650, 15);
  ctx.fill();

  ctx.strokeStyle = "rgba(255, 215, 0, 0.3)";
  ctx.lineWidth = 2;
  drawRoundedRect(ctx, 40, mainY, 850, 650, 15);
  ctx.stroke();

  // Right panel - Top 3 Avatars
  ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
  drawRoundedRect(ctx, 920, mainY, 440, 650, 15);
  ctx.fill();

  ctx.strokeStyle = "rgba(255, 215, 0, 0.3)";
  ctx.lineWidth = 2;
  drawRoundedRect(ctx, 920, mainY, 440, 650, 15);
  ctx.stroke();

  // Panel titles
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 24px Nunito-Bold";
  ctx.textAlign = "left";
  ctx.fillText(isGuild ? "TOP GUILDAS" : "TOP COWBOYS", 60, mainY + 35);

  ctx.textAlign = "center";
  ctx.fillText("HALL OF FAME", 1140, mainY + 35);

  // Separator line
  ctx.strokeStyle = "rgba(255, 215, 0, 0.3)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(60, mainY + 50);
  ctx.lineTo(870, mainY + 50);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(940, mainY + 50);
  ctx.lineTo(1340, mainY + 50);
  ctx.stroke();

  // Find current user's position
  const currentUserId = interaction.user.id;
  let currentUserRank = -1;
  let currentUserAmount = 0;

  for (let i = 0; i < topUsers.length; i++) {
    if (topUsers[i].userId === currentUserId) {
      currentUserRank = i;
      currentUserAmount = topUsers[i].amount;
      break;
    }
  }

  // Draw rankings
  if (isGuild) {
    // Desenhar ranking de guildas
    for (let i = 0; i < Math.min(topGuilds.length, 10); i++) {
      const guildData = topGuilds[i];
      const y = mainY + 95 + i * 58;

      const medals = ["1st", "2nd", "3rd"];

      // Rank indicator
      if (i < 3) {
        ctx.fillStyle = i === 0 ? "#FFD700" : i === 1 ? "#E8E8E8" : "#CD7F32";
        ctx.font = "bold 28px Nunito-Bold";
        ctx.textAlign = "center";
        ctx.fillText(medals[i], 100, y);
      } else {
        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctx.font = "bold 24px Nunito-Bold";
        ctx.textAlign = "center";
        ctx.fillText(`#${i + 1}`, 100, y);
      }

      // Nome da Guilda
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.font = i < 3 ? "bold 26px Nunito-Bold" : "24px Nunito";
      ctx.textAlign = "left";
      const guildName = guildData.guild.name || "Unknown";
      const displayName =
        guildName.length > 22 ? guildName.substring(0, 22) + "..." : guildName;
      ctx.fillText(`🏰 ${displayName}`, 150, y);

      // Level e membros
      const guildInfo = `Nv ${guildData.guild.level} • ${guildData.guild.members.length} membros`;
      ctx.fillStyle =
        i < 3
          ? i === 0
            ? "#FFD700"
            : i === 1
              ? "#E8E8E8"
              : "#CD7F32"
          : secondaryColor;
      ctx.font = i < 3 ? "bold 28px Nunito-Bold" : "24px Nunito-SemiBold";
      ctx.textAlign = "right";
      ctx.fillText(guildInfo, 850, y);
    }
  } else {
    // Desenhar ranking de usuários
    for (let i = 0; i < Math.min(topUsers.length, 10); i++) {
      const userData = topUsers[i];
      const y = mainY + 95 + i * 58;
      const isCurrentUser = userData.userId === currentUserId;

      // Highlight current user
      if (isCurrentUser) {
        ctx.fillStyle = "rgba(255, 215, 0, 0.15)";
        drawRoundedRect(ctx, 55, y - 35, 820, 50, 8);
        ctx.fill();

        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        drawRoundedRect(ctx, 55, y - 35, 820, 50, 8);
        ctx.stroke();
      }

      let user;
      try {
        user = await interaction.client.users.fetch(userData.userId);
      } catch (error) {
        user = { username: "Unknown User", discriminator: "0000" };
      }

      const medals = ["1st", "2nd", "3rd"];

      // Rank indicator
      if (i < 3) {
        ctx.fillStyle = i === 0 ? "#FFD700" : i === 1 ? "#E8E8E8" : "#CD7F32";
        ctx.font = "bold 28px Nunito-Bold";
        ctx.textAlign = "center";
        ctx.fillText(medals[i], 100, y);
      } else {
        ctx.fillStyle = isCurrentUser ? color : "rgba(255, 255, 255, 0.6)";
        ctx.font = "bold 24px Nunito-Bold";
        ctx.textAlign = "center";
        ctx.fillText(`#${i + 1}`, 100, y);
      }

      // Username
      ctx.fillStyle = isCurrentUser ? "#FFFFFF" : "rgba(255, 255, 255, 0.9)";
      ctx.font =
        i < 3
          ? "bold 26px Nunito-Bold"
          : isCurrentUser
            ? "bold 24px Nunito-SemiBold"
            : "24px Nunito";
      ctx.textAlign = "left";
      const username = user.username || "Unknown";
      const displayName =
        username.length > 22 ? username.substring(0, 22) + "..." : username;
      ctx.fillText(displayName, 150, y);

      // Amount with icon
      const amountText = isXp
        ? `Level ${userData.level} (${userData.amount.toLocaleString()} XP)`
        : `${userData.amount.toLocaleString()}`;
      ctx.fillStyle =
        i < 3
          ? i === 0
            ? "#FFD700"
            : i === 1
              ? "#E8E8E8"
              : "#CD7F32"
          : isCurrentUser
            ? color
            : secondaryColor;
      ctx.font = i < 3 ? "bold 28px Nunito-Bold" : "24px Nunito-SemiBold";
      ctx.textAlign = "right";
      ctx.fillText(amountText, 820, y);

      // Draw emoji image
      if (emojiImage && !isXp) {
        ctx.drawImage(emojiImage, 835, y - 14, 24, 24);
      }
    }
  }

  // Normalize data for top 3 avatars (works for all categories)
  const topThreeEntries = isGuild
    ? topGuilds.slice(0, 3).map((g, idx) => ({
        userId: g.guild.leaderId,
        amount: g.score,
        level: g.guild.level,
        displayLabel: g.guild.name, // Show guild name
        isGuildEntry: true,
        guildIndex: idx,
      }))
    : topUsers.slice(0, 3).map((u) => ({
        userId: u.userId,
        amount: u.amount,
        level: u.level,
        displayLabel: null, // Will use user.username
        isGuildEntry: false,
        guildIndex: -1,
      }));

  // Draw top 3 avatars in right panel (adjusted for 120x120 avatars)
  const avatarPositions = [
    { x: 1140, y: mainY + 130 }, // 1st
    { x: 1140, y: mainY + 320 }, // 2nd
    { x: 1140, y: mainY + 510 }, // 3rd
  ];

  for (let i = 0; i < topThreeEntries.length; i++) {
    const userData = topThreeEntries[i];
    const pos = avatarPositions[i];

    let user;
    try {
      user = await interaction.client.users.fetch(userData.userId);
      const avatarURL = user.displayAvatarURL({ extension: "png", size: 256 });
      const avatar = await loadImage(avatarURL);

      const avatarSize = 120;
      const avatarX = pos.x - avatarSize / 2;
      const avatarY = pos.y - avatarSize / 2;
      const avatarRadius = 10; // Rounded corners radius

      // Glow effect
      const glowColor =
        i === 0
          ? "rgba(255, 215, 0, 0.4)"
          : i === 1
            ? "rgba(192, 192, 192, 0.4)"
            : "rgba(205, 127, 50, 0.4)";
      drawGlowEffect(ctx, pos.x, pos.y, 80, glowColor);

      // Draw avatar with rounded square mask (same as profile.ts)
      ctx.save();
      drawRoundedRect(ctx, avatarX, avatarY, avatarSize, avatarSize, avatarRadius);
      ctx.clip();
      ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
      ctx.restore();

      // Draw frame overlay if user has an active frame (140x140 centered over 120x120 avatar)
      const userFrameUrl = getActiveFrameUrl(userData.userId);
      if (userFrameUrl) {
        try {
          const frame = await loadImage(userFrameUrl);
          const frameSize = 140;
          const frameX = avatarX - (frameSize - avatarSize) / 2;
          const frameY = avatarY - (frameSize - avatarSize) / 2;
          ctx.drawImage(frame, frameX, frameY, frameSize, frameSize);
        } catch (error) {
          console.error("Error loading frame overlay:", error);
        }
      }

      // Medal image on top right corner of avatar
      const medalFiles = ["gold_medal.png", "silver_medal.png", "bronze_medal.png"];
      try {
        const medalPath = path.join(
          process.cwd(),
          "assets",
          "custom-emojis",
          medalFiles[i],
        );
        const medalImage = await loadImage(medalPath);
        const medalSize = 40;
        ctx.drawImage(medalImage, avatarX + avatarSize - 15, avatarY - 10, medalSize, medalSize);
      } catch (error) {
        console.error(`Failed to load medal ${medalFiles[i]}:`, error);
      }

      // Border color for text
      const borderColor = i === 0 ? "#FFD700" : i === 1 ? "#E8E8E8" : "#CD7F32";

      // Display name below avatar (guild name for guilds, username for users)
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 22px Nunito-Bold";
      ctx.textAlign = "center";
      const displayName = userData.displayLabel
        ? userData.displayLabel.substring(0, 18) // Guild name
        : (user.username || "Unknown").substring(0, 18); // User name
      ctx.fillText(displayName, pos.x, pos.y + avatarSize / 2 + 30);

      // Amount (formatted per category using normalized data)
      ctx.fillStyle = borderColor;
      ctx.font = "bold 20px Nunito-Bold";
      ctx.textAlign = "center";
      const amountStr = userData.isGuildEntry
        ? `Nv ${userData.level}` // Guild level
        : isXp
          ? `Level ${userData.level}` // XP level
          : `${userData.amount.toLocaleString()}`; // Tokens/Silver amount
      const textWidth = ctx.measureText(amountStr).width;
      ctx.fillText(
        amountStr,
        pos.x - (isXp || userData.isGuildEntry ? 0 : 10),
        pos.y + avatarSize / 2 + 55,
      );

      // Draw emoji image (only for tokens/silver, not XP or guilds)
      if (emojiImage && !isXp && !userData.isGuildEntry) {
        ctx.drawImage(
          emojiImage,
          pos.x + textWidth / 2 - 5,
          pos.y + avatarSize / 2 + 40,
          20,
          20,
        );
      }
    } catch (error) {
      console.error(
        `Failed to load avatar for user ${userData.userId}:`,
        error,
      );
    }
  }

  // Footer with stats
  const footerGradient = ctx.createLinearGradient(0, 850, 0, 900);
  footerGradient.addColorStop(0, "rgba(212, 175, 55, 0.15)");
  footerGradient.addColorStop(1, "rgba(212, 175, 55, 0.05)");
  ctx.fillStyle = footerGradient;
  ctx.fillRect(0, 850, 1400, 50);

  // Calculate total
  const total = isGuild
    ? topGuilds.length
    : isXp
      ? topUsers.length
      : topUsers.reduce((sum, user) => sum + user.amount, 0);

  // Load and draw cowboy emoji image
  try {
    const cowboyEmojiPath = path.join(
      process.cwd(),
      "assets",
      "custom-emojis",
      "cowboy.png",
    );
    const cowboyEmojiImg = await loadImage(cowboyEmojiPath);
    ctx.drawImage(cowboyEmojiImg, 50, 862, 20, 20);
  } catch (error) {
    console.error("Failed to load cowboy emoji:", error);
  }

  ctx.fillStyle = "#d4af37";
  ctx.font = "18px Nunito-SemiBold";
  ctx.textAlign = "left";
  ctx.fillText(`Sheriff Rex Bot`, 75, 880);

  ctx.textAlign = "center";
  const totalText = isGuild
    ? `${total} Guildas Ativas`
    : isXp
      ? `${total} Active Cowboys`
      : `Total Wealth: ${total.toLocaleString()}`;
  ctx.fillText(totalText, 650, 880);
  if (emojiImage && !isXp && !isGuild) {
    ctx.drawImage(emojiImage, 730, 866, 18, 18);
  }
  const countText = isGuild
    ? `• ${topGuilds.length} Guildas`
    : `• ${topUsers.length} Cowboys`;
  ctx.fillText(countText, 800, 880);

  ctx.textAlign = "right";
  if (currentUserRank !== -1) {
    const yourRankText = isXp
      ? `Your Rank: #${currentUserRank + 1} (Level ${topUsers[currentUserRank].level})`
      : `Your Rank: #${currentUserRank + 1} • ${currentUserAmount.toLocaleString()}`;
    ctx.fillText(yourRankText, 1330, 880);
    if (emojiImage && !isXp) {
      ctx.drawImage(emojiImage, 1335, 866, 18, 18);
    }
  } else {
    ctx.fillText(`Keep earning to join the leaderboard!`, 1350, 880);
  }

  return canvas.toBuffer("image/png");
}

export default {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("View the top cowboys in the Wild West!")
    .setContexts([0, 1, 2]) // Guild, BotDM, PrivateChannel
    .setIntegrationTypes([0, 1]) // Guild Install, User Install
    .addStringOption((option) =>
      option
        .setName("category")
        .setDescription("Leaderboard category")
        .setRequired(false)
        .addChoices(
          { name: "Saloon Tokens", value: "tokens" },
          { name: "Silver Coins", value: "silver" },
          { name: "XP", value: "xp" },
          { name: "🏰 Guildas", value: "guild" },
        ),
    ),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    // Rate limiting: 5 second cooldown
    const cooldownMs = 5000;
    if (
      !commandRateLimiter.canExecute(
        "leaderboard",
        interaction.user.id,
        cooldownMs,
      )
    ) {
      const remaining = commandRateLimiter.getRemainingCooldown(
        "leaderboard",
        interaction.user.id,
        cooldownMs,
      );
      const seconds = Math.ceil(remaining / 1000);
      await interaction.reply({
        content: `⏱️ Please wait ${seconds} more second${seconds > 1 ? "s" : ""} before using this command again.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await interaction.deferReply();

    const category = interaction.options.getString("category") || "tokens";
    let topUsers: UserData[];
    let topGuilds: any[] = [];

    if (category === "guild") {
      topGuilds = getGuildLeaderboard(10);
      if (topGuilds.length === 0) {
        const cancelEmoji = getCancelEmoji();
        await interaction.editReply({
          content: `${cancelEmoji} Não há guildas criadas ainda!`,
        });
        return;
      }
      topUsers = [];
    } else if (category === "xp") {
      const xpUsers = getXpLeaderboard(10);
      topUsers = xpUsers.map((u) => ({
        userId: u.userId,
        amount: u.xp,
        level: u.level,
      }));
    } else {
      const itemType = category === "tokens" ? "saloon_token" : "silver";
      topUsers = getTopUsers(itemType, 10);
    }

    if (topUsers.length === 0 && topGuilds.length === 0) {
      const cancelEmoji = getCancelEmoji();
      await interaction.editReply({
        content: `${cancelEmoji} No users found on the ${category} leaderboard!`,
      });
      return;
    }

    const imageBuffer = await createLeaderboardImage(
      topUsers,
      category,
      interaction,
      topGuilds,
    );
    const attachment = new AttachmentBuilder(imageBuffer, {
      name: "leaderboard.png",
    });

    const trophyEmoji = getTrophyEmoji();
    const categoryEmoji =
      category === "guild"
        ? "🏰"
        : category === "xp"
          ? "⭐"
          : category === "tokens"
            ? getSaloonTokenEmoji()
            : getSilverCoinEmoji();
    const categoryName =
      category === "guild"
        ? "Guildas"
        : category === "xp"
          ? "XP"
          : category === "tokens"
            ? "Saloon Tokens"
            : "Silver Coins";
    const statsEmoji = getStatsEmoji();

    await interaction.editReply({
      content: `${trophyEmoji} WILD WEST LEADERBOARD ${trophyEmoji}\n${statsEmoji} Category: ${categoryEmoji} ${categoryName}`,
      files: [attachment],
    });
  },
};
