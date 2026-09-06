import {
  createFileRoute,
  Link,
  notFound,
  useNavigate,
} from "@tanstack/react-router";

import {
  ChevronLeft,
  Minus,
  Plus,
  ShieldCheck,
  Snowflake,
  Star,
  Truck,
} from "lucide-react";

import { useState } from "react";
import { toast } from "sonner";

import {
  getProductById,
  getRelatedProducts,
} from "@/lib/products";

import { useCart } from "@/store/cart";
import { formatPKR } from "@/lib/brand";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/products/$id")({
  loader: async ({ params }) => {
    const product = await getProductById(params.id);

    if (!product) {
      throw notFound();
    }

    const related = await getRelatedProducts(
      product.category,
      product.id,
    );

    return {
      product,
      related,
    };
  },

  component: ProductPage,

  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-6 py-32 text-center">
      <h1 className="font-display text-4xl">
        Product not found
      </h1>

      <Link
        to="/products"
        className="mt-4 inline-block text-primary font-semibold"
      >
        Back to all products
      </Link>
    </div>
  ),

  head: ({ loaderData }) => ({
    meta: [
      {
        title: `${
          loaderData?.product.name ?? "Product"
        } — JAN'S Frozen Food`,
      },
      {
        name: "description",
        content: loaderData?.product.description ?? "",
      },
      {
        property: "og:image",
        content: loaderData?.product.image ?? "",
      },
    ],
  }),
});

function ProductPage() {
  const { product: p, related } = Route.useLoaderData();

  const [qty, setQty] = useState(1);

  const add = useCart((s) => s.add);
  const navigate = useNavigate();

  const effectivePrice = p.discount
    ? p.price * (1 - p.discount / 100)
    : p.price;

  const addNow = () => {
    add(
      {
        id: p.id,
        name: p.name,
        price: p.price,
        discount: p.discount,
        image: p.image,
        weight: p.weight,
      },
      qty,
    );

    toast.success(`${p.name} added to cart`);
  };

  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      <Link
        to="/products"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to products
      </Link>

      <div className="grid lg:grid-cols-2 gap-12">
        <div className="relative aspect-square rounded-3xl overflow-hidden bg-muted border border-border glow-red">
          <img
            src={p.image}
            alt={p.name}
            className="h-full w-full object-cover"
          />

          {p.discount && (
            <span className="absolute top-4 left-4 rounded-full bg-primary text-primary-foreground px-3 py-1.5 text-xs font-bold uppercase tracking-wider glow-red">
              {p.discount}% Off
            </span>
          )}
        </div>

        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-primary font-semibold">
            {p.category}
          </span>

          <h1 className="font-display text-4xl sm:text-5xl mt-2">
            {p.name}
          </h1>

          <div className="mt-3 flex items-center gap-3 text-sm">
            <span className="inline-flex items-center gap-1 font-semibold">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              {p.rating.toFixed(1)}
            </span>

            <span className="text-muted-foreground">
              • {p.weight}
            </span>

            {p.halal && (
              <span className="rounded-full bg-emerald-600 text-white px-2 py-0.5 text-[10px] font-bold">
                HALAL
              </span>
            )}

            <span className="rounded-full bg-card border border-border px-2 py-0.5 text-[10px]">
              {p.freshness}
            </span>
          </div>

          <p className="mt-5 text-base text-muted-foreground leading-relaxed">
            {p.description}
          </p>

          <div className="mt-6 flex items-end gap-3">
            <span className="font-display text-5xl text-gradient-fire">
              {formatPKR(effectivePrice)}
            </span>

            {p.discount && (
              <span className="pb-2 line-through text-muted-foreground">
                {formatPKR(p.price)}
              </span>
            )}
          </div>

          <div className="mt-8 flex items-center gap-4">
            <div className="inline-flex items-center rounded-full border border-border bg-card">
              <button
                onClick={() =>
                  setQty(Math.max(1, qty - 1))
                }
                className="h-11 w-11 inline-flex items-center justify-center hover:text-primary"
              >
                <Minus className="h-4 w-4" />
              </button>

              <span className="w-8 text-center font-semibold">
                {qty}
              </span>

              <button
                onClick={() => setQty(qty + 1)}
                className="h-11 w-11 inline-flex items-center justify-center hover:text-primary"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={addNow}
              className="flex-1 rounded-full bg-card border border-primary text-primary font-bold py-3 hover:bg-primary hover:text-primary-foreground transition"
            >
              Add to Cart
            </button>

            <button
              onClick={() => {
                addNow();
                navigate({ to: "/checkout" });
              }}
              className="flex-1 rounded-full bg-primary text-primary-foreground font-bold py-3 glow-red"
            >
              Order Now
            </button>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3">
            {[
              {
                Icon: Snowflake,
                text: "Flash Frozen",
              },
              {
                Icon: ShieldCheck,
                text: "100% Halal",
              },
              {
                Icon: Truck,
                text: "Cold Delivery",
              },
            ].map(({ Icon, text }) => (
              <div
                key={text}
                className="rounded-xl border border-border bg-card p-3 text-center"
              >
                <Icon className="mx-auto h-5 w-5 text-primary mb-1" />

                <div className="text-xs font-semibold">
                  {text}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-20">
          <h2 className="font-display text-3xl mb-6">
            You might also like
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((product: typeof p) => (
              <ProductCard
                key={product.id}
                p={product}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}