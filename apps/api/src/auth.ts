import type { AuthInstance } from "@saas-starter-open/auth";
import createAuthServer from "@saas-starter-open/auth";
import type { DatabaseSchema, Db } from "@saas-starter-open/db";
import getDb, { schema } from "@saas-starter-open/db";

export interface AuthContext {
  readonly auth: AuthInstance;
  readonly db: Db;
}

function getBaseUrl(): string {
  const defaultUrl: string = "http://localhost:8787";
  const envUrl: string | undefined = process.env.AUTH_BASE_URL;
  if (!envUrl) {
    return defaultUrl;
  }
  return envUrl;
}

const db: Db = getDb();
const baseUrl: string = getBaseUrl();

export const auth: AuthInstance = createAuthServer({
  appName: "SaaS Starter Open",
  baseUrl,
  db,
  schema: schema as DatabaseSchema,
});

export const authContext: AuthContext = {
  auth,
  db,
};
