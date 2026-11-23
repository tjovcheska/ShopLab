# Decisions

Choices made where PLAN.md was ambiguous or where the toolchain forced a choice. Newest last.

## Phase 1 — Project setup

- **Prisma 7.10.1, not npm `latest`.** When this was built, npm's `latest` tag for Prisma pointed at a release candidate (8.0.0-rc). The plan asks for stable tools, so we pinned the newest stable release. Prisma 7 requires a driver adapter (`@prisma/adapter-better-sqlite3`) and keeps the database URL in `prisma.config.ts` rather than in `schema.prisma`. The generated client is written to `src/generated/prisma`, which is gitignored and recreated by `postinstall`.
- **Next.js Cache Components turned off.** Next 16.4 turns on `cacheComponents` by default, and it has two effects we don't want. First, every database read needs `"use cache"` or a `<Suspense>` boundary. Second, visited routes stay in the DOM as hidden `<Activity>` trees. That would give Playwright locators duplicate, invisible matches from earlier pages, which is confusing for students. With it off, pages call `connection()` (or read cookies) and render on every request.
- **No Google Fonts.** `next/font/google` downloads fonts at build time, which fails in offline Docker or CI builds, so pages use the system font stack.
- **No `.env` needed.** The acceptance command (`npm install && npm run db:reset && npm run dev`) has no step that copies `.env.example`. So `DATABASE_URL` falls back to `file:./dev.db` in both `prisma.config.ts` and `src/lib/db.ts`.
- **Deterministic seed details.** Ids restart at 1 on every seed, products have fixed `createdAt` dates one day apart, and passwords are hashed with a fixed bcrypt salt, so even the hashes match between runs. A fixed salt is only acceptable because the demo passwords are public.
- **Product images.** These are generated SVG placeholders in `public/products/<slug>.svg`, created by `scripts/generate-product-images.ts` and committed to the repo.
- **Enums.** `User.role` and `Order.status` are Prisma enums. SQLite supports them in Prisma 6.2 and later.
- **Prices.** Shown in USD (`$12.34`).
- **Header placeholders.** In Phase 1 the cart count is always 0 and the header always shows "Log in". Phase 2 connects both to the session.

## Phase 2 — Authentication

- **Stateless signed sessions.** The `shoplab_session` cookie holds `base64url({ uid, exp }).HMAC-SHA256`, signed with `SESSION_SECRET`. The server keeps no session table, so a database reset doesn't log anyone out: seeded users keep the same ids. Sessions last 7 days. In Phase 8 the same token can be sent as a bearer token. Without `SESSION_SECRET`, a fixed development secret is used.
- **Cookie flags.** `httpOnly`, `sameSite=lax`, `path=/`, and **not** `secure`. ShopLab runs over plain http on localhost, in Docker, and in CI. Browsers don't store secure cookies on a plain-http host such as `http://shoplab:3000` inside docker-compose.
- **Real 403 status.** Admin pages call `forbidden()`, which needs Next's experimental `authInterrupts` flag. The alternative was rendering a "forbidden" message with status 200, which would make `response.status()` assertions meaningless. `forbidden.tsx` can't set its own `<title>`, so the admin page's `generateMetadata` returns "Access denied" for non-admins.
- **Anonymous visitors on admin pages** are sent to `/login?next=…`, like any protected page. Only logged-in customers get the 403.
- **Admin page.** No admin pages existed yet, so `/admin` was added as a small dashboard of counts to demonstrate the 403 behavior.
- **Register asks for a full name** as well as email and passwords, because `User.name` is required.
- **Password rule.** At least 8 characters and at least one digit. Shared zod rules in `src/lib/validation/auth.ts` run in the browser and again in the server action. Client checks run on submit, then live while the user fixes errors. Both forms use `noValidate`, so the browser's native validation bubbles never appear.
- **Login errors.** Unknown email and wrong password both show "Invalid email or password."
- **Forms are submitted manually** (`onSubmit` → `startTransition(formAction)`) rather than relying only on `<form action>`. React resets a form after its action runs, which would clear typed values when the server returns errors. The `action` attribute stays, so forms still work with JavaScript disabled.
- **Safe `next` redirects.** `next` must be a same-site path (`/…`, not `//…` or a full URL); anything else falls back to `/account`. Logged-in users who open `/login` or `/register` are redirected straight on.

## Phase 3 — Catalog and product pages

- **Chaos controls built here.** PLAN.md lists chaos as a global convention without assigning it to a phase, and Phase 3's acceptance ("skeletons appear when a delay is set") needs it. So this phase adds the shared helper (`withChaos()` in `src/lib/chaos.ts`), the `/chaos` panel, and the yellow banner. Priority is: `?delay` on the URL, then the cookie, then the env var. Chaos cookies are not `httpOnly`, so tests can set them with `context.addCookies()`.
- **`?delay` on a page reaches the API through `apiFetch()`** (`src/lib/api-client.ts`), which copies the page's `?delay` onto every `/api/...` call. Only API responses are delayed. Server-rendered pages (home, product detail) are not.
- **The product list API is `GET /api/v1/products`,** the Phase 8 endpoint, built now so it isn't written twice. It uses Zod validation and the standard error format (400 `VALIDATION_ERROR` with per-field details).
- **Query parameters are the same on the page and the API:** repeated `category=<slug>`, `minPrice`/`maxPrice` in whole dollars (inclusive), `inStock=true`, `sort` (`name-asc` default, `name-desc`, `price-asc`, `price-desc`, `rating-desc`), `page`, and on the API only `pageSize` (1–100, default 12). Every sort falls back to name and id, so order is deterministic.
- **Filter UX.** Every filter change pushes a new URL (so Back works) and resets to page 1. Controls use `useOptimistic`, so a checkbox shows as checked as soon as it's clicked, even with navigation still in flight. Without this, Playwright's `check()` failed with "did not change its state".
- **Price range.** Two native range sliders, `$0` up to the most expensive product rounded up to $10, in steps of $5. The URL updates **300 ms after the last change** (debounced), so dragging doesn't fire a request for every step.
- **The "In stock only" toggle** is a checkbox with `role="switch"`.
- **Add to cart works now, but only when logged in.** Anonymous users go to `/login?next=<current page>`. It's a minimal server action that checks stock against what is already in the cart, then refreshes the header count. Phase 5 builds the cart page on top of it. Feedback is an inline `role="status"` or `role="alert"` message under the button. Phase 4 adds toasts.
- **Pagination links** are real `<a href>` links named "Page N" (with `aria-current="page"` on the current one), plus Previous and Next. On the first and last page, Previous and Next are non-link text with `aria-disabled`.
