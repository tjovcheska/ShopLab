import { expect, test } from "@playwright/test";

test("home page loads", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle("Home | ShopLab");
  await expect(
    page.getByRole("heading", { level: 1, name: "Welcome to ShopLab" }),
  ).toBeVisible();
  // Seeded data is there: the category list shows all five categories.
  await expect(
    page.getByRole("region", { name: "Shop by category" }).getByRole("link"),
  ).toHaveCount(5);
});

test("health endpoint returns ok", async ({ request }) => {
  const response = await request.get("/api/test/health");
  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({ status: "ok" });
});
