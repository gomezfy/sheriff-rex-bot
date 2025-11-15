# Sheriff Rex Bot - Documentação do Projeto

### Overview
Sheriff Rex is a comprehensive Discord bot written in TypeScript, featuring a Wild West theme. It offers 46 slash commands across 8 categories, including a dual economy system (Saloon Tokens + Silver Coins), automatic daily rewards, mini-games, a mining system, bounty hunting with visual posters, group expeditions, and a full moderation suite. The bot also supports personalized visual profiles using Canvas and is multilingual (PT-BR, EN-US, ES-ES, FR). Recent additions include a premium currency system (RexBucks) and a web dashboard with Discord OAuth2 integration. The project aims to provide a rich and engaging experience for Discord communities with its unique theme and extensive features.

### User Preferences
- I prefer simple language.
- I want iterative development.
- Ask before making major changes.
- I prefer detailed explanations.
- Do not make changes to the folder `website/`.
- Do not make changes to the file `src/utils/consoleLogger.ts`.
- Ensure all new features are fully translated into PT-BR, EN-US, and ES-ES.
- Prioritize the use of the centralized error handling system (`src/utils/errors/`).
- Utilize the `ComponentRegistry` for new button and menu handlers instead of if-else chains.

### System Architecture
The Sheriff Rex Bot is built with a modular and scalable architecture.

**UI/UX Decisions:**
- **Western Theme:** All visual assets, command themes, and the new web dashboard adhere to a consistent Wild West aesthetic.
- **Visual Profiles:** User profiles are generated dynamically using Canvas, allowing for personalized and visually appealing displays.
- **Interactive Elements:** Features like bounty hunting and team captures utilize interactive Discord components (buttons) for user engagement.
- **Minimalist Buttons:** Interactive components are designed to be concise and intuitive.

**Technical Implementations:**
- **TypeScript:** The entire bot is developed in TypeScript for type safety and maintainability.
- **Command Handling:** Uses Discord.js for robust command and event handling.
- **Database:** Flexible data storage, defaulting to JSON files for various game data (economy, profiles, inventories, bounties, guilds) and supporting PostgreSQL for more complex data like RexBucks transactions.
- **Logging:** Features a dual logging system: `consoleLogger.ts` for detailed console output with different log levels (debug, info, warn, error, success) and `logger.ts` for sending administrative logs as embeds to Discord channels.
- **Internationalization (i18n):** Supports multiple languages with a modular translation structure (`src/i18n/`).
- **Error Handling:** A centralized error handling system (`src/utils/errors/`) provides a hierarchical error structure and a global handler for Discord interactions.
- **Component Registry:** A dedicated `ComponentRegistry` (`src/interactions/ComponentRegistry.ts`) is designed to manage button and menu interactions, supporting exact matches and regex patterns.
- **Performance Optimization:** Includes features like an optimized cache system, a low-memory mode, and automatic sweepers for memory management.

**Feature Specifications:**
- **Economy System:** Dual currency (Saloon Tokens, Silver Coins) with a premium currency (RexBucks) for real-money transactions, designed to be non-refundable and non-transferable with full audit trails.
- **Daily Rewards:** Automated daily rewards system.
- **Mini-Games:** Dice, duels, roulette, bank robbery, and general theft mechanics.
- **Mining System:** Solo and cooperative resource gathering.
- **Bounty System:** Visual wanted posters, solo capture, and team-based capture mechanics with shared rewards.
- **Expedition System:** Group expeditions with public invites.
- **Moderation:** Comprehensive suite of moderation commands including warnings, mutes, and log configuration.
- **Web Dashboard:** A new web dashboard provides administrative features and statistics, integrated via Discord OAuth2.

**System Design Choices:**
- **Modular Structure:** The project is organized into logical folders for commands, events, utilities, and specific features to enhance maintainability and scalability.
- **Environment Variables:** Critical information like tokens and database URLs are managed through environment variables for security.
- **Cooldown Management:** A dedicated `cooldownManager.ts` prevents spam and balances game mechanics.
- **Asset Management:** Custom emojis and images are centrally managed in the `assets/` directory.

### External Dependencies
- **Discord API:** Core integration for bot functionality.
- **PostgreSQL:** Optional relational database for persistent data storage, particularly for RexBucks transactions and user data. If not configured, JSON files are used.
- **Express.js:** Used for the web server of the dashboard and linked roles.
- **OAuth2:** Integrated with Discord for user authentication on the web dashboard.