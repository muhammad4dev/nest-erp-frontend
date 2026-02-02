import { Add, Delete } from "@mui/icons-material";
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState, useEffect } from "react";

import { usePartners } from "@/lib/api/queries/usePartners";
import { useProducts } from "@/lib/api/queries/useProducts";
import type {
  CreateSalesOrderDto,
  Partner,
  Product,
  SalesOrder,
  UpdateSalesOrderDto,
} from "@/types/api.types";

interface LineItem {
  _id: string; // Temporary ID for React keys
  productId: string;
  quantity: number;
  unitPrice: number;
  discountRate: number;
  product?: Product;
}

interface SalesOrderFormProps {
  initialData?: SalesOrder;
  onSubmit: (data: CreateSalesOrderDto | UpdateSalesOrderDto) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function SalesOrderForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: SalesOrderFormProps) {
  const { data: partners = [] } = usePartners();
  const { data: products = [] } = useProducts();

  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [lines, setLines] = useState<LineItem[]>([
    {
      _id: crypto.randomUUID(),
      productId: "",
      quantity: 1,
      unitPrice: 0,
      discountRate: 0,
    },
  ]);

  // Initialize form with existing data - only on mount or when initialData changes
  useEffect(() => {
    if (!initialData) return;

    const partner = partners.find((p) => p.id === initialData.partnerId);
    if (partner) {
      setSelectedPartner(partner);
    }

    if (initialData.lines && initialData.lines.length > 0) {
      setLines(
        initialData.lines.map((line) => ({
          _id: crypto.randomUUID(),
          productId: line.productId,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          discountRate: line.discountRate || 0,
          product: products.find((p) => p.id === line.productId),
        })),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData?.id]);

  const addLine = () => {
    setLines([
      ...lines,
      {
        _id: crypto.randomUUID(),
        productId: "",
        quantity: 1,
        unitPrice: 0,
        discountRate: 0,
      },
    ]);
  };

  const removeLine = (id: string) => {
    if (lines.length > 1) {
      setLines(lines.filter((line) => line._id !== id));
    }
  };

  const updateLine = (id: string, field: keyof LineItem, value: unknown) => {
    setLines(
      lines.map((line) => {
        if (line._id !== id) return line;

        const updatedLine = { ...line, [field]: value };

        // If product changed, update unit price and product reference
        if (field === "productId") {
          const product = products.find((p) => p.id === value);
          updatedLine.product = product;
          updatedLine.unitPrice = product?.salesPrice || 0;
        }

        return updatedLine;
      }),
    );
  };

  const calculateLineSubtotal = (line: LineItem): number => {
    return line.quantity * line.unitPrice;
  };

  const calculateLineDiscount = (line: LineItem): number => {
    const subtotal = calculateLineSubtotal(line);
    return subtotal * (line.discountRate / 100);
  };

  const calculateLineTotal = (line: LineItem): number => {
    const subtotal = calculateLineSubtotal(line);
    const discount = calculateLineDiscount(line);
    return subtotal - discount;
  };

  const calculateTotals = () => {
    const subtotal = lines.reduce(
      (sum, line) => sum + calculateLineSubtotal(line),
      0,
    );
    const discount = lines.reduce(
      (sum, line) => sum + calculateLineDiscount(line),
      0,
    );
    const total = lines.reduce(
      (sum, line) => sum + calculateLineTotal(line),
      0,
    );

    return { subtotal, discount, total };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPartner) {
      alert("Please select a customer");
      return;
    }

    const invalidLines = lines.filter(
      (line) => !line.productId || line.quantity <= 0 || line.unitPrice < 0,
    );
    if (invalidLines.length > 0) {
      alert("Please fill in all line items correctly");
      return;
    }

    try {
      const data: CreateSalesOrderDto = {
        partnerId: selectedPartner.id,
        lines: lines.map((line) => ({
          productId: line.productId,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          discountRate: line.discountRate,
        })),
      };

      await onSubmit(data);
    } catch (error) {
      console.error("Failed to save sales order:", error);
      alert("Failed to save sales order. Please try again.");
    }
  };

  const totals = calculateTotals();

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={3}>
        {/* Header Details */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Customer
            </Typography>
            <Autocomplete
              options={partners.filter((p) => p.isCustomer)}
              getOptionLabel={(option) => option.name}
              value={selectedPartner}
              onChange={(_, newValue) => setSelectedPartner(newValue)}
              renderInput={(params) => (
                <TextField {...params} label="Customer" required />
              )}
              disabled={isLoading}
            />
          </CardContent>
        </Card>

        {/* Line Items */}
        <Card>
          <CardContent>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Typography variant="h6">Order Lines</Typography>
              <Button
                startIcon={<Add />}
                onClick={addLine}
                variant="outlined"
                size="small"
                disabled={isLoading}
              >
                Add Line
              </Button>
            </Stack>

            <Box sx={{ overflowX: "auto" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Unit Price</TableCell>
                    <TableCell align="right">Discount %</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lines.map((line) => (
                    <TableRow key={line._id}>
                      <TableCell>
                        <Autocomplete
                          options={products}
                          getOptionLabel={(option) =>
                            `${option.name} (${option.sku})`
                          }
                          value={line.product || null}
                          onChange={(_, newValue) =>
                            updateLine(
                              line._id,
                              "productId",
                              newValue?.id || "",
                            )
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              size="small"
                              required
                              sx={{ minWidth: 200 }}
                            />
                          )}
                          disabled={isLoading}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={line.quantity}
                          onChange={(e) =>
                            updateLine(
                              line._id,
                              "quantity",
                              parseFloat(e.target.value),
                            )
                          }
                          size="small"
                          inputProps={{ min: 0.01, step: 0.01 }}
                          sx={{ width: 100 }}
                          disabled={isLoading}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={line.unitPrice}
                          onChange={(e) =>
                            updateLine(
                              line._id,
                              "unitPrice",
                              parseFloat(e.target.value),
                            )
                          }
                          size="small"
                          inputProps={{ min: 0, step: 0.01 }}
                          sx={{ width: 100 }}
                          disabled={isLoading}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={line.discountRate}
                          onChange={(e) =>
                            updateLine(
                              line._id,
                              "discountRate",
                              parseFloat(e.target.value),
                            )
                          }
                          size="small"
                          inputProps={{ min: 0, max: 100, step: 0.01 }}
                          sx={{ width: 80 }}
                          disabled={isLoading}
                        />
                      </TableCell>
                      <TableCell align="right">
                        {calculateLineTotal(line).toFixed(2)}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Remove Line">
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => removeLine(line._id)}
                              disabled={lines.length === 1 || isLoading}
                              color="error"
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>

            {/* Totals Summary */}
            <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
              <Stack spacing={1} sx={{ minWidth: 300 }}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography>Subtotal:</Typography>
                  <Typography>{totals.subtotal.toFixed(2)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography>Discount:</Typography>
                  <Typography color="error">
                    -{totals.discount.toFixed(2)}
                  </Typography>
                </Stack>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  sx={{ pt: 1, borderTop: 1, borderColor: "divider" }}
                >
                  <Typography variant="h6">Total:</Typography>
                  <Typography variant="h6">
                    {totals.total.toFixed(2)}
                  </Typography>
                </Stack>
              </Stack>
            </Box>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button variant="outlined" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            {isLoading
              ? "Saving..."
              : initialData
                ? "Update Order"
                : "Create Order"}
          </Button>
        </Stack>
      </Stack>
    </form>
  );
}
