import path from "path";
import { getDataPath } from "./database";
import fs from "fs";

export const EMOJI_MAP: Record<string, string> = {
  "😊": "smile.png",
  "😎": "sunglasses.png",
  "🤠": "cowboy.png",
  "⭐": "star.png",
  "💰": "moneybag.png",
  "🎯": "target.png",
  "🏆": "trophy.png",
  "⚡": "lightning.png",
  "✨": "sparkles.png",
  "🔥": "fire.png",
  "💎": "gem.png",
  "🎲": "dice.png",
  "🎰": "slot.png",
  "🌵": "cactus.png",
  "🏜️": "desert.png",
  "🔫": "gun.png",
  "🐴": "horse.png",
  "🌟": "glowing-star.png",
  "💪": "muscle.png",
  "🎉": "party.png",
  "❤️": "heart.png",
  "👑": "crown.png",
  "🚀": "rocket.png",
  "🎮": "gamepad.png",
  "🍺": "beer.png",
  "🌙": "moon.png",
  "☀️": "sun.png",
  "🌈": "rainbow.png",
  "💀": "skull.png",
  "🎪": "circus.png",
  "🐱": "vibing-cat.gif",
  "😂": "lmao.gif",
  "👋": "wave.gif",
  "🇫": "f.gif",
  "🚫": "ban.gif",
  "🕹️": "mario-dance.gif",
  "🥇": "number-one.gif",
  "📈": "boost.gif",
  "⏰": "alarm.gif",
  "🔤": "wordle.gif",
  "👨‍💼": "owner-crown.gif",
  "🥁": "cowboy-bongo.gif",
  "😑": "blink.gif",
  "🕺": "cowboy-bop.gif",
  "🦆": "yeehaw-goose.gif",
  "🤗": "meowdy.png",
  "🎩": "cat-cowboy-hat.png",
  "🐈": "cat-cowboy.png",
  "👍": "aye-cowboy.png",
  "😢": "sad-cowboy.png",
  "😬": "yikes-cowboy.png",
  "😳": "wtf-stare.png",
  "👀": "stare.png",
  "😔": "ashamed.png",
  "🎸": "cowboy-rdia.png",
  "⚔️": "big-iron.png",
};

const EMOJI_DIR = getDataPath("assets", "emojis");

export function getEmojiPath(emoji: string): string | null {
  const filename = EMOJI_MAP[emoji];
  if (!filename) {
    return null;
  }

  const filepath = path.join(EMOJI_DIR, filename);

  if (fs.existsSync(filepath)) {
    return filepath;
  }

  return null;
}

export function hasEmojis(text: string): boolean {
  if (!text) {
    return false;
  }

  for (const emoji of Object.keys(EMOJI_MAP)) {
    if (text.includes(emoji)) {
      return true;
    }
  }

  return false;
}

export function parseTextWithEmojis(
  text: string,
): Array<{ type: string; value: string; path?: string | null }> {
  if (!text) {
    return [];
  }

  const parts: Array<{ type: string; value: string; path?: string | null }> =
    [];
  let currentText = "";

  const chars = Array.from(text);

  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];

    if (EMOJI_MAP[char]) {
      if (currentText) {
        parts.push({ type: "text", value: currentText });
        currentText = "";
      }

      parts.push({ type: "emoji", value: char, path: getEmojiPath(char) });
    } else {
      currentText += char;
    }
  }

  if (currentText) {
    parts.push({ type: "text", value: currentText });
  }

  return parts;
}
