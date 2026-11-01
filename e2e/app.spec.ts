import { expect, test } from "@playwright/test";

test("sign up, add a transaction, see it on the dashboard, delete it, log out", async ({ page }) => {
  const email = `e2e+${Date.now()}@example.com`;
  const password = "password123";

  // Protected pages redirect logged-out visitors
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/);

  // Sign up
  await page.goto("/signup");
  await page.getByLabel("Name (optional)", { exact: true }).fill("E2E User");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password (min 8 characters)", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign up", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard/);

  // Add a transaction
  await page.getByRole("link", { name: "Transactions" }).click();
  await expect(page).toHaveURL(/\/transactions/);
  await page.getByLabel("Amount", { exact: true }).fill("1234.5");
  await page.getByLabel("Category", { exact: true }).fill("Food");
  await page.getByLabel("Note", { exact: true }).fill("E2E lunch");
  await page.getByRole("button", { name: "Add", exact: true }).click();

  const row = page.getByRole("row", { name: /Food/ });
  await expect(row).toBeVisible();
  await expect(row).toContainText("1,234.50");

  // It shows up on the dashboard
  await page.getByRole("link", { name: "Dashboard" }).click();
  await expect(page.getByText("1,234.50").first()).toBeVisible();

  // Delete it
  await page.getByRole("link", { name: "Transactions" }).click();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Delete" }).click();
  await expect(page.getByText("No transactions yet.")).toBeVisible();

  // Log out
  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL(/\/login/);
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/);
});

test("login rejects a wrong password", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill("nobody@example.com");
  await page.getByLabel("Password", { exact: true }).fill("wrongpassword");
  await page.getByRole("button", { name: "Log in", exact: true }).click();
await expect(page.getByText("Invalid email or password")).toBeVisible();
});