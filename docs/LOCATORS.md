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
| Log in link          | —                     | `getByRole('banner').getByRole('link', { name: 'Log in' })`        |
| Account link         | —                     | `getByRole('banner').getByRole('link', { name: 'Account' })`       |
| Log out button       | `logout-button`       | `getByRole('button', { name: 'Log out' })`                         |
| Footer links         | —                     | `getByRole('navigation', { name: 'Footer' }).getByRole('link', …)` |

## Home page (`/`)

No test IDs. Product cards are `<article>` elements named by their heading:
`getByRole('article', { name: 'Yoga Mat' })`.

## Product card (home page and `/products`)

| Element            | `data-testid` | Suggested locator without a test ID                                           |
| ------------------ | ------------- | ----------------------------------------------------------------------------- |
| Card               | —             | `getByRole('article', { name: 'Yoga Mat' })`                                  |
| Name link          | —             | `card.getByRole('link', { name: 'Yoga Mat' })`                                |
| Add to cart button | —             | `card.getByRole('button', { name: 'Add to cart' })` (same name on every card) |
| Out of stock badge | —             | `card.getByText('Out of stock')`                                              |
| Feedback message   | —             | `card.getByRole('status')` / `card.getByRole('alert')`                        |

"Classic T-Shirt" and "Classic T-Shirt (Pack of 3)" are both products, so `{ name: 'Classic T-Shirt' }` matches two cards unless you add `exact: true`.

## Gotcha: Next.js route announcer (`role="alert"`)

Next.js adds a hidden `<next-route-announcer>` element to every page. Inside its shadow root is a `role="alert"` element, and Playwright locators pierce shadow DOM. So a bare `page.getByRole('alert')` always matches that announcer. Once a real error alert appears, it matches two elements and fails Playwright's strict mode. Always scope alerts, for example `getByRole('form', { name: 'Log in' }).getByRole('alert')`, or filter by text.

## Log in (`/login`)

| Element       | `data-testid`  | Suggested locator without a test ID                        |
| ------------- | -------------- | ---------------------------------------------------------- |
| Form          | —              | `getByRole('form', { name: 'Log in' })`                    |
| Email         | —              | `getByLabel('Email')`                                      |
| Password      | —              | `getByLabel('Password')`                                   |
| Submit button | `login-submit` | `getByRole('button', { name: 'Log in' })`                  |
| Error alert   | —              | `getByRole('form', { name: 'Log in' }).getByRole('alert')` |
| Register link | —              | `getByRole('link', { name: 'Create an account' })`         |

"Log in" is the name of the heading, the form, the submit button, and the header link, so locators must say which role they mean.

## Register (`/register`)

| Element          | `data-testid`       | Suggested locator without a test ID                                                                               |
| ---------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Form             | —                   | `getByRole('form', { name: 'Create account' })`                                                                   |
| Full name        | —                   | `getByLabel('Full name')`                                                                                         |
| Email            | `register-email`    | `getByLabel('Email')`                                                                                             |
| Password         | `register-password` | `getByLabel('Password', { exact: true })`                                                                         |
| Confirm password | —                   | `getByLabel('Confirm password')`                                                                                  |
| Submit button    | —                   | `getByRole('button', { name: 'Create account' })`                                                                 |
| Field error      | —                   | the input's accessible description, e.g. `expect(getByLabel('Email')).toHaveAccessibleDescription(/valid email/)` |

`getByLabel('Password')` without `exact: true` also matches "Confirm password". Inputs with an error have `aria-invalid="true"`. The password field's description also includes the hint text.

## Account (`/account`) and admin (`/admin`)

| Element     | `data-testid`   | Suggested locator without a test ID                              |
| ----------- | --------------- | ---------------------------------------------------------------- |
| Email value | `account-email` | `getByRole('definition').filter({ hasText: '@' })`               |
| Name value  | —               | `getByText('Welcome back,')` or the `<dd>` after the "Name" term |
| Admin stats | —               | `getByText('Users', { exact: true })` (the `<dd>` follows it)    |

## Products (`/products`)

| Element               | `data-testid`      | Suggested locator without a test ID                                                                                    |
| --------------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| Filters sidebar       | —                  | `getByRole('complementary', { name: 'Filters' })`                                                                      |
| Sort dropdown         | `sort-select`      | `getByLabel('Sort by')`                                                                                                |
| Category checkboxes   | —                  | `getByRole('checkbox', { name: 'Books' })`                                                                             |
| Price sliders         | —                  | `getByLabel('Minimum price')`, `getByLabel('Maximum price')` (use `fill('20')`)                                        |
| In stock only         | —                  | `getByRole('switch', { name: 'In stock only' })`                                                                       |
| Clear filters         | —                  | `getByRole('button', { name: 'Clear filters' })`                                                                       |
| Results summary       | `results-count`    | `getByRole('heading', { name: /^Showing / })`                                                                          |
| Product grid          | `product-grid`     | `getByRole('article')` within the results                                                                              |
| Loading skeleton card | `product-skeleton` | `getByRole('status')` containing "Loading products…"                                                                   |
| Load error + retry    | —                  | `getByRole('alert').filter({ hasText: 'Could not load products' })`, then `getByRole('button', { name: 'Try again' })` |
| Pagination            | —                  | `getByRole('navigation', { name: 'Pagination' }).getByRole('link', { name: 'Page 2' })`                                |

Price slider changes reach the URL 300 ms after the last change. Wait for the URL or the results, not a fixed time.

## Product detail (`/products/[slug]`)

| Element        | `data-testid`    | Suggested locator without a test ID                          |
| -------------- | ---------------- | ------------------------------------------------------------ |
| Breadcrumb     | —                | `getByRole('navigation', { name: 'Breadcrumb' })`            |
| Product name   | —                | `getByRole('heading', { level: 1 })`                         |
| Quantity input | `quantity-input` | `getByLabel('Quantity')` (`min` 1, `max` = stock)            |
| Add to cart    | —                | `getByRole('button', { name: 'Add to cart' })`               |
| Reviews list   | `reviews-list`   | `getByRole('heading', { name: /^Customer reviews/ })`        |
| One review     | —                | `getByRole('article', { name: 'Review by Alice Anderson' })` |

## Chaos settings (`/chaos`) and banner

| Element          | `data-testid`                        | Suggested locator without a test ID                                         |
| ---------------- | ------------------------------------ | --------------------------------------------------------------------------- |
| Chaos banner     | `chaos-banner`                       | `getByText(/^Chaos mode:/)`                                                 |
| Delay input      | —                                    | `getByLabel('Delay (ms)')`                                                  |
| Flaky input      | —                                    | `getByLabel('Flaky requests (%)')`                                          |
| Save / Clear     | —                                    | `getByRole('button', { name: 'Save' })`, `{ name: 'Clear chaos settings' }` |
| Values in effect | `effective-delay`, `effective-flaky` | `getByRole('row', { name: /Delay/ }).getByRole('cell').last()`              |
