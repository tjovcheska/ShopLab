import type { Metadata } from "next";

export const metadata: Metadata = { title: "Frames playground" };

// Frame tree on this page:
//
//   page
//   ├── iframe "Outer frame"   (/embed/frames/outer)
//   │   └── iframe "Inner frame"  (/embed/frames/inner)   ← nested
//   └── iframe "Sibling frame" (/embed/frames/sibling)
export default function FramesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Frames playground</h1>
        <p className="mt-2 text-gray-600">
          The outer frame contains another frame. Locators on this page cannot
          see inside any frame: you have to enter each frame first.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <iframe
          title="Outer frame"
          name="outer"
          src="/embed/frames/outer"
          className="h-[30rem] w-full rounded-lg border-2 border-indigo-300 bg-white"
        />
        <iframe
          title="Sibling frame"
          name="sibling"
          src="/embed/frames/sibling"
          className="h-[30rem] w-full rounded-lg border-2 border-amber-300 bg-white"
        />
      </div>
    </div>
  );
}
