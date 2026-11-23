"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { cancelOrderAction } from "@/lib/order-actions";

/**
 * Asks with a native confirm() dialog before cancelling. Tests must handle
 * page.on('dialog') — without a handler Playwright dismisses the dialog and
 * nothing is cancelled.
 */
export function CancelOrderButton({
  orderId,
  orderNumber,
}: {
  orderId: number;
  orderNumber: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(
    null,
  );
  const [pending, startTransition] = useTransition();

  function cancel() {
    const sure = window.confirm(
      `Cancel order ${orderNumber}? The items go back in stock. This cannot be undone.`,
    );
    if (!sure) return;
    startTransition(async () => {
      const result = await cancelOrderAction(orderId);
      setMessage({ ok: result.ok, text: result.message });
      router.refresh();
    });
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={cancel}
        disabled={pending}
        aria-label={`Cancel order ${orderNumber}`}
        className="rounded-md border border-red-300 px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
      >
        {pending ? "Cancelling…" : "Cancel order"}
      </button>
      {message && (
        <span
          role={message.ok ? "status" : "alert"}
          className="text-sm text-gray-700"
        >
          {message.text}
        </span>
      )}
    </span>
  );
}
