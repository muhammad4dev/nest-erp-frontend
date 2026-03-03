import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
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
} from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { useListEmployees } from "@/lib/api/queries";
import { useDeleteEmployee } from "@/lib/api/mutations";
import type { Employee } from "@/types/api.types";

import { EmployeeStatusBadge } from "../components/index";

export const EmployeeListPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate({ from: "/$lang/app/hrms/employees" });
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const {
    data: employeesData,
    isLoading,
    error,
  } = useListEmployees({
    skip: paginationModel.page * paginationModel.pageSize,
    take: paginationModel.pageSize,
    search: searchTerm || undefined,
    department: departmentFilter || undefined,
    isActive: statusFilter ? statusFilter === "active" : undefined,
  });

  const deleteEmployeeMutation = useDeleteEmployee();

  // Get unique departments from data
  const departments = useMemo(() => {
    if (!employeesData?.data) return [];
    return Array.from(
      new Set(employeesData.data.map((e: Employee) => e.department)),
    );
  }, [employeesData]);

  // Type assertion to string array for mapping
  const deptList = departments as string[];

  const handleViewEmployee = (id: string) => {
    navigate({
      to: "/$lang/app/hrms/employees/$employeeId",
      params: { lang: "en", employeeId: id },
    });
  };

  const handleEditEmployee = (id: string) => {
    navigate({
      to: "/$lang/app/hrms/employees/$employeeId/edit",
      params: { lang: "en", employeeId: id },
    });
  };

  const handleDeleteEmployee = (id: string) => {
    if (confirm(t("common.confirmDelete"))) {
      deleteEmployeeMutation.mutate(id);
    }
  };

  const handleCreateEmployee = () => {
    navigate({ to: "/$lang/app/hrms/employees/new", params: { lang: "en" } });
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setDepartmentFilter("");
    setStatusFilter("");
  };

  const columns: GridColDef<Employee>[] = [
    {
      field: "code",
      headerName: "Code",
      flex: 0.8,
      minWidth: 100,
    },
    {
      field: "firstName",
      headerName: "First Name",
      flex: 1,
      minWidth: 120,
    },
    {
      field: "lastName",
      headerName: "Last Name",
      flex: 1,
      minWidth: 120,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1.2,
      minWidth: 150,
    },
    {
      field: "jobTitle",
      headerName: "Job Title",
      flex: 1,
      minWidth: 130,
    },
    {
      field: "department",
      headerName: "Department",
      flex: 1,
      minWidth: 120,
    },
    {
      field: "isActive",
      headerName: "Status",
      flex: 0.8,
      minWidth: 100,
      renderCell: (params) => <EmployeeStatusBadge isActive={params.value} />,
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      flex: 0.6,
      minWidth: 100,
      getActions: (params) => [
        <GridActionsCellItem
          key="view"
          icon={<VisibilityIcon />}
          label="View"
          onClick={() => handleViewEmployee(params.id as string)}
        />,
        <GridActionsCellItem
          key="edit"
          icon={<EditIcon />}
          label="Edit"
          onClick={() => handleEditEmployee(params.id as string)}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => handleDeleteEmployee(params.id as string)}
        />,
      ],
    },
  ];

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          {error instanceof Error ? error.message : "Failed to load employees"}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <h2>{t("nav.employees")}</h2>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateEmployee}
          >
            {t("common.create")} {t("nav.employees")}
          </Button>
        </Box>

        {/* Filters */}
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
            placeholder={t("common.search")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{ flex: 1, minWidth: 200 }}
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Department</InputLabel>
            <Select
              value={departmentFilter}
              label="Department"
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <MenuItem value="">All Departments</MenuItem>
              {deptList.map((dept: string) => (
                <MenuItem key={dept} value={dept}>
                  {dept}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>{t("common.status")}</InputLabel>
            <Select
              value={statusFilter}
              label={t("common.status")}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="active">{t("common.active")}</MenuItem>
              <MenuItem value="inactive">{t("common.inactive")}</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            onClick={handleClearFilters}
            sx={{ minWidth: 100 }}
          >
            {t("common.clear")}
          </Button>
        </Stack>

        {/* Data Grid */}
        <Box sx={{ height: 600, bgcolor: "background.paper", borderRadius: 1 }}>
          {isLoading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <DataGrid
              rows={employeesData?.data || []}
              columns={columns}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              pageSizeOptions={[5, 10, 25, 50]}
              rowCount={employeesData?.total || 0}
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
