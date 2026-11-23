// Fake card payments. The payment iframe asks the server to authorize a card
// (authorizeCard), and gets back a signed "payment token". The checkout page
// passes that token to placeOrder, which checks it (checkPaymentToken).
// A paid order can therefore only be created through the iframe.
//
// The 3-D Secure test card first returns a "challenge": the payment iframe
// then shows a nested "Bank verification" iframe, and only after the right
// code (verifyChallenge) does the server issue the payment token.
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
  | { status: "challenge"; challenge: string }
  | { status: "declined"; message: string };

/** The code the fake bank accepts on the verification screen. */
export const THREE_DS_TEST_CODE = "123456";
const CHALLENGE_TTL_SECONDS = 10 * 60;

type ChallengeData = {
  challengeId: string;
  userId: number;
  amountCents: number;
  last4: string;
  brand: string;
};

function approve(
  userId: number,
  amountCents: number,
  last4: string,
  brand: string,
) {
  const data: PaymentTokenData = {
    paymentId: randomUUID(),
    userId,
    amountCents,
    last4,
    brand,
  };
  return {
    status: "approved" as const,
    token: createSignedToken("payment", data, PAYMENT_TOKEN_TTL_SECONDS),
    last4,
    brand,
  };
}

export function authorizeCard(
  userId: number,
  cardNumber: string,
  amountCents: number,
): AuthorizeResult {
  if (cardNumber === TEST_CARDS.declined) {
    return { status: "declined", message: "Your card was declined." };
  }
  if (cardNumber === TEST_CARDS.threeDSecure) {
    const data: ChallengeData = {
      challengeId: randomUUID(),
      userId,
      amountCents,
      last4: cardNumber.slice(-4),
      brand: "Visa",
    };
    return {
      status: "challenge",
      challenge: createSignedToken("3ds", data, CHALLENGE_TTL_SECONDS),
    };
  }
  if (cardNumber !== TEST_CARDS.approved) {
    return {
      status: "declined",
      message: "Card not recognized. Use the test card 4242 4242 4242 4242.",
    };
  }
  return approve(userId, amountCents, cardNumber.slice(-4), "Visa");
}

// Challenges that were already answered correctly (in memory).
const usedChallenges = new Set<string>();

export type ChallengeResult =
  | {
      status: "approved";
      token: string;
      last4: string;
      brand: string;
      amountCents: number;
    }
  | { status: "invalid"; message: string }
  | { status: "expired"; message: string };

/** The bank verification step of a 3-D Secure payment. */
export function verifyChallenge(
  userId: number,
  challenge: string,
  code: string,
): ChallengeResult {
  const data = verifySignedToken<ChallengeData>("3ds", challenge);
  if (!data || data.userId !== userId || usedChallenges.has(data.challengeId)) {
    return {
      status: "expired",
      message: "This verification has expired. Start the payment again.",
    };
  }
  if (code.trim() !== THREE_DS_TEST_CODE) {
    return { status: "invalid", message: "Incorrect code. Try again." };
  }
  usedChallenges.add(data.challengeId);
  return {
    ...approve(userId, data.amountCents, data.last4, data.brand),
    amountCents: data.amountCents,
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
