import { cookies } from "next/headers";
import { CONSENT_COOKIE, OVERLAY_COOKIE } from "@/lib/cookie-consent";
import { CookieOverlay } from "./cookie-overlay";

/**
 * Renders the cookie-consent overlay when it is turned on (/chaos) and the
 * visitor has not answered yet. Off by default.
 */
export async function CookieConsent() {
  const store = await cookies();
  const enabled = store.get(OVERLAY_COOKIE)?.value === "on";
  const answered = store.has(CONSENT_COOKIE);
  return enabled && !answered ? <CookieOverlay /> : null;
}
