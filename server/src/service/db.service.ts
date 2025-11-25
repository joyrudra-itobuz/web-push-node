import { promises as fs } from "fs";
import path from "path";

const dbPath = path.resolve(process.cwd(), "databases", "db.json");

async function ensureDB(): Promise<void> {
  try {
    await fs.mkdir(path.dirname(dbPath), { recursive: true });
    await fs.access(dbPath);
  } catch (err) {
    const initial = { users: [] };
    await fs.writeFile(dbPath, JSON.stringify(initial, null, 2), "utf-8");
  }
}

export async function readDB(): Promise<{ users: any[] }> {
  await ensureDB();
  const raw = await fs.readFile(dbPath, "utf-8");
  return JSON.parse(raw) as { users: any[] };
}

export async function writeDB(db: { users: any[] }): Promise<void> {
  await ensureDB();
  await fs.writeFile(dbPath, JSON.stringify(db, null, 2), "utf-8");
}

export default { readDB, writeDB };
