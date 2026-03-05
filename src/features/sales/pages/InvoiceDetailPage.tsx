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
  Divider,
} from "@mui/material";
import { useParams, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { useGetInvoice, usePostInvoice } from "@/lib/api/queries/useSales";
import { InvoiceStatusBadge } from "../components/InvoiceStatusBadge";

export function InvoiceDetailPage() {
  const { invoiceId } = useParams({ strict: false });
  const navigate = useNavigate();
  const { data: invoice, isLoading, error } = useGetInvoice(invoiceId || "");
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const postInvoiceMutation = usePostInvoice();

  const handlePostInvoice = async () => {
    if (!invoiceId) return;
    try {
      setActionInProgress("post");
      await postInvoiceMutation.mutateAsync(invoiceId);
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

  if (error || !invoice) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          {error ? (error as Error).message : "Invoice not found"}
        </Alert>
      </Container>
    );
  }

  const canPost = invoice.status === "SENT";

  // Calculate totals
  const subtotal = (invoice.lines || []).reduce(
    (sum, line) => sum + parseFloat(line.subtotal as any),
    0,
  );
  const totalDiscount = (invoice.lines || []).reduce(
    (sum, line) => sum + parseFloat(line.discountAmount as any),
    0,
  );
  const totalTax = (invoice.lines || []).reduce(
    (sum, line) => sum + parseFloat((line.taxAmount as any) || 0),
    0,
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">Invoice: {invoice.number}</Typography>
        <InvoiceStatusBadge status={invoice.status} />
      </Box>

      {/* Invoice Summary */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 2,
          }}
        >
          <div>
            <Typography variant="body2" color="textSecondary">
              Customer
            </Typography>
            <Typography variant="body1">
              {invoice.partner?.name || "N/A"}
            </Typography>
          </div>
          <div>
            <Typography variant="body2" color="textSecondary">
              Invoice Date
            </Typography>
            <Typography variant="body1">
              {new Date(
                invoice.invoiceDate || invoice.createdAt,
              ).toLocaleDateString()}
            </Typography>
          </div>
          {invoice.dueDate && (
            <div>
              <Typography variant="body2" color="textSecondary">
                Due Date
              </Typography>
              <Typography variant="body1">
                {new Date(invoice.dueDate).toLocaleDateString()}
              </Typography>
            </div>
          )}
          <div>
            <Typography variant="body2" color="textSecondary">
              Status
            </Typography>
            <Typography variant="body1">{invoice.status}</Typography>
          </div>
        </Box>
      </Paper>

      {/* Invoice Lines Table */}
      <Paper sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ p: 2 }}>
          Invoice Line Items
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell>Description</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell align="right">Unit Price</TableCell>
                <TableCell align="right">Discount</TableCell>
                <TableCell align="right">Subtotal</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoice.lines && invoice.lines.length > 0 ? (
                invoice.lines.map((line, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      {line.description || line.product?.name || "N/A"}
                    </TableCell>
                    <TableCell align="right">{line.quantity}</TableCell>
                    <TableCell align="right">
                      ${parseFloat(line.unitPrice as any).toFixed(2)}
                    </TableCell>
                    <TableCell align="right">
                      ${parseFloat(line.discountAmount as any).toFixed(2)}
                    </TableCell>
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

      {/* Totals */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box
          sx={{ display: "flex", justifyContent: "flex-end", minWidth: 300 }}
        >
          <Box sx={{ width: 300 }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography>Subtotal:</Typography>
              <Typography>${subtotal.toFixed(2)}</Typography>
            </Box>
            {totalDiscount > 0 && (
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography>Discount:</Typography>
                <Typography color="error">
                  ${totalDiscount.toFixed(2)}
                </Typography>
              </Box>
            )}
            {totalTax > 0 && (
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography>Tax:</Typography>
                <Typography>${totalTax.toFixed(2)}</Typography>
              </Box>
            )}
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="h6">Total:</Typography>
              <Typography variant="h6" color="primary">
                ${parseFloat(invoice.totalAmount as any).toFixed(2)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Actions */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        {canPost && (
          <Button
            variant="contained"
            color="primary"
            onClick={handlePostInvoice}
            disabled={actionInProgress !== null}
          >
            {actionInProgress === "post" ? (
              <CircularProgress size={24} />
            ) : (
              "Post to General Ledger"
            )}
          </Button>
        )}

        <Button
          variant="outlined"
          color="secondary"
          onClick={() => navigate({ to: "/sales/invoices" })}
        >
          Back to Invoices
        </Button>
      </Stack>

      {/* Error Messages */}
      {postInvoiceMutation.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {(postInvoiceMutation.error as Error).message}
        </Alert>
      )}
    </Container>
  );
}
