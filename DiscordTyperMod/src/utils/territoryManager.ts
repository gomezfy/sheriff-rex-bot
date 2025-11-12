import { readData, writeData } from "./database";

/**
 * Validates if a URL is safe to use in Discord embeds
 * @param url
 */
function isValidImageUrl(url: string): boolean {
  if (!url) {
    return false;
  }

  try {
    const parsedUrl = new URL(url);
    // Only allow https for security
    if (parsedUrl.protocol !== "https:") {
      return false;
    }

    // Check for common image hosting domains (optional - can be removed for more flexibility)
    const allowedDomains = [
      "cdn.discordapp.com",
      "media.discordapp.net",
      "i.imgur.com",
      "imgur.com",
      "i.ibb.co",
      "cdn.jsdelivr.net",
      "raw.githubusercontent.com",
      "cloudinary.com",
      "imagekit.io",
      "replit.dev", // Allow Replit-hosted images
    ];

    // If you want to allow any HTTPS URL, comment out this check:
    // return true;

    // Otherwise, check if domain is in allowed list
    return allowedDomains.some((domain) => parsedUrl.hostname.includes(domain));
  } catch {
    return false;
  }
}

export interface Territory {
  id: string;
  name: string;
  description: string;
  price: number;
  emoji: string;
  benefits: string[];
  image?: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  color: number;
}

export interface TerritoryOwnership {
  [userId: string]: {
    territories: string[]; // Array of territory IDs
    purchaseHistory: {
      territoryId: string;
      purchaseDate: number;
      pricePaid: number;
    }[];
  };
}

// Get the base URL for bot assets from environment
const getAssetUrl = (filename: string): string => {
  const domain =
    process.env.REPLIT_DEV_DOMAIN ||
    process.env.REPLIT_DOMAINS ||
    "localhost:5000";
  return `https://${domain}/bot-assets/${filename}`;
};

// Define all available territories
export const TERRITORIES: Territory[] = [
  {
    id: "saloon_business",
    name: "Saloon Business",
    emoji: "🍺",
    description:
      "Own a bustling saloon in the heart of town! Serve drinks, host events, and watch the coins roll in.",
    price: 225000,
    benefits: ["💰 Generate 5,000 Silver Coins daily"],
    rarity: "rare",
    color: 0xff8c00, // Dark orange
    image: getAssetUrl("saloon.png"),
  },
  {
    id: "gold_mine_shares",
    name: "Gold Mine Shares",
    emoji: "⛏️",
    description:
      "Invest in the richest gold mine in the West! Your shares will bring you steady income from precious metals.",
    price: 560000,
    benefits: [
      "💰 Generate 12,000 Silver Coins daily",
      "⚡ 50% faster mining operations",
    ],
    rarity: "epic",
    color: 0xffd700, // Gold
    image: getAssetUrl("mine.png"),
  },
  {
    id: "ranch",
    name: "Ranch",
    emoji: "🐴",
    description:
      "Build your own ranch with cattle, horses, and wide open plains. A true cowboy's dream come true!",
    price: 720000,
    benefits: [
      "💰 Generate 15,000 Silver Coins daily",
      "🐄 Receive 8 Cattle weekly",
    ],
    rarity: "legendary",
    color: 0x8b4513, // Saddle brown
    image: getAssetUrl("ranch.png"),
  },
];

/**
 * Get territory data by ID
 * @param territoryId
 */
export function getTerritory(territoryId: string): Territory | undefined {
  return TERRITORIES.find((t) => t.id === territoryId);
}

/**
 * Get all territories owned by a user
 * @param userId
 */
export function getUserTerritories(userId: string): string[] {
  const data: TerritoryOwnership = readData("territories.json");
  return data[userId]?.territories || [];
}

/**
 * Check if user owns a specific territory
 * @param userId
 * @param territoryId
 */
export function ownsTerritory(userId: string, territoryId: string): boolean {
  const territories = getUserTerritories(userId);
  return territories.includes(territoryId);
}

/**
 * Purchase a territory for a user
 * @param userId
 * @param territoryId
 * @param pricePaid
 */
export function purchaseTerritory(
  userId: string,
  territoryId: string,
  pricePaid: number,
): boolean {
  const data: TerritoryOwnership = readData("territories.json");

  // Initialize user data if doesn't exist
  if (!data[userId]) {
    data[userId] = {
      territories: [],
      purchaseHistory: [],
    };
  }

  // Check if already owns it
  if (data[userId].territories.includes(territoryId)) {
    return false;
  }

  // Add territory
  data[userId].territories.push(territoryId);
  data[userId].purchaseHistory.push({
    territoryId,
    purchaseDate: Date.now(),
    pricePaid,
  });

  writeData("territories.json", data);
  return true;
}

/**
 * Get user's purchase history
 * @param userId
 */
export function getPurchaseHistory(userId: string) {
  const data: TerritoryOwnership = readData("territories.json");
  return data[userId]?.purchaseHistory || [];
}

/**
 * Get total territories owned by user
 * @param userId
 */
export function getTerritoryCount(userId: string): number {
  return getUserTerritories(userId).length;
}

/**
 * Get all users who own territories (for stats)
 */
export function getAllTerritoryOwners(): { userId: string; count: number }[] {
  const data: TerritoryOwnership = readData("territories.json");
  return Object.entries(data).map(([userId, userData]) => ({
    userId,
    count: userData.territories.length,
  }));
}
