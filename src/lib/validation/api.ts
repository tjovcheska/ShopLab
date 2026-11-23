// Request bodies of the REST API (/api/v1). The OpenAPI document
// (src/lib/openapi.ts) describes the same rules for humans.
import { z } from "zod";
import { registerSchema } from "@/lib/validation/auth";
import { cardSchema } from "@/lib/validation/payment";

export const apiLoginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Enter a valid email address.")),
  password: z.string().min(1, "Password is required."),
});

/** Same rules as the register page, without "confirm password". */
export const apiRegisterSchema = registerSchema.omit({ confirmPassword: true });

const slug = z
  .string()
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Use lowercase letters, numbers, and dashes.",
  )
  .max(100);

/** POST /products and PUT /products/:id (PUT replaces the whole product). */
export const productInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(100),
  slug: slug.optional(),
  description: z.string().trim().min(1, "Description is required.").max(2000),
  priceCents: z
    .number()
    .int("Must be a whole number of cents.")
    .min(1)
    .max(10_000_000),
  stock: z.number().int().min(0).max(100_000),
  categoryId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5).default(3),
  imageUrl: z
    .string()
    .regex(/^(\/|https?:\/\/)/, "Must start with / or http(s)://.")
    .default("/products/placeholder.svg"),
});
export type ProductInput = z.output<typeof productInputSchema>;

export const cartItemCreateSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().min(1, "Quantity must be at least 1.").default(1),
});

export const cartItemUpdateSchema = z.object({
  quantity: z.number().int().min(1, "Quantity must be at least 1."),
});

/**
 * POST /orders. The shipping address is checked by the order service (same
 * rules as checkout). `delivery` is optional: standard delivery on the
 * earliest available date.
 */
export const orderCreateSchema = z.object({
  shippingAddress: z.record(z.string(), z.unknown()),
  delivery: z
    .object({
      method: z.string().optional(),
      date: z.string().optional(),
    })
    .optional(),
  card: cardSchema,
});

export const reviewCreateSchema = z.object({
  rating: z.number().int().min(1, "Must be 1 to 5.").max(5, "Must be 1 to 5."),
  comment: z.string().trim().min(1, "Comment is required.").max(1000),
});
