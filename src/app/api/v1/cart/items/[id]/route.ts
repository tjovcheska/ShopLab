// PATCH  /api/v1/cart/items/:id — change a line's quantity (login required).
// DELETE /api/v1/cart/items/:id — remove a line (login required).
// :id is the cart item id (from GET /cart), not the product id.
import {
  apiRoute,
  json,
  noContent,
  parseId,
  readJson,
  requireApiUser,
} from "@/lib/api/route";
import { removeCartItem, updateCartItem } from "@/lib/services/cart";
import { cartItemUpdateSchema } from "@/lib/validation/api";

type Context = RouteContext<"/api/v1/cart/items/[id]">;

export const PATCH = apiRoute<Context>(async (request, context) => {
  const user = await requireApiUser(request);
  const id = parseId((await context.params).id);
  const { quantity } = await readJson(request, cartItemUpdateSchema);
  return json({ item: await updateCartItem(user.id, id, quantity) });
});

export const DELETE = apiRoute<Context>(async (request, context) => {
  const user = await requireApiUser(request);
  const id = parseId((await context.params).id);
  await removeCartItem(user.id, id);
  return noContent();
});
