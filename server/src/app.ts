import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { config } from "./config.js";
import { authRouter } from "./routes/auth.routes.js";
import { scanRouter } from "./routes/scan.routes.js";
import { healthRouter } from "./routes/health.routes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

export const createApp = () => {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  app.use(helmet({ crossOriginResourcePolicy: { policy: "same-site" } }));
  app.use(
    cors({
      origin: config.clientOrigin,
      credentials: true,
    }),
  );
  app.use(cookieParser());
  app.use(express.json({ limit: "1mb" }));

  // Global API rate limit; the auth endpoints carry their own stricter one.
  app.use(
    "/api",
    rateLimit({
      windowMs: 60 * 1000,
      limit: 240,
      standardHeaders: "draft-7",
      legacyHeaders: false,
    }),
  );

  app.use("/api/auth", authRouter);
  app.use("/api", scanRouter);
  app.use("/api", healthRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
};
