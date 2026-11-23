// Creating, replacing, and deleting products (admin API).
import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { ShopError } from "@/lib/errors";
import { getProductById } from "@/lib/products";
import type { ProductInput } from "@/lib/validation/api";

/** "Mug & Saucer (Blue)" → "mug-saucer-blue" */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

async function checkCategory(categoryId: number) {
  const category = await db.category.findUnique({ where: { id: categoryId } });
  if (!category) {
    throw new ShopError(400, "VALIDATION_ERROR", "Request validation failed.", {
      fields: { categoryId: "Category not found." },
    });
  }
}

async function checkSlugFree(slug: string, exceptId?: number) {
  const other = await db.product.findUnique({ where: { slug } });
  if (other && other.id !== exceptId) {
    throw new ShopError(
      409,
      "SLUG_TAKEN",
      `Another product already uses the slug "${slug}".`,
    );
  }
}

async function requireProduct(id: number) {
  const product = await db.product.findUnique({ where: { id } });
  if (!product)
    throw new ShopError(404, "NOT_FOUND", `Product ${id} not found.`);
  return product;
}

export async function createProduct(input: ProductInput) {
  const slug = input.slug ?? slugify(input.name);
  await checkCategory(input.categoryId);
  await checkSlugFree(slug);
  const created = await db.product.create({ data: { ...input, slug } });
  return (await getProductById(created.id))!;
}

/** PUT semantics: every field is replaced (omitted optional fields reset). */
export async function replaceProduct(id: number, input: ProductInput) {
  await requireProduct(id);
  const slug = input.slug ?? slugify(input.name);
  await checkCategory(input.categoryId);
  await checkSlugFree(slug, id);
  await db.product.update({ where: { id }, data: { ...input, slug } });
  return (await getProductById(id))!;
}

/**
 * Deletes a product (its reviews and cart lines go with it).
 * Throws 409 if it appears in any order, since order history must stay intact.
 */
export async function deleteProduct(id: number) {
  await requireProduct(id);
  try {
    await db.product.delete({ where: { id } });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003" // foreign key constraint (an OrderItem uses it)
    ) {
      throw new ShopError(
        409,
        "PRODUCT_HAS_ORDERS",
        "This product appears in orders and cannot be deleted. Set its stock to 0 instead.",
      );
    }
    throw error;
  }
}
