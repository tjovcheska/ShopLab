import type { Metadata } from "next";
import { Greeter } from "./greeter";

export const metadata: Metadata = { title: "Outer frame" };

// Loaded inside /playground/frames. Contains the nested "Inner frame".
export default function OuterFramePage() {
  return (
    <main className="flex h-screen flex-col gap-4 bg-indigo-50 p-4">
      <h1 className="text-lg font-semibold text-indigo-900">Outer frame</h1>
      <Greeter />
      <iframe
        title="Inner frame"
        name="inner"
        src="/embed/frames/inner"
        className="w-full flex-1 rounded-md border-2 border-green-300 bg-white"
      />
    </main>
  );
}
