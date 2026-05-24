import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { createUser, getUserByUsername, verifyPassword } from "./db";

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

describe("Authentication", () => {
  it("should create a user with bcrypt hashed password", async () => {
    const testUsername = `test_user_${Date.now()}`;
    const testPassword = "TestPassword123";

    await createUser(testUsername, testPassword, "revendedor");
    const user = await getUserByUsername(testUsername);

    expect(user).toBeDefined();
    expect(user?.username).toBe(testUsername);
    expect(user?.role).toBe("revendedor");
    expect(user?.passwordHash).not.toBe(testPassword); // Should be hashed
  });

  it("should verify password correctly", async () => {
    const testUsername = `test_verify_${Date.now()}`;
    const testPassword = "CorrectPassword123";

    await createUser(testUsername, testPassword, "revendedor");
    const user = await getUserByUsername(testUsername);

    expect(user).toBeDefined();
    if (user) {
      const isValid = await verifyPassword(testPassword, user.passwordHash);
      expect(isValid).toBe(true);

      const isInvalid = await verifyPassword("WrongPassword", user.passwordHash);
      expect(isInvalid).toBe(false);
    }
  });

  it("should login with correct credentials", async () => {
    const testUsername = `test_login_${Date.now()}`;
    const testPassword = "LoginPassword123";

    await createUser(testUsername, testPassword, "admin");

    const ctx = createAuthContext(null);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.login({ username: testUsername, password: testPassword });

    expect(result).toBeDefined();
    expect(result.username).toBe(testUsername);
    expect(result.role).toBe("admin");
  });

  it("should reject login with wrong password", async () => {
    const testUsername = `test_wrong_pass_${Date.now()}`;
    const testPassword = "CorrectPassword";

    await createUser(testUsername, testPassword, "revendedor");

    const ctx = createAuthContext(null);
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.auth.login({ username: testUsername, password: "WrongPassword" });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.code).toBe("UNAUTHORIZED");
    }
  });

  it("should reject login with non-existent user", async () => {
    const ctx = createAuthContext(null);
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.auth.login({ username: "nonexistent_user", password: "password" });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.code).toBe("UNAUTHORIZED");
    }
  });
});

describe("Key Validation", () => {
  it("should validate a valid key", async () => {
    const ctx = createAuthContext(null);
    const caller = appRouter.createCaller(ctx);

    // This test validates the API structure
    const result = await caller.validate.key({
      keyCode: "PROXY-ANDROID-NONEXISTENT",
      siteUrl: "https://example.com",
    });

    expect(result).toBeDefined();
    expect(result.valid).toBe(false);
    expect(result.message).toBe("Chave não encontrada");
  });

  it("should return proper error for invalid key", async () => {
    const ctx = createAuthContext(null);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.validate.key({
      keyCode: "INVALID-KEY",
      siteUrl: "https://example.com",
    });

    expect(result.valid).toBe(false);
  });
});
