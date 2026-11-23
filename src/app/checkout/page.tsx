import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getCart } from "@/lib/cart";
import { CheckoutWizard } from "./checkout-wizard";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const user = await requireUser("/checkout");
  const cart = await getCart(user.id);
  if (cart.items.length === 0 || cart.hasStockProblem) redirect("/cart");

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <h1 className="text-3xl font-bold">Checkout</h1>
      <CheckoutWizard
        customerName={user.name}
        items={cart.items.map((item) => ({
          id: item.id,
          name: item.product.name,
          quantity: item.quantity,
          priceCents: item.product.priceCents,
          lineTotalCents: item.lineTotalCents,
        }))}
        subtotalCents={cart.subtotalCents}
      />
    </div>
  );
}
