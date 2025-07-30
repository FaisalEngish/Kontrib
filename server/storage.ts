import { 
  type User, 
  type Group, 
  type GroupMember, 
  type Contribution,
  type InsertUser, 
  type InsertGroup, 
  type InsertGroupMember, 
  type InsertContribution,
  type GroupWithStats,
  type MemberWithContributions,
  type ContributionWithDetails
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Group methods
  getGroup(id: string): Promise<Group | undefined>;
  getGroupByRegistrationLink(link: string): Promise<Group | undefined>;
  getGroupByCustomSlug(slug: string): Promise<Group | undefined>;
  getGroupsByAdmin(adminId: string): Promise<GroupWithStats[]>;
  createGroup(group: InsertGroup, adminId: string): Promise<Group>;
  updateGroup(id: string, updates: Partial<Group>): Promise<Group | undefined>;
  
  // Group member methods
  getGroupMembers(groupId: string): Promise<(GroupMember & { user: User })[]>;
  getUserGroups(userId: string): Promise<(GroupMember & { group: Group })[]>;
  addGroupMember(member: InsertGroupMember): Promise<GroupMember>;
  getGroupMember(groupId: string, userId: string): Promise<GroupMember | undefined>;
  
  // Contribution methods
  getGroupContributions(groupId: string): Promise<ContributionWithDetails[]>;
  getUserContributions(userId: string): Promise<ContributionWithDetails[]>;
  createContribution(contribution: InsertContribution): Promise<Contribution>;
  confirmContribution(contributionId: string): Promise<Contribution | undefined>;
  updateContribution(id: string, updates: Partial<Contribution>): Promise<Contribution | undefined>;
  
  // Stats methods
  getUserStats(userId: string): Promise<MemberWithContributions>;
  getAdminStats(adminId: string): Promise<{
    totalCollections: string;
    activeMembers: number;
    pendingPayments: number;
    completionRate: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private groups: Map<string, Group>;
  private groupMembers: Map<string, GroupMember>;
  private contributions: Map<string, Contribution>;

  constructor() {
    this.users = new Map();
    this.groups = new Map();
    this.groupMembers = new Map();
    this.contributions = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      role: insertUser.role || "member"
    };
    this.users.set(id, user);
    return user;
  }

  async getGroup(id: string): Promise<Group | undefined> {
    return this.groups.get(id);
  }

  async getGroupByRegistrationLink(link: string): Promise<Group | undefined> {
    return Array.from(this.groups.values()).find(group => group.registrationLink === link);
  }

  async getGroupByCustomSlug(slug: string): Promise<Group | undefined> {
    return Array.from(this.groups.values()).find(group => group.customSlug === slug);
  }

  async getGroupsByAdmin(adminId: string): Promise<GroupWithStats[]> {
    const adminGroups = Array.from(this.groups.values()).filter(group => group.adminId === adminId);
    
    return adminGroups.map(group => {
      const members = Array.from(this.groupMembers.values()).filter(member => member.groupId === group.id);
      const memberCount = members.length;
      const completionRate = group.targetAmount ? 
        Math.round((Number(group.collectedAmount) / Number(group.targetAmount)) * 100) : 0;
      
      const pendingPayments = members.filter(member => {
        const contributions = Array.from(this.contributions.values())
          .filter(contrib => contrib.groupId === group.id && contrib.userId === member.userId);
        const totalContributed = contributions.reduce((sum, contrib) => sum + Number(contrib.amount), 0);
        const expectedAmount = Number(group.targetAmount) / memberCount;
        return totalContributed < expectedAmount;
      }).length;

      return {
        ...group,
        memberCount,
        completionRate,
        pendingPayments
      };
    });
  }

  async createGroup(insertGroup: InsertGroup, adminId: string): Promise<Group> {
    const id = randomUUID();
    const registrationLink = randomUUID();
    
    // Create custom URL slug from group name
    const groupSlug = insertGroup.name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, '') // Remove spaces
      .substring(0, 20); // Limit length

    // Auto-generate WhatsApp sharing link if not provided
    let whatsappLink = insertGroup.whatsappLink;
    if (!whatsappLink) {
      const customUrl = `kontrib.app/${groupSlug}`;
      const message = `🎉 Join "${insertGroup.name}" on Kontrib!\n\nManage group contributions with transparency and ease.\n\n👉 Register here: ${customUrl}\n\n#Kontrib #GroupContributions`;
      whatsappLink = `https://wa.me/?text=${encodeURIComponent(message)}`;
    }
    
    const group: Group = {
      ...insertGroup,
      id,
      registrationLink,
      customSlug: groupSlug,
      adminId,
      collectedAmount: "0",
      createdAt: new Date(),
      description: insertGroup.description || null,
      whatsappLink,
      deadline: insertGroup.deadline || null,
      status: insertGroup.status || "active",
    };
    this.groups.set(id, group);
    return group;
  }

  async updateGroup(id: string, updates: Partial<Group>): Promise<Group | undefined> {
    const group = this.groups.get(id);
    if (!group) return undefined;
    
    const updatedGroup = { ...group, ...updates };
    this.groups.set(id, updatedGroup);
    return updatedGroup;
  }

  async getGroupMembers(groupId: string): Promise<(GroupMember & { user: User })[]> {
    const members = Array.from(this.groupMembers.values()).filter(member => member.groupId === groupId);
    return members.map(member => {
      const user = this.users.get(member.userId)!;
      return { ...member, user };
    });
  }

  async getUserGroups(userId: string): Promise<(GroupMember & { group: Group })[]> {
    const memberships = Array.from(this.groupMembers.values()).filter(member => member.userId === userId);
    return memberships.map(membership => {
      const group = this.groups.get(membership.groupId)!;
      return { ...membership, group };
    });
  }

  async addGroupMember(insertMember: InsertGroupMember): Promise<GroupMember> {
    const id = randomUUID();
    const member: GroupMember = {
      ...insertMember,
      id,
      contributedAmount: "0",
      status: "active",
      joinedAt: new Date(),
    };
    this.groupMembers.set(id, member);
    return member;
  }

  async getGroupMember(groupId: string, userId: string): Promise<GroupMember | undefined> {
    return Array.from(this.groupMembers.values())
      .find(member => member.groupId === groupId && member.userId === userId);
  }

  async getGroupContributions(groupId: string): Promise<ContributionWithDetails[]> {
    const contributions = Array.from(this.contributions.values())
      .filter(contrib => contrib.groupId === groupId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return contributions.map(contrib => {
      const user = this.users.get(contrib.userId)!;
      const group = this.groups.get(contrib.groupId)!;
      return {
        ...contrib,
        userName: user.fullName,
        groupName: group.name
      };
    });
  }

  async getUserContributions(userId: string): Promise<ContributionWithDetails[]> {
    const contributions = Array.from(this.contributions.values())
      .filter(contrib => contrib.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return contributions.map(contrib => {
      const user = this.users.get(contrib.userId)!;
      const group = this.groups.get(contrib.groupId)!;
      return {
        ...contrib,
        userName: user.fullName,
        groupName: group.name
      };
    });
  }

  async createContribution(insertContribution: InsertContribution): Promise<Contribution> {
    const id = randomUUID();
    const contribution: Contribution = {
      ...insertContribution,
      id,
      status: "pending", // All contributions start as pending until admin confirms
      createdAt: new Date(),
      description: insertContribution.description || null,
      transactionRef: insertContribution.transactionRef || null,
      proofOfPayment: insertContribution.proofOfPayment || null,
    };
    this.contributions.set(id, contribution);

    // Don't update amounts yet - wait for admin confirmation
    return contribution;
  }

  async confirmContribution(contributionId: string): Promise<Contribution | undefined> {
    const contribution = this.contributions.get(contributionId);
    if (!contribution) return undefined;

    // Update status to confirmed
    contribution.status = "confirmed";
    
    // Update group collected amount
    const group = this.groups.get(contribution.groupId);
    if (group) {
      const newCollectedAmount = (Number(group.collectedAmount) + Number(contribution.amount)).toString();
      await this.updateGroup(group.id, { collectedAmount: newCollectedAmount });
    }

    // Update member contributed amount
    const member = await this.getGroupMember(contribution.groupId, contribution.userId);
    if (member) {
      const newContributedAmount = (Number(member.contributedAmount) + Number(contribution.amount)).toString();
      this.groupMembers.set(member.id, { ...member, contributedAmount: newContributedAmount });
    }

    return contribution;
  }

  async updateContribution(id: string, updates: Partial<Contribution>): Promise<Contribution | undefined> {
    const contribution = this.contributions.get(id);
    if (!contribution) return undefined;
    
    const updatedContribution = { ...contribution, ...updates };
    this.contributions.set(id, updatedContribution);
    return updatedContribution;
  }

  async getUserStats(userId: string): Promise<MemberWithContributions> {
    const user = this.users.get(userId)!;
    const userContributions = Array.from(this.contributions.values())
      .filter(contrib => contrib.userId === userId);
    
    const totalContributions = userContributions
      .reduce((sum, contrib) => sum + Number(contrib.amount), 0)
      .toString();
    
    const groupCount = Array.from(this.groupMembers.values())
      .filter(member => member.userId === userId && member.status === "active").length;
    
    return {
      ...user,
      totalContributions,
      groupCount,
      status: "active"
    };
  }

  async getAdminStats(adminId: string): Promise<{
    totalCollections: string;
    activeMembers: number;
    pendingPayments: number;
    completionRate: number;
  }> {
    const adminGroups = Array.from(this.groups.values()).filter(group => group.adminId === adminId);
    
    const totalCollections = adminGroups
      .reduce((sum, group) => sum + Number(group.collectedAmount), 0)
      .toString();
    
    const activeMembers = Array.from(this.groupMembers.values())
      .filter(member => 
        adminGroups.some(group => group.id === member.groupId) && 
        member.status === "active"
      ).length;
    
    let totalPendingPayments = 0;
    let totalGroups = adminGroups.length;
    let completedGroups = 0;
    
    adminGroups.forEach(group => {
      const members = Array.from(this.groupMembers.values()).filter(member => member.groupId === group.id);
      const expectedPerMember = Number(group.targetAmount) / members.length;
      
      members.forEach(member => {
        const memberContributions = Array.from(this.contributions.values())
          .filter(contrib => contrib.groupId === group.id && contrib.userId === member.userId);
        const totalContributed = memberContributions.reduce((sum, contrib) => sum + Number(contrib.amount), 0);
        
        if (totalContributed < expectedPerMember) {
          totalPendingPayments++;
        }
      });
      
      if (Number(group.collectedAmount) >= Number(group.targetAmount)) {
        completedGroups++;
      }
    });
    
    const completionRate = totalGroups > 0 ? Math.round((completedGroups / totalGroups) * 100) : 0;
    
    return {
      totalCollections,
      activeMembers,
      pendingPayments: totalPendingPayments,
      completionRate
    };
  }
}

export const storage = new MemStorage();
