import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { parse as parseCookieHeader } from "cookie";
import * as db from "../db";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

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

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    // Parse session cookie for local authentication
    const cookies = parseCookieHeader(opts.req.headers.cookie || "");
    const sessionData = cookies.session;

    if (sessionData) {
      const session = verifySessionToken(sessionData);
      if (session) {
        const dbUser = await db.getUserByUsername(session.username);
        if (dbUser && dbUser.id === session.userId) {
          user = dbUser;
        }
      }
    }
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
