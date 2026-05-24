import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, revendedores, keys, creditTransactions, type Revendedor, type Key, type CreditTransaction } from "../drizzle/schema";
import bcrypt from "bcryptjs";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// User authentication functions
export async function getUserByUsername(username: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createUser(username: string, password: string, role: "admin" | "revendedor" = "revendedor") {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const result = await db.insert(users).values({
    username,
    passwordHash,
    role,
  });

  return result;
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Revendedor functions
export async function createRevendedor(userId: number, creditBalance: number = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(revendedores).values({
    userId,
    creditBalance: creditBalance.toString(),
  });
  return result;
}

export async function getRevendedorByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(revendedores).where(eq(revendedores.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllRevendedores() {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(revendedores);
}

export async function updateRevendedorCredit(revendedorId: number, amount: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const revendedor = await db.select().from(revendedores).where(eq(revendedores.id, revendedorId)).limit(1);
  if (revendedor.length === 0) throw new Error("Revendedor not found");

  const currentBalance = parseFloat(revendedor[0].creditBalance.toString());
  const newBalance = currentBalance + amount;

  await db.update(revendedores)
    .set({ creditBalance: newBalance.toString() })
    .where(eq(revendedores.id, revendedorId));

  // Log transaction
  await db.insert(creditTransactions).values({
    revendedorId,
    amount: Math.abs(amount).toString(),
    type: amount > 0 ? "credit" : "debit",
    description: amount > 0 ? "Crédito adicionado" : "Crédito utilizado",
  });
}

// Key functions
export async function generateKeyCode(): Promise<string> {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randomPart = "";
  for (let i = 0; i < 15; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `PROXY-ANDROID-${randomPart}`;
}

export async function createKey(revendedorId: number, planDays: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const keyCode = await generateKeyCode();
  const result = await db.insert(keys).values({
    keyCode,
    revendedorId,
    planDays,
    status: "ativo",
    isActivated: false,
  });

  return { keyCode, ...result };
}

export async function getKeysByRevendedor(revendedorId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(keys).where(eq(keys.revendedorId, revendedorId));
}

export async function getKeyByCode(keyCode: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(keys).where(eq(keys.keyCode, keyCode)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateKeyStatus(keyId: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(keys).set({ status }).where(eq(keys.id, keyId));
}

export async function activateKey(keyId: number, deviceId?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Default 1 day, will be updated based on planDays

  await db.update(keys)
    .set({
      isActivated: true,
      activatedAt: now,
      expiresAt,
      deviceId,
    })
    .where(eq(keys.id, keyId));
}

export async function resetKeyDevice(keyId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(keys).set({ deviceId: null }).where(eq(keys.id, keyId));
}
