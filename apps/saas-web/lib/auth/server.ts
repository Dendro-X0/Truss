import createAuthServer from "@saas-starter-open/auth";
import getDb, { schema } from "@saas-starter-open/db";
import type { DatabaseSchema, Db } from "@saas-starter-open/db";

const db: Db = getDb();

function getBaseUrl(): string {
  const defaultUrl: string = "http://localhost:3000";
  const envUrl: string | undefined = process.env.NEXT_PUBLIC_APP_URL;
  if (!envUrl) {
    return defaultUrl;
  }
  return envUrl;
}

const baseUrl: string = getBaseUrl();

const auth = createAuthServer({
  appName: "SaaS Starter Open",
  baseUrl,
  db,
  schema: schema as DatabaseSchema,
});

export default auth;
