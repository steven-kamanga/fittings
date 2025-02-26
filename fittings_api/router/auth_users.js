const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { getPrismaInstance } = require("../prisma/prisma");
const regd_users = express.Router();

const SECRET = process.env.SECRET || "kasdkjsh9uohr4jbkasnasd0sopi()D(Sjdls;l";

const isValid = async (email) => {
  const prisma = getPrismaInstance();
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });
  return !existingUser;
};

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               golf_club_size:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */
regd_users.post("/register", async (req, res) => {
  const { name, email, password, phone, address, golf_club_size } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    if (!(await isValid(email))) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const prisma = getPrismaInstance();
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        name,
        email,
        password_hash: hashedPassword,
        phone,
        address,
        golf_club_size,
        role: "consumer", // Default role
      },
    });
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * @swagger
 * /auth:
 *   post:
 *     summary: Login a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Internal server error
 */
regd_users.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const prisma = getPrismaInstance();
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ email: user.email, role: user.role }, SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      message: "User successfully logged in",
      email: user.email,
      username: user.name,
      token: token,
      role: user.role,
      userId: user.id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * @swagger
 * /auth/users/{id}:
 *   get:
 *     summary: Get a specific user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
regd_users.get("/auth/users/:id", async (req, res) => {
  try {
    const prisma = getPrismaInstance();
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        golf_club_size: true,
        role: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * @swagger
 * /auth/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of all users retrieved successfully
 *       500:
 *         description: Internal server error
 */
regd_users.get("/auth/users", async (req, res) => {
  try {
    const prisma = getPrismaInstance();
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        golf_club_size: true,
        role: true,
        created_at: true,
        updated_at: true,
      },
    });

    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile retrieved successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
regd_users.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    jwt.verify(token, SECRET, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid token" });
      }

      const prisma = getPrismaInstance();
      const user = await prisma.user.findUnique({
        where: { email: decoded.email },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          address: true,
          golf_club_size: true,
          role: true,
          created_at: true,
          updated_at: true,
        },
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json(user);
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * @swagger
 * /auth/users/me:
 *   put:
 *     summary: Update current user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               golf_club_size:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
regd_users.put("/users/me", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    jwt.verify(token, SECRET, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid token" });
      }

      const prisma = getPrismaInstance();
      const updateData = { ...req.body };

      // Handle password update separately
      if (updateData.password) {
        updateData.password_hash = await bcrypt.hash(updateData.password, 10);
        delete updateData.password;
      }

      // Remove fields that shouldn't be updated
      delete updateData.email;
      delete updateData.role;

      const updatedUser = await prisma.user.update({
        where: { email: decoded.email },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          address: true,
          golf_club_size: true,
          role: true,
          created_at: true,
          updated_at: true,
        },
      });

      res.status(200).json(updatedUser);
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * @swagger
 * /auth/users/{id}:
 *   put:
 *     summary: Update a user's profile (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               golf_club_size:
 *                 type: string
 *               role:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
regd_users.put("/users/:id", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    jwt.verify(token, SECRET, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid token" });
      }

      // Check if user is admin
      if (decoded.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const prisma = getPrismaInstance();
      const updateData = { ...req.body };

      // Handle password update separately
      if (updateData.password) {
        updateData.password_hash = await bcrypt.hash(updateData.password, 10);
        delete updateData.password;
      }

      const updatedUser = await prisma.user.update({
        where: { id: req.params.id },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          address: true,
          golf_club_size: true,
          role: true,
          created_at: true,
          updated_at: true,
        },
      });

      res.status(200).json(updatedUser);
    });
  } catch (error) {
    console.error(error);
    if (error.code === "P2025") {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = {
  authenticated: regd_users,
  isValid,
};
