// Instructor-only smoke test for ShopLab (not for students).
//
// Runs the same checks against both docker-compose environments:
//   local    http://localhost:3000
//   staging  http://localhost:3001  (500 ms chaos delay on API responses)
//
// Override the URLs with SMOKE_LOCAL_URL / SMOKE_STAGING_URL, or run one
// environment only: npx playwright test --project=staging
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    ...devices["Desktop Chrome"],
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "local",
      use: { baseURL: process.env.SMOKE_LOCAL_URL ?? "http://localhost:3000" },
    },
    {
      name: "staging",
      use: {
        baseURL: process.env.SMOKE_STAGING_URL ?? "http://localhost:3001",
      },
    },
  ],
});
