import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useDeleteTenant } from "@/lib/api/mutations/useIdentity";
import { useTenants } from "@/lib/api/queries/useIdentity";
import { useAppNavigate } from "@/shared/hooks/useAppNavigate";
import type { Tenant } from "@/types/api.types";

export function TenantsListPage() {
  const { t } = useTranslation();
  const navigate = useAppNavigate();
  const { data: tenants, isLoading, error } = useTenants();
  const { mutate: deleteTenant } = useDeleteTenant();

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  // Filter tenants based on search
  const filteredTenants = (tenants || []).filter((tenant) =>
    tenant.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Paginate
  const paginatedTenants = filteredTenants.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDeleteClick = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedTenant) {
      deleteTenant(selectedTenant.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setSelectedTenant(null);
        },
      });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedTenant(null);
  };

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">
          {t("common.error")}: {(error as Error).message}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5">{t("nav.tenants")}</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate({ to: "/$lang/app/tenants/new" })}
        >
          {t("common.create")} {t("nav.tenant").toLowerCase()}
        </Button>
      </Box>

      <TextField
        fullWidth
        size="small"
        placeholder={t("common.search")}
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setPage(0);
        }}
        sx={{ mb: 2 }}
      />

      <TableContainer component={Paper}>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
              <TableRow>
                <TableCell>{t("common.name")}</TableCell>
                <TableCell>{t("common.schemaName")}</TableCell>
                <TableCell>{t("common.status")}</TableCell>
                <TableCell>{t("common.createdDate")}</TableCell>
                <TableCell align="right">{t("common.actions")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedTenants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body2" color="textSecondary">
                      {t("common.noData")}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTenants.map((tenant) => (
                  <TableRow key={tenant.id} hover>
                    <TableCell>{tenant.name}</TableCell>
                    <TableCell>{tenant.schemaName || "-"}</TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          color: tenant.isActive ? "green" : "red",
                          fontWeight: 500,
                        }}
                      >
                        {tenant.isActive
                          ? t("common.active")
                          : t("common.inactive")}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {new Date(tenant.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() =>
                          navigate({
                            to: "/$lang/app/tenants/$id",
                            params: { id: tenant.id },
                          })
                        }
                        title={t("common.view")}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() =>
                          navigate({
                            to: "/$lang/app/tenants/$id/edit",
                            params: { id: tenant.id },
                          })
                        }
                        title={t("common.edit")}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(tenant)}
                        title={t("common.delete")}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      {!isLoading && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredTenants.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>{t("common.confirmDelete")}</DialogTitle>
        <DialogContent>
          <Typography>
            {`${t("common.deleteConfirmation")} "${selectedTenant?.name}"?`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="inherit">
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            {t("common.delete")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
