import { getSqliteDb } from "./sqlite-db";

export interface Profile {
  id: number;
  userId: number;
  slug: string;
  name: string;
  bio: string;
  bannerUrl: string | null;
  avatarUrl: string | null;
  theme: string;
  createdAt: string;
  updatedAt: string;
}

export interface InsertProfile {
  userId: number;
  slug: string;
  name?: string;
  bio?: string;
  bannerUrl?: string | null;
  avatarUrl?: string | null;
  theme?: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 64);
}

function generateUniqueSlug(name: string, existingSlugs: Set<string>): string {
  let base = slugify(name) || "user";
  let slug = base;
  let counter = 1;
  while (existingSlugs.has(slug)) {
    slug = `${base}-${counter}`;
    counter++;
  }
  return slug;
}

export async function findProfileBySlug(slug: string): Promise<Profile | undefined> {
  const db = await getSqliteDb();
  return db.get<Profile>("SELECT * FROM profiles WHERE slug = ?", [slug]);
}

export async function findProfileByUserId(userId: number): Promise<Profile | undefined> {
  const db = await getSqliteDb();
  return db.get<Profile>("SELECT * FROM profiles WHERE userId = ?", [userId]);
}

export async function createProfile(data: InsertProfile): Promise<Profile> {
  const db = await getSqliteDb();
  const result = await db.run(
    `INSERT INTO profiles (userId, slug, name, bio, bannerUrl, avatarUrl, theme) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      data.userId,
      data.slug,
      data.name ?? "",
      data.bio ?? "",
      data.bannerUrl ?? null,
      data.avatarUrl ?? null,
      data.theme ?? "dark",
    ]
  );
  const profile = await db.get<Profile>("SELECT * FROM profiles WHERE id = ?", [result.lastID]);
  if (!profile) throw new Error("Failed to create profile");
  return profile;
}

export async function getOrCreateProfile(userId: number, userName: string): Promise<Profile> {
  const existing = await findProfileByUserId(userId);
  if (existing) return existing;

  const db = await getSqliteDb();
  const allSlugs = await db.all<{ slug: string }[]>("SELECT slug FROM profiles");
  const slugSet = new Set(allSlugs.map((s) => s.slug));
  const slug = generateUniqueSlug(userName || "user", slugSet);

  return createProfile({
    userId,
    slug,
    name: userName || "",
  });
}

export async function updateProfile(
  userId: number,
  data: {
    name?: string;
    bio?: string;
    slug?: string;
    bannerUrl?: string | null;
    avatarUrl?: string | null;
  }
): Promise<Profile> {
  const db = await getSqliteDb();
  const setClauses: string[] = [];
  const values: (string | null)[] = [];

  if (data.name !== undefined) {
    setClauses.push("name = ?");
    values.push(data.name);
  }
  if (data.bio !== undefined) {
    setClauses.push("bio = ?");
    values.push(data.bio);
  }
  if (data.slug !== undefined) {
    setClauses.push("slug = ?");
    values.push(data.slug);
  }
  if (data.bannerUrl !== undefined) {
    setClauses.push("bannerUrl = ?");
    values.push(data.bannerUrl);
  }
  if (data.avatarUrl !== undefined) {
    setClauses.push("avatarUrl = ?");
    values.push(data.avatarUrl);
  }

  if (setClauses.length === 0) {
    const profile = await findProfileByUserId(userId);
    if (!profile) throw new Error("Profile not found");
    return profile;
  }

  setClauses.push("updatedAt = CURRENT_TIMESTAMP");
  values.push(userId.toString());

  await db.run(
    `UPDATE profiles SET ${setClauses.join(", ")} WHERE userId = ?`,
    values
  );

  const updated = await findProfileByUserId(userId);
  if (!updated) throw new Error("Profile not found after update");
  return updated;
}

export async function isSlugTaken(slug: string, excludeUserId?: number): Promise<boolean> {
  const db = await getSqliteDb();
  const profile = await db.get<Profile>(
    excludeUserId ? "SELECT * FROM profiles WHERE slug = ? AND userId != ?" : "SELECT * FROM profiles WHERE slug = ?",
    excludeUserId ? [slug, excludeUserId] : [slug]
  );
  return !!profile;
}
