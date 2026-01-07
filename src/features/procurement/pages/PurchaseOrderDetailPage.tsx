import { ArrowBack, CheckCircle, Description } from "@mui/icons-material";
import {
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

import {
  useConfirmOrder,
  useCreateBill,
} from "@/lib/api/mutations/useProcurement";
import { usePurchaseOrder } from "@/lib/api/queries/useProcurement";
import { useAppNavigate } from "@/shared/hooks/useAppNavigate";
import { PurchaseOrderStatus } from "@/types/api.types";

const getStatusColor = (
  status: PurchaseOrderStatus
): "default" | "primary" | "secondary" | "success" | "warning" | "info" => {
  switch (status) {
    case PurchaseOrderStatus.RFQ:
      return "default";
    case PurchaseOrderStatus.RFQ_SENT:
      return "info";
    case PurchaseOrderStatus.TO_APPROVE:
      return "warning";
    case PurchaseOrderStatus.PURCHASE_ORDER:
      return "primary";
    case PurchaseOrderStatus.RECEIVED:
      return "secondary";
    case PurchaseOrderStatus.BILLED:
      return "success";
    case PurchaseOrderStatus.LOCKED:
    case PurchaseOrderStatus.CANCELLED:
      return "default";
    default:
      return "default";
  }
};

export function PurchaseOrderDetailPage() {
  const navigate = useAppNavigate();
  const params = useParams({ strict: false });
  const orderId = "orderId" in params ? params.orderId : undefined;

  const { data: order, isLoading, error } = usePurchaseOrder(orderId || "");
  const confirmMutation = useConfirmOrder();
  const createBillMutation = useCreateBill();
  const [actionLoading, setActionLoading] = useState(false);

  const canConfirm =
    order &&
    (order.status === PurchaseOrderStatus.RFQ ||
      order.status === PurchaseOrderStatus.RFQ_SENT);

  const canCreateBill =
    order &&
    (order.status === PurchaseOrderStatus.PURCHASE_ORDER ||
      order.status === PurchaseOrderStatus.RECEIVED);

  const handleConfirm = async () => {
    if (!orderId) return;

    setActionLoading(true);
    try {
      await confirmMutation.mutateAsync(orderId);
      alert("Order confirmed successfully!");
    } catch (error) {
      console.error("Failed to confirm order:", error);
      alert("Failed to confirm order. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateBill = async () => {
    if (!orderId) return;

    setActionLoading(true);
    try {
      const bill = await createBillMutation.mutateAsync(orderId);
      alert("Vendor bill created successfully!");
      navigate({
        to: "/$lang/app/procurement/bills/$billId",
        params: { billId: bill.id },
      });
    } catch (error) {
      console.error("Failed to create bill:", error);
      alert("Failed to create bill. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Loading purchase order...</Typography>
      </Container>
    );
  }

  if (error || !order) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography color="error">
          {error ? "Error loading purchase order" : "Purchase order not found"}
        </Typography>
        <Button
          onClick={() => navigate({ to: "/$lang/app/procurement/orders" })}
          sx={{ mt: 2 }}
        >
          Back to Orders
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Tooltip title="Go Back">
          <IconButton
            onClick={() => navigate({ to: "/$lang/app/procurement/orders" })}
          >
            <ArrowBack />
          </IconButton>
        </Tooltip>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Purchase Order {order.orderNumber}
        </Typography>
        <Chip label={order.status} color={getStatusColor(order.status)} />
      </Stack>

      {/* Action Buttons */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        {canConfirm && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<CheckCircle />}
            onClick={handleConfirm}
            disabled={actionLoading || confirmMutation.isPending}
          >
            {confirmMutation.isPending ? "Confirming..." : "Confirm Order"}
          </Button>
        )}
        {canCreateBill && (
          <Button
            variant="contained"
            color="success"
            startIcon={<Description />}
            onClick={handleCreateBill}
            disabled={actionLoading || createBillMutation.isPending}
          >
            {createBillMutation.isPending ? "Creating..." : "Create Bill"}
          </Button>
        )}
      </Stack>

      {/* Order Details Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Order Details
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" color="text.secondary">
                Vendor
              </Typography>
              <Typography variant="body1">
                {order.partner?.name || "N/A"}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" color="text.secondary">
                Order Date
              </Typography>
              <Typography variant="body1">
                {new Date(order.orderDate).toLocaleDateString()}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" color="text.secondary">
                Order Number
              </Typography>
              <Typography variant="body1">{order.orderNumber}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" color="text.secondary">
                Status
              </Typography>
              <Typography variant="body1">{order.status}</Typography>
            </Grid>
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
                  <TableCell align="right">Subtotal</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(order.lines ?? []).map((line) => (
                  <TableRow key={line.id}>
                    <TableCell>
                      <Typography variant="body2">
                        {line.product?.name || "N/A"}
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
                      {line.subtotal.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Box sx={{ minWidth: 200 }}>
              <Stack spacing={1}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography variant="h6">Total Amount:</Typography>
                  <Typography variant="h6">
                    {order.totalAmount.toFixed(2)}
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
