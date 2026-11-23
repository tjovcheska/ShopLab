"use server";
import { getCurrentUser } from "@/lib/auth";
import { authorizeCard, type AuthorizeResult } from "@/lib/payment";
import {
  cardSchema,
  type CardField,
  type CardInput,
} from "@/lib/validation/payment";
import { toFieldErrors } from "@/lib/validation/checkout";

export type AuthorizePaymentResult =
  | AuthorizeResult
  | { status: "invalid"; fieldErrors: Partial<Record<CardField, string>> }
  | { status: "error"; message: string };

/** Called by the payment form inside the iframe. */
export async function authorizePayment(
  card: CardInput,
  amountCents: number,
): Promise<AuthorizePaymentResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { status: "error", message: "Please log in before paying." };
  }
  if (!Number.isInteger(amountCents) || amountCents <= 0) {
    return { status: "error", message: "Invalid payment amount." };
  }
  const parsed = cardSchema.safeParse(card);
  if (!parsed.success) {
    return {
      status: "invalid",
      fieldErrors: toFieldErrors<CardField>(parsed.error),
    };
  }
  return authorizeCard(user.id, parsed.data.cardNumber, amountCents);
}
