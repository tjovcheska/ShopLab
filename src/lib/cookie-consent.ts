// The optional cookie-consent overlay (a "covered element" exercise).
//
//   shoplab_cookie_overlay=on        turns the overlay on (set on /chaos)
//   shoplab_cookie_consent=accepted  the visitor's answer ("accepted" or
//                                    "rejected"); hides the overlay
//
// Neither cookie is httpOnly, so tests can set them with context.addCookies().
export const OVERLAY_COOKIE = "shoplab_cookie_overlay";
export const CONSENT_COOKIE = "shoplab_cookie_consent";
