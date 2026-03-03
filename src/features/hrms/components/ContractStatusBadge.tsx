import { Chip } from "@mui/material";
import type { ChipProps } from "@mui/material";

import type { ContractStatus } from "@/types/api.types";

interface ContractStatusBadgeProps extends Omit<ChipProps, "label"> {
  status: ContractStatus;
}

const statusColorMap: Record<ContractStatus, ChipProps["color"]> = {
  DRAFT: "default",
  ACTIVE: "success",
  EXPIRED: "error",
  TERMINATED: "error",
};

const statusLabelMap: Record<ContractStatus, string> = {
  DRAFT: "Draft",
  ACTIVE: "Active",
  EXPIRED: "Expired",
  TERMINATED: "Terminated",
};

export const ContractStatusBadge = ({
  status,
  ...props
}: ContractStatusBadgeProps) => {
  return (
    <Chip
      label={statusLabelMap[status]}
      color={statusColorMap[status]}
      variant="outlined"
      size="small"
      {...props}
    />
  );
};
