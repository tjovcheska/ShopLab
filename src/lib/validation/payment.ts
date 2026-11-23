// Card form validation for the fake payment iframe (/embed/payment).
// Shared by the form (instant feedback) and the authorize server action.
import { z } from "zod";

/** Test cards. Any other well-formed number is "not recognized". */
export const TEST_CARDS = {
  approved: "4242424242424242",
  declined: "4000000000000002",
  /** Asks for bank verification (3-D Secure) in a nested iframe. */
  threeDSecure: "4000002760003184",
};

export const cardSchema = z.object({
  cardNumber: z
    .string()
    .transform((value) => value.replace(/[\s-]/g, ""))
    .pipe(z.string().regex(/^\d{16}$/, "Enter a 16-digit card number.")),
  expiry: z
    .string()
    .trim()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Enter the expiry date as MM/YY.")
    .refine((value) => !isExpired(value), "This card has expired."),
  cvc: z
    .string()
    .trim()
    .regex(/^\d{3,4}$/, "Enter the 3- or 4-digit CVC."),
});

export type CardInput = z.input<typeof cardSchema>;
export type CardField = keyof CardInput;

/** A card is valid until the end of its expiry month. */
function isExpired(expiry: string, now = new Date()): boolean {
  const [month, year] = expiry.split("/").map(Number);
  const endOfMonth = new Date(2000 + year, month, 1); // first day of next month
  return endOfMonth <= now;
}

/** Message sent from the payment iframe to the checkout page. */
export type PaymentMessage =
  | {
      type: "shoplab-payment";
      status: "approved";
      token: string;
      last4: string;
      brand: string;
      amountCents: number;
    }
  | { type: "shoplab-payment"; status: "declined"; message: string };

/** Message sent from the nested bank-verification iframe to the payment iframe. */
export type ThreeDSMessage =
  | {
      type: "shoplab-3ds";
      status: "approved";
      token: string;
      last4: string;
      brand: string;
      amountCents: number;
    }
  | { type: "shoplab-3ds"; status: "cancelled" };
