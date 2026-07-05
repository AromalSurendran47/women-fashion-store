import { Badge } from "@/components/ui/badge";

export function OrderBadge({ status }: { status: string }) {
  const variant =
    status === "Delivered"
      ? "new"
      : status === "Cancelled" || status === "Returned"
        ? "sale"
        : "light";
  return <Badge variant={variant as never}>{status}</Badge>;
}
