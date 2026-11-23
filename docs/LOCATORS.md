# Locators and test IDs

ShopLab gives `data-testid` to only about half of its interactive elements. Everything else has to be found by role, label, text, or chained/filtered locators. This file lists which elements have test IDs and which deliberately do not. It grows with each phase.

## Shared layout (every page)

| Element              | `data-testid`         | Suggested locator without a test ID                                |
| -------------------- | --------------------- | ------------------------------------------------------------------ |
| Header search input  | `header-search-input` | `getByRole('combobox', { name: 'Search products' })`               |
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

Product cards are `<article>` elements named by their heading:
`getByRole('article', { name: 'Yoga Mat' })`.

| Element             | `data-testid`  | Suggested locator without a test ID             |
| ------------------- | -------------- | ----------------------------------------------- |
| New arrivals widget | `new-arrivals` | `getByRole('region', { name: 'New arrivals' })` |

The New arrivals widget appears after a **random** 1–3 second delay. Wait for it with an assertion such as `toBeVisible()`, never with a fixed sleep.

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

## Search autocomplete (header, every page)

| Element              | `data-testid`         | Suggested locator without a test ID                                           |
| -------------------- | --------------------- | ----------------------------------------------------------------------------- |
| Search box           | `header-search-input` | `getByRole('combobox', { name: 'Search products' })`                          |
| Suggestions list     | `search-suggestions`  | `getByRole('listbox', { name: 'Product suggestions' })`                       |
| One suggestion       | —                     | `getByRole('option', { name: /^Ceramic Mug/ })` (the name includes the price) |
| Highlighted option   | —                     | `getByRole('option', { selected: true })`                                     |
| Searching / no match | —                     | `getByRole('search').getByRole('status')`                                     |

- Suggestions appear 300 ms after the last keystroke, and only for 2 or more characters.
- `ArrowDown` and `ArrowUp` move the highlight (wrapping at the ends), and the input's `aria-activedescendant` points at it.
- `Enter` on a highlighted option opens that product. `Enter` with nothing highlighted goes to `/search?q=…`. `Escape` closes the list.
- `fill()` types everything at once (one request). `pressSequentially()` with a delay shows the debounce at work.

## Toasts (every page)

| Element         | `data-testid` | Suggested locator without a test ID                                  |
| --------------- | ------------- | -------------------------------------------------------------------- |
| Toast container | —             | `getByRole('region', { name: 'Notifications' })`                     |
| One toast       | `toast`       | `getByRole('region', { name: 'Notifications' }).getByRole('status')` |
| Dismiss button  | —             | `getByRole('button', { name: 'Dismiss notification' })`              |

Toasts disappear **3 seconds** after they appear. "Add to cart" shows "Added to cart" with "2 × Yoga Mat" underneath. Assert on a toast promptly, or use `toBeHidden()` to wait for it to go.

## Search results (`/search?q=…`)

| Element | `data-testid`    | Suggested locator without a test ID                                    |
| ------- | ---------------- | ---------------------------------------------------------------------- |
| Summary | `search-summary` | `getByText(/results? for “/)`                                          |
| Results | —                | `getByRole('region', { name: 'Search results' }).getByRole('article')` |

## All products, infinite scroll (`/products/all`)

| Element      | `data-testid`   | Suggested locator without a test ID                                     |
| ------------ | --------------- | ----------------------------------------------------------------------- |
| Product grid | `infinite-grid` | `getByRole('article')`                                                  |
| Loading more | —               | `getByRole('status').filter({ hasText: 'Loading more…' })`              |
| End of list  | —               | `getByText('End of list')`                                              |
| Load error   | —               | `getByRole('alert')`, then `getByRole('button', { name: 'Try again' })` |

12 products load at first. Scrolling to the bottom (`page.mouse.wheel(0, 10000)`, or `scrollIntoViewIfNeeded()` on the last card) loads 12 more, up to 40. Use `?delay=1000` to make "Loading more…" easy to see.

## Product detail: live stock

| Element      | `data-testid` | Suggested locator without a test ID |
| ------------ | ------------- | ----------------------------------- |
| Stock number | `live-stock`  | `getByText(/^Live stock:/)`         |
| Last refresh | —             | `getByText(/^Updated at /)`         |

The stock refreshes from the API every 5 seconds. If a refresh fails (flaky mode), the last value stays and "Could not refresh stock. Retrying…" is shown.

## Cart (`/cart`)

| Element            | `data-testid`   | Suggested locator without a test ID                                                   |
| ------------------ | --------------- | ------------------------------------------------------------------------------------- |
| One line           | —               | `getByRole('article', { name: 'Yoga Mat' })`                                          |
| Quantity value     | `item-quantity` | `line.getByRole('group', { name: 'Quantity of Yoga Mat' })`                           |
| + / − buttons      | —               | `line.getByRole('button', { name: 'Increase quantity' })` / `'Decrease quantity'`     |
| Line total         | `line-total`    | —                                                                                     |
| Remove             | —               | `line.getByRole('button', { name: 'Remove' })`                                        |
| Confirmation modal | —               | `getByRole('dialog', { name: 'Remove item?' })`, then its `Remove` / `Cancel` buttons |
| Subtotal           | `cart-subtotal` | `getByRole('region', { name: 'Order summary' })`                                      |
| Empty state        | `empty-cart`    | `getByText('Your cart is empty.')`                                                    |
| Checkout link      | —               | `getByRole('link', { name: 'Proceed to checkout' })`                                  |

While the modal is open, the page and the dialog both have a "Remove" button. Scope to the dialog.

## Checkout (`/checkout`)

| Element                 | `data-testid`          | Suggested locator without a test ID                                                                           |
| ----------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------- |
| Progress indicator      | `checkout-progress`    | `getByRole('navigation', { name: 'Checkout progress' })`, current step has `aria-current="step"`              |
| Step heading            | —                      | `getByRole('heading', { level: 2 })` ("Shipping address", "Delivery options", "Payment", "Review your order") |
| Next                    | `checkout-next`        | `getByRole('button', { name: 'Next' })`                                                                       |
| Back / Place order      | —                      | `getByRole('button', { name: 'Back' })`, `{ name: 'Place order' }`                                            |
| Full name, City         | —                      | `getByLabel('Full name')`, `getByLabel('City')`                                                               |
| Address                 | `ship-address`         | `getByLabel('Address', { exact: true })` ("Apartment, suite…" also contains "address")                        |
| Postal code             | `ship-postal-code`     | `getByLabel('Postal code')`                                                                                   |
| Country (native select) | `ship-country`         | `getByLabel('Country')` → `selectOption('CA')`                                                                |
| State / region (custom) | `region-select`        | `getByRole('combobox', { name: 'State / region' })` → click, then `getByRole('option', { name: 'Ontario' })`  |
| Delivery method         | —                      | `getByRole('radio', { name: /Express delivery/ })`                                                            |
| Delivery date button    | `delivery-date-button` | `getByRole('button', { name: 'Delivery date' })`                                                              |
| Calendar popup          | —                      | `getByRole('dialog', { name: 'Choose delivery date' })`                                                       |
| A day                   | —                      | `calendar.getByRole('button', { name: 'Wednesday, November 25, 2026' })` (disabled days are `disabled`)       |
| Month navigation        | —                      | `getByRole('button', { name: 'Next month' })` / `'Previous month'`                                            |
| Payment approved (page) | `payment-approved`     | `getByRole('status').filter({ hasText: 'Payment approved' })`                                                 |
| Order summary (review)  | `order-summary`        | `getByRole('table', { name: 'Order summary' })`                                                               |
| Total (review)          | `order-total`          | `table.getByRole('row', { name: /^Total/ })`                                                                  |

The earliest delivery date depends on today's date, so compute it in the test, or fix the browser clock with `page.clock.setFixedTime(...)` (the server still checks against its real date).

## Payment iframe (`/embed/payment`, inside checkout)

Reach it with `page.frameLocator('iframe[title="Payment form"]')` or `page.getByTitle('Payment form').contentFrame()`.

| Element        | `data-testid` | Suggested locator without a test ID                             |
| -------------- | ------------- | --------------------------------------------------------------- |
| Card number    | `card-number` | `frame.getByLabel('Card number')`                               |
| Expiry / CVC   | —             | `frame.getByLabel('Expiry (MM/YY)')`, `frame.getByLabel('CVC')` |
| Pay button     | —             | `frame.getByRole('button', { name: /^Pay \$/ })`                |
| Declined error | —             | `frame.getByRole('alert')`                                      |
| Approved       | —             | `frame.getByRole('status')`                                     |

Test cards: `4242 4242 4242 4242` (approved), `4000 0000 0000 0002` (declined). Use any future expiry and any 3-digit CVC.

## Orders (`/orders/[id]`, `/account/orders`)

| Element          | `data-testid`   | Suggested locator without a test ID                                          |
| ---------------- | --------------- | ---------------------------------------------------------------------------- |
| Order number     | `order-number`  | `getByRole('heading', { level: 1 })` ("Order SL-000003")                     |
| Thank-you banner | —               | `getByRole('status').filter({ hasText: 'Thank you' })`                       |
| Order total      | `order-total`   | `getByRole('row', { name: /^Total/ })`                                       |
| History table    | `order-history` | `getByRole('table', { name: 'Your orders, newest first' })`                  |
| One history row  | —               | `getByRole('row').filter({ has: getByRole('link', { name: 'SL-000003' }) })` |
| Status badge     | —               | `row.locator('[data-order-status]')` or `row.getByText('paid')`              |

## Playground: frames (`/playground/frames`)

Frame tree: page → `Outer frame` (name `outer`) → `Inner frame` (name `inner`), plus `Sibling frame` (name `sibling`) next to the outer frame.

| Element                  | `data-testid`   | Suggested locator                                                                                     |
| ------------------------ | --------------- | ----------------------------------------------------------------------------------------------------- |
| Outer frame              | —               | `page.frameLocator('iframe[title="Outer frame"]')` or `page.getByTitle('Outer frame').contentFrame()` |
| Inner frame (nested)     | —               | `outer.frameLocator('iframe[title="Inner frame"]')` or `page.frame({ name: 'inner' })`                |
| Sibling frame            | —               | `page.frameLocator('iframe[name="sibling"]')`                                                         |
| Outer: name + Greet      | —               | `outer.getByLabel('Your name')`, `outer.getByRole('button', { name: 'Greet' })`                       |
| Inner: Increment counter | `inner-counter` | `inner.getByRole('button', { name: 'Increment' })`                                                    |
| Inner: checkbox          | —               | `inner.getByRole('checkbox', { name: 'I found the inner frame' })`                                    |
| Sibling: newsletter      | —               | `sibling.getByLabel('Email')`, `sibling.getByRole('button', { name: 'Subscribe' })`                   |

A locator on the outer frame can't see inside the inner frame. You have to enter each level.

## Product detail: new tab and popup

| Element         | `data-testid`  | Suggested locator                                                                             |
| --------------- | -------------- | --------------------------------------------------------------------------------------------- |
| Size guide link | —              | `getByRole('link', { name: 'Size guide' })` (opens a new tab: `context.waitForEvent('page')`) |
| Share button    | `share-button` | `getByRole('button', { name: 'Share' })` (opens a popup: `page.waitForEvent('popup')`)        |

## Size guide (`/size-guide`)

| Element      | `data-testid`        | Suggested locator                                                               |
| ------------ | -------------------- | ------------------------------------------------------------------------------- |
| Product name | `size-guide-product` | `getByText(/^For /)`                                                            |
| Size tables  | —                    | `getByRole('table', { name: 'Clothing sizes (cm)' })`, `{ name: 'Shoe sizes' }` |

## Share popup (`/popup/share`)

| Element       | `data-testid`   | Suggested locator                                                                                                                 |
| ------------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Product link  | —               | `popup.getByLabel('Link to this product')`                                                                                        |
| Copy link     | —               | `popup.getByRole('button', { name: 'Copy link' })` (needs `permissions: ['clipboard-read', 'clipboard-write']` to read it back)   |
| Share to feed | `share-to-feed` | `popup.getByRole('button', { name: 'Share to the ShopLab feed' })`, then the popup closes and a toast appears on the product page |
| Close         | —               | `popup.getByRole('button', { name: 'Close' })`                                                                                    |

## Playground: dialogs (`/playground/dialogs`)

| Element | `data-testid`   | Suggested locator                                                                |
| ------- | --------------- | -------------------------------------------------------------------------------- |
| Buttons | —               | `getByRole('button', { name: 'Show alert' })`, `'Show confirm'`, `'Show prompt'` |
| Result  | `dialog-result` | `getByRole('status')`                                                            |

Register `page.once('dialog', …)` **before** clicking. `dialog.accept()` on a prompt submits an empty string; use `dialog.accept(dialog.defaultValue())` to keep "Guest". Without a handler, Playwright dismisses dialogs (confirm → Cancel).
