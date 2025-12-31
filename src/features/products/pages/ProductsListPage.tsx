import { Add, Search } from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  Container,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useState } from "react";

import { useProducts } from "@/lib/api/queries/useProducts";
import { useAppNavigate } from "@/shared/hooks/useAppNavigate";
import type { Product } from "@/types/api.types";

export function ProductsListPage() {
  const navigate = useAppNavigate();
  const { data: products, isLoading } = useProducts();
  const [searchTerm, setSearchTerm] = useState("");

  // Client-side filtering until backend adds pagination
  const filteredProducts = products?.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeColor = (type: string) => {
    const colors: Record<string, "primary" | "success" | "warning" | "info"> = {
      GOODS: "primary",
      SERVICE: "success",
      CONSUMABLE: "warning",
      DIGITAL: "info",
    };
    return colors[type] || "default";
  };

  const columns: GridColDef<Product>[] = [
    {
      field: "sku",
      headerName: "SKU",
      width: 150,
      renderCell: (params) => (
        <Box
          sx={{
            cursor: "pointer",
            color: "primary.main",
            "&:hover": { textDecoration: "underline" },
          }}
          onClick={() =>
            navigate({
              to: "/$lang/app/products/$productId",
              params: { productId: params.row.id },
            })
          }
        >
          {params.value}
        </Box>
      ),
    },
    {
      field: "name",
      headerName: "Product Name",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "productType",
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
      field: "category",
      headerName: "Category",
      width: 150,
      valueGetter: (_, row) => row.category?.name || "-",
    },
    {
      field: "salesPrice",
      headerName: "Sales Price",
      width: 120,
      type: "number",
      valueFormatter: (value) => {
        const numValue = typeof value === "number" ? value : parseFloat(value);
        return `$${!isNaN(numValue) ? numValue.toFixed(2) : "0.00"}`;
      },
    },
    {
      field: "costPrice",
      headerName: "Cost",
      width: 100,
      type: "number",
      valueFormatter: (value) => {
        const numValue = typeof value === "number" ? value : parseFloat(value);
        return `$${!isNaN(numValue) ? numValue.toFixed(2) : "0.00"}`;
      },
    },
    {
      field: "isActive",
      headerName: "Status",
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value ? "Active" : "Inactive"}
          color={params.value ? "success" : "default"}
          size="small"
        />
      ),
    },
    {
      field: "trackInventory",
      headerName: "Stock",
      width: 100,
      renderCell: (params) =>
        params.value ? (
          <Chip label="Tracked" color="info" size="small" />
        ) : (
          <Chip label="No Stock" size="small" variant="outlined" />
        ),
    },
    {
      field: "hasVariants",
      headerName: "Variants",
      width: 100,
      renderCell: (params) =>
        params.value ? (
          <Chip label="Yes" color="secondary" size="small" />
        ) : null,
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
            Products Catalog
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage products, pricing, and inventory
          </Typography>
        </div>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() =>
            navigate({
              to: "/$lang/app/products/new",
            })
          }
        >
          New Product
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search by name, SKU, or barcode..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: "text.secondary" }} />,
          }}
        />
      </Paper>

      <Paper sx={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={filteredProducts || []}
          columns={columns}
          loading={isLoading}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 25, page: 0 },
            },
            sorting: {
              sortModel: [{ field: "name", sort: "asc" }],
            },
          }}
          disableRowSelectionOnClick
          sx={{
            "& .MuiDataGrid-cell:focus": {
              outline: "none",
            },
          }}
        />
      </Paper>
    </Container>
  );
}
