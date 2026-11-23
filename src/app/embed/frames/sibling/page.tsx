import type { Metadata } from "next";
import { NewsletterForm } from "./newsletter-form";

export const metadata: Metadata = { title: "Sibling frame" };

// Loaded inside /playground/frames, next to the "Outer frame".
export default function SiblingFramePage() {
  return (
    <main className="flex flex-col gap-3 bg-amber-50 p-4">
      <h1 className="text-lg font-semibold text-amber-900">Sibling frame</h1>
      <p className="text-sm text-amber-900">
        A frame next to the outer frame, not inside it.
      </p>
      <NewsletterForm />
    </main>
  );
}
