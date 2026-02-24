import {
  Add,
  CloudOff,
  CloudQueue,
  Delete,
  Remove,
  ShoppingCart,
  Sync,
} from "@mui/icons-material";
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { useState, useEffect } from "react";

import { usePartners } from "@/lib/api/queries/usePartners";
import { useProducts } from "@/lib/api/queries/useProducts";

import { usePOSStore } from "../posStore";

export function POSPage() {
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: partners = [] } = usePartners();

  const {
    cartLines,
    selectedCustomer,
    isOffline,
    syncInProgress,
    lastSyncTime,
    addToCart,
    updateCartLine,
    removeFromCart,
    setCustomer,
    checkout,
    syncPendingOrders,
    getLineTotal,
    getCartSubtotal,
    getCartDiscount,
    getCartTotal,
  } = usePOSStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const customers = partners.filter((p) => p.isCustomer);

  // Filter products by search query
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Auto-sync on mount if online
  useEffect(() => {
    if (!isOffline && !syncInProgress) {
      void syncPendingOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCheckout = async () => {
    if (!selectedCustomer) {
      setCustomerDialogOpen(true);
      return;
    }

    setCheckoutLoading(true);
    try {
      await checkout();
      alert("Order created successfully!");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to create order");
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Top Bar */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <ShoppingCart sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Point of Sale
          </Typography>

          {/* Connection Status */}
          <Chip
            icon={isOffline ? <CloudOff /> : <CloudQueue />}
            label={isOffline ? "Offline" : "Online"}
            color={isOffline ? "warning" : "success"}
            size="small"
            sx={{ mr: 2 }}
          />

          {/* Sync Button */}
          <IconButton
            onClick={() => void syncPendingOrders()}
            disabled={isOffline || syncInProgress}
            color="primary"
          >
            <Badge
              badgeContent={
                lastSyncTime
                  ? new Date(lastSyncTime).toLocaleTimeString()
                  : "Never"
              }
              color="info"
            >
              <Sync className={syncInProgress ? "rotate" : ""} />
            </Badge>
          </IconButton>

          {/* Customer Selection */}
          <Button
            variant="outlined"
            onClick={() => setCustomerDialogOpen(true)}
            startIcon={selectedCustomer ? undefined : <Add />}
          >
            {selectedCustomer ? selectedCustomer.name : "Select Customer"}
          </Button>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ display: "flex", flexGrow: 1, overflow: "hidden" }}>
        {/* Left: Product Grid */}
        <Box
          sx={{
            flex: 2,
            p: 2,
            overflowY: "auto",
            bgcolor: "background.default",
          }}
        >
          {/* Search Bar */}
          <TextField
            fullWidth
            placeholder="Search products by name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <ShoppingCart />
                </InputAdornment>
              ),
            }}
          />

          {/* Product Grid */}
          {productsLoading ? (
            <Typography>Loading products...</Typography>
          ) : (
            <Grid container spacing={2}>
              {filteredProducts.map((product) => (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={product.id}>
                  <Card
                    sx={{
                      cursor: "pointer",
                      transition: "transform 0.2s",
                      "&:hover": {
                        transform: "scale(1.05)",
                      },
                    }}
                    onClick={() => addToCart(product)}
                  >
                    <CardContent>
                      <Stack spacing={1}>
                        <Typography variant="h6" noWrap>
                          {product.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {product.sku}
                        </Typography>
                        <Typography variant="h5" color="primary">
                          ${product.salesPrice.toFixed(2)}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        {/* Right: Cart Panel */}
        <Box
          sx={{
            flex: 1,
            borderLeft: 1,
            borderColor: "divider",
            display: "flex",
            flexDirection: "column",
            bgcolor: "background.paper",
          }}
        >
          {/* Cart Header */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
            <Typography variant="h6">
              Cart ({cartLines.length} items)
            </Typography>
          </Box>

          {/* Cart Items */}
          <Box sx={{ flexGrow: 1, overflowY: "auto", p: 2 }}>
            {cartLines.length === 0 ? (
              <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>
                Cart is empty
              </Typography>
            ) : (
              <List>
                {cartLines.map((line) => (
                  <ListItem
                    key={line.productId}
                    sx={{
                      mb: 2,
                      p: 2,
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 1,
                    }}
                  >
                    <Stack spacing={1} sx={{ width: "100%" }}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography variant="subtitle1">
                          {line.product.name}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => removeFromCart(line.productId)}
                          color="error"
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Stack>

                      <Typography variant="caption" color="text.secondary">
                        ${line.unitPrice.toFixed(2)} each
                      </Typography>

                      {/* Quantity Controls */}
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <IconButton
                          size="small"
                          onClick={() =>
                            updateCartLine(line.productId, {
                              quantity: Math.max(1, line.quantity - 1),
                            })
                          }
                        >
                          <Remove fontSize="small" />
                        </IconButton>
                        <Typography sx={{ minWidth: 30, textAlign: "center" }}>
                          {line.quantity}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() =>
                            updateCartLine(line.productId, {
                              quantity: line.quantity + 1,
                            })
                          }
                        >
                          <Add fontSize="small" />
                        </IconButton>
                      </Stack>

                      {/* Discount */}
                      <TextField
                        label="Discount %"
                        type="number"
                        size="small"
                        value={line.discountRate}
                        onChange={(e) =>
                          updateCartLine(line.productId, {
                            discountRate: parseFloat(e.target.value) || 0,
                          })
                        }
                        inputProps={{ min: 0, max: 100, step: 1 }}
                      />

                      <Divider />

                      <Typography variant="h6" align="right">
                        ${getLineTotal(line).toFixed(2)}
                      </Typography>
                    </Stack>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>

          {/* Cart Totals & Checkout */}
          <Box
            sx={{
              p: 2,
              borderTop: 1,
              borderColor: "divider",
              bgcolor: "background.default",
            }}
          >
            <Stack spacing={1} sx={{ mb: 2 }}>
              <Stack direction="row" justifyContent="space-between">
                <Typography>Subtotal:</Typography>
                <Typography>${getCartSubtotal().toFixed(2)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography>Discount:</Typography>
                <Typography color="error">
                  -${getCartDiscount().toFixed(2)}
                </Typography>
              </Stack>
              <Divider />
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h6">
                  ${getCartTotal().toFixed(2)}
                </Typography>
              </Stack>
            </Stack>

            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={() => void handleCheckout()}
              disabled={
                cartLines.length === 0 || !selectedCustomer || checkoutLoading
              }
            >
              {checkoutLoading ? "Processing..." : "Checkout"}
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Customer Selection Dialog */}
      <Dialog
        open={customerDialogOpen}
        onClose={() => setCustomerDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Select Customer</DialogTitle>
        <DialogContent>
          <List>
            {customers.map((customer) => (
              <ListItem
                key={customer.id}
                component="button"
                onClick={() => {
                  setCustomer(customer);
                  setCustomerDialogOpen(false);
                }}
                sx={{
                  border: 1,
                  borderColor:
                    selectedCustomer?.id === customer.id
                      ? "primary.main"
                      : "divider",
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                <Avatar sx={{ mr: 2 }}>{customer.name.charAt(0)}</Avatar>
                <Stack>
                  <Typography variant="subtitle1">{customer.name}</Typography>
                  {customer.email && (
                    <Typography variant="caption" color="text.secondary">
                      {customer.email}
                    </Typography>
                  )}
                </Stack>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCustomerDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      <style>{`
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .rotate {
          animation: rotate 1s linear infinite;
        }
      `}</style>
    </Box>
  );
}
