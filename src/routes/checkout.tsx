import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useCart } from "@/store/cart";
import { formatPKR } from "@/lib/brand";
import { CheckCircle2, Lock, Truck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
  head: () => ({ meta: [{ title: "Checkout — JAN'S Frozen Food" }] }),
});

function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<{ orderId: string } | null>(null);

  const [form, setForm] = useState({
    name: "", phone: "", email: "", address: "", city: "", instructions: "",
  });

  const sub = subtotal();
  const delivery = sub > 0 && sub < 3000 ? 200 : 0;
  const total = sub + delivery;

  if (done) {
    return (
      <section className="mx-auto max-w-2xl px-6 py-24 text-center">
        <CheckCircle2 className="h-20 w-20 text-emerald-500 mx-auto mb-6" />
        <h1 className="font-display text-4xl">Order placed!</h1>
        <p className="text-muted-foreground mt-2">Your order ID is <span className="font-mono font-bold text-foreground">{done.orderId}</span>.</p>
        <p className="text-muted-foreground mt-1">We'll call you shortly to confirm. Pay on delivery when it arrives.</p>
        <Link to="/" className="mt-8 inline-flex rounded-full bg-primary text-primary-foreground px-6 py-3 font-bold glow-red">Back to home</Link>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="font-display text-4xl">Your cart is empty</h1>
        <Link to="/products" className="mt-6 inline-flex rounded-full bg-primary text-primary-foreground px-6 py-3 font-bold">Browse products</Link>
      </section>
    );
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/send-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: form,
          items: items.map((i) => ({ id: i.id, name: i.name, qty: i.qty, price: i.price, discount: i.discount })),
          subtotal: sub,
          total,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to place order");
      }

      const res = await response.json();
      toast.success("Order placed! We'll be in touch shortly.");
      clear();
      setDone({ orderId: res.orderId });
      window.scrollTo({ top: 0 });
    } catch (err) {
      console.error(err);
      toast.error("Could not place order. Please try again or contact us on WhatsApp.");
    } finally {
      setLoading(false);
    }
  };

  const input = "w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:border-primary";

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="font-display text-4xl sm:text-5xl mb-8">Checkout</h1>
      <form onSubmit={onSubmit} className="grid lg:grid-cols-[1fr_380px] gap-8">
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-2xl mb-4">Delivery Details</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <input required placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={input} />
              <input required type="tel" placeholder="Phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={input} />
              <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={`${input} sm:col-span-2`} />
              <input required placeholder="Full address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={`${input} sm:col-span-2`} />
              <input required placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={input} />
              <textarea placeholder="Special instructions (optional)" value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} className={`${input} sm:col-span-2 min-h-[90px]`} />
            </div>
          </div>

          <div className="rounded-2xl border border-primary/40 bg-primary/5 p-6">
            <div className="flex items-center gap-3">
              <Truck className="h-6 w-6 text-primary" />
              <div>
                <h3 className="font-display text-lg">Cash on Delivery</h3>
                <p className="text-sm text-muted-foreground">Pay when your order arrives. No upfront payment needed.</p>
              </div>
              <span className="ml-auto rounded-full bg-primary text-primary-foreground px-3 py-1 text-xs font-bold">SELECTED</span>
            </div>
          </div>
        </div>

        <aside className="rounded-2xl border border-border bg-card p-6 h-fit sticky top-24">
          <h2 className="font-display text-2xl mb-4">Your Order</h2>
          <ul className="space-y-3 max-h-72 overflow-y-auto pr-2">
            {items.map((i) => {
              const eff = i.discount ? i.price * (1 - i.discount / 100) : i.price;
              return (
                <li key={i.id} className="flex justify-between text-sm">
                  <span className="flex-1">{i.name} <span className="text-muted-foreground">× {i.qty}</span></span>
                  <span className="font-semibold">{formatPKR(eff * i.qty)}</span>
                </li>
              );
            })}
          </ul>
          <div className="h-px bg-border my-4" />
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPKR(sub)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span>{delivery === 0 ? "FREE" : formatPKR(delivery)}</span></div>
          </div>
          <div className="h-px bg-border my-4" />
          <div className="flex justify-between font-display text-2xl"><span>Total</span><span className="text-gradient-fire">{formatPKR(total)}</span></div>
          <button disabled={loading} type="submit" className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground py-3.5 font-bold glow-red disabled:opacity-60">
            {loading ? "Placing order..." : "Place Order"}
          </button>
          <p className="mt-3 text-xs text-muted-foreground text-center inline-flex items-center justify-center gap-1 w-full">
            <Lock className="h-3 w-3" /> Your details are secure
          </p>
        </aside>
      </form>
    </section>
  );
}
