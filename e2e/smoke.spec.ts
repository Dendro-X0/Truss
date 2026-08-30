import { expect, test } from "@playwright/test";

test.describe("smoke", () => {
  test("landing page renders", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: /dashboard/i }).first()).toBeVisible();
  });

  test("pricing page renders", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.getByRole("heading", { name: /pricing/i })).toBeVisible();
  });

  test("dashboard opens in dev mode without sign-in", async ({ page }) => {
    await page.goto("/user");
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByText("Preview workspace")).toBeVisible();
    await expect(page.getByText("Onboarding flow")).toBeVisible();
  });

  test("auth pages render", async ({ page }) => {
    await page.goto("/auth/login");
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();

    await page.goto("/auth/signup");
    await expect(page.getByRole("heading", { name: "Create an account" })).toBeVisible();
  });
});
