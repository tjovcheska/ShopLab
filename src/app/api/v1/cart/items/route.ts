// POST /api/v1/cart/items — add a product to the cart (login required).
// 201 when a new line is created, 200 when an existing line grows.
import { apiRoute, json, readJson, requireApiUser } from "@/lib/api/route";
import { addCartItem } from "@/lib/services/cart";
import { cartItemCreateSchema } from "@/lib/validation/api";

export const POST = apiRoute(async (request) => {
  const user = await requireApiUser(request);
  const { productId, quantity } = await readJson(request, cartItemCreateSchema);
  const { item, created } = await addCartItem(user.id, productId, quantity);
  return json({ item }, created ? 201 : 200);
});
