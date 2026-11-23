// GET /api/v1/cart — the caller's cart (login required).
import { apiRoute, json, requireApiUser } from "@/lib/api/route";
import { serializeCart } from "@/lib/api/serialize";
import { getCart } from "@/lib/cart";

export const GET = apiRoute(async (request) => {
  const user = await requireApiUser(request);
  return json(serializeCart(await getCart(user.id)));
});
