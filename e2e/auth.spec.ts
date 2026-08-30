import { expect, test } from "@playwright/test";

const LOGIN_HEADING_TEXT: string = "Sign in";
const SIGNUP_HEADING_TEXT: string = "Create account";

test.describe("auth pages", () => {
  test("renders login page", async ({ page }) => {
    await page.goto("/auth/login");
    await expect(page.getByRole("heading", { name: LOGIN_HEADING_TEXT })).toBeVisible();
  });

  test("renders signup page", async ({ page }) => {
    await page.goto("/auth/signup");
    await expect(page.getByRole("heading", { name: SIGNUP_HEADING_TEXT })).toBeVisible();
  });
});
