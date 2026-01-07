import { Add, Edit, SwapHoriz, TrendingDown, Store } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";

import {
  useCreateStockLocation,
  useUpdateStockLocation,
  useStockTransfer,
  useStockAdjustment,
} from "@/lib/api/mutations/useProducts";
import {
  useStockLocations,
  useStockByLocation,
  useStockLedger,
} from "@/lib/api/queries/useProducts";
import { useNotification } from "@/shared/hooks/useNotification";
import type {
  StockLocation,
  StockTransferDto,
  StockAdjustmentDto,
} from "@/types/api.types";

interface LocationFormState {
  open: boolean;
  mode: "create" | "edit";
  data: Partial<StockLocation>;
  editingId?: string;
}

interface TransferFormState {
  open: boolean;
  fromLocationId?: string;
  toLocationId?: string;
  productId?: string;
  quantity?: number;
  reference?: string;
}

interface AdjustmentFormState {
  open: boolean;
  locationId?: string;
  productId?: string;
  quantity?: number;
  reason?: string;
  reference?: string;
}

function TabPanel(props: {
  children?: React.ReactNode;
  index: number;
  value: number;
}) {
  const { children, value, index } = props;
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

export function StockPage() {
  const { showNotification } = useNotification();

  // State
  const [activeTab, setActiveTab] = useState(0);
  const [locationForm, setLocationForm] = useState<LocationFormState>({
    open: false,
    mode: "create",
    data: {},
  });
  const [transferForm, setTransferForm] = useState<TransferFormState>({
    open: false,
  });
  const [adjustmentForm, setAdjustmentForm] = useState<AdjustmentFormState>({
    open: false,
  });
  const [selectedLocationId, setSelectedLocationId] = useState<string>();

  // API
  const { data: locations = [], isLoading: locationsLoading } =
    useStockLocations();
  const { data: stockByLocation = [] } = useStockByLocation(
    selectedLocationId || ""
  );
  const { data: stockLedger = [] } = useStockLedger({});

  // Mutations
  const createLocationMutation = useCreateStockLocation();
  const updateLocationMutation = useUpdateStockLocation();
  const transferMutation = useStockTransfer();
  const adjustmentMutation = useStockAdjustment();

  const handleCreateLocation = () => {
    setLocationForm({
      open: true,
      mode: "create",
      data: {
        name: "",
        code: "",
        locationType: "WAREHOUSE",
      },
    });
  };

  const handleEditLocation = (location: StockLocation) => {
    setLocationForm({
      open: true,
      mode: "edit",
      data: location,
      editingId: location.id,
    });
  };

  const handleLocationFormSubmit = async () => {
    try {
      if (!locationForm.data.name?.trim()) {
        showNotification("Location name is required", "error");
        return;
      }

      if (locationForm.mode === "create") {
        await createLocationMutation.mutateAsync({
          name: locationForm.data.name,
          code: locationForm.data.code || "",
          locationType: locationForm.data.locationType || "WAREHOUSE",
          parentId: locationForm.data.parentId,
        });
        showNotification("Location created successfully", "success");
      } else if (locationForm.mode === "edit" && locationForm.editingId) {
        await updateLocationMutation.mutateAsync({
          id: locationForm.editingId,
          data: {
            name: locationForm.data.name,
            code: locationForm.data.code,
            locationType: locationForm.data.locationType,
            parentId: locationForm.data.parentId,
          },
        });
        showNotification("Location updated successfully", "success");
      }

      setLocationForm({ open: false, mode: "create", data: {} });
    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : "Failed to save location",
        "error"
      );
    }
  };

  const handleTransferStock = async () => {
    try {
      if (
        !transferForm.fromLocationId ||
        !transferForm.toLocationId ||
        !transferForm.productId ||
        !transferForm.quantity
      ) {
        showNotification("All fields are required", "error");
        return;
      }

      const transferDto: StockTransferDto = {
        fromLocationId: transferForm.fromLocationId,
        toLocationId: transferForm.toLocationId,
        productId: transferForm.productId,
        variantId: undefined,
        quantity: transferForm.quantity,
        reference: transferForm.reference,
      };

      await transferMutation.mutateAsync(transferDto);
      showNotification("Stock transferred successfully", "success");
      setTransferForm({ open: false });
    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : "Failed to transfer stock",
        "error"
      );
    }
  };

  const handleAdjustStock = async () => {
    try {
      if (
        !adjustmentForm.locationId ||
        !adjustmentForm.productId ||
        adjustmentForm.quantity === undefined ||
        !adjustmentForm.reason
      ) {
        showNotification("All fields are required", "error");
        return;
      }

      const adjustmentDto: StockAdjustmentDto = {
        locationId: adjustmentForm.locationId,
        productId: adjustmentForm.productId,
        variantId: undefined,
        quantity: adjustmentForm.quantity,
        reason: adjustmentForm.reason,
        reference: adjustmentForm.reference,
      };

      await adjustmentMutation.mutateAsync(adjustmentDto);
      showNotification("Stock adjusted successfully", "success");
      setAdjustmentForm({ open: false });
    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : "Failed to adjust stock",
        "error"
      );
    }
  };

  if (locationsLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  const renderLocationNode = (location: StockLocation, level = 0) => {
    return (
      <Box
        key={location.id}
        onClick={() => setSelectedLocationId(location.id)}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 1.5,
          pl: 2 + level * 2,
          borderBottom: 1,
          borderColor: "divider",
          cursor: "pointer",
          bgcolor:
            selectedLocationId === location.id ? "action.selected" : "inherit",
          "&:hover": { bgcolor: "action.hover" },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}>
          <Store fontSize="small" />
          <Typography variant="body2">
            {location.name}{" "}
            <Typography
              component="span"
              variant="caption"
              sx={{ color: "text.secondary" }}
            >
              ({location.code})
            </Typography>
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleEditLocation(location);
              }}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Stock Adjustment">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setAdjustmentForm({
                  open: true,
                  locationId: location.id,
                });
              }}
            >
              <TrendingDown fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    );
  };

  const renderLocationTree = (
    locs: StockLocation[],
    level = 0
  ): React.ReactNode[] => {
    return locs.flatMap((loc) => [
      renderLocationNode(loc, level),
      ...(loc.children ? renderLocationTree(loc.children, level + 1) : []),
    ]);
  };

  const rootLocations = locations.filter((loc) => !loc.parentId) || [];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Stock & Locations Management
      </Typography>

      <Tabs
        value={activeTab}
        onChange={(_, value) => setActiveTab(value)}
        sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
      >
        <Tab label="Locations" />
        <Tab label="Stock by Location" />
        <Tab label="Stock Ledger" />
      </Tabs>

      {/* Tab 0: Locations */}
      <TabPanel index={0} value={activeTab}>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateLocation}
          >
            Create Location
          </Button>
        </Box>

        {rootLocations.length === 0 ? (
          <Alert severity="info">
            No locations exist. Click &quot;Create Location&quot; to add the
            first one.
          </Alert>
        ) : (
          <Card>
            <CardContent sx={{ p: 0, maxHeight: 600, overflow: "auto" }}>
              {renderLocationTree(rootLocations)}
            </CardContent>
          </Card>
        )}
      </TabPanel>

      {/* Tab 1: Stock by Location */}
      <TabPanel index={1} value={activeTab}>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <Box>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Select Location
                </Typography>
                {rootLocations.length === 0 ? (
                  <Alert severity="info">No locations available</Alert>
                ) : (
                  <Box sx={{ p: 0 }}>{renderLocationTree(rootLocations)}</Box>
                )}
              </CardContent>
            </Card>
          </Box>

          <Box>
            {selectedLocationId && (
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    Stock Details
                  </Typography>
                  {stockByLocation.length === 0 ? (
                    <Alert severity="info">No stock in this location</Alert>
                  ) : (
                    <Stack
                      spacing={1}
                      sx={{ maxHeight: 400, overflow: "auto" }}
                    >
                      {stockByLocation.map((stock) => (
                        <Box
                          key={stock.id}
                          sx={{
                            p: 1.5,
                            border: 1,
                            borderColor: "divider",
                            borderRadius: 1,
                          }}
                        >
                          <Typography variant="body2" fontWeight="bold">
                            {stock.productId}
                          </Typography>
                          <Typography variant="caption">
                            Available: {stock.availableQuantity}
                          </Typography>
                          <Typography variant="caption" display="block">
                            Reserved: {stock.reservedQuantity}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  )}
                  <Button
                    fullWidth
                    startIcon={<SwapHoriz />}
                    onClick={() =>
                      setTransferForm({
                        open: true,
                        fromLocationId: selectedLocationId,
                      })
                    }
                    sx={{ mt: 2 }}
                  >
                    Transfer Stock
                  </Button>
                </CardContent>
              </Card>
            )}
          </Box>
        </Box>
      </TabPanel>

      {/* Tab 2: Stock Ledger */}
      <TabPanel index={2} value={activeTab}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Stock Movement History
            </Typography>
            {stockLedger.length === 0 ? (
              <Alert severity="info">No stock movements recorded</Alert>
            ) : (
              <Box sx={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #ddd" }}>
                      <th style={{ textAlign: "left", padding: 8 }}>Date</th>
                      <th style={{ textAlign: "left", padding: 8 }}>Product</th>
                      <th style={{ textAlign: "left", padding: 8 }}>
                        Location
                      </th>
                      <th style={{ textAlign: "right", padding: 8 }}>
                        Quantity
                      </th>
                      <th style={{ textAlign: "left", padding: 8 }}>
                        Movement Type
                      </th>
                      <th style={{ textAlign: "left", padding: 8 }}>
                        Reference
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockLedger.map((entry) => (
                      <tr
                        key={entry.id}
                        style={{ borderBottom: "1px solid #eee" }}
                      >
                        <td style={{ padding: 8 }}>
                          {new Date(entry.createdAt || "").toLocaleDateString()}
                        </td>
                        <td style={{ padding: 8 }}>{entry.productId}</td>
                        <td style={{ padding: 8 }}>{entry.locationId}</td>
                        <td style={{ textAlign: "right", padding: 8 }}>
                          {entry.quantity}
                        </td>
                        <td style={{ padding: 8 }}>
                          {entry.movementType || "-"}
                        </td>
                        <td style={{ padding: 8 }}>{entry.reference || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* Location Form Dialog */}
      <Dialog
        open={locationForm.open}
        onClose={() =>
          setLocationForm({ open: false, mode: "create", data: {} })
        }
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {locationForm.mode === "create" ? "Create Location" : "Edit Location"}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Location Name"
              value={locationForm.data.name || ""}
              onChange={(e) =>
                setLocationForm((prev) => ({
                  ...prev,
                  data: { ...prev.data, name: e.target.value },
                }))
              }
              required
            />
            <TextField
              fullWidth
              label="Code"
              value={locationForm.data.code || ""}
              onChange={(e) =>
                setLocationForm((prev) => ({
                  ...prev,
                  data: { ...prev.data, code: e.target.value },
                }))
              }
            />
            <Select
              fullWidth
              value={locationForm.data.locationType || "WAREHOUSE"}
              onChange={(e) =>
                setLocationForm((prev) => ({
                  ...prev,
                  data: { ...prev.data, locationType: e.target.value },
                }))
              }
            >
              <MenuItem value="WAREHOUSE">Warehouse</MenuItem>
              <MenuItem value="STORE">Store</MenuItem>
              <MenuItem value="OTHER">Other</MenuItem>
            </Select>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setLocationForm({ open: false, mode: "create", data: {} })
            }
          >
            Cancel
          </Button>
          <Button
            onClick={handleLocationFormSubmit}
            variant="contained"
            disabled={
              createLocationMutation.isPending ||
              updateLocationMutation.isPending ||
              !locationForm.data.name
            }
          >
            {locationForm.mode === "create" ? "Create" : "Update"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Transfer Stock Dialog */}
      <Dialog
        open={transferForm.open}
        onClose={() => setTransferForm({ open: false })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Transfer Stock</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <Select
              fullWidth
              value={transferForm.fromLocationId || ""}
              onChange={(e) =>
                setTransferForm((prev) => ({
                  ...prev,
                  fromLocationId: e.target.value,
                }))
              }
              displayEmpty
            >
              <MenuItem value="">From Location</MenuItem>
              {locations.map((loc) => (
                <MenuItem key={loc.id} value={loc.id}>
                  {loc.name}
                </MenuItem>
              ))}
            </Select>
            <Select
              fullWidth
              value={transferForm.toLocationId || ""}
              onChange={(e) =>
                setTransferForm((prev) => ({
                  ...prev,
                  toLocationId: e.target.value,
                }))
              }
              displayEmpty
            >
              <MenuItem value="">To Location</MenuItem>
              {locations.map((loc) => (
                <MenuItem key={loc.id} value={loc.id}>
                  {loc.name}
                </MenuItem>
              ))}
            </Select>
            <TextField
              fullWidth
              label="Product ID"
              value={transferForm.productId || ""}
              onChange={(e) =>
                setTransferForm((prev) => ({
                  ...prev,
                  productId: e.target.value,
                }))
              }
            />
            <TextField
              fullWidth
              label="Quantity"
              type="number"
              value={transferForm.quantity || ""}
              onChange={(e) =>
                setTransferForm((prev) => ({
                  ...prev,
                  quantity: e.target.value
                    ? parseFloat(e.target.value)
                    : undefined,
                }))
              }
            />
            <TextField
              fullWidth
              label="Reference"
              value={transferForm.reference || ""}
              onChange={(e) =>
                setTransferForm((prev) => ({
                  ...prev,
                  reference: e.target.value,
                }))
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTransferForm({ open: false })}>
            Cancel
          </Button>
          <Button
            onClick={handleTransferStock}
            variant="contained"
            disabled={transferMutation.isPending}
          >
            Transfer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Adjust Stock Dialog */}
      <Dialog
        open={adjustmentForm.open}
        onClose={() => setAdjustmentForm({ open: false })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Adjust Stock</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Location"
              value={adjustmentForm.locationId || ""}
              disabled
            />
            <TextField
              fullWidth
              label="Product ID"
              value={adjustmentForm.productId || ""}
              onChange={(e) =>
                setAdjustmentForm((prev) => ({
                  ...prev,
                  productId: e.target.value,
                }))
              }
            />
            <TextField
              fullWidth
              label="Quantity (+ or -)"
              type="number"
              value={adjustmentForm.quantity || ""}
              onChange={(e) =>
                setAdjustmentForm((prev) => ({
                  ...prev,
                  quantity: e.target.value
                    ? parseFloat(e.target.value)
                    : undefined,
                }))
              }
            />
            <Select
              fullWidth
              value={adjustmentForm.reason || ""}
              onChange={(e) =>
                setAdjustmentForm((prev) => ({
                  ...prev,
                  reason: e.target.value,
                }))
              }
              displayEmpty
            >
              <MenuItem value="">Select Reason</MenuItem>
              <MenuItem value="INVENTORY_COUNT">Inventory Count</MenuItem>
              <MenuItem value="DAMAGE">Damage</MenuItem>
              <MenuItem value="EXPIRATION">Expiration</MenuItem>
              <MenuItem value="SHRINKAGE">Shrinkage</MenuItem>
              <MenuItem value="OTHER">Other</MenuItem>
            </Select>
            <TextField
              fullWidth
              label="Reference"
              value={adjustmentForm.reference || ""}
              onChange={(e) =>
                setAdjustmentForm((prev) => ({
                  ...prev,
                  reference: e.target.value,
                }))
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAdjustmentForm({ open: false })}>
            Cancel
          </Button>
          <Button
            onClick={handleAdjustStock}
            variant="contained"
            disabled={adjustmentMutation.isPending}
          >
            Adjust
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
