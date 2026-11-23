// Product reviews.
import { db } from "@/lib/db";
import { ShopError } from "@/lib/errors";

const reviewInclude = { user: { select: { id: true, name: true } } } as const;

async function requireProduct(productId: number) {
  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw new ShopError(404, "NOT_FOUND", `Product ${productId} not found.`);
  }
}

/** Newest first. Throws 404 if the product does not exist. */
export async function listReviews(productId: number) {
  await requireProduct(productId);
  return db.review.findMany({
    where: { productId },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    include: reviewInclude,
  });
}

/** One review per user per product: a second one is 409 ALREADY_REVIEWED. */
export async function createReview(
  userId: number,
  productId: number,
  input: { rating: number; comment: string },
) {
  await requireProduct(productId);
  const existing = await db.review.findFirst({ where: { userId, productId } });
  if (existing) {
    throw new ShopError(
      409,
      "ALREADY_REVIEWED",
      "You have already reviewed this product.",
    );
  }
  return db.review.create({
    data: { userId, productId, ...input },
    include: reviewInclude,
  });
}
