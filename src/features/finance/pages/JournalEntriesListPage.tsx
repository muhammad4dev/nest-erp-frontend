import { Add } from "@mui/icons-material";
import { Box, Button, Chip, Container, Paper, Typography } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useState } from "react";

import { usePostJournalEntry } from "@/lib/api/mutations/useFinance";
import { useJournalEntries } from "@/lib/api/queries/useFinance";
import type { JournalEntry, JournalStatus } from "@/types/api.types";

import { JournalEntryFormDialog } from "../components/JournalEntryFormDialog";

export function JournalEntriesListPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<
    JournalEntry | undefined
  >();

  const { data: entries, isLoading } = useJournalEntries();
  const postEntry = usePostJournalEntry();

  const handleEdit = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setDialogOpen(true);
  };

  const handlePost = async (entryId: string) => {
    if (
      confirm(
        "Are you sure you want to post this journal entry? Posted entries cannot be edited.",
      )
    ) {
      await postEntry.mutateAsync(entryId);
    }
  };

  const handleClose = () => {
    setDialogOpen(false);
    setSelectedEntry(undefined);
  };

  const getStatusColor = (
    status: JournalStatus,
  ): "default" | "success" | "warning" | "error" => {
    const colorMap: Record<
      JournalStatus,
      "default" | "success" | "warning" | "error"
    > = {
      DRAFT: "warning",
      POSTED: "success",
      VOIDED: "error",
    };
    return colorMap[status] || "default";
  };

  const columns: GridColDef<JournalEntry>[] = [
    {
      field: "reference",
      headerName: "Reference",
      width: 150,
      sortable: true,
    },
    {
      field: "transactionDate",
      headerName: "Date",
      width: 130,
      sortable: true,
      valueFormatter: (value) => {
        if (!value) return "";
        return new Date(value).toLocaleDateString();
      },
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      sortable: true,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={getStatusColor(params.value as JournalStatus)}
        />
      ),
    },
    {
      field: "lines",
      headerName: "Lines",
      width: 100,
      sortable: false,
      valueGetter: (_value, row) => row.lines?.length || 0,
    },
    {
      field: "createdAt",
      headerName: "Created",
      width: 180,
      sortable: true,
      valueFormatter: (value) => {
        if (!value) return "";
        return new Date(value).toLocaleString();
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          {params.row.status === "DRAFT" && (
            <>
              <Button size="small" onClick={() => handleEdit(params.row)}>
                Edit
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => handlePost(params.row.id)}
              >
                Post
              </Button>
            </>
          )}
          {params.row.status === "POSTED" && (
            <Button size="small" onClick={() => handleEdit(params.row)}>
              View
            </Button>
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
        }}
      >
        <div>
          <Typography variant="h4" gutterBottom>
            Journal Entries
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create and manage journal entries
          </Typography>
        </div>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setDialogOpen(true)}
        >
          New Entry
        </Button>
      </Box>

      <Paper sx={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={entries?.data || []}
          columns={columns}
          loading={isLoading}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 25, page: 0 },
            },
            sorting: {
              sortModel: [{ field: "transactionDate", sort: "desc" }],
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

      <JournalEntryFormDialog
        open={dialogOpen}
        entry={selectedEntry}
        onClose={handleClose}
      />
    </Container>
  );
}
