import type { Metadata } from "next";
import { RatingDemo } from "./rating-demo";

export const metadata: Metadata = { title: "Shadow DOM playground" };

export default function ShadowDomPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Shadow DOM playground</h1>
        <p className="mt-2 text-gray-600">
          Each rating below is a <code>&lt;shoplab-rating&gt;</code> Web
          Component. Its star buttons live inside an open shadow root.
        </p>
      </div>
      <RatingDemo />
    </div>
  );
}
