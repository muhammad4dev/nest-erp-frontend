import { Add, CheckCircle, Delete, Search } from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  Container,
  IconButton,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import {
  useCompleteStockIssue,
  useDeleteStockIssue,
} from "@/lib/api/mutations/useStockReceipts";
import { useStockIssues } from "@/lib/api/queries/useStockReceipts";
import { useAppNavigate } from "@/shared/hooks/useAppNavigate";
import type { StockIssue } from "@/types/api.types";

import { StockIssueFormDialog } from "../components/StockIssueFormDialog";

export function StockIssuesPage() {
  const { t } = useTranslation();
  const navigate = useAppNavigate();
  const { data: issues, isLoading } = useStockIssues();
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const completeIssue = useCompleteStockIssue();
  const deleteIssue = useDeleteStockIssue();

  // Client-side filtering
  const filteredIssues = issues?.filter(
    (issue) =>
      issue.issueNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.sourceReference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.location?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getStatusColor = (status: string) => {
    const colors: Record<string, "default" | "success" | "error"> = {
      DRAFT: "default",
      COMPLETED: "success",
      CANCELLED: "error",
    };
    return colors[status] || "default";
  };

  const getIssueTypeColor = (
    type: string,
  ): "primary" | "success" | "warning" | "info" | "secondary" => {
    const colors: Record<
      string,
      "primary" | "success" | "warning" | "info" | "secondary"
    > = {
      SALE: "primary",
      PRODUCTION: "success",
      WRITEOFF: "error" as "warning",
      TRANSFER: "info",
      ADJUSTMENT: "secondary",
    };
    return colors[type] || "primary";
  };

  const handleComplete = async (id: string) => {
    if (window.confirm(t("inventory.stockIssues.confirmComplete"))) {
      await completeIssue.mutateAsync(id);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t("inventory.stockIssues.confirmDelete"))) {
      await deleteIssue.mutateAsync(id);
    }
  };

  const columns: GridColDef<StockIssue>[] = [
    {
      field: "issueNumber",
      headerName: t("inventory.stockIssues.issueNumber"),
      width: 150,
      renderCell: (params) => (
        <Box
          sx={{
            cursor: "pointer",
            color: "primary.main",
            fontWeight: 600,
            "&:hover": { textDecoration: "underline" },
          }}
        >
          {params.value}
        </Box>
      ),
    },
    {
      field: "issueDate",
      headerName: t("inventory.stockIssues.issueDate"),
      width: 120,
      valueFormatter: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      field: "issueType",
      headerName: t("inventory.stockIssues.issueType"),
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getIssueTypeColor(params.value)}
          size="small"
        />
      ),
    },
    {
      field: "location",
      headerName: t("inventory.stockIssues.location"),
      width: 150,
      valueGetter: (_, row) => row.location?.name || "-",
    },
    {
      field: "totalQuantity",
      headerName: t("inventory.stockIssues.totalQuantity"),
      width: 110,
      type: "number",
      valueFormatter: (value) => {
        const numValue = typeof value === "number" ? value : parseFloat(value);
        return !isNaN(numValue) ? numValue.toFixed(2) : "0.00";
      },
    },
    {
      field: "totalValue",
      headerName: t("inventory.stockIssues.totalValue"),
      width: 130,
      type: "number",
      valueFormatter: (value) => {
        const numValue = typeof value === "number" ? value : parseFloat(value);
        return `$${!isNaN(numValue) ? numValue.toFixed(2) : "0.00"}`;
      },
    },
    {
      field: "status",
      headerName: t("inventory.stockIssues.status"),
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
      field: "actions",
      headerName: t("inventory.stockIssues.actions"),
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 0.5 }}>
          {params.row.status === "DRAFT" && (
            <>
              <Tooltip title={t("inventory.stockIssues.complete")}>
                <IconButton
                  size="small"
                  color="success"
                  onClick={() => handleComplete(params.row.id)}
                  disabled={completeIssue.isPending}
                >
                  <CheckCircle fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t("common.delete")}>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDelete(params.row.id)}
                  disabled={deleteIssue.isPending}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      ),
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <div>
          <Typography variant="h4" gutterBottom>
            {t("inventory.stockIssues.title")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("inventory.stockIssues.description")}
          </Typography>
        </div>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setDialogOpen(true)}
        >
          {t("inventory.stockIssues.newIssue")}
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder={t("inventory.stockIssues.searchPlaceholder")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: "text.secondary" }} />,
          }}
        />
      </Paper>

      <Paper sx={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={filteredIssues || []}
          columns={columns}
          loading={isLoading}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 25, page: 0 },
            },
            sorting: {
              sortModel: [{ field: "issueDate", sort: "desc" }],
            },
          }}
          disableRowSelectionOnClick
          onRowClick={(params) =>
            navigate({
              to: "/$lang/app/inventory/issues/$issueId",
              params: { issueId: params.id as string },
            })
          }
          sx={{
            "& .MuiDataGrid-cell:focus": {
              outline: "none",
            },
          }}
        />
      </Paper>

      <StockIssueFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </Container>
  );
}
