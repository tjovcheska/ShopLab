"use client";

import { useState } from "react";
import { CONSENT_COOKIE } from "@/lib/cookie-consent";

/**
 * A full-page overlay that sits on top of everything: until the visitor
 * answers, Playwright reports clicks on the page as "<div …> intercepts
 * pointer events". Answering removes it from the DOM.
 */
export function CookieOverlay() {
  const [answered, setAnswered] = useState(false);
  if (answered) return null;

  function answer(value: "accepted" | "rejected") {
    document.cookie = `${CONSENT_COOKIE}=${value}; path=/; max-age=31536000; samesite=lax`;
    setAnswered(true);
  }

  return (
    <div
      data-testid="cookie-overlay"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4"
    >
      <section
        role="dialog"
        aria-labelledby="cookie-heading"
        className="w-full max-w-xl rounded-lg bg-white p-6 shadow-xl"
      >
        <h2 id="cookie-heading" className="mb-2 text-lg font-semibold">
          We use cookies
        </h2>
        <p className="mb-4 text-sm text-gray-700">
          ShopLab uses cookies to keep you logged in and remember your cart.
          (This is a practice shop: nothing is tracked.)
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => answer("accepted")}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Accept all
          </button>
          <button
            type="button"
            onClick={() => answer("rejected")}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Reject all
          </button>
        </div>
      </section>
    </div>
  );
}
