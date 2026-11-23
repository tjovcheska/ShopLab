// POST /api/test/products — create one or more products with the given
// fields; anything left out gets a sensible default. Only when
// TEST_HOOKS_ENABLED=true.
//
// Body: one product object, or an array of up to 50. Fields (all optional):
//   name, slug, description, priceCents, stock, rating, imageUrl,
//   categoryId or categorySlug (default: the first category)
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { json, readOptionalJson, testRoute } from "@/lib/api/route";
import { db } from "@/lib/db";
import { ShopError } from "@/lib/errors";
import { createProduct } from "@/lib/services/products";
import { productInputSchema } from "@/lib/validation/api";

const testProductSchema = productInputSchema.partial().extend({
  categorySlug: z.string().optional(),
});
const bodySchema = z.union([
  testProductSchema,
  z.array(testProductSchema).min(1).max(50),
]);

async function resolveCategoryId(categoryId?: number, categorySlug?: string) {
  if (categoryId) return categoryId;
  const category = categorySlug
    ? await db.category.findUnique({ where: { slug: categorySlug } })
    : await db.category.findFirst({ orderBy: { id: "asc" } });
  if (!category) {
    throw new ShopError(400, "VALIDATION_ERROR", "Request validation failed.", {
      fields: { categorySlug: "Category not found." },
    });
  }
  return category.id;
}

export const POST = testRoute(async (request) => {
  const body = await readOptionalJson(request, bodySchema);
  const inputs = Array.isArray(body) ? body : [body];

  // Created one by one; on an error (e.g. 409 SLUG_TAKEN) the products
  // before it stay created.
  const products = [];
  for (const input of inputs) {
    const random = randomBytes(3).toString("hex");
    const { categorySlug, ...fields } = input;
    products.push(
      await createProduct({
        name: `Test product ${random}`,
        description: "Created by POST /api/test/products.",
        priceCents: 1000,
        stock: 10,
        rating: 3,
        imageUrl: "/products/placeholder.svg",
        ...fields,
        categoryId: await resolveCategoryId(input.categoryId, categorySlug),
      }),
    );
  }
  return json({ products }, 201);
});
