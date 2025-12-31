import { ArrowBack, CheckCircle, Edit, Refresh } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { useParams } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useCompleteStockIssue } from "@/lib/api/mutations/useStockReceipts";
import { useStockIssue } from "@/lib/api/queries/useStockReceipts";
import { useAppNavigate } from "@/shared/hooks/useAppNavigate";

import { StockIssueFormDialog } from "../components/StockIssueFormDialog";

export function StockIssueDetailPage() {
  const { t } = useTranslation();
  const navigate = useAppNavigate();
  const { issueId } = useParams({
    from: "/$lang/app/inventory/issues/$issueId",
  });
  const { data: issue, isLoading, refetch } = useStockIssue(issueId);
  const completeIssue = useCompleteStockIssue();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="rectangular" height={400} />
      </Container>
    );
  }

  if (!issue) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography color="error">Not found</Typography>
      </Container>
    );
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, "default" | "success" | "error"> = {
      DRAFT: "default",
      COMPLETED: "success",
      CANCELLED: "error",
    };
    return colors[status] || "default";
  };

  const handleComplete = async () => {
    if (window.confirm("Complete this issue?")) {
      await completeIssue.mutateAsync(issue.id);
      refetch();
    }
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    refetch();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header with navigation */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Stack direction="row" alignItems="center" gap={2}>
          <Tooltip title={t("common.goBack")}>
            <IconButton
              onClick={() =>
                navigate({
                  to: "/$lang/app/inventory/issues",
                })
              }
            >
              <ArrowBack />
            </IconButton>
          </Tooltip>
          <Typography variant="h4">Issue - {issue.issueNumber}</Typography>
        </Stack>
        <Stack direction="row" gap={1}>
          {issue.status === "DRAFT" && (
            <>
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={() => setEditDialogOpen(true)}
              >
                Edit
              </Button>
              <Button
                variant="contained"
                startIcon={<CheckCircle />}
                onClick={handleComplete}
                disabled={completeIssue.isPending}
              >
                {completeIssue.isPending ? "..." : "Complete"}
              </Button>
            </>
          )}
          <Tooltip title={t("common.refresh")}>
            <IconButton onClick={() => refetch()}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {/* Status and metadata */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
            md: "1fr 1fr 1fr 1fr",
          },
          gap: 2,
          mb: 3,
        }}
      >
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Status
            </Typography>
            <Chip
              label={issue.status}
              color={getStatusColor(issue.status)}
              variant="outlined"
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Location
            </Typography>
            <Typography variant="h6">{issue.location?.name}</Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Issue Date
            </Typography>
            <Typography variant="h6">
              {new Date(issue.issueDate).toLocaleDateString()}
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Quantity
            </Typography>
            <Typography variant="h6">{issue.totalQuantity}</Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Issue details */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 3,
          mb: 3,
        }}
      >
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Details
            </Typography>
            <Stack spacing={1.5}>
              <Box>
                <Typography color="textSecondary" variant="caption">
                  Issue Type
                </Typography>
                <Typography>{issue.issueType}</Typography>
              </Box>
              <Box>
                <Typography color="textSecondary" variant="caption">
                  Source Reference
                </Typography>
                <Typography>{issue.sourceReference || "-"}</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Summary
            </Typography>
            <Stack spacing={1.5}>
              <Box>
                <Typography color="textSecondary" variant="caption">
                  Total Quantity
                </Typography>
                <Typography>{issue.totalQuantity} units</Typography>
              </Box>
              <Box>
                <Typography color="textSecondary" variant="caption">
                  Total Value
                </Typography>
                <Typography>
                  $
                  {issue.totalValue
                    ? (typeof issue.totalValue === "number"
                        ? issue.totalValue
                        : parseFloat(String(issue.totalValue))
                      ).toFixed(2)
                    : "0.00"}
                </Typography>
              </Box>
              {issue.completedAt && (
                <Box>
                  <Typography color="textSecondary" variant="caption">
                    Completed At
                  </Typography>
                  <Typography>
                    {new Date(issue.completedAt).toLocaleString()}
                  </Typography>
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Box>

      {/* Lines */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Items
          </Typography>
          {issue.lines && issue.lines.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableCell>Product</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Unit Cost</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {issue.lines.map((line, idx) => {
                    const unitCostNum =
                      typeof line.unitCost === "number"
                        ? line.unitCost
                        : parseFloat(String(line.unitCost));
                    const lineTotalNum =
                      typeof line.lineTotal === "number"
                        ? line.lineTotal
                        : parseFloat(String(line.lineTotal));

                    return (
                      <TableRow key={idx}>
                        <TableCell>
                          {line.product?.name || line.productId}
                        </TableCell>
                        <TableCell align="right">{line.quantity}</TableCell>
                        <TableCell align="right">
                          ${unitCostNum.toFixed(2)}
                        </TableCell>
                        <TableCell align="right">
                          ${lineTotalNum.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography color="textSecondary">No items</Typography>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      {issue.notes && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Notes
            </Typography>
            <Typography>{issue.notes}</Typography>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <StockIssueFormDialog
        open={editDialogOpen}
        onClose={handleEditClose}
        mode="edit"
        issue={issue}
      />
    </Container>
  );
}
