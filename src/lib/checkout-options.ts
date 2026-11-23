// Delivery methods offered at checkout. Shared by the browser and the server.

export const DELIVERY_OPTIONS = [
  {
    id: "standard",
    label: "Standard delivery",
    description: "Delivered by courier on your chosen date.",
    priceCents: 499,
  },
  {
    id: "express",
    label: "Express delivery",
    description: "Priority handling with live tracking.",
    priceCents: 1499,
  },
] as const;

export type DeliveryMethod = (typeof DELIVERY_OPTIONS)[number]["id"];

export function getDeliveryOption(id: string) {
  return DELIVERY_OPTIONS.find((option) => option.id === id);
}
