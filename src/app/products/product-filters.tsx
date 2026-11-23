"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  startTransition,
  useEffect,
  useOptimistic,
  useRef,
  useState,
} from "react";
import { DEFAULT_SORT, SORT_OPTIONS } from "@/lib/validation/products";
import { FILTER_KEYS, productsUrl, readInt } from "./url";

type Props = {
  categories: { slug: string; name: string }[];
  priceMax: number;
};

export function ProductFilters({ categories, priceMax }: Props) {
  const router = useRouter();
  // The URL is the source of truth, but navigating takes a moment. The
  // optimistic copy lets a checkbox show as checked as soon as it is clicked,
  // and falls back to the real URL once the navigation finishes.
  const [params, setOptimisticParams] =
    useOptimistic<URLSearchParams>(useSearchParams());

  const selected = params.getAll("category");
  const inStock = ["true", "1"].includes(params.get("inStock") ?? "");
  const sort = params.get("sort") ?? DEFAULT_SORT;
  const minPrice = readInt(params, "minPrice", 0, 0, priceMax);
  const maxPrice = readInt(params, "maxPrice", priceMax, 0, priceMax);

  /** Navigate to a new URL; changing a filter always goes back to page 1. */
  function update(change: (next: URLSearchParams) => void) {
    const next = new URLSearchParams(params);
    change(next);
    next.delete("page");
    startTransition(() => {
      setOptimisticParams(next);
      router.push(
        productsUrl(next, () => {}),
        { scroll: false },
      );
    });
  }

  function toggleCategory(slug: string, checked: boolean) {
    const nextSelected = checked
      ? [...selected, slug]
      : selected.filter((s) => s !== slug);
    update((next) => {
      next.delete("category");
      for (const s of nextSelected) next.append("category", s);
    });
  }

  function setPrice(min: number, max: number) {
    update((next) => {
      if (min > 0) next.set("minPrice", String(min));
      else next.delete("minPrice");
      if (max < priceMax) next.set("maxPrice", String(max));
      else next.delete("maxPrice");
    });
  }

  const hasFilters = FILTER_KEYS.some((key) => params.has(key));

  return (
    <div className="flex flex-col gap-6 rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="sort" className="text-sm font-semibold">
          Sort by
        </label>
        <select
          id="sort"
          value={sort}
          data-testid="sort-select"
          onChange={(e) =>
            update((next) => {
              if (e.target.value === DEFAULT_SORT) next.delete("sort");
              else next.set("sort", e.target.value);
            })
          }
          className="rounded-md border border-gray-300 px-2 py-2"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold">Category</legend>
        <ul className="flex flex-col gap-1">
          {categories.map((category) => (
            <li key={category.slug}>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selected.includes(category.slug)}
                  onChange={(e) =>
                    toggleCategory(category.slug, e.target.checked)
                  }
                />
                {category.name}
              </label>
            </li>
          ))}
        </ul>
      </fieldset>

      {/* Remount when the URL changes (e.g. "Clear filters", Back button)
          so the sliders show the URL's values again. */}
      <PriceRange
        key={`${minPrice}-${maxPrice}`}
        min={minPrice}
        max={maxPrice}
        priceMax={priceMax}
        onCommit={setPrice}
      />

      <label className="flex items-center justify-between gap-2 text-sm font-semibold">
        In stock only
        <input
          type="checkbox"
          role="switch"
          checked={inStock}
          onChange={(e) =>
            update((next) => {
              if (e.target.checked) next.set("inStock", "true");
              else next.delete("inStock");
            })
          }
          className="h-5 w-9 cursor-pointer appearance-none rounded-full bg-gray-300 transition before:block before:h-4 before:w-4 before:translate-x-0.5 before:rounded-full before:bg-white before:transition checked:bg-indigo-600 checked:before:translate-x-4.5"
        />
      </label>

      <button
        type="button"
        disabled={!hasFilters}
        onClick={() =>
          update((next) => {
            for (const key of FILTER_KEYS) next.delete(key);
          })
        }
        className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Clear filters
      </button>
    </div>
  );
}

const PRICE_DEBOUNCE_MS = 300;

/**
 * Two range sliders. Dragging updates the labels immediately; the URL (and
 * so the product fetch) updates 300 ms after the last change.
 */
function PriceRange({
  min,
  max,
  priceMax,
  onCommit,
}: {
  min: number;
  max: number;
  priceMax: number;
  onCommit: (min: number, max: number) => void;
}) {
  const [low, setLow] = useState(min);
  const [high, setHigh] = useState(max);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  function change(nextLow: number, nextHigh: number) {
    setLow(nextLow);
    setHigh(nextHigh);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(
      () => onCommit(nextLow, nextHigh),
      PRICE_DEBOUNCE_MS,
    );
  }

  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold">Price</legend>
      <p className="mb-2 text-sm text-gray-700" aria-live="polite">
        ${low} – ${high}
      </p>
      <div className="flex flex-col gap-2">
        <label className="flex flex-col text-xs text-gray-600">
          Minimum price
          <input
            type="range"
            min={0}
            max={high}
            step={5}
            value={low}
            aria-valuetext={`$${low}`}
            onChange={(e) => change(Number(e.target.value), high)}
          />
        </label>
        <label className="flex flex-col text-xs text-gray-600">
          Maximum price
          <input
            type="range"
            min={low}
            max={priceMax}
            step={5}
            value={high}
            aria-valuetext={`$${high}`}
            onChange={(e) => change(low, Number(e.target.value))}
          />
        </label>
      </div>
    </fieldset>
  );
}
