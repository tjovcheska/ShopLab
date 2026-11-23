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
