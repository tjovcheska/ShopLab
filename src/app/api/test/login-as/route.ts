// POST /api/test/login-as { "email": "alice@shoplab.test" }
// Logs in as that user WITHOUT a password: sets the same session cookie as
// the login form, and returns a bearer token. Only when TEST_HOOKS_ENABLED=true.
// Handy for fast Playwright storageState setup.
import { z } from "zod";
import { json, readJson, testRoute } from "@/lib/api/route";
import { db } from "@/lib/db";
import { ShopError } from "@/lib/errors";
import {
  createSessionToken,
  SESSION_COOKIE,
  SESSION_COOKIE_OPTIONS,
} from "@/lib/session";

const loginAsSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Enter a valid email address.")),
});

export const POST = testRoute(async (request) => {
  const { email } = await readJson(request, loginAsSchema);
  const user = await db.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, role: true },
  });
  if (!user)
    throw new ShopError(404, "NOT_FOUND", `No user with email ${email}.`);

  const token = createSessionToken(user.id);
  const response = json({ user, token });
  response.cookies.set(SESSION_COOKIE, token, SESSION_COOKIE_OPTIONS);
  return response;
});
