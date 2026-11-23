// Deterministic seed: running it any number of times produces the same data.
//   npm run db:seed   -> wipe tables and re-insert seed data
//   npm run db:reset  -> recreate the database from migrations, then seed
// The data and the loading logic live in src/lib/seed (shared with
// POST /api/test/reset).
import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";
import { seedDatabase } from "../src/lib/seed";

const db = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL ?? "file:./dev.db",
  }),
});

db.$transaction((tx) => seedDatabase(tx), { timeout: 30_000 })
  .then((counts) => {
    console.log(
      `Seeded ${counts.categories} categories, ${counts.products} products ` +
        `(${counts.outOfStock} out of stock), ${counts.users} users, ` +
        `${counts.reviews} reviews, ${counts.orders} orders, ` +
        `${counts.wishlistItems} wishlist items.`,
    );
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
