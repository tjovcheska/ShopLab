// Chaos settings shared by the server and the browser (no server-only imports).
//
// Where the values come from, highest priority first:
//   delay:  ?delay=<ms> on the page or API URL  >  shoplab_delay cookie  >  CHAOS_DELAY_MS
//   flaky:  shoplab_flaky cookie  >  CHAOS_FLAKY_PERCENT
// See docs/CHAOS.md.

export const DELAY_COOKIE = "shoplab_delay";
export const FLAKY_COOKIE = "shoplab_flaky";
export const MAX_DELAY_MS = 15000;

export type ChaosSettings = { delayMs: number; flakyPercent: number };

function toInt(value: string | null | undefined): number | null {
  if (value === null || value === undefined || value.trim() === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? Math.round(number) : null;
}

/** Parses a delay in ms, clamped to 0–15000. Returns null if not a number. */
export function parseDelay(value: string | null | undefined): number | null {
  const number = toInt(value);
  return number === null ? null : Math.min(Math.max(number, 0), MAX_DELAY_MS);
}

/** Parses a failure percentage, clamped to 0–100. Returns null if not a number. */
export function parseFlaky(value: string | null | undefined): number | null {
  const number = toInt(value);
  return number === null ? null : Math.min(Math.max(number, 0), 100);
}

export function isChaosActive(settings: ChaosSettings): boolean {
  return settings.delayMs > 0 || settings.flakyPercent > 0;
}
