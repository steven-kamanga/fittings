const express = require("express");
const { getPrismaInstance } = require("../prisma/prisma");
const swingAnalysisRouter = express.Router();

/**
 * @swagger
 * /api/v1/swing-analysis:
 *   post:
 *     summary: Create a new swing analysis
 *     tags: [SwingAnalysis]
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
 *         description: Swing analysis created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */
swingAnalysisRouter.post("/swing-analysis", async (req, res) => {
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
});

/**
 * @swagger
 * /api/v1/swing-analysis:
 *   get:
 *     summary: Get all swing analyses
 *     tags: [SwingAnalysis]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [scheduled, completed, canceled]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of swing analyses retrieved successfully
 *       500:
 *         description: Internal server error
 */
swingAnalysisRouter.get("/swing-analysis", async (req, res) => {
  try {
    const prisma = getPrismaInstance();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;

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
});

/**
 * @swagger
 * /api/v1/swing-analysis/{id}:
 *   get:
 *     summary: Get a specific swing analysis by ID
 *     tags: [SwingAnalysis]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The swing analysis ID
 *     responses:
 *       200:
 *         description: Swing analysis details retrieved successfully
 *       404:
 *         description: Swing analysis not found
 *       500:
 *         description: Internal server error
 */
swingAnalysisRouter.get("/swing-analysis/:id", async (req, res) => {
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
});

/**
 * @swagger
 * /api/v1/swing-analysis/{id}:
 *   put:
 *     summary: Update a swing analysis
 *     tags: [SwingAnalysis]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The swing analysis ID
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
 *                 enum: [scheduled, completed, canceled]
 *               comments:
 *                 type: string
 *               video_url:
 *                 type: string
 *               analysis_data:
 *                 type: object
 *     responses:
 *       200:
 *         description: Swing analysis updated successfully
 *       404:
 *         description: Swing analysis not found
 *       500:
 *         description: Internal server error
 */
swingAnalysisRouter.put("/swing-analysis/:id", async (req, res) => {
  const { date, status, comments, video_url, analysis_data } = req.body;

  try {
    const prisma = getPrismaInstance();
    const updatedSwingAnalysis = await prisma.swingAnalysis.update({
      where: { id: req.params.id },
      data: {
        date: date ? new Date(date) : undefined,
        status,
        comments,
        video_url,
        analysis_data,
      },
    });

    res.status(200).json(updatedSwingAnalysis);
  } catch (error) {
    console.error(error);
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Swing analysis not found" });
    }
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * @swagger
 * /api/v1/swing-analysis/{userId}:
 *   get:
 *     summary: Get all swing analysis for a specific user
 *     tags: [SwingAnalysis]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *       - in: query
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
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of user's swing analysis
 *       404:
 *         description: User not found or has no swing analysis
 *       500:
 *         description: Internal server error
 */
swingAnalysisRouter.get("/swing-analysis/user/:userId", async (req, res) => {
  try {
    const prisma = getPrismaInstance();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
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
});

/**
 * @swagger
 * /api/v1/swing-analysis/{id}/status/{newStatus}:
 *   patch:
 *     summary: Update the status of a swing analysis
 *     tags: [SwingAnalysis]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The swing analysis ID
 *       - in: path
 *         name: newStatus
 *         required: true
 *         schema:
 *           type: string
 *           enum: [submitted, scheduled, completed, canceled]
 *         description: The new status to set
 */
swingAnalysisRouter.patch(
  "/swing-analysis/:id/:newStatus",
  async (req, res) => {
    const { id, newStatus } = req.params;
    const validStatuses = ["submitted", "scheduled", "completed", "canceled"];

    if (!validStatuses.includes(newStatus)) {
      return res.status(400).json({
        message: "Invalid status. Must be one of: " + validStatuses.join(", "),
      });
    }
    try {
      const prisma = getPrismaInstance();
      const updateSwingAnalysisStatus = await prisma.swingAnalysis.update({
        where: { id },
        data: {
          status: newStatus,
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
      if (error.code === "P2025") {
        return res.status(404).json({ message: "Fitting request not found" });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
);

/**
 * @swagger
 * /api/v1/swing-analysis/{id}:
 *   delete:
 *     summary: Delete a swing analysis
 *     tags: [SwingAnalysis]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The swing analysis ID
 *     responses:
 *       200:
 *         description: Swing analysis deleted successfully
 *       404:
 *         description: Swing analysis not found
 *       500:
 *         description: Internal server error
 */
swingAnalysisRouter.delete("/swing-analysis/:id", async (req, res) => {
  try {
    const prisma = getPrismaInstance();
    await prisma.swingAnalysis.delete({
      where: { id: req.params.id },
    });

    res.status(200).json({ message: "Swing analysis deleted successfully" });
  } catch (error) {
    console.error(error);
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Swing analysis not found" });
    }
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = swingAnalysisRouter;
