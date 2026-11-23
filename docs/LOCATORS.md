# Locators and test IDs

ShopLab gives `data-testid` to only about half of its interactive elements. Everything else has to be found by role, label, text, or chained/filtered locators. This file lists which elements have test IDs and which deliberately do not. It grows with each phase.

## Shared layout (every page)

| Element              | `data-testid`         | Suggested locator without a test ID                                |
| -------------------- | --------------------- | ------------------------------------------------------------------ |
| Header search input  | `header-search-input` | `getByRole('searchbox', { name: 'Search products' })`              |
| Header search button | —                     | `getByRole('search').getByRole('button', { name: 'Search' })`      |
| Logo / home link     | —                     | `getByRole('link', { name: 'ShopLab' })`                           |
| Main nav links       | —                     | `getByRole('navigation', { name: 'Main' }).getByRole('link', …)`   |
| Cart link            | —                     | `getByRole('link', { name: /^Cart, \d+ items?$/ })`                |
| Cart count badge     | `cart-count`          | (hidden from assistive tech; read the cart link's accessible name) |
| Log in link          | —                     | `getByRole('link', { name: 'Log in' })`                            |
| Footer links         | —                     | `getByRole('navigation', { name: 'Footer' }).getByRole('link', …)` |

## Home page (`/`)

No test IDs. Product cards are `<article>` elements named by their heading:
`getByRole('article', { name: 'Yoga Mat' })`.
