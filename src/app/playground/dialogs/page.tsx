import type { Metadata } from "next";
import { DialogButtons } from "./dialog-buttons";

export const metadata: Metadata = { title: "Dialogs playground" };

export default function DialogsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Dialogs playground</h1>
        <p className="mt-2 text-gray-600">
          These buttons open the browser&apos;s own dialogs. Playwright
          dismisses them automatically unless your test handles the{" "}
          <code>dialog</code> event.
        </p>
      </div>
      <DialogButtons />
    </div>
  );
}
