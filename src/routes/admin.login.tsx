import {
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";
import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/useAuth";

export const Route = createFileRoute("/admin/login")({
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();

  const { user, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] =
    useState(false);
  const [loggingIn, setLoggingIn] =
    useState(false);
  const [sendingReset, setSendingReset] =
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

      toast.success("Login successful");

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

  const handleForgotPassword = async () => {
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      toast.error(
        "Please enter your email first",
      );
      return;
    }

    try {
      setSendingReset(true);

      const { error } =
        await supabase.auth.resetPasswordForEmail(
          cleanEmail,
          {
            redirectTo: `${window.location.origin}/admin/reset-password`,
          },
        );

      if (error) {
        throw error;
      }

      toast.success(
        "If an account exists for this email, a reset link has been sent.",
      );
    } catch (error) {
      console.error(
        "Password reset request error:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Could not send reset email",
      );
    } finally {
      setSendingReset(false);
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
              disabled={loggingIn || sendingReset}
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

            <div className="relative">
              <input
                id="admin-password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
                autoComplete="current-password"
                disabled={loggingIn || sendingReset}
                className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 pr-12 outline-none transition focus:border-primary disabled:opacity-60"
                placeholder="Enter your password"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (prev) => !prev,
                  )
                }
                disabled={loggingIn || sendingReset}
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                className="absolute right-4 top-1/2 mt-1 -translate-y-1/2 text-muted-foreground transition hover:text-foreground disabled:opacity-50"
              >
                {showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>

            <div className="mt-2 text-right">
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={sendingReset || loggingIn}
                className="text-sm font-medium text-primary transition hover:underline disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sendingReset
                  ? "Sending reset link..."
                  : "Forgot Password?"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loggingIn || sendingReset}
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