import { Router } from "express";
import { supabase } from "../lib/supabase";
import { CreateProjectBody, UpdateProjectBody, UpdateProjectStatusBody } from "@workspace/api-zod";

const router = Router();

const TABLE = "xito_projects";
const CLIENTS_TABLE = "xito_clients";

function mapRow(p: Record<string, unknown>, clientName?: string | null) {
  return {
    id: p.id,
    name: p.name,
    clientId: p.client_id,
    clientName: clientName ?? null,
    status: p.status,
    type: p.type,
    deadline: p.deadline,
    deliveryDate: p.delivery_date,
    deliveryLink: p.delivery_link,
    notes: p.notes,
    priority: p.priority ?? "medium",
    assignedTo: p.assigned_to,
    tags: p.tags ?? [],
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  };
}

function toDb(data: Record<string, unknown>) {
  const row: Record<string, unknown> = {};
  if (data.name !== undefined) row.name = data.name;
  if (data.clientId !== undefined) row.client_id = data.clientId;
  if (data.status !== undefined) row.status = data.status;
  if (data.type !== undefined) row.type = data.type;
  if (data.deadline !== undefined) row.deadline = data.deadline;
  if (data.deliveryDate !== undefined) row.delivery_date = data.deliveryDate;
  if (data.deliveryLink !== undefined) row.delivery_link = data.deliveryLink;
  if (data.notes !== undefined) row.notes = data.notes;
  if (data.priority !== undefined) row.priority = data.priority;
  if (data.assignedTo !== undefined) row.assigned_to = data.assignedTo;
  if (data.tags !== undefined) row.tags = data.tags;
  return row;
}

async function getClientName(clientId: unknown): Promise<string | null> {
  if (!clientId) return null;
  const { data } = await supabase.from(CLIENTS_TABLE).select("name").eq("id", clientId).single();
  return data?.name ?? null;
}

router.get("/", async (req, res) => {
  try {
    const { clientId, status, search } = req.query as Record<string, string>;

    let query = supabase.from(TABLE).select("*").order("created_at");
    if (clientId) query = query.eq("client_id", clientId);
    if (status) query = query.eq("status", status);

    const [{ data: projects, error }, { data: clients }] = await Promise.all([
      query,
      supabase.from(CLIENTS_TABLE).select("id, name"),
    ]);

    if (error) throw error;

    const clientMap = new Map((clients ?? []).map((c: Record<string, unknown>) => [String(c.id), c.name]));

    let result = (projects ?? []).map((p: Record<string, unknown>) =>
      mapRow(p, clientMap.get(String(p.client_id)) as string | null)
    );

    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (p) =>
          String(p.name).toLowerCase().includes(s) ||
          (p.clientName && String(p.clientName).toLowerCase().includes(s))
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
    const row = toDb(parsed as unknown as Record<string, unknown>);
    row.updated_at = new Date().toISOString();

    const { data, error } = await supabase.from(TABLE).insert(row).select().single();
    if (error) throw error;

    const clientName = await getClientName(data.client_id);
    res.status(201).json(mapRow(data, clientName));
  } catch (err) {
    req.log.error({ err }, "Failed to create project");
    res.status(400).json({ error: "Invalid data" });
  }
});

router.get("/:id", async (req, res): Promise<void> => {
  try {
    const { data, error } = await supabase.from(TABLE).select("*").eq("id", req.params.id).single();
    if (error || !data) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    const clientName = await getClientName(data.client_id);
    res.json(mapRow(data, clientName));
  } catch (err) {
    req.log.error({ err }, "Failed to get project");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", async (req, res): Promise<void> => {
  try {
    const parsed = UpdateProjectBody.parse(req.body);
    const row = toDb(parsed as unknown as Record<string, unknown>);
    row.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from(TABLE)
      .update(row)
      .eq("id", req.params.id)
      .select()
      .single();

    if (error || !data) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    const clientName = await getClientName(data.client_id);
    res.json(mapRow(data, clientName));
  } catch (err) {
    req.log.error({ err }, "Failed to update project");
    res.status(400).json({ error: "Invalid data" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { error } = await supabase.from(TABLE).delete().eq("id", req.params.id);
    if (error) throw error;
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete project");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id/status", async (req, res): Promise<void> => {
  try {
    const parsed = UpdateProjectStatusBody.parse(req.body);
    const { data, error } = await supabase
      .from(TABLE)
      .update({ status: parsed.status, updated_at: new Date().toISOString() })
      .eq("id", req.params.id)
      .select()
      .single();

    if (error || !data) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    const clientName = await getClientName(data.client_id);
    res.json(mapRow(data, clientName));
  } catch (err) {
    req.log.error({ err }, "Failed to update project status");
    res.status(400).json({ error: "Invalid data" });
  }
});

export default router;
