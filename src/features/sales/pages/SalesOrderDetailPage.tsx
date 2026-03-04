import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useParams, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import {
  useGetSalesOrder,
  useConfirmSalesOrder,
  useSendQuote,
  useCancelSalesOrder,
} from "@/lib/api/queries/useSales";
import { useCreateInvoiceFromOrder } from "@/lib/api/mutations/useSales";
import { SalesOrderStatusBadge } from "../components/SalesOrderStatusBadge";

export function SalesOrderDetailPage() {
  const { orderId } = useParams({ strict: false });
  const navigate = useNavigate();
  const { data: order, isLoading, error } = useGetSalesOrder(orderId || "");
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const confirmMutation = useConfirmSalesOrder();
  const sendMutation = useSendQuote();
  const cancelMutation = useCancelSalesOrder();
  const createInvoiceMutation = useCreateInvoiceFromOrder();

  const handleConfirm = async () => {
    if (!orderId) return;
    try {
      setActionInProgress("confirm");
      await confirmMutation.mutateAsync(orderId);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleSend = async () => {
    if (!orderId) return;
    try {
      setActionInProgress("send");
      await sendMutation.mutateAsync(orderId);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleCancel = async () => {
    if (!orderId) return;
    try {
      setActionInProgress("cancel");
      await cancelMutation.mutateAsync(orderId);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleCreateInvoice = async () => {
    if (!orderId) return;
    try {
      setActionInProgress("invoice");
      const invoice = await createInvoiceMutation.mutateAsync(orderId);
      // Navigate to new invoice detail page
      navigate({ to: `/sales/invoices/${invoice.id}` });
    } finally {
      setActionInProgress(null);
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !order) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          {error ? (error as Error).message : "Order not found"}
        </Alert>
      </Container>
    );
  }

  // Determine which actions are available based on status
  const canSend = order.status === "DRAFT";
  const canConfirm = order.status === "SENT";
  const canCancel = order.status !== "CANCELLED" && order.status !== "INVOICED";
  const canCreateInvoice = order.status === "CONFIRMED";

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4">Sales Order: {order.orderNumber}</Typography>
        <SalesOrderStatusBadge status={order.status} />
      </Box>

      {/* Order Summary */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Order Information
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
          <div>
            <Typography variant="body2" color="textSecondary">
              Customer
            </Typography>
            <Typography variant="body1">{order.partner?.name || "N/A"}</Typography>
          </div>
          <div>
            <Typography variant="body2" color="textSecondary">
              Order Date
            </Typography>
            <Typography variant="body1">
              {new Date(order.orderDate).toLocaleDateString()}
            </Typography>
          </div>
          <div>
            <Typography variant="body2" color="textSecondary">
              Total Amount
            </Typography>
            <Typography variant="h6" color="primary">
              ${parseFloat(order.totalAmount as any).toFixed(2)}
            </Typography>
          </div>
          <div>
            <Typography variant="body2" color="textSecondary">
              Status
            </Typography>
            <Typography variant="body1">{order.status}</Typography>
          </div>
        </Box>
      </Paper>

      {/* Order Lines Table */}
      <Paper sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ p: 2 }}>
          Order Line Items
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell>Product</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell align="right">Unit Price</TableCell>
                <TableCell align="right">Discount (%)</TableCell>
                <TableCell align="right">Subtotal</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {order.lines && order.lines.length > 0 ? (
                order.lines.map((line, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{line.product?.name || "N/A"}</TableCell>
                    <TableCell align="right">{line.quantity}</TableCell>
                    <TableCell align="right">
                      ${parseFloat(line.unitPrice as any).toFixed(2)}
                    </TableCell>
                    <TableCell align="right">{line.discountRate}%</TableCell>
                    <TableCell align="right">
                      ${parseFloat(line.subtotal as any).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No line items
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Actions */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        {canSend && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleSend}
            disabled={actionInProgress !== null}
          >
            {actionInProgress === "send" ? <CircularProgress size={24} /> : "Send Quote"}
          </Button>
        )}

        {canConfirm && (
          <Button
            variant="contained"
            color="success"
            onClick={handleConfirm}
            disabled={actionInProgress !== null}
          >
            {actionInProgress === "confirm" ? <CircularProgress size={24} /> : "Confirm Order"}
          </Button>
        )}

        {canCreateInvoice && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateInvoice}
            disabled={actionInProgress !== null}
          >
            {actionInProgress === "invoice" ? <CircularProgress size={24} /> : "Create Invoice"}
          </Button>
        )}

        {canCancel && (
          <Button
            variant="outlined"
            color="error"
            onClick={handleCancel}
            disabled={actionInProgress !== null}
          >
            {actionInProgress === "cancel" ? <CircularProgress size={24} /> : "Cancel Order"}
          </Button>
        )}

        <Button
          variant="outlined"
          color="secondary"
          onClick={() => navigate({ to: "/sales/orders" })}
        >
          Back to Orders
        </Button>
      </Stack>

      {/* Error Messages */}
      {(confirmMutation.error || sendMutation.error || cancelMutation.error || createInvoiceMutation.error) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {(confirmMutation.error || sendMutation.error || cancelMutation.error || createInvoiceMutation.error) as any}
        </Alert>
      )}
    </Container>
  );
}
