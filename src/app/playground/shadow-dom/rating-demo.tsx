"use client";

import { useEffect, useRef, useState } from "react";

const RATINGS = [
  { id: "product", label: "Product quality" },
  { id: "delivery", label: "Delivery speed" },
];

/**
 * Two <shoplab-rating> elements. Both have buttons named "1 star" … "5 stars",
 * so tests must first pick which component they mean.
 */
export function RatingDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [values, setValues] = useState<Record<string, number>>({});

  useEffect(() => {
    // Define the custom element in the browser only (it extends HTMLElement).
    import("@/components/shoplab-rating-element");

    const container = containerRef.current;
    function onChange(event: Event) {
      const host = event.target as HTMLElement;
      const { value } = (event as CustomEvent<{ value: number }>).detail;
      setValues((v) => ({ ...v, [host.id]: value }));
    }
    container?.addEventListener("rating-change", onChange);
    return () => container?.removeEventListener("rating-change", onChange);
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex flex-col gap-6 rounded-lg border border-gray-200 bg-white p-6"
    >
      {RATINGS.map((rating) => (
        <div key={rating.id} className="flex flex-col gap-1">
          <p className="font-medium">{rating.label}</p>
          <shoplab-rating id={rating.id} label={rating.label} value="0" />
        </div>
      ))}

      <div className="border-t border-gray-200 pt-4">
        <h2 className="mb-2 font-semibold">Your ratings</h2>
        <ul className="text-sm text-gray-700">
          {RATINGS.map((rating) => (
            <li key={rating.id} data-testid={`rating-result-${rating.id}`}>
              {rating.label}:{" "}
              {values[rating.id] ? `${values[rating.id]} of 5` : "not rated"}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
