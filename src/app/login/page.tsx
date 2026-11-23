import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, safeRedirectPath } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;
  const nextPath = typeof next === "string" ? safeRedirectPath(next) : null;

  // Already logged in: go straight to where the user was heading.
  if (await getCurrentUser()) redirect(nextPath ?? "/account");

  return (
    <div className="mx-auto max-w-md rounded-lg border border-gray-200 bg-white p-6">
      <h1 className="mb-2 text-2xl font-bold">Log in</h1>
      {nextPath && (
        <p className="mb-4 text-sm text-gray-600">Please log in to continue.</p>
      )}
      <LoginForm next={nextPath} />
    </div>
  );
}
