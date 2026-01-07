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
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  useCreateStockReceipt,
  useUpdateStockReceipt,
} from "@/lib/api/mutations/useStockReceipts";
import { useProducts } from "@/lib/api/queries/useProducts";
import { useStockLocations } from "@/lib/api/queries/useProducts";
import type {
  CreateStockReceiptDto,
  UpdateStockReceiptDto,
  StockReceipt,
  ReceiptSourceType,
} from "@/types/api.types";

interface StockReceiptFormDialogProps {
  open: boolean;
  mode: "create" | "edit";
  receipt?: StockReceipt;
  onClose: () => void;
  onSaved?: () => void;
}

interface LineItemForm {
  productId: string;
  variantId?: string;
  quantity: number;
  unitCost: number;
  batchNumber?: string;
  expiryDate?: string;
  serialNumbers?: string[];
  productName?: string;
  lineTotal: number; // Calculated field, not in DTO
}

const sourceTypes: ReceiptSourceType[] = [
  "PURCHASE",
  "PRODUCTION",
  "RETURN",
  "TRANSFER",
  "ADJUSTMENT",
];

export const StockReceiptFormDialog: React.FC<StockReceiptFormDialogProps> = ({
  open,
  mode,
  receipt,
  onClose,
  onSaved,
}) => {
  const { t } = useTranslation();
  const { data: products = [] } = useProducts();
  const { data: locations = [] } = useStockLocations();
  const createMutation = useCreateStockReceipt();
  const updateMutation = useUpdateStockReceipt();

  const [formData, setFormData] = useState<
    Omit<CreateStockReceiptDto, "lines">
  >({
    receiptDate: new Date().toISOString().split("T")[0],
    sourceType: "PURCHASE",
    locationId: "",
    sourceReference: "",
    notes: "",
  });

  const [lines, setLines] = useState<LineItemForm[]>([
    {
      productId: "",
      quantity: 0,
      unitCost: 0,
      lineTotal: 0,
    },
  ]);

  // Preload form when editing
  useEffect(() => {
    if (open && mode === "edit" && receipt) {
      setFormData({
        receiptDate: receipt.receiptDate,
        sourceType: receipt.sourceType,
        locationId: receipt.locationId,
        sourceReference: receipt.sourceReference || "",
        notes: receipt.notes || "",
      });

      const mappedLines: LineItemForm[] = (receipt.lines || []).map((line) => ({
        productId: line.productId,
        variantId: line.variantId || undefined,
        quantity: Number(line.quantity),
        unitCost: Number(line.unitCost),
        batchNumber: line.batchNumber || undefined,
        expiryDate: line.expiryDate || undefined,
        serialNumbers: line.serialNumbers || undefined,
        productName: line.product?.name,
        lineTotal: Number(line.quantity) * Number(line.unitCost),
      }));

      setLines(mappedLines.length ? mappedLines : lines);
    } else if (open && mode === "create") {
      handleReset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode, receipt]);

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
    value: string | number,
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
      0,
    );
    const totalValue = lines.reduce(
      (sum, line) => sum + Number(line.lineTotal || 0),
      0,
    );
    return { totalQuantity, totalValue };
  };

  const handleSubmit = async () => {
    const baseLines = lines.map((line) => ({
      productId: line.productId,
      variantId: line.variantId,
      quantity: Number(line.quantity),
      unitCost: Number(line.unitCost),
      batchNumber: line.batchNumber,
      expiryDate: line.expiryDate,
      serialNumbers: line.serialNumbers,
    }));

    if (mode === "edit" && receipt) {
      const dto: UpdateStockReceiptDto = {
        receiptDate: formData.receiptDate,
        sourceType: formData.sourceType,
        locationId: formData.locationId,
        sourceReference: formData.sourceReference,
        notes: formData.notes,
        lines: baseLines,
        totalQuantity: lines.reduce(
          (sum, line) => sum + Number(line.quantity || 0),
          0,
        ),
        totalValue: lines.reduce(
          (sum, line) =>
            sum + Number(line.quantity || 0) * Number(line.unitCost || 0),
          0,
        ),
      };

      await updateMutation.mutateAsync({ id: receipt.id, data: dto });
    } else {
      const dto: CreateStockReceiptDto = {
        ...formData,
        lines: baseLines,
      };
      await createMutation.mutateAsync(dto);
    }

    if (onSaved) onSaved();
    handleClose();
  };

  const handleReset = () => {
    setFormData({
      receiptDate: new Date().toISOString().split("T")[0],
      sourceType: "PURCHASE",
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
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const { totalQuantity, totalValue } = calculateTotals();
  const isValid =
    formData.locationId &&
    lines.length > 0 &&
    lines.every((line) => line.productId && line.quantity > 0);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        {mode === "edit"
          ? t("inventory.stockReceipts.newReceipt")
          : t("inventory.stockReceipts.newReceipt")}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
          {/* Header Fields */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label={t("inventory.stockReceipts.receiptDate")}
                value={new Date(formData.receiptDate)}
                onChange={(date: Date | null) =>
                  setFormData({
                    ...formData,
                    receiptDate: date?.toISOString().split("T")[0] || "",
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
              label={t("inventory.stockReceipts.sourceType")}
              value={formData.sourceType}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  sourceType: e.target.value as ReceiptSourceType,
                })
              }
              required
              fullWidth
            >
              {sourceTypes.map((type) => (
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
                  label={t("inventory.stockReceipts.location")}
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
                    <TableCell>Expiry Date</TableCell>
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
                              Number(e.target.value),
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
                              Number(e.target.value),
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
                              e.target.value,
                            )
                          }
                          size="small"
                          sx={{ width: 120 }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="date"
                          value={line.expiryDate || ""}
                          onChange={(e) =>
                            handleLineChange(
                              index,
                              "expiryDate",
                              e.target.value,
                            )
                          }
                          size="small"
                          InputLabelProps={{ shrink: true }}
                          sx={{ width: 150 }}
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
          disabled={!isValid || createMutation.isPending}
        >
          {createMutation.isPending ? "Creating..." : "Create Receipt"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
