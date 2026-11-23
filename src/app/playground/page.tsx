import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Playground" };

// Isolated practice pages for tricky UI.
const PAGES = [
  {
    href: "/playground/drag-drop",
    name: "Drag and drop",
    description: "A sortable list and a two-column task board.",
  },
  {
    href: "/playground/shadow-dom",
    name: "Shadow DOM",
    description: "A <shoplab-rating> Web Component with an open shadow root.",
  },
  {
    href: "/playground/upload",
    name: "Upload and download",
    description: "Single and multiple file upload, plus a CSV download.",
  },
  {
    href: "/playground/table",
    name: "Data table",
    description: "Sorting, filtering, and row checkboxes with duplicate rows.",
  },
  {
    href: "/playground/hover",
    name: "Hover",
    description: "Menus, tooltips, and buttons that appear only on hover.",
  },
  {
    href: "/playground/visibility",
    name: "Visibility",
    description: "Hidden, removed, disabled, covered, and off-screen elements.",
  },
  {
    href: "/playground/frames",
    name: "Frames",
    description: "An iframe inside an iframe, plus a sibling iframe.",
  },
  {
    href: "/playground/dialogs",
    name: "Dialogs",
    description: "Native alert, confirm, and prompt dialogs.",
  },
];

export default function PlaygroundPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Playground</h1>
        <p className="mt-2 text-gray-600">
          Small, isolated pages for practicing tricky parts of browser
          automation.
        </p>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2">
        {PAGES.map((page) => (
          <li key={page.href}>
            <Link
              href={page.href}
              className="block h-full rounded-lg border border-gray-200 bg-white p-4 hover:border-indigo-400"
            >
              <span className="block font-semibold text-indigo-700">
                {page.name}
              </span>
              <span className="text-sm text-gray-600">{page.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
