// The OpenAPI 3.1 description of /api/v1. Served as JSON at
// /api/v1/openapi.json and rendered as the /api-docs page.
//
// Keep it in sync with the route handlers in src/app/api/v1 and the request
// schemas in src/lib/validation/api.ts.

type Access = "public" | "user" | "admin";

const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });
const jsonBody = (schema: object, example?: unknown) => ({
  required: true,
  content: { "application/json": { schema, ...(example ? { example } : {}) } },
});
const ok = (description: string, schema?: object) => ({
  description,
  ...(schema ? { content: { "application/json": { schema } } } : {}),
});
const err = (description: string) => ({
  description,
  content: { "application/json": { schema: ref("Error") } },
});

// Error responses most operations share.
const common = {
  "500": err(
    "CHAOS_FLAKY: simulated failure in flaky mode (see /chaos). INTERNAL_ERROR: unexpected server error.",
  ),
};
const auth = {
  "401": err("UNAUTHORIZED: no valid session cookie or bearer token."),
};
const admin = {
  ...auth,
  "403": err("FORBIDDEN: the caller is logged in but is not an admin."),
};
const security = (access: Access) =>
  access === "public" ? [] : [{ bearerAuth: [] }, { cookieAuth: [] }];

function op(
  access: Access,
  tag: string,
  summary: string,
  details: Record<string, unknown>,
) {
  return {
    tags: [tag],
    summary,
    "x-access": access,
    security: security(access),
    ...details,
  };
}

const idParam = (description: string) => ({
  name: "id",
  in: "path",
  required: true,
  description,
  schema: { type: "integer", minimum: 1 },
});
const badId = {
  "400": err("VALIDATION_ERROR: the id is not a positive whole number."),
};

const exampleAddress = {
  fullName: "Alice Anderson",
  line1: "12 Test Street",
  line2: "",
  city: "Springfield",
  region: "IL",
  postalCode: "62701",
  country: "US",
};
const exampleProductInput = {
  name: "Travel Mug",
  description: "Insulated 400 ml travel mug with a leak-proof lid.",
  priceCents: 2499,
  stock: 20,
  categoryId: 2,
  rating: 4,
};

export const openApiDocument = {
  openapi: "3.1.0",
  info: {
    title: "ShopLab API",
    version: "1.0.0",
    description:
      "JSON REST API of ShopLab, a practice shop for test automation. " +
      'Every error has the shape { "error": { "code", "message", "details"? } }. ' +
      "Authenticate with the session cookie (shoplab_session) or with " +
      "Authorization: Bearer <token> from POST /auth/login. Chaos settings " +
      "(?delay=, shoplab_delay and shoplab_flaky cookies) apply to every endpoint.",
  },
  servers: [{ url: "/api/v1" }],
  tags: [
    { name: "Auth", description: "Log in and register." },
    { name: "Products", description: "The catalog. Changes are admin only." },
    { name: "Categories", description: "Product categories." },
    { name: "Cart", description: "The caller's shopping cart." },
    { name: "Orders", description: "Placing and viewing orders." },
    { name: "Reviews", description: "Product reviews." },
  ],
  paths: {
    "/auth/login": {
      post: op("public", "Auth", "Log in and get a bearer token", {
        requestBody: jsonBody(ref("LoginRequest"), {
          email: "alice@shoplab.test",
          password: "Password123!",
        }),
        responses: {
          "200": ok("Logged in.", ref("AuthResponse")),
          "400": err("INVALID_JSON or VALIDATION_ERROR."),
          "401": err("INVALID_CREDENTIALS: wrong email or password."),
          ...common,
        },
      }),
    },
    "/auth/register": {
      post: op("public", "Auth", "Create a customer account", {
        description: "Password: at least 8 characters, including a number.",
        requestBody: jsonBody(ref("RegisterRequest"), {
          name: "New Student",
          email: "student@shoplab.test",
          password: "Secret123",
        }),
        responses: {
          "201": ok(
            "Account created; the response includes a token.",
            ref("AuthResponse"),
          ),
          "400": err("INVALID_JSON or VALIDATION_ERROR."),
          "409": err("EMAIL_TAKEN: an account with this email already exists."),
          ...common,
        },
      }),
    },
    "/products": {
      get: op("public", "Products", "List products", {
        description:
          "Filter, sort, and paginate. All query parameters are optional.",
        parameters: [
          {
            name: "q",
            in: "query",
            description: "Name contains (case-insensitive).",
            schema: { type: "string" },
          },
          {
            name: "category",
            in: "query",
            description:
              "Category slug. Repeat for several: ?category=books&category=clothing.",
            schema: { type: "array", items: { type: "string" } },
            style: "form",
            explode: true,
          },
          {
            name: "minPrice",
            in: "query",
            description: "Minimum price in whole dollars (inclusive).",
            schema: { type: "integer", minimum: 0 },
          },
          {
            name: "maxPrice",
            in: "query",
            description: "Maximum price in whole dollars (inclusive).",
            schema: { type: "integer", minimum: 0 },
          },
          {
            name: "inStock",
            in: "query",
            description: "true: only products with stock > 0.",
            schema: { type: "boolean" },
          },
          {
            name: "sort",
            in: "query",
            description: "Sort order.",
            schema: {
              type: "string",
              enum: [
                "name-asc",
                "name-desc",
                "price-asc",
                "price-desc",
                "rating-desc",
                "newest",
              ],
              default: "name-asc",
            },
          },
          {
            name: "page",
            in: "query",
            description: "Page number.",
            schema: { type: "integer", minimum: 1, default: 1 },
          },
          {
            name: "pageSize",
            in: "query",
            description: "Products per page.",
            schema: { type: "integer", minimum: 1, maximum: 100, default: 12 },
          },
        ],
        responses: {
          "200": ok("A page of products.", ref("ProductList")),
          "400": err(
            "VALIDATION_ERROR: an invalid query parameter (details.fields says which).",
          ),
          ...common,
        },
      }),
      post: op("admin", "Products", "Create a product", {
        description:
          "slug is generated from the name if left out. rating defaults to 3, imageUrl to a placeholder.",
        requestBody: jsonBody(ref("ProductInput"), exampleProductInput),
        responses: {
          "201": ok("Created.", {
            type: "object",
            properties: { product: ref("Product") },
          }),
          "400": err(
            "INVALID_JSON or VALIDATION_ERROR (including an unknown categoryId).",
          ),
          ...admin,
          "409": err("SLUG_TAKEN: another product already uses this slug."),
          ...common,
        },
      }),
    },
    "/products/{id}": {
      get: op("public", "Products", "Get one product", {
        parameters: [idParam("Product id.")],
        responses: {
          "200": ok("The product.", {
            type: "object",
            properties: { product: ref("Product") },
          }),
          ...badId,
          "404": err("NOT_FOUND: no product with this id."),
          ...common,
        },
      }),
      put: op("admin", "Products", "Replace a product", {
        description:
          "PUT replaces every field: send the full product. Optional fields you leave out go back to their defaults.",
        parameters: [idParam("Product id.")],
        requestBody: jsonBody(ref("ProductInput"), {
          ...exampleProductInput,
          stock: 5,
        }),
        responses: {
          "200": ok("Updated.", {
            type: "object",
            properties: { product: ref("Product") },
          }),
          "400": err("INVALID_JSON or VALIDATION_ERROR."),
          ...admin,
          "404": err("NOT_FOUND: no product with this id."),
          "409": err("SLUG_TAKEN: another product already uses this slug."),
          ...common,
        },
      }),
      delete: op("admin", "Products", "Delete a product", {
        description: "Also deletes its reviews and removes it from carts.",
        parameters: [idParam("Product id.")],
        responses: {
          "204": ok("Deleted. No response body."),
          ...badId,
          ...admin,
          "404": err("NOT_FOUND: no product with this id."),
          "409": err(
            "PRODUCT_HAS_ORDERS: the product is part of an order and cannot be deleted.",
          ),
          ...common,
        },
      }),
    },
    "/categories": {
      get: op("public", "Categories", "List categories", {
        responses: {
          "200": ok("All categories.", {
            type: "object",
            properties: {
              categories: { type: "array", items: ref("Category") },
            },
          }),
          ...common,
        },
      }),
    },
    "/cart": {
      get: op("user", "Cart", "Get your cart", {
        responses: { "200": ok("The cart.", ref("Cart")), ...auth, ...common },
      }),
    },
    "/cart/items": {
      post: op("user", "Cart", "Add a product to your cart", {
        description:
          "If the product is already in the cart, its quantity grows (response 200 instead of 201).",
        requestBody: jsonBody(ref("CartItemCreate"), {
          productId: 1,
          quantity: 2,
        }),
        responses: {
          "201": ok("A new cart line was created.", {
            type: "object",
            properties: { item: ref("CartItem") },
          }),
          "200": ok("An existing cart line grew.", {
            type: "object",
            properties: { item: ref("CartItem") },
          }),
          "400": err("INVALID_JSON or VALIDATION_ERROR."),
          ...auth,
          "404": err("NOT_FOUND: no product with this id."),
          "409": err("INSUFFICIENT_STOCK: not enough stock for this quantity."),
          ...common,
        },
      }),
    },
    "/cart/items/{id}": {
      patch: op("user", "Cart", "Change the quantity of a cart line", {
        parameters: [
          idParam(
            "Cart item id (the id in GET /cart items), not the product id.",
          ),
        ],
        requestBody: jsonBody(ref("CartItemUpdate"), { quantity: 3 }),
        responses: {
          "200": ok("Updated.", {
            type: "object",
            properties: { item: ref("CartItem") },
          }),
          "400": err("INVALID_JSON or VALIDATION_ERROR."),
          ...auth,
          "404": err("NOT_FOUND: no such line in your cart."),
          "409": err("INSUFFICIENT_STOCK: more than is in stock."),
          ...common,
        },
      }),
      delete: op("user", "Cart", "Remove a cart line", {
        parameters: [idParam("Cart item id.")],
        responses: {
          "204": ok("Removed. No response body."),
          ...badId,
          ...auth,
          "404": err("NOT_FOUND: no such line in your cart."),
          ...common,
        },
      }),
    },
    "/orders": {
      get: op("user", "Orders", "List your orders", {
        responses: {
          "200": ok("Your orders, newest first.", {
            type: "object",
            properties: { orders: { type: "array", items: ref("Order") } },
          }),
          ...auth,
          ...common,
        },
      }),
      post: op("user", "Orders", "Order everything in your cart", {
        description:
          "Pays with the card in the request (test cards: 4242 4242 4242 4242 is approved, 4000 0000 0000 0002 is declined; the 3-D Secure card 4000 0027 6000 3184 is also declined here because bank verification only exists on the website). " +
          "delivery is optional: standard delivery on the earliest date (a weekday at least 2 days from today). " +
          "On success the cart is emptied and stock goes down.",
        requestBody: jsonBody(ref("OrderCreate"), {
          shippingAddress: exampleAddress,
          delivery: { method: "express" },
          card: {
            cardNumber: "4242 4242 4242 4242",
            expiry: "12/30",
            cvc: "123",
          },
        }),
        responses: {
          "201": ok("Order placed.", {
            type: "object",
            properties: { order: ref("Order") },
          }),
          "400": err(
            "INVALID_JSON, VALIDATION_ERROR (card), INVALID_SHIPPING, INVALID_DELIVERY, or PAYMENT_DECLINED.",
          ),
          ...auth,
          "409": err(
            "CART_EMPTY, or INSUFFICIENT_STOCK (nothing is charged or changed).",
          ),
          ...common,
        },
      }),
    },
    "/orders/{id}": {
      get: op("user", "Orders", "Get one of your orders", {
        description:
          "Admins can get any order. Someone else's order is reported as 404.",
        parameters: [idParam("Order id.")],
        responses: {
          "200": ok("The order.", {
            type: "object",
            properties: { order: ref("Order") },
          }),
          ...badId,
          ...auth,
          "404": err("NOT_FOUND: no such order (or not yours)."),
          ...common,
        },
      }),
    },
    "/products/{id}/reviews": {
      get: op("public", "Reviews", "List a product's reviews", {
        parameters: [idParam("Product id.")],
        responses: {
          "200": ok("Reviews, newest first.", {
            type: "object",
            properties: { reviews: { type: "array", items: ref("Review") } },
          }),
          ...badId,
          "404": err("NOT_FOUND: no product with this id."),
          ...common,
        },
      }),
      post: op("user", "Reviews", "Review a product", {
        description: "One review per user per product.",
        parameters: [idParam("Product id.")],
        requestBody: jsonBody(ref("ReviewInput"), {
          rating: 5,
          comment: "Great value.",
        }),
        responses: {
          "201": ok("Created.", {
            type: "object",
            properties: { review: ref("Review") },
          }),
          "400": err("INVALID_JSON or VALIDATION_ERROR."),
          ...auth,
          "404": err("NOT_FOUND: no product with this id."),
          "409": err(
            "ALREADY_REVIEWED: you have already reviewed this product.",
          ),
          ...common,
        },
      }),
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        description: "Token from POST /auth/login or /auth/register.",
      },
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "shoplab_session",
        description: "Set by logging in on the website.",
      },
    },
    schemas: {
      Error: {
        type: "object",
        required: ["error"],
        properties: {
          error: {
            type: "object",
            required: ["code", "message"],
            properties: {
              code: { type: "string", example: "VALIDATION_ERROR" },
              message: { type: "string" },
              details: {
                type: "object",
                description:
                  "For validation errors: { fields: { name: message } }.",
              },
            },
          },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string" },
        },
      },
      RegisterRequest: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string", minLength: 1 },
          email: { type: "string", format: "email" },
          password: {
            type: "string",
            minLength: 8,
            description: "Must contain a number.",
          },
        },
      },
      User: {
        type: "object",
        properties: {
          id: { type: "integer" },
          email: { type: "string" },
          name: { type: "string" },
          role: { type: "string", enum: ["customer", "admin"] },
        },
      },
      AuthResponse: {
        type: "object",
        properties: {
          token: { type: "string" },
          tokenType: { type: "string", const: "Bearer" },
          expiresIn: { type: "integer", description: "Seconds (7 days)." },
          user: ref("User"),
        },
      },
      Category: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
          slug: { type: "string" },
          productCount: { type: "integer" },
        },
      },
      Product: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
          slug: { type: "string" },
          description: {
            type: "string",
            description: "Only in single-product responses.",
          },
          priceCents: {
            type: "integer",
            description: "Price in cents: 2999 = $29.99.",
          },
          stock: { type: "integer" },
          rating: { type: "integer", minimum: 1, maximum: 5 },
          imageUrl: { type: "string" },
          category: {
            type: "object",
            properties: {
              id: { type: "integer" },
              name: { type: "string" },
              slug: { type: "string" },
            },
          },
        },
      },
      ProductList: {
        type: "object",
        properties: {
          products: { type: "array", items: ref("Product") },
          pagination: {
            type: "object",
            properties: {
              page: { type: "integer" },
              pageSize: { type: "integer" },
              total: { type: "integer" },
              totalPages: { type: "integer" },
            },
          },
        },
      },
      ProductInput: {
        type: "object",
        required: ["name", "description", "priceCents", "stock", "categoryId"],
        properties: {
          name: { type: "string", maxLength: 100 },
          slug: { type: "string", pattern: "^[a-z0-9]+(-[a-z0-9]+)*$" },
          description: { type: "string", maxLength: 2000 },
          priceCents: { type: "integer", minimum: 1 },
          stock: { type: "integer", minimum: 0 },
          categoryId: { type: "integer" },
          rating: { type: "integer", minimum: 1, maximum: 5, default: 3 },
          imageUrl: { type: "string", default: "/products/placeholder.svg" },
        },
      },
      CartItem: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            description:
              "Cart item id (use it with PATCH/DELETE /cart/items/{id}).",
          },
          productId: { type: "integer" },
          quantity: { type: "integer" },
        },
      },
      Cart: {
        type: "object",
        properties: {
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "integer" },
                productId: { type: "integer" },
                quantity: { type: "integer" },
                lineTotalCents: { type: "integer" },
                product: ref("Product"),
              },
            },
          },
          itemCount: { type: "integer", description: "Total quantity." },
          subtotalCents: { type: "integer" },
        },
      },
      CartItemCreate: {
        type: "object",
        required: ["productId"],
        properties: {
          productId: { type: "integer" },
          quantity: { type: "integer", minimum: 1, default: 1 },
        },
      },
      CartItemUpdate: {
        type: "object",
        required: ["quantity"],
        properties: { quantity: { type: "integer", minimum: 1 } },
      },
      ShippingAddress: {
        type: "object",
        required: [
          "fullName",
          "line1",
          "city",
          "country",
          "region",
          "postalCode",
        ],
        properties: {
          fullName: { type: "string" },
          line1: { type: "string" },
          line2: { type: "string" },
          city: { type: "string" },
          country: { type: "string", enum: ["US", "CA", "GB", "DE"] },
          region: {
            type: "string",
            description:
              "Region code valid for the country, e.g. IL (US), ON (CA), ENG (GB), BY (DE).",
          },
          postalCode: { type: "string" },
        },
      },
      OrderCreate: {
        type: "object",
        required: ["shippingAddress", "card"],
        properties: {
          shippingAddress: ref("ShippingAddress"),
          delivery: {
            type: "object",
            properties: {
              method: {
                type: "string",
                enum: ["standard", "express"],
                default: "standard",
              },
              date: {
                type: "string",
                format: "date",
                description:
                  "A weekday 2–60 days from today. Default: the earliest one.",
              },
            },
          },
          card: {
            type: "object",
            required: ["cardNumber", "expiry", "cvc"],
            properties: {
              cardNumber: { type: "string", example: "4242 4242 4242 4242" },
              expiry: {
                type: "string",
                example: "12/30",
                description: "MM/YY, not in the past.",
              },
              cvc: { type: "string", example: "123" },
            },
          },
        },
      },
      Order: {
        type: "object",
        properties: {
          id: { type: "integer" },
          number: { type: "string", example: "SL-000003" },
          status: {
            type: "string",
            enum: ["pending", "paid", "shipped", "cancelled"],
          },
          totalCents: { type: "integer", description: "Items + shipping." },
          shippingCents: { type: "integer" },
          deliveryMethod: { type: "string" },
          deliveryDate: { type: "string", format: "date" },
          shippingAddress: ref("ShippingAddress"),
          createdAt: { type: "string", format: "date-time" },
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                productId: { type: "integer" },
                name: { type: "string" },
                slug: { type: "string" },
                quantity: { type: "integer" },
                priceCents: {
                  type: "integer",
                  description: "Price at the time of the order.",
                },
              },
            },
          },
        },
      },
      Review: {
        type: "object",
        properties: {
          id: { type: "integer" },
          rating: { type: "integer", minimum: 1, maximum: 5 },
          comment: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
          user: {
            type: "object",
            properties: { id: { type: "integer" }, name: { type: "string" } },
          },
        },
      },
      ReviewInput: {
        type: "object",
        required: ["rating", "comment"],
        properties: {
          rating: { type: "integer", minimum: 1, maximum: 5 },
          comment: { type: "string", maxLength: 1000 },
        },
      },
    },
  },
} as const;

export type OpenApiOperation = {
  tags: string[];
  summary: string;
  description?: string;
  "x-access": Access;
  parameters?: {
    name: string;
    in: string;
    required?: boolean;
    description?: string;
    schema: Record<string, unknown>;
  }[];
  requestBody?: { content: { "application/json": { example?: unknown } } };
  responses: Record<string, { description: string }>;
};
