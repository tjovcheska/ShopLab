"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/components/toast";
import type { ShareMessage } from "@/app/popup/share/share-actions";

/**
 * "Size guide" opens in a NEW TAB (target="_blank").
 * "Share" opens a POPUP WINDOW with window.open(); the popup can report back
 * with postMessage, which shows a toast on this page.
 */
export function ProductLinks({ slug }: { slug: string }) {
  const showToast = useToast();
  const popupRef = useRef<Window | null>(null);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (!popupRef.current || event.source !== popupRef.current) return;
      const message = event.data as ShareMessage;
      if (message?.type !== "shoplab-share") return;
      showToast({
        title: "Shared",
        description: `${message.productName} was shared to the ShopLab feed.`,
      });
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [showToast]);

  function openSharePopup() {
    const popup = window.open(
      `/popup/share?product=${encodeURIComponent(slug)}`,
      "shoplab-share",
      "popup,width=480,height=560",
    );
    popupRef.current = popup;
    setBlocked(popup === null);
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <Link
          href={`/size-guide?product=${encodeURIComponent(slug)}`}
          target="_blank"
          rel="noopener"
          className="text-indigo-700 underline"
        >
          Size guide
        </Link>
        <button
          type="button"
          onClick={openSharePopup}
          data-testid="share-button"
          className="rounded-md border border-gray-300 px-3 py-1 font-medium hover:bg-gray-50"
        >
          Share
        </button>
      </div>
      {blocked && (
        <p role="alert" className="text-sm text-red-700">
          The share window was blocked. Allow popups for this site.
        </p>
      )}
    </div>
  );
}
