import { Add, ArrowBack, Delete, Save } from "@mui/icons-material";
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Container,
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
import { useState } from "react";

import { useCreateRfq } from "@/lib/api/mutations/useProcurement";
import { usePartners } from "@/lib/api/queries/usePartners";
import { useProducts } from "@/lib/api/queries/useProducts";
import { useAppNavigate } from "@/shared/hooks/useAppNavigate";
import type {
  CreatePurchaseOrderLineDto,
  Partner,
  Product,
} from "@/types/api.types";

interface LineItem extends CreatePurchaseOrderLineDto {
  _id: string; // Temporary ID for React keys
  product?: Product;
}

export function RfqFormPage() {
  const navigate = useAppNavigate();
  const { data: partners = [] } = usePartners();
  const { data: products = [] } = useProducts();
  const createRfqMutation = useCreateRfq();

  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [orderDate, setOrderDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [lines, setLines] = useState<LineItem[]>([
    {
      _id: crypto.randomUUID(),
      productId: "",
      quantity: 1,
      unitPrice: 0,
    },
  ]);

  const addLine = () => {
    setLines([
      ...lines,
      {
        _id: crypto.randomUUID(),
        productId: "",
        quantity: 1,
        unitPrice: 0,
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
      lines.map((line) =>
        line._id === id ? { ...line, [field]: value } : line,
      ),
    );
  };

  const calculateLineTotal = (line: LineItem): number => {
    return line.quantity * line.unitPrice;
  };

  const calculateTotal = (): number => {
    return lines.reduce((sum, line) => sum + calculateLineTotal(line), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPartner) {
      alert("Please select a vendor");
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
      await createRfqMutation.mutateAsync({
        partnerId: selectedPartner.id,
        orderDate,
        lines: lines.map((line) => ({
          productId: line.productId,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
        })),
      });
      navigate({ to: "/$lang/app/procurement" });
    } catch (error) {
      console.error("Failed to create RFQ:", error);
      alert("Failed to create RFQ. Please try again.");
    }
  };

  const isLoading = createRfqMutation.isPending;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Tooltip title="Go Back">
          <IconButton
            onClick={() => navigate({ to: "/$lang/app/procurement" })}
          >
            <ArrowBack />
          </IconButton>
        </Tooltip>
        <Typography variant="h4">Create Request for Quotation</Typography>
      </Stack>

      <form onSubmit={handleSubmit}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              RFQ Details
            </Typography>
            <Stack spacing={2}>
              <Autocomplete
                options={partners}
                getOptionLabel={(option) => option.name}
                value={selectedPartner}
                onChange={(_, newValue) => setSelectedPartner(newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="Vendor" required />
                )}
                fullWidth
              />
              <TextField
                label="Order Date"
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                required
                fullWidth
                slotProps={{
                  inputLabel: { shrink: true },
                }}
              />
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6">Line Items</Typography>
              <Button
                startIcon={<Add />}
                onClick={addLine}
                variant="outlined"
                size="small"
              >
                Add Line
              </Button>
            </Box>

            <Box sx={{ overflowX: "auto" }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Unit Price</TableCell>
                    <TableCell align="right">Subtotal</TableCell>
                    <TableCell align="center" sx={{ width: 80 }}>
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lines.map((line) => (
                    <TableRow key={line._id}>
                      <TableCell>
                        <Autocomplete
                          options={products}
                          getOptionLabel={(option) =>
                            `${option.name} (${option.sku || "N/A"})`
                          }
                          value={line.product || null}
                          onChange={(_, newValue) => {
                            updateLine(line._id, "product", newValue);
                            updateLine(
                              line._id,
                              "productId",
                              newValue?.id || "",
                            );
                            if (newValue?.costPrice) {
                              updateLine(
                                line._id,
                                "unitPrice",
                                newValue.costPrice,
                              );
                            }
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              size="small"
                              placeholder="Select product"
                              required
                            />
                          )}
                          sx={{ minWidth: 250 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <TextField
                          type="number"
                          value={line.quantity}
                          onChange={(e) =>
                            updateLine(
                              line._id,
                              "quantity",
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          size="small"
                          required
                          slotProps={{
                            htmlInput: { min: 0.01, step: 0.01 },
                          }}
                          sx={{ width: 100 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <TextField
                          type="number"
                          value={line.unitPrice}
                          onChange={(e) =>
                            updateLine(
                              line._id,
                              "unitPrice",
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          size="small"
                          required
                          slotProps={{
                            htmlInput: { min: 0, step: 0.01 },
                          }}
                          sx={{ width: 120 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {calculateLineTotal(line).toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          onClick={() => removeLine(line._id)}
                          disabled={lines.length === 1}
                          color="error"
                          size="small"
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                mt: 2,
                pt: 2,
                borderTop: 1,
                borderColor: "divider",
              }}
            >
              <Typography variant="h6">
                Total: {calculateTotal().toFixed(2)}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            variant="outlined"
            onClick={() => navigate({ to: "/$lang/app/procurement" })}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={<Save />}
            disabled={
              isLoading ||
              !selectedPartner ||
              lines.length === 0 ||
              lines.some((line) => !line.productId)
            }
          >
            {isLoading ? "Creating..." : "Create RFQ"}
          </Button>
        </Stack>
      </form>
    </Container>
  );
}
