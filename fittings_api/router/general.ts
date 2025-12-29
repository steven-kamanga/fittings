import { getPrismaInstance } from "../prisma/prisma";
import express, { Request, Response } from "express";

interface CreateGettingStartedBody {
  userId: string;
  message: string;
}

interface UpdateGettingStartedBody {
  message?: string;
  isActive?: boolean;
}

interface PaginationQuery {
  page?: string;
  limit?: string;
}

interface PrismaError extends Error {
  code?: string;
}

const generalRouter = express.Router();

generalRouter.post(
  "/getting-started",
  async (req: Request<{}, {}, CreateGettingStartedBody>, res: Response) => {
    const { userId, message } = req.body;

    if (!userId || !message) {
      return res
        .status(400)
        .json({ message: "User ID and message are required" });
    }

    try {
      const prisma = getPrismaInstance();

      const gettingStarted = await prisma.$transaction(async (tx) => {
        await tx.gettingStarted.updateMany({
          where: { isActive: true },
          data: { isActive: false },
        });

        return await tx.gettingStarted.create({
          data: {
            userId,
            message,
            isActive: true,
          },
        });
      });

      res.status(201).json(gettingStarted);
    } catch (error) {
      console.error("Error creating getting started message:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

generalRouter.get(
  "/getting-started/:id",
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      const prisma = getPrismaInstance();
      const gettingStarted = await prisma.gettingStarted.findUnique({
        where: { id: req.params.id },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });

      if (!gettingStarted) {
        return res
          .status(404)
          .json({ message: "Getting started message not found" });
      }

      res.status(200).json(gettingStarted);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

generalRouter.get(
  "/getting-started",
  async (req: Request<{}, {}, {}, PaginationQuery>, res: Response) => {
    try {
      const prisma = getPrismaInstance();
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const skip = (page - 1) * limit;

      const [gettingStartedMessages, totalCount] = await Promise.all([
        prisma.gettingStarted.findMany({
          skip,
          take: limit,
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            created_at: "desc",
          },
        }),
        prisma.gettingStarted.count(),
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      res.status(200).json({
        gettingStartedMessages,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalCount,
          itemsPerPage: limit,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

generalRouter.put(
  "/getting-started/:id",
  async (
    req: Request<{ id: string }, {}, UpdateGettingStartedBody>,
    res: Response
  ) => {
    const { message, isActive } = req.body;
    const id = req.params.id;

    try {
      const prisma = getPrismaInstance();

      if (isActive) {
        const updatedGettingStarted = await prisma.$transaction(async (tx) => {
          await tx.gettingStarted.updateMany({
            where: {
              AND: [{ id: { not: id } }, { isActive: true }],
            },
            data: { isActive: false },
          });

          return await tx.gettingStarted.update({
            where: { id },
            data: { message, isActive },
          });
        });

        return res.status(200).json(updatedGettingStarted);
      }

      const updatedGettingStarted = await prisma.gettingStarted.update({
        where: { id },
        data: { message, isActive },
      });

      res.status(200).json(updatedGettingStarted);
    } catch (error) {
      console.error("Error updating getting started message:", error);
      if ((error as PrismaError).code === "P2025") {
        return res
          .status(404)
          .json({ message: "Getting started message not found" });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

generalRouter.delete(
  "/getting-started/:id",
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      const prisma = getPrismaInstance();

      const message = await prisma.gettingStarted.findUnique({
        where: { id: req.params.id },
      });

      if (message?.isActive) {
        return res.status(400).json({
          message: "Cannot delete the active getting started message",
        });
      }

      await prisma.gettingStarted.delete({
        where: { id: req.params.id },
      });

      res
        .status(200)
        .json({ message: "Getting started message deleted successfully" });
    } catch (error) {
      console.error("Error deleting getting started message:", error);
      if ((error as PrismaError).code === "P2025") {
        return res
          .status(404)
          .json({ message: "Getting started message not found" });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

export default generalRouter;
