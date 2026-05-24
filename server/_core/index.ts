import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { getKeyByCode } from "../db";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);

  // Public API for key validation
  app.post("/api/validate-key", express.json(), async (req, res) => {
    try {
      const { keyCode, siteUrl } = req.body;

      if (!keyCode || !siteUrl) {
        return res.status(400).json({
          valid: false,
          message: "keyCode e siteUrl são obrigatórios",
        });
      }

      // Get key from database
      const key = await getKeyByCode(keyCode);

      if (!key) {
        return res.json({
          valid: false,
          message: "Chave não encontrada",
        });
      }

      if (key.status === "banido") {
        return res.json({
          valid: false,
          message: "Chave banida",
        });
      }

      if (key.status === "pausado") {
        return res.json({
          valid: false,
          message: "Chave pausada",
        });
      }

      if (!key.isActivated) {
        return res.json({
          valid: false,
          message: "Chave não ativada",
        });
      }

      if (key.expiresAt && new Date() > key.expiresAt) {
        return res.json({
          valid: false,
          message: "Chave expirada",
        });
      }

      return res.json({
        valid: true,
        message: "Chave válida",
        expiresAt: key.expiresAt,
      });
    } catch (error) {
      console.error("Validation error:", error);
      return res.status(500).json({
        valid: false,
        message: "Erro ao validar key",
      });
    }
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
