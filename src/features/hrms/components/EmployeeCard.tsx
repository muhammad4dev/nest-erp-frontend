import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Button,
  Stack,
  Divider,
} from "@mui/material";

import type { Employee } from "@/types/api.types";

import { EmployeeStatusBadge } from "./EmployeeStatusBadge";

interface EmployeeCardProps {
  employee: Employee;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const EmployeeCard = ({
  employee,
  onView,
  onEdit,
  onDelete,
}: EmployeeCardProps) => {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h6" component="h3">
              {employee.firstName} {employee.lastName}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {employee.code}
            </Typography>
          </Box>

          <Divider />

          <Stack spacing={1}>
            <Box>
              <Typography variant="caption" color="textSecondary">
                Job Title
              </Typography>
              <Typography variant="body2">{employee.jobTitle}</Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="textSecondary">
                Department
              </Typography>
              <Typography variant="body2">{employee.department}</Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="textSecondary">
                Email
              </Typography>
              <Typography variant="body2">{employee.email}</Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="textSecondary">
                Status
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                <EmployeeStatusBadge isActive={employee.isActive} />
              </Box>
            </Box>
          </Stack>
        </Stack>
      </CardContent>

      <CardActions>
        <Stack direction="row" spacing={1} sx={{ width: "100%" }}>
          {onView && (
            <Button size="small" onClick={onView}>
              View
            </Button>
          )}
          {onEdit && (
            <Button size="small" onClick={onEdit}>
              Edit
            </Button>
          )}
          {onDelete && (
            <Button size="small" color="error" onClick={onDelete}>
              Delete
            </Button>
          )}
        </Stack>
      </CardActions>
    </Card>
  );
};
