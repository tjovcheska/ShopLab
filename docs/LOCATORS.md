# Locators and test IDs

ShopLab gives a `data-testid` to only **some** elements, roughly half of the interactive ones. Everything else has to be found the way users find it: by role, accessible name, label, or text, or with chained and filtered locators. This is deliberate. Students should practice `getByRole` and `getByLabel` first and treat `getByTestId` as one tool among several.

This document has three parts:

1. [Coverage at a glance](#coverage-at-a-glance): which pages have test IDs and which deliberately have none.
2. [Gotchas](#gotchas): traps that make a "correct-looking" locator fail. They make good teaching moments.
3. [Page by page](#page-by-page): every element worth testing, its test ID (if any), and a locator that works without one.

All pages use semantic HTML (`<main>`, `<nav aria-label>`, `<form aria-label>`, `<article>` named by its heading, labelled inputs), so role and label locators work everywhere.

## Coverage at a glance

| Page                                  | Test IDs                                                                                                                                                                              |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Every page: header, banner, toasts    | `header-search-input`, `search-suggestions`, `cart-count`, `logout-button`, `chaos-banner`, `toast`                                                                                   |
| `/` home                              | `new-arrivals` (product cards: **none**)                                                                                                                                              |
| `/login`                              | `login-submit`                                                                                                                                                                        |
| `/register`                           | `register-email`, `register-password`                                                                                                                                                 |
| `/account`                            | `account-email`                                                                                                                                                                       |
| `/admin`                              | **none**                                                                                                                                                                              |
| `/products`                           | `sort-select`, `results-count`, `product-grid`, `product-skeleton`                                                                                                                    |
| `/products/all`                       | `infinite-grid`                                                                                                                                                                       |
| `/products/[slug]`                    | `quantity-input`, `reviews-list`, `live-stock`, `share-button`                                                                                                                        |
| `/search`                             | `search-summary`                                                                                                                                                                      |
| `/size-guide`                         | `size-guide-product`                                                                                                                                                                  |
| `/popup/share`                        | `share-to-feed`                                                                                                                                                                       |
| `/cart`                               | `item-quantity`, `line-total`, `cart-subtotal`, `empty-cart`                                                                                                                          |
| `/checkout`                           | `checkout-progress`, `checkout-next`, `ship-address`, `ship-postal-code`, `ship-country`, `region-select`, `delivery-date-button`, `payment-approved`, `order-summary`, `order-total` |
| `/embed/payment` (iframe in checkout) | `card-number`                                                                                                                                                                         |
| `/orders/[id]`                        | `order-number`, `order-total`                                                                                                                                                         |
| `/account/orders`                     | `order-history`                                                                                                                                                                       |
| `/chaos`                              | `effective-delay`, `effective-flaky`                                                                                                                                                  |
| `/playground`                         | **none**                                                                                                                                                                              |
| `/playground/frames`                  | `inner-counter` (inside the inner frame only; the page, outer frame, and sibling frame have **none**)                                                                                 |
| `/playground/dialogs`                 | `dialog-result`                                                                                                                                                                       |
| `/playground/drag-drop`               | `sortable-list`, `sortable-order`, `column-todo`, `column-done`                                                                                                                       |
| `/playground/shadow-dom`              | `rating-result-product`, `rating-result-delivery` (the stars inside the shadow DOM: **none**)                                                                                         |
| `/playground/upload`                  | `multiple-file-input`                                                                                                                                                                 |
| `/playground/table`                   | `customer-table`, `selected-count`, `row-count`                                                                                                                                       |
| `/playground/hover`                   | `shop-menu-trigger`, `hover-result`                                                                                                                                                   |
| `/playground/visibility`              | `hidden-attribute`, `hidden-visibility`, `hidden-opacity`, `hidden-zero-size`, `removable`, `overlay`, `covered-clicks`, `scroll-clicks`, `far-clicks`, `scroll-box`, `off-screen`    |
| `/api-docs`                           | **none**                                                                                                                                                                              |
| 404 and 403 pages                     | **none**                                                                                                                                                                              |

**Deliberately without test IDs:**

- **Product cards** are on the home page, `/products`, `/products/all`, and `/search`. Students must target a card with `getByRole('article', { name: 'Yoga Mat' })` and then its "Add to cart" button, which has the same name on every card.
- **`/admin`, `/playground`, `/api-docs`, and the error pages** practice pure role, heading, and text locators.
- **Navigation links, form labels, and most buttons** everywhere, so students learn to use accessible names.
- **The shadow DOM stars, menu items, dialog buttons, and calendar days.** Their accessible names are the intended locators.

One attribute that isn't a test ID but is handy: order status badges carry `data-order-status="paid"` (and so on).

## Gotchas

**Names that match more than one element (strict-mode violations)**

- **Next.js's route announcer.** Every page contains a hidden `role="alert"` element inside a shadow root, which Playwright pierces. A bare `page.getByRole('alert')` always finds it, and finds two elements once a real error shows. Scope alerts: `getByRole('form', { name: 'Log in' }).getByRole('alert')`.
- **"Log in"** is the heading, the form, the submit button, and the header link on `/login`. Say which role you mean.
- **`getByLabel('Password')`** on `/register` also matches "Confirm password". Use `{ exact: true }`.
- **`{ name: 'Classic T-Shirt' }`** matches "Classic T-Shirt (Pack of 3)" too. Use `exact: true`.
- **"Add to cart"** is on every product card, and **"Upload"** is on two forms. Scope to the card or region first.
- **"Remove"** is on the cart line and in the confirmation dialog. Scope to `getByRole('dialog')`.
- **"Select Alex Smith"** (and "Sam Lee") matches two rows in the data table. Filter rows by another column first.
- **"1 star" … "5 stars"** exist in both rating components. Scope to the component.
- **Two comboboxes** on checkout: the header search box and the region dropdown. Use the accessible name.

**Timing: wait for state, never sleep**

| Behaviour                                              | Timing                                         | Wait for…                                    |
| ------------------------------------------------------ | ---------------------------------------------- | -------------------------------------------- |
| Search suggestions                                     | 300 ms after the last keystroke, 2+ characters | the listbox or option                        |
| Price sliders → URL                                    | 300 ms after the last change                   | the URL or the results summary               |
| Toasts                                                 | disappear 3 s after appearing                  | the toast (`toBeVisible`), then `toBeHidden` |
| New arrivals (home)                                    | appears after a **random** 1–3 s               | `new-arrivals` to be visible                 |
| Live stock                                             | refreshes every 5 s                            | the number to change                         |
| Product grid, infinite scroll, suggestions, live stock | chaos delay applies (API)                      | the skeleton to go, or the content           |

**Other traps**

- **Hydration.** Server-rendered buttons are visible before React attaches its handlers. ShopLab disables buttons where that's a known problem (the share popup), but a test that clicks the instant a page appears can still beat hydration. Waiting for a later state is enough.
- **Frames.** Locators don't cross iframe boundaries. Nested frames need one `frameLocator()` (or `contentFrame()`) per level.
- **Shadow DOM.** Playwright locators pierce _open_ shadow roots, but `page.evaluate(() => document.querySelector(…))` doesn't.
- **Visibility rules.** `opacity: 0` and an element at `left: -9999px` count as **visible**; `hidden`, `visibility: hidden`, and zero size don't. `aria-disabled="true"` counts as disabled. See `/playground/visibility`.
- **Prompt dialogs.** `dialog.accept()` with no text submits an empty string in Chromium and WebKit but keeps the default in Firefox. Use `dialog.accept(dialog.defaultValue())`.
- **Hover-only UI** on `/playground/hover` doesn't open on click or focus. `hover()` first.
- **Dates.** The earliest delivery date depends on today's date. Compute it, or fix the browser clock with `page.clock` (the server still validates against its real date).

## Page by page

### Shared layout (every page)

| Element          | `data-testid`         | Locator without a test ID                                          |
| ---------------- | --------------------- | ------------------------------------------------------------------ |
| Logo / home link | —                     | `getByRole('link', { name: 'ShopLab' })`                           |
| Search box       | `header-search-input` | `getByRole('combobox', { name: 'Search products' })`               |
| Search button    | —                     | `getByRole('search').getByRole('button', { name: 'Search' })`      |
| Main nav links   | —                     | `getByRole('navigation', { name: 'Main' }).getByRole('link', …)`   |
| Cart link        | —                     | `getByRole('link', { name: /^Cart, \d+ items?$/ })`                |
| Cart count badge | `cart-count`          | (hidden from assistive tech; read the cart link's accessible name) |
| Log in link      | —                     | `getByRole('banner').getByRole('link', { name: 'Log in' })`        |
| Account link     | —                     | `getByRole('banner').getByRole('link', { name: 'Account' })`       |
| Log out button   | `logout-button`       | `getByRole('button', { name: 'Log out' })`                         |
| Footer links     | —                     | `getByRole('navigation', { name: 'Footer' }).getByRole('link', …)` |
| Chaos banner     | `chaos-banner`        | `getByText(/^Chaos mode:/)`                                        |

### Search autocomplete (header)

| Element              | `data-testid`        | Locator without a test ID                                                     |
| -------------------- | -------------------- | ----------------------------------------------------------------------------- |
| Suggestions list     | `search-suggestions` | `getByRole('listbox', { name: 'Product suggestions' })`                       |
| One suggestion       | —                    | `getByRole('option', { name: /^Ceramic Mug/ })` (the name includes the price) |
| Highlighted option   | —                    | `getByRole('option', { selected: true })`                                     |
| Searching / no match | —                    | `getByRole('search').getByRole('status')`                                     |

- `ArrowDown` and `ArrowUp` move the highlight (wrapping at the ends), and the input's `aria-activedescendant` points at it.
- `Enter` on a highlighted option opens that product. `Enter` with nothing highlighted goes to `/search?q=…`. `Escape` closes the list.
- `fill()` sends one request. `pressSequentially()` with a delay shows the debounce at work.

### Toasts (every page)

| Element         | `data-testid` | Locator without a test ID                                            |
| --------------- | ------------- | -------------------------------------------------------------------- |
| Toast container | —             | `getByRole('region', { name: 'Notifications' })`                     |
| One toast       | `toast`       | `getByRole('region', { name: 'Notifications' }).getByRole('status')` |
| Dismiss button  | —             | `getByRole('button', { name: 'Dismiss notification' })`              |

"Add to cart" shows "Added to cart" with "2 × Yoga Mat" underneath. Each toast disappears after 3 seconds.

### Home (`/`) and product cards

| Element             | `data-testid`  | Locator without a test ID                                               |
| ------------------- | -------------- | ----------------------------------------------------------------------- |
| New arrivals widget | `new-arrivals` | `getByRole('region', { name: 'New arrivals' })`                         |
| A product card      | —              | `getByRole('article', { name: 'Yoga Mat' })`                            |
| Card name link      | —              | `card.getByRole('link', { name: 'Yoga Mat' })`                          |
| Card Add to cart    | —              | `card.getByRole('button', { name: 'Add to cart' })`                     |
| Out of stock badge  | —              | `card.getByText('Out of stock')`                                        |
| Card error          | —              | `card.getByRole('alert')` (e.g. "You already have all 2 in your cart.") |

### Log in (`/login`)

| Element       | `data-testid`  | Locator without a test ID                                  |
| ------------- | -------------- | ---------------------------------------------------------- |
| Form          | —              | `getByRole('form', { name: 'Log in' })`                    |
| Email         | —              | `getByLabel('Email')`                                      |
| Password      | —              | `getByLabel('Password')`                                   |
| Submit button | `login-submit` | `getByRole('button', { name: 'Log in' })`                  |
| Error alert   | —              | `getByRole('form', { name: 'Log in' }).getByRole('alert')` |
| Register link | —              | `getByRole('link', { name: 'Create an account' })`         |

### Register (`/register`)

| Element          | `data-testid`       | Locator without a test ID                                                |
| ---------------- | ------------------- | ------------------------------------------------------------------------ |
| Form             | —                   | `getByRole('form', { name: 'Create account' })`                          |
| Full name        | —                   | `getByLabel('Full name')`                                                |
| Email            | `register-email`    | `getByLabel('Email')`                                                    |
| Password         | `register-password` | `getByLabel('Password', { exact: true })`                                |
| Confirm password | —                   | `getByLabel('Confirm password')`                                         |
| Submit button    | —                   | `getByRole('button', { name: 'Create account' })`                        |
| Field error      | —                   | `expect(getByLabel('Email')).toHaveAccessibleDescription(/valid email/)` |

Invalid inputs get `aria-invalid="true"`. The password's description also includes the hint text.

### Account (`/account`) and admin (`/admin`)

| Element      | `data-testid`   | Locator without a test ID                                    |
| ------------ | --------------- | ------------------------------------------------------------ |
| Email value  | `account-email` | `getByRole('definition').filter({ hasText: '@' })`           |
| Welcome text | —               | `getByText('Welcome back,')`                                 |
| Orders link  | —               | `getByRole('link', { name: 'View your order history' })`     |
| Admin stats  | —               | `getByText('Users', { exact: true })` (the value follows it) |
| 403 page     | —               | `getByRole('heading', { level: 1, name: 'Access denied' })`  |

### Products (`/products`)

| Element               | `data-testid`      | Locator without a test ID                                                                                              |
| --------------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| Filters sidebar       | —                  | `getByRole('complementary', { name: 'Filters' })`                                                                      |
| Sort dropdown         | `sort-select`      | `getByLabel('Sort by')`                                                                                                |
| Category checkboxes   | —                  | `getByRole('checkbox', { name: 'Books' })`                                                                             |
| Price sliders         | —                  | `getByLabel('Minimum price')`, `getByLabel('Maximum price')` (use `fill('20')`)                                        |
| In stock only         | —                  | `getByRole('switch', { name: 'In stock only' })`                                                                       |
| Clear filters         | —                  | `getByRole('button', { name: 'Clear filters' })`                                                                       |
| Results summary       | `results-count`    | `getByRole('heading', { name: /^Showing / })`                                                                          |
| Product grid          | `product-grid`     | the `article`s in the results                                                                                          |
| Loading skeleton card | `product-skeleton` | `getByRole('status')` containing "Loading products…"                                                                   |
| Load error + retry    | —                  | `getByRole('alert').filter({ hasText: 'Could not load products' })`, then `getByRole('button', { name: 'Try again' })` |
| Pagination            | —                  | `getByRole('navigation', { name: 'Pagination' }).getByRole('link', { name: 'Page 2' })`                                |

All filters, sorting, and the page number live in the URL, so tests can start from a bookmarked state: `/products?category=books&sort=price-asc&page=2`.

### All products, infinite scroll (`/products/all`)

| Element      | `data-testid`   | Locator without a test ID                                               |
| ------------ | --------------- | ----------------------------------------------------------------------- |
| Product grid | `infinite-grid` | the `article`s on the page                                              |
| Loading more | —               | `getByRole('status').filter({ hasText: 'Loading more…' })`              |
| End of list  | —               | `getByText('End of list')`                                              |
| Load error   | —               | `getByRole('alert')`, then `getByRole('button', { name: 'Try again' })` |

12 products load first. Scrolling to the bottom (`page.mouse.wheel(0, 10000)`) loads 12 more each time, up to 40.

### Product detail (`/products/[slug]`)

| Element         | `data-testid`    | Locator without a test ID                                                             |
| --------------- | ---------------- | ------------------------------------------------------------------------------------- |
| Breadcrumb      | —                | `getByRole('navigation', { name: 'Breadcrumb' })`                                     |
| Product name    | —                | `getByRole('heading', { level: 1 })`                                                  |
| Live stock      | `live-stock`     | `getByText(/^Live stock:/)` (last refresh: `getByText(/^Updated at /)`)               |
| Quantity input  | `quantity-input` | `getByLabel('Quantity')` (`min` 1, `max` = stock)                                     |
| Add to cart     | —                | `getByRole('button', { name: 'Add to cart' })`                                        |
| Size guide link | —                | `getByRole('link', { name: 'Size guide' })` (new tab: `context.waitForEvent('page')`) |
| Share button    | `share-button`   | `getByRole('button', { name: 'Share' })` (popup: `page.waitForEvent('popup')`)        |
| Reviews list    | `reviews-list`   | `getByRole('heading', { name: /^Customer reviews/ })`                                 |
| One review      | —                | `getByRole('article', { name: 'Review by Alice Anderson' })`                          |

### Search results (`/search?q=…`)

| Element | `data-testid`    | Locator without a test ID                                              |
| ------- | ---------------- | ---------------------------------------------------------------------- |
| Summary | `search-summary` | `getByText(/results? for “/)`                                          |
| Results | —                | `getByRole('region', { name: 'Search results' }).getByRole('article')` |

### Size guide (`/size-guide`, opens in a new tab)

| Element      | `data-testid`        | Locator without a test ID                                                       |
| ------------ | -------------------- | ------------------------------------------------------------------------------- |
| Product name | `size-guide-product` | `getByText(/^For /)`                                                            |
| Size tables  | —                    | `getByRole('table', { name: 'Clothing sizes (cm)' })`, `{ name: 'Shoe sizes' }` |

### Share popup (`/popup/share`, opened with `window.open`)

| Element       | `data-testid`   | Locator without a test ID                                                                                                    |
| ------------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Product link  | —               | `popup.getByLabel('Link to this product')`                                                                                   |
| Copy link     | —               | `popup.getByRole('button', { name: 'Copy link' })` (reading the clipboard back needs clipboard permissions, Chromium only)   |
| Share to feed | `share-to-feed` | `popup.getByRole('button', { name: 'Share to the ShopLab feed' })`: the popup closes and a toast appears on the product page |
| Close         | —               | `popup.getByRole('button', { name: 'Close' })`                                                                               |

### Cart (`/cart`)

| Element            | `data-testid`   | Locator without a test ID                                                             |
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

### Checkout (`/checkout`)

| Element                 | `data-testid`          | Locator without a test ID                                                                                     |
| ----------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------- |
| Progress indicator      | `checkout-progress`    | `getByRole('navigation', { name: 'Checkout progress' })`; the current step has `aria-current="step"`          |
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
| A day                   | —                      | `calendar.getByRole('button', { name: 'Wednesday, November 25, 2026' })` (unavailable days are `disabled`)    |
| Month navigation        | —                      | `getByRole('button', { name: 'Next month' })` / `'Previous month'`                                            |
| Payment approved        | `payment-approved`     | `getByRole('status').filter({ hasText: 'Payment approved' })`                                                 |
| Order summary (review)  | `order-summary`        | `getByRole('table', { name: 'Order summary' })`                                                               |
| Total (review)          | `order-total`          | `table.getByRole('row', { name: /^Total/ })`                                                                  |

### Payment iframe (`/embed/payment`, inside checkout)

Enter it with `page.frameLocator('iframe[title="Payment form"]')` or `page.getByTitle('Payment form').contentFrame()`.

| Element        | `data-testid` | Locator without a test ID                                       |
| -------------- | ------------- | --------------------------------------------------------------- |
| Card number    | `card-number` | `frame.getByLabel('Card number')`                               |
| Expiry / CVC   | —             | `frame.getByLabel('Expiry (MM/YY)')`, `frame.getByLabel('CVC')` |
| Pay button     | —             | `frame.getByRole('button', { name: /^Pay \$/ })`                |
| Declined error | —             | `frame.getByRole('alert')`                                      |
| Approved       | —             | `frame.getByRole('status')`                                     |

Test cards: `4242 4242 4242 4242` (approved) and `4000 0000 0000 0002` (declined). Use any future expiry date and any 3-digit CVC.

### Orders (`/orders/[id]`, `/account/orders`)

| Element          | `data-testid`   | Locator without a test ID                                                    |
| ---------------- | --------------- | ---------------------------------------------------------------------------- |
| Order number     | `order-number`  | `getByRole('heading', { level: 1 })` ("Order SL-000003")                     |
| Thank-you banner | —               | `getByRole('status').filter({ hasText: 'Thank you' })`                       |
| Order total      | `order-total`   | `getByRole('row', { name: /^Total/ })`                                       |
| History table    | `order-history` | `getByRole('table', { name: 'Your orders, newest first' })`                  |
| One history row  | —               | `getByRole('row').filter({ has: getByRole('link', { name: 'SL-000003' }) })` |
| Status badge     | —               | `row.locator('[data-order-status]')` or `row.getByText('paid')`              |

### Chaos settings (`/chaos`)

| Element          | `data-testid`                        | Locator without a test ID                                                   |
| ---------------- | ------------------------------------ | --------------------------------------------------------------------------- |
| Delay input      | —                                    | `getByLabel('Delay (ms)')`                                                  |
| Flaky input      | —                                    | `getByLabel('Flaky requests (%)')`                                          |
| Save / Clear     | —                                    | `getByRole('button', { name: 'Save' })`, `{ name: 'Clear chaos settings' }` |
| Values in effect | `effective-delay`, `effective-flaky` | `getByRole('row', { name: /Delay/ }).getByRole('cell').last()`              |

### Playground index (`/playground`)

No test IDs. Every practice page is a link: `getByRole('link', { name: /^Frames/ })`.

### Frames (`/playground/frames`)

Frame tree: page → `Outer frame` (name `outer`) → `Inner frame` (name `inner`), plus `Sibling frame` (name `sibling`) next to the outer one.

| Element              | `data-testid`   | Locator                                                                                               |
| -------------------- | --------------- | ----------------------------------------------------------------------------------------------------- |
| Outer frame          | —               | `page.frameLocator('iframe[title="Outer frame"]')` or `page.getByTitle('Outer frame').contentFrame()` |
| Inner frame (nested) | —               | `outer.frameLocator('iframe[title="Inner frame"]')`, or `page.frame({ name: 'inner' })`               |
| Sibling frame        | —               | `page.frameLocator('iframe[name="sibling"]')`                                                         |
| Outer: name + Greet  | —               | `outer.getByLabel('Your name')`, `outer.getByRole('button', { name: 'Greet' })`                       |
| Inner: counter       | `inner-counter` | `inner.getByRole('button', { name: 'Increment' })`                                                    |
| Inner: checkbox      | —               | `inner.getByRole('checkbox', { name: 'I found the inner frame' })`                                    |
| Sibling: newsletter  | —               | `sibling.getByLabel('Email')`, `sibling.getByRole('button', { name: 'Subscribe' })`                   |

### Dialogs (`/playground/dialogs`)

| Element | `data-testid`   | Locator                                                                          |
| ------- | --------------- | -------------------------------------------------------------------------------- |
| Buttons | —               | `getByRole('button', { name: 'Show alert' })`, `'Show confirm'`, `'Show prompt'` |
| Result  | `dialog-result` | `getByRole('status')`                                                            |

Register `page.once('dialog', …)` **before** clicking. Without a handler, Playwright dismisses dialogs (confirm → Cancel).

### Drag and drop (`/playground/drag-drop`)

| Element          | `data-testid`                | Locator                                                      |
| ---------------- | ---------------------------- | ------------------------------------------------------------ |
| Sortable list    | `sortable-list`              | `getByRole('list', { name: 'Fruits' })`                      |
| One item         | —                            | `list.getByRole('listitem').filter({ hasText: 'Apples' })`   |
| Current order    | `sortable-order`             | `getByText(/^Order:/)`                                       |
| Move buttons     | —                            | `getByRole('button', { name: 'Move Apples up' })`            |
| Board columns    | `column-todo`, `column-done` | `getByRole('region', { name: 'To do' })`, `{ name: 'Done' }` |
| Card move button | —                            | `getByRole('button', { name: 'Move “Set up CI” to To do' })` |

Drag with `source.dragTo(target)`. Drop list items onto another item, and cards onto a column. It works in Chromium, Firefox, and WebKit.

### Shadow DOM (`/playground/shadow-dom`)

| Element            | `data-testid`                                     | Locator                                                                                  |
| ------------------ | ------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| A rating component | —                                                 | `locator('shoplab-rating#product')` or `getByRole('group', { name: 'Product quality' })` |
| A star (in shadow) | —                                                 | `group.getByRole('button', { name: '4 stars' })`                                         |
| Clear              | —                                                 | `group.getByRole('button', { name: 'Clear' })`                                           |
| Result (light DOM) | `rating-result-product`, `rating-result-delivery` | `getByText(/^Product quality:/)`                                                         |

### Upload and download (`/playground/upload`)

| Element           | `data-testid`         | Locator                                                                                           |
| ----------------- | --------------------- | ------------------------------------------------------------------------------------------------- |
| Single-file input | —                     | `getByRole('region', { name: 'Single file' }).getByLabel('Choose a file')`                        |
| Multi-file input  | `multiple-file-input` | `getByLabel('Choose files')`                                                                      |
| Upload buttons    | —                     | `region.getByRole('button', { name: 'Upload' })`                                                  |
| Uploaded files    | —                     | `getByRole('list', { name: 'Single file: uploaded files' })`                                      |
| Error             | —                     | `region.getByRole('alert')`                                                                       |
| Download link     | —                     | `getByRole('link', { name: 'Download product list (CSV)' })` with `page.waitForEvent('download')` |

Use `setInputFiles()` with paths or `{ name, mimeType, buffer }` objects. Files over 2 MB are rejected.

### Data table (`/playground/table`)

| Element            | `data-testid`    | Locator                                                                                 |
| ------------------ | ---------------- | --------------------------------------------------------------------------------------- |
| Table              | `customer-table` | `getByRole('table', { name: 'Customers' })`                                             |
| Filter             | —                | `getByLabel('Filter customers')`                                                        |
| Sort a column      | —                | `getByRole('columnheader', { name: /Orders/ }).getByRole('button')` (check `aria-sort`) |
| A specific row     | —                | `getByRole('row').filter({ hasText: 'Alex Smith' }).filter({ hasText: 'Toronto' })`     |
| Row checkbox       | —                | `row.getByRole('checkbox')`                                                             |
| Select all visible | —                | `getByRole('checkbox', { name: 'Select all visible customers' })`                       |
| Selected count     | `selected-count` | `getByRole('status')`                                                                   |
| Row count          | `row-count`      | `getByText(/^Showing \d+ of/)`                                                          |

### Hover (`/playground/hover`)

| Element                  | `data-testid`       | Locator                                                                                                                |
| ------------------------ | ------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Menu trigger             | `shop-menu-trigger` | `getByText('Shop ▾')` → `hover()`                                                                                      |
| Menu items               | —                   | `getByRole('button', { name: 'Clothing' })` (hidden until hover)                                                       |
| Submenu                  | —                   | hover `getByText('Electronics')`, then `getByRole('button', { name: 'Headphones' })`                                   |
| Tooltip (added on hover) | —                   | hover `getByText('Shipping info')`, then `getByRole('tooltip')`                                                        |
| Tooltip (always in DOM)  | —                   | hover `getByText('Returns policy')`; `getByText('Free returns within 30 days.')` is attached but hidden before         |
| Hover card buttons       | —                   | hover `getByRole('article', { name: 'Wireless Headphones' })`, then `getByRole('button', { name: 'Add to wishlist' })` |
| Last action              | `hover-result`      | `getByRole('status')`                                                                                                  |

### Visibility (`/playground/visibility`)

| Element              | `data-testid`                                                                 | Notes                                                                                                       |
| -------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Hidden variants      | `hidden-attribute`, `hidden-visibility`, `hidden-opacity`, `hidden-zero-size` | Before "Show the messages", only `hidden-opacity` counts as visible                                         |
| Removable paragraph  | `removable`                                                                   | `toBeAttached()` / `not.toBeAttached()`                                                                     |
| Submit (disabled)    | —                                                                             | `getByRole('button', { name: 'Submit' })`, enabled after checking "I agree to the terms"                    |
| aria-disabled button | —                                                                             | `getByRole('button', { name: 'Looks disabled (aria-disabled)' })`; `toBeDisabled()` passes for it           |
| Covered button       | —                                                                             | `getByRole('button', { name: 'Covered button' })`; clicking fails until the overlay is removed              |
| Overlay              | `overlay`                                                                     | `getByText('Overlay', { exact: true })`; removed with `getByRole('button', { name: 'Remove the overlay' })` |
| Click counters       | `covered-clicks`, `scroll-clicks`, `far-clicks`                               | —                                                                                                           |
| Scroll box           | `scroll-box`                                                                  | the button inside is scrolled into view automatically                                                       |
| Off-screen element   | `off-screen`                                                                  | counts as visible; `toBeInViewport()` fails                                                                 |

### API docs (`/api-docs`)

| Element        | `data-testid` | Locator                                                                    |
| -------------- | ------------- | -------------------------------------------------------------------------- |
| Endpoint index | —             | `getByRole('navigation', { name: 'Endpoints' })`                           |
| One endpoint   | —             | `getByRole('article', { name: 'post /auth/login' })` (method in lowercase) |
| Access badge   | —             | `endpoint.getByText('Admin only')` / `'Login required'` / `'Public'`       |
| Response row   | —             | `endpoint.getByRole('row', { name: /^401 / })`                             |
