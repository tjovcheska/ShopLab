"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { ProductCard } from "@/components/product-card";
import { apiFetch } from "@/lib/api-client";
import type {
  ProductListItem,
  ProductListResponse,
} from "@/lib/validation/products";

const PAGE_SIZE = 12;

type Status = "idle" | "loading" | "error" | "done";

/**
 * Infinite scroll: an invisible "sentinel" element sits below the last card.
 * When it scrolls into view, the next 12 products are fetched from
 * GET /api/v1/products?page=N.
 */
export function InfiniteProductList() {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const nextPage = useRef(1);
  const busy = useRef(false);
  const sentinel = useRef<HTMLDivElement>(null);

  async function loadMore() {
    if (busy.current) return;
    busy.current = true;
    setStatus("loading");
    try {
      const params = new URLSearchParams({
        page: String(nextPage.current),
        pageSize: String(PAGE_SIZE),
      });
      const data = await apiFetch<ProductListResponse>(
        `/api/v1/products?${params}`,
      );
      setProducts((list) => [...list, ...data.products]);
      nextPage.current += 1;
      const { page, totalPages } = data.pagination;
      setStatus(page >= totalPages ? "done" : "idle");
    } catch {
      setStatus("error");
    } finally {
      busy.current = false;
    }
  }

  const onSentinelVisible = useEffectEvent(() => loadMore());

  // A fresh observer is created every time loading finishes ("idle" again).
  // A new observer always reports the sentinel's current position once, so
  // if the sentinel is still on screen (tall window), the next page loads
  // right away.
  useEffect(() => {
    if (status !== "idle" || !sentinel.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) onSentinelVisible();
    });
    observer.observe(sentinel.current);
    return () => observer.disconnect();
  }, [status]);

  return (
    <div className="flex flex-col gap-6">
      {products.length > 0 && (
        <div
          data-testid="infinite-grid"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      <div ref={sentinel} aria-hidden="true" className="h-1" />

      {status === "loading" && (
        <p role="status" className="py-4 text-center text-gray-600">
          Loading more…
        </p>
      )}
      {status === "error" && (
        <div
          role="alert"
          className="flex items-center justify-center gap-3 py-4 text-red-700"
        >
          <p>Could not load more products.</p>
          <button
            type="button"
            onClick={() => loadMore()}
            className="rounded-md border border-red-300 px-3 py-1 text-sm hover:bg-red-50"
          >
            Try again
          </button>
        </div>
      )}
      {status === "done" && (
        <p className="py-4 text-center font-medium text-gray-600">
          End of list
        </p>
      )}
    </div>
  );
}
