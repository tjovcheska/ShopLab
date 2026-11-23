// Fake card payments. The payment iframe asks the server to authorize a card
// (authorizeCard), and gets back a signed "payment token". The checkout page
// passes that token to placeOrder, which checks it (checkPaymentToken).
// A paid order can therefore only be created through the iframe.
import { randomUUID } from "node:crypto";
import { createSignedToken, verifySignedToken } from "@/lib/signing";
import { TEST_CARDS } from "@/lib/validation/payment";

const PAYMENT_TOKEN_TTL_SECONDS = 15 * 60;

type PaymentTokenData = {
  paymentId: string;
  userId: number;
  amountCents: number;
  last4: string;
  brand: string;
};

export type AuthorizeResult =
  | { status: "approved"; token: string; last4: string; brand: string }
  | { status: "declined"; message: string };

export function authorizeCard(
  userId: number,
  cardNumber: string,
  amountCents: number,
): AuthorizeResult {
  if (cardNumber === TEST_CARDS.declined) {
    return { status: "declined", message: "Your card was declined." };
  }
  if (cardNumber !== TEST_CARDS.approved) {
    return {
      status: "declined",
      message: "Card not recognized. Use the test card 4242 4242 4242 4242.",
    };
  }
  const data: PaymentTokenData = {
    paymentId: randomUUID(),
    userId,
    amountCents,
    last4: cardNumber.slice(-4),
    brand: "Visa",
  };
  return {
    status: "approved",
    token: createSignedToken("payment", data, PAYMENT_TOKEN_TTL_SECONDS),
    last4: data.last4,
    brand: data.brand,
  };
}

// Payment ids that have already paid for an order. Kept in memory: a server
// restart forgets them, which is fine for a fake payment provider.
const usedPayments = new Set<string>();

/**
 * Checks a payment token for this user and amount. Returns the payment id,
 * or an error message. Call markPaymentUsed(id) once the order is saved.
 */
export function checkPaymentToken(
  token: string,
  userId: number,
  amountCents: number,
): { paymentId: string } | { error: string } {
  const data = verifySignedToken<PaymentTokenData>("payment", token);
  if (!data || data.userId !== userId) {
    return { error: "Payment is missing or invalid. Please pay again." };
  }
  if (usedPayments.has(data.paymentId)) {
    return { error: "This payment has already been used. Please pay again." };
  }
  if (data.amountCents !== amountCents) {
    return {
      error: "Your order total changed after payment. Please pay again.",
    };
  }
  return { paymentId: data.paymentId };
}

export function markPaymentUsed(paymentId: string) {
  usedPayments.add(paymentId);
}
