// GET    /api/v1/products/:id — one product (public; used by "Live stock").
// PUT    /api/v1/products/:id — replace a product (admin only).
// DELETE /api/v1/products/:id — delete a product (admin only).
import {
  apiRoute,
  json,
  noContent,
  parseId,
  readJson,
  requireApiAdmin,
} from "@/lib/api/route";
import { ShopError } from "@/lib/errors";
import { getProductById } from "@/lib/products";
import { deleteProduct, replaceProduct } from "@/lib/services/products";
import { productInputSchema } from "@/lib/validation/api";

type Context = RouteContext<"/api/v1/products/[id]">;

export const GET = apiRoute<Context>(async (_request, context) => {
  const id = parseId((await context.params).id);
  const product = await getProductById(id);
  if (!product)
    throw new ShopError(404, "NOT_FOUND", `Product ${id} not found.`);
  return json({ product });
});

export const PUT = apiRoute<Context>(async (request, context) => {
  await requireApiAdmin(request);
  const id = parseId((await context.params).id);
  const input = await readJson(request, productInputSchema);
  return json({ product: await replaceProduct(id, input) });
});

export const DELETE = apiRoute<Context>(async (request, context) => {
  await requireApiAdmin(request);
  const id = parseId((await context.params).id);
  await deleteProduct(id);
  return noContent();
});
