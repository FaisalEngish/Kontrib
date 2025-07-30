import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertGroupSchema, insertContributionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(userData);
      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Group routes
  app.get("/api/groups/admin/:adminId", async (req, res) => {
    try {
      const { adminId } = req.params;
      const groups = await storage.getGroupsByAdmin(adminId);
      res.json(groups);
    } catch (error) {
      console.error("Get admin groups error:", error);
      res.status(500).json({ message: "Failed to fetch groups" });
    }
  });

  app.get("/api/groups/user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const userGroups = await storage.getUserGroups(userId);
      res.json(userGroups);
    } catch (error) {
      console.error("Get user groups error:", error);
      res.status(500).json({ message: "Failed to fetch user groups" });
    }
  });

  app.get("/api/groups/registration/:link", async (req, res) => {
    try {
      const { link } = req.params;
      const group = await storage.getGroupByRegistrationLink(link);
      
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
      
      res.json(group);
    } catch (error) {
      console.error("Get group by link error:", error);
      res.status(500).json({ message: "Failed to fetch group" });
    }
  });

  app.get("/api/groups/slug/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const group = await storage.getGroupByCustomSlug(slug);
      
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
      
      res.json(group);
    } catch (error) {
      console.error("Get group by custom slug error:", error);
      res.status(500).json({ message: "Failed to fetch group" });
    }
  });

  app.post("/api/groups", async (req, res) => {
    try {
      const groupData = insertGroupSchema.parse(req.body);
      const { adminId } = req.body;
      
      if (!adminId) {
        return res.status(400).json({ message: "Admin ID is required" });
      }
      
      const group = await storage.createGroup(groupData, adminId);
      res.json(group);
    } catch (error) {
      console.error("Create group error:", error);
      res.status(400).json({ message: "Invalid group data" });
    }
  });

  app.post("/api/groups/:groupId/join", async (req, res) => {
    try {
      const { groupId } = req.params;
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      // Check if user is already a member
      const existingMember = await storage.getGroupMember(groupId, userId);
      if (existingMember) {
        return res.status(400).json({ message: "User is already a member of this group" });
      }
      
      const membership = await storage.addGroupMember({ groupId, userId });
      res.json(membership);
    } catch (error) {
      console.error("Join group error:", error);
      res.status(500).json({ message: "Failed to join group" });
    }
  });

  app.get("/api/groups/:groupId/members", async (req, res) => {
    try {
      const { groupId } = req.params;
      const members = await storage.getGroupMembers(groupId);
      res.json(members);
    } catch (error) {
      console.error("Get group members error:", error);
      res.status(500).json({ message: "Failed to fetch group members" });
    }
  });

  // Contribution routes
  app.get("/api/contributions/group/:groupId", async (req, res) => {
    try {
      const { groupId } = req.params;
      const contributions = await storage.getGroupContributions(groupId);
      res.json(contributions);
    } catch (error) {
      console.error("Get group contributions error:", error);
      res.status(500).json({ message: "Failed to fetch contributions" });
    }
  });

  app.get("/api/contributions/user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const contributions = await storage.getUserContributions(userId);
      res.json(contributions);
    } catch (error) {
      console.error("Get user contributions error:", error);
      res.status(500).json({ message: "Failed to fetch contributions" });
    }
  });

  app.post("/api/contributions", async (req, res) => {
    try {
      const contributionData = insertContributionSchema.parse(req.body);
      const contribution = await storage.createContribution(contributionData);
      res.json(contribution);
    } catch (error) {
      console.error("Create contribution error:", error);
      res.status(400).json({ message: "Invalid contribution data" });
    }
  });

  app.patch("/api/contributions/:id/confirm", async (req, res) => {
    try {
      const { id } = req.params;
      const contribution = await storage.confirmContribution(id);
      if (!contribution) {
        return res.status(404).json({ message: "Contribution not found" });
      }
      res.json(contribution);
    } catch (error) {
      console.error("Confirm contribution error:", error);
      res.status(500).json({ message: "Failed to confirm contribution" });
    }
  });

  // Stats routes
  app.get("/api/stats/user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Get user stats error:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  app.get("/api/stats/admin/:adminId", async (req, res) => {
    try {
      const { adminId } = req.params;
      const stats = await storage.getAdminStats(adminId);
      res.json(stats);
    } catch (error) {
      console.error("Get admin stats error:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
