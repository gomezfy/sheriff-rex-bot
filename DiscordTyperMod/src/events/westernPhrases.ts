import { Events, Message, Attachment } from "discord.js";

const westernImageKeywords = [
  "cowboy",
  "cowboys",
  "rdr2",
  "red-dead",
  "reddead",
  "redemption",
  "western",
  "oeste",
  "wild-west",
  "wildwest",
  "velho-oeste",
  "hat",
  "chapeu",
  "stetson",
  "horse",
  "cavalo",
  "revolver",
  "pistol",
  "gun",
  "arma",
  "sheriff",
  "xerife",
  "saloon",
  "ranch",
  "fazenda",
  "desert",
  "deserto",
  "outlaw",
  "bandido",
  "bounty",
  "wanted",
  "procurado",
  "gold",
  "ouro",
  "mine",
  "mineração",
  "minera",
  "yeehaw",
  "yee-haw",
  "howdy",
  "meowdy",
  "arthur-morgan",
  "john-marston",
  "dutch",
  "micah",
];

const imageResponses = [
  "🤠 Essa imagem é puro Velho Oeste, parceiro!",
  "⭐ Que visual Western massa, cowboy!",
  "🐴 Isso sim é espírito do oeste!",
  "🎯 RDR2 vibes detected! Yeehaw!",
  "🌵 Imagem top demais, partner! Velho Oeste raiz!",
  "💰 Tá com cara de quem curte o Velho Oeste!",
  "🔫 Esse é o verdadeiro espírito Western!",
  "🏜️ Deserto, cowboys e aventura! Assim que é!",
  "🤠 Howdy partner! Curtindo o oeste selvagem?",
  "⚡ Red Dead Redemption vibes! Que imagem top!",
  "🎰 Isso é que é visual de saloon!",
  "🥇 Imagem de cowboy raiz! Respeito!",
  "👢 Botas, chapéu e revólver! Velho Oeste perfeito!",
  "🌟 Arthur Morgan would be proud! 🤠",
  "🎯 That's the Wild West spirit right there!",
  "🐎 Beautiful Western scene, partner!",
  "💎 This screams Red Dead Redemption!",
  "🔥 Cowboy energy is strong with this one!",
  "⭐ Pure frontier vibes! Love it!",
  "🏆 Now that's a proper Western image!",
  "🐴 Yeehaw! Que imagem Western! Tá massa demais!",
  "🎮 RDR2 raiz! Essa imagem é do balacobaco!",
  "🏜️ Velho Oeste selvagem! Amo esse visual!",
  "🔫 Cowboy de verdade! Tá sensacional!",
  "⚡ Western vibes! Isso aí que é estilo!",
  "💥 Imagem digna de um verdadeiro gunslinger!",
  "🌵 Pure Wild West! Perfect shot, partner!",
  "🤠 That's some fine Western content right there!",
  "🎯 Frontier vibes are immaculate! Love it!",
  "🏇 True cowboy aesthetic! Absolutely beautiful!",
  "💰 Gold standard Western image! 10/10!",
  "🌟 The Wild West lives on in this image!",
  "🔥 Hot damn! That's proper Western style!",
  "🎰 Saloon-worthy image! Magnificent!",
  "🐎 Horse, hat, and horizon! Perfection!",
  "⭐ Legendary Western vibes! Can't get enough!",
  "🏆 Award-winning Western shot! Incredible!",
  "🤠 You're alright, boah! Great image!",
  "💎 Diamond quality Western content!",
  "🔫 Quick draw approved! Amazing picture!",
];

const westernPhrases: Record<string, string[]> = {
  wanted: [
    "Wanted, dead or alive! There's a bounty on your head, partner!",
    "I seen your face on a poster in the sheriff's office. You're wanted, stranger!",
    "Word 'round these parts is there's a price on your head, outlaw.",
    "You got the look of a wanted man. Best watch your back in these parts.",
    "The sheriff's been asking about you. Seems you're wanted for something.",
  ],
  sheriff: [
    "The sheriff don't take kindly to troublemakers in this town.",
    "I'm the law 'round here, and don't you forget it!",
    "This town ain't big enough for lawbreakers. I suggest you keep your nose clean.",
    "As sheriff, I've got my eye on all you outlaws.",
    "The badge I wear means something in this town. Best remember that.",
  ],
  "good morning": [
    "Mornin', partner! Ready for another day in the wild west?",
    "Good morning, stranger! The sun's up and so are the opportunities.",
    "Well, howdy there! Top of the morning to ya!",
    "Rise and shine, cowpoke! Another fine day in the frontier.",
    "Morning, friend! Coffee's hot and the gold's waiting to be earned.",
  ],
  "bom dia": [
    "Bom dia, parceiro! Pronto pra mais um dia no velho oeste? 🤠",
    "E aí, cowboy! Sol nasceu e as oportunidades também! ☀️",
    "Bom dia, forasteiro! Café tá quentinho no saloon! ☕",
    "Dia clareou! Hora de ganhar esse ouro! 💰",
    "Bom dia! Que tal começar com um /daily? 🎁",
  ],
  "good night": [
    "Rest easy, partner. Tomorrow's another day in the wild west.",
    "Good night, stranger. Keep your gun close and your dreams closer.",
    "Sleep tight, cowpoke. Don't let the tumbleweeds bite.",
    "Night falls on the frontier. Get some shut-eye, you'll need it.",
    "The saloon's closing, friend. Time to hit the hay.",
  ],
  "boa noite": [
    "Boa noite, parceiro! Amanhã tem mais aventura! 🌙",
    "Durma bem, cowboy! Revólver perto e olho aberto! 🔫",
    "Boa noite! O saloon tá fechando, hora de descansar! 🏜️",
    "Que a noite seja tranquila, forasteiro! 🤠",
    "Boa noite! Sonhe com ouro e conquistas! ⭐",
  ],
  drinks: [
    "Bartender! Whiskey for my friend here!",
    "Nothing like a cold drink after a long day on the trail.",
    "Pull up a stool, partner. First round's on me!",
    "This here's the finest whiskey west of the Mississippi!",
    "A drink sounds mighty fine right about now. What's your poison?",
  ],
  bebida: [
    "Garçom! Whiskey pro meu parceiro aqui! 🥃",
    "Nada melhor que uma bebida gelada depois de um dia na trilha! 🍺",
    "Puxa uma cadeira, parceiro! Primeira rodada é por minha conta! 🎰",
    "Esse aqui é o melhor whiskey do oeste! 🥃",
    "Uma bebida cairia bem agora! Qual é o seu veneno? 🍻",
  ],
  howdy: [
    "Howdy, partner! What brings you to these parts?",
    "Well, howdy there, stranger!",
    "Howdy! Welcome to the frontier!",
    "Howdy, friend! Good to see a friendly face.",
    "Howdy! You new in town, or just passing through?",
  ],
  yeehaw: [
    "YEEHAW! 🤠 That's the spirit, cowboy!",
    "YEEHAW! Ride 'em, partner! 🐴",
    "YEEHAW! Wild West energy right there! ⭐",
    "YEEHAW! Isso aí, parceiro! Velho Oeste raiz! 🎯",
    "YEEHAW! Espírito cowboy ativado! 🔥",
  ],
  mine: [
    "Vai minerar ouro? Usa /mine aí, parceiro! ⛏️",
    "Ouro nas montanhas! Bora minerar com /mine! 🥇",
    "Pegue sua picareta e use /mine, cowboy!",
    "Mineração? Chama o parceiro com /mine! 👥",
    "Gold mining time! Use /mine partner! ⛏️",
  ],
  minerar: [
    "Bora minerar! /mine tá te esperando! ⛏️",
    "Quer ouro? Usa /mine, parceiro! 💰",
    "Mineração é a chave pro sucesso! /mine agora! 🥇",
    "Picareta na mão e /mine no chat! 🔨",
  ],
  daily: [
    "Pegou suas moedas hoje? /daily tá te esperando! 🪙",
    "Todo dia tem moeda grátis no /daily, parceiro! 💰",
    "Passa no caixa com /daily todo dia! 🎁",
    "Daily reward waiting! Use /daily cowboy! 🪙",
  ],
  ouro: [
    "Ouro? Minera com /mine ou joga na /roulette! 💰",
    "Quer mais ouro? Tenta a sorte no saloon! 🎰",
    "Ouro é vida no velho oeste, parceiro! ⛏️",
    "Fala de ouro? Use /balance pra ver quanto tem! 🥇",
  ],
  gold: [
    "Gold? Mine it with /mine or gamble at /roulette! 💰",
    "Want more gold? Try your luck at the saloon! 🎰",
    "Gold is life in the wild west, partner! ⛏️",
    "Talking about gold? Use /balance to check yours! 🥇",
  ],
  cavalo: [
    "Cavalo bom vale ouro no oeste! 🐴",
    "Sem cavalo, cowboy não é cowboy! 🏇",
    "Cavalos são os melhores parceiros do oeste! 🐎",
    "Yeehaw! Nada como um bom cavalo! 🤠",
  ],
  horse: [
    "A good horse is worth its weight in gold! 🐴",
    "No horse, no cowboy! 🏇",
    "Horses are a cowboy's best friend! 🐎",
    "Yeehaw! Nothing like a good horse! 🤠",
  ],
  roulette: [
    "Feeling lucky? Try /roulette at the saloon! 🎰",
    "Roulette wheel's spinning! Place your bets! 🎲",
    "Test your luck at the roulette table! 🃏",
    "The saloon's roulette is waiting for ya! 🎰",
  ],
  roleta: [
    "Se sentindo com sorte? Tenta a /roulette! 🎰",
    "A roleta tá girando! Faça suas apostas! 🎲",
    "Teste sua sorte na mesa de roleta! 🃏",
    "A roleta do saloon tá te esperando! 🎰",
  ],
  saloon: [
    "Welcome to the saloon, partner! 🍺",
    "Best saloon in the whole frontier! 🎰",
    "Pull up a chair and stay awhile! 🪑",
    "The saloon never closes for cowboys! 🤠",
  ],
  cowboy: [
    "That's the cowboy spirit! 🤠",
    "Yeehaw, cowboy! Ride on! 🐴",
    "True cowboy right here! ⭐",
    "Cowboys never back down! 🔫",
  ],
  outlaw: [
    "Watch out, we got an outlaw here! 🔫",
    "Outlaws ain't welcome in my town! 👮",
    "Every outlaw gets what's coming to 'em! ⚖️",
    "Running from the law, are ya? 🏃",
  ],
  bandido: [
    "Cuidado, temos um bandido aqui! 🔫",
    "Bandidos não são bem-vindos nesta cidade! 👮",
    "Todo bandido recebe o que merece! ⚖️",
    "Fugindo da lei, é? 🏃",
  ],
  duel: [
    "Duel at high noon! ⏰🔫",
    "Ready to draw, partner? 🤠",
    "May the fastest gun win! ⚡",
    "Duels are settled with honor in these parts! 🎯",
  ],
  duelo: [
    "Duelo ao meio-dia! ⏰🔫",
    "Pronto pra sacar, parceiro? 🤠",
    "Que vença a arma mais rápida! ⚡",
    "Duelos são resolvidos com honra por aqui! 🎯",
  ],
  revolver: [
    "Keep your revolver clean, partner! 🔫",
    "Six bullets, six chances! Make 'em count! 💥",
    "A cowboy without a revolver ain't no cowboy! 🤠",
    "That's a fine piece of iron you got there! ⚡",
  ],
  pistola: [
    "Mantenha sua pistola limpa, parceiro! 🔫",
    "Seis balas, seis chances! Faça valer! 💥",
    "Um cowboy sem pistola não é cowboy! 🤠",
    "Esse é um belo ferro que você tem aí! ⚡",
  ],
  texas: [
    "Everything's bigger in Texas! 🤠",
    "Texas, the heart of the Wild West! ⭐",
    "Yeehaw! Texas spirit! 🐴",
    "Don't mess with Texas, partner! 🔥",
  ],
  deserto: [
    "O deserto é cruel, mas recompensador! 🏜️",
    "Calor, areia e oportunidades no deserto! ☀️",
    "Atravessar o deserto é pra corajosos! 🌵",
    "Cuidado com o sol do deserto, parceiro! 🔥",
  ],
  desert: [
    "The desert is harsh but rewarding! 🏜️",
    "Heat, sand, and opportunity in the desert! ☀️",
    "Crossing the desert is for the brave! 🌵",
    "Watch out for the desert sun, partner! 🔥",
  ],
  bounty: [
    "There's a bounty on that outlaw! 💰",
    "Bounty hunting is dangerous work! 🎯",
    "Dead or alive? The bounty don't care! 🔫",
    "Bring 'em in and claim your reward! 🥇",
  ],
  recompensa: [
    "Tem recompensa naquele bandido! 💰",
    "Caçar recompensas é trabalho perigoso! 🎯",
    "Vivo ou morto? A recompensa não liga! 🔫",
    "Traga ele e pegue sua grana! 🥇",
  ],
  rdr2: [
    "Red Dead Redemption 2! Best western game ever! 🎮",
    "Arthur Morgan would be proud! 🤠",
    "You're alright, boah! 🐴",
    "I have a plan! Just need more money! 💰",
    "That's my boah! RDR2 vibes! ⭐",
  ],
  arthur: [
    "Arthur Morgan, the legendary gunslinger! 🔫",
    "You're a good man, Arthur! 🤠",
    "Arthur's story still hits hard! 😢",
    "Legendary cowboy right there! ⭐",
  ],
  dutch: [
    "I have a plan, Arthur! 🗺️",
    "We need more money! One more score! 💰",
    "Have some faith! 🙏",
    "Tahiti is waiting for us! 🏝️",
  ],
  gang: [
    "The gang sticks together! 🤝",
    "Every outlaw needs a gang! 🔫",
    "Ride or die with the gang! 🐴",
    "Gang life ain't easy, but it's honest work! 💪",
  ],
  bando: [
    "O bando se mantém unido! 🤝",
    "Todo bandido precisa de um bando! 🔫",
    "Viver ou morrer com o bando! 🐴",
    "Vida de bando não é fácil, mas é trabalho honesto! 💪",
  ],
  whiskey: [
    "Pour me some whiskey, bartender! 🥃",
    "Best whiskey west of the Mississippi! 🍺",
    "Nothing like good whiskey after a long ride! 🤠",
    "Whiskey warms the soul! 🔥",
  ],
  poker: [
    "Pull up a chair, poker's about to start! 🃏",
    "All in! Let's see those cards! 🎰",
    "Poker face on, partner! 😎",
    "May the best hand win! 🎲",
  ],
  train: [
    "Train robbery? Count me in! 🚂",
    "All aboard the frontier express! 🚃",
    "Trains carry gold and opportunity! 💰",
    "Watch out for train heists! ⚡",
  ],
  trem: [
    "Assalto ao trem? Tô dentro! 🚂",
    "Todos a bordo do expresso da fronteira! 🚃",
    "Trens carregam ouro e oportunidade! 💰",
    "Cuidado com roubos de trem! ⚡",
  ],
  gun: [
    "Keep your gun loaded and ready! 🔫",
    "Quick draw wins the fight! ⚡",
    "A gun is a cowboy's best friend! 💥",
    "Aim true, shoot straight! 🎯",
  ],
  arma: [
    "Mantenha sua arma carregada e pronta! 🔫",
    "Saque rápido vence a luta! ⚡",
    "Uma arma é a melhor amiga do cowboy! 💥",
    "Mire certo, atire reto! 🎯",
  ],
  ranch: [
    "Life on the ranch is peaceful! 🏡",
    "Ranching is honest work, partner! 🐄",
    "The ranch life suits a cowboy! 🌾",
    "From dawn to dusk on the ranch! ☀️",
  ],
  fazenda: [
    "Vida na fazenda é tranquila! 🏡",
    "Trabalho de fazenda é honesto, parceiro! 🐄",
    "Vida de fazenda combina com cowboy! 🌾",
    "Do amanhecer ao anoitecer na fazenda! ☀️",
  ],
  frontier: [
    "The frontier is wild and free! 🏜️",
    "Out here on the frontier, we make our own rules! 🤠",
    "Frontier life ain't for the weak! 💪",
    "Welcome to the frontier, partner! ⭐",
  ],
  fronteira: [
    "A fronteira é selvagem e livre! 🏜️",
    "Aqui na fronteira, fazemos nossas próprias regras! 🤠",
    "Vida de fronteira não é pra fracos! 💪",
    "Bem-vindo à fronteira, parceiro! ⭐",
  ],
  luck: [
    "Lady Luck is on your side! 🍀",
    "Feeling lucky, partner? 🎰",
    "Luck favors the bold! ⭐",
    "May fortune smile upon you! 💰",
  ],
  sorte: [
    "A sorte tá do seu lado! 🍀",
    "Sentindo sorte, parceiro? 🎰",
    "A sorte favorece os corajosos! ⭐",
    "Que a fortuna sorria pra você! 💰",
  ],
  loot: [
    "Check the loot, partner! 💰",
    "Good loot after a successful job! 🥇",
    "Loot's waiting to be taken! 💎",
    "Split the loot fair and square! 🤝",
  ],
  saque: [
    "Confere o saque, parceiro! 💰",
    "Bom saque depois de um trabalho bem feito! 🥇",
    "Saque esperando pra ser pego! 💎",
    "Divide o saque de forma justa! 🤝",
  ],
  camp: [
    "Back to camp, boys! 🏕️",
    "Camp's where we rest and plan! 🔥",
    "Home sweet camp! 🌙",
    "Set up camp before nightfall! ⛺",
  ],
  acampamento: [
    "De volta ao acampamento! 🏕️",
    "No acampamento descansamos e planejamos! 🔥",
    "Lar doce acampamento! 🌙",
    "Monte acampamento antes do anoitecer! ⛺",
  ],
  heist: [
    "Planning the perfect heist! 🗺️",
    "One last heist, then we're done! 💰",
    "Heists are risky but profitable! 💎",
    "You in for the heist? 🤝",
  ],
  assalto: [
    "Planejando o assalto perfeito! 🗺️",
    "Um último assalto e acabou! 💰",
    "Assaltos são arriscados mas lucrativos! 💎",
    "Tá dentro do assalto? 🤝",
  ],
};

const lastResponse = new Map<string, number>();
const COOLDOWN = 10000;

/**
 *
 * @param attachment
 */
function detectWesternImage(attachment: Attachment): boolean {
  const url = attachment.url.toLowerCase();
  const filename = attachment.name?.toLowerCase() || "";
  const proxyUrl = attachment.proxyURL?.toLowerCase() || "";

  const fullText = `${url} ${filename} ${proxyUrl}`;

  for (const keyword of westernImageKeywords) {
    if (fullText.includes(keyword)) {
      return true;
    }
  }

  return false;
}

export = {
  name: Events.MessageCreate,
  async execute(message: Message): Promise<void> {
    // Western phrases system disabled by user request
    // All automatic bot responses have been turned off
    return;

    /* DISABLED CODE - Can be re-enabled if needed
    if (message.author.bot) {
      return;
    }

    const channelId = message.channel.id;
    const now = Date.now();
    const lastTime = lastResponse.get(channelId);

    if (lastTime && now - lastTime < COOLDOWN) {
      return;
    }

    try {
      if (message.attachments.size > 0) {
        for (const [, attachment] of message.attachments) {
          const isImage =
            attachment.contentType?.startsWith('image/') ||
            attachment.url?.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i);

          if (isImage && detectWesternImage(attachment)) {
            const chance = 0.15;

            if (Math.random() < chance) {
              const randomResponse =
                imageResponses[Math.floor(Math.random() * imageResponses.length)];

              setTimeout(() => {
                message.reply(randomResponse).catch(err => {
                  console.error('Error sending image reply:', err);
                });
              }, 800);

              lastResponse.set(channelId, now);
              return;
            }
          }
        }
      }

      const content = message.content.toLowerCase();

      for (const [keyword, phrases] of Object.entries(westernPhrases)) {
        if (content.includes(keyword)) {
          const chance = 0.15;

          if (Math.random() < chance) {
            const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];

            setTimeout(() => {
              message.reply(randomPhrase).catch(err => {
                console.error('Error sending auto-reply:', err);
              });
            }, 800);

            lastResponse.set(channelId, now);
            break;
          }
        }
      }
    } catch (error) {
      console.error('Error in westernPhrases event:', error);
    }
    */
  },
};
