import { Add } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
} from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useState } from "react";

import { useListSalesOrders } from "@/lib/api/queries/useSales";
import { useAppNavigate } from "@/shared/hooks/useAppNavigate";
import type { SalesOrder } from "@/types/api.types";

import { SalesOrderStatusBadge } from "../components/SalesOrderStatusBadge";

export function SalesOrdersListPage() {
  const navigate = useAppNavigate();
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  const { data: orders = [], isLoading } = useListSalesOrders();

  const columns: GridColDef<SalesOrder>[] = [
    {
      field: "orderNumber",
      headerName: "Order #",
      width: 150,
      renderCell: (params) => (
        <Button
          variant="text"
          onClick={() =>
            navigate({
              to: "/$lang/app/sales/orders/$orderId",
              params: { orderId: params.row.id },
            })
          }
        >
          {params.value}
        </Button>
      ),
    },
    {
      field: "partner",
      headerName: "Customer",
      width: 200,
      valueGetter: (_, row) => row.partner?.name || "",
    },
    {
      field: "orderDate",
      headerName: "Date",
      width: 120,
    },
    {
      field: "status",
      headerName: "Status",
      width: 130,
      renderCell: (params) => <SalesOrderStatusBadge status={params.value} />,
    },
    {
      field: "totalAmount",
      headerName: "Total Amount",
      width: 150,
      type: "number",
      valueFormatter: (value) => `$${Number(value).toFixed(2)}`,
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">Sales Orders</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate({ to: "/$lang/app/sales/orders/new" })}
        >
          New Order
        </Button>
      </Box>

      <Card>
        <CardContent>
          <DataGrid
            rows={orders}
            columns={columns}
            loading={isLoading}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[10, 25, 50]}
            disableRowSelectionOnClick
            autoHeight
          />
        </CardContent>
      </Card>
    </Container>
  );
}
