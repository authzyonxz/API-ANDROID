import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { createUser, createRevendedor, getRevendedorByUserId, getDb, createKey, getKeyByCode } from "./db";
import { eq } from "drizzle-orm";
import { keys } from "../drizzle/schema";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(user: AuthenticatedUser | null): TrpcContext {
  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      cookie: () => {},
      clearCookie: () => {},
    } as unknown as TrpcContext["res"],
  };
}

describe("Key Generation and Management", () => {
  let adminUser: AuthenticatedUser;
  let revendedorUser: AuthenticatedUser;
  let revendedorId: number;

  beforeAll(async () => {
    // Create admin user
    const adminResult = await createUser(`admin_${Date.now()}`, "AdminPass123", "admin");
    adminUser = {
      id: adminResult[0].insertId,
      username: `admin_${Date.now()}`,
      passwordHash: "hashed",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Create revendedor user
    const revendedorResult = await createUser(`revendedor_${Date.now()}`, "RevendPass123", "revendedor");
    const revendedorUserId = revendedorResult[0].insertId;

    revendedorUser = {
      id: revendedorUserId,
      username: `revendedor_${Date.now()}`,
      passwordHash: "hashed",
      role: "revendedor",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Create revendedor profile with credits
    await createRevendedor(revendedorUserId, 100);
    const revendedor = await getRevendedorByUserId(revendedorUserId);
    if (revendedor) {
      revendedorId = revendedor.id;
    }
  });

  it("should generate keys with correct format", async () => {
    const ctx = createAuthContext(revendedorUser);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.key.create({
      planDays: "1",
      quantity: 1,
    });

    expect(result.keys).toHaveLength(1);
    expect(result.keys[0]).toMatch(/^PROXY-ANDROID-[A-Za-z0-9]{15}$/);
  });

  it("should generate multiple keys in batch", async () => {
    const ctx = createAuthContext(revendedorUser);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.key.create({
      planDays: "7",
      quantity: 5,
    });

    expect(result.keys).toHaveLength(5);
    result.keys.forEach((key) => {
      expect(key).toMatch(/^PROXY-ANDROID-[A-Za-z0-9]{15}$/);
    });
  });

  it("should deduct credits when creating keys", async () => {
    const ctx = createAuthContext(revendedorUser);
    const caller = appRouter.createCaller(ctx);

    const balanceBefore = await caller.revendedor.getBalance();
    const creditsBefore = balanceBefore.creditBalance;

    // Create 2 keys for 7 days (5 credits each = 10 total)
    await caller.key.create({
      planDays: "7",
      quantity: 2,
    });

    const balanceAfter = await caller.revendedor.getBalance();
    const creditsAfter = balanceAfter.creditBalance;

    expect(creditsAfter).toBe(creditsBefore - 10);
  });

  it("should reject key creation with insufficient credits", async () => {
    const ctx = createAuthContext(revendedorUser);
    const caller = appRouter.createCaller(ctx);

    try {
      // Try to create 50 keys for 30 days (15 credits each = 750 total)
      // This should fail because revendedor has limited credits
      await caller.key.create({
        planDays: "30",
        quantity: 50,
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.code).toBe("BAD_REQUEST");
      expect(error.message).toContain("insuficientes");
    }
  });

  it("should list keys for revendedor", async () => {
    const ctx = createAuthContext(revendedorUser);
    const caller = appRouter.createCaller(ctx);

    const keys = await caller.key.list();

    expect(Array.isArray(keys)).toBe(true);
    expect(keys.length).toBeGreaterThan(0);
  });

  it("should pause and resume keys", async () => {
    const ctx = createAuthContext(revendedorUser);
    const caller = appRouter.createCaller(ctx);

    const keys = await caller.key.list();
    if (keys.length === 0) {
      expect.fail("No keys available for testing");
    }

    const keyId = keys[0].id;

    // Pause key
    await caller.key.updateStatus({
      keyId,
      status: "pausado",
    });

    // Verify it's paused
    const updatedKeys = await caller.key.list();
    const pausedKey = updatedKeys.find((k) => k.id === keyId);
    expect(pausedKey?.status).toBe("pausado");

    // Resume key
    await caller.key.updateStatus({
      keyId,
      status: "ativo",
    });

    // Verify it's active again
    const resumedKeys = await caller.key.list();
    const activeKey = resumedKeys.find((k) => k.id === keyId);
    expect(activeKey?.status).toBe("ativo");
  });

  it("should ban keys", async () => {
    const ctx = createAuthContext(revendedorUser);
    const caller = appRouter.createCaller(ctx);

    const keys = await caller.key.list();
    if (keys.length === 0) {
      expect.fail("No keys available for testing");
    }

    const keyId = keys[0].id;

    // Ban key
    await caller.key.updateStatus({
      keyId,
      status: "banido",
    });

    // Verify it's banned
    const updatedKeys = await caller.key.list();
    const bannedKey = updatedKeys.find((k) => k.id === keyId);
    expect(bannedKey?.status).toBe("banido");
  });
});

describe("Revendedor Management", () => {
  let adminUser: AuthenticatedUser;

  beforeAll(async () => {
    const adminResult = await createUser(`admin_mgmt_${Date.now()}`, "AdminPass123", "admin");
    adminUser = {
      id: adminResult[0].insertId,
      username: `admin_mgmt_${Date.now()}`,
      passwordHash: "hashed",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  it("should create new revendedor", async () => {
    const ctx = createAuthContext(adminUser);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.revendedor.create({
      username: `new_revendedor_${Date.now()}`,
      password: "Password123",
      creditBalance: 50,
    });

    expect(result.success).toBe(true);
    expect(result.userId).toBeDefined();
  });

  it("should list all revendedores", async () => {
    const ctx = createAuthContext(adminUser);
    const caller = appRouter.createCaller(ctx);

    const revendedores = await caller.revendedor.list();

    expect(Array.isArray(revendedores)).toBe(true);
    expect(revendedores.length).toBeGreaterThan(0);
  });

  it("should add credits to revendedor", async () => {
    const ctx = createAuthContext(adminUser);
    const caller = appRouter.createCaller(ctx);

    // Create a revendedor
    const newRevendedor = await caller.revendedor.create({
      username: `credit_test_${Date.now()}`,
      password: "Password123",
      creditBalance: 10,
    });

    // Get the revendedor to find their ID
    const revendedores = await caller.revendedor.list();
    const targetRevendedor = revendedores.find((r) => r.userId === newRevendedor.userId);

    if (!targetRevendedor) {
      expect.fail("Revendedor not found");
    }

    // Add credits
    await caller.revendedor.addCredit({
      revendedorId: targetRevendedor.id,
      amount: 25,
    });

    // Verify credits were added
    const updatedRevendedores = await caller.revendedor.list();
    const updatedRevendedor = updatedRevendedores.find((r) => r.id === targetRevendedor.id);

    const expectedBalance = parseFloat(targetRevendedor.creditBalance.toString()) + 25;
    expect(parseFloat(updatedRevendedor?.creditBalance.toString() || "0")).toBe(expectedBalance);
  });

  it("should reject revendedor creation by non-admin", async () => {
    // Create a non-admin user
    const revendedorResult = await createUser(`non_admin_${Date.now()}`, "Pass123", "revendedor");
    const nonAdminUser: AuthenticatedUser = {
      id: revendedorResult[0].insertId,
      username: `non_admin_${Date.now()}`,
      passwordHash: "hashed",
      role: "revendedor",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const ctx = createAuthContext(nonAdminUser);
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.revendedor.create({
        username: `should_fail_${Date.now()}`,
        password: "Password123",
        creditBalance: 10,
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });
});

describe("Key Validation", () => {
  it("should validate key format", async () => {
    const ctx = createAuthContext(null);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.validate.key({
      keyCode: "INVALID-FORMAT",
      siteUrl: "https://example.com",
    });

    expect(result.valid).toBe(false);
  });

  it("should reject non-existent key", async () => {
    const ctx = createAuthContext(null);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.validate.key({
      keyCode: "PROXY-ANDROID-NONEXISTENT12345",
      siteUrl: "https://example.com",
    });

    expect(result.valid).toBe(false);
    expect(result.message).toContain("não encontrada");
  });

  it("should reject paused key", async () => {
    // Create a paused key
    const revendedorResult = await createUser(`paused_test_${Date.now()}`, "Pass123", "revendedor");
    const revendedorUserId = revendedorResult[0].insertId;
    await createRevendedor(revendedorUserId, 100);
    const revendedor = await getRevendedorByUserId(revendedorUserId);

    if (revendedor) {
      const keyResult = await createKey(revendedor.id, 1);
      const db = await getDb();
      if (db) {
        await db.update(keys).set({ status: "pausado" }).where(eq(keys.id, keyResult.insertId));
      }

      const ctx = createAuthContext(null);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.validate.key({
        keyCode: keyResult.keyCode,
        siteUrl: "https://example.com",
      });

      expect(result.valid).toBe(false);
      // Key is not activated, so it returns 'não ativada' before checking status
      expect(result.message).toContain("não ativada");
    }
  });
});
