// Signed, tamper-proof tokens (used for sessions and payment approvals).
//
// A token looks like `<payload>.<signature>`:
//   payload   = base64url(JSON.stringify({ ...data, exp }))
//   signature = base64url(HMAC-SHA256(purpose + "." + payload, SESSION_SECRET))
// `purpose` stops a token made for one thing (e.g. a payment) from being
// accepted as another (e.g. a session).
import { createHmac, timingSafeEqual } from "node:crypto";

const DEV_SECRET = "shoplab-dev-secret-do-not-use-in-real-apps";

function sign(purpose: string, data: string): string {
  return createHmac("sha256", process.env.SESSION_SECRET || DEV_SECRET)
    .update(`${purpose}.${data}`)
    .digest("base64url");
}

export function createSignedToken(
  purpose: string,
  data: Record<string, unknown>,
  ttlSeconds: number,
): string {
  const payload = { ...data, exp: Math.floor(Date.now() / 1000) + ttlSeconds };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${sign(purpose, encoded)}`;
}

/** Returns the token's data if the signature is valid and it has not expired. */
export function verifySignedToken<T>(
  purpose: string,
  token: string | undefined | null,
): (T & { exp: number }) | null {
  if (!token) return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;

  const expected = Buffer.from(sign(purpose, encoded));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return null;
  }
  try {
    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    );
    if (typeof payload.exp !== "number" || payload.exp < Date.now() / 1000) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
