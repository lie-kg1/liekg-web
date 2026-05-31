import { getSqliteDb } from "./sqlite-db";

export interface Link {
  id: number;
  profileId: number;
  title: string;
  url: string;
  visible: number;
  sortOrder: number;
  clickCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface InsertLink {
  profileId: number;
  title: string;
  url: string;
  sortOrder?: number;
}

export async function findLinksByProfileId(profileId: number, visibleOnly = false): Promise<Link[]> {
  const db = await getSqliteDb();
  if (visibleOnly) {
    return db.all<Link[]>(
      "SELECT * FROM links WHERE profileId = ? AND visible = 1 ORDER BY sortOrder ASC",
      [profileId]
    );
  }
  return db.all<Link[]>(
    "SELECT * FROM links WHERE profileId = ? ORDER BY sortOrder ASC",
    [profileId]
  );
}

export async function findLinkById(id: number): Promise<Link | undefined> {
  const db = await getSqliteDb();
  return db.get<Link>("SELECT * FROM links WHERE id = ?", [id]);
}

export async function createLink(data: InsertLink): Promise<Link> {
  const db = await getSqliteDb();
  const result = await db.run(
    `INSERT INTO links (profileId, title, url, visible, sortOrder) VALUES (?, ?, ?, 1, ?)`,
    [data.profileId, data.title, data.url, data.sortOrder ?? 0]
  );
  const link = await db.get<Link>("SELECT * FROM links WHERE id = ?", [result.lastID]);
  if (!link) throw new Error("Failed to create link");
  return link;
}

export async function updateLink(
  id: number,
  data: { title?: string; url?: string; visible?: boolean }
): Promise<Link> {
  const db = await getSqliteDb();
  const setClauses: string[] = [];
  const values: (string | number)[] = [];

  if (data.title !== undefined) {
    setClauses.push("title = ?");
    values.push(data.title);
  }
  if (data.url !== undefined) {
    setClauses.push("url = ?");
    values.push(data.url);
  }
  if (data.visible !== undefined) {
    setClauses.push("visible = ?");
    values.push(data.visible ? 1 : 0);
  }

  setClauses.push("updatedAt = CURRENT_TIMESTAMP");
  values.push(id);

  await db.run(`UPDATE links SET ${setClauses.join(", ")} WHERE id = ?`, values);

  const updated = await findLinkById(id);
  if (!updated) throw new Error("Link not found after update");
  return updated;
}

export async function deleteLink(id: number): Promise<void> {
  const db = await getSqliteDb();
  await db.run("DELETE FROM links WHERE id = ?", [id]);
}

export async function reorderLinks(profileId: number, linkIds: number[]): Promise<void> {
  const db = await getSqliteDb();
  for (let i = 0; i < linkIds.length; i++) {
    await db.run("UPDATE links SET sortOrder = ? WHERE id = ? AND profileId = ?", [
      i,
      linkIds[i],
      profileId,
    ]);
  }
}

export async function incrementClickCount(id: number): Promise<void> {
  const db = await getSqliteDb();
  await db.run("UPDATE links SET clickCount = clickCount + 1 WHERE id = ?", [id]);
}

export async function getNextSortOrder(profileId: number): Promise<number> {
  const db = await getSqliteDb();
  const result = await db.get<{ maxOrder: number | null }>(
    "SELECT MAX(sortOrder) as maxOrder FROM links WHERE profileId = ?",
    [profileId]
  );
  return (result?.maxOrder ?? -1) + 1;
}
