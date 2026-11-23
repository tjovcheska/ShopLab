"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AddToCart } from "@/components/add-to-cart";
import { apiFetch } from "@/lib/api-client";
import { formatPrice } from "@/lib/format";

type ProductDetail = {
  id: number;
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  stock: number;
};

/**
 * The "Quick view" button on a product card. It is visibility:hidden until
 * the card is hovered (the card has the `group/card` class), so tests must
 * hover the card first. It opens a modal <dialog> that loads the product from
 * GET /api/v1/products/:id — so chaos delay and flaky mode apply.
 */
export function QuickView({
  productId,
  name,
}: {
  productId: number;
  name: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function show() {
    setOpen(true);
    setError(null);
    apiFetch<{ product: ProductDetail }>(`/api/v1/products/${productId}`)
      .then((data) => setProduct(data.product))
      .catch((e: Error) => setError(e.message));
  }

  return (
    <>
      <button
        type="button"
        onClick={show}
        className="invisible absolute top-2 right-2 rounded-md bg-white/95 px-3 py-1.5 text-sm font-medium shadow group-hover/card:visible"
      >
        Quick view
      </button>
      <dialog
        ref={dialogRef}
        aria-label={`Quick view: ${name}`}
        onCancel={(e) => {
          e.preventDefault();
          setOpen(false);
        }}
        className="m-auto w-full max-w-md rounded-lg p-6 shadow-xl backdrop:bg-black/40"
      >
        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold">{name}</h2>
          {error ? (
            <p role="alert" className="text-sm text-red-700">
              Could not load the product: {error}
            </p>
          ) : !product ? (
            <p role="status" className="text-sm text-gray-600">
              Loading…
            </p>
          ) : (
            <>
              <p className="text-lg font-bold">
                {formatPrice(product.priceCents)}
              </p>
              <p className="text-gray-700">{product.description}</p>
              <p className="text-sm text-gray-600">
                {product.stock > 0
                  ? `${product.stock} in stock`
                  : "Out of stock"}
              </p>
              <AddToCart productId={product.id} stock={product.stock} />
              <Link
                href={`/products/${product.slug}`}
                className="text-sm text-indigo-700 underline"
              >
                View full details
              </Link>
            </>
          )}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-2 w-fit self-end rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </dialog>
    </>
  );
}
