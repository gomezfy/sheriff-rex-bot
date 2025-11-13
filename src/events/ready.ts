import { Events, Client, ActivityType } from "discord.js";
import { backupManager } from "../utils/backupManager";
import logger from "../utils/consoleLogger";

export = {
  name: Events.ClientReady,
  once: true,
  execute(client: Client): void {
    // Display beautiful ready message
    logger.ready(
      client.user?.tag || "Unknown",
      client.guilds.cache.size,
      client.users.cache.size
    );

    // Start automatic backups
    logger.info("Starting automatic backup system");
    backupManager.startAutomaticBackups();
    logger.success("Backup system initialized");

    const statusActivities = [
      { name: "Mantendo a paz no Velho Oeste 🤠", type: ActivityType.Watching },
      {
        name: "Keeping peace in the Wild West 🤠",
        type: ActivityType.Watching,
      },
      { name: "Caçando bandidos no deserto 🏜️", type: ActivityType.Playing },
      { name: "Hunting outlaws in the desert 🏜️", type: ActivityType.Playing },
      { name: "Patrulhando o saloon 🍺", type: ActivityType.Watching },
      { name: "Patrolling the saloon 🍺", type: ActivityType.Watching },
      { name: "Contando recompensas 💰", type: ActivityType.Playing },
      { name: "Counting bounties 💰", type: ActivityType.Playing },
      { name: "Tarefas de xerife | /help", type: ActivityType.Playing },
      { name: "Sheriff duties | /help", type: ActivityType.Playing },
      {
        name: `${client.guilds.cache.size} cidades do Velho Oeste`,
        type: ActivityType.Watching,
      },
      {
        name: `${client.guilds.cache.size} Wild West towns`,
        type: ActivityType.Watching,
      },
      { name: "Mineradores de ouro ⛏️", type: ActivityType.Watching },
      { name: "Gold miners ⛏️", type: ActivityType.Watching },
      { name: "Pôquer no saloon 🃏", type: ActivityType.Playing },
      { name: "Poker at the saloon 🃏", type: ActivityType.Playing },
      { name: "Cartazes de procurados 📜", type: ActivityType.Watching },
      { name: "Wanted posters 📜", type: ActivityType.Watching },
      { name: "Duelos ao meio-dia ⚔️", type: ActivityType.Competing },
      { name: "Duels at high noon ⚔️", type: ActivityType.Competing },
    ];

    let currentIndex = 0;

    const updateStatus = () => {
      const activity = statusActivities[currentIndex];
      client.user?.setPresence({
        activities: [activity],
        status: "online",
      });
      currentIndex = (currentIndex + 1) % statusActivities.length;
    };

    updateStatus();
    setInterval(updateStatus, 60000);

    logger.info("Status rotation active (changes every 60 seconds)");
    logger.divider();
  },
};
