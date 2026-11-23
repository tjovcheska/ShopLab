# Chaos mode

Chaos mode makes ShopLab's **API** slow or unreliable on purpose, so students can practice timeouts, waits, retries, and error handling. Server-rendered HTML is never delayed; only `/api/...` responses are.

Phase 11 adds suggested exercises to this file.

## Settings

| Setting | How to set it                      | Range   | Effect                                    |
| ------- | ---------------------------------- | ------- | ----------------------------------------- |
| Delay   | `?delay=<ms>` on a page or API URL | 0–15000 | Every API response waits this long        |
| Delay   | cookie `shoplab_delay=<ms>`        | 0–15000 | Same, for every request from that browser |
| Delay   | env `CHAOS_DELAY_MS`               | 0–15000 | Server-wide default                       |
| Flaky   | cookie `shoplab_flaky=<percent>`   | 0–100   | That % of API requests fail with HTTP 500 |
| Flaky   | env `CHAOS_FLAKY_PERCENT`          | 0–100   | Server-wide default                       |

Priority: `?delay` beats the cookie, and the cookie beats the env var. Values outside the range are clamped.

- **`/chaos`** is a form for setting or clearing the two cookies, and shows the values in effect.
- A **yellow banner** ("Chaos mode: delay X ms, flaky Y%") appears at the top of every page while either value is above 0.
- **A page's `?delay`** is forwarded to its API calls by `apiFetch()` (`src/lib/api-client.ts`). For example, `/products?delay=3000` shows the loading skeleton for three seconds.
- **A flaky failure** returns `500 {"error":{"code":"CHAOS_FLAKY","message":"Simulated server error (flaky mode).","details":{"flakyPercent":50}}}`.

## From a Playwright test

```ts
await context.addCookies([
  { name: "shoplab_delay", value: "2000", url: "http://localhost:3000" },
  { name: "shoplab_flaky", value: "30", url: "http://localhost:3000" },
]);
await page.goto("/products?delay=5000"); // or per page
```

## In code

API route handlers are wrapped in `withChaos()` from `src/lib/chaos.ts`:

```ts
export const GET = withChaos(async (request) => { ... });
```
