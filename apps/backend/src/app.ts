import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import staticPlugin from "@fastify/static";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "./config/index.js";
import { pdfRoutes } from "./modules/pdf/routes.js";
import { salarySlipRoutes } from "./modules/salary-slip/routes.js";
import { startCleanupJob } from "./jobs/cleanup.job.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function buildApp() {
  const fastify = Fastify({
    bodyLimit: 50 * 1024 * 1024, // 50MB limit
    logger: {
      level: "info",
      transport: {
        target: "pino-pretty",
        options: {
          translateTime: "HH:MM:ss Z",
          ignore: "pid,hostname",
        },
      },
    },
  });

  // Register plugins
  await fastify.register(cors, {
    origin: config.cors.origin,
    credentials: config.cors.credentials,
  });

  await fastify.register(multipart, {
    limits: {
      fileSize: config.upload.maxFileSize,
    },
  });

  // Serve static files from output directory
  await fastify.register(staticPlugin, {
    root: path.join(__dirname, "..", "output"),
    prefix: "/files/",
  });

  // Register routes
  await fastify.register(pdfRoutes, { prefix: "/api/pdf" });
  await fastify.register(salarySlipRoutes, { prefix: "/api/salary-slip" });

  // Health check
  fastify.get("/health", async () => {
    return { status: "ok", timestamp: new Date().toISOString() };
  });

  return fastify;
}

async function start() {
  try {
    const app = await buildApp();

    await app.listen({
      port: config.port,
      host: config.host,
    });

    // Start background jobs
    startCleanupJob();

    console.log(`🚀 Server running at http://localhost:${config.port}`);

    // Graceful shutdown
    const signals = ["SIGINT", "SIGTERM"];
    for (const signal of signals) {
      process.on(signal, async () => {
        console.log(`\n${signal} received, shutting down...`);
        await app.close();
        process.exit(0);
      });
    }
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();
