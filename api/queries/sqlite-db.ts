import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import path from "path";

let db: Database<sqlite3.Database, sqlite3.Statement> | null = null;

export async function getSqliteDb() {
  if (!db) {
    db = await open({
      filename: path.resolve(process.cwd(), "data.db"),
      driver: sqlite3.Database,
    });

    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        unionId TEXT NOT NULL UNIQUE,
        name TEXT,
        email TEXT,
        avatar TEXT,
        role TEXT NOT NULL DEFAULT 'user',
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        lastSignInAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL UNIQUE,
        slug TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL DEFAULT '',
        bio TEXT NOT NULL DEFAULT '',
        bannerUrl TEXT,
        avatarUrl TEXT,
        theme TEXT NOT NULL DEFAULT 'dark',
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        profileId INTEGER NOT NULL,
        title TEXT NOT NULL,
        url TEXT NOT NULL,
        visible INTEGER NOT NULL DEFAULT 1,
        sortOrder INTEGER NOT NULL DEFAULT 0,
        clickCount INTEGER NOT NULL DEFAULT 0,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }
  return db;
}
