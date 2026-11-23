"use client";

import { useState } from "react";

const menuItemClass =
  "block w-full px-4 py-2 text-left text-sm hover:bg-indigo-50 hover:text-indigo-900";

export function HoverDemo() {
  const [result, setResult] = useState("Nothing chosen yet.");
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <p className="text-gray-800">
        Last action:{" "}
        <output data-testid="hover-result" className="font-medium">
          {result}
        </output>
      </p>

      {/* 1. Two-level menu, CSS only. The menus are always in the DOM but
             display: none until their parent is hovered. */}
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-3 text-xl font-semibold">Hover menu</h2>
        <div className="group/shop relative inline-block">
          <div
            data-testid="shop-menu-trigger"
            className="cursor-default rounded-md bg-indigo-600 px-4 py-2 font-medium text-white"
          >
            Shop ▾
          </div>
          <ul
            aria-label="Shop menu"
            className="absolute top-full left-0 z-20 hidden w-48 rounded-md border border-gray-200 bg-white py-1 shadow-lg group-hover/shop:block"
          >
            <li>
              <button
                type="button"
                className={menuItemClass}
                onClick={() => setResult("You chose Clothing.")}
              >
                Clothing
              </button>
            </li>
            <li className="group/electronics relative">
              <div className="flex cursor-default justify-between px-4 py-2 text-sm hover:bg-indigo-50">
                Electronics <span aria-hidden="true">▸</span>
              </div>
              <ul
                aria-label="Electronics menu"
                className="absolute top-0 left-full hidden w-48 rounded-md border border-gray-200 bg-white py-1 shadow-lg group-hover/electronics:block"
              >
                <li>
                  <button
                    type="button"
                    className={menuItemClass}
                    onClick={() => setResult("You chose Headphones.")}
                  >
                    Headphones
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className={menuItemClass}
                    onClick={() => setResult("You chose Keyboards.")}
                  >
                    Keyboards
                  </button>
                </li>
              </ul>
            </li>
            <li>
              <button
                type="button"
                className={menuItemClass}
                onClick={() => setResult("You chose Books.")}
              >
                Books
              </button>
            </li>
          </ul>
        </div>
      </section>

      {/* 2. Tooltips: one is ADDED to the DOM on hover (React state), the
             other is always in the DOM but visibility: hidden. */}
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-3 text-xl font-semibold">Tooltips</h2>
        <div className="flex flex-wrap gap-8">
          <div className="relative">
            <span
              tabIndex={0}
              aria-describedby={showTooltip ? "shipping-tooltip" : undefined}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="cursor-help border-b border-dashed border-gray-500"
            >
              Shipping info
            </span>
            {showTooltip && (
              <div
                id="shipping-tooltip"
                role="tooltip"
                className="absolute top-full left-0 z-20 mt-2 w-56 rounded-md bg-gray-900 px-3 py-2 text-sm text-white"
              >
                Free shipping on orders over $50.
              </div>
            )}
          </div>

          <div className="group/returns relative">
            <span
              tabIndex={0}
              aria-describedby="returns-tooltip"
              className="cursor-help border-b border-dashed border-gray-500"
            >
              Returns policy
            </span>
            <div
              id="returns-tooltip"
              role="tooltip"
              className="invisible absolute top-full left-0 z-20 mt-2 w-56 rounded-md bg-gray-900 px-3 py-2 text-sm text-white group-hover/returns:visible"
            >
              Free returns within 30 days.
            </div>
          </div>
        </div>
      </section>

      {/* 3. A card whose action buttons are visibility: hidden until hover. */}
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-3 text-xl font-semibold">Hover card</h2>
        <article
          aria-label="Wireless Headphones"
          className="group/card relative w-64 overflow-hidden rounded-lg border border-gray-200"
        >
          <div className="flex h-36 items-center justify-center bg-indigo-100 text-4xl font-bold text-indigo-700">
            WH
          </div>
          <p className="p-3 font-medium">Wireless Headphones</p>
          <div className="invisible absolute inset-x-0 top-0 flex h-36 items-center justify-center gap-2 bg-black/50 group-hover/card:visible">
            <button
              type="button"
              onClick={() => setResult("Quick view: Wireless Headphones.")}
              className="rounded-md bg-white px-3 py-1.5 text-sm font-medium"
            >
              Quick view
            </button>
            <button
              type="button"
              onClick={() =>
                setResult("Added Wireless Headphones to your wishlist.")
              }
              className="rounded-md bg-white px-3 py-1.5 text-sm font-medium"
            >
              Add to wishlist
            </button>
          </div>
        </article>
      </section>
    </div>
  );
}
