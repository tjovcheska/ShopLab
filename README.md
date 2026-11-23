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

| Script               | What it does                                                                              |
| -------------------- | ----------------------------------------------------------------------------------------- |
| `npm run dev`        | Start the development server                                                              |
| `npm run build`      | Production build                                                                          |
| `npm start`          | Serve the production build                                                                |
| `npm run lint`       | ESLint                                                                                    |
| `npm run typecheck`  | Generate Next.js route types and run `tsc`                                                |
| `npm run format`     | Format all files with Prettier (`format:check` only checks)                               |
| `npm run db:migrate` | Create/apply a migration after editing `prisma/schema.prisma`, then regenerate the client |
| `npm run db:seed`    | Wipe all tables and insert the seed data again                                            |
| `npm run db:reset`   | Drop the database, re-apply all migrations, regenerate, and seed                          |

The seed is deterministic: every run produces the same ids, dates, and data.

> **Note for AI coding agents:** Prisma blocks `prisma migrate reset` (and so `npm run db:reset`) when an AI agent runs it, until the user explicitly agrees. `npm run db:seed` is not blocked and resets all data in place.

## Seeded accounts

| Email                | Password       | Role                         |
| -------------------- | -------------- | ---------------------------- |
| `alice@shoplab.test` | `Password123!` | customer (has 2 past orders) |
| `bob@shoplab.test`   | `Password123!` | customer                     |
| `admin@shoplab.test` | `Admin123!`    | admin                        |

The seed also contains 5 categories, 40 products (5 of them out of stock), and 12 reviews.

## Test payment cards

Checkout payments happen inside an iframe (`/embed/payment`):

| Card number           | Result                         |
| --------------------- | ------------------------------ |
| `4242 4242 4242 4242` | Approved                       |
| `4000 0000 0000 0002` | Declined (error inside iframe) |

Use any future expiry date (MM/YY) and any 3-digit CVC.

## REST API

The JSON API lives at `/api/v1`. It's documented at [`/api-docs`](http://localhost:3000/api-docs), and the OpenAPI document is at `/api/v1/openapi.json`.

```bash
# Log in and use the token
TOKEN=$(curl -s -X POST localhost:3000/api/v1/auth/login \
  -H 'content-type: application/json' \
  -d '{"email":"alice@shoplab.test","password":"Password123!"}' | jq -r .token)
curl -s localhost:3000/api/v1/cart -H "Authorization: Bearer $TOKEN"
```

Every protected endpoint also accepts the website's `shoplab_session` cookie.

## Test support endpoints

Only available when `TEST_HOOKS_ENABLED=true` (otherwise every `/api/test/*` path returns a 404). They ignore chaos settings.

| Endpoint                  | What it does                                                                                        |
| ------------------------- | --------------------------------------------------------------------------------------------------- |
| `GET /api/test/health`    | `{ "status": "ok" }` when the app and database are ready                                            |
| `POST /api/test/reset`    | Restores the seed data (same ids and passwords), usually in a few ms                                |
| `POST /api/test/users`    | Creates a user (`email`, `password`, `name`, `role`, all optional), returns credentials and a token |
| `POST /api/test/products` | Creates one product or an array of products (all fields optional)                                   |
| `POST /api/test/login-as` | `{ "email" }`: sets the session cookie without a password                                           |

```bash
TEST_HOOKS_ENABLED=true npm run dev
curl -X POST localhost:3000/api/test/reset
```

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
  seed.ts             seed script (data and logic: src/lib/seed/)
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

## Troubleshooting

- **Pages reload over and over under `npm run dev`.** This happened three times while building ShopLab. The browser kept getting "[Fast Refresh] rebuilding" and reloading pages, so browser tests failed with "waiting for navigation to finish" while plain HTTP calls kept working. Each time it stopped by itself or after restarting `npm run dev`. The cause wasn't found: it wasn't reproducible on demand, and writing to `dev.db`, editing files, or building first didn't trigger it. It has **never** happened with the production server (`npm run build && npm start`), which has no hot reload. Use that for long or important test runs.
