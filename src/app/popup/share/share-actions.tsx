"use client";

import { useState, useSyncExternalStore } from "react";

export type ShareMessage = { type: "shoplab-share"; productName: string };

// window.location only exists in the browser; on the server use "".
const subscribe = () => () => {};
const getOrigin = () => window.location.origin;
const getServerOrigin = () => "";

export function ShareActions({ name, slug }: { name: string; slug: string }) {
  const origin = useSyncExternalStore(subscribe, getOrigin, getServerOrigin);
  const link = `${origin}/products/${slug}`;
  // origin is "" until React has hydrated in the browser. Until then the
  // buttons have no click handlers, so keep them disabled; Playwright waits
  // for enabled buttons, which avoids clicking a button that does nothing.
  const hydrated = origin !== "";
  const [copied, setCopied] = useState<string | null>(null);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied("Link copied to the clipboard.");
    } catch {
      setCopied("Could not copy. Select the link and copy it yourself.");
    }
  }

  /** Tells the window that opened this popup, then closes the popup. */
  function shareToFeed() {
    const message: ShareMessage = { type: "shoplab-share", productName: name };
    window.opener?.postMessage(message, window.location.origin);
    window.close();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="share-link" className="text-sm font-medium">
          Link to this product
        </label>
        <div className="flex gap-2">
          <input
            id="share-link"
            readOnly
            value={link}
            className="flex-1 rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={copyLink}
            disabled={!hydrated}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Copy link
          </button>
        </div>
        {copied && (
          <p role="status" className="text-sm text-gray-700">
            {copied}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={shareToFeed}
        disabled={!hydrated}
        data-testid="share-to-feed"
        className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
      >
        Share to the ShopLab feed
      </button>
      <button
        type="button"
        onClick={() => window.close()}
        disabled={!hydrated}
        className="rounded-md border border-gray-300 px-4 py-2 font-medium hover:bg-gray-50"
      >
        Close
      </button>
    </div>
  );
}
