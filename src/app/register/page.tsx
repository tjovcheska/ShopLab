import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, safeRedirectPath } from "@/lib/auth";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Register" };

export default async function RegisterPage({
  searchParams,
}: PageProps<"/register">) {
  const { next } = await searchParams;
  const nextPath = typeof next === "string" ? safeRedirectPath(next) : null;

  // Already logged in: nothing to do here.
  if (await getCurrentUser()) redirect(nextPath ?? "/account");

  return (
    <div className="mx-auto max-w-md rounded-lg border border-gray-200 bg-white p-6">
      <h1 className="mb-6 text-2xl font-bold">Create an account</h1>
      <RegisterForm next={nextPath} />
    </div>
  );
}
