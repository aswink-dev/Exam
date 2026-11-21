
import dns from "node:dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";

import authRoutes from "./routes/auth.js";
import employeeRoutes from "./routes/employees.js";
import { errorHandler, notFound } from "./middleware/errors.js";

const app = express();
const port = Number(process.env.PORT) || 5000;

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
);

app.use(express.json({ limit: "20kb" }));

app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use(notFound);
app.use(errorHandler);

async function start() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is required. Add it to the .env file.");
  }

  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error(
      "JWT_SECRET must be set to a secret of at least 32 characters."
    );
  }

  await mongoose.connect(process.env.MONGODB_URI);

  console.log("MongoDB Connected Successfully");

  app.listen(port, () => {
    console.log(`Greenboard API listening on http://localhost:${port}`);
  });
}

start().catch((error) => {
  console.error("Could not start the API:", error.message);
  process.exitCode = 1;
});
