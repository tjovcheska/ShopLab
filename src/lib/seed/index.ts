// Deterministic seed data loader: every run produces exactly the same data
// (same ids, dates, and password hashes). Used by `npm run db:seed`
// (prisma/seed.ts) and by POST /api/test/reset.
//
// Relative imports only, so the tsx-run seed script can load this file too.
import bcrypt from "bcryptjs";
import type { Prisma } from "../../generated/prisma/client";
import { DELIVERY_OPTIONS } from "../checkout-options";
import {
  categories,
  pastOrders,
  products,
  reviews,
  users,
  wishlists,
} from "./data";

// A fixed salt keeps password hashes identical between runs. Fine for a
// teaching app with public demo passwords; never do this in a real system.
const FIXED_SALT = "$2b$10$ShopLabSeedSaltShopLa.";

// Products get fixed creation dates, one day apart, counting back from here,
// so "newest" sorting is the same on every run.
const PRODUCTS_BASE_DATE = new Date("2026-11-01T09:00:00.000Z");
const DAY_MS = 24 * 60 * 60 * 1000;

// bcrypt is slow on purpose; remember hashes so repeated resets stay fast.
const hashCache = new Map<string, string>();
function hashPassword(password: string) {
  let hash = hashCache.get(password);
  if (!hash) {
    hash = bcrypt.hashSync(password, FIXED_SALT);
    hashCache.set(password, hash);
  }
  return hash;
}

type Tx = Prisma.TransactionClient;

async function wipe(tx: Tx) {
  // Delete children before parents to respect foreign keys.
  await tx.wishlistItem.deleteMany();
  await tx.reviewPhoto.deleteMany();
  await tx.orderItem.deleteMany();
  await tx.order.deleteMany();
  await tx.review.deleteMany();
  await tx.cartItem.deleteMany();
  await tx.product.deleteMany();
  await tx.category.deleteMany();
  await tx.user.deleteMany();
  // Restart autoincrement ids at 1 so ids are stable too.
  await tx.$executeRawUnsafe("DELETE FROM sqlite_sequence");
}

export type SeedCounts = {
  categories: number;
  products: number;
  outOfStock: number;
  users: number;
  reviews: number;
  orders: number;
  wishlistItems: number;
};

/**
 * Deletes ALL data and inserts the seed data. Run it inside a transaction
 * (db.$transaction(tx => seedDatabase(tx))) so it is all-or-nothing and fast.
 */
export async function seedDatabase(tx: Tx): Promise<SeedCounts> {
  await wipe(tx);

  const categoryIds = new Map<string, number>();
  for (const c of categories) {
    const created = await tx.category.create({
      data: { name: c.name, slug: c.slug },
    });
    categoryIds.set(c.slug, created.id);
  }

  const productIds = new Map<string, { id: number; priceCents: number }>();
  for (const [index, p] of products.entries()) {
    const created = await tx.product.create({
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
    const created = await tx.user.create({
      data: {
        email: u.email,
        name: u.name,
        role: u.role,
        passwordHash: hashPassword(u.password),
        createdAt: new Date("2026-08-01T12:00:00.000Z"),
      },
    });
    userIds.set(u.email, created.id);
  }

  for (const [index, r] of reviews.entries()) {
    await tx.review.create({
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
    const itemsCents = items.reduce(
      (sum, item) => sum + item.priceCents * item.quantity,
      0,
    );
    const shippingCents = DELIVERY_OPTIONS.find(
      (option) => option.id === o.deliveryMethod,
    )!.priceCents;
    await tx.order.create({
      data: {
        userId: userIds.get(o.user)!,
        status: o.status,
        totalCents: itemsCents + shippingCents,
        shippingCents,
        deliveryMethod: o.deliveryMethod,
        shippingAddress: o.shippingAddress,
        deliveryDate: new Date(o.deliveryDate),
        createdAt: new Date(o.createdAt),
        items: { create: items },
      },
    });
  }

  for (const w of wishlists) {
    for (const [position, slug] of w.products.entries()) {
      await tx.wishlistItem.create({
        data: {
          userId: userIds.get(w.user)!,
          productId: productIds.get(slug)!.id,
          position,
          createdAt: new Date("2026-11-15T12:00:00.000Z"),
        },
      });
    }
  }

  return {
    categories: categories.length,
    products: products.length,
    outOfStock: products.filter((p) => p.stock === 0).length,
    users: users.length,
    reviews: reviews.length,
    orders: pastOrders.length,
    wishlistItems: wishlists.reduce((n, w) => n + w.products.length, 0),
  };
}
