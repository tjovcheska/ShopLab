"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";

const REFRESH_MS = 5000;

type ProductResponse = { product: { stock: number } };

const timeFormat = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

/**
 * Shows the product's stock and re-fetches it from GET /api/v1/products/:id
 * every 5 seconds. The next refresh starts 5 s after the previous one
 * finished, so slow (chaos-delayed) requests never pile up.
 */
export function LiveStock({
  productId,
  initialStock,
}: {
  productId: number;
  initialStock: number;
}) {
  const [stock, setStock] = useState(initialStock);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const controller = new AbortController();

    async function refresh() {
      try {
        const data = await apiFetch<ProductResponse>(
          `/api/v1/products/${productId}`,
          { signal: controller.signal },
        );
        setStock(data.product.stock);
        setUpdatedAt(new Date());
        setFailed(false);
      } catch {
        if (controller.signal.aborted) return;
        setFailed(true); // keep showing the last known value
      }
      timer = setTimeout(refresh, REFRESH_MS);
    }

    timer = setTimeout(refresh, REFRESH_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [productId]);

  return (
    <div className="text-sm">
      <p className={stock > 0 ? "text-green-700" : "text-red-700"}>
        Live stock:{" "}
        <span data-testid="live-stock" className="font-semibold">
          {stock}
        </span>{" "}
        {stock === 1 ? "unit" : "units"} available
      </p>
      <p className="text-xs text-gray-500">
        {failed
          ? "Could not refresh stock. Retrying…"
          : updatedAt
            ? `Updated at ${timeFormat.format(updatedAt)}`
            : "Refreshes every 5 seconds"}
      </p>
    </div>
  );
}
