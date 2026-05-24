import { drizzle } from "drizzle-orm/mysql2";
import { users, revendedores } from "../drizzle/schema.ts";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const db = drizzle(process.env.DATABASE_URL);

async function seed() {
  try {
    // Check if admin already exists
    const existingAdmin = await db.select().from(users).where(eq(users.username, "ADMINISTRADOR")).limit(1);
    
    if (existingAdmin.length > 0) {
      console.log("Admin user already exists");
      return;
    }

    // Create admin user
    const passwordHash = await bcrypt.hash("ADMIN123", 10);
    const result = await db.insert(users).values({
      username: "ADMINISTRADOR",
      passwordHash,
      role: "admin",
    });

    console.log("Admin user created successfully:", result);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
}

seed();
