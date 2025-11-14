import fs from "fs";
import { getDataPath } from "./database";
import path from "path";

const dataDir = getDataPath("data");
const profilesFile = path.join(dataDir, "profiles.json");

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Ensure profiles file exists
if (!fs.existsSync(profilesFile)) {
  fs.writeFileSync(profilesFile, JSON.stringify({}, null, 2));
}

interface UserProfile {
  bio: string;
  background: string | null;
  phrase?: string;
  ownedBackgrounds?: string[];
  colorTheme?: string;
}

export function getUserProfile(userId: string): UserProfile {
  const data = fs.readFileSync(profilesFile, "utf8");
  const profiles = JSON.parse(data);

  if (!profiles[userId]) {
    profiles[userId] = {
      bio: "A mysterious cowboy wandering the Wild West...",
      background: null,
    };
  }

  return profiles[userId];
}

export function setUserBio(userId: string, bio: string): boolean {
  const data = fs.readFileSync(profilesFile, "utf8");
  const profiles = JSON.parse(data);

  if (!profiles[userId]) {
    profiles[userId] = { bio: "", background: null };
  }

  profiles[userId].bio = bio;
  fs.writeFileSync(profilesFile, JSON.stringify(profiles, null, 2));

  return true;
}

export function setUserBackground(
  userId: string,
  backgroundName: string,
): boolean {
  const data = fs.readFileSync(profilesFile, "utf8");
  const profiles = JSON.parse(data);

  if (!profiles[userId]) {
    profiles[userId] = {
      bio: "A mysterious cowboy wandering the Wild West...",
      background: null,
    };
  }

  profiles[userId].background = backgroundName;
  fs.writeFileSync(profilesFile, JSON.stringify(profiles, null, 2));

  return true;
}

export function setUserProfile(userId: string, profile: UserProfile): boolean {
  const data = fs.readFileSync(profilesFile, "utf8");
  const profiles = JSON.parse(data);

  profiles[userId] = profile;
  fs.writeFileSync(profilesFile, JSON.stringify(profiles, null, 2));

  return true;
}

export function setUserPhrase(userId: string, phrase: string): boolean {
  const data = fs.readFileSync(profilesFile, "utf8");
  const profiles = JSON.parse(data);

  // Trim whitespace to avoid storing effectively empty strings
  const trimmedPhrase = phrase.trim();

  if (!profiles[userId]) {
    profiles[userId] = {
      bio: "A mysterious cowboy wandering the Wild West...",
      background: null,
      phrase: trimmedPhrase,
    };
  } else {
    profiles[userId].phrase = trimmedPhrase;
  }

  fs.writeFileSync(profilesFile, JSON.stringify(profiles, null, 2));

  return true;
}

export function setUserColorTheme(userId: string, themeId: string): boolean {
  const { COLOR_THEMES } = require("./profileColorThemes");
  
  const validTheme = COLOR_THEMES.find((t: any) => t.id === themeId);
  if (!validTheme) {
    return false;
  }

  const data = fs.readFileSync(profilesFile, "utf8");
  const profiles = JSON.parse(data);

  if (!profiles[userId]) {
    profiles[userId] = {
      bio: "A mysterious cowboy wandering the Wild West...",
      background: null,
      colorTheme: themeId,
    };
  } else {
    profiles[userId].colorTheme = themeId;
  }

  fs.writeFileSync(profilesFile, JSON.stringify(profiles, null, 2));

  return true;
}

export function getUserColorTheme(userId: string): string {
  const profile = getUserProfile(userId);
  return profile.colorTheme || "default";
}
