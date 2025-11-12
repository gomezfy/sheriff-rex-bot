import { createCanvas, loadImage, GlobalFonts } from "@napi-rs/canvas";
import { getDataPath } from "./database";
import { User } from "discord.js";
import path from "path";
import { tLocale } from "./i18n";

// Register Nunito font
GlobalFonts.registerFromPath(
  path.join(process.cwd(), "assets/fonts/Nunito-Bold.ttf"),
  "Nunito",
);
GlobalFonts.registerFromPath(
  path.join(process.cwd(), "assets/fonts/Nunito-Regular.ttf"),
  "Nunito Regular",
);
GlobalFonts.registerFromPath(
  path.join(process.cwd(), "assets/fonts/Nunito-SemiBold.ttf"),
  "Nunito SemiBold",
);

export async function generateWantedPoster(
  user: User,
  bountyAmount: number,
  locale: string = "en-US",
): Promise<Buffer> {
  const width = 600;
  const height = 800;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  const oldPaperColor = "#d4a574";
  const darkBrown = "#3d2817";
  const mediumBrown = "#5c4033";
  const lightBrown = "#8b6f47";

  ctx.fillStyle = oldPaperColor;
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < 100; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = Math.random() * 3;
    ctx.fillStyle = `rgba(61, 40, 23, ${Math.random() * 0.15})`;
    ctx.fillRect(x, y, size, size);
  }

  const gradient = ctx.createRadialGradient(
    width / 2,
    height / 2,
    100,
    width / 2,
    height / 2,
    500,
  );
  gradient.addColorStop(0, "rgba(255, 255, 255, 0)");
  gradient.addColorStop(1, "rgba(92, 64, 51, 0.15)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "rgba(61, 40, 23, 0.08)";
  ctx.fillRect(0, 0, width, 40);
  ctx.fillRect(0, height - 40, width, 40);
  ctx.fillRect(0, 0, 40, height);
  ctx.fillRect(width - 40, 0, 40, height);

  ctx.strokeStyle = darkBrown;
  ctx.lineWidth = 12;
  ctx.strokeRect(15, 15, width - 30, height - 30);

  ctx.strokeStyle = mediumBrown;
  ctx.lineWidth = 4;
  ctx.strokeRect(27, 27, width - 54, height - 54);

  ctx.strokeStyle = lightBrown;
  ctx.lineWidth = 2;
  ctx.strokeRect(35, 35, width - 70, height - 70);

  ctx.fillStyle = darkBrown;
  ctx.font = "bold 80px Nunito";
  ctx.textAlign = "center";
  ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 3;
  ctx.fillText(tLocale(locale, "wanted_poster_title"), width / 2, 115);
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  ctx.strokeStyle = darkBrown;
  ctx.lineWidth = 3;
  ctx.setLineDash([5, 3]);
  ctx.beginPath();
  ctx.moveTo(120, 135);
  ctx.lineTo(480, 135);
  ctx.stroke();
  ctx.setLineDash([]);

  try {
    const avatarURL = user.displayAvatarURL({ extension: "png", size: 256 });
    const avatar = await loadImage(avatarURL);

    const avatarSize = 220;
    const avatarX = (width - avatarSize) / 2;
    const avatarY = 170;

    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 4;
    ctx.strokeStyle = darkBrown;
    ctx.lineWidth = 8;
    ctx.strokeRect(avatarX - 8, avatarY - 8, avatarSize + 16, avatarSize + 16);
    ctx.restore();

    ctx.strokeStyle = mediumBrown;
    ctx.lineWidth = 3;
    ctx.strokeRect(avatarX - 3, avatarY - 3, avatarSize + 6, avatarSize + 6);

    ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);

    ctx.strokeStyle = "rgba(61, 40, 23, 0.3)";
    ctx.lineWidth = 2;
    ctx.strokeRect(avatarX, avatarY, avatarSize, avatarSize);
  } catch (error) {
    console.error("Error loading avatar:", error);
    ctx.fillStyle = "#a0826d";
    ctx.fillRect(200, 170, 220, 220);
  }

  ctx.fillStyle = darkBrown;
  ctx.font = "bold 42px Nunito SemiBold";
  ctx.textAlign = "center";
  const username =
    user.tag.length > 20 ? `${user.tag.substring(0, 17)}...` : user.tag;
  ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
  ctx.shadowBlur = 2;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  ctx.fillText(username, width / 2, 450);
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  ctx.strokeStyle = mediumBrown;
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 4]);
  ctx.beginPath();
  ctx.moveTo(90, 480);
  ctx.lineTo(510, 480);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = darkBrown;
  ctx.font = "bold 38px Nunito";
  ctx.fillText(tLocale(locale, "wanted_poster_reward"), width / 2, 535);

  ctx.fillStyle = "#8b4513";
  ctx.font = "bold 65px Nunito";
  ctx.shadowColor = "rgba(255, 215, 0, 0.3)";
  ctx.shadowBlur = 8;
  ctx.fillText(`${bountyAmount.toLocaleString(locale)}`, width / 2, 605);

  ctx.font = "bold 35px Nunito";
  ctx.fillText(tLocale(locale, "wanted_poster_silver"), width / 2, 645);
  ctx.shadowBlur = 0;

  ctx.strokeStyle = mediumBrown;
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 4]);
  ctx.beginPath();
  ctx.moveTo(90, 670);
  ctx.lineTo(510, 670);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = darkBrown;
  ctx.font = "bold 24px Nunito Regular";
  ctx.fillText(tLocale(locale, "wanted_poster_dead_or_alive"), width / 2, 710);

  for (let i = 0; i < 4; i++) {
    const cornerX = i < 2 ? 45 : width - 45;
    const cornerY = i % 2 === 0 ? 45 : height - 45;
    ctx.fillStyle = mediumBrown;
    ctx.beginPath();
    ctx.arc(cornerX, cornerY, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  return canvas.toBuffer("image/png");
}
