"use client";

import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type FormEvent,
} from "react";
import { FormField } from "@/components/form-field";
import { formatPrice } from "@/lib/format";
import { toFieldErrors } from "@/lib/validation/checkout";
import {
  cardSchema,
  type CardField,
  type CardInput,
  type PaymentMessage,
  type ThreeDSMessage,
} from "@/lib/validation/payment";
import { authorizePayment } from "./actions";

type FieldErrors = Partial<Record<CardField, string>>;

/** "4242424242424242" → "4242 4242 4242 4242" */
function formatCardNumber(value: string) {
  return value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ");
}

/** Sends the result to the checkout page that contains this iframe. */
function notifyParent(message: PaymentMessage) {
  // Only pages on the same origin (ShopLab itself) receive the message.
  window.parent.postMessage(message, window.location.origin);
}

export function PaymentForm({ amountCents }: { amountCents: number }) {
  const [card, setCard] = useState<CardInput>({
    cardNumber: "",
    expiry: "",
    cvc: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [declined, setDeclined] = useState<string | null>(null);
  const [approved, setApproved] = useState<string | null>(null);
  // 3-D Secure: a signed challenge while the nested bank iframe is open.
  const [challenge, setChallenge] = useState<string | null>(null);
  const bankFrameRef = useRef<HTMLIFrameElement>(null);
  const [pending, startTransition] = useTransition();

  // Listen for the nested "Bank verification" iframe's answer.
  useEffect(() => {
    if (!challenge) return;
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (event.source !== bankFrameRef.current?.contentWindow) return;
      const message = event.data as ThreeDSMessage;
      if (message?.type !== "shoplab-3ds") return;
      if (message.status === "approved") {
        setApproved(`${message.brand} ending in ${message.last4}`);
        notifyParent({
          type: "shoplab-payment",
          status: "approved",
          token: message.token,
          last4: message.last4,
          brand: message.brand,
          amountCents: message.amountCents,
        });
      } else {
        setChallenge(null);
        setDeclined("Bank verification was cancelled.");
        notifyParent({
          type: "shoplab-payment",
          status: "declined",
          message: "Bank verification was cancelled.",
        });
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [challenge]);

  function update(field: CardField, value: string) {
    setCard((c) => ({ ...c, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDeclined(null);
    const parsed = cardSchema.safeParse(card);
    if (!parsed.success) {
      setErrors(toFieldErrors<CardField>(parsed.error));
      return;
    }
    setErrors({});

    startTransition(async () => {
      const result = await authorizePayment(card, amountCents);
      switch (result.status) {
        case "invalid":
          setErrors(result.fieldErrors);
          break;
        case "error":
          setDeclined(result.message);
          break;
        case "declined":
          setDeclined(result.message);
          notifyParent({
            type: "shoplab-payment",
            status: "declined",
            message: result.message,
          });
          break;
        case "challenge":
          setChallenge(result.challenge);
          break;
        case "approved":
          setApproved(`${result.brand} ending in ${result.last4}`);
          notifyParent({
            type: "shoplab-payment",
            status: "approved",
            token: result.token,
            last4: result.last4,
            brand: result.brand,
            amountCents,
          });
          break;
      }
    });
  }

  if (challenge && !approved) {
    return (
      <div className="flex flex-col gap-2">
        <p role="status" className="text-sm text-gray-700">
          Your bank needs to verify this payment.
        </p>
        <iframe
          ref={bankFrameRef}
          title="Bank verification"
          name="bank-verification"
          src={`/embed/3ds?challenge=${encodeURIComponent(challenge)}`}
          className="h-60 w-full rounded-md border-2 border-sky-300"
        />
      </div>
    );
  }

  if (approved) {
    return (
      <p
        role="status"
        className="rounded-md border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-800"
      >
        Payment approved: {approved}.
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-label="Card details"
      className="flex flex-col gap-3"
    >
      {declined && (
        <div
          role="alert"
          className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {declined}
        </div>
      )}
      <FormField
        id="card-number"
        label="Card number"
        inputMode="numeric"
        autoComplete="cc-number"
        placeholder="1234 5678 9012 3456"
        data-testid="card-number"
        value={card.cardNumber}
        onChange={(e) => update("cardNumber", formatCardNumber(e.target.value))}
        error={errors.cardNumber}
      />
      <div className="grid grid-cols-2 gap-3">
        <FormField
          id="card-expiry"
          label="Expiry (MM/YY)"
          inputMode="numeric"
          autoComplete="cc-exp"
          placeholder="MM/YY"
          maxLength={5}
          value={card.expiry}
          onChange={(e) => update("expiry", e.target.value)}
          error={errors.expiry}
        />
        <FormField
          id="card-cvc"
          label="CVC"
          inputMode="numeric"
          autoComplete="cc-csc"
          maxLength={4}
          value={card.cvc}
          onChange={(e) => update("cvc", e.target.value)}
          error={errors.cvc}
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
      >
        {pending ? "Processing…" : `Pay ${formatPrice(amountCents)}`}
      </button>
    </form>
  );
}
