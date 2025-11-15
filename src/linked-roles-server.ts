/**
 * Linked Roles Verification Server
 * Enables Discord Linked Roles integration for Sheriff Rex Bot
 *
 * This server provides OAuth2 endpoints for Discord's Linked Roles feature,
 * allowing servers to use bot data as role requirements.
 */

import express, { Request, Response } from "express";
import session from "express-session";
import axios from "axios";
import crypto from "crypto";
import { readData } from "./utils/database";
import { processPaymentNotification } from "./utils/mercadoPagoService";

const app = express();
const PORT = parseInt(process.env.LINKED_ROLES_PORT || "5000");

// Discord OAuth2 Configuration
const DISCORD_CONFIG = {
  clientId: process.env.DISCORD_CLIENT_ID || process.env.CLIENT_ID || "",
  clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
  redirectUri:
    process.env.DISCORD_REDIRECT_URI ||
    `http://localhost:${PORT}/discord/callback`,
  apiEndpoint: "https://discord.com/api/v10",
  scopes: ["identify", "role_connections.write"],
};

// Session configuration
app.use(
  session({
    secret:
      process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex"),
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static("public"));

// Extend session type
declare module "express-session" {
  interface SessionData {
    userId?: string;
    accessToken?: string;
    state?: string;
  }
}

/**
 * Get Discord OAuth2 access token
 */
async function getDiscordAccessToken(code: string): Promise<any> {
  const params = new URLSearchParams({
    client_id: DISCORD_CONFIG.clientId,
    client_secret: DISCORD_CONFIG.clientSecret,
    grant_type: "authorization_code",
    code: code,
    redirect_uri: DISCORD_CONFIG.redirectUri,
  });

  try {
    const response = await axios.post(
      `${DISCORD_CONFIG.apiEndpoint}/oauth2/token`,
      params.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "Error getting Discord access token:",
      error.response?.data || error.message,
    );
    throw error;
  }
}

/**
 * Get Discord user info
 */
async function getDiscordUser(accessToken: string): Promise<any> {
  try {
    const response = await axios.get(
      `${DISCORD_CONFIG.apiEndpoint}/users/@me`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "Error getting Discord user:",
      error.response?.data || error.message,
    );
    throw error;
  }
}

/**
 * Update user's role connection metadata
 */
async function updateRoleConnectionMetadata(
  userId: string,
  accessToken: string,
  metadata: any,
): Promise<void> {
  try {
    await axios.put(
      `${DISCORD_CONFIG.apiEndpoint}/users/@me/applications/${DISCORD_CONFIG.clientId}/role-connection`,
      {
        platform_name: "Sheriff Rex Bot",
        platform_username: userId,
        metadata: metadata,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );
    console.log(`✅ Updated role connection for user ${userId}`);
  } catch (error: any) {
    console.error(
      "Error updating role connection:",
      error.response?.data || error.message,
    );
    throw error;
  }
}

/**
 * Get user metadata from bot database
 */
function getUserMetadata(userId: string): any {
  const economyData = readData("economy.json");
  const userData = economyData[userId];

  if (!userData) {
    return {
      total_coins: 0,
      total_tokens: 0,
      level: 0,
      bounties_captured: 0,
      games_played: 0,
      mining_sessions: 0,
    };
  }

  // Calculate total wealth
  const totalCoins =
    (userData.silverCoins || 0) + (userData.goldBars || 0) * 100;
  const totalTokens = userData.saloonTokens || 0;

  // Calculate level based on total wealth
  const level = Math.floor((totalCoins + totalTokens * 10) / 1000);

  // Get statistics
  const bountiesCaptured = userData.bountiesCaptured || 0;
  const gamesPlayed = userData.gamesPlayed || 0;
  const miningSessions = userData.miningSessions || 0;

  return {
    total_coins: totalCoins,
    total_tokens: totalTokens,
    level: level,
    bounties_captured: bountiesCaptured,
    games_played: gamesPlayed,
    mining_sessions: miningSessions,
  };
}

// Routes

/**
 * Home page - Verification instructions
 */
app.get("/", (req: Request, res: Response) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Sheriff Rex - Linked Roles</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          max-width: 800px;
          margin: 50px auto;
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        .container {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
        }
        h1 { 
          font-size: 2.5em; 
          margin-bottom: 10px;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .emoji { font-size: 3em; margin-bottom: 20px; }
        a.button {
          display: inline-block;
          background: #5865F2;
          color: white;
          padding: 15px 30px;
          text-decoration: none;
          border-radius: 10px;
          font-weight: bold;
          margin-top: 20px;
          transition: all 0.3s;
          box-shadow: 0 4px 15px rgba(88, 101, 242, 0.4);
        }
        a.button:hover {
          background: #4752C4;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(88, 101, 242, 0.6);
        }
        .info {
          background: rgba(255, 255, 255, 0.1);
          padding: 20px;
          border-radius: 10px;
          margin-top: 30px;
        }
        .info h3 { margin-top: 0; }
        ul { text-align: left; }
        li { margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="emoji">🤠</div>
        <h1>Sheriff Rex Bot</h1>
        <h2>Linked Roles Verification</h2>
        <p>Connect your Discord account to verify your Sheriff Rex Bot statistics and unlock special roles!</p>
        
        <a href="/discord/verify" class="button">🔗 Connect with Discord</a>
        
        <div class="info">
          <h3>📊 Available Metadata</h3>
          <ul>
            <li>💰 <strong>Total Coins:</strong> Your total wealth in Silver Coins</li>
            <li>🎫 <strong>Total Tokens:</strong> Your Saloon Tokens balance</li>
            <li>⭐ <strong>Level:</strong> Your calculated level based on wealth</li>
            <li>🎯 <strong>Bounties Captured:</strong> Number of bounties you've captured</li>
            <li>🎰 <strong>Games Played:</strong> Total gambling games played</li>
            <li>⛏️ <strong>Mining Sessions:</strong> Number of mining sessions completed</li>
          </ul>
        </div>
        
        <div class="info">
          <h3>🔒 Privacy</h3>
          <p>We only access your Discord user ID to link your bot data. No personal information is stored.</p>
          <p>See our <a href="https://github.com/gomezfy/Sheriffbot-/blob/main/PRIVACY_POLICY.md" style="color: #fff;">Privacy Policy</a></p>
        </div>
      </div>
    </body>
    </html>
  `);
});

/**
 * Initiate Discord OAuth2 flow
 */
app.get("/discord/verify", (req: Request, res: Response) => {
  const state = crypto.randomBytes(16).toString("hex");
  req.session.state = state;

  const authUrl = new URL(`${DISCORD_CONFIG.apiEndpoint}/oauth2/authorize`);
  authUrl.searchParams.append("client_id", DISCORD_CONFIG.clientId);
  authUrl.searchParams.append("redirect_uri", DISCORD_CONFIG.redirectUri);
  authUrl.searchParams.append("response_type", "code");
  authUrl.searchParams.append("scope", DISCORD_CONFIG.scopes.join(" "));
  authUrl.searchParams.append("state", state);

  res.redirect(authUrl.toString());
});

/**
 * Discord OAuth2 callback
 */
app.get("/discord/callback", async (req: Request, res: Response) => {
  const { code, state } = req.query;

  // Verify state to prevent CSRF
  if (!state || state !== req.session.state) {
    return res.status(403).send("Invalid state parameter");
  }

  if (!code) {
    return res.status(400).send("No code provided");
  }

  try {
    // Exchange code for access token
    const tokenData = await getDiscordAccessToken(code as string);
    const accessToken = tokenData.access_token;

    // Get user info
    const user = await getDiscordUser(accessToken);
    const userId = user.id;

    // Get user metadata from bot database
    const metadata = getUserMetadata(userId);

    // Update role connection
    await updateRoleConnectionMetadata(userId, accessToken, metadata);

    // Store in session
    req.session.userId = userId;
    req.session.accessToken = accessToken;

    // Success page
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Sheriff Rex - Verification Success</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
          }
          .container {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
          }
          .success { font-size: 5em; margin-bottom: 20px; }
          h1 { font-size: 2.5em; margin-bottom: 20px; }
          .stats {
            background: rgba(255, 255, 255, 0.1);
            padding: 20px;
            border-radius: 10px;
            margin: 30px 0;
            text-align: left;
          }
          .stat-item {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          }
          .stat-item:last-child { border-bottom: none; }
          a {
            color: #fff;
            text-decoration: none;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success">✅</div>
          <h1>Verification Successful!</h1>
          <p>Your Sheriff Rex Bot data has been linked to your Discord account.</p>
          
          <div class="stats">
            <h3>📊 Your Statistics</h3>
            <div class="stat-item">
              <span>💰 Total Coins:</span>
              <strong>${metadata.total_coins.toLocaleString()}</strong>
            </div>
            <div class="stat-item">
              <span>🎫 Total Tokens:</span>
              <strong>${metadata.total_tokens.toLocaleString()}</strong>
            </div>
            <div class="stat-item">
              <span>⭐ Level:</span>
              <strong>${metadata.level}</strong>
            </div>
            <div class="stat-item">
              <span>🎯 Bounties Captured:</span>
              <strong>${metadata.bounties_captured}</strong>
            </div>
            <div class="stat-item">
              <span>🎰 Games Played:</span>
              <strong>${metadata.games_played}</strong>
            </div>
            <div class="stat-item">
              <span>⛏️ Mining Sessions:</span>
              <strong>${metadata.mining_sessions}</strong>
            </div>
          </div>
          
          <p>You can now close this window and return to Discord.</p>
          <p>Server administrators can use these stats as role requirements!</p>
          
          <p style="margin-top: 30px; font-size: 0.9em;">
            <a href="/">🔄 Verify Again</a> | 
            <a href="https://github.com/gomezfy/Sheriffbot-">📖 Documentation</a>
          </p>
        </div>
      </body>
      </html>
    `);
  } catch (error: any) {
    console.error("Error in OAuth callback:", error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Sheriff Rex - Verification Error</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
          }
          .container {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
          }
          .error { font-size: 5em; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="error">❌</div>
          <h1>Verification Failed</h1>
          <p>There was an error verifying your account. Please try again.</p>
          <p><a href="/" style="color: #fff;">← Back to Home</a></p>
        </div>
      </body>
      </html>
    `);
  }
});

/**
 * Health check endpoint
 */
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "healthy",
    service: "Sheriff Rex Linked Roles",
    timestamp: new Date().toISOString(),
  });
});

/**
 * API endpoint to manually update metadata
 */
app.post(
  "/api/update-metadata/:userId",
  async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({ error: "Access token required" });
    }

    try {
      const metadata = getUserMetadata(userId);
      await updateRoleConnectionMetadata(userId, accessToken, metadata);

      res.json({
        success: true,
        metadata: metadata,
      });
    } catch (error: any) {
      res.status(500).json({
        error: "Failed to update metadata",
        message: error.message,
      });
    }
  },
);

/**
 * Mercado Pago Webhook Handler
 * Processes payment notifications from Mercado Pago
 * 
 * SECURITY: This endpoint validates payments by fetching them directly from
 * Mercado Pago's API, preventing spoofing attacks. Only verified payments
 * are processed.
 */
app.post("/webhook/mercadopago", async (req: Request, res: Response) => {
  try {
    const { type, data } = req.body;

    console.log("📥 Mercado Pago Webhook received:", { type, data });

    // Validate required fields
    if (!type || !data || !data.id) {
      console.error("❌ Invalid webhook payload - missing required fields");
      return res.status(400).json({ 
        error: "Invalid webhook payload",
        success: false 
      });
    }

    if (type === "payment") {
      const paymentId = data.id;
      
      // Process payment - this internally validates by fetching from MP API
      const result = await processPaymentNotification(paymentId);
      
      if (!result.success) {
        console.error(`❌ Payment processing failed: ${result.error}`);
        // Return 200 to prevent retries for business logic errors
        // Return 4xx for validation errors to trigger retries
        if (result.error?.includes('not found') || result.error?.includes('not configured')) {
          return res.status(404).json({ 
            error: result.error,
            success: false 
          });
        }
        return res.status(200).json({ 
          error: result.error,
          success: false 
        });
      }
      
      console.log(`✅ Payment ${paymentId} processed successfully`);
      return res.status(200).json({ success: true });
    }

    // Unknown event type - acknowledge but don't process
    return res.status(200).json({ success: true, message: 'Event type not handled' });

  } catch (error) {
    console.error("❌ Error processing Mercado Pago webhook:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Return 500 to trigger Mercado Pago retries for unexpected errors
    return res.status(500).json({ 
      error: errorMessage,
      success: false 
    });
  }
});

/**
 * Payment success page
 */
app.get("/payment/success", (req: Request, res: Response) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Pagamento Aprovado - Sheriff Rex</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .container {
          background: white;
          padding: 40px;
          border-radius: 10px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.3);
          text-align: center;
          max-width: 500px;
        }
        h1 { color: #2ecc71; margin-bottom: 10px; }
        p { color: #555; line-height: 1.6; }
        .emoji { font-size: 64px; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="emoji">✅</div>
        <h1>Pagamento Aprovado!</h1>
        <p>Seus RexBucks foram creditados automaticamente!</p>
        <p>Verifique seu saldo no Discord com o comando <code>/rexbucks balance</code></p>
        <p style="margin-top: 30px; font-size: 14px; color: #999;">
          Você pode fechar esta janela
        </p>
      </div>
    </body>
    </html>
  `);
});

/**
 * Payment pending page
 */
app.get("/payment/pending", (req: Request, res: Response) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Pagamento Pendente - Sheriff Rex</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }
        .container {
          background: white;
          padding: 40px;
          border-radius: 10px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.3);
          text-align: center;
          max-width: 500px;
        }
        h1 { color: #f39c12; margin-bottom: 10px; }
        p { color: #555; line-height: 1.6; }
        .emoji { font-size: 64px; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="emoji">⏳</div>
        <h1>Pagamento Pendente</h1>
        <p>Seu pagamento está sendo processado.</p>
        <p>Assim que for aprovado, seus RexBucks serão creditados automaticamente!</p>
        <p style="margin-top: 30px; font-size: 14px; color: #999;">
          Você pode fechar esta janela
        </p>
      </div>
    </body>
    </html>
  `);
});

/**
 * Payment failure page
 */
app.get("/payment/failure", (req: Request, res: Response) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Pagamento Falhou - Sheriff Rex</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, #f2709c 0%, #ff9472 100%);
        }
        .container {
          background: white;
          padding: 40px;
          border-radius: 10px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.3);
          text-align: center;
          max-width: 500px;
        }
        h1 { color: #e74c3c; margin-bottom: 10px; }
        p { color: #555; line-height: 1.6; }
        .emoji { font-size: 64px; margin-bottom: 20px; }
        a {
          display: inline-block;
          margin-top: 20px;
          padding: 12px 24px;
          background: #3498db;
          color: white;
          text-decoration: none;
          border-radius: 5px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="emoji">❌</div>
        <h1>Pagamento Falhou</h1>
        <p>Não foi possível processar seu pagamento.</p>
        <p>Tente novamente usando o comando <code>/loja</code> no Discord.</p>
      </div>
    </body>
    </html>
  `);
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🔗 Linked Roles server running on port ${PORT}`);
    console.log(`📍 Verification URL: http://localhost:${PORT}`);
    console.log(`🔧 Redirect URI: ${DISCORD_CONFIG.redirectUri}`);
    console.log("");
    console.log("⚙️  Configuration:");
    console.log(
      `   Client ID: ${DISCORD_CONFIG.clientId ? "✅ Set" : "❌ Not set"}`,
    );
    console.log(
      `   Client Secret: ${DISCORD_CONFIG.clientSecret ? "✅ Set" : "❌ Not set"}`,
    );
    console.log(`   Redirect URI: ${DISCORD_CONFIG.redirectUri}`);
  });
}

export default app;
