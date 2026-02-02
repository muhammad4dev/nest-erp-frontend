import { Box, Card, CardContent, Container, Typography } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useState } from "react";

import { useListInvoices } from "@/lib/api/queries/useSales";
import type { Invoice } from "@/types/api.types";

import { InvoiceStatusBadge } from "../components/InvoiceStatusBadge";

export function InvoicesListPage() {
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  const { data: invoices = [], isLoading } = useListInvoices();

  const columns: GridColDef<Invoice>[] = [
    {
      field: "number",
      headerName: "Invoice #",
      width: 150,
    },
    {
      field: "partner",
      headerName: "Customer",
      width: 200,
      valueGetter: (_, row) => row.partner?.name || "",
    },
    {
      field: "issuedAt",
      headerName: "Issue Date",
      width: 120,
    },
    {
      field: "status",
      headerName: "Status",
      width: 130,
      renderCell: (params) => <InvoiceStatusBadge status={params.value} />,
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
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4">Invoices</Typography>
      </Box>

      <Card>
        <CardContent>
          <DataGrid
            rows={invoices}
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
