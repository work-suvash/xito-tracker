import { Router } from "express";
import { db } from "../lib/db";
import { clientsTable, projectsTable, filesTable } from "@workspace/db/schema";

const router = Router();

router.get("/dashboard", async (req, res) => {
  try {
    const [clients, projects, files] = await Promise.all([
      db.select().from(clientsTable),
      db.select().from(projectsTable),
      db.select({ size: filesTable.size }).from(filesTable),
    ]);

    const totalClients = clients.length;
    const activeProjects = projects.filter((x) => x.status !== "Completed").length;
    const pendingDeliveries = projects.filter((x) => x.status === "Preview Sent" || x.status === "Final Delivery").length;
    const completedWeddings = projects.filter((x) => x.status === "Completed").length;

    const totalRevenue = clients.reduce((sum, x) => sum + (x.totalAmount ?? 0), 0);
    const collectedRevenue = clients.reduce((sum, x) => sum + (x.advancePaid ?? 0), 0);
    const pendingRevenue = clients.reduce((sum, x) => sum + (x.remainingBalance ?? 0), 0);

    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const thisMonthBookings = clients.filter((x) => {
      const d = new Date(x.createdAt);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    }).length;

    const storageUsed = files.reduce((sum, x) => sum + (x.size ?? 0), 0);
    const totalFiles = files.length;

    res.json({ totalClients, activeProjects, pendingDeliveries, completedWeddings, totalRevenue, collectedRevenue, pendingRevenue, thisMonthBookings, storageUsed, totalFiles });
  } catch (err) {
    req.log.error({ err }, "Failed to get dashboard stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/monthly", async (req, res) => {
  try {
    const year = parseInt((req.query.year as string) ?? String(new Date().getFullYear()), 10);

    const [clients, projects] = await Promise.all([
      db.select({ createdAt: clientsTable.createdAt, totalAmount: clientsTable.totalAmount }).from(clientsTable),
      db.select({ createdAt: projectsTable.createdAt, status: projectsTable.status }).from(projectsTable),
    ]);

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const result = months.map((monthName, idx) => {
      const monthClients = clients.filter((x) => {
        const d = new Date(x.createdAt);
        return d.getMonth() === idx && d.getFullYear() === year;
      });
      const monthProjects = projects.filter((x) => {
        const d = new Date(x.createdAt);
        return d.getMonth() === idx && d.getFullYear() === year && x.status === "Completed";
      });
      return {
        month: idx + 1,
        year,
        monthName,
        bookings: monthClients.length,
        revenue: monthClients.reduce((sum, x) => sum + (x.totalAmount ?? 0), 0),
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
    const [clients, projects] = await Promise.all([
      db.select().from(clientsTable),
      db.select().from(projectsTable),
    ]);
    const clientMap = new Map(clients.map((x) => [x.id, x.name]));
    const now = new Date();

    const events: Array<{ id: number; type: string; title: string; date: string; clientName: string | null; projectName: string | null; daysUntil: number; urgency: string; }> = [];

    clients.forEach((x) => {
      if (x.weddingDate) {
        const date = new Date(x.weddingDate);
        const daysUntil = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntil >= 0 && daysUntil <= 90) {
          events.push({ id: x.id, type: "wedding", title: `${x.name}'s Wedding`, date: x.weddingDate, clientName: x.name, projectName: null, daysUntil,
            urgency: daysUntil <= 3 ? "critical" : daysUntil <= 7 ? "high" : daysUntil <= 30 ? "medium" : "low" });
        }
      }
    });

    projects.forEach((x) => {
      if (x.deadline && x.status !== "Completed") {
        const date = new Date(x.deadline);
        const daysUntil = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntil >= 0 && daysUntil <= 60) {
          events.push({ id: x.id + 10000, type: "deadline", title: `${x.name} Deadline`, date: x.deadline, clientName: clientMap.get(x.clientId) ?? null, projectName: x.name, daysUntil,
            urgency: daysUntil <= 2 ? "critical" : daysUntil <= 7 ? "high" : daysUntil <= 14 ? "medium" : "low" });
        }
      }
    });

    clients.forEach((x) => {
      if ((x.remainingBalance ?? 0) > 0 && x.weddingDate) {
        const date = new Date(x.weddingDate);
        const daysUntil = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntil >= 0 && daysUntil <= 30) {
          events.push({ id: x.id + 20000, type: "payment", title: `Payment Due — ${x.name}`, date: x.weddingDate, clientName: x.name, projectName: null, daysUntil,
            urgency: daysUntil <= 7 ? "critical" : daysUntil <= 14 ? "high" : "medium" });
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
    const projects = await db.select({ status: projectsTable.status }).from(projectsTable);
    const total = projects.length || 1;
    const statuses = ["Booked", "Editing", "Preview Sent", "Final Delivery", "Completed"];
    const result = statuses.map((status) => {
      const count = projects.filter((x) => x.status === status).length;
      return { status, count, percentage: Math.round((count / total) * 100) };
    });
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to get project status breakdown");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
