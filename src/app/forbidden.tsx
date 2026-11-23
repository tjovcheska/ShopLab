import Link from "next/link";

// Rendered with HTTP status 403 when a page calls forbidden(),
// e.g. a customer opening an admin-only page. forbidden.tsx cannot set its
// own <title>; the calling page's metadata is used (see app/admin/page.tsx).
export default function Forbidden() {
  return (
    <div className="py-16 text-center">
      <h1 className="text-3xl font-bold">Access denied</h1>
      <p className="mt-2 text-gray-600">
        You do not have permission to view this page.
      </p>
      <Link href="/" className="mt-6 inline-block text-indigo-700 underline">
        Back to the home page
      </Link>
    </div>
  );
}
