import { defineConfig, devices } from "@playwright/test";

const DEFAULT_BASE_URL: string = "http://localhost:3000";
const baseURL: string = process.env.PLAYWRIGHT_BASE_URL ?? DEFAULT_BASE_URL;
const isSmokeRun: boolean = process.argv.some((arg: string): boolean => arg.includes("smoke.spec"));
const webOnly: boolean = process.env.PLAYWRIGHT_WEB_ONLY === "1" || isSmokeRun;

export default defineConfig({
  testDir: "./e2e",
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: webOnly
    ? {
        command: "pnpm --filter saas-web exec next dev --port 3000",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        env: {
          DISABLE_AUTH_GUARD: process.env.DISABLE_AUTH_GUARD ?? "1",
          NEXT_PUBLIC_TRUSS_DEMO_MODE: process.env.NEXT_PUBLIC_TRUSS_DEMO_MODE ?? "1",
          NEXT_PUBLIC_APP_URL: baseURL,
          AUTH_SESSION_URL: `${baseURL}/api/auth/get-session`,
        },
      }
    : undefined,
});
