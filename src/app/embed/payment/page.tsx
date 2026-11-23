import type { Metadata } from "next";
import { PaymentForm } from "./payment-form";

export const metadata: Metadata = { title: "Payment form" };

// Shown inside an <iframe> on the checkout page: /embed/payment?amount=<cents>.
// The site header and footer are left out for /embed/* pages (SiteChrome).
export default async function PaymentPage({
  searchParams,
}: PageProps<"/embed/payment">) {
  const { amount } = await searchParams;
  const amountCents = Number(amount);
  const valid = Number.isInteger(amountCents) && amountCents > 0;

  return (
    <main className="bg-white p-4">
      <h1 className="mb-1 text-lg font-semibold">Card payment</h1>
      <p className="mb-4 text-xs text-gray-500">
        Test cards: 4242 4242 4242 4242 (approved), 4000 0000 0000 0002
        (declined). Any future expiry date and any 3-digit CVC.
      </p>
      {valid ? (
        <PaymentForm amountCents={amountCents} />
      ) : (
        <p role="alert" className="text-sm text-red-700">
          Missing or invalid payment amount.
        </p>
      )}
    </main>
  );
}
