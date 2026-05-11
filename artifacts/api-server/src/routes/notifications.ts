import { Router } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

const TABLE = "xito_notifications";

function mapRow(n: Record<string, unknown>, clientName?: string | null) {
  return {
    id: n.id,
    type: n.type,
    title: n.title,
    message: n.message,
    isRead: n.is_read,
    clientId: n.client_id,
    projectId: n.project_id,
    dueDate: n.due_date,
    clientName: clientName ?? null,
    createdAt: n.created_at,
  };
}

router.get("/", async (req, res) => {
  try {
    const { unreadOnly } = req.query as Record<string, string>;

    let query = supabase.from(TABLE).select("*").order("created_at", { ascending: false });
    if (unreadOnly === "true") query = query.eq("is_read", false);

    const [{ data: notifications, error }, { data: clients }] = await Promise.all([
      query,
      supabase.from("xito_clients").select("id, name"),
    ]);

    if (error) throw error;

    const clientMap = new Map(
      (clients ?? []).map((c: Record<string, unknown>) => [String(c.id), c.name])
    );

    const result = (notifications ?? []).map((n: Record<string, unknown>) =>
      mapRow(n, n.client_id ? (clientMap.get(String(n.client_id)) as string | null) : null)
    );

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to list notifications");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id/read", async (req, res): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .update({ is_read: true })
      .eq("id", req.params.id)
      .select()
      .single();

    if (error || !data) {
      res.status(404).json({ error: "Notification not found" });
      return;
    }
    res.json(mapRow(data));
  } catch (err) {
    req.log.error({ err }, "Failed to mark notification as read");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/read-all", async (req, res) => {
  try {
    const { error } = await supabase.from(TABLE).update({ is_read: true }).eq("is_read", false);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to mark all notifications as read");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
