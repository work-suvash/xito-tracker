import { Router } from "express";
import { supabase } from "../lib/supabase";
import { CreateClientBody, UpdateClientBody } from "@workspace/api-zod";

const router = Router();

const TABLE = "xito_clients";

function mapRow(c: Record<string, unknown>) {
  return {
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    status: c.status,
    weddingDate: c.wedding_date,
    eventLocation: c.event_location,
    packageType: c.package_type,
    totalAmount: c.total_amount,
    advancePaid: c.advance_paid,
    remainingBalance: c.remaining_balance,
    paymentStatus: c.payment_status,
    notes: c.notes,
    tags: c.tags ?? [],
    progress: c.progress ?? 0,
    referredBy: c.referred_by,
    avatarUrl: c.avatar_url,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
  };
}

function toDb(data: Record<string, unknown>) {
  const row: Record<string, unknown> = {};
  if (data.name !== undefined) row.name = data.name;
  if (data.email !== undefined) row.email = data.email;
  if (data.phone !== undefined) row.phone = data.phone;
  if (data.status !== undefined) row.status = data.status;
  if (data.weddingDate !== undefined) row.wedding_date = data.weddingDate;
  if (data.eventLocation !== undefined) row.event_location = data.eventLocation;
  if (data.packageType !== undefined) row.package_type = data.packageType;
  if (data.totalAmount !== undefined) row.total_amount = data.totalAmount;
  if (data.advancePaid !== undefined) row.advance_paid = data.advancePaid;
  if (data.remainingBalance !== undefined) row.remaining_balance = data.remainingBalance;
  if (data.paymentStatus !== undefined) row.payment_status = data.paymentStatus;
  if (data.notes !== undefined) row.notes = data.notes;
  if (data.tags !== undefined) row.tags = data.tags;
  if (data.progress !== undefined) row.progress = data.progress;
  if (data.referredBy !== undefined) row.referred_by = data.referredBy;
  if (data.avatarUrl !== undefined) row.avatar_url = data.avatarUrl;
  return row;
}

router.get("/", async (req, res) => {
  try {
    const { search, status, tag } = req.query as Record<string, string>;
    let query = supabase.from(TABLE).select("*").order("created_at");

    if (status) query = query.eq("status", status);

    const { data, error } = await query;
    if (error) throw error;

    let clients = (data ?? []).map(mapRow);

    if (search) {
      const s = search.toLowerCase();
      clients = clients.filter(
        (c) =>
          String(c.name).toLowerCase().includes(s) ||
          String(c.email).toLowerCase().includes(s) ||
          (c.phone && String(c.phone).includes(s))
      );
    }
    if (tag) {
      clients = clients.filter((c) => Array.isArray(c.tags) && c.tags.includes(tag));
    }

    res.json(clients);
  } catch (err) {
    req.log.error({ err }, "Failed to list clients");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const parsed = CreateClientBody.parse(req.body);
    const row = toDb(parsed as unknown as Record<string, unknown>);
    row.updated_at = new Date().toISOString();

    const { data, error } = await supabase.from(TABLE).insert(row).select().single();
    if (error) throw error;

    res.status(201).json(mapRow(data));
  } catch (err) {
    req.log.error({ err }, "Failed to create client");
    res.status(400).json({ error: "Invalid data" });
  }
});

router.get("/:id", async (req, res): Promise<void> => {
  try {
    const { data, error } = await supabase.from(TABLE).select("*").eq("id", req.params.id).single();
    if (error || !data) {
      res.status(404).json({ error: "Client not found" });
      return;
    }
    res.json(mapRow(data));
  } catch (err) {
    req.log.error({ err }, "Failed to get client");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", async (req, res): Promise<void> => {
  try {
    const parsed = UpdateClientBody.parse(req.body);
    const row = toDb(parsed as unknown as Record<string, unknown>);
    row.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from(TABLE)
      .update(row)
      .eq("id", req.params.id)
      .select()
      .single();

    if (error || !data) {
      res.status(404).json({ error: "Client not found" });
      return;
    }
    res.json(mapRow(data));
  } catch (err) {
    req.log.error({ err }, "Failed to update client");
    res.status(400).json({ error: "Invalid data" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { error } = await supabase.from(TABLE).delete().eq("id", req.params.id);
    if (error) throw error;
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete client");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
