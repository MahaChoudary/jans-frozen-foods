import { Link } from "@tanstack/react-router";
import { Star, ShoppingBag, Eye, Zap } from "lucide-react";
import type { Product } from "@/data/products";
import { useCart } from "@/store/cart";
import { formatPKR } from "@/lib/brand";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

export function ProductCard({ p }: { p: Product }) {
  const add = useCart((s) => s.add);
  const navigate = useNavigate();

  const onAdd = () => {
    add({ id: p.id, name: p.name, price: p.price, discount: p.discount, image: p.image, weight: p.weight });
    toast.success(`${p.name} added to cart`);
  };

  const effective = p.discount ? p.price * (1 - p.discount / 100) : p.price;

  return (
    <article className="group relative tilt-card rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/60">
      <div className="relative aspect-[5/4] overflow-hidden bg-muted">
        <img
          src={p.image}
          alt={p.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {p.discount ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground glow-red">
              <Zap className="h-3 w-3" /> {p.discount}% Off
            </span>
          ) : null}
          {p.bestseller && (
            <span className="rounded-full bg-accent/95 text-accent-foreground px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">
              Bestseller
            </span>
          )}
        </div>
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
          {p.halal && (
            <span className="rounded-full bg-emerald-600 text-white px-2 py-1 text-[10px] font-bold">HALAL</span>
          )}
          <span className="rounded-full bg-black/60 text-white px-2 py-1 text-[10px] font-medium backdrop-blur">{p.freshness}</span>
        </div>
        <div className="absolute inset-x-0 bottom-0 flex translate-y-full gap-2 p-3 transition-transform duration-500 group-hover:translate-y-0">
          <button
            onClick={onAdd}
            className="flex-1 inline-flex items-center justify-center gap-1 rounded-full bg-primary text-primary-foreground py-2 text-xs font-semibold glow-red"
          >
            <ShoppingBag className="h-3.5 w-3.5" /> Add
          </button>
          <Link
            to="/products/$id"
            params={{ id: String(p.id) }}
            className="inline-flex items-center justify-center rounded-full bg-card/90 backdrop-blur px-3 text-xs font-semibold border border-border"
            preload="intent"
          >
            <Eye className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{p.weight}</span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            {p.rating.toFixed(1)}
          </span>
        </div>
        <h3 className="font-display text-lg leading-tight tracking-wide line-clamp-1">{p.name}</h3>
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{p.description}</p>
        <div className="mt-3 flex items-center justify-between">
          <div>
            <span className="font-display text-xl text-gradient-fire">{formatPKR(effective)}</span>
            {p.discount && (
              <span className="ml-2 text-xs line-through text-muted-foreground">{formatPKR(p.price)}</span>
            )}
          </div>
          <button
            onClick={() => { onAdd(); navigate({ to: "/checkout" }); }}
            className="text-[11px] font-bold uppercase tracking-wider rounded-full px-3 py-1.5 border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition"
          >
            Order
          </button>
        </div>
      </div>
    </article>
  );
}
