import { Router } from "express";
import { supabase } from "../lib/supabase";
import { CreateTagBody } from "@workspace/api-zod";

const router = Router();

const TABLE = "xito_tags";

function mapRow(t: Record<string, unknown>) {
  return {
    id: t.id,
    name: t.name,
    color: t.color,
    createdAt: t.created_at,
  };
}

router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase.from(TABLE).select("*").order("name");
    if (error) throw error;
    res.json((data ?? []).map(mapRow));
  } catch (err) {
    req.log.error({ err }, "Failed to list tags");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const parsed = CreateTagBody.parse(req.body);
    const { data, error } = await supabase.from(TABLE).insert(parsed).select().single();
    if (error) throw error;
    res.status(201).json(mapRow(data));
  } catch (err) {
    req.log.error({ err }, "Failed to create tag");
    res.status(400).json({ error: "Invalid data" });
  }
});

export default router;
