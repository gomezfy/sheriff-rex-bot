import fs from "fs";
import path from "path";
import { cacheManager } from "./cacheManager";

const dataDir = path.join(process.cwd(), "src", "data");
const warehouseFile = path.join(dataDir, "warehouse.json");

export const WAREHOUSE_RESOURCES = {
  wheat: {
    id: "wheat",
    name: "Trigo",
    emoji: "🌾",
    buyPrice: 0.16,
    sellPrice: 0.1,
  },
  honey: {
    id: "honey",
    name: "Mel",
    emoji: "🍯",
    buyPrice: 38,
    sellPrice: 25,
  },
  cattle: {
    id: "cattle",
    name: "Gado",
    emoji: "🐄",
    buyPrice: 6710,
    sellPrice: 5000,
  },
} as const;

interface WarehouseStats {
  sold: number;
  bought: number;
  revenue: number;
}

interface WarehouseData {
  stock: Record<string, number>;
  treasury: number;
  prices: Record<
    string,
    {
      buy: number;
      sell: number;
    }
  >;
  statistics: {
    hourly: Record<string, WarehouseStats>;
    total: Record<string, WarehouseStats>;
    lastReset: string | null;
  };
  transactions: Array<{
    userId: string;
    type: "sell" | "buy";
    resource: string;
    amount: number;
    price: number;
    total: number;
    timestamp: string;
  }>;
}

function getDefaultWarehouse(): WarehouseData {
  return {
    stock: {
      wheat: 0,
      honey: 0,
      cattle: 0,
    },
    treasury: 0,
    prices: {
      wheat: { buy: 0.16, sell: 0.1 },
      honey: { buy: 38, sell: 25 },
      cattle: { buy: 6710, sell: 5000 },
    },
    statistics: {
      hourly: {
        wheat: { sold: 0, bought: 0, revenue: 0 },
        honey: { sold: 0, bought: 0, revenue: 0 },
        cattle: { sold: 0, bought: 0, revenue: 0 },
      },
      total: {
        wheat: { sold: 0, bought: 0, revenue: 0 },
        honey: { sold: 0, bought: 0, revenue: 0 },
        cattle: { sold: 0, bought: 0, revenue: 0 },
      },
      lastReset: null,
    },
    transactions: [],
  };
}

export function getWarehouseData(): WarehouseData {
  const cached = cacheManager.get<WarehouseData>("warehouse", "state");
  if (cached !== null) {
    return cached;
  }

  try {
    if (!fs.existsSync(warehouseFile)) {
      const defaultData = getDefaultWarehouse();
      fs.writeFileSync(warehouseFile, JSON.stringify(defaultData, null, 2));
      cacheManager.set("warehouse", "state", defaultData, false);
      return defaultData;
    }

    const data = fs.readFileSync(warehouseFile, "utf8");
    const warehouse = JSON.parse(data);

    let needsUpdate = false;

    if (warehouse.treasury === undefined) {
      warehouse.treasury = 0;
      needsUpdate = true;
      console.log("💰 Warehouse treasury initialized");
    }

    for (const resourceId in WAREHOUSE_RESOURCES) {
      const resource =
        WAREHOUSE_RESOURCES[resourceId as keyof typeof WAREHOUSE_RESOURCES];
      if (
        !warehouse.prices[resourceId] ||
        warehouse.prices[resourceId].buy !== resource.buyPrice ||
        warehouse.prices[resourceId].sell !== resource.sellPrice
      ) {
        warehouse.prices[resourceId] = {
          buy: resource.buyPrice,
          sell: resource.sellPrice,
        };
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      console.log("📊 Warehouse prices updated to match current configuration");
      fs.writeFileSync(warehouseFile, JSON.stringify(warehouse, null, 2));
    }

    cacheManager.set("warehouse", "state", warehouse, false);
    return warehouse;
  } catch (error) {
    console.error("Error reading warehouse data:", error);
    const defaultData = getDefaultWarehouse();
    cacheManager.set("warehouse", "state", defaultData, true);
    return defaultData;
  }
}

export function saveWarehouseData(data: WarehouseData): void {
  try {
    fs.writeFileSync(warehouseFile, JSON.stringify(data, null, 2));
    cacheManager.set("warehouse", "state", data, false);
  } catch (error) {
    console.error("Error saving warehouse data:", error);
    throw error;
  }
}

export function addStock(resource: string, amount: number): void {
  const warehouse = getWarehouseData();
  warehouse.stock[resource] = (warehouse.stock[resource] || 0) + amount;
  saveWarehouseData(warehouse);
}

export function removeStock(resource: string, amount: number): boolean {
  const warehouse = getWarehouseData();
  if ((warehouse.stock[resource] || 0) < amount) {
    return false;
  }
  warehouse.stock[resource] -= amount;
  saveWarehouseData(warehouse);
  return true;
}

export function getStock(resource: string): number {
  const warehouse = getWarehouseData();
  return warehouse.stock[resource] || 0;
}

export function recordTransaction(
  userId: string,
  type: "sell" | "buy",
  resource: string,
  amount: number,
  price: number,
): void {
  const warehouse = getWarehouseData();
  const total = amount * price;

  warehouse.transactions.push({
    userId,
    type,
    resource,
    amount,
    price,
    total,
    timestamp: new Date().toISOString(),
  });

  if (warehouse.transactions.length > 1000) {
    warehouse.transactions = warehouse.transactions.slice(-500);
  }

  if (type === "sell") {
    warehouse.statistics.hourly[resource].sold += amount;
    warehouse.statistics.total[resource].sold += amount;
    warehouse.statistics.hourly[resource].revenue += total;
    warehouse.statistics.total[resource].revenue += total;
  } else {
    warehouse.statistics.hourly[resource].bought += amount;
    warehouse.statistics.total[resource].bought += amount;
  }

  saveWarehouseData(warehouse);
}

export function resetHourlyStats(): void {
  const warehouse = getWarehouseData();

  warehouse.statistics.hourly = {
    wheat: { sold: 0, bought: 0, revenue: 0 },
    honey: { sold: 0, bought: 0, revenue: 0 },
    cattle: { sold: 0, bought: 0, revenue: 0 },
  };
  warehouse.statistics.lastReset = new Date().toISOString();

  saveWarehouseData(warehouse);
}

export function getPrice(resource: string, type: "buy" | "sell"): number {
  const warehouse = getWarehouseData();
  return warehouse.prices[resource]?.[type] || 0;
}

export function getTotalValue(): number {
  const warehouse = getWarehouseData();
  let total = 0;

  for (const resource in warehouse.stock) {
    const amount = warehouse.stock[resource];
    const price = warehouse.prices[resource]?.sell || 0;
    total += amount * price;
  }

  return total;
}

export function addTreasury(amount: number): void {
  const warehouse = getWarehouseData();
  warehouse.treasury = (warehouse.treasury || 0) + amount;
  saveWarehouseData(warehouse);
}

export function removeTreasury(amount: number): boolean {
  const warehouse = getWarehouseData();
  const currentTreasury = warehouse.treasury || 0;

  if (currentTreasury < amount) {
    return false;
  }

  warehouse.treasury = currentTreasury - amount;
  saveWarehouseData(warehouse);
  return true;
}

export function getTreasury(): number {
  const warehouse = getWarehouseData();
  return warehouse.treasury || 0;
}

export function getWarehouseStats() {
  const warehouse = getWarehouseData();
  return {
    stock: warehouse.stock,
    treasury: warehouse.treasury || 0,
    prices: warehouse.prices,
    statistics: warehouse.statistics,
    totalValue: getTotalValue(),
  };
}

export function startWarehouseStatsReset(): NodeJS.Timeout {
  console.log("📊 Starting warehouse statistics hourly reset system");

  resetHourlyStats();

  const interval = setInterval(
    () => {
      try {
        resetHourlyStats();
        console.log("📊 Warehouse hourly statistics reset");
      } catch (error) {
        console.error("❌ Error resetting warehouse statistics:", error);
      }
    },
    60 * 60 * 1000,
  );

  return interval;
}
