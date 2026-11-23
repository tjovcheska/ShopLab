# Locators and test IDs

ShopLab gives a `data-testid` to only **some** elements, roughly half of the interactive ones. Everything else has to be found the way users find it: by role, accessible name, label, or text, or with chained and filtered locators. This is deliberate. Students should practice `getByRole` and `getByLabel` first and treat `getByTestId` as one tool among several.

This document has three parts:

1. [Coverage at a glance](#coverage-at-a-glance): which pages have test IDs and which deliberately have none.
2. [Gotchas](#gotchas): traps that make a "correct-looking" locator fail. They make good teaching moments.
3. [Page by page](#page-by-page): every element worth testing, its test ID (if any), and a locator that works without one.

All pages use semantic HTML (`<main>`, `<nav aria-label>`, `<form aria-label>`, `<article>` named by its heading, labelled inputs), so role and label locators work everywhere.

## Coverage at a glance

| Page                                            | Test IDs                                                                                                                                                                              |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Every page: header, banners, toasts             | `header-search-input`, `search-suggestions`, `category-menu`, `cart-count`, `logout-button`, `chaos-banner`, `cookie-overlay`, `toast`                                                |
| `/` home                                        | `new-arrivals` (product cards: **none**)                                                                                                                                              |
| `/login`                                        | `login-submit`                                                                                                                                                                        |
| `/register`                                     | `register-email`, `register-password`                                                                                                                                                 |
| `/account`                                      | `account-email`, `avatar-input`                                                                                                                                                       |
| `/admin`                                        | **none**                                                                                                                                                                              |
| `/admin/orders` (order board)                   | `order-column-paid`, `order-column-shipped`, `board-status`                                                                                                                           |
| `/admin/products`                               | `admin-products-table`, `admin-selected-count`, `admin-row-count`                                                                                                                     |
| `/products`                                     | `sort-select`, `results-count`, `product-grid`, `product-skeleton`                                                                                                                    |
| `/products/all`                                 | `infinite-grid`                                                                                                                                                                       |
| `/products/[slug]`                              | `quantity-input`, `reviews-list`, `live-stock`, `share-button`, `review-photos`                                                                                                       |
| `/search`                                       | `search-summary`                                                                                                                                                                      |
| `/size-guide`                                   | `size-guide-product`                                                                                                                                                                  |
| `/popup/share`                                  | `share-to-feed`                                                                                                                                                                       |
| `/cart`                                         | `item-quantity`, `line-total`, `cart-subtotal`, `empty-cart`                                                                                                                          |
| `/checkout`                                     | `checkout-progress`, `checkout-next`, `ship-address`, `ship-postal-code`, `ship-country`, `region-select`, `delivery-date-button`, `payment-approved`, `order-summary`, `order-total` |
| `/embed/payment` (iframe in checkout)           | `card-number`                                                                                                                                                                         |
| `/embed/3ds` (iframe inside the payment iframe) | **none**                                                                                                                                                                              |
| `/orders/[id]`                                  | `order-number`, `order-total`                                                                                                                                                         |
| `/account/orders`                               | `order-history`                                                                                                                                                                       |
| `/account/wishlist`                             | `wishlist-status`, `empty-wishlist`                                                                                                                                                   |
| `/chaos`                                        | `effective-delay`, `effective-flaky`                                                                                                                                                  |
| `/api-docs`                                     | **none**                                                                                                                                                                              |
| 404 and 403 pages                               | **none**                                                                                                                                                                              |

**Deliberately without test IDs:**

- **Product cards** are on the home page, `/products`, `/products/all`, and `/search`. Students must target a card with `getByRole('article', { name: 'Yoga Mat' })` and then its "Add to cart" button, which has the same name on every card.
- **`/admin`, the bank-verification frame, `/api-docs`, and the error pages** practice pure role, heading, and text locators.
- **Navigation links, form labels, and most buttons** everywhere, so students learn to use accessible names.
- **The shadow-DOM review stars, category menu links, Quick view buttons, dialog buttons, and calendar days.** Their accessible names are the intended locators.

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
- **"Add to cart"** also appears inside an open Quick view dialog, which sits inside the card's `<article>`. Scope to the dialog.
- **Bob Brown** has two cards on the admin order board. Use the order number (`getByRole('listitem', { name: 'Order SL-000003' })`).
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

- **Hydration.** Pages are server-rendered, so inputs and buttons are visible before React attaches its event handlers. Text typed before that point is kept (ShopLab adopts it into React state), but a _click_ that early can do nothing, for example on the custom region dropdown or a Quick view button. When it matters, wait for the marker ShopLab sets once React is ready: `await expect(page.locator('html')).toHaveAttribute('data-hydrated', 'true')`. Iframes have their own marker.
- **Frames.** Locators don't cross iframe boundaries. The 3-D Secure card nests a "Bank verification" iframe _inside_ the payment iframe, so it needs one `frameLocator()` (or `contentFrame()`) per level.
- **Shadow DOM.** Playwright locators pierce _open_ shadow roots, but `page.evaluate(() => document.querySelector(…))` doesn't.
- **Visibility rules.** `visibility: hidden` (Quick view buttons, the checkout tooltip) and `display: none` (the category menu) count as **not visible**, but they're still attached. The "Delivery info" tooltip isn't in the DOM at all until hovered. When the cookie overlay is on, every click on the page fails with "…intercepts pointer events" until it's answered; after that it's removed from the DOM.
- **Native dialogs.** "Cancel order" and "Remove picture" use `confirm()`. "Share wishlist" uses `prompt()` and then `alert()`, which is two dialogs in a row, so one handler must answer both. Without a handler, Playwright dismisses them, so nothing is cancelled or shared.
- **Hover-only UI** (the header category menu, Quick view buttons, the tooltips) doesn't open on click or focus. `hover()` first.
- **Dates.** The earliest delivery date depends on today's date. Compute it, or fix the browser clock with `page.clock` (the server still validates against its real date).

## Page by page

### Shared layout (every page)

| Element                  | `data-testid`         | Locator without a test ID                                                                                                                                                                 |
| ------------------------ | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Logo / home link         | —                     | `getByRole('link', { name: 'ShopLab' })`                                                                                                                                                  |
| Search box               | `header-search-input` | `getByRole('combobox', { name: 'Search products' })`                                                                                                                                      |
| Search button            | —                     | `getByRole('search').getByRole('button', { name: 'Search' })`                                                                                                                             |
| Main nav links           | —                     | `getByRole('navigation', { name: 'Main' }).getByRole('link', …)`                                                                                                                          |
| Category menu (hover)    | `category-menu`       | hover `getByRole('navigation', { name: 'Main' }).getByRole('link', { name: /^Products/ })`, then `getByRole('list', { name: 'Product categories' }).getByRole('link', { name: 'Books' })` |
| Cart link                | —                     | `getByRole('link', { name: /^Cart, \d+ items?$/ })`                                                                                                                                       |
| Cart count badge         | `cart-count`          | (hidden from assistive tech; read the cart link's accessible name)                                                                                                                        |
| Log in link              | —                     | `getByRole('banner').getByRole('link', { name: 'Log in' })`                                                                                                                               |
| Account link             | —                     | `getByRole('banner').getByRole('link', { name: 'Account' })`                                                                                                                              |
| Log out button           | `logout-button`       | `getByRole('button', { name: 'Log out' })`                                                                                                                                                |
| Footer links             | —                     | `getByRole('navigation', { name: 'Footer' }).getByRole('link', …)`                                                                                                                        |
| Chaos banner             | `chaos-banner`        | `getByText(/^Chaos mode:/)`                                                                                                                                                               |
| Cookie overlay (when on) | `cookie-overlay`      | `getByRole('dialog', { name: 'We use cookies' })`, then `getByRole('button', { name: 'Accept all' })` / `'Reject all'`                                                                    |

The cookie overlay is off by default. Turn it on with the "Show cookie consent overlay" checkbox on `/chaos`, or with the cookie `shoplab_cookie_overlay=on`. Setting `shoplab_cookie_consent=accepted` skips it.

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

| Element             | `data-testid`  | Locator without a test ID                                                                               |
| ------------------- | -------------- | ------------------------------------------------------------------------------------------------------- |
| New arrivals widget | `new-arrivals` | `getByRole('region', { name: 'New arrivals' })`                                                         |
| A product card      | —              | `getByRole('article', { name: 'Yoga Mat' })`                                                            |
| Card name link      | —              | `card.getByRole('link', { name: 'Yoga Mat' })`                                                          |
| Card Add to cart    | —              | `card.getByRole('button', { name: 'Add to cart' })`                                                     |
| Out of stock badge  | —              | `card.getByText('Out of stock')`                                                                        |
| Card error          | —              | `card.getByRole('alert')` (e.g. "You already have all 2 in your cart.")                                 |
| Quick view button   | —              | hover the card, then `card.getByRole('button', { name: 'Quick view' })` (visibility hidden until hover) |
| Quick view dialog   | —              | `getByRole('dialog', { name: 'Quick view: Yoga Mat' })`; it loads from the API, so wait for its content |

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

| Element               | `data-testid`   | Locator without a test ID                                                                             |
| --------------------- | --------------- | ----------------------------------------------------------------------------------------------------- |
| Email value           | `account-email` | `getByRole('definition').filter({ hasText: '@' })`                                                    |
| Profile picture input | `avatar-input`  | `getByLabel('Choose a profile picture')`, then `getByRole('button', { name: 'Upload picture' })`      |
| Profile picture       | —               | `getByRole('img', { name: 'Profile picture of Alice Anderson' })` or `{ name: 'No profile picture' }` |
| Remove picture        | —               | `getByRole('button', { name: 'Remove picture' })` (asks with `confirm()`)                             |
| Welcome text          | —               | `getByText('Welcome back,')`                                                                          |
| Orders link           | —               | `getByRole('link', { name: 'View your order history' })`                                              |
| Wishlist link         | —               | `getByRole('link', { name: 'View your wishlist' })`                                                   |
| Admin stats           | —               | `getByText('Users', { exact: true })` (the value follows it)                                          |
| 403 page              | —               | `getByRole('heading', { level: 1, name: 'Access denied' })`                                           |

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

| Element                     | `data-testid`    | Locator without a test ID                                                                                            |
| --------------------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------- |
| Breadcrumb                  | —                | `getByRole('navigation', { name: 'Breadcrumb' })`                                                                    |
| Product name                | —                | `getByRole('heading', { level: 1 })`                                                                                 |
| Live stock                  | `live-stock`     | `getByText(/^Live stock:/)` (last refresh: `getByText(/^Updated at /)`)                                              |
| Quantity input              | `quantity-input` | `getByLabel('Quantity')` (`min` 1, `max` = stock)                                                                    |
| Add to cart                 | —                | `getByRole('button', { name: 'Add to cart' })`                                                                       |
| Size guide link             | —                | `getByRole('link', { name: 'Size guide' })` (new tab: `context.waitForEvent('page')`)                                |
| Share button                | `share-button`   | `getByRole('button', { name: 'Share' })` (popup: `page.waitForEvent('popup')`)                                       |
| Wishlist button             | —                | `getByRole('button', { name: '♡ Add to wishlist' })`; afterwards `getByRole('link', { name: '♥ In your wishlist' })` |
| Delivery tooltip            | —                | hover `getByText('Delivery info')`, then `getByRole('tooltip')` (added to the DOM only while hovered)                |
| Reviews list                | `reviews-list`   | `getByRole('heading', { name: /^Customer reviews/ })`                                                                |
| One review                  | —                | `getByRole('article', { name: 'Review by Alice Anderson' })`                                                         |
| Review form                 | —                | `getByRole('form', { name: 'Write a review' })` (logged in, not yet reviewed)                                        |
| Rating stars (shadow DOM)   | —                | `getByRole('group', { name: 'Your rating' }).getByRole('button', { name: '4 stars' })`                               |
| Comment                     | —                | `form.getByLabel('Your review')`                                                                                     |
| Photos (multiple files)     | `review-photos`  | `form.getByLabel(/Add photos/)` → `setInputFiles([...])` (up to 3 images, 2 MB each)                                 |
| Attached photos on a review | —                | `review.getByRole('list', { name: 'Attached photos' })`                                                              |

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

| Element                 | `data-testid`          | Locator without a test ID                                                                                                |
| ----------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Progress indicator      | `checkout-progress`    | `getByRole('navigation', { name: 'Checkout progress' })`; the current step has `aria-current="step"`                     |
| Step heading            | —                      | `getByRole('heading', { level: 2 })` ("Shipping address", "Delivery options", "Payment", "Review your order")            |
| Next                    | `checkout-next`        | `getByRole('button', { name: 'Next' })`                                                                                  |
| Back / Place order      | —                      | `getByRole('button', { name: 'Back' })`, `{ name: 'Place order' }`                                                       |
| Full name, City         | —                      | `getByLabel('Full name')`, `getByLabel('City')`                                                                          |
| Address                 | `ship-address`         | `getByLabel('Address', { exact: true })` ("Apartment, suite…" also contains "address")                                   |
| Postal code             | `ship-postal-code`     | `getByLabel('Postal code')`                                                                                              |
| Country (native select) | `ship-country`         | `getByLabel('Country')` → `selectOption('CA')`                                                                           |
| State / region (custom) | `region-select`        | `getByRole('combobox', { name: 'State / region' })` → click, then `getByRole('option', { name: 'Ontario' })`             |
| Delivery method         | —                      | `getByRole('radio', { name: /Express delivery/ })`                                                                       |
| Delivery tooltip        | —                      | hover `getByText("What's the difference?")`; the `role="tooltip"` is always attached but `visibility: hidden` until then |
| Delivery date button    | `delivery-date-button` | `getByRole('button', { name: 'Delivery date' })`                                                                         |
| Calendar popup          | —                      | `getByRole('dialog', { name: 'Choose delivery date' })`                                                                  |
| A day                   | —                      | `calendar.getByRole('button', { name: 'Wednesday, November 25, 2026' })` (unavailable days are `disabled`)               |
| Month navigation        | —                      | `getByRole('button', { name: 'Next month' })` / `'Previous month'`                                                       |
| Payment approved        | `payment-approved`     | `getByRole('status').filter({ hasText: 'Payment approved' })`                                                            |
| Order summary (review)  | `order-summary`        | `getByRole('table', { name: 'Order summary' })`                                                                          |
| Total (review)          | `order-total`          | `table.getByRole('row', { name: /^Total/ })`                                                                             |

### Payment iframe (`/embed/payment`, inside checkout)

Enter it with `page.frameLocator('iframe[title="Payment form"]')` or `page.getByTitle('Payment form').contentFrame()`.

| Element                    | `data-testid` | Locator without a test ID                                                                                                                            |
| -------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Card number                | `card-number` | `frame.getByLabel('Card number')`                                                                                                                    |
| Expiry / CVC               | —             | `frame.getByLabel('Expiry (MM/YY)')`, `frame.getByLabel('CVC')`                                                                                      |
| Pay button                 | —             | `frame.getByRole('button', { name: /^Pay \$/ })`                                                                                                     |
| Declined error             | —             | `frame.getByRole('alert')`                                                                                                                           |
| Approved                   | —             | `frame.getByRole('status')`                                                                                                                          |
| Bank verification (nested) | —             | `frame.frameLocator('iframe[title="Bank verification"]')`: `getByLabel('Verification code')`, `getByRole('button', { name: 'Verify' })` / `'Cancel'` |

Test cards: `4242 4242 4242 4242` (approved), `4000 0000 0000 0002` (declined), and `4000 0027 6000 3184` (3-D Secure: opens the nested "Bank verification" frame; the code is `123456`). Use any future expiry date and any 3-digit CVC.

### Orders (`/orders/[id]`, `/account/orders`)

| Element          | `data-testid`   | Locator without a test ID                                                                           |
| ---------------- | --------------- | --------------------------------------------------------------------------------------------------- |
| Order number     | `order-number`  | `getByRole('heading', { level: 1 })` ("Order SL-000003")                                            |
| Thank-you banner | —               | `getByRole('status').filter({ hasText: 'Thank you' })`                                              |
| Order total      | `order-total`   | `getByRole('row', { name: /^Total/ })`                                                              |
| History table    | `order-history` | `getByRole('table', { name: 'Your orders, newest first' })`                                         |
| One history row  | —               | `getByRole('row').filter({ has: getByRole('link', { name: 'SL-000003' }) })`                        |
| Status badge     | —               | `row.locator('[data-order-status]')` or `row.getByText('paid')`                                     |
| Invoice download | —               | `getByRole('link', { name: 'Download invoice (CSV)' })` with `page.waitForEvent('download')`        |
| Cancel order     | —               | `getByRole('button', { name: 'Cancel order SL-000002' })` (paid orders only; asks with `confirm()`) |

### Chaos settings (`/chaos`)

| Element          | `data-testid`                        | Locator without a test ID                                                   |
| ---------------- | ------------------------------------ | --------------------------------------------------------------------------- |
| Delay input      | —                                    | `getByLabel('Delay (ms)')`                                                  |
| Flaky input      | —                                    | `getByLabel('Flaky requests (%)')`                                          |
| Save / Clear     | —                                    | `getByRole('button', { name: 'Save' })`, `{ name: 'Clear chaos settings' }` |
| Values in effect | `effective-delay`, `effective-flaky` | `getByRole('row', { name: /Delay/ }).getByRole('cell').last()`              |

### Wishlist (`/account/wishlist`)

| Element        | `data-testid`     | Locator without a test ID                                                          |
| -------------- | ----------------- | ---------------------------------------------------------------------------------- |
| The list       | —                 | `getByRole('list', { name: 'Wishlist' })`                                          |
| One product    | —                 | `list.getByRole('listitem').filter({ hasText: 'Rain Jacket' })`                    |
| Move buttons   | —                 | `getByRole('button', { name: 'Move Coffee Grinder up' })` / `down`                 |
| Remove         | —                 | `getByRole('button', { name: 'Remove Smart Watch from wishlist' })`                |
| Share wishlist | —                 | `getByRole('button', { name: 'Share wishlist' })`: a `prompt()`, then an `alert()` |
| Status         | `wishlist-status` | `getByRole('status')` ("Wishlist order saved.")                                    |
| Empty state    | `empty-wishlist`  | `getByText('Your wishlist is empty.')`                                             |

Reorder by dropping one product onto another with `dragTo()`; the new order is saved and survives a reload. Alice's seeded wishlist is Hiking Backpack, Smart Watch, Coffee Grinder, Rain Jacket.

### Admin order board (`/admin/orders`)

| Element        | `data-testid`                               | Locator without a test ID                                                  |
| -------------- | ------------------------------------------- | -------------------------------------------------------------------------- |
| Columns        | `order-column-paid`, `order-column-shipped` | `getByRole('region', { name: 'Paid' })`, `{ name: 'Shipped' }`             |
| Column count   | —                                           | `column.getByRole('heading')` ("Paid (3)")                                 |
| One order card | —                                           | `getByRole('listitem', { name: 'Order SL-000003' })`                       |
| Move button    | —                                           | `card.getByRole('button', { name: 'Mark as shipped' })` / `'Back to paid'` |
| Status         | `board-status`                              | `getByRole('status')` ("SL-000003 is now shipped.")                        |

Drag a card onto the other column with `dragTo()`. The change is saved, so reset the data between tests (`POST /api/test/reset`). Customers get a 403.

### Admin products (`/admin/products`)

| Element            | `data-testid`          | Locator without a test ID                                                                                                                 |
| ------------------ | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Table              | `admin-products-table` | `getByRole('table', { name: 'Products' })`                                                                                                |
| Filter             | —                      | `getByLabel('Filter products')`                                                                                                           |
| Sort a column      | —                      | `getByRole('columnheader', { name: /Price/ }).getByRole('button')` (check `aria-sort`)                                                    |
| Row checkbox       | —                      | `getByRole('checkbox', { name: 'Select Ceramic Mug', exact: true })` ("Ceramic Mug Set" also matches without `exact`)                     |
| Select all visible | —                      | `getByRole('checkbox', { name: 'Select all visible products' })`                                                                          |
| Selected count     | `admin-selected-count` | `getByText(/^\d+ selected$/)`                                                                                                             |
| Bulk actions       | —                      | `getByRole('button', { name: 'Mark out of stock' })`, `{ name: 'Delete selected' }` → `getByRole('dialog', { name: 'Delete products?' })` |
| Row count          | `admin-row-count`      | `getByText(/^Showing \d+ of/)`                                                                                                            |
| Export CSV         | —                      | `getByRole('link', { name: 'Export CSV' })` with `page.waitForEvent('download')`                                                          |

Products that appear in an order are never deleted; the alert lists them.

### API docs (`/api-docs`)

| Element        | `data-testid` | Locator                                                                    |
| -------------- | ------------- | -------------------------------------------------------------------------- |
| Endpoint index | —             | `getByRole('navigation', { name: 'Endpoints' })`                           |
| One endpoint   | —             | `getByRole('article', { name: 'post /auth/login' })` (method in lowercase) |
| Access badge   | —             | `endpoint.getByText('Admin only')` / `'Login required'` / `'Public'`       |
| Response row   | —             | `endpoint.getByRole('row', { name: /^401 / })`                             |
