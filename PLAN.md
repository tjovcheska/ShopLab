# ShopLab — Build Plan

ShopLab is a small e-commerce web application built **as a target for teaching Playwright test automation** (JavaScript/TypeScript). It is not a production shop. Its features exist so students can practice specific testing topics: page objects, locators, waits, complex UI, frames and tabs, flaky behavior, test data, API testing, and CI.

## Instructions for Claude Code

- Work **one phase at a time**, in order. Do not start the next phase until the current phase's acceptance criteria pass.
- After each phase: run `npm run lint`, `npm run typecheck`, and `npm run build`, then commit with a message like `phase 3: catalog and product pages`.
- Keep the code simple and readable. Students will read it to understand why a test behaves the way it does.
- Do **not** write Playwright tests for students. Only write the small smoke test described in Phase 10, so the instructor can verify the app works.
- If a requirement is ambiguous, choose the simplest option and note it in `docs/DECISIONS.md`.

## Tech stack

- **Next.js** (latest stable, App Router) with **TypeScript** in strict mode
- **Tailwind CSS** for styling
- **Prisma** ORM with **SQLite** (single file database, easy to reset)
- **Zod** for request validation in API routes
- Session auth with an HTTP-only signed cookie (no external auth provider); passwords hashed with `bcryptjs`
- **Docker** + `docker-compose.yml` for running the app in CI
- Node.js current LTS
- ESLint + Prettier

## Global conventions

- All pages use semantic HTML and proper ARIA roles/labels, so `getByRole` and `getByLabel` work everywhere.
- `data-testid` is added **only to some elements** (roughly half of interactive elements). Mark the rest with nothing extra, so students must also use role, text, label, and chained/filtered locators. Document which pages have test IDs in `docs/LOCATORS.md`.
- Every page has a unique `<title>` and a single `<h1>`.
- Prices are stored in cents (integers) and formatted in the UI.

## Chaos and flakiness controls

These settings drive the timeouts, waits, and stability modules. Implement them in a shared helper used by every API route and some client components.

- **Delay:** query parameter `?delay=<ms>` on any page, or cookie `shoplab_delay=<ms>`, makes API responses wait that long before responding. Max 15000 ms.
- **Flaky mode:** cookie `shoplab_flaky=<0-100>` makes that percentage of API requests fail with HTTP 500 and a JSON error body.
- **Environment defaults:** `CHAOS_DELAY_MS` and `CHAOS_FLAKY_PERCENT` env vars set defaults.
- **Instructor panel:** page `/chaos` with a form to set and clear these cookies, showing the current values.
- When chaos is active, show a small yellow banner at the top of every page: "Chaos mode: delay X ms, flaky Y%".

## Data model (Prisma)

- **User:** id, email (unique), passwordHash, name, role (`customer` | `admin`), createdAt
- **Category:** id, name, slug
- **Product:** id, name, slug, description, priceCents, stock, imageUrl (local file in `/public/products`), categoryId, rating (1–5), createdAt
- **CartItem:** id, userId, productId, quantity
- **Order:** id, userId, status (`pending` | `paid` | `shipped` | `cancelled`), totalCents, shippingAddress (JSON), deliveryDate, createdAt
- **OrderItem:** id, orderId, productId, quantity, priceCents
- **Review:** id, productId, userId, rating, comment, createdAt

Seed script (`prisma/seed.ts`): 5 categories, 40 products with varied prices and stock (include at least 3 out-of-stock products), 2 customers (`alice@shoplab.test` / `Password123!`, `bob@shoplab.test` / `Password123!`), 1 admin (`admin@shoplab.test` / `Admin123!`), some reviews, and 2 past orders for Alice. Seed must be deterministic (same data every run).

---

## Phase 1 — Project setup

- Create the Next.js project with TypeScript, Tailwind, ESLint, Prettier.
- Add Prisma with SQLite, the schema above, the seed script, and npm scripts: `db:migrate`, `db:seed`, `db:reset`.
- Add `.env.example` with all env vars documented.
- Add a shared layout: header (logo, search box, nav links, cart icon with item count, login/account link), footer.
- Add `README.md` with setup steps.

**Acceptance:** `npm install && npm run db:reset && npm run dev` starts the app with seeded data and the layout visible.

## Phase 2 — Authentication

- Pages: `/register`, `/login`, `/account` (protected).
- Register form validates on the client and server: email format, password at least 8 characters with a number, matching confirm password. Show field-level error messages under each input with `aria-describedby`.
- Login sets a session cookie. Wrong credentials show an error alert with `role="alert"`.
- Logout button in the header.
- Protected pages redirect to `/login?next=<path>` and return to the original page after login.
- Admin-only pages return a 403 page for customers.

**Acceptance:** register, login, logout, and redirect work; session survives page reload. Students can later reuse the session via Playwright `storageState`.

## Phase 3 — Catalog and product pages

- `/products`: product grid with filters (category checkboxes, price range slider, "in stock only" toggle), sort dropdown (price, name, rating), and pagination (12 per page). Filters and sort are reflected in the URL query string.
- Product cards show image, name, price, rating, and an "Add to cart" button. Out-of-stock products show a disabled button and an "Out of stock" badge.
- `/products/[slug]`: detail page with image, description, quantity input (min 1, max stock), "Add to cart" button, and reviews list.
- Product list loads via client-side fetch from the API with a loading skeleton, so the chaos delay affects it.

**Acceptance:** filtering, sorting, and pagination all work and are bookmarkable; skeletons appear when a delay is set.

## Phase 4 — Search and dynamic elements

- Header search box with **autocomplete**: debounced (300 ms) suggestions dropdown after 2 characters, keyboard navigation (arrow keys, Enter, Escape), `role="combobox"` / `role="listbox"`.
- `/search?q=`: results page.
- **Toast notifications** (e.g. "Added to cart") that disappear after 3 seconds.
- **Infinite scroll** page `/products/all` that loads 12 more products when the user scrolls to the bottom, with a "Loading more…" indicator and an "End of list" message.
- A "New arrivals" widget on the home page that appears after a random 1–3 second delay.
- A "Live stock" number on the product detail page that refreshes every 5 seconds.

**Acceptance:** each dynamic behavior works and is visible; random timing exists only where described.

## Phase 5 — Cart and checkout (complex UI)

- `/cart`: line items with quantity steppers (+ / −), remove button with a **confirmation modal**, subtotal, and an empty-cart state. Cart is stored server-side for logged-in users.
- `/checkout`: **multi-step wizard** (Shipping → Delivery → Payment → Review) with a progress indicator, Back/Next buttons, and validation per step.
  - Shipping: address form with a **country dropdown** (native `<select>`) and a **custom dropdown** for state/region (div-based, not a native select).
  - Delivery: radio options with prices and a **date picker** (custom component, not native `<input type="date">`), weekends disabled, earliest date is 2 days from today.
  - Payment: **embedded iframe** at `/embed/payment` (see Phase 6).
  - Review: summary table and "Place order" button.
- Order confirmation page `/orders/[id]` with order number.
- `/account/orders`: order history table with status badges.

**Acceptance:** a full purchase works end to end and appears in order history; stock decreases.

## Phase 6 — Frames, tabs, and popups

- `/embed/payment`: a fake card payment form (card number, expiry, CVC) rendered **inside an iframe** in checkout. It sends the result to the parent page with `postMessage`. Card `4242 4242 4242 4242` succeeds; `4000 0000 0000 0002` is declined with an error shown inside the iframe.
- A nested iframe example on `/playground/frames` (iframe inside an iframe).
- Product detail page has a "Size guide" link that opens **in a new tab** (`target="_blank"`) and a "Share" button that opens a **popup window** via `window.open`.
- `/playground/dialogs`: buttons that trigger native `alert`, `confirm`, and `prompt` dialogs and display the result.

**Acceptance:** payment works only through the iframe; new tab, popup, and dialogs behave as described.

## Phase 7 — Playground for advanced UI

Create `/playground` with links to these isolated practice pages:

- `/playground/drag-drop`: a sortable list and two-column board (drag cards between columns) using native HTML5 drag-and-drop.
- `/playground/shadow-dom`: a custom Web Component (`<shoplab-rating>`) with an **open shadow root** containing buttons.
- `/playground/upload`: file upload (single and multiple) showing the uploaded file names and sizes, plus a file download link.
- `/playground/table`: a data table with sorting, filtering, and row checkboxes; some rows have duplicate text so students must use filtered locators.
- `/playground/hover`: menus and tooltips that appear only on hover.
- `/playground/visibility`: elements that are hidden, removed from DOM, disabled, covered by an overlay, or outside the viewport.

**Acceptance:** every playground page works in Chromium, Firefox, and WebKit.

## Phase 8 — REST API

All endpoints under `/api/v1`, JSON only, validated with Zod, with consistent error format `{ "error": { "code": string, "message": string, "details"?: object } }`.

- `POST /auth/login` → returns a bearer token (also accepted in `Authorization: Bearer <token>`), `POST /auth/register`
- `GET /products` (filters, sort, pagination via query), `GET /products/:id`, `POST /products`, `PUT /products/:id`, `DELETE /products/:id` (admin only)
- `GET /categories`
- `GET /cart`, `POST /cart/items`, `PATCH /cart/items/:id`, `DELETE /cart/items/:id`
- `POST /orders`, `GET /orders`, `GET /orders/:id`
- `GET /products/:id/reviews`, `POST /products/:id/reviews`

Use correct status codes: 200, 201, 204, 400 (validation), 401, 403, 404, 409 (e.g. duplicate email, not enough stock), 500 (flaky mode).

Add `/api-docs` page that documents every endpoint (an OpenAPI spec at `/api/v1/openapi.json` rendered as a readable page, without external CDN dependencies).

**Acceptance:** every endpoint works with both cookie and bearer auth and returns the documented status codes.

## Phase 9 — Test support endpoints

These endpoints are enabled **only when `TEST_HOOKS_ENABLED=true`** and return 404 otherwise.

- `POST /api/test/reset` → resets the database to the seed state.
- `POST /api/test/users` → creates a user with given or random data and returns credentials.
- `POST /api/test/products` → creates products with given fields.
- `POST /api/test/login-as` with `{ email }` → sets a session cookie without a password (for fast `storageState` setup).
- `GET /api/test/health` → `{ "status": "ok" }`, used by Playwright's `webServer` and CI to wait for readiness.

**Acceptance:** reset returns the database to a known state in under 2 seconds.

## Phase 10 — Docker, environments, and smoke test

- Multi-stage `Dockerfile` that builds the app, runs migrations and seed on start, and serves on port 3000.
- `docker-compose.yml` with two services: `shoplab` (port 3000, chaos off) and `shoplab-staging` (port 3001, `CHAOS_DELAY_MS=500`), so students can practice multiple environments and `baseURL` configuration.
- A minimal Playwright smoke test in `smoke/` that checks the home page loads and `/api/test/health` returns ok. This is for the instructor only; keep it separate from any student folders.
- A sample GitHub Actions workflow in `docs/ci-example.yml` (not active in `.github/workflows`) showing how to start the container and wait for health. Students will build their own.

**Acceptance:** `docker compose up` starts both environments; the smoke test passes against both.

## Phase 11 — Documentation for the instructor

- `README.md`: setup, scripts, seeded accounts, env vars.
- `docs/LOCATORS.md`: which pages have `data-testid` and which deliberately do not.
- `docs/CHAOS.md`: how to use delay and flaky modes, with suggested exercises.
- `docs/COURSE-MAP.md`: a table mapping each course module to the pages and endpoints that support it:
  - POM Introduction → login, products, cart, checkout
  - Timeouts → chaos delay
  - Playwright Configuration → two environments, test hooks, health endpoint
  - Advanced Locators → playground table, shadow DOM, pages without test IDs
  - Dynamic Elements & Waits → autocomplete, toasts, infinite scroll, new arrivals, live stock
  - Complex UI → checkout wizard, custom dropdown, date picker, drag-drop, upload, hover
  - Multiple Pages & Frames → payment iframe, nested frames, popup, new tab, dialogs
  - Cross-Browser / Multi-tab → playground pages, size guide tab
  - Error Handling & Stability → flaky mode, visibility playground
  - Test Data Management → seed, reset, test user and product endpoints
  - Reporting & Logging → any failing scenario (e.g. declined card)
  - API Automation → `/api/v1` and API docs
  - CI/CD → Docker image, health endpoint, CI example
