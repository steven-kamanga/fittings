import express, { Request, Response, Router } from "express";
import jwt, { JwtPayload, VerifyErrors } from "jsonwebtoken";
import bcrypt from "bcrypt";
import { getPrismaInstance } from "../prisma/prisma";

const regd_users: Router = express.Router();

const SECRET: string =
  process.env.SECRET || "kasdkjsh9uohr4jbkasnasd0sopi()D(Sjdls;l";

interface DecodedToken extends JwtPayload {
  email: string;
  role: string;
}

const isValid = async (email: string): Promise<boolean> => {
  const prisma = getPrismaInstance();
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });
  return !existingUser;
};

regd_users.post(
  "/register",
  async (req: Request, res: Response): Promise<Response | void> => {
    const {
      name,
      email,
      password,
      phone,
      address,
      golf_club_size,
    }: {
      name?: string;
      email: string;
      password: string;
      phone?: string;
      address?: string;
      golf_club_size?: string;
    } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
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
          role: "consumer",
        },
      });
      res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

regd_users.post(
  "/login",
  async (req: Request, res: Response): Promise<Response | void> => {
    const { email, password }: { email: string; password: string } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
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
  }
);

regd_users.get(
  "/auth/users/:id",
  async (req: Request, res: Response): Promise<Response | void> => {
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
  }
);

regd_users.get(
  "/users",
  async (req: Request, res: Response): Promise<Response | void> => {
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
  }
);

regd_users.get(
  "/me",
  async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const authHeader = req.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];

      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }

      let decoded: DecodedToken;
      try {
        decoded = jwt.verify(token, SECRET) as DecodedToken;
      } catch (err) {
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

      return res.status(200).json(user);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

regd_users.put(
  "/users/me",
  async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const authHeader = req.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];

      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }

      let decoded: DecodedToken;
      try {
        decoded = jwt.verify(token, SECRET) as DecodedToken;
      } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
      }

      const prisma = getPrismaInstance();
      const updateData: Record<string, string> = { ...req.body };

      if (updateData.password) {
        updateData.password_hash = await bcrypt.hash(updateData.password, 10);
        delete updateData.password;
      }

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

      return res.status(200).json(updatedUser);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

regd_users.put(
  "/users/:id",
  async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const authHeader = req.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];

      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }

      let decoded: DecodedToken;
      try {
        decoded = jwt.verify(token, SECRET) as DecodedToken;
      } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
      }

      if (decoded.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const prisma = getPrismaInstance();
      const updateData: Record<string, string> = { ...req.body };

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

      return res.status(200).json(updatedUser);
    } catch (error) {
      console.error(error);
      if ((error as { code?: string }).code === "P2025") {
        return res.status(404).json({ message: "User not found" });
      }
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

export { regd_users as authenticated, isValid };
