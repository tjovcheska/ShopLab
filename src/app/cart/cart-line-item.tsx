"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useOptimistic, useState, useTransition } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type { CartLine } from "@/lib/cart";
import { removeCartItem, updateCartItemQuantity } from "@/lib/cart-actions";
import { formatPrice } from "@/lib/format";

// Each line is a <li> containing an <article> named by the product, so tests
// can scope to one line: getByRole('article', { name: 'Yoga Mat' }).
export function CartLineItem({ item }: { item: CartLine }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  // Show the new quantity immediately; the server confirms it a moment later.
  const [quantity, setOptimisticQuantity] = useOptimistic(item.quantity);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const { product } = item;
  const headingId = `cart-item-${item.id}`;

  function changeQuantity(next: number) {
    setError(null);
    startTransition(async () => {
      setOptimisticQuantity(next);
      const result = await updateCartItemQuantity(item.id, next);
      if (!result.ok) setError(result.message);
      router.refresh(); // updates subtotal and the header cart count
    });
  }

  function remove() {
    setConfirming(false);
    startTransition(async () => {
      await removeCartItem(item.id);
      router.refresh();
    });
  }

  return (
    <li>
      <article
        aria-labelledby={headingId}
        className="flex gap-4 rounded-lg border border-gray-200 bg-white p-4"
      >
        <Image
          src={product.imageUrl}
          alt=""
          width={96}
          height={72}
          className="h-18 w-24 rounded object-cover"
        />
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex flex-wrap justify-between gap-2">
            <h2 id={headingId} className="font-semibold">
              <Link
                href={`/products/${product.slug}`}
                className="hover:text-indigo-700"
              >
                {product.name}
              </Link>
            </h2>
            <p className="font-semibold" data-testid="line-total">
              {formatPrice(product.priceCents * quantity)}
            </p>
          </div>
          <p className="text-sm text-gray-600">
            {formatPrice(product.priceCents)} each
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <div
              role="group"
              aria-label={`Quantity of ${product.name}`}
              className="flex items-center rounded-md border border-gray-300"
            >
              <button
                type="button"
                aria-label="Decrease quantity"
                disabled={pending || quantity <= 1}
                onClick={() => changeQuantity(quantity - 1)}
                className="px-3 py-1 text-lg disabled:text-gray-300"
              >
                −
              </button>
              <span
                aria-live="polite"
                data-testid="item-quantity"
                className="min-w-8 text-center"
              >
                {quantity}
              </span>
              <button
                type="button"
                aria-label="Increase quantity"
                disabled={pending || quantity >= product.stock}
                onClick={() => changeQuantity(quantity + 1)}
                className="px-3 py-1 text-lg disabled:text-gray-300"
              >
                +
              </button>
            </div>
            <button
              type="button"
              onClick={() => setConfirming(true)}
              disabled={pending}
              className="text-sm text-red-700 underline hover:text-red-900"
            >
              Remove
            </button>
          </div>

          {quantity > product.stock && (
            <p role="alert" className="text-sm text-red-700">
              Only {product.stock} in stock.
            </p>
          )}
          {error && (
            <p role="alert" className="text-sm text-red-700">
              {error}
            </p>
          )}
        </div>
      </article>

      <ConfirmDialog
        open={confirming}
        title="Remove item?"
        confirmLabel="Remove"
        onConfirm={remove}
        onCancel={() => setConfirming(false)}
      >
        Remove <strong>{product.name}</strong> from your cart?
      </ConfirmDialog>
    </li>
  );
}
