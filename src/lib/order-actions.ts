"use server";
// Placing an order: the final step of the checkout wizard.
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getCart } from "@/lib/cart";
import { getDeliveryOption } from "@/lib/checkout-options";
import { isAcceptableDeliveryDate, toISODate } from "@/lib/dates";
import { db } from "@/lib/db";
import { checkPaymentToken, markPaymentUsed } from "@/lib/payment";
import {
  shippingSchema,
  type DeliveryInput,
  type ShippingInput,
} from "@/lib/validation/checkout";

/** Only returned on failure; on success the action redirects. */
export type PlaceOrderResult = {
  ok: false;
  message: string;
  /** Which part of checkout the customer has to go back to. */
  fix: "cart" | "shipping" | "delivery" | "payment";
};

class OutOfStockError extends Error {}

export async function placeOrder(input: {
  shipping: ShippingInput;
  delivery: DeliveryInput;
  paymentToken: string;
}): Promise<PlaceOrderResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, fix: "cart", message: "Please log in again." };
  }

  // Everything is validated again: the browser's checks can be bypassed.
  const shipping = shippingSchema.safeParse(input.shipping);
  if (!shipping.success) {
    return {
      ok: false,
      fix: "shipping",
      message: "Check your shipping address.",
    };
  }
  const deliveryOption = getDeliveryOption(input.delivery.method);
  if (
    !deliveryOption ||
    !isAcceptableDeliveryDate(input.delivery.date, toISODate(new Date()))
  ) {
    return {
      ok: false,
      fix: "delivery",
      message: "Choose a valid delivery date.",
    };
  }

  const cart = await getCart(user.id);
  if (cart.items.length === 0) {
    return { ok: false, fix: "cart", message: "Your cart is empty." };
  }
  const totalCents = cart.subtotalCents + deliveryOption.priceCents;

  const payment = checkPaymentToken(input.paymentToken, user.id, totalCents);
  if ("error" in payment) {
    return { ok: false, fix: "payment", message: payment.error };
  }

  let orderId: number;
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
          userId: user.id,
          status: "paid",
          totalCents,
          shippingCents: deliveryOption.priceCents,
          deliveryMethod: deliveryOption.id,
          deliveryDate: new Date(`${input.delivery.date}T00:00:00.000Z`),
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

      await tx.cartItem.deleteMany({ where: { userId: user.id } });
      return created;
    });

    markPaymentUsed(payment.paymentId);
    orderId = order.id;
  } catch (error) {
    if (error instanceof OutOfStockError) {
      return {
        ok: false,
        fix: "cart",
        message: `Not enough stock left for ${error.message}. Update your cart and try again. You have not been charged.`,
      };
    }
    throw error;
  }

  // Layouts (like the header with its cart count) are not re-rendered on a
  // normal navigation. Marking them stale makes the redirect below render
  // the header again, so the cart count drops to 0 straight away.
  revalidatePath("/", "layout");
  redirect(`/orders/${orderId}?placed=1`);
}
