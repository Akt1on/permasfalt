import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useAuth() {
  const [user, setUser]       = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    const checkAdmin = async (u: User | null) => {
      if (!u) { if (alive) { setIsAdmin(false); setLoading(false); } return; }
      // Primary: RPC is_admin() — email-based check in DB (migration 20260524000003)
      const { data, error } = await supabase.rpc("is_admin");
      const admin = !error && data === true;
      if (alive) { setIsAdmin(admin); setLoading(false); }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_evt, sess) => {
      const u = sess?.user ?? null;
      if (alive) setUser(u);
      checkAdmin(u);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      if (alive) setUser(u);
      checkAdmin(u);
    });

    return () => { alive = false; subscription.unsubscribe(); };
  }, []);

  return { user, isAdmin, loading };
}
