import type { Metadata } from "next";
import { HoverDemo } from "./hover-demo";

export const metadata: Metadata = { title: "Hover playground" };

export default function HoverPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Hover playground</h1>
        <p className="mt-2 text-gray-600">
          Everything here appears only while the mouse is over it. Clicking or
          focusing does not open it: use <code>hover()</code> first.
        </p>
      </div>
      <HoverDemo />
    </div>
  );
}
