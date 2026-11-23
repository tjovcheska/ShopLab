import Link from "next/link";

// Test IDs: only the search input and the cart count badge have data-testid.
// The logo, nav links, and login link deliberately have none (see
// docs/LOCATORS.md), so they must be located by role and name.
export function Header() {
  // Phase 2 (authentication) replaces this with the logged-in user's cart
  // item count and swaps "Log in" for the account link and logout button.
  const cartCount: number = 0;

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-3">
        <Link href="/" className="text-2xl font-bold text-indigo-700">
          ShopLab
        </Link>

        <form
          role="search"
          action="/search"
          method="get"
          className="flex min-w-48 flex-1 gap-2"
        >
          <label htmlFor="header-search" className="sr-only">
            Search products
          </label>
          <input
            id="header-search"
            name="q"
            type="search"
            placeholder="Search products…"
            data-testid="header-search-input"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Search
          </button>
        </form>

        <nav aria-label="Main">
          <ul className="flex gap-4 text-sm font-medium">
            <li>
              <Link href="/products" className="hover:text-indigo-700">
                Products
              </Link>
            </li>
            <li>
              <Link href="/playground" className="hover:text-indigo-700">
                Playground
              </Link>
            </li>
            <li>
              <Link href="/api-docs" className="hover:text-indigo-700">
                API docs
              </Link>
            </li>
          </ul>
        </nav>

        <div className="flex items-center gap-4 text-sm font-medium">
          <Link
            href="/cart"
            aria-label={`Cart, ${cartCount} ${cartCount === 1 ? "item" : "items"}`}
            className="relative inline-flex items-center hover:text-indigo-700"
          >
            <CartIcon />
            <span
              data-testid="cart-count"
              aria-hidden="true"
              className="absolute -top-2 -right-3 min-w-5 rounded-full bg-indigo-600 px-1.5 text-center text-xs leading-5 text-white"
            >
              {cartCount}
            </span>
          </Link>
          <Link href="/login" className="hover:text-indigo-700">
            Log in
          </Link>
        </div>
      </div>
    </header>
  );
}

function CartIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}
