import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Flame, ShieldCheck, Truck, Award, Snowflake, ArrowRight, Star } from "lucide-react";
import { products, categories } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";
import { Embers } from "@/components/Embers";
import { Logo } from "@/components/Logo";
import { waLink } from "@/lib/whatsapp";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "JAN'S Frozen Food — Premium Halal Frozen Meals" },
      { name: "description", content: "Crispy nuggets, flaky parathas, juicy kebabs. Flash-frozen at peak freshness, delivered cold. Cash on Delivery available." },
    ],
  }),
});

function Home() {
  const featured = products.filter((p) => p.featured).slice(0, 6);
  const trending = products.filter((p) => p.bestseller).slice(0, 4);
  const deals = products.filter((p) => p.deal).slice(0, 4);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden -mt-20 pt-32 pb-24 bg-fire text-cream noise">
        <Embers />
        <div className="relative mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em]">
              <Flame className="h-3 w-3 text-primary" /> Pakistan's #1 Halal Frozen Brand
            </span>
            <h1 className="mt-5 font-display text-5xl sm:text-6xl lg:text-7xl leading-[0.95]">
              Hot & Crispy.<br />
              <span className="text-gradient-fire">Frozen Fresh.</span><br />
              Ready in Minutes.
            </h1>
            <p className="mt-5 max-w-lg text-base sm:text-lg opacity-85">
              From sizzling chicken nuggets to flaky lachha parathas — flash-frozen at peak freshness and delivered cold to your door.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-7 py-4 font-semibold glow-red hover:scale-[1.03] transition"
              >
                Order Now <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={waLink("Hi JAN'S! Send me your menu.")}
                target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 backdrop-blur px-7 py-4 font-semibold hover:bg-white/10 transition"
              >
                Chat on WhatsApp
              </a>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-6 max-w-md">
              {[
                ["50K+", "Happy Customers"],
                ["100%", "Halal Certified"],
                ["24h", "Cold Delivery"],
              ].map(([n, l]) => (
                <div key={l}>
                  <div className="font-display text-3xl text-gradient-fire">{n}</div>
                  <div className="text-[11px] uppercase tracking-wider opacity-70">{l}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.1 }}
            className="relative aspect-square max-w-130 mx-auto"
          >
            <div className="absolute inset-0 rounded-full bg-linear-to-br from-primary/40 via-ember/30 to-transparent blur-3xl" />
            <motion.div
              animate={{ y: [0, -20, 0], rotate: [-2, 2, -2] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10 h-full w-full flex items-center justify-center"
            >
              <Logo className="h-[78%] w-[78%] ring-4! shadow-[0_0_120px_-10px_var(--primary)]" />
            </motion.div>
            <motion.img
              src="https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=400&q=70"
              alt=""
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="absolute -bottom-6 -left-2 h-32 w-32 rounded-2xl object-cover shadow-2xl ring-4 ring-primary/40 rotate-[-8deg]"
            />
            <motion.img
              src=""   // there is a problem here, the src is empty, you might want to add a valid image URL
              alt=""
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, delay: 0.5 }}
              className="absolute -top-4 -right-4 h-28 w-28 rounded-2xl object-cover shadow-2xl ring-4 ring-accent/40 rotate-10"
            />
          </motion.div>
        </div>
      </section>

      {/* MARQUEE */}
      <section className="border-y border-border bg-card/40 py-5 overflow-hidden">
        <div className="flex gap-12 animate-[marquee_28s_linear_infinite] whitespace-nowrap font-display text-xl text-muted-foreground">
          {Array.from({ length: 2 }).flatMap((_, k) =>
            ["FREE DELIVERY OVER RS 3000", "CASH ON DELIVERY", "100% HALAL CERTIFIED", "FLASH-FROZEN FRESH", "FAMILY PACKS AVAILABLE", "ORDER ON WHATSAPP"].map((t, i) => (
              <span key={`${k}-${i}`} className="flex items-center gap-12">
                <span className="text-primary">✦</span> {t}
              </span>
            ))
          )}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-primary font-semibold">Shop by Category</span>
            <h2 className="font-display text-4xl sm:text-5xl mt-2">Pick Your Cravings</h2>
          </div>
          <Link to="/categories" className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-primary">
            All categories <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {categories.slice(0, 12).map((c) => (
            <Link
              key={c.slug}
              to="/categories"
              hash={c.slug}
              className="tilt-card flex flex-col items-center justify-center rounded-2xl border border-border bg-card aspect-square p-3 hover:border-primary/60 hover:bg-primary/5"
            >
              <span className="text-3xl mb-2">{c.icon}</span>
              <span className="text-xs font-semibold text-center leading-tight">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* DEALS BANNER */}
      <section className="relative mx-auto max-w-7xl px-6 py-12">
        <div className="relative overflow-hidden rounded-3xl bg-fire noise text-cream p-10 md:p-16 glow-red">
          <Embers count={10} />
          <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="text-xs uppercase tracking-[0.3em] text-primary-foreground/80">Limited Time</span>
              <h3 className="font-display text-4xl sm:text-5xl mt-2 leading-tight">Family Party Pack<br /><span className="text-gradient-fire">25% Off</span></h3>
              <p className="mt-3 opacity-85 max-w-md">Nuggets, fries, samosas, rolls — everything you need for movie night, packed and frozen fresh.</p>
              <Link to="/deals" className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary-foreground text-primary px-6 py-3 font-bold">
                Grab Deals <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="relative h-48 md:h-64">
              <motion.img
                src="https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=600&q=70"
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute right-0 top-0 h-full w-full object-cover rounded-2xl shadow-2xl"
                alt=""
              />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-primary font-semibold">Featured</span>
            <h2 className="font-display text-4xl sm:text-5xl mt-2">Today's Sizzlers</h2>
          </div>
          <Link to="/products" className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-primary">
            See all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </section>

      {/* WHY US */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-[0.25em] text-primary font-semibold">Why JAN'S</span>
          <h2 className="font-display text-4xl sm:text-5xl mt-2">Frozen Done Right</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { Icon: Snowflake, t: "Flash-Frozen", d: "Locked in at peak freshness within hours of prep." },
            { Icon: ShieldCheck, t: "100% Halal", d: "Certified halal ingredients in every single bite." },
            { Icon: Truck, t: "Cold Delivery", d: "Refrigerated transport, doorstep to plate." },
            { Icon: Award, t: "Chef Crafted", d: "Recipes developed by professional chefs." },
          ].map(({ Icon, t, d }) => (
            <div key={t} className="tilt-card rounded-2xl border border-border bg-card p-6 hover:border-primary/50">
              <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary inline-flex items-center justify-center mb-4">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl mb-1">{t}</h3>
              <p className="text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TRENDING */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-primary font-semibold">Bestsellers</span>
            <h2 className="font-display text-4xl sm:text-5xl mt-2">Customer Favourites</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trending.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </section>

      {/* DEALS GRID */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-primary font-semibold">Hot Deals</span>
            <h2 className="font-display text-4xl sm:text-5xl mt-2">Save Big This Week</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {deals.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-[0.25em] text-primary font-semibold">Reviews</span>
          <h2 className="font-display text-4xl sm:text-5xl mt-2">Loved Across Pakistan</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { n: "Ayesha K.", c: "Lahore", q: "The lachha parathas taste fresher than what I make at home. Obsessed." },
            { n: "Bilal R.", c: "Karachi", q: "Kebabs are restaurant-quality. My kids ask for them every weekend." },
            { n: "Sana M.", c: "Islamabad", q: "Cash on delivery + cold packaging = perfect. 10/10." },
          ].map((t) => (
            <div key={t.n} className="rounded-2xl border border-border bg-card p-6 tilt-card">
              <div className="flex gap-0.5 mb-3 text-amber-400">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}</div>
              <p className="text-base italic">"{t.q}"</p>
              <div className="mt-4 font-semibold">{t.n} <span className="text-muted-foreground font-normal">— {t.c}</span></div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-3xl bg-fire noise text-cream p-10 md:p-16 text-center relative overflow-hidden glow-red">
          <Embers count={14} />
          <div className="relative z-10">
            <h3 className="font-display text-4xl sm:text-5xl">Hungry yet?</h3>
            <p className="mt-3 max-w-xl mx-auto opacity-85">Get premium halal frozen food delivered cold. Pay only when it arrives.</p>
            <Link to="/products" className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary-foreground text-primary px-7 py-3.5 font-bold">
              Start Ordering <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
