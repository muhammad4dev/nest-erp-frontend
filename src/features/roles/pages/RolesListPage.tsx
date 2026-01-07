import {
  Security as SecurityIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  VpnKey as PermissionsIcon,
} from "@mui/icons-material";
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Chip,
  Tooltip,
  Stack,
} from "@mui/material";
import {
  DataGrid,
  type GridColDef,
  GridActionsCellItem,
} from "@mui/x-data-grid";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { useDeleteRole } from "@/lib/api/mutations/useIdentity";
import { useRoles } from "@/lib/api/queries/useIdentity";
import type { Role } from "@/types/api.types";

import { RoleFormDialog } from "../components/RoleFormDialog";
import { RolePermissionsDialog } from "../components/RolePermissionsDialog";

export const RolesListPage: React.FC = () => {
  const { t } = useTranslation();

  // State for dialogs
  const [isFormDialogOpen, setIsFormDialogOpen] = React.useState(false);
  const [editingRole, setEditingRole] = React.useState<Role | undefined>();
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] =
    React.useState(false);
  const [selectedRoleForPermissions, setSelectedRoleForPermissions] =
    React.useState<Role | undefined>();

  // API hooks
  const { data: rolesResponse, isLoading } = useRoles();
  const deleteRoleMutation = useDeleteRole();

  const roles = React.useMemo(() => {
    return rolesResponse || [];
  }, [rolesResponse]);

  const handleCreateRole = () => {
    setEditingRole(undefined);
    setIsFormDialogOpen(true);
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setIsFormDialogOpen(true);
  };

  const handleDeleteRole = async (roleId: string) => {
    if (
      window.confirm(
        t("roles.confirmDelete", "Are you sure you want to delete this role?")
      )
    ) {
      await deleteRoleMutation.mutateAsync(roleId);
    }
  };

  const handleManagePermissions = (role: Role) => {
    setSelectedRoleForPermissions(role);
    setIsPermissionsDialogOpen(true);
  };

  const columns: GridColDef<Role>[] = [
    {
      field: "name",
      headerName: t("roles.name", "Name"),
      flex: 1,
      minWidth: 150,
    },
    {
      field: "description",
      headerName: t("roles.description", "Description"),
      flex: 2,
      minWidth: 250,
    },
    {
      field: "permissions",
      headerName: t("roles.permissions", "Permissions"),
      flex: 2,
      minWidth: 300,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5} sx={{ py: 1, flexWrap: "wrap" }}>
          {params.row.permissions?.slice(0, 3).map((permission) => (
            <Chip
              key={permission.id}
              label={`${permission.action}:${permission.resource}`}
              size="small"
              variant="outlined"
            />
          ))}
          {params.row.permissions && params.row.permissions.length > 3 && (
            <Chip
              label={`+${params.row.permissions.length - 3} more`}
              size="small"
              color="primary"
            />
          )}
        </Stack>
      ),
    },
    {
      field: "createdAt",
      headerName: t("roles.createdAt", "Created At"),
      width: 180,
      valueFormatter: (value) => new Date(value).toLocaleDateString(),
    },
    {
      field: "actions",
      type: "actions",
      headerName: t("common.actions", "Actions"),
      width: 150,
      getActions: (params) => [
        <GridActionsCellItem
          key="edit"
          icon={
            <Tooltip title={t("common.edit", "Edit")}>
              <EditIcon />
            </Tooltip>
          }
          label="Edit"
          onClick={() => handleEditRole(params.row)}
        />,
        <GridActionsCellItem
          key="permissions"
          icon={
            <Tooltip title={t("roles.managePermissions", "Manage Permissions")}>
              <PermissionsIcon />
            </Tooltip>
          }
          label="Permissions"
          onClick={() => handleManagePermissions(params.row)}
        />,
        <GridActionsCellItem
          key="delete"
          icon={
            <Tooltip title={t("common.delete", "Delete")}>
              <DeleteIcon />
            </Tooltip>
          }
          label="Delete"
          onClick={() => handleDeleteRole(params.row.id)}
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <SecurityIcon sx={{ fontSize: 40 }} />
            <Typography variant="h4">
              {t("roles.title", "Roles & Permissions")}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateRole}
          >
            {t("roles.createRole", "Create Role")}
          </Button>
        </Box>

        <Paper sx={{ height: 600, width: "100%" }}>
          <DataGrid
            rows={roles}
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

      <RoleFormDialog
        open={isFormDialogOpen}
        onClose={() => setIsFormDialogOpen(false)}
        role={editingRole}
      />

      {selectedRoleForPermissions && (
        <RolePermissionsDialog
          open={isPermissionsDialogOpen}
          onClose={() => setIsPermissionsDialogOpen(false)}
          role={selectedRoleForPermissions}
        />
      )}
    </Container>
  );
};
