// POST /api/v1/auth/register — create a customer account; returns a token.
import { apiRoute, json, readJson } from "@/lib/api/route";
import { createUser } from "@/lib/services/users";
import { createSessionToken, SESSION_MAX_AGE_SECONDS } from "@/lib/session";
import { apiRegisterSchema } from "@/lib/validation/api";

export const POST = apiRoute(async (request) => {
  const input = await readJson(request, apiRegisterSchema);
  const user = await createUser(input); // 409 EMAIL_TAKEN if it exists
  return json(
    {
      token: createSessionToken(user.id),
      tokenType: "Bearer",
      expiresIn: SESSION_MAX_AGE_SECONDS,
      user,
    },
    201,
  );
});
