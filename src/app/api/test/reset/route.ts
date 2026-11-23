// POST /api/test/reset — wipe the database and load the seed data again.
// Only when TEST_HOOKS_ENABLED=true. Ids, dates, and passwords are the same
// after every reset.
import { json, testRoute } from "@/lib/api/route";
import { db } from "@/lib/db";
import { seedDatabase } from "@/lib/seed";

export const POST = testRoute(async () => {
  const started = performance.now();
  // One transaction: fast (a single commit) and all-or-nothing.
  const counts = await db.$transaction((tx) => seedDatabase(tx), {
    timeout: 30_000,
  });
  return json({
    status: "ok",
    durationMs: Math.round(performance.now() - started),
    counts,
  });
});
