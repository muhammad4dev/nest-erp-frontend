import { Add, Delete } from "@mui/icons-material";
import {
  Alert,
  Autocomplete,
  Button,
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
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

import { useCreateJournalEntry } from "@/lib/api/mutations/useFinance";
import { useAccounts } from "@/lib/api/queries/useFinance";
import type {
  Account,
  CreateJournalLineDto,
  JournalEntry,
} from "@/types/api.types";

interface JournalEntryFormDialogProps {
  open: boolean;
  entry?: JournalEntry;
  onClose: () => void;
}

interface LineItem extends Omit<CreateJournalLineDto, "accountId"> {
  account: Account | null;
  accountId: string;
}

export function JournalEntryFormDialog({
  open,
  entry,
  onClose,
}: JournalEntryFormDialogProps) {
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [lines, setLines] = useState<LineItem[]>([
    { account: null, accountId: "", debit: 0, credit: 0, description: "" },
    { account: null, accountId: "", debit: 0, credit: 0, description: "" },
  ]);

  const { data: accounts } = useAccounts();
  const createEntry = useCreateJournalEntry();

  useEffect(() => {
    if (entry) {
      setDescription(entry.reference || "");
      setDate(entry.transactionDate);
      if (entry.lines) {
        setLines(
          entry.lines.map((line) => ({
            account: line.account || null,
            accountId: line.accountId,
            debit: line.debit,
            credit: line.credit,
            description: line.description || "",
          }))
        );
      }
    } else {
      setDescription("");
      setDate(new Date().toISOString().split("T")[0]);
      setLines([
        { account: null, accountId: "", debit: 0, credit: 0, description: "" },
        { account: null, accountId: "", debit: 0, credit: 0, description: "" },
      ]);
    }
  }, [entry]);

  const handleAddLine = () => {
    setLines([
      ...lines,
      { account: null, accountId: "", debit: 0, credit: 0, description: "" },
    ]);
  };

  const handleRemoveLine = (index: number) => {
    if (lines.length > 2) {
      setLines(lines.filter((_, i) => i !== index));
    }
  };

  const handleLineChange = (
    index: number,
    field: keyof LineItem,
    value: string | number | Account | null
  ) => {
    const newLines = [...lines];
    if (field === "account") {
      newLines[index] = {
        ...newLines[index],
        account: value as Account | null,
        accountId: (value as Account)?.id || "",
      };
    } else {
      newLines[index] = { ...newLines[index], [field]: value };
    }
    setLines(newLines);
  };

  const totalDebit = lines.reduce((sum, line) => sum + (line.debit || 0), 0);
  const totalCredit = lines.reduce((sum, line) => sum + (line.credit || 0), 0);
  const isBalanced = totalDebit === totalCredit && totalDebit > 0;

  const handleSubmit = async () => {
    if (!isBalanced) {
      alert("Entry must be balanced (total debits must equal total credits)");
      return;
    }

    await createEntry.mutateAsync({
      description,
      date,
      lines: lines.map(({ accountId, debit, credit, description }) => ({
        accountId,
        debit,
        credit,
        description,
      })),
    });
    onClose();
  };

  const isReadOnly = entry?.status === "POSTED";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        {entry ? "View Journal Entry" : "New Journal Entry"}
      </DialogTitle>
      <DialogContent>
        <TextField
          margin="dense"
          label="Description"
          fullWidth
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isReadOnly}
          placeholder="e.g., Payment for office supplies"
        />

        <TextField
          margin="dense"
          label="Date"
          type="date"
          fullWidth
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          disabled={isReadOnly}
          InputLabelProps={{ shrink: true }}
        />

        <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
          Journal Lines
        </Typography>

        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Account</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right" width={120}>
                  Debit
                </TableCell>
                <TableCell align="right" width={120}>
                  Credit
                </TableCell>
                {!isReadOnly && <TableCell width={60} />}
              </TableRow>
            </TableHead>
            <TableBody>
              {lines.map((line, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Autocomplete
                      value={line.account}
                      onChange={(_, newValue) =>
                        handleLineChange(index, "account", newValue)
                      }
                      options={accounts || []}
                      getOptionLabel={(option) =>
                        `${option.code} - ${option.name}`
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Select account"
                          size="small"
                        />
                      )}
                      disabled={isReadOnly}
                      sx={{ minWidth: 250 }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      value={line.description}
                      onChange={(e) =>
                        handleLineChange(index, "description", e.target.value)
                      }
                      placeholder="Line description"
                      size="small"
                      fullWidth
                      disabled={isReadOnly}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      value={line.debit || ""}
                      onChange={(e) =>
                        handleLineChange(
                          index,
                          "debit",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      type="number"
                      size="small"
                      disabled={isReadOnly}
                      sx={{ width: 120 }}
                      inputProps={{ min: 0, step: 0.01 }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      value={line.credit || ""}
                      onChange={(e) =>
                        handleLineChange(
                          index,
                          "credit",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      type="number"
                      size="small"
                      disabled={isReadOnly}
                      sx={{ width: 120 }}
                      inputProps={{ min: 0, step: 0.01 }}
                    />
                  </TableCell>
                  {!isReadOnly && (
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveLine(index)}
                        disabled={lines.length <= 2}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={2}>
                  <strong>Totals</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>{totalDebit.toFixed(2)}</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>{totalCredit.toFixed(2)}</strong>
                </TableCell>
                {!isReadOnly && <TableCell />}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {!isReadOnly && (
          <Button startIcon={<Add />} onClick={handleAddLine} sx={{ mt: 2 }}>
            Add Line
          </Button>
        )}

        {!isBalanced && !isReadOnly && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Entry is not balanced. Debits ({totalDebit.toFixed(2)}) must equal
            Credits ({totalCredit.toFixed(2)})
          </Alert>
        )}

        {isBalanced && !isReadOnly && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Entry is balanced and ready to save as draft
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {!isReadOnly && (
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!isBalanced || createEntry.isPending}
          >
            Save Draft
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
