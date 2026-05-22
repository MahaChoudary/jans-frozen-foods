import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
} from "@tanstack/react-router";

import "../styles.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-fire text-cream px-4 relative noise">
      <div className="max-w-md text-center relative z-10">
        <h1 className="font-display text-[8rem] leading-none text-gradient-fire">404</h1>
        <h2 className="mt-2 font-display text-2xl">Page off the menu</h2>
        <p className="mt-3 text-sm opacity-80">
          That page is out of stock. Let's get you back to something delicious.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground glow-red"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-3xl">Something burned in the kitchen</h1>
        <p className="mt-2 text-sm text-muted-foreground">Try again or head back home.</p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground glow-red"
          >
            Try again
          </button>
          <a href="/" className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold">Go home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "JAN'S Frozen Food — Premium Halal Frozen Meals Delivered" },
      { name: "description", content: "Order premium halal frozen parathas, nuggets, kebabs, rolls and family packs. Cash on Delivery. Flash-frozen at peak freshness." },
      { name: "author", content: "JAN'S Frozen Food" },
      { property: "og:title", content: "JAN'S Frozen Food — Tastes Like Fresh. Always." },
      { property: "og:description", content: "Premium halal frozen food delivered cold to your door." },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "JAN'S Frozen Food" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-20">
          <Outlet />
        </main>
        <Footer />
        <FloatingWhatsApp />
        <Toaster position="top-right" richColors />
      </div>
    </QueryClientProvider>
  );
}
