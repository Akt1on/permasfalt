import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Seo } from "@/components/Seo";
import { Loader2, LogIn, Shield, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/admin/login")({
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: "/admin" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка авторизации");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Seo title="Вход в админ-панель" noindex />
      <div className="w-full max-w-md">
        <Link to="/" className="block text-center text-xs uppercase tracking-[0.3em] text-muted-foreground mb-6 hover:text-[var(--gold)] transition">
          ← На сайт
        </Link>
        <div className="rounded-2xl border border-border bg-surface-1 p-7 shadow-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-gradient-gold grid place-items-center">
              <Shield className="h-5 w-5 text-background" />
            </div>
            <div>
              <h1 className="font-display text-xl tracking-wide">Админ-панель</h1>
              <p className="text-xs text-muted-foreground">Пермь Асфальт 59</p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg bg-surface-2 border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--gold)]"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-lg bg-surface-2 border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--gold)]"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
              />
            </div>
            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-gold px-5 py-3 text-sm font-bold uppercase tracking-wider text-background shadow-gold disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
              {mode === "signup" ? "Зарегистрироваться" : "Войти"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); }}
            className="mt-4 w-full text-xs text-muted-foreground hover:text-foreground transition"
          >
            {mode === "signin" ? "Нет аккаунта? Зарегистрироваться" : "Уже есть аккаунт? Войти"}
          </button>

          <p className="mt-5 text-[11px] text-center text-muted-foreground/70">
            Первый зарегистрированный пользователь автоматически получит права администратора.
          </p>
        </div>
      </div>
    </div>
  );
}
