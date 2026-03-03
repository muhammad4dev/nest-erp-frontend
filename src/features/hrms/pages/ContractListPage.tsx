import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { useActivateContract, useDeleteContract } from "@/lib/api/mutations";
import { useListContracts } from "@/lib/api/queries";
import { useAppNavigate } from "@/shared/hooks/useAppNavigate";
import { ContractStatus } from "@/types/api.types";
import type { EmploymentContract } from "@/types/api.types";

import { ContractStatusBadge } from "../components";

export const ContractListPage = () => {
  const { t } = useTranslation();
  const navigate = useAppNavigate();

  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: contractsData,
    isLoading,
    error,
  } = useListContracts({
    skip: paginationModel.page * paginationModel.pageSize,
    take: paginationModel.pageSize,
    status: statusFilter || undefined,
    search: searchTerm || undefined,
  });

  const activateContract = useActivateContract();
  const deleteContract = useDeleteContract();

  const rows = useMemo(() => contractsData?.data || [], [contractsData]);

  const handleDelete = async (id: string) => {
    if (!confirm(t("common.confirmDelete"))) return;
    await deleteContract.mutateAsync(id);
  };

  const handleActivate = async (id: string) => {
    await activateContract.mutateAsync(id);
  };

  const columns: GridColDef<EmploymentContract>[] = [
    {
      field: "jobPosition",
      headerName: "Job Position",
      flex: 1.1,
      minWidth: 140,
    },
    {
      field: "employeeId",
      headerName: "Employee",
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <Button
          size="small"
          onClick={() =>
            navigate({
              to: "/$lang/app/hrms/employees/$employeeId",
              params: { employeeId: params.value as string },
            })
          }
        >
          {params.row.employee?.code || params.value}
        </Button>
      ),
    },
    {
      field: "wage",
      headerName: "Wage",
      flex: 0.8,
      minWidth: 110,
      valueFormatter: (value) => `${Number(value) || 0}`,
    },
    {
      field: "startDate",
      headerName: "Start Date",
      flex: 0.9,
      minWidth: 120,
      valueFormatter: (value) => String(value || "").split("T")[0],
    },
    {
      field: "endDate",
      headerName: "End Date",
      flex: 0.9,
      minWidth: 120,
      valueFormatter: (value) =>
        value ? String(value).split("T")[0] : "Ongoing",
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.8,
      minWidth: 120,
      renderCell: (params) => <ContractStatusBadge status={params.value} />,
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      flex: 1,
      minWidth: 170,
      getActions: (params) => {
        const actions = [
          <GridActionsCellItem
            key="view"
            icon={<VisibilityIcon />}
            label="View"
            onClick={() =>
              navigate({
                to: "/$lang/app/hrms/contracts/$contractId",
                params: { contractId: params.id as string },
              })
            }
          />,
          <GridActionsCellItem
            key="edit"
            icon={<EditIcon />}
            label="Edit"
            onClick={() =>
              navigate({
                to: "/$lang/app/hrms/contracts/$contractId/edit",
                params: { contractId: params.id as string },
              })
            }
          />,
          <GridActionsCellItem
            key="delete"
            icon={<DeleteIcon />}
            label="Delete"
            onClick={() => handleDelete(params.id as string)}
          />,
        ];

        if (params.row.status === ContractStatus.DRAFT) {
          actions.unshift(
            <GridActionsCellItem
              key="activate"
              icon={<PlayArrowIcon />}
              label="Activate"
              onClick={() => handleActivate(params.id as string)}
            />,
          );
        }

        return actions;
      },
    },
  ];

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          {error instanceof Error ? error.message : t("common.error")}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Typography variant="h4">Contracts</Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{
            p: 2,
            bgcolor: "background.paper",
            borderRadius: 1,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <TextField
            size="small"
            placeholder="Search contracts"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flex: 1, minWidth: 200 }}
          />

          <FormControl size="small" sx={{ minWidth: 170 }}>
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value={ContractStatus.DRAFT}>Draft</MenuItem>
              <MenuItem value={ContractStatus.ACTIVE}>Active</MenuItem>
              <MenuItem value={ContractStatus.EXPIRED}>Expired</MenuItem>
              <MenuItem value={ContractStatus.TERMINATED}>Terminated</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("");
            }}
          >
            {t("common.clear")}
          </Button>
        </Stack>

        <Box sx={{ height: 620, bgcolor: "background.paper", borderRadius: 1 }}>
          {isLoading ? (
            <Box
              sx={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <DataGrid
              rows={rows}
              columns={columns}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              pageSizeOptions={[5, 10, 25, 50]}
              rowCount={contractsData?.total || 0}
              paginationMode="server"
              loading={isLoading}
              disableRowSelectionOnClick
            />
          )}
        </Box>
      </Stack>
    </Container>
  );
};
