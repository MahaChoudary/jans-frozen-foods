import {
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";
import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/useAuth";

export const Route = createFileRoute("/admin/login")({
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();

  const {
    user,
    loading,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const [loggingIn, setLoggingIn] =
    useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate({
        to: "/admin",
      });
    }
  }, [user, loading, navigate]);

  const handleLogin = async (
    e: FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    if (loggingIn) {
      return;
    }

    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      toast.error(
        "Please enter email and password",
      );
      return;
    }

    try {
      setLoggingIn(true);

      const { error } =
        await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

      if (error) {
        throw error;
      }

      toast.success(
        "Login successful",
      );

      navigate({
        to: "/admin",
      });
    } catch (error) {
      console.error(
        "Admin login error:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Could not log in",
      );
    } finally {
      setLoggingIn(false);
    }
  };

  if (loading || user) {
    return (
      <section className="flex min-h-[80vh] items-center justify-center px-6">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-primary border-r-transparent" />

          <p className="mt-4 text-sm text-muted-foreground">
            Checking admin session...
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex min-h-[80vh] items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-xl">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            Administration
          </p>

          <h1 className="mt-2 font-display text-3xl">
            JAN'S Admin
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to manage products
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="admin-email"
              className="text-sm font-medium"
            >
              Email
            </label>

            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
              autoComplete="email"
              disabled={loggingIn}
              className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 outline-none transition focus:border-primary disabled:opacity-60"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="text-sm font-medium"
            >
              Password
            </label>

            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
              autoComplete="current-password"
              disabled={loggingIn}
              className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 outline-none transition focus:border-primary disabled:opacity-60"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loggingIn}
            className="w-full rounded-xl bg-primary py-3 font-bold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loggingIn
              ? "Signing in..."
              : "Login"}
          </button>
        </form>
      </div>
    </section>
  );
}