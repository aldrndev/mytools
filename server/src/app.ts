import fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";

import statementsRoutes from "./modules/statements/http/routes/routes.js";

export async function buildApp() {
  const app = fastify({
    logger: {
      transport: {
        target: "pino-pretty",
      },
    },
  }).withTypeProvider<ZodTypeProvider>();

  // Plugins
  await app.register(cors);
  await app.register(helmet);
  await app.register(import("@fastify/multipart"));

  // Routes
  await app.register(statementsRoutes, { prefix: "/api/v1/statements" });

  // Zod validation setup
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // Health check
  app.get("/health", async () => {
    return { status: "ok" };
  });

  return app;
}
