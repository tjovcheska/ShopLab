"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { apiFetch } from "@/lib/api-client";
import { useAdoptDomValue } from "@/lib/use-adopt-dom-value";
import { formatPrice } from "@/lib/format";
import type {
  ProductListItem,
  ProductListResponse,
} from "@/lib/validation/products";

const DEBOUNCE_MS = 300; // wait this long after the last keystroke
const MIN_CHARS = 2; // no suggestions for shorter input
const MAX_SUGGESTIONS = 6;

/** Header search with autocomplete (ARIA combobox + listbox pattern). */
export function SearchBox() {
  const pathname = usePathname();
  const params = useSearchParams();
  // On /search, show the current search term in the box.
  const initial = pathname === "/search" ? (params.get("q") ?? "") : "";
  return <Combobox key={initial} initialQuery={initial} />;
}

type Suggestions =
  | { term: string; status: "loading" }
  | { term: string; status: "error" }
  | { term: string; status: "done"; items: ProductListItem[] };

function Combobox({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<Suggestions | null>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const request = useRef<AbortController | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      request.current?.abort();
    },
    [],
  );

  const term = query.trim();
  // Only show suggestions that belong to what is typed right now.
  const current = suggestions?.term === term ? suggestions : null;
  const items = current?.status === "done" ? current.items : [];
  const listOpen = open && items.length > 0;

  function fetchSuggestions(searchTerm: string) {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setSuggestions({ term: searchTerm, status: "loading" });
    const params = new URLSearchParams({
      q: searchTerm,
      pageSize: String(MAX_SUGGESTIONS),
    });
    apiFetch<ProductListResponse>(`/api/v1/products?${params}`, {
      signal: controller.signal,
    })
      .then((data) =>
        setSuggestions({
          term: searchTerm,
          status: "done",
          items: data.products,
        }),
      )
      .catch(() => {
        if (!controller.signal.aborted) {
          setSuggestions({ term: searchTerm, status: "error" });
        }
      });
  }

  function handleChange(value: string) {
    setQuery(value);
    setOpen(true);
    setActiveIndex(-1);
    if (timer.current) clearTimeout(timer.current);
    const nextTerm = value.trim();
    if (nextTerm.length < MIN_CHARS) {
      request.current?.abort();
      setSuggestions(null);
      return;
    }
    // Debounce: only search once the user pauses typing.
    timer.current = setTimeout(() => fetchSuggestions(nextTerm), DEBOUNCE_MS);
  }

  function goToProduct(item: ProductListItem) {
    setOpen(false);
    setActiveIndex(-1);
    router.push(`/products/${item.slug}`);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    switch (event.key) {
      case "ArrowDown":
        if (items.length === 0) return;
        event.preventDefault();
        setOpen(true);
        setActiveIndex((i) => (i + 1) % items.length);
        break;
      case "ArrowUp":
        if (items.length === 0) return;
        event.preventDefault();
        setOpen(true);
        setActiveIndex((i) => (i <= 0 ? items.length - 1 : i - 1));
        break;
      case "Enter":
        // With an option highlighted, open that product. Otherwise the form
        // submits and goes to the search results page.
        if (listOpen && activeIndex >= 0) {
          event.preventDefault();
          goToProduct(items[activeIndex]);
        }
        break;
      case "Escape":
        if (open) {
          event.preventDefault();
          setOpen(false);
          setActiveIndex(-1);
        }
        break;
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    // Without JavaScript the form still submits to /search?q=… natively.
    event.preventDefault();
    if (!term) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(term)}`);
  }

  let message: string | null = null;
  if (open && current?.status === "loading") message = "Searching…";
  if (open && current?.status === "error")
    message = "Could not load suggestions.";
  if (open && current?.status === "done" && items.length === 0) {
    message = `No products match “${term}”.`;
  }

  const optionId = (item: ProductListItem) => `search-option-${item.id}`;

  // Keep text typed before hydration (and fetch its suggestions).
  useAdoptDomValue(inputRef, query, handleChange);

  return (
    <form
      role="search"
      action="/search"
      method="get"
      onSubmit={handleSubmit}
      className="relative flex min-w-48 flex-1 gap-2"
    >
      <label htmlFor="header-search" className="sr-only">
        Search products
      </label>
      <input
        ref={inputRef}
        id="header-search"
        name="q"
        type="search"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={listOpen}
        aria-controls={listOpen ? "search-suggestions" : undefined}
        aria-activedescendant={
          listOpen && activeIndex >= 0
            ? optionId(items[activeIndex])
            : undefined
        }
        autoComplete="off"
        placeholder="Search products…"
        data-testid="header-search-input"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
      />
      <button
        type="submit"
        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
      >
        Search
      </button>

      {listOpen && (
        <ul
          id="search-suggestions"
          role="listbox"
          aria-label="Product suggestions"
          data-testid="search-suggestions"
          className="absolute top-full right-0 left-0 z-40 mt-1 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg"
        >
          {items.map((item, index) => (
            <li
              key={item.id}
              id={optionId(item)}
              role="option"
              aria-selected={index === activeIndex}
              // Keep focus in the input so onBlur does not close the list
              // before the click lands.
              onMouseDown={(e) => e.preventDefault()}
              // onMouseMove (not onMouseEnter): a cursor that is merely
              // resting where the list opens must not select an option.
              onMouseMove={() => setActiveIndex(index)}
              onClick={() => goToProduct(item)}
              className={`flex cursor-pointer justify-between gap-4 px-3 py-2 text-sm ${
                index === activeIndex ? "bg-indigo-50 text-indigo-900" : ""
              }`}
            >
              <span>{item.name}</span>
              <span className="text-gray-500">
                {formatPrice(item.priceCents)}
              </span>
            </li>
          ))}
        </ul>
      )}

      {message && (
        <p
          role="status"
          className="absolute top-full right-0 left-0 z-40 mt-1 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 shadow-lg"
        >
          {message}
        </p>
      )}
    </form>
  );
}
