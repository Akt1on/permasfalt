import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useId, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({ component: AuthPage });

function AuthPage() {
  const nav = useNavigate();
  const uid = useId();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs before hitting the server
    if (!email.trim() || !password) {
      toast.error("Введите логин и пароль");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);

    if (error) {
      // Generic error message — don't reveal whether the account exists
      toast.error("Неверный логин или пароль");
      return;
    }

    toast.success("Вход выполнен");
    nav({ to: "/admin" });
  };

  return (
    <div
      className="min-h-[80vh] grid place-items-center px-4"
      aria-labelledby="auth-heading"
    >
      <div className="bg-white rounded-2xl border border-border shadow-[var(--shadow-elevated)] p-8 w-full max-w-md card-accent-top">
        <h1
          id="auth-heading"
          className="font-display text-3xl font-bold mb-1"
        >
          Вход
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          Доступ к административной панели
        </p>

        <form onSubmit={submit} className="grid gap-3" noValidate>
          <div>
            <label htmlFor={`${uid}-email`} className="sr-only">
              E-mail
            </label>
            <input
              id={`${uid}-email`}
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-mail администратора"
              className="w-full bg-input border border-border rounded-lg px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 transition-all"
              aria-label="E-mail"
            />
          </div>

          <div>
            <label htmlFor={`${uid}-password`} className="sr-only">
              Пароль
            </label>
            <input
              id={`${uid}-password`}
              type="password"
              required
              minLength={6}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Пароль"
              className="w-full bg-input border border-border rounded-lg px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 transition-all"
              aria-label="Пароль"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-gold rounded-lg px-6 py-3 font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Вход…
              </span>
            ) : (
              "Войти"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
