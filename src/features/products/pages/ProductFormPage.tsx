import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Container,
  FormControlLabel,
  MenuItem,
  Select,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from "@mui/material";
import { useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import {
  useCreateProduct,
  useUpdateProduct,
} from "@/lib/api/mutations/useProducts";
import {
  useProductCategories,
  useProduct,
  useProductAttributes,
} from "@/lib/api/queries/useProducts";
import { useAppNavigate } from "@/shared/hooks/useAppNavigate";
import { useNotification } from "@/shared/hooks/useNotification";
import type {
  CreateProductDto,
  ProductType,
  UpdateProductDto,
} from "@/types/api.types";

export function ProductFormPage() {
  const location = useLocation();
  // Extract productId from the pathname
  const pathParts = location.pathname.split("/");
  const productId = pathParts.includes("new")
    ? undefined
    : pathParts[pathParts.length - 1];

  const navigate = useAppNavigate();
  const { showNotification } = useNotification();

  const isEditMode = Boolean(productId && productId !== "new");

  // State management
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<
    CreateProductDto & {
      id?: string;
      isActive?: boolean;
      hasVariants?: boolean;
    }
  >({
    sku: "",
    name: "",
    description: "",
    productType: "GOODS" as ProductType,
    categoryId: undefined,
    salesPrice: 0,
    costPrice: 0,
    barcode: undefined,
    weight: undefined,
    canBeSold: true,
    canBePurchased: true,
    trackInventory: true,
    imageUrl: undefined,
    metadata: {},
  });

  const [attributeValues, setAttributeValues] = useState<
    Record<string, string | number | boolean>
  >({});

  // API queries
  const { data: product, isLoading: productLoading } = useProduct(
    isEditMode && productId ? productId : undefined
  );
  const { data: categories = [] } = useProductCategories();
  const { data: attributes = [] } = useProductAttributes();

  // API mutations
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();

  // Load existing product data when in edit mode
  useEffect(() => {
    if (isEditMode && product) {
      setFormData({
        id: product.id,
        sku: product.sku,
        name: product.name,
        description: product.description || "",
        productType: product.productType,
        categoryId: product.categoryId,
        salesPrice: product.salesPrice,
        costPrice: product.costPrice,
        barcode: product.barcode,
        weight: product.weight,
        canBeSold: product.canBeSold ?? true,
        canBePurchased: product.canBePurchased ?? true,
        trackInventory: product.trackInventory ?? true,
        isActive: product.isActive ?? true,
        hasVariants: product.hasVariants ?? false,
        imageUrl: product.imageUrl,
        metadata: product.metadata,
      });
    }
  }, [product, isEditMode]);

  const handleFormChange = (field: keyof typeof formData, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAttributeChange = (
    attributeId: string,
    value: string | number | boolean
  ) => {
    setAttributeValues((prev) => ({
      ...prev,
      [attributeId]: value,
    }));
  };

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    try {
      if (isEditMode && formData.id) {
        const updateDto: UpdateProductDto = {
          name: formData.name,
          description: formData.description,
          productType: formData.productType,
          categoryId: formData.categoryId,
          salesPrice: formData.salesPrice,
          costPrice: formData.costPrice,
          barcode: formData.barcode,
          weight: formData.weight,
          canBeSold: formData.canBeSold,
          canBePurchased: formData.canBePurchased,
          trackInventory: formData.trackInventory,
          isActive: formData.isActive,
          imageUrl: formData.imageUrl,
          metadata: formData.metadata,
        };
        await updateProductMutation.mutateAsync({
          id: formData.id,
          data: updateDto,
        });
        showNotification("Product updated successfully", "success");
      } else {
        const createDto: CreateProductDto = {
          sku: formData.sku,
          name: formData.name,
          description: formData.description,
          productType: formData.productType,
          categoryId: formData.categoryId,
          salesPrice: formData.salesPrice,
          costPrice: formData.costPrice,
          barcode: formData.barcode,
          weight: formData.weight,
          canBeSold: formData.canBeSold,
          canBePurchased: formData.canBePurchased,
          trackInventory: formData.trackInventory,
          imageUrl: formData.imageUrl,
          metadata: formData.metadata,
        };
        const newProduct = await createProductMutation.mutateAsync(createDto);
        showNotification("Product created successfully", "success");
        setTimeout(() => {
          navigate({
            to: "/$lang/app/products/$productId",
            params: { productId: newProduct.id },
          } as const);
        }, 500);
      }
    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : "Failed to save product",
        "error"
      );
    }
  };

  if (productLoading) {
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

  const steps = ["Basic Info", "Attributes", "Variants", "Translations"];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        {isEditMode ? `Edit Product: ${formData.name}` : "Create New Product"}
      </Typography>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Step 0: Basic Info */}
          {activeStep === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
              <Stack spacing={3}>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 2,
                  }}
                >
                  <Box>
                    <TextField
                      fullWidth
                      label="SKU"
                      value={formData.sku}
                      onChange={(e) => handleFormChange("sku", e.target.value)}
                      disabled={isEditMode}
                      required
                    />
                  </Box>
                  <Box>
                    <TextField
                      fullWidth
                      label="Product Name"
                      value={formData.name}
                      onChange={(e) => handleFormChange("name", e.target.value)}
                      required
                    />
                  </Box>
                </Box>
                <Box sx={{ gridColumn: "1 / -1" }}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={formData.description}
                    onChange={(e) =>
                      handleFormChange("description", e.target.value)
                    }
                    multiline
                    rows={3}
                  />
                </Box>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 2,
                  }}
                >
                  <Box>
                    <Select
                      fullWidth
                      value={formData.productType}
                      onChange={(e) =>
                        handleFormChange("productType", e.target.value)
                      }
                      required
                    >
                      <MenuItem value="GOODS">Goods</MenuItem>
                      <MenuItem value="SERVICE">Service</MenuItem>
                      <MenuItem value="CONSUMABLE">Consumable</MenuItem>
                      <MenuItem value="DIGITAL">Digital</MenuItem>
                    </Select>
                  </Box>
                  <Box>
                    <Select
                      fullWidth
                      value={formData.categoryId || ""}
                      onChange={(e) =>
                        handleFormChange(
                          "categoryId",
                          e.target.value || undefined
                        )
                      }
                    >
                      <MenuItem value="">Select Category</MenuItem>
                      {categories.map((cat) => (
                        <MenuItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </Box>
                  <Box>
                    <TextField
                      fullWidth
                      label="Sales Price"
                      type="number"
                      value={formData.salesPrice}
                      onChange={(e) =>
                        handleFormChange(
                          "salesPrice",
                          parseFloat(e.target.value)
                        )
                      }
                      inputProps={{ step: "0.01" }}
                    />
                  </Box>
                  <Box>
                    <TextField
                      fullWidth
                      label="Cost Price"
                      type="number"
                      value={formData.costPrice}
                      onChange={(e) =>
                        handleFormChange(
                          "costPrice",
                          parseFloat(e.target.value)
                        )
                      }
                      inputProps={{ step: "0.01" }}
                    />
                  </Box>
                  <Box>
                    <TextField
                      fullWidth
                      label="Barcode"
                      value={formData.barcode || ""}
                      onChange={(e) =>
                        handleFormChange("barcode", e.target.value || undefined)
                      }
                    />
                  </Box>
                  <Box>
                    <TextField
                      fullWidth
                      label="Weight"
                      type="number"
                      value={formData.weight || ""}
                      onChange={(e) =>
                        handleFormChange(
                          "weight",
                          e.target.value
                            ? parseFloat(e.target.value)
                            : undefined
                        )
                      }
                      inputProps={{ step: "0.01" }}
                    />
                  </Box>
                </Box>

                <Box sx={{ pt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Options
                  </Typography>
                  <Stack spacing={1}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.canBeSold}
                          onChange={(e) =>
                            handleFormChange("canBeSold", e.target.checked)
                          }
                        />
                      }
                      label="Can be Sold"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.canBePurchased}
                          onChange={(e) =>
                            handleFormChange("canBePurchased", e.target.checked)
                          }
                        />
                      }
                      label="Can be Purchased"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.trackInventory}
                          onChange={(e) =>
                            handleFormChange("trackInventory", e.target.checked)
                          }
                        />
                      }
                      label="Track Inventory"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.isActive}
                          onChange={(e) =>
                            handleFormChange("isActive", e.target.checked)
                          }
                        />
                      }
                      label="Active"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.hasVariants}
                          onChange={(e) =>
                            handleFormChange("hasVariants", e.target.checked)
                          }
                        />
                      }
                      label="Has Variants"
                    />
                  </Stack>
                </Box>
              </Stack>
            </Box>
          )}

          {/* Step 1: Attributes */}
          {activeStep === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Product Attributes
              </Typography>
              {attributes.length === 0 ? (
                <Typography color="text.secondary">
                  No attributes available. Create attributes first in the
                  Attributes section.
                </Typography>
              ) : (
                <Stack spacing={3}>
                  {attributes.map((attr) => (
                    <Box key={attr.id}>
                      <Typography variant="subtitle2">{attr.name}</Typography>
                      {attr.attributeType === "TEXT" && (
                        <TextField
                          fullWidth
                          value={attributeValues[attr.id] || ""}
                          onChange={(e) =>
                            handleAttributeChange(attr.id, e.target.value)
                          }
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      )}
                      {attr.attributeType === "NUMBER" && (
                        <TextField
                          fullWidth
                          type="number"
                          value={attributeValues[attr.id] || ""}
                          onChange={(e) =>
                            handleAttributeChange(
                              attr.id,
                              parseFloat(e.target.value)
                            )
                          }
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      )}
                      {attr.attributeType === "BOOLEAN" && (
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={Boolean(attributeValues[attr.id])}
                              onChange={(e) =>
                                handleAttributeChange(attr.id, e.target.checked)
                              }
                            />
                          }
                          label={attr.name}
                        />
                      )}
                      {(attr.attributeType === "SELECT" ||
                        attr.attributeType === "MULTI_SELECT") && (
                        <Select
                          fullWidth
                          value={attributeValues[attr.id] || ""}
                          onChange={(e) =>
                            handleAttributeChange(attr.id, e.target.value)
                          }
                          size="small"
                          sx={{ mt: 1 }}
                          multiple={attr.attributeType === "MULTI_SELECT"}
                        >
                          {attr.options?.map((opt) => (
                            <MenuItem key={opt} value={opt}>
                              {opt}
                            </MenuItem>
                          ))}
                        </Select>
                      )}
                      {attr.attributeType === "DATE" && (
                        <TextField
                          fullWidth
                          type="date"
                          value={attributeValues[attr.id] || ""}
                          onChange={(e) =>
                            handleAttributeChange(attr.id, e.target.value)
                          }
                          size="small"
                          InputLabelProps={{ shrink: true }}
                          sx={{ mt: 1 }}
                        />
                      )}
                      {attr.attributeType === "COLOR" && (
                        <TextField
                          fullWidth
                          type="color"
                          value={attributeValues[attr.id] || "#000000"}
                          onChange={(e) =>
                            handleAttributeChange(attr.id, e.target.value)
                          }
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      )}
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>
          )}

          {/* Step 2: Variants */}
          {activeStep === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Variants Management
              </Typography>
              {formData.hasVariants ? (
                <Typography color="text.secondary">
                  This product has variants enabled. To manage variants, save
                  this product first, then navigate to the product detail page
                  to create and manage variants.
                </Typography>
              ) : (
                <Typography color="text.secondary">
                  Enable "Has Variants" in the Basic Info tab to add variants to
                  this product.
                </Typography>
              )}
            </Box>
          )}

          {/* Step 3: Translations */}
          {activeStep === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Translations (i18n)
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                Currently editing default locale. Additional locale support
                coming soon.
              </Typography>
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Product Name (Default)"
                  value={formData.name}
                  disabled
                  helperText="Edit in Basic Info tab"
                />
                <TextField
                  fullWidth
                  label="Description (Default)"
                  value={formData.description}
                  disabled
                  multiline
                  rows={3}
                  helperText="Edit in Basic Info tab"
                />
              </Stack>
            </Box>
          )}

          {/* Navigation */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
            <Button onClick={handleBack} disabled={activeStep === 0}>
              Back
            </Button>
            <Stack direction="row" spacing={2}>
              <Button
                onClick={() =>
                  navigate({ to: "/$lang/app/products/list" as const })
                }
                variant="outlined"
              >
                Cancel
              </Button>
              {activeStep === steps.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  variant="contained"
                  disabled={
                    createProductMutation.isPending ||
                    updateProductMutation.isPending
                  }
                >
                  {createProductMutation.isPending ||
                  updateProductMutation.isPending
                    ? "Saving..."
                    : "Save Product"}
                </Button>
              ) : (
                <Button onClick={handleNext} variant="contained">
                  Next
                </Button>
              )}
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
