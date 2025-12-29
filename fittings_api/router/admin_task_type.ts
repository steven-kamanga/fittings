import express, { Request, Response, Router } from "express";
import { getPrismaInstance } from "../prisma/prisma";
import { AdminTaskType } from "@prisma/client";

const adminTaskTypeRouter: Router = express.Router();

adminTaskTypeRouter.get(
  "/task-types",
  async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const adminTaskTypes = Object.values(AdminTaskType);
      return res.status(200).json(adminTaskTypes);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

adminTaskTypeRouter.get(
  "/task-type/:type",
  async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const taskType = req.params.type.toUpperCase();

      if (!Object.values(AdminTaskType).includes(taskType as AdminTaskType)) {
        return res.status(404).json({ message: "Admin task type not found" });
      }

      return res.status(200).json({ type: taskType });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

adminTaskTypeRouter.post(
  "/task",
  async (req: Request, res: Response): Promise<Response | void> => {
    const {
      fittingRequestId,
      task,
    }: { fittingRequestId: string; task: AdminTaskType } = req.body;

    if (!fittingRequestId || !task) {
      return res
        .status(400)
        .json({ message: "Fitting request ID and task type are required" });
    }

    if (!Object.values(AdminTaskType).includes(task)) {
      return res.status(400).json({ message: "Invalid task type" });
    }

    try {
      const prisma = getPrismaInstance();
      const adminTask = await prisma.adminTask.create({
        data: {
          fittingRequestId,
          task,
        },
      });
      return res.status(201).json(adminTask);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

export default adminTaskTypeRouter;
