import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    const applySession = (sess: Session | null) => {
      if (!alive) return;
      setSession(sess);
      setUser(sess?.user ?? null);
      setLoading(false);
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, sess) => {
      setTimeout(() => applySession(sess), 0);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      applySession(session);
    });

    return () => { alive = false; sub.subscription.unsubscribe(); };
  }, []);

  // Only whitelisted email gets admin access
  const ADMIN_EMAIL = "permsite1@gmail.com";
  const isAdmin = !!user && user.email === ADMIN_EMAIL;

  return { session, user, isAdmin, loading };
}
