import { Router } from "express";
import { db } from "../lib/db";
import { projectsTable, clientsTable } from "@workspace/db/schema";
import { CreateProjectBody, UpdateProjectBody, UpdateProjectStatusBody } from "@workspace/api-zod";
import { eq } from "drizzle-orm";

const router = Router();

function mapRow(p: typeof projectsTable.$inferSelect, clientName?: string | null) {
  return {
    id: p.id,
    name: p.name,
    clientId: p.clientId,
    clientName: clientName ?? null,
    status: p.status,
    type: p.type,
    deadline: p.deadline,
    deliveryDate: p.deliveryDate,
    deliveryLink: p.deliveryLink,
    notes: p.notes,
    priority: p.priority ?? "medium",
    assignedTo: p.assignedTo,
    tags: p.tags ?? [],
    createdAt: p.createdAt?.toISOString(),
    updatedAt: p.updatedAt?.toISOString(),
  };
}

async function getClientName(clientId: number | null): Promise<string | null> {
  if (!clientId) return null;
  const [c] = await db.select({ name: clientsTable.name }).from(clientsTable).where(eq(clientsTable.id, clientId));
  return c?.name ?? null;
}

router.get("/", async (req, res) => {
  try {
    const { clientId, status, search } = req.query as Record<string, string>;
    const [projects, clients] = await Promise.all([
      db.select().from(projectsTable).orderBy(projectsTable.createdAt),
      db.select({ id: clientsTable.id, name: clientsTable.name }).from(clientsTable),
    ]);
    const clientMap = new Map(clients.map((c) => [c.id, c.name]));
    let result = projects
      .filter((p) => (!clientId || p.clientId === parseInt(clientId, 10)))
      .filter((p) => (!status || p.status === status))
      .map((p) => mapRow(p, clientMap.get(p.clientId) ?? null));
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(s) || (p.clientName && p.clientName.toLowerCase().includes(s))
      );
    }
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to list projects");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const parsed = CreateProjectBody.parse(req.body);
    const [inserted] = await db.insert(projectsTable).values({
      name: parsed.name,
      clientId: parsed.clientId,
      status: parsed.status ?? "Booked",
      type: parsed.type ?? null,
      deadline: parsed.deadline ?? null,
      deliveryDate: parsed.deliveryDate ?? null,
      deliveryLink: parsed.deliveryLink ?? null,
      notes: parsed.notes ?? null,
      priority: parsed.priority ?? "medium",
      assignedTo: parsed.assignedTo ?? null,
      tags: parsed.tags ?? [],
    }).returning();
    const clientName = await getClientName(inserted.clientId);
    res.status(201).json(mapRow(inserted, clientName));
  } catch (err) {
    req.log.error({ err }, "Failed to create project");
    res.status(400).json({ error: "Invalid data" });
  }
});

router.get("/:id", async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, id));
    if (!project) { res.status(404).json({ error: "Project not found" }); return; }
    const clientName = await getClientName(project.clientId);
    res.json(mapRow(project, clientName));
  } catch (err) {
    req.log.error({ err }, "Failed to get project");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const parsed = UpdateProjectBody.parse(req.body);
    const updateData: Partial<typeof projectsTable.$inferInsert> = {};
    if (parsed.name !== undefined) updateData.name = parsed.name;
    if (parsed.clientId !== undefined) updateData.clientId = parsed.clientId;
    if (parsed.status !== undefined) updateData.status = parsed.status;
    if (parsed.type !== undefined) updateData.type = parsed.type;
    if (parsed.deadline !== undefined) updateData.deadline = parsed.deadline;
    if (parsed.deliveryDate !== undefined) updateData.deliveryDate = parsed.deliveryDate;
    if (parsed.deliveryLink !== undefined) updateData.deliveryLink = parsed.deliveryLink;
    if (parsed.notes !== undefined) updateData.notes = parsed.notes;
    if (parsed.priority !== undefined) updateData.priority = parsed.priority;
    if (parsed.assignedTo !== undefined) updateData.assignedTo = parsed.assignedTo;
    if (parsed.tags !== undefined) updateData.tags = parsed.tags;
    const [updated] = await db.update(projectsTable).set(updateData).where(eq(projectsTable.id, id)).returning();
    if (!updated) { res.status(404).json({ error: "Project not found" }); return; }
    const clientName = await getClientName(updated.clientId);
    res.json(mapRow(updated, clientName));
  } catch (err) {
    req.log.error({ err }, "Failed to update project");
    res.status(400).json({ error: "Invalid data" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await db.delete(projectsTable).where(eq(projectsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete project");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id/status", async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const parsed = UpdateProjectStatusBody.parse(req.body);
    const [updated] = await db.update(projectsTable).set({ status: parsed.status }).where(eq(projectsTable.id, id)).returning();
    if (!updated) { res.status(404).json({ error: "Project not found" }); return; }
    const clientName = await getClientName(updated.clientId);
    res.json(mapRow(updated, clientName));
  } catch (err) {
    req.log.error({ err }, "Failed to update project status");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
