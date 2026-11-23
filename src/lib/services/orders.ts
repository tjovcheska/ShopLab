// Turning a user's cart into an order. Used by the checkout page
// (src/lib/order-actions.ts, pays with an iframe payment token) and by
// POST /api/v1/orders (pays with card details in the request).
import { getCart } from "@/lib/cart";
import { getDeliveryOption } from "@/lib/checkout-options";
import {
  earliestDeliveryDate,
  isAcceptableDeliveryDate,
  toISODate,
} from "@/lib/dates";
import { db } from "@/lib/db";
import { ShopError, fieldErrors } from "@/lib/errors";
import { shippingSchema } from "@/lib/validation/checkout";

/**
 * Called once the order total is known. Throws a ShopError if payment
 * fails; otherwise returns a function to call after the order is saved.
 */
export type Pay = (totalCents: number) => () => void;

export type CreateOrderInput = {
  shippingAddress: unknown;
  delivery?: { method?: string; date?: string };
};

class OutOfStockError extends Error {}

/**
 * Error codes: INVALID_SHIPPING, INVALID_DELIVERY (400), CART_EMPTY,
 * INSUFFICIENT_STOCK (409), plus whatever `pay` throws.
 */
export async function createOrderFromCart(
  userId: number,
  input: CreateOrderInput,
  pay: Pay,
) {
  // Everything is validated here: browser-side checks can be bypassed.
  const shipping = shippingSchema.safeParse(input.shippingAddress);
  if (!shipping.success) {
    throw new ShopError(
      400,
      "INVALID_SHIPPING",
      "Check your shipping address.",
      {
        fields: fieldErrors(shipping.error, "shippingAddress"),
      },
    );
  }

  const today = toISODate(new Date());
  const method = input.delivery?.method ?? "standard";
  const date = input.delivery?.date ?? earliestDeliveryDate(today);
  const deliveryOption = getDeliveryOption(method);
  if (!deliveryOption || !isAcceptableDeliveryDate(date, today)) {
    throw new ShopError(
      400,
      "INVALID_DELIVERY",
      "Choose a valid delivery date.",
      {
        fields: {
          ...(!deliveryOption && {
            "delivery.method": 'Must be "standard" or "express".',
          }),
          ...(!isAcceptableDeliveryDate(date, today) && {
            "delivery.date":
              "Must be a weekday (YYYY-MM-DD) from 2 to 60 days from today.",
          }),
        },
      },
    );
  }

  const cart = await getCart(userId);
  if (cart.items.length === 0) {
    throw new ShopError(409, "CART_EMPTY", "Your cart is empty.");
  }
  const totalCents = cart.subtotalCents + deliveryOption.priceCents;
  const confirmPayment = pay(totalCents);

  try {
    const order = await db.$transaction(async (tx) => {
      // Take each item out of stock. The `stock >= quantity` condition makes
      // this safe even if two customers buy the last item at the same time.
      for (const item of cart.items) {
        const updated = await tx.product.updateMany({
          where: { id: item.product.id, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (updated.count === 0) throw new OutOfStockError(item.product.name);
      }

      const created = await tx.order.create({
        data: {
          userId,
          status: "paid",
          totalCents,
          shippingCents: deliveryOption.priceCents,
          deliveryMethod: deliveryOption.id,
          deliveryDate: new Date(`${date}T00:00:00.000Z`),
          shippingAddress: shipping.data,
          items: {
            create: cart.items.map((item) => ({
              productId: item.product.id,
              quantity: item.quantity,
              priceCents: item.product.priceCents,
            })),
          },
        },
      });

      await tx.cartItem.deleteMany({ where: { userId } });
      return created;
    });

    confirmPayment();
    return order;
  } catch (error) {
    if (error instanceof OutOfStockError) {
      throw new ShopError(
        409,
        "INSUFFICIENT_STOCK",
        `Not enough stock left for ${error.message}. Update your cart and try again. You have not been charged.`,
      );
    }
    throw error;
  }
}

/** An order with its items, if it exists and `user` may see it. */
export async function getVisibleOrder(
  orderId: number,
  user: { id: number; role: string },
) {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true }, orderBy: { id: "asc" } } },
  });
  // Customers only see their own orders; admins see all.
  if (!order || (order.userId !== user.id && user.role !== "admin"))
    return null;
  return order;
}
