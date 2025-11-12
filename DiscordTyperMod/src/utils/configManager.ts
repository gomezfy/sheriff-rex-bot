import fs from "fs";
import path from "path";
import { getDataPath } from "./database";

const configPath = path.join(getDataPath("data"), "guild-config.json");

interface GuildConfig {
  logsEnabled: boolean;
  logsChannel: string;
  welcomeEnabled: boolean;
  welcomeChannel: string;
  welcomeMessage: string;
  wantedEnabled: boolean;
  wantedChannel: string;
  language: string;
}

function ensureConfigFile(): void {
  const dataDir = path.dirname(configPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, "{}");
  }
}

export function loadConfigs(): Record<string, GuildConfig> {
  ensureConfigFile();
  const data = fs.readFileSync(configPath, "utf-8");
  return JSON.parse(data);
}

export function loadGuildConfig(guildId: string): GuildConfig {
  const configs = loadConfigs();
  return (
    configs[guildId] || {
      logsEnabled: false,
      logsChannel: "",
      welcomeEnabled: false,
      welcomeChannel: "",
      welcomeMessage: "Welcome {user} to {server}! 🤠",
      wantedEnabled: false,
      wantedChannel: "",
      language: "en-US",
    }
  );
}

export function saveGuildConfig(guildId: string, config: GuildConfig): void {
  ensureConfigFile();
  const configs = loadConfigs();
  configs[guildId] = config;
  fs.writeFileSync(configPath, JSON.stringify(configs, null, 2));
}
