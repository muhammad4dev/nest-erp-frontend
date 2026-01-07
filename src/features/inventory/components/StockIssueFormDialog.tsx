import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Autocomplete,
  Typography,
  Alert,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import {
  useCreateStockIssue,
  useUpdateStockIssue,
} from "@/lib/api/mutations/useStockReceipts";
import { useProducts } from "@/lib/api/queries/useProducts";
import { useStockLocations } from "@/lib/api/queries/useProducts";
import type {
  CreateStockIssueDto,
  IssueType,
  StockIssue,
} from "@/types/api.types";

interface StockIssueFormDialogProps {
  open: boolean;
  onClose: () => void;
  mode?: "create" | "edit";
  issue?: StockIssue;
}

interface LineItemForm {
  productId: string;
  variantId?: string;
  quantity: number;
  unitCost: number;
  batchNumber?: string;
  serialNumbers?: string[];
  productName?: string;
  lineTotal: number; // Calculated field, not in DTO
}

const issueTypes: IssueType[] = [
  "SALE",
  "PRODUCTION",
  "TRANSFER",
  "WRITEOFF",
  "ADJUSTMENT",
];

export const StockIssueFormDialog: React.FC<StockIssueFormDialogProps> = ({
  open,
  onClose,
  mode = "create",
  issue,
}) => {
  const { t } = useTranslation();
  const { data: products = [] } = useProducts();
  const { data: locations = [] } = useStockLocations();
  const createMutation = useCreateStockIssue();
  const updateMutation = useUpdateStockIssue();

  const getInitialFormData = (): Omit<CreateStockIssueDto, "lines"> => {
    if (mode === "edit" && issue) {
      return {
        issueDate: issue.issueDate.split("T")[0],
        issueType: issue.issueType,
        locationId: issue.locationId,
        sourceReference: issue.sourceReference || "",
        notes: issue.notes || "",
      };
    }
    return {
      issueDate: new Date().toISOString().split("T")[0],
      issueType: "SALE",
      locationId: "",
      sourceReference: "",
      notes: "",
    };
  };

  const getInitialLines = (): LineItemForm[] => {
    if (mode === "edit" && issue?.lines) {
      return issue.lines.map((line) => ({
        productId: line.productId,
        variantId: line.variantId,
        quantity: line.quantity,
        unitCost:
          typeof line.unitCost === "number"
            ? line.unitCost
            : parseFloat(String(line.unitCost)),
        batchNumber: line.batchNumber,
        serialNumbers: line.serialNumbers,
        productName: line.product?.name,
        lineTotal:
          typeof line.lineTotal === "number"
            ? line.lineTotal
            : parseFloat(String(line.lineTotal)),
      }));
    }
    return [
      {
        productId: "",
        quantity: 0,
        unitCost: 0,
        lineTotal: 0,
      },
    ];
  };

  const [formData, setFormData] = useState(getInitialFormData);
  const [lines, setLines] = useState(getInitialLines);

  // Reset form when issue or mode changes
  // Track dependencies for reset
  const [prevOpen, setPrevOpen] = useState(open);
  const [prevMode, setPrevMode] = useState(mode);
  const [prevIssue, setPrevIssue] = useState(issue);

  if (open && (!prevOpen || mode !== prevMode || issue !== prevIssue)) {
    setFormData(getInitialFormData());
    setLines(getInitialLines());
    setPrevOpen(open);
    setPrevMode(mode);
    setPrevIssue(issue);
  } else if (!open && prevOpen) {
    setPrevOpen(false);
  }

  const handleAddLine = () => {
    setLines([
      ...lines,
      {
        productId: "",
        quantity: 0,
        unitCost: 0,
        lineTotal: 0,
      },
    ]);
  };

  const handleRemoveLine = (index: number) => {
    if (lines.length > 1) {
      setLines(lines.filter((_, i) => i !== index));
    }
  };

  const handleLineChange = (
    index: number,
    field: keyof LineItemForm,
    value: string | number
  ) => {
    const newLines = [...lines];
    newLines[index] = {
      ...newLines[index],
      [field]: value,
    };

    // Auto-calculate lineTotal when quantity or unitCost changes
    if (field === "quantity" || field === "unitCost") {
      const quantity = Number(newLines[index].quantity || 0);
      const unitCost = Number(newLines[index].unitCost || 0);
      newLines[index].lineTotal = quantity * unitCost;
    }

    setLines(newLines);
  };

  const handleProductSelect = (index: number, productId: string | null) => {
    if (!productId) return;

    const product = products.find((p) => p.id === productId);
    const newLines = [...lines];
    newLines[index] = {
      ...newLines[index],
      productId,
      productName: product?.name,
    };
    setLines(newLines);
  };

  const calculateTotals = () => {
    const totalQuantity = lines.reduce(
      (sum, line) => sum + Number(line.quantity || 0),
      0
    );
    const totalValue = lines.reduce(
      (sum, line) => sum + Number(line.lineTotal || 0),
      0
    );
    return { totalQuantity, totalValue };
  };

  const handleSubmit = async () => {
    const dto: CreateStockIssueDto = {
      ...formData,
      lines: lines.map((line) => ({
        productId: line.productId,
        variantId: line.variantId,
        quantity: Number(line.quantity),
        unitCost: Number(line.unitCost),
        batchNumber: line.batchNumber,
        serialNumbers: line.serialNumbers,
      })),
    };

    if (mode === "edit" && issue) {
      await updateMutation.mutateAsync({ id: issue.id, data: dto });
    } else {
      await createMutation.mutateAsync(dto);
    }
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      issueDate: new Date().toISOString().split("T")[0],
      issueType: "SALE",
      locationId: "",
      sourceReference: "",
      notes: "",
    });
    setLines([
      {
        productId: "",
        quantity: 0,
        unitCost: 0,
        lineTotal: 0,
      },
    ]);
    onClose();
  };

  const { totalQuantity, totalValue } = calculateTotals();
  const isValid =
    formData.locationId &&
    lines.length > 0 &&
    lines.every((line) => line.productId && line.quantity > 0);

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        {mode === "edit"
          ? "Edit Stock Issue"
          : t("inventory.stockIssues.newIssue")}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
          <Alert severity="info">
            Stock availability will be validated when the issue is completed.
          </Alert>

          {/* Header Fields */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label={t("inventory.stockIssues.issueDate")}
                value={new Date(formData.issueDate)}
                onChange={(date: Date | null) =>
                  setFormData({
                    ...formData,
                    issueDate: date?.toISOString().split("T")[0] || "",
                  })
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                  },
                }}
              />
            </LocalizationProvider>

            <TextField
              select
              label={t("inventory.stockIssues.issueType")}
              value={formData.issueType}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  issueType: e.target.value as IssueType,
                })
              }
              required
              fullWidth
            >
              {issueTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>

            <Autocomplete
              options={locations}
              getOptionLabel={(option) => option.name}
              value={
                locations.find((loc) => loc.id === formData.locationId) || null
              }
              onChange={(_, value) =>
                setFormData({ ...formData, locationId: value?.id || "" })
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("inventory.stockIssues.location")}
                  required
                />
              )}
              fullWidth
            />

            <TextField
              label="Source Reference"
              value={formData.sourceReference}
              onChange={(e) =>
                setFormData({ ...formData, sourceReference: e.target.value })
              }
              fullWidth
            />
          </Box>

          <TextField
            label="Notes"
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            multiline
            rows={2}
            fullWidth
          />

          {/* Line Items */}
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Typography variant="h6">Line Items</Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddLine}
                variant="outlined"
                size="small"
              >
                Add Item
              </Button>
            </Box>

            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Unit Cost</TableCell>
                    <TableCell align="right">Line Total</TableCell>
                    <TableCell>Batch #</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lines.map((line, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Autocomplete
                          options={products}
                          getOptionLabel={(option) => option.name}
                          value={
                            products.find((p) => p.id === line.productId) ||
                            null
                          }
                          onChange={(_, value) =>
                            handleProductSelect(index, value?.id || null)
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              size="small"
                              placeholder="Select product"
                              required
                            />
                          )}
                          sx={{ minWidth: 200 }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={line.quantity || ""}
                          onChange={(e) =>
                            handleLineChange(
                              index,
                              "quantity",
                              Number(e.target.value)
                            )
                          }
                          size="small"
                          inputProps={{ min: 0, step: 0.01 }}
                          sx={{ width: 100 }}
                          required
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={line.unitCost || ""}
                          onChange={(e) =>
                            handleLineChange(
                              index,
                              "unitCost",
                              Number(e.target.value)
                            )
                          }
                          size="small"
                          inputProps={{ min: 0, step: 0.01 }}
                          sx={{ width: 100 }}
                          required
                        />
                      </TableCell>
                      <TableCell align="right">
                        ${line.lineTotal.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <TextField
                          value={line.batchNumber || ""}
                          onChange={(e) =>
                            handleLineChange(
                              index,
                              "batchNumber",
                              e.target.value
                            )
                          }
                          size="small"
                          sx={{ width: 120 }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveLine(index)}
                          disabled={lines.length === 1}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Totals */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 4,
              p: 2,
              bgcolor: "background.default",
              borderRadius: 1,
            }}
          >
            <Typography variant="body1">
              <strong>Total Quantity:</strong> {totalQuantity.toFixed(2)}
            </Typography>
            <Typography variant="body1">
              <strong>Total Value:</strong> ${totalValue.toFixed(2)}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!isValid || isLoading}
        >
          {isLoading
            ? mode === "edit"
              ? "Updating..."
              : "Creating..."
            : mode === "edit"
              ? "Update Issue"
              : "Create Issue"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
