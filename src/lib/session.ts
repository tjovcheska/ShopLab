// Signed, stateless session tokens.
//
// A token looks like `<payload>.<signature>`:
//   payload   = base64url(JSON.stringify({ uid, exp }))
//   signature = base64url(HMAC-SHA256(payload, SESSION_SECRET))
// The server trusts a token only if the signature matches and it has not
// expired. The same token is stored in the session cookie (and, from Phase 8,
// can be sent as `Authorization: Bearer <token>`).
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "shoplab_session";
const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days

type SessionPayload = { uid: number; exp: number };

const DEV_SECRET = "shoplab-dev-secret-do-not-use-in-real-apps";

function getSecret(): string {
  return process.env.SESSION_SECRET || DEV_SECRET;
}

function sign(data: string): string {
  return createHmac("sha256", getSecret()).update(data).digest("base64url");
}

export function createSessionToken(userId: number): string {
  const payload: SessionPayload = {
    uid: userId,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

/** Returns the user id stored in a valid token, or null. */
export function verifySessionToken(token: string | undefined): number | null {
  if (!token) return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;

  const expected = Buffer.from(sign(encoded));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    ) as SessionPayload;
    if (typeof payload.uid !== "number") return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload.uid;
  } catch {
    return null;
  }
}

/** Sets the session cookie. Only callable from Server Actions / Route Handlers. */
export async function setSessionCookie(userId: number) {
  const store = await cookies();
  store.set(SESSION_COOKIE, createSessionToken(userId), {
    httpOnly: true,
    sameSite: "lax",
    // Not `secure`: ShopLab is served over plain http (localhost, Docker, CI).
    secure: false,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/** Reads the user id from the session cookie of the current request. */
export async function getSessionUserId(): Promise<number | null> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}
