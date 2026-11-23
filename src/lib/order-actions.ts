"use server";
// Placing an order: the final step of the checkout wizard. The rules live in
// src/lib/services/orders.ts, shared with POST /api/v1/orders.
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ShopError } from "@/lib/errors";
import { checkPaymentToken, markPaymentUsed } from "@/lib/payment";
import { cancelOrder, createOrderFromCart } from "@/lib/services/orders";
import type { DeliveryInput, ShippingInput } from "@/lib/validation/checkout";

/** Only returned on failure; on success the action redirects. */
export type PlaceOrderResult = {
  ok: false;
  message: string;
  /** Which part of checkout the customer has to go back to. */
  fix: "cart" | "shipping" | "delivery" | "payment";
};

const FIX_FOR_CODE: Record<string, PlaceOrderResult["fix"]> = {
  INVALID_SHIPPING: "shipping",
  INVALID_DELIVERY: "delivery",
  PAYMENT_INVALID: "payment",
};

export async function placeOrder(input: {
  shipping: ShippingInput;
  delivery: DeliveryInput;
  paymentToken: string;
}): Promise<PlaceOrderResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, fix: "cart", message: "Please log in again." };
  }

  let orderId: number;
  try {
    const order = await createOrderFromCart(
      user.id,
      { shippingAddress: input.shipping, delivery: input.delivery },
      // Pay with the token the payment iframe sent to the checkout page.
      (totalCents) => {
        const payment = checkPaymentToken(
          input.paymentToken,
          user.id,
          totalCents,
        );
        if ("error" in payment) {
          throw new ShopError(400, "PAYMENT_INVALID", payment.error);
        }
        return () => markPaymentUsed(payment.paymentId);
      },
    );
    orderId = order.id;
  } catch (error) {
    if (error instanceof ShopError) {
      return {
        ok: false,
        fix: FIX_FOR_CODE[error.code] ?? "cart",
        message: error.message,
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

export type CancelOrderResult = { ok: boolean; message: string };

/** "Cancel order" on the order page and in the order history. */
export async function cancelOrderAction(
  orderId: number,
): Promise<CancelOrderResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Please log in again." };
  try {
    await cancelOrder(orderId, user.id);
  } catch (error) {
    if (error instanceof ShopError)
      return { ok: false, message: error.message };
    throw error;
  }
  revalidatePath("/account/orders");
  revalidatePath(`/orders/${orderId}`);
  return { ok: true, message: "Your order has been cancelled." };
}
