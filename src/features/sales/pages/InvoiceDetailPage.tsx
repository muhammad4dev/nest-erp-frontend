import { Container, Paper, Typography } from "@mui/material";
import { useParams } from "@tanstack/react-router";

import { useGetInvoice } from "@/lib/api/queries/useSales";

export function InvoiceDetailPage() {
  const { invoiceId } = useParams({ strict: false });
  const { data: invoice, isLoading } = useGetInvoice(invoiceId || "");

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (!invoice) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Invoice not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Invoice: {invoice.number}
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Invoice Details
        </Typography>
        <Typography>Customer: {invoice.partner?.name}</Typography>
        <Typography>Status: {invoice.status}</Typography>
        <Typography>Total: ${invoice.totalAmount.toFixed(2)}</Typography>

        {/* TODO: Add invoice lines table, payment info, etc */}
      </Paper>
    </Container>
  );
}
