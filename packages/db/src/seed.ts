import type { Db } from "./index";
import getDb from "./index";

/**
 * Truss provisions orgs and projects on first login via the API.
 * For UI-only exploration, use DISABLE_AUTH_GUARD=1 instead of seed data.
 */
async function seed(db: Db): Promise<void> {
  await Promise.resolve(db);
}

async function main(): Promise<void> {
  const db: Db = getDb();
  await seed(db);
}

void main();
