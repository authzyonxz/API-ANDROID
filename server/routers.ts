import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import {
  getUserByUsername,
  createUser,
  verifyPassword,
  createRevendedor,
  getRevendedorByUserId,
  getAllRevendedores,
  updateRevendedorCredit,
  createKey,
  getKeysByRevendedor,
  getKeyByCode,
  updateKeyStatus,
  activateKey,
  resetKeyDevice,
  generateKeyCode,
  getDb,
} from "./db";
import { eq } from "drizzle-orm";
import { keys } from "../drizzle/schema";

// Define credit costs for each plan
const CREDIT_COSTS = {
  1: 1,
  7: 5,
  30: 15,
};

// Helper to create session token
function createSessionToken(userId: number, username: string, role: string): string {
  return Buffer.from(JSON.stringify({ userId, username, role, timestamp: Date.now() })).toString("base64");
}

// Helper to verify session token
function verifySessionToken(token: string): { userId: number; username: string; role: string } | null {
  try {
    const decoded = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
    // Check if token is not too old (24 hours)
    if (Date.now() - decoded.timestamp > 24 * 60 * 60 * 1000) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

export const appRouter = router({
  // Auth procedures
  auth: router({
    login: publicProcedure
      .input(z.object({ username: z.string(), password: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const user = await getUserByUsername(input.username);
        if (!user) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Usuário ou senha inválidos" });
        }

        const isPasswordValid = await verifyPassword(input.password, user.passwordHash);
        if (!isPasswordValid) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Usuário ou senha inválidos" });
        }

        // Create secure session token
        const sessionToken = createSessionToken(user.id, user.username, user.role);
        
        ctx.res.cookie("session", sessionToken, {
          httpOnly: true,
          secure: true,
          sameSite: "strict",
          maxAge: 24 * 60 * 60 * 1000, // 24 hours
        });

        return {
          id: user.id,
          username: user.username,
          role: user.role,
        };
      }),

    me: publicProcedure.query(({ ctx }) => {
      if (!ctx.user) return null;
      return ctx.user;
    }),

    logout: publicProcedure.mutation(({ ctx }) => {
      ctx.res.clearCookie("session");
      return { success: true };
    }),
  }),

  // Revendedor procedures
  revendedor: router({
    create: protectedProcedure
      .input(
        z.object({
          username: z.string(),
          password: z.string(),
          creditBalance: z.number().default(0),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem criar revendedores" });
        }

        // Create user
        const result = await createUser(input.username, input.password, "revendedor");
        const userId = result[0].insertId;

        // Create revendedor profile
        await createRevendedor(userId, input.creditBalance);

        return { success: true, userId };
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem listar revendedores" });
      }

      const revendedores = await getAllRevendedores();
      return revendedores;
    }),

    addCredit: protectedProcedure
      .input(z.object({ revendedorId: z.number(), amount: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem adicionar créditos" });
        }

        await updateRevendedorCredit(input.revendedorId, input.amount);
        return { success: true };
      }),

    getBalance: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      if (ctx.user.role === "admin") {
        return { creditBalance: 0 };
      }

      const revendedor = await getRevendedorByUserId(ctx.user.id);
      if (!revendedor) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Revendedor não encontrado" });
      }

      return {
        creditBalance: parseFloat(revendedor.creditBalance.toString()),
      };
    }),
  }),

  // Key procedures
  key: router({
    create: protectedProcedure
      .input(z.object({ planDays: z.enum(["1", "7", "30"]), quantity: z.number().min(1).max(100) }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }

        const planDays = parseInt(input.planDays);
        const creditCost = CREDIT_COSTS[planDays as keyof typeof CREDIT_COSTS];

        if (!creditCost) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Plano inválido" });
        }

        const totalCost = creditCost * input.quantity;

        // Get revendedor info (only for revendedores)
        if (ctx.user.role !== "admin") {
          const revendedor = await getRevendedorByUserId(ctx.user.id);
          if (!revendedor) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Revendedor não encontrado" });
          }

          const currentBalance = parseFloat(revendedor.creditBalance.toString());
          if (currentBalance < totalCost) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "Créditos insuficientes" });
          }

          // Generate keys
          const generatedKeys = [];
          for (let i = 0; i < input.quantity; i++) {
            const result = await createKey(revendedor.id, planDays);
            generatedKeys.push(result.keyCode);
          }

          // Deduct credits
          await updateRevendedorCredit(revendedor.id, -totalCost);

          return {
            keys: generatedKeys,
            totalCost,
            remainingBalance: currentBalance - totalCost,
          };
        } else {
          // Admin can create keys without credit deduction
          const generatedKeys = [];
          for (let i = 0; i < input.quantity; i++) {
            const keyCode = await generateKeyCode();
            generatedKeys.push(keyCode);
          }

          return {
            keys: generatedKeys,
            totalCost: 0,
            remainingBalance: 0,
          };
        }
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      if (ctx.user.role === "admin") {
        // Admin sees all keys
        return db.select().from(keys);
      } else {
        // Revendedor sees only their keys
        const revendedor = await getRevendedorByUserId(ctx.user.id);
        if (!revendedor) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        return db.select().from(keys).where(eq(keys.revendedorId, revendedor.id));
      }
    }),

    updateStatus: protectedProcedure
      .input(z.object({ keyId: z.number(), status: z.enum(["ativo", "pausado", "banido"]) }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }

        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        // Get key to verify ownership (for revendedores)
        const key = await db.select().from(keys).where(eq(keys.id, input.keyId)).limit(1);
        if (key.length === 0) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Key não encontrada" });
        }

        if (ctx.user.role !== "admin") {
          const revendedor = await getRevendedorByUserId(ctx.user.id);
          if (!revendedor || key[0].revendedorId !== revendedor.id) {
            throw new TRPCError({ code: "FORBIDDEN", message: "Você não tem permissão para modificar esta key" });
          }
        }

        await updateKeyStatus(input.keyId, input.status);
        return { success: true };
      }),

    resetDevice: protectedProcedure
      .input(z.object({ keyId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }

        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        // Get key to verify ownership (for revendedores)
        const key = await db.select().from(keys).where(eq(keys.id, input.keyId)).limit(1);
        if (key.length === 0) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Key não encontrada" });
        }

        if (ctx.user.role !== "admin") {
          const revendedor = await getRevendedorByUserId(ctx.user.id);
          if (!revendedor || key[0].revendedorId !== revendedor.id) {
            throw new TRPCError({ code: "FORBIDDEN", message: "Você não tem permissão para modificar esta key" });
          }
        }

        await resetKeyDevice(input.keyId);
        return { success: true };
      }),

    getDashboardStats: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      if (ctx.user.role === "admin") {
        // Admin stats - all keys
        const allKeys = await db.select().from(keys);
        const activeKeys = allKeys.filter((k) => k.status === "ativo" && !k.isActivated).length;
        const activatedKeys = allKeys.filter((k) => k.isActivated && k.status === "ativo").length;

        return {
          totalKeys: allKeys.length,
          activeKeys: activeKeys + activatedKeys,
          creditBalance: 0,
        };
      } else {
        // Revendedor stats - only their keys
        const revendedor = await getRevendedorByUserId(ctx.user.id);
        if (!revendedor) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        const userKeys = await db.select().from(keys).where(eq(keys.revendedorId, revendedor.id));
        const activeKeys = userKeys.filter((k) => k.status === "ativo" && !k.isActivated).length;
        const activatedKeys = userKeys.filter((k) => k.isActivated && k.status === "ativo").length;

        return {
          totalKeys: userKeys.length,
          activeKeys: activeKeys + activatedKeys,
          creditBalance: parseFloat(revendedor.creditBalance.toString()),
        };
      }
    }),
  }),

  // Public validation API
  validate: router({
    key: publicProcedure
      .input(z.object({ keyCode: z.string(), siteUrl: z.string().url() }))
      .mutation(async ({ input }) => {
        const key = await getKeyByCode(input.keyCode);

        if (!key) {
          return {
            valid: false,
            message: "Chave não encontrada",
          };
        }

        if (key.status === "banido") {
          return {
            valid: false,
            message: "Chave banida",
          };
        }

        if (key.status === "pausado") {
          return {
            valid: false,
            message: "Chave pausada",
          };
        }

        if (!key.isActivated) {
          return {
            valid: false,
            message: "Chave não ativada",
          };
        }

        if (key.expiresAt && new Date() > key.expiresAt) {
          return {
            valid: false,
            message: "Chave expirada",
          };
        }

        return {
          valid: true,
          message: "Chave válida",
          expiresAt: key.expiresAt,
        };
      }),
  }),

  system: router({
    notifyOwner: publicProcedure
      .input(z.object({ title: z.string(), content: z.string() }))
      .mutation(async () => {
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
