import { pgTable, text, serial, timestamp, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const clientsTable = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  status: text("status").notNull().default("active"),
  weddingDate: text("wedding_date"),
  eventLocation: text("event_location"),
  packageType: text("package_type"),
  totalAmount: real("total_amount"),
  advancePaid: real("advance_paid"),
  remainingBalance: real("remaining_balance"),
  paymentStatus: text("payment_status").default("pending"),
  notes: text("notes"),
  tags: text("tags").array().default([]),
  progress: integer("progress").default(0),
  referredBy: text("referred_by"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertClientSchema = createInsertSchema(clientsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clientsTable.$inferSelect;
