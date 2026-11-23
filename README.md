# ShopLab

ShopLab is a small e-commerce web app built **as a target for teaching Playwright test automation**. It is not a real shop. Its features exist so students can practice page objects, locators, waits, complex UI, frames, flaky behavior, test data, API testing, and CI.

See [PLAN.md](PLAN.md) for the full feature plan and [docs/DECISIONS.md](docs/DECISIONS.md) for implementation choices.

## Requirements

- Node.js 22 or newer (current LTS)
- npm

## Setup

```bash
npm install          # installs dependencies and generates the Prisma client
npm run db:reset     # creates the SQLite database (dev.db) and seeds it
npm run dev          # http://localhost:3000
```

A `.env` file is optional. Without one, the app uses `file:./dev.db`. To change settings, copy the example and edit it:

```bash
cp .env.example .env
```

## Scripts

| Script               | What it does                                                     |
| -------------------- | ---------------------------------------------------------------- |
| `npm run dev`        | Start the development server                                     |
| `npm run build`      | Production build                                                 |
| `npm start`          | Serve the production build                                       |
| `npm run lint`       | ESLint                                                           |
| `npm run typecheck`  | Generate Next.js route types and run `tsc`                       |
| `npm run format`     | Format all files with Prettier (`format:check` only checks)      |
| `npm run db:migrate` | Create/apply a migration after editing `prisma/schema.prisma`    |
| `npm run db:seed`    | Wipe all tables and insert the seed data again                   |
| `npm run db:reset`   | Drop the database, re-apply all migrations, regenerate, and seed |

The seed is deterministic: every run produces the same ids, dates, and data.

> **Note for AI coding agents:** Prisma blocks `prisma migrate reset` (and so `npm run db:reset`) when an AI agent runs it, until the user explicitly agrees. `npm run db:seed` is not blocked and resets all data in place.

## Seeded accounts

| Email                | Password       | Role                         |
| -------------------- | -------------- | ---------------------------- |
| `alice@shoplab.test` | `Password123!` | customer (has 2 past orders) |
| `bob@shoplab.test`   | `Password123!` | customer                     |
| `admin@shoplab.test` | `Admin123!`    | admin                        |

The seed also contains 5 categories, 40 products (5 of them out of stock), and 12 reviews.

## Environment variables

All variables are documented in [.env.example](.env.example).

| Variable              | Default         | Purpose                                      |
| --------------------- | --------------- | -------------------------------------------- |
| `DATABASE_URL`        | `file:./dev.db` | SQLite database file                         |
| `SESSION_SECRET`      | —               | Signs the session cookie                     |
| `CHAOS_DELAY_MS`      | `0`             | Default artificial API delay (max 15000)     |
| `CHAOS_FLAKY_PERCENT` | `0`             | Default % of API requests that fail with 500 |
| `TEST_HOOKS_ENABLED`  | `false`         | Enables the `/api/test/*` endpoints          |

## Project layout

```
prisma/
  schema.prisma       data model
  seed.ts             seed script (data lives in seed-data.ts)
  migrations/         SQL migrations
prisma.config.ts      Prisma CLI config (database URL, seed command)
src/
  app/                Next.js App Router pages
  components/         shared UI (header, footer, product card)
  lib/db.ts           Prisma client (better-sqlite3 adapter)
  generated/prisma/   generated Prisma client (gitignored)
public/products/      product images
docs/                 instructor docs (decisions, locators, …)
```
