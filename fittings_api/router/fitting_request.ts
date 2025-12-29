import { getPrismaInstance } from "../prisma/prisma";
import express, { Request, Response } from "express";

type FittingStatus =
  | "submitted"
  | "prepping"
  | "scheduled"
  | "canceled"
  | "completed";

interface CreateFittingRequestBody {
  userId: string;
  date: string;
  comments?: string;
}

interface UpdateFittingRequestBody {
  date?: string;
  status?: FittingStatus;
  comments?: string;
}

interface RescheduleFittingRequestBody {
  appointmentTime: string;
}

interface PaginationQuery {
  page?: string;
  limit?: string;
  status?: string;
}

interface PrismaError extends Error {
  code?: string;
}

const fittingRequestRouter = express.Router();

fittingRequestRouter.post(
  "/fitting-request",
  async (req: Request<{}, {}, CreateFittingRequestBody>, res: Response) => {
    const { userId, date, comments } = req.body;

    if (!userId || !date) {
      return res.status(400).json({ message: "User ID and date are required" });
    }

    try {
      const prisma = getPrismaInstance();
      const fittingRequest = await prisma.fittingRequest.create({
        data: {
          userId,
          date: new Date(date),
          comments,
          status: "submitted",
          fittingProgresses: {
            create: {
              step: "submitted",
            },
          },
        },
        include: {
          fittingProgresses: true,
        },
      });
      res.status(201).json(fittingRequest);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

fittingRequestRouter.get(
  "/fitting-request/:id",
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      const prisma = getPrismaInstance();
      const fittingRequest = await prisma.fittingRequest.findUnique({
        where: { id: req.params.id },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              role: true,
              golf_club_size: true,
              created_at: true,
              updated_at: true,
            },
          },
          fittingProgresses: true,
        },
      });

      if (!fittingRequest) {
        return res.status(404).json({ message: "Fitting request not found" });
      }

      res.status(200).json(fittingRequest);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

fittingRequestRouter.get(
  "/fitting-requests",
  async (req: Request<{}, {}, {}, PaginationQuery>, res: Response) => {
    try {
      const prisma = getPrismaInstance();
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as FittingStatus | undefined;

      const skip = (page - 1) * limit;

      const where = status ? { status } : {};

      const [fittingRequests, totalCount] = await Promise.all([
        prisma.fittingRequest.findMany({
          where,
          skip,
          take: limit,
          include: {
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
                golf_club_size: true,
              },
            },
            fittingProgresses: true,
          },
          orderBy: {
            date: "desc",
          },
        }),
        prisma.fittingRequest.count({ where }),
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      res.status(200).json({
        fittingRequests,
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

fittingRequestRouter.patch(
  "/fitting-request/:id/:newStatus",
  async (req: Request<{ id: string; newStatus: string }>, res: Response) => {
    const { id, newStatus } = req.params;

    const validStatuses: FittingStatus[] = [
      "submitted",
      "prepping",
      "scheduled",
      "canceled",
      "completed",
    ];

    if (!validStatuses.includes(newStatus as FittingStatus)) {
      return res.status(400).json({
        message: "Invalid status. Must be one of: " + validStatuses.join(", "),
      });
    }

    try {
      const prisma = getPrismaInstance();
      const updatedFittingRequest = await prisma.fittingRequest.update({
        where: { id },
        data: {
          status: newStatus as FittingStatus,
          fittingProgresses: {
            create: {
              step: newStatus as FittingStatus,
              completed_at: new Date(),
            },
          },
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
          fittingProgresses: true,
        },
      });

      res.status(200).json(updatedFittingRequest);
    } catch (error) {
      console.error(error);
      if ((error as PrismaError).code === "P2025") {
        return res.status(404).json({ message: "Fitting request not found" });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

fittingRequestRouter.get(
  "/fitting-requests/:userId",
  async (
    req: Request<{ userId: string }, {}, {}, PaginationQuery>,
    res: Response
  ) => {
    try {
      const prisma = getPrismaInstance();
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as FittingStatus | undefined;
      const userId = req.params.userId;

      const skip = (page - 1) * limit;

      const where = {
        userId,
        ...(status && { status }),
      };

      const [fittingRequests, totalCount] = await Promise.all([
        prisma.fittingRequest.findMany({
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
            fittingProgresses: true,
          },
          orderBy: {
            date: "desc",
          },
        }),
        prisma.fittingRequest.count({ where }),
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      res.status(200).json({
        fittingRequests,
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

fittingRequestRouter.put(
  "/fitting-request/:id",
  async (
    req: Request<{ id: string }, {}, UpdateFittingRequestBody>,
    res: Response
  ) => {
    const { date, status, comments } = req.body;
    const id = req.params.id;

    try {
      const prisma = getPrismaInstance();
      const updatedFittingRequest = await prisma.fittingRequest.update({
        where: { id },
        data: {
          date: date ? new Date(date) : undefined,
          status,
          comments,
          fittingProgresses: status
            ? {
                create: {
                  step: status,
                  completed_at: new Date(),
                },
              }
            : undefined,
        },
        include: {
          fittingProgresses: true,
        },
      });
      res.status(200).json(updatedFittingRequest);
    } catch (error) {
      console.error(error);
      if ((error as PrismaError).code === "P2025") {
        return res.status(404).json({ message: "Fitting request not found" });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

fittingRequestRouter.delete(
  "/fitting-request/:id",
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      const prisma = getPrismaInstance();
      await prisma.fittingRequest.delete({
        where: { id: req.params.id },
      });

      res.status(200).json({ message: "Fitting request deleted successfully" });
    } catch (error) {
      console.error(error);
      if ((error as PrismaError).code === "P2025") {
        return res.status(404).json({ message: "Fitting request not found" });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

fittingRequestRouter.patch(
  "/fitting-request/:id/reschedule",
  async (
    req: Request<{ id: string }, {}, RescheduleFittingRequestBody>,
    res: Response
  ) => {
    const { id } = req.params;
    const { appointmentTime } = req.body;

    if (!appointmentTime) {
      return res.status(400).json({ message: "Appointment time is required" });
    }

    try {
      const prisma = getPrismaInstance();
      const newDate = new Date(appointmentTime);

      // Check for existing fittings on the same day
      const existingFitting = await prisma.fittingRequest.findFirst({
        where: {
          id: { not: id },
          date: {
            gte: new Date(newDate.setHours(0, 0, 0, 0)),
            lt: new Date(newDate.setHours(23, 59, 59, 999)),
          },
        },
      });

      if (existingFitting) {
        return res.status(400).json({
          message: "There is already a fitting scheduled for this day",
        });
      }

      const updatedFitting = await prisma.fittingRequest.update({
        where: { id },
        data: {
          date: appointmentTime,
          fittingProgresses: {
            create: {
              step: "scheduled",
              completed_at: new Date(),
            },
          },
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              phone: true,
            },
          },
          fittingProgresses: true,
        },
      });

      res.status(200).json(updatedFitting);
    } catch (error) {
      console.error(error);
      if ((error as PrismaError).code === "P2025") {
        return res.status(404).json({ message: "Fitting request not found" });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

export default fittingRequestRouter;
