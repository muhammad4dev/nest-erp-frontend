import {
  Person as PersonIcon,
  Security as SecurityIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import {
  Container,
  Typography,
  Paper,
  Box,
  TextField,
  Chip,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Stack,
} from "@mui/material";
import {
  DataGrid,
  type GridColDef,
  GridActionsCellItem,
} from "@mui/x-data-grid";
import { useSearch } from "@tanstack/react-router";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { useDeleteUser } from "@/lib/api/mutations/useIdentity";
import { useUsers } from "@/lib/api/queries/useIdentity";
import { useAppNavigate } from "@/shared/hooks/useAppNavigate";
import type { User } from "@/types/api.types";

import { UserFormDialog } from "../components/UserFormDialog";
import { UserRoleDialog } from "../components/UserRoleDialog";

export const UsersListPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useAppNavigate();
  const search = useSearch({ from: "/$lang/app/users" }) as { role?: string };

  // State for dialog
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<User | undefined>();
  const [isRoleDialogOpen, setIsRoleDialogOpen] = React.useState(false);
  const [selectedUserForRoles, setSelectedUserForRoles] = React.useState<
    User | undefined
  >();

  // API hooks
  const { data: usersResponse, isLoading, error } = useUsers();
  const deleteMutation = useDeleteUser();

  const users = React.useMemo(() => {
    return Array.isArray(usersResponse)
      ? usersResponse
      : usersResponse?.data || [];
  }, [usersResponse]);

  // Filter users by role if specified in search params
  const filteredUsers = React.useMemo(() => {
    const userArray = Array.isArray(users) ? users : [];
    if (!search.role) return userArray;
    return userArray.filter((user: User) =>
      user.roles?.some((role: { name: string }) => role.name === search.role),
    );
  }, [users, search.role]);

  const handleCreateUser = () => {
    setEditingUser(undefined);
    setIsDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsDialogOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (
      window.confirm(
        t("users.confirmDelete", "Are you sure you want to delete this user?"),
      )
    ) {
      await deleteMutation.mutateAsync(userId);
    }
  };

  const handleViewUser = (userId: string) => {
    navigate({
      to: "/$lang/app/users/$userId",
      params: { userId },
    });
  };

  const handleEditUserRoles = (user: User) => {
    setSelectedUserForRoles(user);
    setIsRoleDialogOpen(true);
  };

  const columns: GridColDef<User>[] = [
    {
      field: "email",
      headerName: t("users.email", "Email"),
      flex: 1,
      minWidth: 200,
    },
    {
      field: "roles",
      headerName: t("users.roles", "Roles"),
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Stack direction="row" spacing={1} sx={{ py: 1 }}>
          {params.row.roles?.map((role) => (
            <Chip
              key={role.id}
              label={role.name}
              size="small"
              color={role.name === "ADMIN" ? "primary" : "default"}
            />
          ))}
        </Stack>
      ),
    },
    {
      field: "isActive",
      headerName: t("users.status", "Status"),
      width: 120,
      renderCell: (params) => (
        <Chip
          label={
            params.row.isActive
              ? t("common.active", "Active")
              : t("common.inactive", "Inactive")
          }
          size="small"
          color={params.row.isActive ? "success" : "default"}
        />
      ),
    },
    {
      field: "createdAt",
      headerName: t("users.createdAt", "Created At"),
      width: 180,
      valueFormatter: (value) => new Date(value).toLocaleDateString(),
    },
    {
      field: "actions",
      type: "actions",
      headerName: t("common.actions", "Actions"),
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          key="view"
          icon={
            <Tooltip title={t("common.view", "View")}>
              <PersonIcon />
            </Tooltip>
          }
          label="View"
          onClick={() => handleViewUser(params.row.id)}
        />,
        <GridActionsCellItem
          key="edit"
          icon={
            <Tooltip title={t("common.edit", "Edit")}>
              <EditIcon />
            </Tooltip>
          }
          label="Edit"
          onClick={() => handleEditUser(params.row)}
        />,
        <GridActionsCellItem
          key="roles"
          icon={
            <Tooltip title={t("users.assignRoles", "Assign Roles")}>
              <SecurityIcon />
            </Tooltip>
          }
          label="Roles"
          onClick={() => handleEditUserRoles(params.row)}
        />,
        <GridActionsCellItem
          key="delete"
          icon={
            <Tooltip title={t("common.delete", "Delete")}>
              <DeleteIcon />
            </Tooltip>
          }
          label="Delete"
          onClick={() => handleDeleteUser(params.row.id)}
          showInMenu
        />,
      ],
    },
  ];

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h4">
            {t("users.title", "User Directory")}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateUser}
          >
            {t("users.createUser", "Create User")}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {t("common.errorLoading", "Error loading users")}: {error.message}
          </Alert>
        )}

        <Paper sx={{ height: 600, width: "100%" }}>
          <DataGrid
            rows={filteredUsers}
            columns={columns}
            loading={isLoading}
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{
              pagination: { paginationModel: { pageSize: 25 } },
            }}
            disableRowSelectionOnClick
            sx={{
              "& .MuiDataGrid-cell:focus": {
                outline: "none",
              },
            }}
          />
        </Paper>
      </Box>

      <UserFormDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        user={editingUser}
      />

      {selectedUserForRoles && (
        <UserRoleDialog
          open={isRoleDialogOpen}
          onClose={() => setIsRoleDialogOpen(false)}
          user={selectedUserForRoles}
        />
      )}
    </Container>
  );
};
