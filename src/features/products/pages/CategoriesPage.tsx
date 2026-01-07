import { Add, Delete, Edit } from "@mui/icons-material";
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
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";

import {
  useCreateProductCategory,
  useUpdateProductCategory,
  useDeleteProductCategory,
} from "@/lib/api/mutations/useProducts";
import { useCategoryTree } from "@/lib/api/queries/useProducts";
import { useNotification } from "@/shared/hooks/useNotification";
import type {
  CreateProductCategoryDto,
  ProductCategory,
  UpdateProductCategoryDto,
} from "@/types/api.types";

interface CategoryFormState {
  open: boolean;
  mode: "create" | "edit";
  data: Partial<ProductCategory>;
  parentId?: string;
  editingId?: string;
}

export function CategoriesPage() {
  const { showNotification } = useNotification();

  // State
  const [formState, setFormState] = useState<CategoryFormState>({
    open: false,
    mode: "create",
    data: {},
  });
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    categoryId?: string;
    categoryName?: string;
  }>({ open: false });

  // API
  const { data: categoryTree = [], isLoading } = useCategoryTree();
  const createMutation = useCreateProductCategory();
  const updateMutation = useUpdateProductCategory();
  const deleteMutation = useDeleteProductCategory();

  const handleCreateClick = (parentId?: string) => {
    setFormState({
      open: true,
      mode: "create",
      data: {
        name: "",
        code: "",
        parentId,
      },
      parentId,
    });
  };

  const handleEditClick = (category: ProductCategory) => {
    setFormState({
      open: true,
      mode: "edit",
      data: {
        id: category.id,
        name: category.name,
        code: category.code,
        parentId: category.parentId,
        sortOrder: category.sortOrder,
      },
      editingId: category.id,
    });
  };

  const handleDeleteClick = (category: ProductCategory) => {
    setDeleteConfirm({
      open: true,
      categoryId: category.id,
      categoryName: category.name,
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
        showNotification("Category name is required", "error");
        return;
      }

      if (formState.mode === "create") {
        const createDto: CreateProductCategoryDto = {
          name: formState.data.name,
          code: formState.data.code || "",
          parentId: formState.parentId,
        };
        await createMutation.mutateAsync(createDto);
        showNotification("Category created successfully", "success");
      } else if (formState.mode === "edit" && formState.editingId) {
        const updateDto: UpdateProductCategoryDto = {
          name: formState.data.name,
          code: formState.data.code,
          parentId: formState.data.parentId,
        };
        await updateMutation.mutateAsync({
          id: formState.editingId,
          data: updateDto,
        });
        showNotification("Category updated successfully", "success");
      }

      setFormState({ open: false, mode: "create", data: {} });
    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : "Failed to save category",
        "error"
      );
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirm.categoryId) {
      try {
        await deleteMutation.mutateAsync(deleteConfirm.categoryId);
        showNotification("Category deleted successfully", "success");
      } catch (error) {
        showNotification(
          error instanceof Error ? error.message : "Failed to delete category",
          "error"
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

  const renderCategoryNode = (category: ProductCategory, level = 0) => {
    return (
      <Box
        key={category.id}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 1.5,
          pl: 2 + level * 2,
          borderBottom: 1,
          borderColor: "divider",
          "&:hover": { bgcolor: "action.hover" },
        }}
      >
        <Typography variant="body2" sx={{ flex: 1 }}>
          {category.name}{" "}
          <Typography
            component="span"
            variant="caption"
            sx={{ color: "text.secondary" }}
          >
            ({category.code})
          </Typography>
        </Typography>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => handleEditClick(category)}>
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Add Sub-category">
            <IconButton
              size="small"
              onClick={() => handleCreateClick(category.id)}
            >
              <Add fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={() => handleDeleteClick(category)}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    );
  };

  const renderCategoryTree = (
    categories: ProductCategory[],
    level = 0
  ): React.ReactNode[] => {
    return categories.flatMap((cat) => [
      renderCategoryNode(cat, level),
      ...(cat.children ? renderCategoryTree(cat.children, level + 1) : []),
    ]);
  };

  const getAllCategories = (
    cats: ProductCategory[] = categoryTree
  ): ProductCategory[] => {
    return cats.flatMap((cat) => [
      cat,
      ...(cat.children ? getAllCategories(cat.children) : []),
    ]);
  };

  const allCategories = getAllCategories();

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
        <Typography variant="h4">Product Categories</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleCreateClick()}
        >
          Create Category
        </Button>
      </Box>

      {categoryTree.length === 0 ? (
        <Alert severity="info">
          No categories exist. Click &quot;Create Category&quot; to add the
          first one.
        </Alert>
      ) : (
        <Card>
          <CardContent sx={{ p: 0 }}>
            {renderCategoryTree(categoryTree)}
          </CardContent>
        </Card>
      )}

      {/* Category Form Dialog */}
      <Dialog
        open={formState.open}
        onClose={() => setFormState({ open: false, mode: "create", data: {} })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {formState.mode === "create" ? "Create Category" : "Edit Category"}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Category Name"
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
            {formState.mode === "create" && (
              <Select
                fullWidth
                value={formState.data.parentId || ""}
                onChange={(e) =>
                  handleFormChange(
                    "parentId",
                    e.target.value ? e.target.value : undefined
                  )
                }
              >
                <MenuItem value="">Root Category</MenuItem>
                {allCategories
                  .filter(
                    (cat) =>
                      !formState.editingId || cat.id !== formState.editingId
                  )
                  .map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))}
              </Select>
            )}
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
        <DialogTitle>Delete Category</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete &quot;{deleteConfirm.categoryName}
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
