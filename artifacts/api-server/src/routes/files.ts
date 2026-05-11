import { Router } from "express";
import { db } from "../lib/db";
import { filesTable, clientsTable, projectsTable } from "@workspace/db/schema";
import { CreateFileBody, UpdateFileBody } from "@workspace/api-zod";
import { eq } from "drizzle-orm";

const router = Router();

function mapRow(f: typeof filesTable.$inferSelect, clientName?: string | null, projectName?: string | null) {
  return {
    id: f.id,
    name: f.name,
    originalName: f.originalName,
    type: f.type,
    size: f.size,
    url: f.url,
    deliveryLink: f.deliveryLink,
    projectId: f.projectId,
    clientId: f.clientId,
    uploadedBy: f.uploadedBy,
    availability: f.availability,
    backupStatus: f.backupStatus,
    downloadCount: f.downloadCount ?? 0,
    notes: f.notes,
    clientName: clientName ?? null,
    projectName: projectName ?? null,
    createdAt: f.createdAt?.toISOString(),
    updatedAt: f.updatedAt?.toISOString(),
  };
}

async function enrichFile(f: typeof filesTable.$inferSelect) {
  const [clientRes, projectRes] = await Promise.all([
    f.clientId ? db.select({ name: clientsTable.name }).from(clientsTable).where(eq(clientsTable.id, f.clientId)) : Promise.resolve([]),
    f.projectId ? db.select({ name: projectsTable.name }).from(projectsTable).where(eq(projectsTable.id, f.projectId)) : Promise.resolve([]),
  ]);
  return mapRow(f, clientRes[0]?.name ?? null, projectRes[0]?.name ?? null);
}

router.get("/", async (req, res) => {
  try {
    const { projectId, clientId, type } = req.query as Record<string, string>;
    let files = await db.select().from(filesTable).orderBy(filesTable.createdAt);
    if (projectId) files = files.filter((f) => f.projectId === parseInt(projectId, 10));
    if (clientId) files = files.filter((f) => f.clientId === parseInt(clientId, 10));
    if (type) files = files.filter((f) => f.type === type);
    const result = await Promise.all(files.map(enrichFile));
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to list files");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const parsed = CreateFileBody.parse(req.body);
    const [inserted] = await db.insert(filesTable).values({
      name: parsed.name,
      originalName: (parsed as Record<string, unknown>).originalName as string ?? parsed.name,
      type: parsed.type ?? "photo",
      size: parsed.size ?? null,
      url: parsed.url ?? null,
      deliveryLink: parsed.deliveryLink ?? null,
      projectId: parsed.projectId ?? null,
      clientId: parsed.clientId ?? null,
      uploadedBy: parsed.uploadedBy ?? null,
      availability: parsed.availability ?? "available",
      backupStatus: parsed.backupStatus ?? "none",
      downloadCount: parsed.downloadCount ?? 0,
      notes: parsed.notes ?? null,
    }).returning();
    res.status(201).json(await enrichFile(inserted));
  } catch (err) {
    req.log.error({ err }, "Failed to create file");
    res.status(400).json({ error: "Invalid data" });
  }
});

router.get("/:id", async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const [file] = await db.select().from(filesTable).where(eq(filesTable.id, id));
    if (!file) { res.status(404).json({ error: "File not found" }); return; }
    res.json(await enrichFile(file));
  } catch (err) {
    req.log.error({ err }, "Failed to get file");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const parsed = UpdateFileBody.parse(req.body);
    const updateData: Partial<typeof filesTable.$inferInsert> = {};
    if (parsed.name !== undefined) updateData.name = parsed.name;
    if (parsed.type !== undefined) updateData.type = parsed.type;
    if (parsed.size !== undefined) updateData.size = parsed.size;
    if (parsed.url !== undefined) updateData.url = parsed.url;
    if (parsed.deliveryLink !== undefined) updateData.deliveryLink = parsed.deliveryLink;
    if (parsed.projectId !== undefined) updateData.projectId = parsed.projectId;
    if (parsed.clientId !== undefined) updateData.clientId = parsed.clientId;
    if (parsed.uploadedBy !== undefined) updateData.uploadedBy = parsed.uploadedBy;
    if (parsed.availability !== undefined) updateData.availability = parsed.availability;
    if (parsed.backupStatus !== undefined) updateData.backupStatus = parsed.backupStatus;
    if (parsed.downloadCount !== undefined) updateData.downloadCount = parsed.downloadCount;
    if (parsed.notes !== undefined) updateData.notes = parsed.notes;
    const [updated] = await db.update(filesTable).set(updateData).where(eq(filesTable.id, id)).returning();
    if (!updated) { res.status(404).json({ error: "File not found" }); return; }
    res.json(await enrichFile(updated));
  } catch (err) {
    req.log.error({ err }, "Failed to update file");
    res.status(400).json({ error: "Invalid data" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await db.delete(filesTable).where(eq(filesTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete file");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
