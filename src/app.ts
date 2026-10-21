import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { Prisma } from "@prisma/client";
import companyRoutes from "./routes/company.routes";
import serviceRoutes from "./routes/service.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/companies", companyRoutes);
app.use("/services", serviceRoutes);

// 404 for unknown routes
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Central error handler
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
    res.status(409).json({ error: "A company with this registrationNumber already exists" });
    return;
  }
  if (err instanceof SyntaxError) {
    res.status(400).json({ error: "Invalid JSON body" });
    return;
  }
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

export default app;
