import type { Metadata } from "next";
import { THREE_DS_TEST_CODE } from "@/lib/payment";
import { VerifyForm } from "./verify-form";

export const metadata: Metadata = { title: "Bank verification" };

// Shown inside the payment iframe, which is itself inside the checkout page:
//   checkout page → "Payment form" iframe → "Bank verification" iframe
export default async function ThreeDSPage({
  searchParams,
}: PageProps<"/embed/3ds">) {
  const { challenge } = await searchParams;

  return (
    <main className="bg-sky-50 p-4">
      <h1 className="mb-1 font-semibold text-sky-900">Bank verification</h1>
      <p className="mb-3 text-xs text-sky-900">
        Your bank needs to confirm this payment. Enter the code we sent to your
        phone. (Test code: {THREE_DS_TEST_CODE})
      </p>
      {typeof challenge === "string" ? (
        <VerifyForm challenge={challenge} />
      ) : (
        <p role="alert" className="text-sm text-red-700">
          Missing verification request.
        </p>
      )}
    </main>
  );
}
