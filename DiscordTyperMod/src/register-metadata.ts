/**
 * Register Role Connection Metadata with Discord
 *
 * This script registers the metadata schema with Discord's API,
 * defining what data can be used for Linked Roles requirements.
 *
 * Run this once before using Linked Roles:
 * npx ts-node src/register-metadata.ts
 */

import axios from "axios";
import "dotenv/config";

const DISCORD_CLIENT_ID =
  process.env.DISCORD_CLIENT_ID || process.env.CLIENT_ID || "";
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || "";
const DISCORD_API = "https://discord.com/api/v10";

// Metadata schema definition
const METADATA_SCHEMA = [
  {
    key: "total_coins",
    name: "Total Coins",
    description: "Total wealth in Silver Coins",
    type: 2, // INTEGER_GREATER_THAN_OR_EQUAL
  },
  {
    key: "total_tokens",
    name: "Total Tokens",
    description: "Saloon Tokens balance",
    type: 2, // INTEGER_GREATER_THAN_OR_EQUAL
  },
  {
    key: "level",
    name: "Level",
    description: "User level based on wealth",
    type: 2, // INTEGER_GREATER_THAN_OR_EQUAL
  },
  {
    key: "bounties_captured",
    name: "Bounties Captured",
    description: "Number of bounties captured",
    type: 2, // INTEGER_GREATER_THAN_OR_EQUAL
  },
  {
    key: "games_played",
    name: "Games Played",
    description: "Total gambling games played",
    type: 2, // INTEGER_GREATER_THAN_OR_EQUAL
  },
  {
    key: "mining_sessions",
    name: "Mining Sessions",
    description: "Number of mining sessions completed",
    type: 2, // INTEGER_GREATER_THAN_OR_EQUAL
  },
];

/**
 * Get bot access token using client credentials
 */
async function getBotAccessToken(): Promise<string> {
  if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET) {
    throw new Error(
      "DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET must be set in environment variables",
    );
  }

  const params = new URLSearchParams({
    grant_type: "client_credentials",
    scope: "role_connections.write",
  });

  try {
    const response = await axios.post(
      `${DISCORD_API}/oauth2/token`,
      params.toString(),
      {
        auth: {
          username: DISCORD_CLIENT_ID,
          password: DISCORD_CLIENT_SECRET,
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    return response.data.access_token;
  } catch (error: any) {
    console.error(
      "❌ Error getting bot access token:",
      error.response?.data || error.message,
    );
    throw error;
  }
}

/**
 * Register metadata schema with Discord
 */
async function registerMetadata(): Promise<void> {
  console.log("🔧 Registering Role Connection Metadata with Discord...\n");

  try {
    // Get bot access token
    console.log("1️⃣ Getting bot access token...");
    const accessToken = await getBotAccessToken();
    console.log("✅ Access token obtained\n");

    // Register metadata
    console.log("2️⃣ Registering metadata schema...");
    const response = await axios.put(
      `${DISCORD_API}/applications/${DISCORD_CLIENT_ID}/role-connections/metadata`,
      METADATA_SCHEMA,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("✅ Metadata registered successfully!\n");
    console.log("📊 Registered Metadata Fields:");
    response.data.forEach((field: any, index: number) => {
      console.log(`   ${index + 1}. ${field.name} (${field.key})`);
      console.log(`      ${field.description}`);
    });

    console.log("\n🎉 Setup Complete!");
    console.log("\n📋 Next Steps:");
    console.log("   1. Start the Linked Roles server: npm run linked-roles");
    console.log("   2. Configure redirect URI in Discord Developer Portal:");
    console.log(
      "      OAuth2 → Redirects → Add: http://your-domain.com/discord/callback",
    );
    console.log("   3. Set DISCORD_REDIRECT_URI in .env file");
    console.log("   4. Users can verify at: http://your-domain.com");
    console.log(
      "\n💡 Tip: Server admins can now use these fields in role requirements!",
    );
  } catch (error: any) {
    console.error("\n❌ Error registering metadata:");

    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", JSON.stringify(error.response.data, null, 2));

      if (error.response.status === 401) {
        console.error(
          "\n💡 Solution: Check that DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET are correct",
        );
      } else if (error.response.status === 403) {
        console.error(
          "\n💡 Solution: Ensure the bot has role_connections.write scope",
        );
      }
    } else {
      console.error("Message:", error.message);
    }

    process.exit(1);
  }
}

/**
 * View current metadata schema
 */
async function viewMetadata(): Promise<void> {
  console.log("📊 Fetching current metadata schema...\n");

  try {
    const accessToken = await getBotAccessToken();

    const response = await axios.get(
      `${DISCORD_API}/applications/${DISCORD_CLIENT_ID}/role-connections/metadata`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (response.data.length === 0) {
      console.log(
        "⚠️  No metadata registered yet. Run without --view flag to register.",
      );
    } else {
      console.log("✅ Current Metadata Schema:");
      response.data.forEach((field: any, index: number) => {
        console.log(`\n${index + 1}. ${field.name} (${field.key})`);
        console.log(`   Description: ${field.description}`);
        console.log(`   Type: ${field.type}`);
      });
    }
  } catch (error: any) {
    console.error(
      "❌ Error fetching metadata:",
      error.response?.data || error.message,
    );
    process.exit(1);
  }
}

// Main execution
const args = process.argv.slice(2);

if (args.includes("--view")) {
  viewMetadata();
} else if (args.includes("--help")) {
  console.log(`
Sheriff Rex Bot - Register Role Connection Metadata

Usage:
  npx ts-node src/register-metadata.ts          Register metadata schema
  npx ts-node src/register-metadata.ts --view   View current metadata
  npx ts-node src/register-metadata.ts --help   Show this help

Environment Variables Required:
  DISCORD_CLIENT_ID       Your Discord application client ID
  DISCORD_CLIENT_SECRET   Your Discord application client secret

Example:
  DISCORD_CLIENT_ID=123456 DISCORD_CLIENT_SECRET=abc123 npx ts-node src/register-metadata.ts
  `);
} else {
  registerMetadata();
}
