import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="py-16 text-center">
      <h1 className="text-3xl font-bold">Page not found</h1>
      <p className="mt-2 text-gray-600">This page does not exist (yet).</p>
      <Link href="/" className="mt-6 inline-block text-indigo-700 underline">
        Back to the home page
      </Link>
    </div>
  );
}
