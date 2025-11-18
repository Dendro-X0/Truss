import type { Db } from "./index";
import getDb from "./index";

async function seed(db: Db): Promise<void> {
  // TODO: add demo seed data (orgs, users, projects).
  // For now, this is a no-op placeholder.
  await Promise.resolve(db);
}

async function main(): Promise<void> {
  const db: Db = getDb();
  await seed(db);
}

void main();
