# Chaos mode

Chaos mode makes ShopLab's **API** slow or unreliable on purpose, so students can practice timeouts, waits, retries, and error handling against something that misbehaves in controlled, repeatable ways.

## Settings

| Setting | How to set it                      | Range   | Effect                                            |
| ------- | ---------------------------------- | ------- | ------------------------------------------------- |
| Delay   | `?delay=<ms>` on a page or API URL | 0–15000 | API responses wait this long                      |
| Delay   | cookie `shoplab_delay=<ms>`        | 0–15000 | The same, for every API request from that browser |
| Delay   | env `CHAOS_DELAY_MS`               | 0–15000 | Server-wide default                               |
| Flaky   | cookie `shoplab_flaky=<percent>`   | 0–100   | That share of API requests fail with HTTP 500     |
| Flaky   | env `CHAOS_FLAKY_PERCENT`          | 0–100   | Server-wide default                               |

- **Priority:** `?delay` beats the cookie, and the cookie beats the env var. Values outside the range are clamped (`?delay=99999` becomes 15000 ms).
- **`/chaos`** is a form that sets or clears the two cookies and shows the values in effect (cookie, env default, result). The cookies aren't `HttpOnly`, so tests can also set them with `context.addCookies()`.
- **A yellow banner,** "Chaos mode: delay X ms, flaky Y%", shows at the top of every page while either value is above 0 (test ID `chaos-banner`).
- **A flaky failure** looks like `500 {"error":{"code":"CHAOS_FLAKY","message":"Simulated server error (flaky mode).","details":{"flakyPercent":50}}}`. Which requests fail is random, so expect to see different failures on each run.
- **The Docker `shoplab-staging` environment** (port 3001) has `CHAOS_DELAY_MS=500` built in: every API response there takes about half a second longer than on port 3000.

### What chaos affects

Only responses from `/api/v1/*` and the admin CSV export (`/admin/products/export`) are delayed or failed. A page's `?delay` reaches its API calls because the browser-side `apiFetch()` (`src/lib/api-client.ts`) copies it onto every `/api/...` request.

| Affected (fetches from the API in the browser)                          | Not affected                                                                       |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `/products` grid (loading skeleton, "Try again" on failure)             | Server-rendered HTML of every page                                                 |
| `/products/all` infinite scroll ("Loading more…", "Try again")          | Login, register, logout, add to cart, the cart page, and checkout (Server Actions) |
| Header search suggestions ("Searching…", "Could not load suggestions.") | The payment iframe's card authorization (Server Action)                            |
| Home page "New arrivals" (never appears if its request fails)           | `/api/test/*` test hooks, including health and reset                               |
| Product page "Live stock" ("Could not refresh stock. Retrying…")        |                                                                                    |
| The Quick view dialog on product cards                                  |                                                                                    |
| The "Export CSV" download on `/admin/products`                          |
| Every REST API call students make with `request`                        |                                                                                    |

## Setting chaos from a test

```ts
// For the whole browser context (all pages and API calls)
await context.addCookies([
  { name: "shoplab_delay", value: "2000", url: "http://localhost:3000" },
  { name: "shoplab_flaky", value: "30", url: "http://localhost:3000" },
]);

// For one page only
await page.goto("/products?delay=5000");

// For one API call
await request.get("/api/v1/products?delay=3000");

// Through the UI, like a manual tester would
await page.goto("/chaos");
await page.getByLabel("Delay (ms)").fill("1500");
await page.getByRole("button", { name: "Save" }).click();
```

## Suggested exercises

Each exercise lists a goal, the setup, and what students should discover. They grow harder from top to bottom.

### 1. Watch the default timeout fail (Timeouts)

- **Setup:** `page.goto("/products?delay=6000")`, then `await expect(page.getByTestId("product-grid")).toBeVisible()`.
- **Discover:** the assertion fails, because the default `expect` timeout is 5 s. Fix it three ways, then compare: a per-assertion `{ timeout: 10_000 }`, `expect.configure({ timeout })` for a group of tests, and `expect: { timeout }` in `playwright.config.ts`. Discuss which is appropriate when.
- **Stretch:** at `?delay=15000`, which timeout fails first: the assertion, the action, or the whole test (default 30 s)?

### 2. Wait for the right thing (Dynamic elements and waits)

- **Setup:** `/products?delay=2000`.
- **Discover:** assert on the skeleton (`getByTestId("product-skeleton")`) appearing and then disappearing, or wait for the results summary text. Compare that with `page.waitForResponse(r => r.url().includes("/api/v1/products"))`. Ban `waitForTimeout()` and explain why a fixed sleep is either too short or wastes time.
- **Stretch:** do the same for `/products/all` (scroll, then wait for "Loading more…" to go) and for search suggestions with `?delay=1500`.

### 3. Same test, two environments (Configuration)

- **Setup:** start both Docker environments. Create two Playwright projects with `baseURL` `http://localhost:3000` and `http://localhost:3001`.
- **Discover:** a test that passes locally but is "slow" on staging. Measure the difference with `test.info()` or the HTML report. Set a per-project `expect` timeout.

### 4. Handle a failing request in the UI (Error handling)

- **Setup:** cookie `shoplab_flaky=100`, then open `/products`.
- **Discover:** assert that the error alert "Could not load products" is shown. Then clear the cookie (`context.clearCookies()`), click "Try again", and assert the grid loads. That's a deterministic test of an error path.
- **Stretch:** do the same on a product page: with flaky at 100 %, "Live stock" keeps its last value and shows "Could not refresh stock. Retrying…".

### 5. Live with randomness (Stability)

- **Setup:** cookie `shoplab_flaky=30`. Run a simple "filter products by category" test 20 times (`--repeat-each=20`).
- **Discover:** some runs fail. Try, and discuss honestly, each of these: `retries` in the config, `test.describe.configure({ retries })`, `expect.toPass()` around the flaky step, and `expect.poll()`. Which ones hide real bugs? When is a retry legitimate?
- **Stretch:** make the test robust by clicking "Try again" when the error alert appears.

### 6. Retrying API calls (API automation)

- **Setup:** `shoplab_flaky=50` as a cookie on the `request` context (`extraHTTPHeaders: { cookie: "shoplab_flaky=50" }`).
- **Discover:** `GET /api/v1/products` sometimes returns `500 CHAOS_FLAKY`. Write a small helper that retries only on 5xx (never on 4xx), with a maximum number of attempts, and log every attempt to the report with `test.info().attach()`.

### 7. Take control instead (Network)

- **Discover:** chaos is controlled by the server, so it applies to every client. Compare it with `page.route("**/api/v1/products*", …)`, which delays, fails, or fakes a response for one test only, with no server settings. When would you use each one?

### 8. Make the failure visible (Reporting and logging)

- **Setup:** any of the failures above.
- **Discover:** turn on `trace: "retain-on-failure"` and open the trace. Find the slow or failed request in the Network tab, and see how long the test waited. Attach the failing API response body to the report.

## In code

API route handlers are wrapped in `withChaos()` from `src/lib/chaos.ts` (through `apiRoute()` in `src/lib/api/route.ts`):

```ts
export const GET = apiRoute(async (request) => { ... });
```

Test hooks use `testRoute()` instead, which skips chaos on purpose so that health checks and resets never fail randomly.
