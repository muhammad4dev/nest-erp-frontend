import { Chip } from "@mui/material";

import type { InvoiceStatus } from "@/types/api.types";

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
}

const statusColors = {
  DRAFT: "default",
  SENT: "info",
  PAID: "success",
  CANCELLED: "error",
  RETURNED: "warning",
} as const;

export function InvoiceStatusBadge({ status }: InvoiceStatusBadgeProps) {
  return (
    <Chip
      label={status}
      color={statusColors[status]}
      size="small"
      sx={{ minWidth: 90 }}
    />
  );
}
