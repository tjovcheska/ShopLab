"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  DELAY_COOKIE,
  FLAKY_COOKIE,
  parseDelay,
  parseFlaky,
} from "@/lib/chaos-config";

// Not httpOnly: tests may also read or set these with context.addCookies().
const cookieOptions = {
  path: "/",
  sameSite: "lax" as const,
  maxAge: 24 * 60 * 60,
};

export async function saveChaosSettings(formData: FormData) {
  const store = await cookies();
  const delay = parseDelay(String(formData.get("delay") ?? ""));
  const flaky = parseFlaky(String(formData.get("flaky") ?? ""));

  // An empty field removes that cookie, so the env default applies again.
  if (delay === null) store.delete(DELAY_COOKIE);
  else store.set(DELAY_COOKIE, String(delay), cookieOptions);
  if (flaky === null) store.delete(FLAKY_COOKIE);
  else store.set(FLAKY_COOKIE, String(flaky), cookieOptions);

  redirect("/chaos?saved=1");
}

export async function clearChaosSettings() {
  const store = await cookies();
  store.delete(DELAY_COOKIE);
  store.delete(FLAKY_COOKIE);
  redirect("/chaos?cleared=1");
}
