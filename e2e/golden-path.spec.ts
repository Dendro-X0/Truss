import { expect, test } from "@playwright/test";

const CHECKOUT_STUB_PREFIX = "#checkout-not-configured";

function uniqueEmail(prefix: string): string {
  const suffix = Date.now().toString(10);
  return `${prefix}+${suffix}@golden-path.test`;
}

async function signUpAndSignIn(page: import("@playwright/test").Page, email: string, password: string): Promise<void> {
  const origin: string = String(process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000");
  const signUpResponse = await page.request.post("/api/auth/sign-up/email", {
    data: { email, password, name: "Golden Path User" },
    headers: { Origin: origin },
  });
  expect(signUpResponse.ok()).toBeTruthy();

  const signInResponse = await page.request.post("/api/auth/sign-in/email", {
    data: { email, password },
    headers: { Origin: origin },
  });
  expect(signInResponse.ok()).toBeTruthy();
}

const goldenPath = process.env.DATABASE_URL ? test.describe : test.describe.skip;

goldenPath("golden path", () => {
  test.setTimeout(120000);

  test("landing → signup → dashboard → project → invite → billing stub", async ({ page }) => {
    const email = uniqueEmail("truss-golden");
    const password = "GoldenPathTest!234";

    await page.goto("/");
    await expect(page.getByRole("link", { name: /pricing/i }).first()).toBeVisible();

    await page.goto("/pricing");
    await expect(page.getByRole("heading", { name: /pricing/i })).toBeVisible();

    await page.goto("/auth/signup");
    await expect(page.getByRole("heading", { name: "Create an account" })).toBeVisible();

    await signUpAndSignIn(page, email, password);

    await page.goto("/user");
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole("button", { name: /sign out/i })).toBeVisible();

    const projectName = `Golden project ${Date.now().toString(10)}`;
    await page.getByLabel("New project").fill(projectName);
    await page.getByRole("button", { name: "Add project" }).click();
    await expect(page.getByText(projectName)).toBeVisible({ timeout: 15000 });

    const inviteEmail = uniqueEmail("invite");
    await page.getByLabel("Invite email").fill(inviteEmail);
    await page.getByRole("button", { name: "Send invite" }).click();
    await expect(page.getByText("1 pending")).toBeVisible({ timeout: 15000 });

    await page.getByRole("button", { name: "Upgrade to Pro" }).click();
    await expect(page.getByText(CHECKOUT_STUB_PREFIX)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/stripe is not configured/i)).toBeVisible();
  });
});
