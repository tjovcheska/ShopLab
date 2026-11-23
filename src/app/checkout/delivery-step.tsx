"use client";

import { useState } from "react";
import { DatePicker } from "@/components/date-picker";
import { DELIVERY_OPTIONS } from "@/lib/checkout-options";
import { toISODate } from "@/lib/dates";
import { formatPrice } from "@/lib/format";
import type { DeliveryField, DeliveryInput } from "@/lib/validation/checkout";

export function DeliveryStep({
  values,
  errors,
  onChange,
}: {
  values: DeliveryInput;
  errors: Partial<Record<DeliveryField, string>>;
  onChange: (values: DeliveryInput) => void;
}) {
  // The browser's own date; this step is only ever rendered in the browser.
  const [today] = useState(() => toISODate(new Date()));

  return (
    <div className="flex flex-col gap-6">
      <fieldset
        aria-describedby={errors.method ? "delivery-method-error" : undefined}
      >
        <legend className="mb-2 text-sm font-medium">
          Delivery method{" "}
          {/* CSS-only tooltip: always in the DOM, visibility:hidden until the
              trigger is hovered. */}
          <span className="group/express relative ml-1 font-normal">
            <span
              tabIndex={0}
              aria-describedby="express-tooltip"
              className="cursor-help border-b border-dashed border-gray-500 text-gray-600"
            >
              What&apos;s the difference?
            </span>
            <span
              id="express-tooltip"
              role="tooltip"
              className="invisible absolute top-full left-0 z-20 mt-2 w-64 rounded-md bg-gray-900 px-3 py-2 text-sm text-white group-hover/express:visible"
            >
              Both arrive on the date you choose. Express orders get priority
              handling and live tracking.
            </span>
          </span>
        </legend>
        <div className="flex flex-col gap-2">
          {DELIVERY_OPTIONS.map((option) => (
            <label
              key={option.id}
              className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 ${
                values.method === option.id
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-gray-200"
              }`}
            >
              <input
                type="radio"
                name="delivery-method"
                value={option.id}
                checked={values.method === option.id}
                onChange={() => onChange({ ...values, method: option.id })}
                className="mt-1"
              />
              <span className="flex-1">
                <span className="block font-medium">
                  {option.label} – {formatPrice(option.priceCents)}
                </span>
                <span className="block text-sm text-gray-600">
                  {option.description}
                </span>
              </span>
            </label>
          ))}
        </div>
        {errors.method && (
          <p id="delivery-method-error" className="mt-1 text-sm text-red-600">
            {errors.method}
          </p>
        )}
      </fieldset>

      <DatePicker
        id="delivery-date"
        label="Delivery date"
        value={values.date}
        onChange={(date) => onChange({ ...values, date })}
        today={today}
        error={errors.date}
      />
    </div>
  );
}
