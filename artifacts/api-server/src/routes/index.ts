import { Router, type IRouter } from "express";
import healthRouter from "./health";
import clientsRouter from "./clients";
import projectsRouter from "./projects";
import filesRouter from "./files";
import notificationsRouter from "./notifications";
import analyticsRouter from "./analytics";
import tagsRouter from "./tags";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/clients", clientsRouter);
router.use("/projects", projectsRouter);
router.use("/files", filesRouter);
router.use("/notifications", notificationsRouter);
router.use("/analytics", analyticsRouter);
router.use("/tags", tagsRouter);

export default router;
