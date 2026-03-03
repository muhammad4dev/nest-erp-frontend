import { Chip } from "@mui/material";
import type { ChipProps } from "@mui/material";

interface EmployeeStatusBadgeProps extends Omit<ChipProps, "label"> {
  isActive: boolean;
}

export const EmployeeStatusBadge = ({
  isActive,
  ...props
}: EmployeeStatusBadgeProps) => {
  return (
    <Chip
      label={isActive ? "Active" : "Inactive"}
      color={isActive ? "success" : "default"}
      variant="outlined"
      size="small"
      {...props}
    />
  );
};
