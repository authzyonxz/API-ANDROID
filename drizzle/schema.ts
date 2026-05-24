import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table for local authentication.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  username: varchar("username", { length: 64 }).notNull().unique(),
  passwordHash: text("passwordHash").notNull(),
  role: mysqlEnum("role", ["admin", "revendedor"]).default("revendedor").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Revendedor table for managing resellers with credit balance.
 */
export const revendedores = mysqlTable("revendedores", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  creditBalance: decimal("creditBalance", { precision: 10, scale: 2 }).default("0").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Revendedor = typeof revendedores.$inferSelect;
export type InsertRevendedor = typeof revendedores.$inferInsert;

/**
 * Keys table for managing proxy access keys.
 */
export const keys = mysqlTable("keys", {
  id: int("id").autoincrement().primaryKey(),
  keyCode: varchar("keyCode", { length: 32 }).notNull().unique(),
  revendedorId: int("revendedorId").notNull(),
  planDays: int("planDays").notNull(), // 1, 7, or 30
  status: mysqlEnum("status", ["ativo", "pausado", "banido", "expirado"]).default("ativo").notNull(),
  isActivated: boolean("isActivated").default(false).notNull(),
  activatedAt: timestamp("activatedAt"),
  expiresAt: timestamp("expiresAt"),
  deviceId: varchar("deviceId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Key = typeof keys.$inferSelect;
export type InsertKey = typeof keys.$inferInsert;

/**
 * Credit transactions table for tracking credit usage.
 */
export const creditTransactions = mysqlTable("creditTransactions", {
  id: int("id").autoincrement().primaryKey(),
  revendedorId: int("revendedorId").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  type: mysqlEnum("type", ["debit", "credit"]).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CreditTransaction = typeof creditTransactions.$inferSelect;
export type InsertCreditTransaction = typeof creditTransactions.$inferInsert;