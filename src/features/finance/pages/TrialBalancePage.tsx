import { Download, Print } from "@mui/icons-material";
import {
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useState } from "react";

import { useTrialBalance } from "@/lib/api/queries/useFinance";
import { useFiscalPeriods } from "@/lib/api/queries/useFinance";
import { AccountType } from "@/types/api.types";

export function TrialBalancePage() {
  const [periodId, setPeriodId] = useState<string>("");
  const [accountType, setAccountType] = useState<AccountType | "">("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const { data: periods } = useFiscalPeriods();
  const { data: entries, isLoading } = useTrialBalance(startDate, endDate);

  const totalDebit = entries?.reduce((sum, entry) => sum + entry.debit, 0) || 0;
  const totalCredit =
    entries?.reduce((sum, entry) => sum + entry.credit, 0) || 0;

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    if (!entries) return;

    const csv = [
      ["Account Code", "Account Name", "Type", "Debit", "Credit", "Balance"],
      ...entries.map((entry) => [
        entry.accountCode,
        entry.accountName,
        entry.accountType,
        entry.debit.toFixed(2),
        entry.credit.toFixed(2),
        entry.balance.toFixed(2),
      ]),
      ["", "", "Total", totalDebit.toFixed(2), totalCredit.toFixed(2), ""],
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trial-balance-${new Date().toISOString().split("T")[0]}.csv`;
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
            Trial Balance
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View trial balance report by period and account type
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
        <Box sx={{ display: "flex", gap: 2 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Fiscal Period</InputLabel>
            <Select
              value={periodId}
              label="Fiscal Period"
              onChange={(e) => {
                const selectedPeriodId = e.target.value;
                setPeriodId(selectedPeriodId);
                const period = periods?.find((p) => p.id === selectedPeriodId);
                if (period) {
                  setStartDate(period.startDate);
                  setEndDate(period.endDate);
                } else {
                  setStartDate("");
                  setEndDate("");
                }
              }}
            >
              <MenuItem value="">
                <em>All Periods</em>
              </MenuItem>
              {periods?.map((period) => (
                <MenuItem key={period.id} value={period.id}>
                  {period.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Account Type</InputLabel>
            <Select
              value={accountType}
              label="Account Type"
              onChange={(e) =>
                setAccountType(e.target.value as AccountType | "")
              }
            >
              <MenuItem value="">
                <em>All Types</em>
              </MenuItem>
              <MenuItem value="ASSET">Asset</MenuItem>
              <MenuItem value="LIABILITY">Liability</MenuItem>
              <MenuItem value="EQUITY">Equity</MenuItem>
              <MenuItem value="INCOME">Income</MenuItem>
              <MenuItem value="EXPENSE">Expense</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "primary.main" }}>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                Account Code
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                Account Name
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                Type
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
                <TableCell colSpan={6} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            )}
            {!isLoading && !entries?.length && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No data available
                </TableCell>
              </TableRow>
            )}
            {entries?.map((entry) => (
              <TableRow key={entry.accountId} hover>
                <TableCell>{entry.accountCode}</TableCell>
                <TableCell>{entry.accountName}</TableCell>
                <TableCell>{entry.accountType}</TableCell>
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
            {entries && entries.length > 0 && (
              <TableRow sx={{ backgroundColor: "grey.100" }}>
                <TableCell colSpan={3} sx={{ fontWeight: "bold" }}>
                  Total
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold" }}>
                  {totalDebit.toFixed(2)}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold" }}>
                  {totalCredit.toFixed(2)}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold" }}>
                  {(totalDebit - totalCredit).toFixed(2)}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box
        sx={{
          mt: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Report generated on {new Date().toLocaleString()}
        </Typography>
        {entries && entries.length > 0 && (
          <Typography
            variant="body2"
            color={totalDebit === totalCredit ? "success.main" : "error.main"}
            sx={{ fontWeight: "bold" }}
          >
            {totalDebit === totalCredit
              ? "✓ Trial Balance is balanced"
              : "⚠ Trial Balance is not balanced"}
          </Typography>
        )}
      </Box>
    </Container>
  );
}
