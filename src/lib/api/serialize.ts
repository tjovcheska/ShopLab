// The JSON shapes the API returns (documented in src/lib/openapi.ts).
import type { Cart } from "@/lib/cart";
import { formatOrderNumber } from "@/lib/format";

/** A Date stored as midnight UTC → "YYYY-MM-DD" */
const isoDay = (date: Date | null) =>
  date ? date.toISOString().slice(0, 10) : null;

export function serializeCart(cart: Cart) {
  return {
    items: cart.items.map((item) => ({
      id: item.id,
      productId: item.product.id,
      quantity: item.quantity,
      lineTotalCents: item.lineTotalCents,
      product: item.product,
    })),
    itemCount: cart.itemCount,
    subtotalCents: cart.subtotalCents,
  };
}

type OrderRow = {
  id: number;
  status: string;
  totalCents: number;
  shippingCents: number;
  deliveryMethod: string | null;
  deliveryDate: Date | null;
  shippingAddress: unknown;
  createdAt: Date;
  items: {
    productId: number;
    quantity: number;
    priceCents: number;
    product: { name: string; slug: string };
  }[];
};

export function serializeOrder(order: OrderRow) {
  return {
    id: order.id,
    number: formatOrderNumber(order.id),
    status: order.status,
    totalCents: order.totalCents,
    shippingCents: order.shippingCents,
    deliveryMethod: order.deliveryMethod,
    deliveryDate: isoDay(order.deliveryDate),
    shippingAddress: order.shippingAddress,
    createdAt: order.createdAt.toISOString(),
    items: order.items.map((item) => ({
      productId: item.productId,
      name: item.product.name,
      slug: item.product.slug,
      quantity: item.quantity,
      priceCents: item.priceCents,
    })),
  };
}

export function serializeReview(review: {
  id: number;
  rating: number;
  comment: string;
  createdAt: Date;
  user: { id: number; name: string };
}) {
  return {
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt.toISOString(),
    user: review.user,
  };
}
