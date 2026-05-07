import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import path from 'path';

function createDb() {
  try {
    const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'offerpilot.db');
    const sqlite = new Database(dbPath);
    sqlite.pragma('journal_mode = WAL');
    return sqlite;
  } catch (e) {
    console.error('Failed to initialize database:', e);
    throw new Error(`Database init failed: ${e}`);
  }
}

const sqlite = createDb();

export const db = drizzle(sqlite, { schema });
export { schema };
