import { Router } from "express";
import { db } from "../lib/db";
import { tagsTable } from "@workspace/db/schema";
import { CreateTagBody } from "@workspace/api-zod";
import { asc } from "drizzle-orm";

const router = Router();

function mapRow(t: typeof tagsTable.$inferSelect) {
  return {
    id: t.id,
    name: t.name,
    color: t.color,
    createdAt: t.createdAt?.toISOString(),
  };
}

router.get("/", async (req, res) => {
  try {
    const tags = await db.select().from(tagsTable).orderBy(asc(tagsTable.name));
    res.json(tags.map(mapRow));
  } catch (err) {
    req.log.error({ err }, "Failed to list tags");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const parsed = CreateTagBody.parse(req.body);
    const [inserted] = await db.insert(tagsTable).values({ name: parsed.name, color: parsed.color ?? null }).returning();
    res.status(201).json(mapRow(inserted));
  } catch (err) {
    req.log.error({ err }, "Failed to create tag");
    res.status(400).json({ error: "Invalid data" });
  }
});

export default router;
