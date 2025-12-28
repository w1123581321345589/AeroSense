import type { Express } from "express";
import { createServer, type Server } from "node:http";
import githubRouter from "./routes/github";

export async function registerRoutes(app: Express): Promise<Server> {
  app.use("/api/github", githubRouter);

  const httpServer = createServer(app);

  return httpServer;
}
