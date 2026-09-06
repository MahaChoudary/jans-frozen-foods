import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

import { supabase } from "./supabase";

export function useAuth() {
  const [user, setUser] = useState<User | null>(
    null,
  );

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (!active) {
          return;
        }

        setUser(session?.user ?? null);
      } catch (error) {
        console.error(
          "Auth session error:",
          error,
        );

        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!active) {
          return;
        }

        setUser(session?.user ?? null);
        setLoading(false);
      },
    );

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    loading,
  };
}