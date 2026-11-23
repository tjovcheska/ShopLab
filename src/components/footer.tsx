import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between">
        <p>
          ShopLab is a practice shop for learning Playwright. Nothing here is
          for sale.
        </p>
        <nav aria-label="Footer">
          <ul className="flex gap-4">
            <li>
              <Link href="/chaos" className="hover:text-indigo-700">
                Chaos settings
              </Link>
            </li>
            <li>
              <Link href="/api-docs" className="hover:text-indigo-700">
                API docs
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
