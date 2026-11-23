// Checkout validation, shared by the wizard (per-step checks in the browser)
// and the placeOrder server action (final check of everything).
import { z } from "zod";
import { DELIVERY_OPTIONS } from "@/lib/checkout-options";
import { isSelectableDeliveryDate } from "@/lib/dates";
import { COUNTRIES, getCountry } from "@/lib/regions";

export const shippingSchema = z
  .object({
    fullName: z.string().trim().min(1, "Full name is required."),
    line1: z.string().trim().min(1, "Address is required."),
    line2: z.string().trim(),
    city: z.string().trim().min(1, "City is required."),
    country: z.enum(COUNTRIES.map((c) => c.code) as [string, ...string[]], {
      error: "Choose a country.",
    }),
    region: z.string(),
    postalCode: z
      .string()
      .trim()
      .regex(
        /^[A-Za-z0-9][A-Za-z0-9 -]{1,8}[A-Za-z0-9]$/,
        "Enter a valid postal code.",
      ),
  })
  .superRefine((value, ctx) => {
    const country = getCountry(value.country);
    if (country && !country.regions.some((r) => r.code === value.region)) {
      ctx.addIssue({
        code: "custom",
        path: ["region"],
        message: "Choose a state or region.",
      });
    }
  });

export type ShippingInput = z.input<typeof shippingSchema>;
export type ShippingAddress = z.output<typeof shippingSchema>;
export type ShippingField = keyof ShippingInput;

const deliveryMethods = DELIVERY_OPTIONS.map((o) => o.id) as [
  string,
  ...string[],
];

/**
 * Used by the wizard. `today` is the browser's local date ("YYYY-MM-DD").
 * The server checks the date with isAcceptableDeliveryDate() instead, which
 * allows for the customer being in a different time zone.
 */
export function deliverySchema(today: string) {
  return z.object({
    method: z.enum(deliveryMethods, { error: "Choose a delivery method." }),
    date: z
      .string({ error: "Choose a delivery date." })
      .min(1, "Choose a delivery date.")
      .refine((date) => isSelectableDeliveryDate(date, today), {
        message: "Choose an available weekday at least 2 days from today.",
      }),
  });
}

export type DeliveryInput = { method: string; date: string };
export type DeliveryField = keyof DeliveryInput;

/** Turns zod issues into one message per field. */
export function toFieldErrors<Field extends string>(error: z.ZodError) {
  const errors: Partial<Record<Field, string>> = {};
  for (const issue of error.issues) {
    const field = issue.path[0] as Field;
    errors[field] ??= issue.message;
  }
  return errors;
}
