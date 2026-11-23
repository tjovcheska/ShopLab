// Database queries for the product catalog.
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import type {
  ProductListResponse,
  ProductQuery,
  SortValue,
} from "@/lib/validation/products";

// Every sort ends with name and id so the order is always the same.
const ORDER_BY: Record<SortValue, Prisma.ProductOrderByWithRelationInput[]> = {
  "name-asc": [{ name: "asc" }, { id: "asc" }],
  "name-desc": [{ name: "desc" }, { id: "asc" }],
  "price-asc": [{ priceCents: "asc" }, { name: "asc" }, { id: "asc" }],
  "price-desc": [{ priceCents: "desc" }, { name: "asc" }, { id: "asc" }],
  "rating-desc": [{ rating: "desc" }, { name: "asc" }, { id: "asc" }],
  newest: [{ createdAt: "desc" }, { id: "desc" }],
};

export const productListSelect = {
  id: true,
  name: true,
  slug: true,
  priceCents: true,
  stock: true,
  rating: true,
  imageUrl: true,
  category: { select: { id: true, name: true, slug: true } },
} satisfies Prisma.ProductSelect;

export async function listProducts(
  query: ProductQuery,
): Promise<ProductListResponse> {
  const where: Prisma.ProductWhereInput = {};
  // SQLite's LIKE (used by `contains`) ignores case for ASCII letters.
  if (query.q) where.name = { contains: query.q };
  if (query.category.length > 0) {
    where.category = { slug: { in: query.category } };
  }
  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    where.priceCents = {
      ...(query.minPrice !== undefined && { gte: query.minPrice * 100 }),
      ...(query.maxPrice !== undefined && { lte: query.maxPrice * 100 }),
    };
  }
  if (query.inStock) where.stock = { gt: 0 };

  const [total, products] = await Promise.all([
    db.product.count({ where }),
    db.product.findMany({
      where,
      select: productListSelect,
      orderBy: ORDER_BY[query.sort],
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
  ]);

  return {
    products,
    pagination: {
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
    },
  };
}

/** Highest product price, rounded up to a whole $10 (for the price slider). */
export async function getMaxPriceDollars(): Promise<number> {
  const result = await db.product.aggregate({ _max: { priceCents: true } });
  const cents = result._max.priceCents ?? 0;
  return Math.ceil(cents / 1000) * 10;
}

export const productDetailSelect = {
  ...productListSelect,
  description: true,
  createdAt: true,
} satisfies Prisma.ProductSelect;

export function getProductById(id: number) {
  return db.product.findUnique({ where: { id }, select: productDetailSelect });
}
