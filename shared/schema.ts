import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  phoneNumber: text("phone_number").notNull(),
  role: text("role").notNull().default("member"), // "admin" or "member"
});

export const groups = pgTable("groups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  targetAmount: decimal("target_amount", { precision: 15, scale: 2 }).notNull(),
  collectedAmount: decimal("collected_amount", { precision: 15, scale: 2 }).notNull().default("0"),
  whatsappLink: text("whatsapp_link"),
  registrationLink: text("registration_link").notNull().unique(),
  customSlug: text("custom_slug").unique(), // For kontrib.app/customslug URLs
  deadline: timestamp("deadline"),
  status: text("status").notNull().default("active"), // "active", "completed", "paused"
  adminId: varchar("admin_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const groupMembers = pgTable("group_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  groupId: varchar("group_id").notNull().references(() => groups.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  contributedAmount: decimal("contributed_amount", { precision: 15, scale: 2 }).notNull().default("0"),
  status: text("status").notNull().default("active"), // "active", "pending", "inactive"
  joinedAt: timestamp("joined_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const contributions = pgTable("contributions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  groupId: varchar("group_id").notNull().references(() => groups.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  description: text("description"),
  status: text("status").notNull().default("pending"), // "confirmed", "pending", "failed"
  transactionRef: text("transaction_ref"),
  proofOfPayment: text("proof_of_payment"), // Base64 encoded image or file path
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertGroupSchema = createInsertSchema(groups).omit({
  id: true,
  collectedAmount: true,
  registrationLink: true,
  adminId: true,
  createdAt: true,
});

export const insertGroupMemberSchema = createInsertSchema(groupMembers).omit({
  id: true,
  contributedAmount: true,
  status: true,
  joinedAt: true,
});

export const insertContributionSchema = createInsertSchema(contributions).omit({
  id: true,
  status: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type Group = typeof groups.$inferSelect;
export type GroupMember = typeof groupMembers.$inferSelect;
export type Contribution = typeof contributions.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertGroup = z.infer<typeof insertGroupSchema>;
export type InsertGroupMember = z.infer<typeof insertGroupMemberSchema>;
export type InsertContribution = z.infer<typeof insertContributionSchema>;

// Extended types for UI
export type GroupWithStats = Group & {
  memberCount: number;
  completionRate: number;
  pendingPayments: number;
};

export type MemberWithContributions = User & {
  totalContributions: string;
  groupCount: number;
  status: string;
};

export type ContributionWithDetails = Contribution & {
  userName: string;
  groupName: string;
};
