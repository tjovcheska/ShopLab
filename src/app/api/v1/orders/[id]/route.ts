// GET /api/v1/orders/:id — one order (login required; your own orders only,
// admins can see any). Someone else's order is 404, not 403, so order ids
// cannot be probed.
import { apiRoute, json, parseId, requireApiUser } from "@/lib/api/route";
import { serializeOrder } from "@/lib/api/serialize";
import { ShopError } from "@/lib/errors";
import { getVisibleOrder } from "@/lib/services/orders";

type Context = RouteContext<"/api/v1/orders/[id]">;

export const GET = apiRoute<Context>(async (request, context) => {
  const user = await requireApiUser(request);
  const id = parseId((await context.params).id);
  const order = await getVisibleOrder(id, user);
  if (!order) throw new ShopError(404, "NOT_FOUND", `Order ${id} not found.`);
  return json({ order: serializeOrder(order) });
});
