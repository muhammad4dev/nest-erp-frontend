import { Add } from "@mui/icons-material";
import { Box, Button, Chip, Container, Paper, Typography } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useState } from "react";

import { useAccounts } from "@/lib/api/queries/useFinance";
import type { Account, AccountType } from "@/types/api.types";

import { AccountFormDialog } from "../components/AccountFormDialog";

export function AccountsListPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | undefined>();

  const { data: accounts, isLoading } = useAccounts();

  const handleEdit = (account: Account) => {
    setSelectedAccount(account);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setSelectedAccount(undefined);
  };

  const getAccountTypeColor = (
    type: AccountType,
  ):
    | "default"
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning" => {
    const colorMap: Record<
      AccountType,
      | "default"
      | "primary"
      | "secondary"
      | "error"
      | "info"
      | "success"
      | "warning"
    > = {
      ASSET: "primary",
      LIABILITY: "error",
      EQUITY: "secondary",
      INCOME: "success",
      EXPENSE: "warning",
    };
    return colorMap[type] || "default";
  };

  const columns: GridColDef<Account>[] = [
    {
      field: "code",
      headerName: "Code",
      width: 120,
      sortable: true,
    },
    {
      field: "name",
      headerName: "Account Name",
      flex: 1,
      minWidth: 250,
      sortable: true,
    },
    {
      field: "type",
      headerName: "Type",
      width: 150,
      sortable: true,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={getAccountTypeColor(params.value as AccountType)}
        />
      ),
    },
    {
      field: "isControlAccount",
      headerName: "Control",
      width: 100,
      sortable: true,
      renderCell: (params) =>
        params.value ? (
          <Chip label="Control" size="small" color="info" />
        ) : null,
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Button size="small" onClick={() => handleEdit(params.row)}>
          Edit
        </Button>
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
        }}
      >
        <div>
          <Typography variant="h4" gutterBottom>
            Chart of Accounts
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your organization&apos;s accounts and account hierarchy
          </Typography>
        </div>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setDialogOpen(true)}
        >
          New Account
        </Button>
      </Box>

      <Paper sx={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={accounts || []}
          columns={columns}
          loading={isLoading}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 25, page: 0 },
            },
            sorting: {
              sortModel: [{ field: "code", sort: "asc" }],
            },
          }}
          disableRowSelectionOnClick
          sx={{
            "& .MuiDataGrid-cell:focus": {
              outline: "none",
            },
            "& .MuiDataGrid-row:hover": {
              cursor: "pointer",
            },
          }}
        />
      </Paper>

      <AccountFormDialog
        open={dialogOpen}
        account={selectedAccount}
        onClose={handleClose}
      />
    </Container>
  );
}
