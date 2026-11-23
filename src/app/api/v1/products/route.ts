// GET  /api/v1/products — list with filters, sort, pagination (public).
// POST /api/v1/products — create a product (admin only).
// Query parameters are documented in src/lib/validation/products.ts.
import { apiRoute, json, readJson, requireApiAdmin } from "@/lib/api/route";
import { validationFailure } from "@/lib/errors";
import { listProducts } from "@/lib/products";
import { createProduct } from "@/lib/services/products";
import { productInputSchema } from "@/lib/validation/api";
import {
  productQuerySchema,
  searchParamsToQueryInput,
} from "@/lib/validation/products";

export const GET = apiRoute(async (request) => {
  const parsed = productQuerySchema.safeParse(
    searchParamsToQueryInput(request.nextUrl.searchParams),
  );
  if (!parsed.success) throw validationFailure(parsed.error);
  return json(await listProducts(parsed.data));
});

export const POST = apiRoute(async (request) => {
  await requireApiAdmin(request);
  const input = await readJson(request, productInputSchema);
  return json({ product: await createProduct(input) }, 201);
});
