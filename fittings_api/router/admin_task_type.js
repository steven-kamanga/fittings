const express = require("express");
const { getPrismaInstance } = require('../prisma/prisma');
const { AdminTaskType } = require('@prisma/client');
const adminTaskTypeRouter = express.Router();

/**
 * @swagger
 * /admin/task-types:
 *   get:
 *     summary: Get all admin task types
 *     tags: [AdminTaskType]
 *     responses:
 *       200:
 *         description: List of all admin task types
 *       500:
 *         description: Internal server error
 */
adminTaskTypeRouter.get("/task-types", async (req, res) => {
    try {
        const adminTaskTypes = Object.values(AdminTaskType);
        res.status(200).json(adminTaskTypes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

/**
 * @swagger
 * /admin/task-type/{type}:
 *   get:
 *     summary: Get details of a specific admin task type
 *     tags: [AdminTaskType]
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *         description: The admin task type
 *     responses:
 *       200:
 *         description: Admin task type details retrieved successfully
 *       404:
 *         description: Admin task type not found
 *       500:
 *         description: Internal server error
 */
adminTaskTypeRouter.get("/task-type/:type", async (req, res) => {
    try {
        const taskType = req.params.type.toUpperCase();

        if (!Object.values(AdminTaskType).includes(taskType)) {
            return res.status(404).json({ message: "Admin task type not found" });
        }

        res.status(200).json({ type: taskType });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

/**
 * @swagger
 * /admin/task:
 *   post:
 *     summary: Create a new admin task
 *     tags: [AdminTask]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fittingRequestId
 *               - task
 *             properties:
 *               fittingRequestId:
 *                 type: string
 *               task:
 *                 type: string
 *                 enum: [acknowledge_request, schedule_swing_analysis, swing_analysis_completed, fitting_scheduled, fitting_canceled, fitting_completed]
 *     responses:
 *       201:
 *         description: Admin task created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */
adminTaskTypeRouter.post("/task", async (req, res) => {
    const { fittingRequestId, task } = req.body;

    if (!fittingRequestId || !task) {
        return res.status(400).json({ message: "Fitting request ID and task type are required" });
    }

    if (!Object.values(AdminTaskType).includes(task)) {
        return res.status(400).json({ message: "Invalid task type" });
    }

    try {
        const prisma = getPrismaInstance();
        const adminTask = await prisma.adminTask.create({
            data: {
                fittingRequestId,
                task
            }
        });
        res.status(201).json(adminTask);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = adminTaskTypeRouter;