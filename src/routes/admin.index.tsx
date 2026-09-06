import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  LogOut,
  Plus,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase";
import {
  getProducts,
  deleteProduct,
  createProduct,
  updateProduct,
  uploadProductImage,
  deleteProductImage,
} from "@/lib/products";

import { useAuth } from "@/lib/useAuth";
import { ProductForm } from "@/components/ProductForm";
import type { Product } from "@/data/products";
import { formatPKR } from "@/lib/brand";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

type FormMode =
  | null
  | "add"
  | {
      mode: "edit";
      product: Product;
    };

type ProductMutationInput = {
  data: Omit<Product, "id">;
  imageFile: File | null;
};

type UpdateProductMutationInput = ProductMutationInput & {
  id: string;
  oldImage?: string;
};

function isSupabaseProductImage(
  imageUrl?: string,
): boolean {
  if (!imageUrl) {
    return false;
  }

  return imageUrl.includes("/product-images/");
}

function AdminDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [formMode, setFormMode] =
    useState<FormMode>(null);

  const [productToDelete, setProductToDelete] =
    useState<{
      id: string;
      name: string;
      image?: string;
    } | null>(null);

  const [deleting, setDeleting] =
    useState(false);

  const {
    data: products = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
    enabled: Boolean(user),
  });

  /* =====================================================
     CREATE PRODUCT
  ===================================================== */

  const createMutation = useMutation({
    mutationFn: async ({
      data,
      imageFile,
    }: ProductMutationInput) => {
      let uploadedImageUrl: string | null =
        null;

      try {
        let finalImageUrl = data.image;

        if (imageFile) {
          uploadedImageUrl =
            await uploadProductImage(
              imageFile,
            );

          finalImageUrl =
            uploadedImageUrl;
        }

        return await createProduct({
          ...data,
          image: finalImageUrl,
        });
      } catch (error) {
        /*
          Agar image upload ho gayi thi lekin
          database insert fail ho gaya, to orphan
          image ko Storage se remove kar do.
        */
        if (uploadedImageUrl) {
          await deleteProductImage(
            uploadedImageUrl,
          );
        }

        throw error;
      }
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["products"],
      });

      toast.success(
        "Product created successfully",
      );

      setFormMode(null);
    },

    onError: (error) => {
      console.error(
        "Product create error:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Could not create product",
      );
    },
  });

  /* =====================================================
     UPDATE PRODUCT
  ===================================================== */

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
      imageFile,
      oldImage,
    }: UpdateProductMutationInput) => {
      let uploadedImageUrl: string | null =
        null;

      try {
        let finalImageUrl = data.image;

        if (imageFile) {
          uploadedImageUrl =
            await uploadProductImage(
              imageFile,
            );

          finalImageUrl =
            uploadedImageUrl;
        }

        const updatedProduct =
          await updateProduct(id, {
            ...data,
            image: finalImageUrl,
          });

        /*
          Agar client ne new image upload ki hai,
          aur old image bhi hamari Supabase
          product-images bucket ki thi,
          to old image delete kar do.
        */
        if (
          imageFile &&
          oldImage &&
          oldImage !== finalImageUrl &&
          isSupabaseProductImage(oldImage)
        ) {
          await deleteProductImage(
            oldImage,
          );
        }

        return updatedProduct;
      } catch (error) {
        /*
          New image upload ho gayi lekin database
          update fail hua to new orphan image remove.
        */
        if (uploadedImageUrl) {
          await deleteProductImage(
            uploadedImageUrl,
          );
        }

        throw error;
      }
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["products"],
      });

      toast.success(
        "Product updated successfully",
      );

      setFormMode(null);
    },

    onError: (error) => {
      console.error(
        "Product update error:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Could not update product",
      );
    },
  });

  /* =====================================================
     DELETE PRODUCT
  ===================================================== */

  const handleDelete = async () => {
    if (!productToDelete) {
      return;
    }

    try {
      setDeleting(true);

      await deleteProduct(
        productToDelete.id,
      );

      /*
        Agar product ki image Supabase Storage
        wali hai to product delete hone ke baad
        image bhi remove kar do.
      */
      if (
        productToDelete.image &&
        isSupabaseProductImage(
          productToDelete.image,
        )
      ) {
        await deleteProductImage(
          productToDelete.image,
        );
      }

      await queryClient.invalidateQueries({
        queryKey: ["products"],
      });

      toast.success(
        `${productToDelete.name} deleted successfully`,
      );

      setProductToDelete(null);
    } catch (error) {
      console.error(
        "Product delete error:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Could not delete product",
      );
    } finally {
      setDeleting(false);
    }
  };

  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout = async () => {
    const { error } =
      await supabase.auth.signOut();

    if (error) {
      toast.error(
        "Could not log out",
      );

      return;
    }

    toast.success(
      "Logged out successfully",
    );

    navigate({
      to: "/admin/login",
    });
  };

  /* =====================================================
     AUTH STATES
  ===================================================== */

  if (authLoading) {
    return (
      <div className="py-20 text-center">
        Checking admin session...
      </div>
    );
  }

  if (!user) {
    navigate({
      to: "/admin/login",
    });

    return null;
  }

  /* =====================================================
     PRODUCT STATES
  ===================================================== */

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        Loading products...
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 text-center text-red-500">
        Could not load products.
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      {/* ================= HEADER ================= */}

      <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            Administration
          </p>

          <h1 className="mt-2 font-display text-4xl">
            Products
          </h1>

          <p className="mt-2 text-muted-foreground">
            Manage JAN'S Frozen Food products.
            {" "}
            {products.length} total
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() =>
              setFormMode("add")
            }
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 font-semibold text-primary-foreground transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 font-semibold transition hover:bg-muted"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>

      {/* ================= PRODUCTS ================= */}

      {products.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card py-20 text-center">
          <p className="text-muted-foreground">
            No products yet.
          </p>

          <button
            type="button"
            onClick={() =>
              setFormMode("add")
            }
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 font-semibold text-primary-foreground"
          >
            <Plus className="h-4 w-4" />
            Add First Product
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full min-w-[750px]">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="p-4">
                  Product
                </th>

                <th className="p-4">
                  Category
                </th>

                <th className="p-4">
                  Price
                </th>

                <th className="p-4">
                  Weight
                </th>

                <th className="p-4">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-border last:border-b-0"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {product.image ? (
                        <img
                          src={
                            product.image
                          }
                          alt={
                            product.name
                          }
                          className="h-14 w-14 rounded-xl bg-muted object-cover"
                          onError={(
                            event,
                          ) => {
                            event.currentTarget.style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted px-1 text-center text-[10px] text-muted-foreground">
                          No Image
                        </div>
                      )}

                      <div>
                        <div className="max-w-[220px] truncate font-semibold">
                          {product.name}
                        </div>

                        <div className="text-xs text-muted-foreground">
                          ID:{" "}
                          {product.id}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    {product.category}
                  </td>

                  <td className="p-4 font-semibold">
                    {formatPKR(
                      product.price,
                    )}

                    {product.discount ? (
                      <span className="ml-2 text-xs text-red-500">
                        -
                        {
                          product.discount
                        }
                        %
                      </span>
                    ) : null}
                  </td>

                  <td className="p-4">
                    {product.weight}
                  </td>

                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setFormMode({
                            mode: "edit",
                            product,
                          })
                        }
                        className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm transition hover:bg-muted"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setProductToDelete({
                            id: product.id,
                            name: product.name,
                            image:
                              product.image,
                          })
                        }
                        className="inline-flex items-center gap-1 rounded-lg border border-red-500/40 px-3 py-2 text-sm text-red-500 transition hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= ADD / EDIT MODAL ================= */}

      {formMode && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/70 px-4 py-10 backdrop-blur-sm">
          <div className="mx-auto w-full max-w-2xl rounded-3xl border border-border bg-card p-6 shadow-2xl sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  Product Management
                </p>

                <h2 className="mt-1 font-display text-2xl">
                  {formMode === "add"
                    ? "Add New Product"
                    : "Edit Product"}
                </h2>
              </div>

              <button
                type="button"
                disabled={
                  createMutation.isPending ||
                  updateMutation.isPending
                }
                onClick={() =>
                  setFormMode(null)
                }
                className="rounded-full p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-50"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <ProductForm
              key={
                formMode === "add"
                  ? "add-product"
                  : `edit-${formMode.product.id}`
              }
              initialData={
                formMode === "add"
                  ? undefined
                  : formMode.product
              }
              onSubmit={async (
                data,
                imageFile,
              ) => {
                if (
                  formMode === "add"
                ) {
                  await createMutation.mutateAsync(
                    {
                      data,
                      imageFile,
                    },
                  );

                  return;
                }

                await updateMutation.mutateAsync(
                  {
                    id: formMode.product.id,
                    oldImage:
                      formMode.product.image,
                    data,
                    imageFile,
                  },
                );
              }}
              loading={
                createMutation.isPending ||
                updateMutation.isPending
              }
            />
          </div>
        </div>
      )}

      {/* ================= DELETE MODAL ================= */}

      {productToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-7 shadow-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
              <Trash2 className="h-7 w-7 text-red-500" />
            </div>

            <div className="mt-5 text-center">
              <h2 className="font-display text-2xl">
                Delete Product?
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Are you sure you want to
                delete{" "}
                <span className="font-semibold text-foreground">
                  {
                    productToDelete.name
                  }
                </span>
                ? This action cannot be
                undone.
              </p>
            </div>

            <div className="mt-7 flex gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() =>
                  setProductToDelete(
                    null,
                  )
                }
                className="flex-1 rounded-xl border border-border py-3 font-semibold transition hover:bg-muted disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="flex-1 rounded-xl bg-red-500 py-3 font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting
                  ? "Deleting..."
                  : "Delete Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}