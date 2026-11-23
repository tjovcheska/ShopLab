"use server";
import { getCurrentUser } from "@/lib/auth";
import { verifyChallenge, type ChallengeResult } from "@/lib/payment";

/** Called by the bank-verification page inside the payment iframe. */
export async function verifyChallengeAction(
  challenge: string,
  code: string,
): Promise<ChallengeResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { status: "expired", message: "Please log in before paying." };
  }
  return verifyChallenge(user.id, challenge, code);
}
