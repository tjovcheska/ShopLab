import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { CartLineItem } from "./cart-line-item";

export const metadata: Metadata = { title: "Your cart" };

// The cart is stored in the database for logged-in users only.
export default async function CartPage() {
  const user = await requireUser("/cart");
  const cart = await getCart(user.id);

  if (cart.items.length === 0) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-3xl font-bold">Your cart</h1>
        <p className="mt-4 text-gray-600" data-testid="empty-cart">
          Your cart is empty.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-md bg-indigo-600 px-5 py-2 font-medium text-white hover:bg-indigo-700"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Your cart</h1>
      <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
        <ul aria-label="Cart items" className="flex flex-col gap-4">
          {cart.items.map((item) => (
            <CartLineItem key={item.id} item={item} />
          ))}
        </ul>

        <section
          aria-labelledby="summary-heading"
          className="h-fit rounded-lg border border-gray-200 bg-white p-4"
        >
          <h2 id="summary-heading" className="mb-4 text-lg font-semibold">
            Order summary
          </h2>
          <dl className="flex justify-between text-lg">
            <dt>Subtotal ({cart.itemCount} items)</dt>
            <dd className="font-bold" data-testid="cart-subtotal">
              {formatPrice(cart.subtotalCents)}
            </dd>
          </dl>
          <p className="mt-1 text-sm text-gray-500">
            Shipping is chosen at checkout.
          </p>
          {cart.hasStockProblem ? (
            <p role="alert" className="mt-4 text-sm text-red-700">
              Some items are no longer available in the quantity you chose.
              Lower the quantity to continue.
            </p>
          ) : (
            <Link
              href="/checkout"
              className="mt-4 block rounded-md bg-indigo-600 px-4 py-2 text-center font-medium text-white hover:bg-indigo-700"
            >
              Proceed to checkout
            </Link>
          )}
        </section>
      </div>
    </div>
  );
}
