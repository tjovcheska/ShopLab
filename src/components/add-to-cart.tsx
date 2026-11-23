"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { addToCart } from "@/lib/cart-actions";

type AddToCartProps = {
  productId: number;
  stock: number;
  /** Show a quantity input (product detail page) or always add 1 (cards). */
  withQuantity?: boolean;
};

type Feedback = { kind: "success" | "error"; message: string } | null;

export function AddToCart({
  productId,
  stock,
  withQuantity = false,
}: AddToCartProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState("1");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [pending, startTransition] = useTransition();
  const outOfStock = stock === 0;

  function handleClick() {
    const amount = Number(quantity);
    if (!Number.isInteger(amount) || amount < 1 || amount > stock) {
      setFeedback({
        kind: "error",
        message: `Enter a quantity between 1 and ${stock}.`,
      });
      return;
    }

    startTransition(async () => {
      const result = await addToCart(productId, amount);
      if (!result.ok && result.reason === "login-required") {
        const here = window.location.pathname + window.location.search;
        router.push(`/login?next=${encodeURIComponent(here)}`);
        return;
      }
      setFeedback({
        kind: result.ok ? "success" : "error",
        message: result.message,
      });
      // Re-render server components so the header cart count updates.
      if (result.ok) router.refresh();
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
      {feedback && (
        <p
          role={feedback.kind === "error" ? "alert" : "status"}
          className={`text-sm ${feedback.kind === "error" ? "text-red-600" : "text-green-700"}`}
        >
          {feedback.message}
        </p>
      )}
    </div>
  );
}
