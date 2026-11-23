"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { formatPrice } from "@/lib/format";
import type { PaymentMessage } from "@/lib/validation/payment";

export type ApprovedPayment = {
  token: string;
  last4: string;
  brand: string;
  amountCents: number;
};

/**
 * The card form lives in an <iframe> (/embed/payment). When the card is
 * approved, the iframe sends the result to this page with postMessage.
 * Tests must use page.frameLocator(...) / contentFrame() to fill it.
 */
export function PaymentStep({
  totalCents,
  payment,
  onApproved,
  onReset,
}: {
  totalCents: number;
  payment: ApprovedPayment | null;
  onApproved: (payment: ApprovedPayment) => void;
  onReset: () => void;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [attempt, setAttempt] = useState(0);
  const [approvedHere, setApprovedHere] = useState(false);

  const handleApproved = useEffectEvent(onApproved);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      // Only trust messages from our own payment iframe.
      if (event.origin !== window.location.origin) return;
      if (event.source !== iframeRef.current?.contentWindow) return;
      const message = event.data as PaymentMessage;
      if (message?.type !== "shoplab-payment") return;
      if (message.status === "approved") {
        setApprovedHere(true);
        handleApproved({
          token: message.token,
          last4: message.last4,
          brand: message.brand,
          amountCents: message.amountCents,
        });
      }
      // Declines are shown inside the iframe itself.
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // After approval the iframe stays on screen (it shows its own "Payment
  // approved" message). If the customer comes back to this step later, only
  // the summary is shown, because a reloaded iframe would be an empty form.
  const showIframe = !payment || approvedHere;

  return (
    <div className="flex flex-col gap-3">
      {payment ? (
        <div className="flex flex-wrap items-center gap-3">
          <p
            role="status"
            data-testid="payment-approved"
            className="rounded-md border border-green-300 bg-green-50 px-4 py-2 text-green-800"
          >
            Payment approved: {payment.brand} ending in {payment.last4} (
            {formatPrice(payment.amountCents)}).
          </p>
          <button
            type="button"
            onClick={() => {
              onReset();
              setApprovedHere(false);
              setAttempt((a) => a + 1);
            }}
            className="text-sm text-indigo-700 underline"
          >
            Use a different card
          </button>
        </div>
      ) : (
        <p className="text-gray-700">
          Amount to pay: <strong>{formatPrice(totalCents)}</strong>
        </p>
      )}
      {showIframe && (
        <iframe
          // A new key reloads the iframe (new amount or "use a different card").
          key={`${totalCents}-${attempt}`}
          ref={iframeRef}
          title="Payment form"
          name="payment-frame"
          src={`/embed/payment?amount=${totalCents}`}
          className="h-96 w-full rounded-md border border-gray-200"
        />
      )}
    </div>
  );
}
