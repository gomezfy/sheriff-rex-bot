const express = require('express');
const session = require('express-session');
const axios = require('axios');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = 5000;

// Discord OAuth2 configuration
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || '';
const REDIRECT_URI = process.env.REPLIT_DEV_DOMAIN 
  ? `https://${process.env.REPLIT_DEV_DOMAIN}/callback`
  : 'http://localhost:5000/callback';

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'sheriff-rex-secret-key-' + Math.random(),
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  }
  res.redirect('/');
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/login', (req, res) => {
  const state = crypto.randomBytes(16).toString('hex');
  req.session.oauthState = state;
  
  const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify%20guilds&state=${state}`;
  res.redirect(authUrl);
});

app.get('/callback', async (req, res) => {
  const code = req.query.code;
  const state = req.query.state;
  
  if (!code) {
    return res.redirect('/?error=no_code');
  }
  
  if (!state || state !== req.session.oauthState) {
    return res.redirect('/?error=invalid_state');
  }
  
  delete req.session.oauthState;

  try {
    // Exchange code for access token
    const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', 
      new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const { access_token } = tokenResponse.data;

    // Get user info
    const userResponse = await axios.get('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });

    // Get user guilds
    const guildsResponse = await axios.get('https://discord.com/api/users/@me/guilds', {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });

    // Store user in session
    req.session.user = {
      id: userResponse.data.id,
      username: userResponse.data.username,
      discriminator: userResponse.data.discriminator,
      avatar: userResponse.data.avatar,
      guilds: guildsResponse.data,
      access_token: access_token
    };

    res.redirect('/dashboard');
  } catch (error) {
    console.error('OAuth error:', error.response?.data || error.message);
    res.redirect('/?error=auth_failed');
  }
});

app.get('/dashboard', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

app.get('/api/invite-url', (req, res) => {
  const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&permissions=8&scope=bot%20applications.commands`;
  res.json({ url: inviteUrl });
});

app.get('/api/user', isAuthenticated, (req, res) => {
  const { access_token, ...user } = req.session.user;
  res.json(user);
});

app.get('/api/stats', isAuthenticated, async (req, res) => {
  try {
    // Import bot data if available
    const dataPath = path.join(__dirname, '..', 'src', 'data');
    const fs = require('fs');
    
    let stats = {
      servers: 1,
      users: 1,
      commands: 48,
      uptime: process.uptime()
    };

    // Try to read economy data for additional stats
    try {
      const economyPath = path.join(dataPath, 'economy.json');
      if (fs.existsSync(economyPath)) {
        const economyData = JSON.parse(fs.readFileSync(economyPath, 'utf8'));
        stats.totalUsers = Object.keys(economyData).length;
      }
    } catch (err) {
      // Ignore if file doesn't exist
    }

    res.json(stats);
  } catch (error) {
    console.error('Stats error:', error);
    res.json({
      servers: 1,
      users: 1,
      commands: 48,
      uptime: process.uptime()
    });
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// 404 handler
app.use((req, res) => {
  res.status(404).send('Page not found');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌐 Sheriff Rex Dashboard running on port ${PORT}`);
  console.log(`🔗 Redirect URI: ${REDIRECT_URI}`);
});
