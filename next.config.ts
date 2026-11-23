import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components is intentionally OFF (see docs/DECISIONS.md):
  // every page renders per request, and visited routes are not kept in the
  // DOM as hidden <Activity> trees, so Playwright locators see one page only.
  turbopack: {
    // Pin the project root so a stray lockfile in a parent folder is ignored.
    root: __dirname,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
