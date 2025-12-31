import { Download, Print } from "@mui/icons-material";
import {
  Autocomplete,
  Box,
  Button,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

import { useAccounts, useGeneralLedger } from "@/lib/api/queries/useFinance";
import type { Account } from "@/types/api.types";

export function GeneralLedgerPage() {
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data: accounts } = useAccounts();
  const { data: entries, isLoading } = useGeneralLedger(
    selectedAccount?.id,
    startDate,
    endDate
  );

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    if (!entries) return;

    const csv = [
      [
        "Date",
        "Reference",
        "Description",
        "Account",
        "Debit",
        "Credit",
        "Balance",
      ],
      ...entries.map((entry) => [
        entry.date,
        entry.reference,
        entry.description || "",
        `${entry.accountCode} - ${entry.accountName}`,
        entry.debit.toFixed(2),
        entry.credit.toFixed(2),
        entry.balance.toFixed(2),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `general-ledger-${selectedAccount?.code || "all"}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
            General Ledger
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View detailed transaction history by account
          </Typography>
        </div>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleExport}
            disabled={!entries?.length}
          >
            Export CSV
          </Button>
          <Button
            variant="outlined"
            startIcon={<Print />}
            onClick={handlePrint}
            disabled={!entries?.length}
          >
            Print
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Autocomplete
            value={selectedAccount}
            onChange={(_, newValue) => setSelectedAccount(newValue)}
            options={accounts || []}
            getOptionLabel={(option) => `${option.code} - ${option.name}`}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Account"
                placeholder="Select account"
              />
            )}
            sx={{ minWidth: 300 }}
          />

          <TextField
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 180 }}
          />

          <TextField
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 180 }}
          />
        </Box>
      </Paper>

      {selectedAccount && (
        <Paper sx={{ p: 2, mb: 3, backgroundColor: "primary.light" }}>
          <Typography variant="h6" color="primary.contrastText">
            {selectedAccount.code} - {selectedAccount.name}
          </Typography>
          <Typography variant="body2" color="primary.contrastText">
            Type: {selectedAccount.type}
            {selectedAccount.isControlAccount && " • Control Account"}
          </Typography>
        </Paper>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "primary.main" }}>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                Date
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                Reference
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                Description
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                Account
              </TableCell>
              <TableCell
                align="right"
                sx={{ color: "white", fontWeight: "bold" }}
              >
                Debit
              </TableCell>
              <TableCell
                align="right"
                sx={{ color: "white", fontWeight: "bold" }}
              >
                Credit
              </TableCell>
              <TableCell
                align="right"
                sx={{ color: "white", fontWeight: "bold" }}
              >
                Balance
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            )}
            {!isLoading && !selectedAccount && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Please select an account to view transactions
                </TableCell>
              </TableRow>
            )}
            {!isLoading && selectedAccount && !entries?.length && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No transactions found for the selected criteria
                </TableCell>
              </TableRow>
            )}
            {entries?.map((entry, index) => (
              <TableRow key={index} hover>
                <TableCell>
                  {new Date(entry.date).toLocaleDateString()}
                </TableCell>
                <TableCell>{entry.reference}</TableCell>
                <TableCell>{entry.description || "-"}</TableCell>
                <TableCell>
                  {entry.accountCode} - {entry.accountName}
                </TableCell>
                <TableCell align="right">
                  {entry.debit > 0 ? entry.debit.toFixed(2) : "-"}
                </TableCell>
                <TableCell align="right">
                  {entry.credit > 0 ? entry.credit.toFixed(2) : "-"}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold" }}>
                  {entry.balance.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Report generated on {new Date().toLocaleString()}
        </Typography>
      </Box>
    </Container>
  );
}
