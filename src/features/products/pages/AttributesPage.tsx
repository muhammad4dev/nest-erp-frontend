import { Add, Delete, Edit, CheckCircle, Cancel } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
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
  useCreateProductAttribute,
  useUpdateProductAttribute,
  useDeleteProductAttribute,
} from "@/lib/api/mutations/useProducts";
import { useProductAttributes } from "@/lib/api/queries/useProducts";
import { useNotification } from "@/shared/hooks/useNotification";
import type {
  AttributeType,
  CreateProductAttributeDto,
  ProductAttribute,
  UpdateProductAttributeDto,
} from "@/types/api.types";

interface AttributeFormState {
  open: boolean;
  mode: "create" | "edit";
  data: Partial<ProductAttribute>;
  editingId?: string;
}

const ATTRIBUTE_TYPES: AttributeType[] = [
  "TEXT",
  "NUMBER",
  "BOOLEAN",
  "SELECT",
  "MULTI_SELECT",
  "DATE",
  "COLOR",
];

export function AttributesPage() {
  const { showNotification } = useNotification();

  // State
  const [formState, setFormState] = useState<AttributeFormState>({
    open: false,
    mode: "create",
    data: {},
  });
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    attributeId?: string;
    attributeName?: string;
  }>({ open: false });
  const [filterTab, setFilterTab] = useState(0);

  // API
  const { data: attributes = [], isLoading } = useProductAttributes();
  const createMutation = useCreateProductAttribute();
  const updateMutation = useUpdateProductAttribute();
  const deleteMutation = useDeleteProductAttribute();

  const handleCreateClick = () => {
    setFormState({
      open: true,
      mode: "create",
      data: {
        name: "",
        code: "",
        type: "TEXT",
        isRequired: false,
        isFilterable: false,
        isVariant: false,
        options: [],
      },
    });
  };

  const handleEditClick = (attribute: ProductAttribute) => {
    setFormState({
      open: true,
      mode: "edit",
      data: {
        id: attribute.id,
        name: attribute.name,
        code: attribute.code,
        type: attribute.type,
        isRequired: attribute.isRequired,
        isFilterable: attribute.isFilterable,
        isVariant: attribute.isVariant,
        options: attribute.options,
      },
      editingId: attribute.id,
    });
  };

  const handleDeleteClick = (attribute: ProductAttribute) => {
    setDeleteConfirm({
      open: true,
      attributeId: attribute.id,
      attributeName: attribute.name,
    });
  };

  const handleFormChange = (field: string, value: unknown) => {
    setFormState((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        [field]: value,
      },
    }));
  };

  const handleFormSubmit = async () => {
    try {
      if (!formState.data.name?.trim()) {
        showNotification("Attribute name is required", "error");
        return;
      }

      if (formState.mode === "create") {
        const createDto: CreateProductAttributeDto = {
          name: formState.data.name,
          code: formState.data.code || "",
          type: formState.data.type || "TEXT",
          isRequired: formState.data.isRequired ?? false,
          isFilterable: formState.data.isFilterable ?? false,
          isVariant: formState.data.isVariant ?? false,
          options: formState.data.options,
        };
        await createMutation.mutateAsync(createDto);
        showNotification("Attribute created successfully", "success");
      } else if (formState.mode === "edit" && formState.editingId) {
        const updateDto: UpdateProductAttributeDto = {
          name: formState.data.name,
          code: formState.data.code,
          type: formState.data.type,
          isRequired: formState.data.isRequired,
          isFilterable: formState.data.isFilterable,
          isVariant: formState.data.isVariant,
          options: formState.data.options,
        };
        await updateMutation.mutateAsync({
          id: formState.editingId,
          data: updateDto,
        });
        showNotification("Attribute updated successfully", "success");
      }

      setFormState({ open: false, mode: "create", data: {} });
    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : "Failed to save attribute",
        "error",
      );
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirm.attributeId) {
      try {
        await deleteMutation.mutateAsync(deleteConfirm.attributeId);
        showNotification("Attribute deleted successfully", "success");
      } catch (error) {
        showNotification(
          error instanceof Error ? error.message : "Failed to delete attribute",
          "error",
        );
      }
    }
    setDeleteConfirm({ open: false });
  };

  if (isLoading) {
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

  // if (error) {
  //   return (
  //     <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
  //       <Alert severity="error">
  //         Failed to load attributes:{" "}
  //         {error instanceof Error ? error.message : "Unknown error"}
  //       </Alert>
  //     </Container>
  //   );
  // }

  // Filter attributes based on tab
  const filteredAttributes =
    filterTab === 0
      ? attributes
      : filterTab === 1
        ? attributes.filter((a) => a.isVariant)
        : attributes.filter((a) => a.isFilterable);

  // Group by type
  const groupedByType = ATTRIBUTE_TYPES.reduce(
    (acc, type) => {
      acc[type] = filteredAttributes.filter((a) => a.type === type);
      return acc;
    },
    {} as Record<AttributeType, ProductAttribute[]>,
  );

  const renderAttributeCard = (attribute: ProductAttribute) => (
    <Card key={attribute.id} sx={{ mb: 2 }}>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "start",
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1">{attribute.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              Code: {attribute.code}
            </Typography>
            <Box sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
              {attribute.isVariant && (
                <Tooltip title="Used for variants">
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      bgcolor: "primary.light",
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                    }}
                  >
                    <CheckCircle fontSize="small" />
                    <Typography variant="caption">Variant</Typography>
                  </Box>
                </Tooltip>
              )}
              {attribute.isFilterable && (
                <Tooltip title="Can be used for filtering">
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      bgcolor: "info.light",
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                    }}
                  >
                    <CheckCircle fontSize="small" />
                    <Typography variant="caption">Filterable</Typography>
                  </Box>
                </Tooltip>
              )}
              {attribute.isRequired && (
                <Tooltip title="Required field">
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      bgcolor: "warning.light",
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                    }}
                  >
                    <Cancel fontSize="small" />
                    <Typography variant="caption">Required</Typography>
                  </Box>
                </Tooltip>
              )}
            </Box>
            {attribute.options && attribute.options.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Options: {attribute.options.join(", ")}
                </Typography>
              </Box>
            )}
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={() => handleEditClick(attribute)}
              >
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                size="small"
                onClick={() => handleDeleteClick(attribute)}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </CardContent>
    </Card>
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
        <Typography variant="h4">Product Attributes</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateClick}
        >
          Create Attribute
        </Button>
      </Box>

      <Card>
        <Tabs
          value={filterTab}
          onChange={(_, value) => setFilterTab(value)}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab label={`All (${attributes.length})`} />
          <Tab
            label={`Variants (${attributes.filter((a) => a.isVariant).length})`}
          />
          <Tab
            label={`Filterable (${attributes.filter((a) => a.isFilterable).length})`}
          />
        </Tabs>

        <CardContent sx={{ minHeight: "400px", pt: 3 }}>
          {filteredAttributes.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              No attributes found in this category. Create one to get started.
            </Alert>
          ) : (
            <Box>
              {ATTRIBUTE_TYPES.map((type) => {
                const typeAttributes = groupedByType[type];
                if (typeAttributes.length === 0) return null;

                return (
                  <Box key={type} sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                      {type}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    {typeAttributes.map((attr) => renderAttributeCard(attr))}
                  </Box>
                );
              })}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Attribute Form Dialog */}
      <Dialog
        open={formState.open}
        onClose={() => setFormState({ open: false, mode: "create", data: {} })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {formState.mode === "create" ? "Create Attribute" : "Edit Attribute"}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Attribute Name"
              value={formState.data.name || ""}
              onChange={(e) => handleFormChange("name", e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Code"
              value={formState.data.code || ""}
              onChange={(e) => handleFormChange("code", e.target.value)}
            />
            <Select
              fullWidth
              value={formState.data.type || "TEXT"}
              onChange={(e) => handleFormChange("type", e.target.value)}
            >
              {ATTRIBUTE_TYPES.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>

            {(formState.data.type === "SELECT" ||
              formState.data.type === "MULTI_SELECT") && (
              <TextField
                fullWidth
                label="Options (comma-separated)"
                value={(formState.data.options || []).join(", ")}
                onChange={(e) =>
                  handleFormChange(
                    "options",
                    e.target.value
                      .split(",")
                      .map((opt) => opt.trim())
                      .filter(Boolean),
                  )
                }
                multiline
                rows={2}
              />
            )}

            <Box sx={{ pt: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formState.data.isRequired ?? false}
                    onChange={(e) =>
                      handleFormChange("isRequired", e.target.checked)
                    }
                  />
                }
                label="Required"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formState.data.isFilterable ?? false}
                    onChange={(e) =>
                      handleFormChange("isFilterable", e.target.checked)
                    }
                  />
                }
                label="Filterable"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formState.data.isVariant ?? false}
                    onChange={(e) =>
                      handleFormChange("isVariant", e.target.checked)
                    }
                  />
                }
                label="Use for Variants"
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setFormState({ open: false, mode: "create", data: {} })
            }
          >
            Cancel
          </Button>
          <Button
            onClick={handleFormSubmit}
            variant="contained"
            disabled={
              createMutation.isPending ||
              updateMutation.isPending ||
              !formState.data.name
            }
          >
            {formState.mode === "create" ? "Create" : "Update"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false })}
      >
        <DialogTitle>Delete Attribute</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete &quot;{deleteConfirm.attributeName}
            &quot;?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm({ open: false })}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
