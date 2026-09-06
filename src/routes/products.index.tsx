import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { categories } from "@/data/products";
import type { Product } from "@/data/products";
import { getProducts } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { Search } from "lucide-react";

export const Route = createFileRoute("/products/")({
  component: ProductsPage,
  head: () => ({
    meta: [
      { title: "All Products — JAN'S Frozen Food" },
      {
        name: "description",
        content:
          "Browse all halal frozen foods: nuggets, parathas, kebabs, samosas, rolls, family packs and more.",
      },
    ],
    links: [{ rel: "canonical", href: "/products" }],
  }),
});

function ProductsPage() {
  const {
    data: productList = [],
    isLoading,
    error,
  } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  const [cat, setCat] = useState<string>("all");
  const [q, setQ] = useState("");
  const [sort, setSort] =
    useState<"popular" | "low" | "high">("popular");

  const filtered = useMemo(() => {
    let r = productList.filter(
      (p) =>
        (cat === "all" || p.category === cat) &&
        (q.trim() === "" ||
          p.name.toLowerCase().includes(q.toLowerCase())),
    );

    if (sort === "low") {
      r = [...r].sort((a, b) => a.price - b.price);
    }

    if (sort === "high") {
      r = [...r].sort((a, b) => b.price - a.price);
    }

    if (sort === "popular") {
      r = [...r].sort((a, b) => b.rating - a.rating);
    }

    return r;
  }, [productList, cat, q, sort]);

  if (isLoading) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        Loading products...
      </div>
    );
  }

  if (error) {
    console.error("Product loading error:", error);

    return (
      <div className="py-20 text-center text-red-500">
        Could not load products.
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <header className="mb-8">
        <span className="text-xs uppercase tracking-[0.25em] text-primary font-semibold">
          Catalog
        </span>

        <h1 className="font-display text-4xl sm:text-5xl mt-2">
          All Products
        </h1>

        <p className="text-muted-foreground mt-2">
          Browse our complete halal frozen menu.
        </p>
      </header>

      <div className="grid lg:grid-cols-[260px_1fr] gap-8">
        <aside className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-full border border-border bg-card pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <h3 className="font-display text-sm uppercase tracking-wider text-muted-foreground mb-3">
              Category
            </h3>

            <ul className="space-y-1">
              {[
                { slug: "all", name: "All", icon: "✨" },
                ...categories,
              ].map((c) => (
                <li key={c.slug}>
                  <button
                    onClick={() => setCat(c.slug)}
                    className={`w-full text-left flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                      cat === c.slug
                        ? "bg-primary/15 text-primary font-semibold"
                        : "hover:bg-primary/5"
                    }`}
                  >
                    <span>{c.icon}</span>
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div>
          <div className="flex items-center justify-between mb-5">
            <span className="text-sm text-muted-foreground">
              {filtered.length} products
            </span>

            <select
              value={sort}
              onChange={(e) =>
                setSort(
                  e.target.value as "popular" | "low" | "high",
                )
              }
              className="rounded-full border border-border bg-card px-4 py-2 text-sm"
            >
              <option value="popular">Most popular</option>
              <option value="low">Price: low to high</option>
              <option value="high">Price: high to low</option>
            </select>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              No products match your filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((p) => (
                <ProductCard key={p.id} p={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}