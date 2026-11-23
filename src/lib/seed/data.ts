// Static seed data. Kept separate from seed.ts so it is easy to read and edit.
// Everything here is fixed: the seed produces the same data on every run.

export type SeedCategory = { name: string; slug: string; color: string };

export type SeedProduct = {
  name: string;
  slug: string;
  category: string; // category slug
  description: string;
  priceCents: number;
  stock: number;
  rating: number; // 1–5
};

export const categories: SeedCategory[] = [
  { name: "Electronics", slug: "electronics", color: "#2563eb" },
  { name: "Home & Kitchen", slug: "home-kitchen", color: "#16a34a" },
  { name: "Clothing", slug: "clothing", color: "#db2777" },
  { name: "Books", slug: "books", color: "#9333ea" },
  { name: "Sports & Outdoors", slug: "sports-outdoors", color: "#ea580c" },
];

// 40 products, 8 per category. Products with stock 0 are out of stock.
// Note the near-duplicate names (e.g. "Classic T-Shirt" / "Classic T-Shirt
// (Pack of 3)"): they exist on purpose for practicing exact vs. partial
// text locators.
export const products: SeedProduct[] = [
  // Electronics
  {
    name: "Wireless Headphones",
    slug: "wireless-headphones",
    category: "electronics",
    description:
      "Over-ear Bluetooth headphones with 30-hour battery life and active noise cancelling.",
    priceCents: 8999,
    stock: 25,
    rating: 5,
  },
  {
    name: "Mechanical Keyboard",
    slug: "mechanical-keyboard",
    category: "electronics",
    description:
      "Compact 75% keyboard with hot-swappable switches and RGB backlight.",
    priceCents: 12950,
    stock: 12,
    rating: 4,
  },
  {
    name: "USB-C Charger 65W",
    slug: "usb-c-charger-65w",
    category: "electronics",
    description: "Fast GaN charger with two USB-C ports and one USB-A port.",
    priceCents: 3499,
    stock: 60,
    rating: 4,
  },
  {
    name: "Smart Watch",
    slug: "smart-watch",
    category: "electronics",
    description: "Fitness tracking, heart-rate monitor and seven-day battery.",
    priceCents: 19900,
    stock: 0,
    rating: 3,
  },
  {
    name: "Portable Speaker",
    slug: "portable-speaker",
    category: "electronics",
    description: "Waterproof speaker with deep bass, perfect for the beach.",
    priceCents: 4599,
    stock: 18,
    rating: 4,
  },
  {
    name: "Webcam HD",
    slug: "webcam-hd",
    category: "electronics",
    description: "1080p webcam with built-in microphone and privacy shutter.",
    priceCents: 5900,
    stock: 7,
    rating: 3,
  },
  {
    name: "Wireless Mouse",
    slug: "wireless-mouse",
    category: "electronics",
    description:
      "Ergonomic mouse with silent clicks and a rechargeable battery.",
    priceCents: 2499,
    stock: 40,
    rating: 5,
  },
  {
    name: "4K Monitor",
    slug: "4k-monitor",
    category: "electronics",
    description: "27-inch IPS display with USB-C power delivery.",
    priceCents: 34900,
    stock: 3,
    rating: 5,
  },

  // Home & Kitchen
  {
    name: "Coffee Grinder",
    slug: "coffee-grinder",
    category: "home-kitchen",
    description:
      "Burr grinder with 18 grind settings, from espresso to French press.",
    priceCents: 6450,
    stock: 14,
    rating: 4,
  },
  {
    name: "French Press",
    slug: "french-press",
    category: "home-kitchen",
    description:
      "1-litre borosilicate glass French press with a stainless steel filter.",
    priceCents: 2900,
    stock: 33,
    rating: 5,
  },
  {
    name: "Chef's Knife",
    slug: "chefs-knife",
    category: "home-kitchen",
    description: "20 cm stainless steel knife with a full-tang handle.",
    priceCents: 7900,
    stock: 9,
    rating: 5,
  },
  {
    name: "Cast Iron Skillet",
    slug: "cast-iron-skillet",
    category: "home-kitchen",
    description: "Pre-seasoned 26 cm skillet for stovetop, oven, or campfire.",
    priceCents: 3999,
    stock: 21,
    rating: 4,
  },
  {
    name: "Electric Kettle",
    slug: "electric-kettle",
    category: "home-kitchen",
    description:
      "1.7-litre kettle with temperature control and keep-warm mode.",
    priceCents: 4950,
    stock: 0,
    rating: 4,
  },
  {
    name: "Cutting Board",
    slug: "cutting-board",
    category: "home-kitchen",
    description: "Large bamboo cutting board with a juice groove.",
    priceCents: 1899,
    stock: 50,
    rating: 3,
  },
  {
    name: "Ceramic Mug",
    slug: "ceramic-mug",
    category: "home-kitchen",
    description: "350 ml handmade ceramic mug, dishwasher safe.",
    priceCents: 1200,
    stock: 80,
    rating: 4,
  },
  {
    name: "Ceramic Mug Set",
    slug: "ceramic-mug-set",
    category: "home-kitchen",
    description: "Set of four 350 ml ceramic mugs in assorted colours.",
    priceCents: 3900,
    stock: 11,
    rating: 4,
  },

  // Clothing
  {
    name: "Classic T-Shirt",
    slug: "classic-t-shirt",
    category: "clothing",
    description: "100% organic cotton crew-neck T-shirt.",
    priceCents: 1999,
    stock: 100,
    rating: 4,
  },
  {
    name: "Classic T-Shirt (Pack of 3)",
    slug: "classic-t-shirt-pack-of-3",
    category: "clothing",
    description:
      "Three organic cotton crew-neck T-shirts: white, grey and black.",
    priceCents: 4999,
    stock: 30,
    rating: 5,
  },
  {
    name: "Denim Jacket",
    slug: "denim-jacket",
    category: "clothing",
    description: "Relaxed-fit denim jacket with button front.",
    priceCents: 8900,
    stock: 6,
    rating: 4,
  },
  {
    name: "Running Shoes",
    slug: "running-shoes",
    category: "clothing",
    description: "Lightweight running shoes with breathable mesh upper.",
    priceCents: 11900,
    stock: 15,
    rating: 5,
  },
  {
    name: "Wool Beanie",
    slug: "wool-beanie",
    category: "clothing",
    description: "Warm merino wool beanie, one size fits most.",
    priceCents: 2200,
    stock: 0,
    rating: 3,
  },
  {
    name: "Rain Jacket",
    slug: "rain-jacket",
    category: "clothing",
    description: "Waterproof, breathable shell with an adjustable hood.",
    priceCents: 13500,
    stock: 8,
    rating: 4,
  },
  {
    name: "Leather Belt",
    slug: "leather-belt",
    category: "clothing",
    description: "Full-grain leather belt with a brushed metal buckle.",
    priceCents: 3450,
    stock: 27,
    rating: 2,
  },
  {
    name: "Hoodie",
    slug: "hoodie",
    category: "clothing",
    description: "Heavyweight fleece hoodie with a kangaroo pocket.",
    priceCents: 5500,
    stock: 19,
    rating: 4,
  },

  // Books
  {
    name: "Learning TypeScript",
    slug: "learning-typescript",
    category: "books",
    description:
      "A practical introduction to TypeScript for JavaScript developers.",
    priceCents: 3999,
    stock: 22,
    rating: 5,
  },
  {
    name: "The Testing Mindset",
    slug: "the-testing-mindset",
    category: "books",
    description: "How great testers think about risk, coverage and quality.",
    priceCents: 2799,
    stock: 13,
    rating: 4,
  },
  {
    name: "Web Accessibility Handbook",
    slug: "web-accessibility-handbook",
    category: "books",
    description: "Building inclusive websites with semantic HTML and ARIA.",
    priceCents: 3250,
    stock: 0,
    rating: 5,
  },
  {
    name: "Clean Code Patterns",
    slug: "clean-code-patterns",
    category: "books",
    description: "Readable, maintainable code through small, focused examples.",
    priceCents: 4500,
    stock: 17,
    rating: 3,
  },
  {
    name: "Mystery at Midnight",
    slug: "mystery-at-midnight",
    category: "books",
    description: "A page-turning detective novel set in a snowed-in hotel.",
    priceCents: 1499,
    stock: 44,
    rating: 4,
  },
  {
    name: "Cooking for Beginners",
    slug: "cooking-for-beginners",
    category: "books",
    description: "100 simple recipes with step-by-step photos.",
    priceCents: 2299,
    stock: 5,
    rating: 4,
  },
  {
    name: "Space: A Visual Guide",
    slug: "space-a-visual-guide",
    category: "books",
    description:
      "A beautifully illustrated tour of the solar system and beyond.",
    priceCents: 2999,
    stock: 9,
    rating: 5,
  },
  {
    name: "Pocket Dictionary",
    slug: "pocket-dictionary",
    category: "books",
    description: "Compact English dictionary with 40,000 definitions.",
    priceCents: 999,
    stock: 2,
    rating: 2,
  },

  // Sports & Outdoors
  {
    name: "Yoga Mat",
    slug: "yoga-mat",
    category: "sports-outdoors",
    description: "6 mm non-slip yoga mat with a carrying strap.",
    priceCents: 2999,
    stock: 35,
    rating: 4,
  },
  {
    name: "Water Bottle",
    slug: "water-bottle",
    category: "sports-outdoors",
    description:
      "Insulated stainless steel bottle, keeps drinks cold for 24 hours.",
    priceCents: 2450,
    stock: 70,
    rating: 5,
  },
  {
    name: "Camping Tent",
    slug: "camping-tent",
    category: "sports-outdoors",
    description: "Two-person tent that sets up in under five minutes.",
    priceCents: 15900,
    stock: 4,
    rating: 4,
  },
  {
    name: "Hiking Backpack",
    slug: "hiking-backpack",
    category: "sports-outdoors",
    description: "35-litre backpack with a rain cover and hydration sleeve.",
    priceCents: 8999,
    stock: 10,
    rating: 4,
  },
  {
    name: "Resistance Bands",
    slug: "resistance-bands",
    category: "sports-outdoors",
    description: "Set of five bands with different resistance levels.",
    priceCents: 1599,
    stock: 0,
    rating: 3,
  },
  {
    name: "Tennis Racket",
    slug: "tennis-racket",
    category: "sports-outdoors",
    description: "Lightweight graphite racket for intermediate players.",
    priceCents: 9900,
    stock: 6,
    rating: 3,
  },
  {
    name: "Bike Helmet",
    slug: "bike-helmet",
    category: "sports-outdoors",
    description:
      "Ventilated helmet with an adjustable fit system and rear light.",
    priceCents: 4999,
    stock: 16,
    rating: 5,
  },
  {
    name: "Jump Rope",
    slug: "jump-rope",
    category: "sports-outdoors",
    description: "Speed jump rope with ball bearings and adjustable cable.",
    priceCents: 899,
    stock: 55,
    rating: 4,
  },
];

export const users = [
  {
    email: "alice@shoplab.test",
    password: "Password123!",
    name: "Alice Anderson",
    role: "customer" as const,
  },
  {
    email: "bob@shoplab.test",
    password: "Password123!",
    name: "Bob Brown",
    role: "customer" as const,
  },
  {
    email: "admin@shoplab.test",
    password: "Admin123!",
    name: "Admin User",
    role: "admin" as const,
  },
];

export const reviews = [
  {
    product: "wireless-headphones",
    user: "alice@shoplab.test",
    rating: 5,
    comment: "Amazing sound and the battery lasts forever.",
  },
  {
    product: "wireless-headphones",
    user: "bob@shoplab.test",
    rating: 4,
    comment: "Great, but a little tight on my head.",
  },
  {
    product: "mechanical-keyboard",
    user: "bob@shoplab.test",
    rating: 4,
    comment: "Lovely to type on. A bit loud for the office.",
  },
  {
    product: "french-press",
    user: "alice@shoplab.test",
    rating: 5,
    comment: "Makes perfect coffee every morning.",
  },
  {
    product: "chefs-knife",
    user: "bob@shoplab.test",
    rating: 5,
    comment: "Very sharp out of the box.",
  },
  {
    product: "classic-t-shirt",
    user: "alice@shoplab.test",
    rating: 4,
    comment: "Soft and fits well. Runs slightly large.",
  },
  {
    product: "running-shoes",
    user: "bob@shoplab.test",
    rating: 5,
    comment: "Comfortable from the first run.",
  },
  {
    product: "leather-belt",
    user: "alice@shoplab.test",
    rating: 2,
    comment: "The buckle scratched after a week.",
  },
  {
    product: "learning-typescript",
    user: "alice@shoplab.test",
    rating: 5,
    comment: "Clear explanations and good exercises.",
  },
  {
    product: "the-testing-mindset",
    user: "bob@shoplab.test",
    rating: 4,
    comment: "Changed how I think about test design.",
  },
  {
    product: "yoga-mat",
    user: "alice@shoplab.test",
    rating: 4,
    comment: "Good grip, but it smelled for a few days.",
  },
  {
    product: "camping-tent",
    user: "bob@shoplab.test",
    rating: 4,
    comment: "Easy to set up, survived a rainy weekend.",
  },
];

const aliceAddress = {
  fullName: "Alice Anderson",
  line1: "12 Test Street",
  city: "Springfield",
  region: "IL",
  postalCode: "62701",
  country: "US",
};

const bobAddress = {
  fullName: "Bob Brown",
  line1: "48 Sample Road",
  city: "Toronto",
  region: "ON",
  postalCode: "M5V 2T6",
  country: "CA",
};

// Alice has a shipped and a paid order; Bob has two paid orders. On the admin
// order board that gives cards in both columns, and two cards with the same
// customer name.
export const pastOrders = [
  {
    user: "alice@shoplab.test",
    status: "shipped" as const,
    deliveryMethod: "standard",
    createdAt: "2026-09-14T10:30:00.000Z",
    deliveryDate: "2026-09-18T00:00:00.000Z",
    shippingAddress: aliceAddress,
    items: [
      { product: "wireless-headphones", quantity: 1 },
      { product: "french-press", quantity: 2 },
    ],
  },
  {
    user: "alice@shoplab.test",
    status: "paid" as const,
    deliveryMethod: "express",
    createdAt: "2026-10-28T16:05:00.000Z",
    deliveryDate: "2026-11-03T00:00:00.000Z",
    shippingAddress: aliceAddress,
    items: [
      { product: "learning-typescript", quantity: 1 },
      { product: "yoga-mat", quantity: 1 },
      { product: "classic-t-shirt", quantity: 3 },
    ],
  },
  {
    user: "bob@shoplab.test",
    status: "paid" as const,
    deliveryMethod: "standard",
    createdAt: "2026-11-10T09:15:00.000Z",
    deliveryDate: "2026-11-17T00:00:00.000Z",
    shippingAddress: bobAddress,
    items: [
      { product: "hoodie", quantity: 1 },
      { product: "water-bottle", quantity: 2 },
    ],
  },
  {
    user: "bob@shoplab.test",
    status: "paid" as const,
    deliveryMethod: "express",
    createdAt: "2026-11-18T14:40:00.000Z",
    deliveryDate: "2026-11-24T00:00:00.000Z",
    shippingAddress: bobAddress,
    items: [{ product: "camping-tent", quantity: 1 }],
  },
];

// Alice's wishlist, in her chosen order (reorderable by drag and drop).
export const wishlists = [
  {
    user: "alice@shoplab.test",
    products: [
      "hiking-backpack",
      "smart-watch",
      "coffee-grinder",
      "rain-jacket",
    ],
  },
];
