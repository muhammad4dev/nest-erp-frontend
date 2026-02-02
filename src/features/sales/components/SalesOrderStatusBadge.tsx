import { Chip } from "@mui/material";

import type { SalesOrderStatus } from "@/types/api.types";

interface SalesOrderStatusBadgeProps {
  status: SalesOrderStatus;
}

const statusColors = {
  DRAFT: "default",
  SENT: "info",
  CONFIRMED: "success",
  INVOICED: "warning",
  CANCELLED: "error",
} as const;

export function SalesOrderStatusBadge({ status }: SalesOrderStatusBadgeProps) {
  return (
    <Chip
      label={status}
      color={statusColors[status]}
      size="small"
      sx={{ minWidth: 90 }}
    />
  );
}
