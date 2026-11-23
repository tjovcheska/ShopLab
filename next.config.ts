import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hide the "Open Next.js Dev Tools" button in `npm run dev`: its name
  // contains "Next", so getByRole('button', { name: 'Next' }) would match it
  // as well as the checkout's Next button. Errors are still shown.
  devIndicators: false,
  // Cache Components is intentionally OFF (see docs/DECISIONS.md):
  // every page renders per request, and visited routes are not kept in the
  // DOM as hidden <Activity> trees, so Playwright locators see one page only.
  experimental: {
    // Enables forbidden(), which renders app/forbidden.tsx with HTTP 403.
    authInterrupts: true,
    // Server Actions accept 1 MB by default. The upload playground allows
    // 2 MB per file and several files per upload.
    serverActions: { bodySizeLimit: "10mb" },
  },
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
