const express = require("express");
const { getPrismaInstance } = require("../prisma/prisma");
const fittingRequestRouter = express.Router();

/**
 * @swagger
 * /customer/fitting-request:
 *   post:
 *     summary: Create a new fitting request
 *     tags: [FittingRequest]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - date
 *             properties:
 *               userId:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               comments:
 *                 type: string
 *     responses:
 *       201:
 *         description: Fitting request created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */
fittingRequestRouter.post("/fitting-request", async (req, res) => {
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
});

/**
 * @swagger
 * /customer/fitting-request/{id}:
 *   get:
 *     summary: Get a specific fitting request by ID
 *     tags: [FittingRequest]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The fitting request ID
 *     responses:
 *       200:
 *         description: Fitting request details retrieved successfully
 *       404:
 *         description: Fitting request not found
 *       500:
 *         description: Internal server error
 */
fittingRequestRouter.get("/fitting-request/:id", async (req, res) => {
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
});

/**
 * @swagger
 * /customer/fitting-requests:
 *   get:
 *     summary: Get all fitting requests
 *     tags: [FittingRequest]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status (e.g., submitted, prepping, scheduled, canceled, completed)
 *     responses:
 *       200:
 *         description: List of fitting requests
 *       500:
 *         description: Internal server error
 */
fittingRequestRouter.get("/fitting-requests", async (req, res) => {
  try {
    const prisma = getPrismaInstance();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;

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
});

/**
 * @swagger
 * /customer/fitting-request/{id}:
 *   put:
 *     summary: Update a fitting request
 *     tags: [FittingRequest]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The fitting request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum: [submitted, prepping, scheduled, canceled, completed]
 *               comments:
 *                 type: string
 *     responses:
 *       200:
 *         description: Fitting request updated successfully
 *       404:
 *         description: Fitting request not found
 *       500:
 *         description: Internal server error
 */
fittingRequestRouter.put("/fitting-request/:id", async (req, res) => {
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
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Fitting request not found" });
    }
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * @swagger
 * /customer/fitting-request/{id}:
 *   delete:
 *     summary: Delete a fitting request
 *     tags: [FittingRequest]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The fitting request ID
 *     responses:
 *       200:
 *         description: Fitting request deleted successfully
 *       404:
 *         description: Fitting request not found
 *       500:
 *         description: Internal server error
 */
fittingRequestRouter.delete("/fitting-request/:id", async (req, res) => {
  try {
    const prisma = getPrismaInstance();
    await prisma.fittingRequest.delete({
      where: { id: req.params.id },
    });

    res.status(200).json({ message: "Fitting request deleted successfully" });
  } catch (error) {
    console.error(error);
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Fitting request not found" });
    }
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = fittingRequestRouter;
