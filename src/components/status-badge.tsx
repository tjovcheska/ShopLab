const STYLES: Record<string, string> = {
  pending: "bg-gray-100 text-gray-800",
  paid: "bg-blue-100 text-blue-800",
  shipped: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

/** Order status badge: "Paid", "Shipped", … */
export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      data-order-status={status}
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
        STYLES[status] ?? STYLES.pending
      }`}
    >
      {status}
    </span>
  );
}
