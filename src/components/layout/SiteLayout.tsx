import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { FloatingContactButton } from "./FloatingContactButton";
import { CookieBanner } from "./CookieBanner";
import { CustomCursor } from "@/components/CustomCursor";
import { ExitIntentPopup } from "@/components/ExitIntentPopup";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden">
      <Header />
      <main className="flex-1 pt-20">{children}</main>
      <Footer />
      <FloatingContactButton />
      <CookieBanner />
      <CustomCursor />
      <ExitIntentPopup />
    </div>
  );
}
