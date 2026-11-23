"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { getDeliveryOption } from "@/lib/checkout-options";
import { toISODate } from "@/lib/dates";
import { placeOrder } from "@/lib/order-actions";
import {
  deliverySchema,
  shippingSchema,
  toFieldErrors,
  type DeliveryField,
  type DeliveryInput,
  type ShippingField,
  type ShippingInput,
} from "@/lib/validation/checkout";
import { DeliveryStep } from "./delivery-step";
import { PaymentStep, type ApprovedPayment } from "./payment-step";
import { ReviewStep, type ReviewItem } from "./review-step";
import { ShippingStep } from "./shipping-step";

const STEPS = ["Shipping", "Delivery", "Payment", "Review"] as const;
const STEP_HEADINGS = [
  "Shipping address",
  "Delivery options",
  "Payment",
  "Review your order",
];

/**
 * Multi-step checkout. All answers are kept in this component's state;
 * "Next" validates the current step before moving on. Nothing is saved on
 * the server until "Place order".
 */
export function CheckoutWizard({
  customerName,
  items,
  subtotalCents,
}: {
  customerName: string;
  items: ReviewItem[];
  subtotalCents: number;
}) {
  const [step, setStep] = useState(0);
  const [shipping, setShipping] = useState<ShippingInput>({
    fullName: customerName,
    line1: "",
    line2: "",
    city: "",
    country: "US",
    region: "",
    postalCode: "",
  });
  const [shippingErrors, setShippingErrors] = useState<
    Partial<Record<ShippingField, string>>
  >({});
  const [delivery, setDelivery] = useState<DeliveryInput>({
    method: "standard",
    date: "",
  });
  const [deliveryErrors, setDeliveryErrors] = useState<
    Partial<Record<DeliveryField, string>>
  >({});
  const [payment, setPayment] = useState<ApprovedPayment | null>(null);
  const [stepError, setStepError] = useState<string | null>(null);
  const [placing, startPlacing] = useTransition();

  const shippingCents = getDeliveryOption(delivery.method)?.priceCents ?? 0;
  const totalCents = subtotalCents + shippingCents;
  // A payment only counts for the exact amount it was made for. Changing the
  // delivery method afterwards means paying again.
  const validPayment =
    payment && payment.amountCents === totalCents ? payment : null;

  // Move keyboard and screen-reader focus to the new step's heading.
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  function goTo(next: number) {
    setStepError(null);
    setStep(next);
  }

  function handleNext() {
    if (step === 0) {
      const result = shippingSchema.safeParse(shipping);
      if (!result.success) {
        setShippingErrors(toFieldErrors<ShippingField>(result.error));
        return;
      }
      setShippingErrors({});
    }
    if (step === 1) {
      const today = toISODate(new Date());
      const result = deliverySchema(today).safeParse(delivery);
      if (!result.success) {
        setDeliveryErrors(toFieldErrors<DeliveryField>(result.error));
        return;
      }
      setDeliveryErrors({});
    }
    if (step === 2 && !validPayment) {
      setStepError("Complete the payment in the form above before continuing.");
      return;
    }
    goTo(step + 1);
  }

  function handlePlaceOrder() {
    if (!validPayment) return;
    setStepError(null);
    startPlacing(async () => {
      const result = await placeOrder({
        shipping,
        delivery,
        paymentToken: validPayment.token,
      });
      // On success placeOrder redirects to the order page; we only get here
      // when something needs fixing.
      if (result.fix === "cart") {
        setStepError(result.message);
        return;
      }
      if (result.fix === "payment") setPayment(null);
      const target = { shipping: 0, delivery: 1, payment: 2 }[result.fix];
      setStep(target);
      setStepError(result.message);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <nav aria-label="Checkout progress" data-testid="checkout-progress">
        <ol className="grid grid-cols-4 gap-2 text-sm">
          {STEPS.map((label, index) => {
            const state =
              index < step
                ? "complete"
                : index === step
                  ? "current"
                  : "upcoming";
            return (
              <li
                key={label}
                aria-current={state === "current" ? "step" : undefined}
                data-state={state}
                className={`flex items-center gap-2 border-t-4 pt-2 ${
                  state === "upcoming"
                    ? "border-gray-200 text-gray-500"
                    : "border-indigo-600 text-indigo-800"
                } ${state === "current" ? "font-semibold" : ""}`}
              >
                <span aria-hidden="true">
                  {state === "complete" ? "✓" : index + 1}
                </span>
                {label}
                {state === "complete" && (
                  <span className="sr-only">(completed)</span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      <section
        aria-labelledby="step-heading"
        className="rounded-lg border border-gray-200 bg-white p-6"
      >
        <p className="text-sm text-gray-500">
          Step {step + 1} of {STEPS.length}
        </p>
        <h2
          id="step-heading"
          ref={headingRef}
          tabIndex={-1}
          className="mb-4 text-xl font-semibold focus:outline-none"
        >
          {STEP_HEADINGS[step]}
        </h2>

        {step === 0 && (
          <ShippingStep
            values={shipping}
            errors={shippingErrors}
            onChange={setShipping}
          />
        )}
        {step === 1 && (
          <DeliveryStep
            values={delivery}
            errors={deliveryErrors}
            onChange={setDelivery}
          />
        )}
        {step === 2 && (
          <PaymentStep
            totalCents={totalCents}
            payment={validPayment}
            onApproved={(approved) => {
              setPayment(approved);
              setStepError(null);
            }}
            onReset={() => setPayment(null)}
          />
        )}
        {step === 3 && validPayment && (
          <ReviewStep
            items={items}
            subtotalCents={subtotalCents}
            shipping={shipping}
            delivery={delivery}
            payment={validPayment}
          />
        )}

        {stepError && (
          <p
            role="alert"
            className="mt-4 rounded-md border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-800"
          >
            {stepError}
          </p>
        )}

        <div className="mt-6 flex justify-between gap-3">
          <button
            type="button"
            onClick={() => goTo(step - 1)}
            disabled={step === 0 || placing}
            className="rounded-md border border-gray-300 px-5 py-2 font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Back
          </button>
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              data-testid="checkout-next"
              className="rounded-md bg-indigo-600 px-5 py-2 font-medium text-white hover:bg-indigo-700"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={placing}
              className="rounded-md bg-green-600 px-5 py-2 font-medium text-white hover:bg-green-700 disabled:opacity-60"
            >
              {placing ? "Placing order…" : "Place order"}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
