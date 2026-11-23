"use client";

import { useEffect } from "react";

/**
 * Sets <html data-hydrated="true"> once React has taken over the page, so
 * tests can wait until clicks and typing are handled by React:
 *   await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
 */
export function HydrationMarker() {
  useEffect(() => {
    document.documentElement.dataset.hydrated = "true";
  }, []);
  return null;
}
