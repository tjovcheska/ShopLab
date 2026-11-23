"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { useToast } from "@/components/toast";
import { addToCart } from "@/lib/cart-actions";
import { useAdoptDomValue } from "@/lib/use-adopt-dom-value";

type AddToCartProps = {
  productId: number;
  stock: number;
  /** Show a quantity input (product detail page) or always add 1 (cards). */
  withQuantity?: boolean;
};

export function AddToCart({
  productId,
  stock,
  withQuantity = false,
}: AddToCartProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState("1");
  const quantityRef = useRef<HTMLInputElement>(null);
  useAdoptDomValue(quantityRef, quantity, setQuantity);
  // Errors stay next to the button; success is announced with a toast.
  const [error, setError] = useState<string | null>(null);
  const showToast = useToast();
  const [pending, startTransition] = useTransition();
  const outOfStock = stock === 0;

  function handleClick() {
    const amount = Number(quantity);
    if (!Number.isInteger(amount) || amount < 1 || amount > stock) {
      setError(`Enter a quantity between 1 and ${stock}.`);
      return;
    }

    startTransition(async () => {
      const result = await addToCart(productId, amount);
      if (!result.ok && result.reason === "login-required") {
        const here = window.location.pathname + window.location.search;
        router.push(`/login?next=${encodeURIComponent(here)}`);
        return;
      }
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setError(null);
      showToast({ title: "Added to cart", description: result.message });
      // Re-render server components so the header cart count updates.
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-end gap-2">
        {withQuantity && (
          <div className="flex flex-col gap-1">
            <label
              htmlFor={`quantity-${productId}`}
              className="text-sm font-medium"
            >
              Quantity
            </label>
            <input
              ref={quantityRef}
              id={`quantity-${productId}`}
              type="number"
              min={1}
              max={Math.max(stock, 1)}
              step={1}
              value={quantity}
              disabled={outOfStock}
              onChange={(e) => setQuantity(e.target.value)}
              data-testid="quantity-input"
              className="w-20 rounded-md border border-gray-300 px-3 py-2 disabled:bg-gray-100"
            />
          </div>
        )}
        <button
          type="button"
          onClick={handleClick}
          disabled={outOfStock || pending}
          className="flex-1 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600"
        >
          {pending ? "Adding…" : "Add to cart"}
        </button>
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
