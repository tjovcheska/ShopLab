// Helpers for reading the logged-in user and protecting pages.
import { cache } from "react";
import { forbidden, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSessionUserId } from "@/lib/session";

export type CurrentUser = {
  id: number;
  email: string;
  name: string;
  role: "customer" | "admin";
  createdAt: Date;
};

/**
 * The logged-in user for this request, or null.
 * Wrapped in React `cache()` so the header and the page share one DB query.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const userId = await getSessionUserId();
  if (userId === null) return null;
  return db.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });
});

/**
 * Use at the top of a protected page. Anonymous visitors are redirected to
 * /login?next=<path> and come back to `path` after logging in.
 */
export async function requireUser(path: string): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(path)}`);
  return user;
}

/** Like requireUser, but logged-in customers get the 403 page. */
export async function requireAdmin(path: string): Promise<CurrentUser> {
  const user = await requireUser(path);
  if (user.role !== "admin") forbidden();
  return user;
}

/**
 * Only allow redirects to paths on this site ("/account"), never to other
 * sites ("https://evil.test" or "//evil.test"). Falls back to /account.
 */
export function safeRedirectPath(next: unknown): string {
  if (
    typeof next === "string" &&
    next.startsWith("/") &&
    !next.startsWith("//") &&
    !next.startsWith("/\\")
  ) {
    return next;
  }
  return "/account";
}
