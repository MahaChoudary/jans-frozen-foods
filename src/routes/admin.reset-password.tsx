import {
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase";

export const Route = createFileRoute(
  "/admin/reset-password",
)({
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [updating, setUpdating] = useState(false);

  const handleUpdatePassword = async () => {
    if (!password || !confirmPassword) {
      toast.error("Please enter both password fields");
      return;
    }

    if (password.length < 6) {
      toast.error(
        "Password must be at least 6 characters",
      );
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setUpdating(true);

      const { error } =
        await supabase.auth.updateUser({
          password,
        });

      if (error) {
        throw error;
      }

      toast.success(
        "Password updated successfully",
      );

      await supabase.auth.signOut();

      navigate({
        to: "/admin/login",
      });
    } catch (error) {
      console.error(
        "Password update error:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Could not update password",
      );
    } finally {
      setUpdating(false);
    }
  };

  return (
    <section className="flex min-h-[80vh] items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-xl">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            Administration
          </p>

          <h1 className="mt-2 font-display text-3xl">
            Reset Password
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Enter your new admin password
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label
              htmlFor="new-password"
              className="text-sm font-medium"
            >
              New Password
            </label>

            <div className="relative">
              <input
                id="new-password"
                type={
                  showPassword ? "text" : "password"
                }
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 pr-12 outline-none transition focus:border-primary"
                placeholder="Enter new password"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword((prev) => !prev)
                }
                className="absolute right-4 top-1/2 mt-1 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="confirm-password"
              className="text-sm font-medium"
            >
              Confirm Password
            </label>

            <div className="relative">
              <input
                id="confirm-password"
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 pr-12 outline-none transition focus:border-primary"
                placeholder="Confirm new password"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    (prev) => !prev,
                  )
                }
                className="absolute right-4 top-1/2 mt-1 -translate-y-1/2 text-muted-foreground"
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleUpdatePassword}
            disabled={updating}
            className="w-full rounded-xl bg-primary py-3 font-bold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
          >
            {updating
              ? "Updating..."
              : "Update Password"}
          </button>
        </div>
      </div>
    </section>
  );
}