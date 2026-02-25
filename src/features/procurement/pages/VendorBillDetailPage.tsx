import { ArrowBack, CheckCircle, Warning } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { useParams } from "@tanstack/react-router";
import { useState } from "react";

import { usePostBill } from "@/lib/api/mutations/useProcurement";
import { useVendorBill } from "@/lib/api/queries/useProcurement";
import { useAppNavigate } from "@/shared/hooks/useAppNavigate";
import { VendorBillStatus, VendorBillType } from "@/types/api.types";

const getStatusColor = (
  status: VendorBillStatus,
): "default" | "success" | "warning" | "error" => {
  switch (status) {
    case VendorBillStatus.DRAFT:
      return "default";
    case VendorBillStatus.POSTED:
      return "warning";
    case VendorBillStatus.PAID:
      return "success";
    case VendorBillStatus.CANCELLED:
      return "error";
    default:
      return "default";
  }
};

const getTypeColor = (
  type: VendorBillType,
): "primary" | "success" | "warning" => {
  switch (type) {
    case VendorBillType.BILL:
      return "primary";
    case VendorBillType.CREDIT_NOTE:
      return "success";
    case VendorBillType.DEBIT_NOTE:
      return "warning";
    default:
      return "primary";
  }
};

export function VendorBillDetailPage() {
  const navigate = useAppNavigate();
  const params = useParams({ strict: false });
  const billId = "billId" in params ? params.billId : undefined;

  const { data: bill, isLoading, error } = useVendorBill(billId || "");
  const postBillMutation = usePostBill();
  const [actionLoading, setActionLoading] = useState(false);

  const canPost = bill && bill.status === VendorBillStatus.DRAFT;

  const handlePostBill = async () => {
    if (!billId) return;

    setActionLoading(true);
    try {
      await postBillMutation.mutateAsync(billId);
      alert("Bill posted successfully!");
    } catch (error) {
      console.error("Failed to post bill:", error);
      alert("Failed to post bill. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Loading vendor bill...</Typography>
      </Container>
    );
  }

  if (error || !bill) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography color="error">
          {error ? "Error loading vendor bill" : "Vendor bill not found"}
        </Typography>
        <Button
          onClick={() => navigate({ to: "/$lang/app/procurement/bills" })}
          sx={{ mt: 2 }}
        >
          Back to Bills
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Tooltip title="Go Back">
          <IconButton
            onClick={() => navigate({ to: "/$lang/app/procurement/bills" })}
          >
            <ArrowBack />
          </IconButton>
        </Tooltip>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Vendor Bill {bill.billReference}
        </Typography>
        <Chip label={bill.type} color={getTypeColor(bill.type)} />
        <Chip label={bill.status} color={getStatusColor(bill.status)} />
      </Stack>

      {/* Overdue Alert */}
      {bill.isOverdue && bill.status !== VendorBillStatus.PAID && (
        <Alert severity="error" icon={<Warning />} sx={{ mb: 3 }}>
          This bill is overdue! Due date was{" "}
          {bill.dueDate ? new Date(bill.dueDate).toLocaleDateString() : "N/A"}
        </Alert>
      )}

      {/* Post Bill Action */}
      {canPost && (
        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <Button
            variant="contained"
            color="success"
            startIcon={<CheckCircle />}
            onClick={handlePostBill}
            disabled={actionLoading || postBillMutation.isPending}
          >
            {postBillMutation.isPending ? "Posting..." : "Post Bill"}
          </Button>
        </Stack>
      )}

      {/* Bill Details Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Bill Details
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" color="text.secondary">
                Vendor
              </Typography>
              <Typography variant="body1">
                {bill.partner?.name || "N/A"}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" color="text.secondary">
                Purchase Order
              </Typography>
              <Typography variant="body1">
                {bill.purchaseOrder?.orderNumber || "N/A"}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" color="text.secondary">
                Bill Reference
              </Typography>
              <Typography variant="body1">{bill.billReference}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" color="text.secondary">
                Due Date
              </Typography>
              <Typography variant="body1">
                {bill.dueDate
                  ? new Date(bill.dueDate).toLocaleDateString()
                  : "N/A"}
              </Typography>
            </Grid>
            {bill.notes && (
              <Grid size={{ xs: 12 }}>
                <Typography variant="body2" color="text.secondary">
                  Notes
                </Typography>
                <Typography variant="body1">{bill.notes}</Typography>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Line Items
          </Typography>
          <Paper variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">Unit Price</TableCell>
                  <TableCell align="right">Discount</TableCell>
                  <TableCell align="right">Tax</TableCell>
                  <TableCell align="right">Line Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(bill.lines ?? []).map((line) => (
                  <TableRow key={line.id}>
                    <TableCell>
                      <Typography variant="body2">
                        {line.product?.name || line.description || "N/A"}
                      </Typography>
                      {line.product?.sku && (
                        <Typography variant="caption" color="text.secondary">
                          SKU: {line.product.sku}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">{line.quantity}</TableCell>
                    <TableCell align="right">
                      {line.unitPrice.toFixed(2)}
                    </TableCell>
                    <TableCell align="right">
                      {line.discountAmount.toFixed(2)}
                    </TableCell>
                    <TableCell align="right">
                      {line.taxAmount.toFixed(2)}
                    </TableCell>
                    <TableCell align="right">
                      {line.lineTotal.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Box sx={{ minWidth: 300 }}>
              <Stack spacing={1}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography variant="body1">Subtotal:</Typography>
                  <Typography variant="body1">
                    {bill.netAmount.toFixed(2)}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography variant="body1">Discount:</Typography>
                  <Typography variant="body1">
                    {bill.totalDiscountAmount.toFixed(2)}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography variant="body1">Tax (14% VAT):</Typography>
                  <Typography variant="body1">
                    {bill.taxAmount.toFixed(2)}
                  </Typography>
                </Box>
                <Divider />
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography variant="h6">Total Amount:</Typography>
                  <Typography variant="h6">
                    {bill.totalAmount.toFixed(2)}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    Amount Paid:
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {bill.amountPaid.toFixed(2)}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography
                    variant="h6"
                    color={
                      bill.balanceDue && bill.balanceDue > 0
                        ? "error"
                        : "success"
                    }
                  >
                    Balance Due:
                  </Typography>
                  <Typography
                    variant="h6"
                    color={
                      bill.balanceDue && bill.balanceDue > 0
                        ? "error"
                        : "success"
                    }
                  >
                    {bill.balanceDue?.toFixed(2) || "0.00"}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
