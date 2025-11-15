import { User } from "discord.js";

export interface TeamCapture {
  leaderId: string;
  leaderTag: string;
  targetId: string;
  targetTag: string;
  bountyAmount: number;
  members: Array<{
    id: string;
    tag: string;
    joinedAt: number;
  }>;
  guildId: string;
  channelId: string;
  messageId: string;
  createdAt: number;
  expiresAt: number;
  status: "recruiting" | "ready" | "completed" | "expired";
  maxMembers: number;
}

class TeamCaptureManager {
  private teams: Map<string, TeamCapture> = new Map();
  private readonly TEAM_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes to form team
  private readonly MAX_TEAM_SIZE = 5;
  private readonly MIN_TEAM_SIZE = 2;

  /**
   * Create a new team capture session
   */
  createTeam(
    leader: User,
    target: User,
    bountyAmount: number,
    guildId: string,
    channelId: string,
    messageId: string,
    maxMembers: number = 5
  ): TeamCapture {
    const teamId = `${guildId}-${leader.id}-${Date.now()}`;
    
    const team: TeamCapture = {
      leaderId: leader.id,
      leaderTag: leader.tag,
      targetId: target.id,
      targetTag: target.tag,
      bountyAmount,
      members: [
        {
          id: leader.id,
          tag: leader.tag,
          joinedAt: Date.now(),
        },
      ],
      guildId,
      channelId,
      messageId,
      createdAt: Date.now(),
      expiresAt: Date.now() + this.TEAM_EXPIRY_TIME,
      status: "recruiting",
      maxMembers: Math.min(maxMembers, this.MAX_TEAM_SIZE),
    };

    this.teams.set(teamId, team);
    return team;
  }

  /**
   * Add a member to a team
   */
  addMember(teamId: string, user: User): { success: boolean; error?: string } {
    const team = this.teams.get(teamId);

    if (!team) {
      return { success: false, error: "Team not found" };
    }

    if (team.status !== "recruiting") {
      return { success: false, error: "Team is no longer recruiting" };
    }

    if (Date.now() > team.expiresAt) {
      team.status = "expired";
      return { success: false, error: "Team recruitment has expired" };
    }

    if (team.members.length >= team.maxMembers) {
      return { success: false, error: "Team is full" };
    }

    if (team.members.some((m) => m.id === user.id)) {
      return { success: false, error: "User already in team" };
    }

    if (user.id === team.targetId) {
      return { success: false, error: "Target cannot join the hunting team" };
    }

    team.members.push({
      id: user.id,
      tag: user.tag,
      joinedAt: Date.now(),
    });

    team.status = team.members.length >= this.MIN_TEAM_SIZE ? "ready" : "recruiting";

    return { success: true };
  }

  /**
   * Remove a member from a team
   */
  removeMember(teamId: string, userId: string): { success: boolean; error?: string } {
    const team = this.teams.get(teamId);

    if (!team) {
      return { success: false, error: "Team not found" };
    }

    if (userId === team.leaderId) {
      // If leader leaves, disband team
      this.teams.delete(teamId);
      return { success: true };
    }

    team.members = team.members.filter((m) => m.id !== userId);

    if (team.members.length < this.MIN_TEAM_SIZE) {
      team.status = "recruiting";
    }

    return { success: true };
  }

  /**
   * Get team by ID
   */
  getTeam(teamId: string): TeamCapture | undefined {
    return this.teams.get(teamId);
  }

  /**
   * Get team by message ID
   */
  getTeamByMessage(messageId: string): { teamId: string; team: TeamCapture } | undefined {
    for (const [teamId, team] of this.teams.entries()) {
      if (team.messageId === messageId) {
        return { teamId, team };
      }
    }
    return undefined;
  }

  /**
   * Mark team as completed
   */
  completeTeam(teamId: string): void {
    const team = this.teams.get(teamId);
    if (team) {
      team.status = "completed";
      // Auto-cleanup after 1 minute
      setTimeout(() => {
        this.teams.delete(teamId);
      }, 60000);
    }
  }

  /**
   * Check if user is in any active team for this target
   */
  isUserInTeamForTarget(userId: string, targetId: string): boolean {
    for (const team of this.teams.values()) {
      if (
        team.targetId === targetId &&
        (team.status === "recruiting" || team.status === "ready") &&
        team.members.some((m) => m.id === userId)
      ) {
        return true;
      }
    }
    return false;
  }

  /**
   * Cleanup expired teams
   */
  cleanupExpiredTeams(): number {
    let cleaned = 0;
    const now = Date.now();

    for (const [teamId, team] of this.teams.entries()) {
      if (now > team.expiresAt && team.status === "recruiting") {
        team.status = "expired";
        this.teams.delete(teamId);
        cleaned++;
      }
    }

    return cleaned;
  }

  /**
   * Get active teams count
   */
  getActiveTeamsCount(): number {
    return Array.from(this.teams.values()).filter(
      (t) => t.status === "recruiting" || t.status === "ready"
    ).length;
  }

  /**
   * Calculate reward split for team members
   */
  calculateRewardSplit(teamId: string): Map<string, number> | undefined {
    const team = this.teams.get(teamId);
    if (!team) return undefined;

    const rewardPerMember = Math.floor(team.bountyAmount / team.members.length);
    const remainder = team.bountyAmount % team.members.length;

    const rewards = new Map<string, number>();

    team.members.forEach((member, index) => {
      // Leader gets the remainder (usually just a few coins)
      const bonus = index === 0 ? remainder : 0;
      rewards.set(member.id, rewardPerMember + bonus);
    });

    return rewards;
  }
}

// Singleton instance
export const teamCaptureManager = new TeamCaptureManager();

// Cleanup expired teams every minute
setInterval(() => {
  const cleaned = teamCaptureManager.cleanupExpiredTeams();
  if (cleaned > 0) {
    console.log(`[TeamCapture] Cleaned up ${cleaned} expired teams`);
  }
}, 60000);
