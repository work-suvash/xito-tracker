import { Router } from "express";
import { db } from "../lib/db";
import { clientsTable } from "@workspace/db/schema";
import { CreateClientBody, UpdateClientBody } from "@workspace/api-zod";
import { eq } from "drizzle-orm";

const router = Router();

function mapRow(c: typeof clientsTable.$inferSelect) {
  return {
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    status: c.status,
    weddingDate: c.weddingDate,
    eventLocation: c.eventLocation,
    packageType: c.packageType,
    totalAmount: c.totalAmount,
    advancePaid: c.advancePaid,
    remainingBalance: c.remainingBalance,
    paymentStatus: c.paymentStatus,
    notes: c.notes,
    tags: c.tags ?? [],
    progress: c.progress ?? 0,
    referredBy: c.referredBy,
    avatarUrl: c.avatarUrl,
    createdAt: c.createdAt?.toISOString(),
    updatedAt: c.updatedAt?.toISOString(),
  };
}

router.get("/", async (req, res) => {
  try {
    const { search, status, tag } = req.query as Record<string, string>;
    let clients = await db.select().from(clientsTable).orderBy(clientsTable.createdAt);
    if (status) clients = clients.filter((c) => c.status === status);
    if (search) {
      const s = search.toLowerCase();
      clients = clients.filter(
        (c) =>
          c.name.toLowerCase().includes(s) ||
          c.email.toLowerCase().includes(s) ||
          (c.phone && c.phone.includes(s))
      );
    }
    if (tag) clients = clients.filter((c) => Array.isArray(c.tags) && c.tags.includes(tag));
    res.json(clients.map(mapRow));
  } catch (err) {
    req.log.error({ err }, "Failed to list clients");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const parsed = CreateClientBody.parse(req.body);
    const [inserted] = await db.insert(clientsTable).values({
      name: parsed.name,
      email: parsed.email,
      phone: parsed.phone,
      status: parsed.status ?? "active",
      weddingDate: parsed.weddingDate ?? null,
      eventLocation: parsed.eventLocation ?? null,
      packageType: parsed.packageType ?? null,
      totalAmount: parsed.totalAmount ?? null,
      advancePaid: parsed.advancePaid ?? null,
      remainingBalance: parsed.remainingBalance ?? null,
      paymentStatus: parsed.paymentStatus ?? "pending",
      notes: parsed.notes ?? null,
      tags: parsed.tags ?? [],
      progress: parsed.progress ?? 0,
      referredBy: parsed.referredBy ?? null,
      avatarUrl: parsed.avatarUrl ?? null,
    }).returning();
    res.status(201).json(mapRow(inserted));
  } catch (err) {
    req.log.error({ err }, "Failed to create client");
    res.status(400).json({ error: "Invalid data" });
  }
});

router.get("/:id", async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const [client] = await db.select().from(clientsTable).where(eq(clientsTable.id, id));
    if (!client) { res.status(404).json({ error: "Client not found" }); return; }
    res.json(mapRow(client));
  } catch (err) {
    req.log.error({ err }, "Failed to get client");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const parsed = UpdateClientBody.parse(req.body);
    const updateData: Partial<typeof clientsTable.$inferInsert> = {};
    if (parsed.name !== undefined) updateData.name = parsed.name;
    if (parsed.email !== undefined) updateData.email = parsed.email;
    if (parsed.phone !== undefined) updateData.phone = parsed.phone;
    if (parsed.status !== undefined) updateData.status = parsed.status;
    if (parsed.weddingDate !== undefined) updateData.weddingDate = parsed.weddingDate;
    if (parsed.eventLocation !== undefined) updateData.eventLocation = parsed.eventLocation;
    if (parsed.packageType !== undefined) updateData.packageType = parsed.packageType;
    if (parsed.totalAmount !== undefined) updateData.totalAmount = parsed.totalAmount;
    if (parsed.advancePaid !== undefined) updateData.advancePaid = parsed.advancePaid;
    if (parsed.remainingBalance !== undefined) updateData.remainingBalance = parsed.remainingBalance;
    if (parsed.paymentStatus !== undefined) updateData.paymentStatus = parsed.paymentStatus;
    if (parsed.notes !== undefined) updateData.notes = parsed.notes;
    if (parsed.tags !== undefined) updateData.tags = parsed.tags;
    if (parsed.progress !== undefined) updateData.progress = parsed.progress;
    if (parsed.referredBy !== undefined) updateData.referredBy = parsed.referredBy;
    if (parsed.avatarUrl !== undefined) updateData.avatarUrl = parsed.avatarUrl;
    const [updated] = await db.update(clientsTable).set(updateData).where(eq(clientsTable.id, id)).returning();
    if (!updated) { res.status(404).json({ error: "Client not found" }); return; }
    res.json(mapRow(updated));
  } catch (err) {
    req.log.error({ err }, "Failed to update client");
    res.status(400).json({ error: "Invalid data" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await db.delete(clientsTable).where(eq(clientsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete client");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
