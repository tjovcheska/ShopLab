"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import { useAdoptDomValue } from "@/lib/use-adopt-dom-value";
import type { ThreeDSMessage } from "@/lib/validation/payment";
import { verifyChallengeAction } from "./actions";

/** Tells the payment iframe (this frame's parent) the result. */
function notifyParent(message: ThreeDSMessage) {
  window.parent.postMessage(message, window.location.origin);
}

export function VerifyForm({ challenge }: { challenge: string }) {
  const [code, setCode] = useState("");
  const codeRef = useRef<HTMLInputElement>(null);
  useAdoptDomValue(codeRef, code, setCode);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const result = await verifyChallengeAction(challenge, code);
      if (result.status !== "approved") {
        setError(result.message);
        return;
      }
      setDone("Payment verified.");
      notifyParent({
        type: "shoplab-3ds",
        status: "approved",
        token: result.token,
        last4: result.last4,
        brand: result.brand,
        amountCents: result.amountCents,
      });
    });
  }

  if (done) {
    return (
      <p role="status" className="text-sm font-medium text-green-800">
        {done}
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Bank verification"
      className="flex flex-col gap-2"
    >
      <label htmlFor="verification-code" className="text-sm font-medium">
        Verification code
      </label>
      <input
        ref={codeRef}
        id="verification-code"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        value={code}
        onChange={(e) => setCode(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? "verification-error" : undefined}
        className="w-40 rounded-md border border-gray-300 px-3 py-1.5"
      />
      {error && (
        <p
          id="verification-error"
          role="alert"
          className="text-sm text-red-700"
        >
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-sky-700 px-4 py-1.5 text-sm font-medium text-white hover:bg-sky-800 disabled:opacity-60"
        >
          {pending ? "Verifying…" : "Verify"}
        </button>
        <button
          type="button"
          onClick={() =>
            notifyParent({ type: "shoplab-3ds", status: "cancelled" })
          }
          className="rounded-md border border-gray-300 px-4 py-1.5 text-sm hover:bg-white"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
