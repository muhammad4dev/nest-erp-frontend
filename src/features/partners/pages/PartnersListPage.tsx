import { Add, Person, Business } from "@mui/icons-material";
import { Box, Button, Chip, Container, Stack, Typography } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useSearch } from "@tanstack/react-router";
import { useState } from "react";

import { usePartners } from "@/lib/api/queries/usePartners";
import { useAppNavigate } from "@/shared/hooks/useAppNavigate";
import type { Partner } from "@/types/api.types";

export function PartnersListPage() {
  const navigate = useAppNavigate();
  const searchParams = useSearch({
    from: "/$lang/app/partners/list",
  }) as unknown as {
    isCustomer?: boolean;
    isVendor?: boolean;
  };
  const [filter, setFilter] = useState<{
    isCustomer?: boolean;
    isVendor?: boolean;
  }>({
    isCustomer: searchParams?.isCustomer,
    isVendor: searchParams?.isVendor,
  });

  const { data: partners = [], isLoading } = usePartners(filter);

  const getPartnerTypeLabel = (partner: Partner) => {
    if (partner.isCustomer && partner.isVendor) return "Both";
    if (partner.isCustomer) return "Customer";
    if (partner.isVendor) return "Vendor";
    return "Unknown";
  };

  const getPartnerTypeColor = (
    partner: Partner,
  ): "success" | "warning" | "info" => {
    if (partner.isCustomer && partner.isVendor) return "info";
    if (partner.isCustomer) return "success";
    if (partner.isVendor) return "warning";
    return "info";
  };

  const columns: GridColDef<Partner>[] = [
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "type",
      headerName: "Type",
      width: 120,
      renderCell: (params) => (
        <Chip
          label={getPartnerTypeLabel(params.row)}
          color={getPartnerTypeColor(params.row)}
          size="small"
          icon={
            params.row.isCustomer && !params.row.isVendor ? (
              <Person />
            ) : (
              <Business />
            )
          }
        />
      ),
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "phone",
      headerName: "Phone",
      width: 150,
    },
    {
      field: "taxId",
      headerName: "Tax ID",
      width: 150,
    },
    {
      field: "partnerType",
      headerName: "Entity Type",
      width: 120,
      renderCell: (params) => params.value || "BUSINESS",
    },
  ];

  const handleFilterChange = (newFilter: {
    isCustomer?: boolean;
    isVendor?: boolean;
  }) => {
    setFilter(newFilter);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Typography variant="h4">Partners</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate({ to: "/$lang/app/partners/new" })}
        >
          New Partner
        </Button>
      </Stack>

      {/* Filter Chips */}
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Chip
          label="All Partners"
          onClick={() => handleFilterChange({})}
          color={!filter.isCustomer && !filter.isVendor ? "primary" : "default"}
          variant={
            !filter.isCustomer && !filter.isVendor ? "filled" : "outlined"
          }
        />
        <Chip
          label="Customers"
          icon={<Person />}
          onClick={() => handleFilterChange({ isCustomer: true })}
          color={filter.isCustomer && !filter.isVendor ? "success" : "default"}
          variant={
            filter.isCustomer && !filter.isVendor ? "filled" : "outlined"
          }
        />
        <Chip
          label="Vendors"
          icon={<Business />}
          onClick={() => handleFilterChange({ isVendor: true })}
          color={!filter.isCustomer && filter.isVendor ? "warning" : "default"}
          variant={
            !filter.isCustomer && filter.isVendor ? "filled" : "outlined"
          }
        />
      </Stack>

      {/* Data Grid */}
      <Box sx={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={partners}
          columns={columns}
          loading={isLoading}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{
            pagination: { paginationModel: { pageSize: 25 } },
          }}
          onRowClick={(params) =>
            navigate({
              to: "/$lang/app/partners/$partnerId",
              params: { partnerId: params.id as string },
            })
          }
          sx={{
            "& .MuiDataGrid-row": {
              cursor: "pointer",
            },
          }}
        />
      </Box>
    </Container>
  );
}
