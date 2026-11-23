import type { Metadata } from "next";
import Link from "next/link";
import { createHash } from "node:crypto";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { AvatarSection } from "./avatar-section";

export const metadata: Metadata = { title: "Your account" };

const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "long" });

export default async function AccountPage() {
  const user = await requireUser("/account");
  const avatar = await db.user.findUnique({
    where: { id: user.id },
    select: { avatar: true },
  });
  // A short hash of the picture: its URL changes exactly when it changes.
  const avatarVersion = avatar?.avatar
    ? createHash("sha1").update(avatar.avatar).digest("hex").slice(0, 10)
    : "";

  return (
    <div className="mx-auto max-w-2xl rounded-lg border border-gray-200 bg-white p-6">
      <h1 className="mb-6 text-2xl font-bold">Your account</h1>
      <p className="mb-6">
        Welcome back, <strong>{user.name}</strong>!
      </p>

      <AvatarSection
        name={user.name}
        hasAvatar={avatarVersion !== ""}
        version={avatarVersion}
      />

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

      <ul className="mt-6 flex flex-col gap-2">
        <li>
          <Link href="/account/orders" className="text-indigo-700 underline">
            View your order history
          </Link>
        </li>
        <li>
          <Link href="/account/wishlist" className="text-indigo-700 underline">
            View your wishlist
          </Link>
        </li>
      </ul>

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
