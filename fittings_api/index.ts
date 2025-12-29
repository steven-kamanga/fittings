import express, { Request, Response, NextFunction, Router } from "express";
import session from "express-session";
import jwt, { JwtPayload } from "jsonwebtoken";
import { getPrismaInstance } from "./prisma/prisma";
import { authenticated as authRoutes } from "./router/auth_users";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import swingAnalysisRouter from "./router/swing_analysis";
import fittingRequestRouter from "./router/fitting_request";
import adminTaskTypeRouter from "./router/admin_task_type";
import generalRouter from "./router/general";
import cors from "cors";
import logger from "./logger";

interface AuthenticatedRequest extends Request {
  user?: string | JwtPayload;
  headers: Request["headers"];
}

const app = express();
const routers: Router = express.Router();

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(express.json());

app.use(
  "/customer",
  session({
    secret: process.env.SECRET || "",
    resave: true,
    saveUninitialized: true,
  })
);

const PORT: string | number = process.env.PORT || 3030;
const SECRET: string = process.env.SECRET || "";

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Fittings API",
      version: "1.0.0",
      description: "API for managing fittings",
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
      },
    ],
  },
  apis: ["./router/*.js"],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

const authenticateJWT = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1];

    jwt.verify(
      token,
      SECRET,
      (err: jwt.VerifyErrors | null, user: string | JwtPayload | undefined) => {
        if (err) {
          return res.sendStatus(403);
        }

        req.user = user;
        next();
      }
    );
  } else {
    res.sendStatus(401);
  }
};

routers.use("/auth", authRoutes);
routers.use("", authenticateJWT, swingAnalysisRouter);
routers.use("", authenticateJWT, fittingRequestRouter);
routers.use("", authenticateJWT, adminTaskTypeRouter);
routers.use("", authenticateJWT, generalRouter);

app.use("/api/v1", routers);

process.on("SIGINT", async (): Promise<void> => {
  const prisma = getPrismaInstance();
  await prisma.$disconnect();
  process.exit();
});

app.listen(PORT, (): void => {
  logger.info(`Server running on http://127.0.0.1:${PORT}`);
});

// Add global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction): void => {
  logger.error("Global error handler");
  logger.error(err.stack);
  res.status(500).send("Something broke!");
});
