// Deterministic seed: running it any number of times produces the same data.
//   npm run db:seed   -> wipe tables and re-insert seed data
//   npm run db:reset  -> recreate the database from migrations, then seed
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";
import { categories, pastOrders, products, reviews, users } from "./seed-data";

const db = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL ?? "file:./dev.db",
  }),
});

// A fixed salt keeps password hashes identical between runs. Fine for a
// teaching app with public demo passwords; never do this in a real system.
const FIXED_SALT = "$2b$10$ShopLabSeedSaltShopLa.";

// Products get fixed creation dates, one day apart, counting back from here,
// so "newest" sorting is the same on every run.
const PRODUCTS_BASE_DATE = new Date("2026-11-01T09:00:00.000Z");
const DAY_MS = 24 * 60 * 60 * 1000;

async function wipe() {
  // Delete children before parents to respect foreign keys.
  await db.orderItem.deleteMany();
  await db.order.deleteMany();
  await db.review.deleteMany();
  await db.cartItem.deleteMany();
  await db.product.deleteMany();
  await db.category.deleteMany();
  await db.user.deleteMany();
  // Restart autoincrement ids at 1 so ids are stable too.
  await db.$executeRawUnsafe("DELETE FROM sqlite_sequence");
}

async function main() {
  await wipe();

  const categoryIds = new Map<string, number>();
  for (const c of categories) {
    const created = await db.category.create({
      data: { name: c.name, slug: c.slug },
    });
    categoryIds.set(c.slug, created.id);
  }

  const productIds = new Map<string, { id: number; priceCents: number }>();
  for (const [index, p] of products.entries()) {
    const created = await db.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        priceCents: p.priceCents,
        stock: p.stock,
        rating: p.rating,
        imageUrl: `/products/${p.slug}.svg`,
        categoryId: categoryIds.get(p.category)!,
        createdAt: new Date(PRODUCTS_BASE_DATE.getTime() - index * DAY_MS),
      },
    });
    productIds.set(p.slug, { id: created.id, priceCents: created.priceCents });
  }

  const userIds = new Map<string, number>();
  for (const u of users) {
    const created = await db.user.create({
      data: {
        email: u.email,
        name: u.name,
        role: u.role,
        passwordHash: bcrypt.hashSync(u.password, FIXED_SALT),
        createdAt: new Date("2026-08-01T12:00:00.000Z"),
      },
    });
    userIds.set(u.email, created.id);
  }

  for (const [index, r] of reviews.entries()) {
    await db.review.create({
      data: {
        productId: productIds.get(r.product)!.id,
        userId: userIds.get(r.user)!,
        rating: r.rating,
        comment: r.comment,
        createdAt: new Date(PRODUCTS_BASE_DATE.getTime() + index * DAY_MS),
      },
    });
  }

  for (const o of pastOrders) {
    const items = o.items.map((item) => {
      const product = productIds.get(item.product)!;
      return {
        productId: product.id,
        quantity: item.quantity,
        priceCents: product.priceCents,
      };
    });
    const totalCents = items.reduce(
      (sum, item) => sum + item.priceCents * item.quantity,
      0,
    );
    await db.order.create({
      data: {
        userId: userIds.get(o.user)!,
        status: o.status,
        totalCents,
        shippingAddress: o.shippingAddress,
        deliveryDate: new Date(o.deliveryDate),
        createdAt: new Date(o.createdAt),
        items: { create: items },
      },
    });
  }

  const outOfStock = products.filter((p) => p.stock === 0).length;
  console.log(
    `Seeded ${categories.length} categories, ${products.length} products ` +
      `(${outOfStock} out of stock), ${users.length} users, ` +
      `${reviews.length} reviews, ${pastOrders.length} orders.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
