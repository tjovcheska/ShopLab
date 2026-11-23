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
