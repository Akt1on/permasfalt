import type { ReactNode } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { FloatingContacts } from "@/components/site/FloatingContacts";
import { CookieBanner } from "@/components/site/CookieBanner";
import { ExitIntentPopup } from "@/components/site/ExitIntentPopup";

// Compatibility wrapper — used by legacy pages (uslugi, kontakty, ceny, etc.)
// __root.tsx already provides Header/Footer for all non-admin routes,
// so this component simply renders children to avoid double-rendering.
export function SiteLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
