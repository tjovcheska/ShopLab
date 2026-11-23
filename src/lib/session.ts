// Session cookie: a signed token holding the user id (see src/lib/signing.ts).
// The same token can also be sent as `Authorization: Bearer <token>` (Phase 8).
import { cookies } from "next/headers";
import { createSignedToken, verifySignedToken } from "@/lib/signing";

export const SESSION_COOKIE = "shoplab_session";
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days

export function createSessionToken(userId: number): string {
  return createSignedToken("session", { uid: userId }, SESSION_MAX_AGE_SECONDS);
}

/** Returns the user id stored in a valid token, or null. */
export function verifySessionToken(token: string | undefined): number | null {
  const payload = verifySignedToken<{ uid: unknown }>("session", token);
  return typeof payload?.uid === "number" ? payload.uid : null;
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
