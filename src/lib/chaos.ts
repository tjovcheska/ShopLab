// Server-side chaos helpers: every API route handler is wrapped in
// withChaos(), which adds the configured delay and random failures.
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { apiError } from "@/lib/api-errors";
import {
  DELAY_COOKIE,
  FLAKY_COOKIE,
  parseDelay,
  parseFlaky,
  type ChaosSettings,
} from "@/lib/chaos-config";

/** Defaults from the CHAOS_DELAY_MS / CHAOS_FLAKY_PERCENT env vars. */
export function getEnvChaos(): ChaosSettings {
  return {
    delayMs: parseDelay(process.env.CHAOS_DELAY_MS) ?? 0,
    flakyPercent: parseFlaky(process.env.CHAOS_FLAKY_PERCENT) ?? 0,
  };
}

/** Cookie values only (null when the cookie is not set). */
export async function getCookieChaos() {
  const store = await cookies();
  return {
    delayMs: parseDelay(store.get(DELAY_COOKIE)?.value),
    flakyPercent: parseFlaky(store.get(FLAKY_COOKIE)?.value),
  };
}

/** Cookie values, falling back to env defaults. Ignores ?delay. */
export async function getChaosSettings(): Promise<ChaosSettings> {
  const env = getEnvChaos();
  const fromCookies = await getCookieChaos();
  return {
    delayMs: fromCookies.delayMs ?? env.delayMs,
    flakyPercent: fromCookies.flakyPercent ?? env.flakyPercent,
  };
}

/** Settings for one API request, including ?delay on the request URL. */
async function getRequestChaos(request: NextRequest): Promise<ChaosSettings> {
  const settings = await getChaosSettings();
  const queryDelay = parseDelay(request.nextUrl.searchParams.get("delay"));
  return { ...settings, delayMs: queryDelay ?? settings.delayMs };
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Wraps a route handler: waits for the configured delay, then fails with
 * HTTP 500 for the configured percentage of requests.
 */
export function withChaos<Context>(
  handler: (request: NextRequest, context: Context) => Promise<Response>,
) {
  return async (request: NextRequest, context: Context): Promise<Response> => {
    const { delayMs, flakyPercent } = await getRequestChaos(request);
    if (delayMs > 0) await sleep(delayMs);
    if (flakyPercent > 0 && Math.random() * 100 < flakyPercent) {
      return apiError(
        500,
        "CHAOS_FLAKY",
        "Simulated server error (flaky mode).",
        {
          flakyPercent,
        },
      );
    }
    return handler(request, context);
  };
}
