import { Router } from "express";
import { supabase } from "../lib/supabase";
import { CreateFileBody, UpdateFileBody } from "@workspace/api-zod";

const router = Router();

const TABLE = "xito_files";

function mapRow(f: Record<string, unknown>, clientName?: string | null, projectName?: string | null) {
  return {
    id: f.id,
    name: f.name,
    originalName: f.original_name,
    type: f.type,
    size: f.size,
    url: f.url,
    deliveryLink: f.delivery_link,
    projectId: f.project_id,
    clientId: f.client_id,
    uploadedBy: f.uploaded_by,
    availability: f.availability,
    backupStatus: f.backup_status,
    downloadCount: f.download_count ?? 0,
    notes: f.notes,
    clientName: clientName ?? null,
    projectName: projectName ?? null,
    createdAt: f.created_at,
    updatedAt: f.updated_at,
  };
}

function toDb(data: Record<string, unknown>) {
  const row: Record<string, unknown> = {};
  if (data.name !== undefined) row.name = data.name;
  if (data.originalName !== undefined) row.original_name = data.originalName;
  if (data.type !== undefined) row.type = data.type;
  if (data.size !== undefined) row.size = data.size;
  if (data.url !== undefined) row.url = data.url;
  if (data.deliveryLink !== undefined) row.delivery_link = data.deliveryLink;
  if (data.projectId !== undefined) row.project_id = data.projectId;
  if (data.clientId !== undefined) row.client_id = data.clientId;
  if (data.uploadedBy !== undefined) row.uploaded_by = data.uploadedBy;
  if (data.availability !== undefined) row.availability = data.availability;
  if (data.backupStatus !== undefined) row.backup_status = data.backupStatus;
  if (data.downloadCount !== undefined) row.download_count = data.downloadCount;
  if (data.notes !== undefined) row.notes = data.notes;
  return row;
}

async function enrichFile(f: Record<string, unknown>) {
  const [clientRes, projectRes] = await Promise.all([
    f.client_id
      ? supabase.from("xito_clients").select("name").eq("id", f.client_id).single()
      : Promise.resolve({ data: null }),
    f.project_id
      ? supabase.from("xito_projects").select("name").eq("id", f.project_id).single()
      : Promise.resolve({ data: null }),
  ]);
  return mapRow(
    f,
    (clientRes.data as Record<string, unknown> | null)?.name as string | null,
    (projectRes.data as Record<string, unknown> | null)?.name as string | null
  );
}

router.get("/", async (req, res) => {
  try {
    const { projectId, clientId, type } = req.query as Record<string, string>;

    let query = supabase.from(TABLE).select("*").order("created_at");
    if (projectId) query = query.eq("project_id", projectId);
    if (clientId) query = query.eq("client_id", clientId);
    if (type) query = query.eq("type", type);

    const { data, error } = await query;
    if (error) throw error;

    const result = await Promise.all((data ?? []).map(enrichFile));
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to list files");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const parsed = CreateFileBody.parse(req.body);
    const row = toDb({ ...parsed, originalName: (parsed as Record<string, unknown>).originalName ?? parsed.name } as unknown as Record<string, unknown>);
    row.updated_at = new Date().toISOString();

    const { data, error } = await supabase.from(TABLE).insert(row).select().single();
    if (error) throw error;

    res.status(201).json(await enrichFile(data));
  } catch (err) {
    req.log.error({ err }, "Failed to create file");
    res.status(400).json({ error: "Invalid data" });
  }
});

router.get("/:id", async (req, res): Promise<void> => {
  try {
    const { data, error } = await supabase.from(TABLE).select("*").eq("id", req.params.id).single();
    if (error || !data) {
      res.status(404).json({ error: "File not found" });
      return;
    }
    res.json(await enrichFile(data));
  } catch (err) {
    req.log.error({ err }, "Failed to get file");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", async (req, res): Promise<void> => {
  try {
    const parsed = UpdateFileBody.parse(req.body);
    const row = toDb(parsed as unknown as Record<string, unknown>);
    row.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from(TABLE)
      .update(row)
      .eq("id", req.params.id)
      .select()
      .single();

    if (error || !data) {
      res.status(404).json({ error: "File not found" });
      return;
    }
    res.json(await enrichFile(data));
  } catch (err) {
    req.log.error({ err }, "Failed to update file");
    res.status(400).json({ error: "Invalid data" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { error } = await supabase.from(TABLE).delete().eq("id", req.params.id);
    if (error) throw error;
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete file");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
