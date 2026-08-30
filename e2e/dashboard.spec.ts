import { expect, test } from "@playwright/test";

const DASHBOARD_HEADING_TEXT: string = "User dashboard";

test.describe("dashboard", () => {
  test("renders dashboard shell for unauthenticated user", async ({ page }) => {
    await page.goto("/user");
    await expect(page.getByRole("heading", { name: DASHBOARD_HEADING_TEXT })).toBeVisible();
  });
});
