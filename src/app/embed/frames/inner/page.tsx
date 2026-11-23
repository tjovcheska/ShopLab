import type { Metadata } from "next";
import { Counter } from "./counter";

export const metadata: Metadata = { title: "Inner frame" };

// Loaded inside the "Outer frame", which is itself inside /playground/frames.
export default function InnerFramePage() {
  return (
    <main className="flex flex-col gap-3 bg-green-50 p-4">
      <h1 className="text-lg font-semibold text-green-900">Inner frame</h1>
      <p className="text-sm text-green-900">
        You are two frames deep: page → Outer frame → Inner frame.
      </p>
      <Counter />
    </main>
  );
}
