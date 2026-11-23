// GET /api/test/health — { "status": "ok" } once the app and its database
// answer. Used by Playwright's webServer option and CI to wait for
// readiness. Only when TEST_HOOKS_ENABLED=true.
import { json, testRoute } from "@/lib/api/route";
import { db } from "@/lib/db";

export const GET = testRoute(async () => {
  try {
    await db.$queryRaw`SELECT 1`;
  } catch {
    return json({ status: "error", message: "Database unavailable." }, 503);
  }
  return json({ status: "ok" });
});
