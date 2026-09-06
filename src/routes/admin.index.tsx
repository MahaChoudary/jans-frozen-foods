import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOut, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase";
import { getProducts, deleteProduct } from "@/lib/products";
import { formatPKR } from "@/lib/brand";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [productToDelete, setProductToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [deleting, setDeleting] = useState(false);

  const {
    data: products = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  useEffect(() => {
    async function checkAdmin() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        navigate({
          to: "/admin/login",
        });
      }
    }

    checkAdmin();
  }, [navigate]);

  const handleDelete = async () => {
    if (!productToDelete) return;

    try {
      setDeleting(true);

      await deleteProduct(productToDelete.id);

      await queryClient.invalidateQueries({
        queryKey: ["products"],
      });

      toast.success(
        `${productToDelete.name} deleted successfully`,
      );

      setProductToDelete(null);
    } catch (error) {
      console.error(error);

      toast.error("Could not delete product");
    } finally {
      setDeleting(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();

    toast.success("Logged out successfully");

    navigate({
      to: "/admin/login",
    });
  };

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
      {/* Header */}
      <div className="mb-10 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            Administration
          </p>

          <h1 className="mt-2 font-display text-4xl">
            Products
          </h1>

          <p className="mt-2 text-muted-foreground">
            Manage JAN'S Frozen Food products.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
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

      {/* Products Table */}
      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="p-4">Product</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4">Weight</th>
              <th className="p-4">Actions</th>
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
                        src={product.image}
                        alt={product.name}
                        className="h-14 w-14 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted text-[10px] text-muted-foreground">
                        No image
                      </div>
                    )}

                    <div>
                      <div className="font-semibold">
                        {product.name}
                      </div>

                      <div className="text-xs text-muted-foreground">
                        ID: {product.id}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="p-4">
                  {product.category}
                </td>

                <td className="p-4 font-semibold">
                  {formatPKR(product.price)}
                </td>

                <td className="p-4">
                  {product.weight}
                </td>

                <td className="p-4">
                  <div className="flex gap-2">
                    <button
                      type="button"
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

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-7 shadow-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
              <Trash2 className="h-7 w-7 text-red-500" />
            </div>

            <div className="mt-5 text-center">
              <h2 className="font-display text-2xl">
                Delete Product?
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-foreground">
                  {productToDelete.name}
                </span>
                ? This action cannot be undone.
              </p>
            </div>

            <div className="mt-7 flex gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() =>
                  setProductToDelete(null)
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