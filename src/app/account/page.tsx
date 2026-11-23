import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Your account" };

const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "long" });

export default async function AccountPage() {
  const user = await requireUser("/account");

  return (
    <div className="mx-auto max-w-2xl rounded-lg border border-gray-200 bg-white p-6">
      <h1 className="mb-6 text-2xl font-bold">Your account</h1>
      <p className="mb-6">
        Welcome back, <strong>{user.name}</strong>!
      </p>

      <dl className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-3">
        <dt className="font-medium text-gray-600">Name</dt>
        <dd>{user.name}</dd>
        <dt className="font-medium text-gray-600">Email</dt>
        <dd data-testid="account-email">{user.email}</dd>
        <dt className="font-medium text-gray-600">Account type</dt>
        <dd className="capitalize">{user.role}</dd>
        <dt className="font-medium text-gray-600">Member since</dt>
        <dd>{dateFormat.format(user.createdAt)}</dd>
      </dl>

      <p className="mt-6">
        <Link href="/account/orders" className="text-indigo-700 underline">
          View your order history
        </Link>
      </p>

      {user.role === "admin" && (
        <p className="mt-6">
          <Link href="/admin" className="text-indigo-700 underline">
            Go to the admin dashboard
          </Link>
        </p>
      )}
    </div>
  );
}
