// GET  /api/v1/orders — the caller's orders, newest first (login required).
// POST /api/v1/orders — order everything in the cart (login required).
//
// The web checkout pays only through its iframe. API clients have no
// iframe, so they send the test card details in the request instead
// (4242 4242 4242 4242 approves, 4000 0000 0000 0002 is declined; the 3-D
// Secure card 4000 0027 6000 3184 is declined here: it needs the website).
import { apiRoute, json, readJson, requireApiUser } from "@/lib/api/route";
import { serializeOrder } from "@/lib/api/serialize";
import { db } from "@/lib/db";
import { ShopError } from "@/lib/errors";
import { authorizeCard } from "@/lib/payment";
import { createOrderFromCart, getVisibleOrder } from "@/lib/services/orders";
import { orderCreateSchema } from "@/lib/validation/api";

export const GET = apiRoute(async (request) => {
  const user = await requireApiUser(request);
  const orders = await db.order.findMany({
    where: { userId: user.id },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    include: { items: { include: { product: true }, orderBy: { id: "asc" } } },
  });
  return json({ orders: orders.map(serializeOrder) });
});

export const POST = apiRoute(async (request) => {
  const user = await requireApiUser(request);
  const { shippingAddress, delivery, card } = await readJson(
    request,
    orderCreateSchema,
  );

  const created = await createOrderFromCart(
    user.id,
    { shippingAddress, delivery },
    (totalCents) => {
      const result = authorizeCard(user.id, card.cardNumber, totalCents);
      if (result.status === "declined") {
        throw new ShopError(400, "PAYMENT_DECLINED", result.message);
      }
      if (result.status !== "approved") {
        // 3-D Secure needs the bank-verification iframe on the website.
        throw new ShopError(
          400,
          "PAYMENT_DECLINED",
          "This card needs bank verification (3-D Secure), which only the website supports.",
        );
      }
      return () => {}; // nothing to confirm for a direct card payment
    },
  );

  const order = await getVisibleOrder(created.id, user);
  return json({ order: serializeOrder(order!) }, 201);
});
