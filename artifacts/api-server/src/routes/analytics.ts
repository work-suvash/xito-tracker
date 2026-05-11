import { Router } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

router.get("/dashboard", async (req, res) => {
  try {
    const [{ data: clients }, { data: projects }, { data: files }] = await Promise.all([
      supabase.from("xito_clients").select("*"),
      supabase.from("xito_projects").select("*"),
      supabase.from("xito_files").select("size"),
    ]);

    const c = clients ?? [];
    const p = projects ?? [];
    const f = files ?? [];

    const totalClients = c.length;
    const activeProjects = p.filter((x: Record<string, unknown>) => x.status !== "Completed").length;
    const pendingDeliveries = p.filter(
      (x: Record<string, unknown>) => x.status === "Preview Sent" || x.status === "Final Delivery"
    ).length;
    const completedWeddings = p.filter((x: Record<string, unknown>) => x.status === "Completed").length;

    const totalRevenue = c.reduce((sum: number, x: Record<string, unknown>) => sum + ((x.total_amount as number) ?? 0), 0);
    const collectedRevenue = c.reduce((sum: number, x: Record<string, unknown>) => sum + ((x.advance_paid as number) ?? 0), 0);
    const pendingRevenue = c.reduce((sum: number, x: Record<string, unknown>) => sum + ((x.remaining_balance as number) ?? 0), 0);

    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const thisMonthBookings = c.filter((x: Record<string, unknown>) => {
      const d = new Date(x.created_at as string);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    }).length;

    const storageUsed = f.reduce((sum: number, x: Record<string, unknown>) => sum + ((x.size as number) ?? 0), 0);
    const totalFiles = f.length;

    res.json({
      totalClients,
      activeProjects,
      pendingDeliveries,
      completedWeddings,
      totalRevenue,
      collectedRevenue,
      pendingRevenue,
      thisMonthBookings,
      storageUsed,
      totalFiles,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get dashboard stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/monthly", async (req, res) => {
  try {
    const year = parseInt((req.query.year as string) ?? String(new Date().getFullYear()), 10);

    const [{ data: clients }, { data: projects }] = await Promise.all([
      supabase.from("xito_clients").select("created_at, total_amount"),
      supabase.from("xito_projects").select("created_at, status"),
    ]);

    const c = clients ?? [];
    const p = projects ?? [];

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const result = months.map((monthName, idx) => {
      const monthClients = c.filter((x: Record<string, unknown>) => {
        const d = new Date(x.created_at as string);
        return d.getMonth() === idx && d.getFullYear() === year;
      });
      const monthProjects = p.filter((x: Record<string, unknown>) => {
        const d = new Date(x.created_at as string);
        return d.getMonth() === idx && d.getFullYear() === year && x.status === "Completed";
      });
      return {
        month: idx + 1,
        year,
        monthName,
        bookings: monthClients.length,
        revenue: monthClients.reduce((sum: number, x: Record<string, unknown>) => sum + ((x.total_amount as number) ?? 0), 0),
        projectsCompleted: monthProjects.length,
      };
    });

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to get monthly analytics");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/upcoming", async (req, res) => {
  try {
    const [{ data: clients }, { data: projects }] = await Promise.all([
      supabase.from("xito_clients").select("*"),
      supabase.from("xito_projects").select("*"),
    ]);

    const c = clients ?? [];
    const p = projects ?? [];
    const clientMap = new Map(c.map((x: Record<string, unknown>) => [String(x.id), x.name as string]));
    const now = new Date();

    const events: Array<{
      id: number;
      type: string;
      title: string;
      date: string;
      clientName: string | null;
      projectName: string | null;
      daysUntil: number;
      urgency: string;
    }> = [];

    c.forEach((x: Record<string, unknown>) => {
      if (x.wedding_date) {
        const date = new Date(x.wedding_date as string);
        const daysUntil = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntil >= 0 && daysUntil <= 90) {
          events.push({
            id: x.id as number,
            type: "wedding",
            title: `${x.name}'s Wedding`,
            date: x.wedding_date as string,
            clientName: x.name as string,
            projectName: null,
            daysUntil,
            urgency: daysUntil <= 3 ? "critical" : daysUntil <= 7 ? "high" : daysUntil <= 30 ? "medium" : "low",
          });
        }
      }
    });

    p.forEach((x: Record<string, unknown>) => {
      if (x.deadline && x.status !== "Completed") {
        const date = new Date(x.deadline as string);
        const daysUntil = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntil >= 0 && daysUntil <= 60) {
          events.push({
            id: (x.id as number) + 10000,
            type: "deadline",
            title: `${x.name} Deadline`,
            date: x.deadline as string,
            clientName: clientMap.get(String(x.client_id)) ?? null,
            projectName: x.name as string,
            daysUntil,
            urgency: daysUntil <= 2 ? "critical" : daysUntil <= 7 ? "high" : daysUntil <= 14 ? "medium" : "low",
          });
        }
      }
    });

    c.forEach((x: Record<string, unknown>) => {
      if ((x.remaining_balance as number ?? 0) > 0 && x.wedding_date) {
        const date = new Date(x.wedding_date as string);
        const daysUntil = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntil >= 0 && daysUntil <= 30) {
          events.push({
            id: (x.id as number) + 20000,
            type: "payment",
            title: `Payment Due — ${x.name}`,
            date: x.wedding_date as string,
            clientName: x.name as string,
            projectName: null,
            daysUntil,
            urgency: daysUntil <= 7 ? "critical" : daysUntil <= 14 ? "high" : "medium",
          });
        }
      }
    });

    events.sort((a, b) => a.daysUntil - b.daysUntil);
    res.json(events.slice(0, 20));
  } catch (err) {
    req.log.error({ err }, "Failed to get upcoming events");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/project-status", async (req, res) => {
  try {
    const { data: projects } = await supabase.from("xito_projects").select("status");
    const p = projects ?? [];
    const total = p.length || 1;
    const statuses = ["Booked", "Editing", "Preview Sent", "Final Delivery", "Completed"];
    const result = statuses.map((status) => {
      const count = p.filter((x: Record<string, unknown>) => x.status === status).length;
      return { status, count, percentage: Math.round((count / total) * 100) };
    });
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to get project status breakdown");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
