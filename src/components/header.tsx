import Link from "next/link";
import { SearchBox } from "@/components/search-box";
import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "@/lib/auth-actions";
import { db } from "@/lib/db";

// Test IDs: only the search input, the cart count badge, the category menu,
// and the logout button have data-testid. The logo, nav links, login and account links
// deliberately have none (see docs/LOCATORS.md), so they must be located by
// role and name.
export async function Header() {
  const user = await getCurrentUser();
  const [cartCount, categories] = await Promise.all([
    user ? getCartItemCount(user.id) : 0,
    db.category.findMany({
      orderBy: { name: "asc" },
      select: { name: true, slug: true },
    }),
  ]);

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-3">
        <Link href="/" className="text-2xl font-bold text-indigo-700">
          ShopLab
        </Link>

        {/* No <Suspense> around it: content inside a Suspense boundary is
            revealed by a script, so the search form would be invisible
            with JavaScript disabled. */}
        <SearchBox />

        <nav aria-label="Main">
          <ul className="flex gap-4 text-sm font-medium">
            {/* Hover-only category menu: display:none until the "Products"
                item is hovered (no click or focus). The inner padding keeps
                the menu open while the mouse moves down into it. */}
            <li className="group/products relative">
              <Link href="/products" className="hover:text-indigo-700">
                Products <span aria-hidden="true">▾</span>
              </Link>
              <div className="absolute top-full left-0 z-30 hidden pt-2 group-hover/products:block">
                <ul
                  aria-label="Product categories"
                  data-testid="category-menu"
                  className="w-56 rounded-md border border-gray-200 bg-white py-1 font-normal shadow-lg"
                >
                  {categories.map((category) => (
                    <li key={category.slug}>
                      <Link
                        href={`/products?category=${category.slug}`}
                        className="block px-4 py-2 hover:bg-indigo-50 hover:text-indigo-900"
                      >
                        {category.name}
                      </Link>
                    </li>
                  ))}
                  <li className="border-t border-gray-100">
                    <Link
                      href="/products/all"
                      className="block px-4 py-2 hover:bg-indigo-50 hover:text-indigo-900"
                    >
                      All products on one page
                    </Link>
                  </li>
                </ul>
              </div>
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
          {user ? (
            <>
              <Link href="/account" className="hover:text-indigo-700">
                Account
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  data-testid="logout-button"
                  className="hover:text-indigo-700"
                >
                  Log out
                </button>
              </form>
            </>
          ) : (
            <Link href="/login" className="hover:text-indigo-700">
              Log in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

/** Total quantity of all items in the user's cart. */
async function getCartItemCount(userId: number): Promise<number> {
  const result = await db.cartItem.aggregate({
    where: { userId },
    _sum: { quantity: true },
  });
  return result._sum.quantity ?? 0;
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
