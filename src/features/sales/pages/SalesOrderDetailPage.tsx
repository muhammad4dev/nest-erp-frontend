import { Container, Paper, Typography } from "@mui/material";
import { useParams } from "@tanstack/react-router";

import { useGetSalesOrder } from "@/lib/api/queries/useSales";

export function SalesOrderDetailPage() {
  const { orderId } = useParams({ strict: false });
  const { data: order, isLoading } = useGetSalesOrder(orderId || "");

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Order not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Sales Order: {order.orderNumber}
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Order Details
        </Typography>
        <Typography>Customer: {order.partner?.name}</Typography>
        <Typography>Date: {order.orderDate}</Typography>
        <Typography>Status: {order.status}</Typography>
        <Typography>Total: ${order.totalAmount.toFixed(2)}</Typography>

        {/* TODO: Add order lines table, action buttons, etc */}
      </Paper>
    </Container>
  );
}
