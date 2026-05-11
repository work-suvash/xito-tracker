import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const filesTable = pgTable("files", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  originalName: text("original_name").notNull(),
  type: text("type").notNull().default("photo"),
  size: integer("size"),
  url: text("url"),
  deliveryLink: text("delivery_link"),
  projectId: integer("project_id"),
  clientId: integer("client_id"),
  uploadedBy: text("uploaded_by"),
  availability: text("availability").notNull().default("available"),
  backupStatus: text("backup_status").notNull().default("none"),
  downloadCount: integer("download_count").notNull().default(0),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertFileSchema = createInsertSchema(filesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertFile = z.infer<typeof insertFileSchema>;
export type FileRecord = typeof filesTable.$inferSelect;
