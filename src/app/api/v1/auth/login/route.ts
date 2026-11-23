// POST /api/v1/auth/login — exchange email + password for a bearer token.
import { apiRoute, json, readJson } from "@/lib/api/route";
import { ShopError } from "@/lib/errors";
import { authenticate } from "@/lib/services/users";
import { createSessionToken, SESSION_MAX_AGE_SECONDS } from "@/lib/session";
import { apiLoginSchema } from "@/lib/validation/api";

export const POST = apiRoute(async (request) => {
  const { email, password } = await readJson(request, apiLoginSchema);
  const user = await authenticate(email, password);
  if (!user) {
    throw new ShopError(
      401,
      "INVALID_CREDENTIALS",
      "Invalid email or password.",
    );
  }
  return json({
    token: createSessionToken(user.id),
    tokenType: "Bearer",
    expiresIn: SESSION_MAX_AGE_SECONDS,
    user,
  });
});
