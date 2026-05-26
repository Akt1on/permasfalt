import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Wrench, FolderKanban, Inbox, Settings, LogOut, Menu, X, Newspaper, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";

const items = [
  { to: "/admin", label: "Обзор", icon: LayoutDashboard },
  { to: "/admin/services", label: "Услуги", icon: Wrench },
  { to: "/admin/projects", label: "Портфолио", icon: FolderKanban },
  { to: "/admin/reviews", label: "Отзывы", icon: Star },
  { to: "/admin/posts", label: "Блог", icon: Newspaper },
  { to: "/admin/leads", label: "Заявки", icon: Inbox },
  { to: "/admin/settings", label: "Настройки", icon: Settings },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const nav = useNavigate();
  const { user, isAdmin, loading } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [path]);

  useEffect(() => {
    if (!loading && !user) nav({ to: "/auth" });
  }, [loading, user, nav]);

  if (loading) return <div className="min-h-screen grid place-items-center text-muted-foreground">Загрузка…</div>;
  if (!user) return null;
  if (!isAdmin) return (
    <div className="min-h-screen grid place-items-center px-4 text-center">
      <div className="glass rounded-2xl p-8 max-w-md">
        <h2 className="font-display text-2xl font-bold mb-2">Доступ запрещён</h2>
        <p className="text-sm text-muted-foreground mb-4">Этот аккаунт не имеет прав администратора.</p>
        <button onClick={async () => { await supabase.auth.signOut(); nav({ to: "/" }); }} className="btn-gold rounded-lg px-5 py-2.5 font-semibold">На главную</button>
      </div>
    </div>
  );

  const Nav = (
    <>
      <Link to="/" className="font-display font-bold text-lg mb-8 block">ПЕРМЬ АСФАЛЬТ <span className="text-gradient-gold">59</span></Link>
      <nav className="flex-1 space-y-1">
        {items.map((it) => {
          const active = path === it.to;
          return (
            <Link key={it.to} to={it.to} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${active ? "bg-primary text-primary-foreground" : "hover:bg-surface-2"}`}>
              <it.icon className="h-4 w-4" /> {it.label}
            </Link>
          );
        })}
      </nav>
      <button onClick={async () => { await supabase.auth.signOut(); nav({ to: "/auth" }); }} className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm hover:bg-surface-2 text-muted-foreground w-full mt-4">
        <LogOut className="h-4 w-4" /> Выйти
      </button>
    </>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 border-r border-border bg-surface p-5 flex-col">
        {Nav}
      </aside>

      {/* Mobile topbar */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-40 h-14 border-b border-border bg-surface/95 backdrop-blur flex items-center justify-between px-4">
        <Link to="/" className="font-display font-bold text-base">ПЕРМЬ АСФАЛЬТ <span className="text-gradient-gold">59</span></Link>
        <button onClick={() => setOpen(true)} aria-label="Меню" className="p-2 rounded-lg hover:bg-surface-2"><Menu className="h-5 w-5" /></button>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-background/80 backdrop-blur" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-surface border-r border-border p-5 flex flex-col animate-in slide-in-from-left">
            <button onClick={() => setOpen(false)} aria-label="Закрыть" className="absolute top-3 right-3 p-2 rounded-lg hover:bg-surface-2"><X className="h-5 w-5" /></button>
            {Nav}
          </aside>
        </div>
      )}

      <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 overflow-auto w-full min-w-0">{children}</main>
    </div>
  );
}
