import { ArrowBack } from "@mui/icons-material";
import {
  Container,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";

import { SalesOrderForm } from "@/features/sales/components/SalesOrderForm";
import { useCreateSalesOrder } from "@/lib/api/mutations/useSales";
import { useAppNavigate } from "@/shared/hooks/useAppNavigate";
import type {
  CreateSalesOrderDto,
  UpdateSalesOrderDto,
} from "@/types/api.types";

export function SalesOrderFormPage() {
  const navigate = useAppNavigate();
  const createMutation = useCreateSalesOrder();

  const handleSubmit = async (
    data: CreateSalesOrderDto | UpdateSalesOrderDto,
  ) => {
    await createMutation.mutateAsync(data as CreateSalesOrderDto);
    navigate({ to: "/$lang/app/sales/orders" });
  };

  const handleCancel = () => {
    navigate({ to: "/$lang/app/sales/orders" });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Tooltip title="Go Back">
          <IconButton onClick={handleCancel}>
            <ArrowBack />
          </IconButton>
        </Tooltip>
        <Typography variant="h4">Create Sales Order</Typography>
      </Stack>

      <SalesOrderForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={createMutation.isPending}
      />
    </Container>
  );
}
