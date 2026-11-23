// POST /api/test/users — create a user with the given or random data and
// return its credentials and a bearer token. Only when TEST_HOOKS_ENABLED=true.
//
// Body (every field optional): { email, password, name, role }
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { json, readOptionalJson, testRoute } from "@/lib/api/route";
import { createUser } from "@/lib/services/users";
import { createSessionToken } from "@/lib/session";
import { registerSchema } from "@/lib/validation/auth";

const testUserSchema = z.object({
  email: registerSchema.shape.email.optional(),
  password: registerSchema.shape.password.optional(),
  name: z.string().trim().min(1).max(100).optional(),
  role: z.enum(["customer", "admin"]).default("customer"),
});

export const POST = testRoute(async (request) => {
  const input = await readOptionalJson(request, testUserSchema);
  const random = randomBytes(4).toString("hex");
  const email = input.email ?? `test-${random}@shoplab.test`;
  // Random passwords still follow the site's rules (8+ chars with a number).
  const password = input.password ?? `Test-${random}-1`;
  const name = input.name ?? `Test User ${random}`;

  const user = await createUser({ name, email, password, role: input.role });
  return json(
    {
      user,
      credentials: { email, password },
      token: createSessionToken(user.id),
    },
    201,
  );
});
