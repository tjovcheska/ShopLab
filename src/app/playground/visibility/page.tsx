import type { Metadata } from "next";
import { VisibilityDemo } from "./visibility-demo";

export const metadata: Metadata = { title: "Visibility playground" };

export default function VisibilityPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Visibility playground</h1>
        <p className="mt-2 text-gray-600">
          Elements that are hidden, removed, disabled, covered, or out of view.
          Each one behaves differently with <code>toBeVisible()</code>,{" "}
          <code>toBeAttached()</code>, <code>toBeEnabled()</code>, and{" "}
          <code>click()</code>.
        </p>
      </div>
      <VisibilityDemo />
    </div>
  );
}
