import { getPrismaInstance } from "../prisma/prisma";
import express, { Request, Response } from "express";

type SwingAnalysisStatus = "submitted" | "scheduled" | "completed" | "canceled";

interface CreateSwingAnalysisBody {
  userId: string;
  date: string;
  comments?: string;
}

interface UpdateSwingAnalysisBody {
  date?: string;
  status?: SwingAnalysisStatus;
  comments?: string;
  video_url?: string;
  analysis_data?: Record<string, unknown>;
}

interface PaginationQuery {
  page?: string;
  limit?: string;
  status?: string;
}

interface PrismaError extends Error {
  code?: string;
}

const swingAnalysisRouter = express.Router();

swingAnalysisRouter.post(
  "/swing-analysis",
  async (req: Request<{}, {}, CreateSwingAnalysisBody>, res: Response) => {
    const { userId, date, comments } = req.body;

    if (!userId || !date) {
      return res.status(400).json({ message: "User ID and date are required" });
    }

    try {
      const prisma = getPrismaInstance();
      const swingAnalysis = await prisma.swingAnalysis.create({
        data: {
          userId,
          date: new Date(date),
          comments,
          status: "submitted",
        },
      });
      res.status(201).json(swingAnalysis);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

swingAnalysisRouter.get(
  "/swing-analysis",
  async (req: Request<{}, {}, {}, PaginationQuery>, res: Response) => {
    try {
      const prisma = getPrismaInstance();
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as SwingAnalysisStatus | undefined;

      const skip = (page - 1) * limit;
      const where = status ? { status } : {};

      const [swingAnalyses, totalCount] = await Promise.all([
        prisma.swingAnalysis.findMany({
          where,
          skip,
          take: limit,
          include: {
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
              },
            },
          },
          orderBy: { date: "desc" },
        }),
        prisma.swingAnalysis.count({ where }),
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      res.status(200).json({
        swingAnalyses,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalCount,
          itemsPerPage: limit,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }
);

swingAnalysisRouter.get(
  "/swing-analysis/:id",
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      const prisma = getPrismaInstance();
      const swingAnalysis = await prisma.swingAnalysis.findUnique({
        where: { id: req.params.id },
        include: { user: true },
      });

      if (!swingAnalysis) {
        return res.status(404).json({ message: "Swing analysis not found" });
      }

      res.status(200).json(swingAnalysis);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

swingAnalysisRouter.put(
  "/swing-analysis/:id",
  async (
    req: Request<{ id: string }, {}, UpdateSwingAnalysisBody>,
    res: Response
  ) => {
    const { date, status, comments, video_url, analysis_data } = req.body;

    try {
      const prisma = getPrismaInstance();
      const updateData: Record<string, unknown> = {};
      if (date) updateData.date = new Date(date);
      if (status) updateData.status = status;
      if (comments !== undefined) updateData.comments = comments;
      if (video_url !== undefined) updateData.video_url = video_url;
      if (analysis_data !== undefined) updateData.analysis_data = analysis_data;

      const updatedSwingAnalysis = await prisma.swingAnalysis.update({
        where: { id: req.params.id },
        data: updateData,
      });

      res.status(200).json(updatedSwingAnalysis);
    } catch (error) {
      console.error(error);
      if ((error as PrismaError).code === "P2025") {
        return res.status(404).json({ message: "Swing analysis not found" });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

swingAnalysisRouter.get(
  "/swing-analysis/user/:userId",
  async (
    req: Request<{ userId: string }, {}, {}, PaginationQuery>,
    res: Response
  ) => {
    try {
      const prisma = getPrismaInstance();
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as SwingAnalysisStatus | undefined;
      const userId = req.params.userId;

      const skip = (page - 1) * limit;
      const where = {
        userId,
        ...(status && { status }),
      };

      const [swingAnalyses, totalCount] = await Promise.all([
        prisma.swingAnalysis.findMany({
          where,
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
          orderBy: { date: "desc" },
        }),
        prisma.swingAnalysis.count({ where }),
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      res.status(200).json({
        swingAnalyses,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalCount,
          itemsPerPage: limit,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }
);

swingAnalysisRouter.patch(
  "/swing-analysis/:id/:newStatus",
  async (req: Request<{ id: string; newStatus: string }>, res: Response) => {
    const { id, newStatus } = req.params;
    const validStatuses: SwingAnalysisStatus[] = [
      "submitted",
      "scheduled",
      "completed",
      "canceled",
    ];

    if (!validStatuses.includes(newStatus as SwingAnalysisStatus)) {
      return res.status(400).json({
        message: "Invalid status. Must be one of: " + validStatuses.join(", "),
      });
    }
    try {
      const prisma = getPrismaInstance();
      const updateSwingAnalysisStatus = await prisma.swingAnalysis.update({
        where: { id },
        data: {
          status: newStatus as SwingAnalysisStatus,
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              phone: true,
              golf_club_size: true,
            },
          },
        },
      });
      res.status(200).json(updateSwingAnalysisStatus);
    } catch (error) {
      console.error(error);
      if ((error as PrismaError).code === "P2025") {
        return res.status(404).json({ message: "Swing analysis not found" });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

swingAnalysisRouter.delete(
  "/swing-analysis/:id",
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      const prisma = getPrismaInstance();
      await prisma.swingAnalysis.delete({
        where: { id: req.params.id },
      });

      res.status(200).json({ message: "Swing analysis deleted successfully" });
    } catch (error) {
      console.error(error);
      if ((error as PrismaError).code === "P2025") {
        return res.status(404).json({ message: "Swing analysis not found" });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

export default swingAnalysisRouter;
