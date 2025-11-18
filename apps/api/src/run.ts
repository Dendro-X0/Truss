import { serve } from "@hono/node-server";
import type { AppInstance } from "./app";
import { createApp } from "./app";

const defaultPort: number = 8787;

function getPort(): number {
  const rawPort: string | undefined = process.env.PORT;
  const parsedPort: number = rawPort === undefined ? Number.NaN : Number(rawPort);
  if (Number.isFinite(parsedPort) && parsedPort > 0) {
    return parsedPort;
  }
  return defaultPort;
}

const port: number = getPort();
const app: AppInstance = createApp();

serve({
	fetch: app.fetch,
	port,
});

// eslint-disable-next-line no-console
console.log(`API listening on http://localhost:${port}`);
