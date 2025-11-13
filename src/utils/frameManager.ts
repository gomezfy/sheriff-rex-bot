import fs from "fs";
import path from "path";
import { ownsTerritory } from "./territoryManager";

interface Frame {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  price: number; // in saloon tokens
  rarity: "common" | "rare" | "epic" | "legendary";
  requiresTerritory?: string; // optional territory requirement
}

interface UserFrames {
  userId: string;
  ownedFrames: string[]; // array of frame IDs
  activeFrame: string | null; // currently equipped frame ID
}

const FRAMES_DATA_FILE = path.join(process.cwd(), "src/data/frames.json");
const USER_FRAMES_FILE = path.join(process.cwd(), "src/data/user_frames.json");

// Available frames in the shop
const AVAILABLE_FRAMES: Frame[] = [
  {
    id: "golden_western",
    name: "🌟 Moldura Dourada Western",
    description: "Moldura elegante com detalhes dourados do velho oeste",
    imageUrl: "https://i.postimg.cc/Nj3ZrzK7/result-0F9BE830-2CC5-4F60-BF94-6B37E629AF17.png",
    price: 30,
    rarity: "rare",
  },
  {
    id: "rex_premium",
    name: "🤠 Moldura Rex Premium",
    description: "Moldura exclusiva do Sheriff Rex com cacto, chapéu de cowboy e logo Rex. Edição limitada!",
    imageUrl: "https://i.postimg.cc/fb8h6vHS/result-IMG-3359.png",
    price: 430,
    rarity: "legendary",
  },
  {
    id: "western_classic",
    name: "💫 Moldura Western Clássica",
    description: "Moldura tradicional do oeste selvagem com detalhes rústicos e autênticos",
    imageUrl: "https://i.postimg.cc/pXHSx6mg/result-IMG-3364.png",
    price: 512,
    rarity: "legendary",
  },
  {
    id: "enchanted_west_higuma",
    name: "Enquadramento do Oeste Encantado: Sussurros de Higuma",
    description: "Esta moldura ornamentada evoca o espírito selvagem do Velho Oeste, fundido com toques mágicos do anime japonês, em um design metálico e vibrante que pulsa com cores intensas como o turquesa profundo das bordas, o dourado reluzente das curvas e o vermelho flamejante das flores entrelaçadas. Com uma espessura robusta de cerca de 30 pixels em cada lado, a estrutura em estilo western apresenta arabescos intricados de metal forjado, como se fossem relíquias de uma saloon abandonada no deserto, mas reimaginadas com um brilho plástico detalhado e texturas 4K que capturam reflexos sutis e sombras dramáticas.",
    imageUrl: "https://i.postimg.cc/65zfg9F8/result-IMG-3365.png",
    price: 1600,
    rarity: "legendary",
  },
  {
    id: "gold_mine_exclusive",
    name: "⛏️ Moldura Exclusiva da Mina de Ouro",
    description: "Moldura exclusiva reservada para investidores da Mina de Ouro. Apenas os verdadeiros magnatas do oeste selvagem podem usar esta moldura lendária!",
    imageUrl: "https://i.postimg.cc/2StkHZw0/result-IMG-3367.png",
    price: 0,
    rarity: "legendary",
    requiresTerritory: "gold_mine_shares",
  },
];

// Load user frames data
function loadUserFrames(): Record<string, UserFrames> {
  try {
    if (fs.existsSync(USER_FRAMES_FILE)) {
      const data = fs.readFileSync(USER_FRAMES_FILE, "utf8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error loading user frames:", error);
  }
  return {};
}

// Save user frames data
function saveUserFrames(data: Record<string, UserFrames>): void {
  try {
    const dir = path.dirname(USER_FRAMES_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(USER_FRAMES_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error saving user frames:", error);
  }
}

// Get user frames
export function getUserFrames(userId: string): UserFrames {
  const allUserFrames = loadUserFrames();
  if (!allUserFrames[userId]) {
    allUserFrames[userId] = {
      userId,
      ownedFrames: [],
      activeFrame: null,
    };
    saveUserFrames(allUserFrames);
  }
  return allUserFrames[userId];
}

// Get all available frames
export function getAllFrames(): Frame[] {
  return AVAILABLE_FRAMES;
}

// Get all available frames for a specific user (considering territory requirements)
export function getAvailableFramesForUser(userId: string): Frame[] {
  return AVAILABLE_FRAMES.filter((frame) => {
    // If no territory requirement, frame is available
    if (!frame.requiresTerritory) return true;
    
    // Check if user owns the required territory
    return ownsTerritory(userId, frame.requiresTerritory);
  });
}

// Get frame by ID
export function getFrameById(frameId: string): Frame | null {
  return AVAILABLE_FRAMES.find((f) => f.id === frameId) || null;
}

// Check if user can unlock a frame (has required territory)
export function canUnlockFrame(userId: string, frameId: string): boolean {
  const frame = getFrameById(frameId);
  if (!frame) return false;
  
  // If no territory requirement, can unlock
  if (!frame.requiresTerritory) return true;
  
  // Check if user owns the required territory
  return ownsTerritory(userId, frame.requiresTerritory);
}

// Check if user owns a frame
export function userOwnsFrame(userId: string, frameId: string): boolean {
  const userFrames = getUserFrames(userId);
  return userFrames.ownedFrames.includes(frameId);
}

// Purchase a frame
export function purchaseFrame(userId: string, frameId: string): boolean {
  const frame = getFrameById(frameId);
  if (!frame) return false;

  // Check if user can unlock this frame (territory requirement)
  if (!canUnlockFrame(userId, frameId)) {
    return false;
  }

  const allUserFrames = loadUserFrames();
  if (!allUserFrames[userId]) {
    allUserFrames[userId] = {
      userId,
      ownedFrames: [],
      activeFrame: null,
    };
  }

  // Check if already owned
  if (allUserFrames[userId].ownedFrames.includes(frameId)) {
    return false;
  }

  // Add frame to owned frames
  allUserFrames[userId].ownedFrames.push(frameId);
  
  // If first frame, set as active
  if (allUserFrames[userId].ownedFrames.length === 1) {
    allUserFrames[userId].activeFrame = frameId;
  }

  saveUserFrames(allUserFrames);
  return true;
}

// Unlock frame automatically when user gets required territory
export function unlockFrameByTerritory(userId: string, territoryId: string): void {
  // Find frames that require this territory
  const framesToUnlock = AVAILABLE_FRAMES.filter(
    (frame) => frame.requiresTerritory === territoryId
  );

  if (framesToUnlock.length === 0) return;

  const allUserFrames = loadUserFrames();
  if (!allUserFrames[userId]) {
    allUserFrames[userId] = {
      userId,
      ownedFrames: [],
      activeFrame: null,
    };
  }

  let unlocked = false;
  for (const frame of framesToUnlock) {
    // Only add if not already owned
    if (!allUserFrames[userId].ownedFrames.includes(frame.id)) {
      allUserFrames[userId].ownedFrames.push(frame.id);
      unlocked = true;
      
      // If first frame, set as active
      if (allUserFrames[userId].ownedFrames.length === 1) {
        allUserFrames[userId].activeFrame = frame.id;
      }
    }
  }

  if (unlocked) {
    saveUserFrames(allUserFrames);
  }
}

// Set active frame
export function setActiveFrame(userId: string, frameId: string | null): boolean {
  const allUserFrames = loadUserFrames();
  
  if (!allUserFrames[userId]) {
    allUserFrames[userId] = {
      userId,
      ownedFrames: [],
      activeFrame: null,
    };
  }

  // If setting to null (removing frame), allow it
  if (frameId === null) {
    allUserFrames[userId].activeFrame = null;
    saveUserFrames(allUserFrames);
    return true;
  }

  // Check if user owns the frame
  if (!allUserFrames[userId].ownedFrames.includes(frameId)) {
    return false;
  }

  allUserFrames[userId].activeFrame = frameId;
  saveUserFrames(allUserFrames);
  return true;
}

// Get active frame URL
export function getActiveFrameUrl(userId: string): string | null {
  const userFrames = getUserFrames(userId);
  if (!userFrames.activeFrame) return null;

  const frame = getFrameById(userFrames.activeFrame);
  return frame ? frame.imageUrl : null;
}

// Get rarity color
export function getRarityColor(rarity: string): string {
  switch (rarity) {
    case "common":
      return "#95a5a6";
    case "rare":
      return "#3498db";
    case "epic":
      return "#9b59b6";
    case "legendary":
      return "#f1c40f";
    default:
      return "#95a5a6";
  }
}

// Get rarity emoji
export function getRarityEmoji(rarity: string): string {
  switch (rarity) {
    case "common":
      return "⚪";
    case "rare":
      return "🔵";
    case "epic":
      return "🟣";
    case "legendary":
      return "🟡";
    default:
      return "⚪";
  }
}
