"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/product-card";
import { apiFetch } from "@/lib/api-client";
import type {
  ProductListItem,
  ProductListResponse,
} from "@/lib/validation/products";

// The widget appears after a RANDOM delay between these two values. This is
// deliberate (it is the only random timing in ShopLab besides flaky mode):
// tests must wait for it, never sleep for a fixed time.
const MIN_DELAY_MS = 1000;
const MAX_DELAY_MS = 3000;

export function NewArrivals() {
  const [products, setProducts] = useState<ProductListItem[] | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const delay = MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);
    const timer = setTimeout(() => {
      apiFetch<ProductListResponse>("/api/v1/products?sort=newest&pageSize=4", {
        signal: controller.signal,
      })
        .then((data) => setProducts(data.products))
        .catch(() => {
          // If loading fails (e.g. flaky mode), the widget simply never appears.
        });
    }, delay);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, []);

  if (!products) return null;

  return (
    <section aria-labelledby="new-arrivals-heading" data-testid="new-arrivals">
      <h2 id="new-arrivals-heading" className="mb-4 text-xl font-semibold">
        New arrivals
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
