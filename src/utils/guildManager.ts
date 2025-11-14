import fs from "fs";
import path from "path";
import {
  PlayerGuild,
  GuildData,
  UserGuildData,
  GuildOperationResult,
  GuildError,
  JoinRequestData,
  JoinRequest,
} from "../types";
import { getDataPath } from "./database";
import { removeUserGold } from "./dataManager";

const dataDir = getDataPath("data");
const guildsFile = path.join(dataDir, "guilds.json");
const userGuildsFile = path.join(dataDir, "user-guilds.json");
const joinRequestsFile = path.join(dataDir, "join-requests.json");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

if (!fs.existsSync(guildsFile)) {
  fs.writeFileSync(guildsFile, JSON.stringify({}, null, 2));
}

if (!fs.existsSync(userGuildsFile)) {
  fs.writeFileSync(userGuildsFile, JSON.stringify({}, null, 2));
}

if (!fs.existsSync(joinRequestsFile)) {
  fs.writeFileSync(joinRequestsFile, JSON.stringify({}, null, 2));
}

function getGuilds(): GuildData {
  const data = fs.readFileSync(guildsFile, "utf8");
  return JSON.parse(data);
}

function saveGuilds(data: GuildData): void {
  fs.writeFileSync(guildsFile, JSON.stringify(data, null, 2));
}

function getUserGuilds(): UserGuildData {
  const data = fs.readFileSync(userGuildsFile, "utf8");
  return JSON.parse(data);
}

function saveUserGuilds(data: UserGuildData): void {
  fs.writeFileSync(userGuildsFile, JSON.stringify(data, null, 2));
}

function getJoinRequests(): JoinRequestData {
  const data = fs.readFileSync(joinRequestsFile, "utf8");
  return JSON.parse(data);
}

function saveJoinRequests(data: JoinRequestData): void {
  fs.writeFileSync(joinRequestsFile, JSON.stringify(data, null, 2));
}

export async function createGuild(
  userId: string,
  name: string,
  description: string,
  isPublic: boolean = true,
): Promise<GuildOperationResult> {
  const userGuilds = getUserGuilds();

  if (userGuilds[userId]) {
    return {
      success: false,
      message:
        "❌ Você já está em uma guilda! Saia da sua guilda atual primeiro.",
    };
  }

  if (name.length < 3 || name.length > 30) {
    return {
      success: false,
      message: "❌ O nome da guilda deve ter entre 3 e 30 caracteres!",
    };
  }

  if (description.length < 10 || description.length > 200) {
    return {
      success: false,
      message: "❌ A descrição deve ter entre 10 e 200 caracteres!",
    };
  }

  const guilds = getGuilds();
  const existingGuild = Object.values(guilds).find(
    (g) => g.name.toLowerCase() === name.toLowerCase(),
  );

  if (existingGuild) {
    return {
      success: false,
      message: "❌ Já existe uma guilda com este nome! Escolha outro.",
    };
  }

  // Deduzir 1000 Saloon Tokens
  const removeResult = await removeUserGold(userId, 1000);
  if (!removeResult.success) {
    return {
      success: false,
      message:
        "❌ Você não tem tokens suficientes para criar uma guilda! Custo: 1000 🎫 Saloon Tokens.",
    };
  }

  const guildId = `guild_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  const newGuild: PlayerGuild = {
    id: guildId,
    name: name.trim(),
    description: description.trim(),
    leaderId: userId,
    createdAt: Date.now(),
    members: [
      {
        userId: userId,
        joinedAt: Date.now(),
        role: "leader",
      },
    ],
    level: 1,
    xp: 0,
    settings: {
      maxMembers: 20,
      isPublic: isPublic,
      requireApproval: !isPublic,
    },
  };

  guilds[guildId] = newGuild;
  userGuilds[userId] = guildId;

  saveGuilds(guilds);
  saveUserGuilds(userGuilds);

  return {
    success: true,
    message: `✅ Guilda **${name}** criada com sucesso!\n💰 ${1000} 🎫 Saloon Tokens deduzidos.`,
    guild: newGuild,
  };
}

export function getUserGuild(userId: string): PlayerGuild | null {
  const userGuilds = getUserGuilds();
  const guildId = userGuilds[userId];

  if (!guildId) {
    return null;
  }

  const guilds = getGuilds();
  return guilds[guildId] || null;
}

export function getGuildById(guildId: string): PlayerGuild | null {
  const guilds = getGuilds();
  return guilds[guildId] || null;
}

export function getAllGuilds(): PlayerGuild[] {
  const guilds = getGuilds();
  return Object.values(guilds);
}

export function getPublicGuilds(): PlayerGuild[] {
  const guilds = getAllGuilds();
  return guilds.filter((g) => g.settings.isPublic);
}

export function joinGuild(
  userId: string,
  guildId: string,
): GuildOperationResult {
  const userGuilds = getUserGuilds();

  if (userGuilds[userId]) {
    return {
      success: false,
      message:
        "❌ Você já está em uma guilda! Saia da sua guilda atual primeiro.",
    };
  }

  const guilds = getGuilds();
  const guild = guilds[guildId];

  if (!guild) {
    return {
      success: false,
      message: "❌ Guilda não encontrada!",
    };
  }

  if (guild.members.length >= guild.settings.maxMembers) {
    return {
      success: false,
      message: "❌ Esta guilda está cheia! Tente outra.",
    };
  }

  guild.members.push({
    userId: userId,
    joinedAt: Date.now(),
    role: "member",
  });

  userGuilds[userId] = guildId;

  guilds[guildId] = guild;
  saveGuilds(guilds);
  saveUserGuilds(userGuilds);

  return {
    success: true,
    message: `✅ Você entrou na guilda **${guild.name}**!`,
    guild: guild,
  };
}

export function leaveGuild(userId: string): GuildOperationResult {
  const userGuilds = getUserGuilds();
  const guildId = userGuilds[userId];

  if (!guildId) {
    return {
      success: false,
      message: "❌ Você não está em nenhuma guilda!",
    };
  }

  const guilds = getGuilds();
  const guild = guilds[guildId];

  if (!guild) {
    return {
      success: false,
      message: "❌ Guilda não encontrada!",
    };
  }

  if (guild.leaderId === userId) {
    if (guild.members.length > 1) {
      return {
        success: false,
        message:
          "❌ Você é o líder! Transfira a liderança ou dissolva a guilda antes de sair.",
      };
    } else {
      delete guilds[guildId];
    }
  } else {
    guild.members = guild.members.filter((m) => m.userId !== userId);
    guilds[guildId] = guild;
  }

  delete userGuilds[userId];

  saveGuilds(guilds);
  saveUserGuilds(userGuilds);

  return {
    success: true,
    message: `✅ Você saiu da guilda **${guild.name}**!`,
  };
}

export function isUserInGuild(userId: string): boolean {
  const userGuilds = getUserGuilds();
  return !!userGuilds[userId];
}

export function getGuildMemberCount(guildId: string): number {
  const guild = getGuildById(guildId);
  return guild ? guild.members.length : 0;
}

export function createJoinRequest(
  userId: string,
  guildId: string,
): { success: boolean; message: string; requestId?: string } {
  const userGuilds = getUserGuilds();

  if (userGuilds[userId]) {
    return {
      success: false,
      message: "❌ Você já está em uma guilda!",
    };
  }

  const guild = getGuildById(guildId);

  if (!guild) {
    return {
      success: false,
      message: "❌ Guilda não encontrada!",
    };
  }

  if (guild.members.length >= guild.settings.maxMembers) {
    return {
      success: false,
      message: "❌ Esta guilda está cheia!",
    };
  }

  const requests = getJoinRequests();

  const existingRequest = Object.values(requests).find(
    (r) =>
      r.userId === userId && r.guildId === guildId && r.status === "pending",
  );

  if (existingRequest) {
    return {
      success: false,
      message: "⏳ Você já tem um pedido pendente para esta guilda!",
    };
  }

  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  const newRequest: JoinRequest = {
    id: requestId,
    userId: userId,
    guildId: guildId,
    requestedAt: Date.now(),
    status: "pending",
  };

  requests[requestId] = newRequest;
  saveJoinRequests(requests);

  return {
    success: true,
    message: `✅ Pedido enviado para o líder da guilda **${guild.name}**!`,
    requestId: requestId,
  };
}

export function approveJoinRequest(requestId: string): GuildOperationResult {
  const requests = getJoinRequests();
  const request = requests[requestId];

  if (!request) {
    return {
      success: false,
      message: "❌ Pedido não encontrado!",
    };
  }

  if (request.status !== "pending") {
    return {
      success: false,
      message: "❌ Este pedido já foi processado!",
    };
  }

  const result = joinGuild(request.userId, request.guildId);

  if (result.success) {
    request.status = "approved";
    requests[requestId] = request;
    saveJoinRequests(requests);
  } else {
    // Se joinGuild falhou (guilda cheia ou usuário já em outra guilda),
    // marcar como rejected para não ficar pendente
    request.status = "rejected";
    requests[requestId] = request;
    saveJoinRequests(requests);
  }

  return result;
}

export function rejectJoinRequest(requestId: string): {
  success: boolean;
  message: string;
  userId?: string;
  guildName?: string;
} {
  const requests = getJoinRequests();
  const request = requests[requestId];

  if (!request) {
    return {
      success: false,
      message: "❌ Pedido não encontrado!",
    };
  }

  if (request.status !== "pending") {
    return {
      success: false,
      message: "❌ Este pedido já foi processado!",
    };
  }

  const guild = getGuildById(request.guildId);

  if (!guild) {
    return {
      success: false,
      message: "❌ Guilda não encontrada!",
    };
  }

  request.status = "rejected";
  requests[requestId] = request;
  saveJoinRequests(requests);

  return {
    success: true,
    message: `✅ Pedido recusado!`,
    userId: request.userId,
    guildName: guild.name,
  };
}

export function getPendingRequestsForGuild(guildId: string): JoinRequest[] {
  const requests = getJoinRequests();
  return Object.values(requests).filter(
    (r) => r.guildId === guildId && r.status === "pending",
  );
}

export function getRequestById(requestId: string): JoinRequest | null {
  const requests = getJoinRequests();
  return requests[requestId] || null;
}

export function deleteJoinRequest(requestId: string): boolean {
  const requests = getJoinRequests();

  if (!requests[requestId]) {
    return false;
  }

  delete requests[requestId];
  saveJoinRequests(requests);
  return true;
}

export function kickMember(
  kickerId: string,
  targetId: string,
): GuildOperationResult {
  const userGuilds = getUserGuilds();
  const guildId = userGuilds[kickerId];

  if (!guildId) {
    return {
      success: false,
      message: "❌ Você não está em nenhuma guilda!",
    };
  }

  const guilds = getGuilds();
  const guild = guilds[guildId];

  if (!guild) {
    return {
      success: false,
      message: "❌ Guilda não encontrada!",
    };
  }

  // Verificar se o kicker é líder ou co-líder
  const kickerMember = guild.members.find((m) => m.userId === kickerId);
  if (
    !kickerMember ||
    (kickerMember.role !== "leader" && kickerMember.role !== "co-leader")
  ) {
    return {
      success: false,
      message: "❌ Apenas o líder ou co-líder pode expulsar membros!",
    };
  }

  // Verificar se o alvo está na guilda
  const targetMember = guild.members.find((m) => m.userId === targetId);
  if (!targetMember) {
    return {
      success: false,
      message: "❌ Este usuário não está na guilda!",
    };
  }

  // Não pode expulsar o líder
  if (targetMember.role === "leader") {
    return {
      success: false,
      message: "❌ Não é possível expulsar o líder da guilda!",
    };
  }

  // Co-líder não pode expulsar outro co-líder
  if (kickerMember.role === "co-leader" && targetMember.role === "co-leader") {
    return {
      success: false,
      message: "❌ Co-líderes não podem expulsar outros co-líderes!",
    };
  }

  // Não pode se expulsar
  if (kickerId === targetId) {
    return {
      success: false,
      message: '❌ Você não pode se expulsar! Use o botão "Sair da Guilda".',
    };
  }

  // Remover o membro
  guild.members = guild.members.filter((m) => m.userId !== targetId);
  delete userGuilds[targetId];

  guilds[guildId] = guild;
  saveGuilds(guilds);
  saveUserGuilds(userGuilds);

  return {
    success: true,
    message: `✅ <@${targetId}> foi expulso da guilda!`,
    guild: guild,
  };
}

export function promoteMember(
  leaderId: string,
  targetId: string,
): GuildOperationResult {
  const userGuilds = getUserGuilds();
  const guildId = userGuilds[leaderId];

  if (!guildId) {
    return {
      success: false,
      message: "❌ Você não está em nenhuma guilda!",
    };
  }

  const guilds = getGuilds();
  const guild = guilds[guildId];

  if (!guild) {
    return {
      success: false,
      message: "❌ Guilda não encontrada!",
    };
  }

  // Apenas o líder pode promover
  if (guild.leaderId !== leaderId) {
    return {
      success: false,
      message: "❌ Apenas o líder pode promover membros!",
    };
  }

  // Verificar se o alvo está na guilda
  const targetMember = guild.members.find((m) => m.userId === targetId);
  if (!targetMember) {
    return {
      success: false,
      message: "❌ Este usuário não está na guilda!",
    };
  }

  // Verificar se já é co-líder ou líder
  if (targetMember.role === "co-leader") {
    return {
      success: false,
      message: "❌ Este membro já é co-líder!",
    };
  }

  if (targetMember.role === "leader") {
    return {
      success: false,
      message: "❌ Este membro já é o líder!",
    };
  }

  // Promover para co-líder
  guild.members = guild.members.map((m) =>
    m.userId === targetId ? { ...m, role: "co-leader" as const } : m,
  );

  guilds[guildId] = guild;
  saveGuilds(guilds);

  return {
    success: true,
    message: `✅ <@${targetId}> foi promovido a co-líder!`,
    guild: guild,
  };
}

export function demoteMember(
  leaderId: string,
  targetId: string,
): GuildOperationResult {
  const userGuilds = getUserGuilds();
  const guildId = userGuilds[leaderId];

  if (!guildId) {
    return {
      success: false,
      message: "❌ Você não está em nenhuma guilda!",
    };
  }

  const guilds = getGuilds();
  const guild = guilds[guildId];

  if (!guild) {
    return {
      success: false,
      message: "❌ Guilda não encontrada!",
    };
  }

  // Apenas o líder pode rebaixar
  if (guild.leaderId !== leaderId) {
    return {
      success: false,
      message: "❌ Apenas o líder pode rebaixar membros!",
    };
  }

  // Verificar se o alvo está na guilda
  const targetMember = guild.members.find((m) => m.userId === targetId);
  if (!targetMember) {
    return {
      success: false,
      message: "❌ Este usuário não está na guilda!",
    };
  }

  // Verificar se é co-líder
  if (targetMember.role !== "co-leader") {
    return {
      success: false,
      message: "❌ Este membro não é um co-líder!",
    };
  }

  // Rebaixar para membro
  guild.members = guild.members.map((m) =>
    m.userId === targetId ? { ...m, role: "member" as const } : m,
  );

  guilds[guildId] = guild;
  saveGuilds(guilds);

  return {
    success: true,
    message: `✅ <@${targetId}> foi rebaixado a membro!`,
    guild: guild,
  };
}

export function getGuildLeaderboard(
  limit: number = 10,
): Array<{ guildId: string; guild: PlayerGuild; score: number }> {
  const guilds = getGuilds();
  const guildArray = Object.entries(guilds).map(([id, guild]) => ({
    guildId: id,
    guild: guild,
    score: guild.level * 1000 + guild.xp,
  }));

  return guildArray.sort((a, b) => b.score - a.score).slice(0, limit);
}
