import { Router } from "express";
import { db } from "../lib/db";
import { notificationsTable, clientsTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";

const router = Router();

function mapRow(n: typeof notificationsTable.$inferSelect, clientName?: string | null) {
  return {
    id: n.id,
    type: n.type,
    title: n.title,
    message: n.message,
    isRead: n.isRead,
    clientId: n.clientId,
    projectId: n.projectId,
    dueDate: n.dueDate,
    clientName: clientName ?? null,
    createdAt: n.createdAt?.toISOString(),
  };
}

router.get("/", async (req, res) => {
  try {
    const { unreadOnly } = req.query as Record<string, string>;
    const [notifications, clients] = await Promise.all([
      db.select().from(notificationsTable).orderBy(desc(notificationsTable.createdAt)),
      db.select({ id: clientsTable.id, name: clientsTable.name }).from(clientsTable),
    ]);
    const clientMap = new Map(clients.map((c) => [c.id, c.name]));
    let result = notifications.map((n) => mapRow(n, n.clientId ? clientMap.get(n.clientId) ?? null : null));
    if (unreadOnly === "true") result = result.filter((n) => !n.isRead);
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to list notifications");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id/read", async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const [updated] = await db.update(notificationsTable).set({ isRead: true }).where(eq(notificationsTable.id, id)).returning();
    if (!updated) { res.status(404).json({ error: "Notification not found" }); return; }
    res.json(mapRow(updated));
  } catch (err) {
    req.log.error({ err }, "Failed to mark notification as read");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/read-all", async (req, res) => {
  try {
    await db.update(notificationsTable).set({ isRead: true }).where(eq(notificationsTable.isRead, false));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to mark all notifications as read");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
