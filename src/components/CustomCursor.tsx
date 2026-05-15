import { useEffect, useRef, useState } from "react";

/**
 * Desktop-only custom cursor: soft amber blur orb that lags behind the pointer.
 * Hidden on touch devices and when prefers-reduced-motion.
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isTouch = window.matchMedia("(hover: none)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const wide = window.matchMedia("(min-width: 1024px)").matches;
    if (isTouch || reduce || !wide) return;

    setEnabled(true);
    document.documentElement.classList.add("custom-cursor-active");

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
      }
    };

    const tick = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(tick);
    };

    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const interactive = !!t.closest("a, button, input, textarea, select, [role=button]");
      if (ringRef.current) {
        ringRef.current.dataset.hover = interactive ? "1" : "0";
      }
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      document.documentElement.classList.remove("custom-cursor-active");
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={ringRef}
        aria-hidden
        data-hover="0"
        className="fixed left-0 top-0 z-[9999] h-10 w-10 rounded-full pointer-events-none mix-blend-screen transition-[width,height,background] duration-200 ease-out"
        style={{
          background: "radial-gradient(circle, rgba(245,166,35,0.35) 0%, rgba(245,166,35,0) 70%)",
          filter: "blur(2px)",
        }}
      />
      <div
        ref={dotRef}
        aria-hidden
        className="fixed left-0 top-0 z-[9999] h-1.5 w-1.5 rounded-full bg-[var(--gold)] pointer-events-none"
      />
    </>
  );
}
