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
