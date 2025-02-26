const express = require("express");
const { getPrismaInstance } = require("../prisma/prisma");
const logger = require("../logger");
const generalRouter = express.Router();

/**
 * @swagger
 * /api/v1/getting-started:
 *   post:
 *     summary: Create a new getting started message
 *     tags: [GettingStarted]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - message
 *             properties:
 *               userId:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Getting started message created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */
generalRouter.post("/getting-started", async (req, res) => {
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
    logger.error("Error creating getting started message:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * @swagger
 * /api/v1/getting-started/{id}:
 *   get:
 *     summary: Get a specific getting started message by ID
 *     tags: [GettingStarted]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The getting started message ID
 *     responses:
 *       200:
 *         description: Getting started message retrieved successfully
 *       404:
 *         description: Getting started message not found
 *       500:
 *         description: Internal server error
 */
generalRouter.get("/getting-started/:id", async (req, res) => {
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
});

/**
 * @swagger
 * /api/v1/getting-started:
 *   get:
 *     summary: Get all getting started messages
 *     tags: [GettingStarted]
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
 *     responses:
 *       200:
 *         description: List of getting started messages
 *       500:
 *         description: Internal server error
 */
generalRouter.get("/getting-started", async (req, res) => {
  try {
    const prisma = getPrismaInstance();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

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
});

/**
 * @swagger
 * /api/v1/getting-started/{id}:
 *   put:
 *     summary: Update a getting started message
 *     tags: [GettingStarted]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The getting started message ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Getting started message updated successfully
 *       404:
 *         description: Getting started message not found
 *       500:
 *         description: Internal server error
 */
generalRouter.put("/getting-started/:id", async (req, res) => {
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
    logger.error("Error updating getting started message:", error);
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ message: "Getting started message not found" });
    }
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * @swagger
 * /api/v1/getting-started/{id}:
 *   delete:
 *     summary: Delete a getting started message
 *     tags: [GettingStarted]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The getting started message ID
 *     responses:
 *       200:
 *         description: Getting started message deleted successfully
 *       404:
 *         description: Getting started message not found
 *       500:
 *         description: Internal server error
 */
generalRouter.delete("/getting-started/:id", async (req, res) => {
  try {
    const prisma = getPrismaInstance();

    const message = await prisma.gettingStarted.findUnique({
      where: { id: req.params.id },
    });

    if (message?.isActive) {
      return res
        .status(400)
        .json({ message: "Cannot delete the active getting started message" });
    }

    await prisma.gettingStarted.delete({
      where: { id: req.params.id },
    });

    res
      .status(200)
      .json({ message: "Getting started message deleted successfully" });
  } catch (error) {
    logger.error("Error deleting getting started message:", error);
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ message: "Getting started message not found" });
    }
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = generalRouter;
