import { Chip, Container, Stack, Typography } from "@mui/material";
import { type GridColDef } from "@mui/x-data-grid";
import { DataGrid } from "@mui/x-data-grid";
import { useState } from "react";

import { useVendorBills } from "@/lib/api/queries/useProcurement";
import { useAppNavigate } from "@/shared/hooks/useAppNavigate";
import { VendorBillStatus, VendorBillType } from "@/types/api.types";
import type { VendorBill } from "@/types/api.types";

const getStatusColor = (
  status: VendorBillStatus
): "default" | "success" | "warning" | "error" => {
  switch (status) {
    case VendorBillStatus.DRAFT:
      return "default";
    case VendorBillStatus.POSTED:
      return "warning";
    case VendorBillStatus.PAID:
      return "success";
    case VendorBillStatus.CANCELLED:
      return "error";
    default:
      return "default";
  }
};

const getTypeColor = (
  type: VendorBillType
): "primary" | "success" | "warning" => {
  switch (type) {
    case VendorBillType.BILL:
      return "primary";
    case VendorBillType.CREDIT_NOTE:
      return "success";
    case VendorBillType.DEBIT_NOTE:
      return "warning";
    default:
      return "primary";
  }
};

export function VendorBillsListPage() {
  const navigate = useAppNavigate();
  const { data: bills = [], isLoading } = useVendorBills();
  const [statusFilter, setStatusFilter] = useState<VendorBillStatus | "ALL">(
    "ALL"
  );

  const filteredBills =
    statusFilter === "ALL"
      ? bills
      : bills.filter((bill) => bill.status === statusFilter);

  const columns: GridColDef<VendorBill>[] = [
    {
      field: "billReference",
      headerName: "Bill Reference",
      width: 150,
      flex: 1,
    },
    {
      field: "partner",
      headerName: "Vendor",
      width: 200,
      flex: 1,
      valueGetter: (_, row) => row.partner?.name || "N/A",
    },
    {
      field: "type",
      headerName: "Type",
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getTypeColor(params.value)}
          size="small"
        />
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getStatusColor(params.value)}
          size="small"
        />
      ),
    },
    {
      field: "totalAmount",
      headerName: "Total",
      width: 120,
      align: "right",
      headerAlign: "right",
      valueFormatter: (value: number) => value?.toFixed(2) || "0.00",
    },
    {
      field: "balanceDue",
      headerName: "Balance Due",
      width: 120,
      align: "right",
      headerAlign: "right",
      valueFormatter: (value: number) => value?.toFixed(2) || "0.00",
    },
    {
      field: "dueDate",
      headerName: "Due Date",
      width: 120,
      valueFormatter: (value) =>
        value ? new Date(value).toLocaleDateString() : "N/A",
    },
  ];

  const handleRowClick = (params: { row: VendorBill }) => {
    navigate({
      to: `/$lang/app/procurement/bills/$billId`,
      params: { billId: params.row.id },
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Vendor Bills
      </Typography>

      <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
        <Chip
          label="All"
          onClick={() => setStatusFilter("ALL")}
          color={statusFilter === "ALL" ? "primary" : "default"}
          variant={statusFilter === "ALL" ? "filled" : "outlined"}
        />
        <Chip
          label="Draft"
          onClick={() => setStatusFilter(VendorBillStatus.DRAFT)}
          color={
            statusFilter === VendorBillStatus.DRAFT ? "primary" : "default"
          }
          variant={
            statusFilter === VendorBillStatus.DRAFT ? "filled" : "outlined"
          }
        />
        <Chip
          label="Posted"
          onClick={() => setStatusFilter(VendorBillStatus.POSTED)}
          color={
            statusFilter === VendorBillStatus.POSTED ? "primary" : "default"
          }
          variant={
            statusFilter === VendorBillStatus.POSTED ? "filled" : "outlined"
          }
        />
        <Chip
          label="Paid"
          onClick={() => setStatusFilter(VendorBillStatus.PAID)}
          color={statusFilter === VendorBillStatus.PAID ? "primary" : "default"}
          variant={
            statusFilter === VendorBillStatus.PAID ? "filled" : "outlined"
          }
        />
      </Stack>

      <DataGrid
        rows={filteredBills}
        columns={columns}
        loading={isLoading}
        onRowClick={handleRowClick}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 25 },
          },
        }}
        pageSizeOptions={[10, 25, 50, 100]}
        sx={{
          "& .MuiDataGrid-row": {
            cursor: "pointer",
          },
        }}
        disableRowSelectionOnClick
        autoHeight
      />
    </Container>
  );
}
