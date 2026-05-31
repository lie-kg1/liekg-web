import { getSqliteDb } from "./sqlite-db";

export interface InsertUser {
  unionId: string;
  name?: string | null;
  email?: string | null;
  avatar?: string | null;
  role?: string;
  lastSignInAt?: Date;
}

export interface User {
  id: number;
  unionId: string;
  name: string | null;
  email: string | null;
  avatar: string | null;
  role: "user" | "admin";
  createdAt: string;
  updatedAt: string;
  lastSignInAt: string;
}

export async function findUserByUnionId(unionId: string): Promise<User | undefined> {
  const db = await getSqliteDb();
  return db.get<User>("SELECT * FROM users WHERE unionId = ?", [unionId]);
}

export async function upsertUser(data: InsertUser) {
  const db = await getSqliteDb();
  const existing = await findUserByUnionId(data.unionId);

  if (existing) {
    await db.run(
      `UPDATE users SET name = ?, avatar = ?, lastSignInAt = CURRENT_TIMESTAMP, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
      [data.name ?? existing.name, data.avatar ?? existing.avatar, existing.id]
    );
  } else {
    await db.run(
      `INSERT INTO users (unionId, name, email, avatar, role, lastSignInAt) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [data.unionId, data.name ?? null, data.email ?? null, data.avatar ?? null, data.role ?? "user"]
    );
  }
}
