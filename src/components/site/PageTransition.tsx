import { LazyMotion, domAnimation, AnimatePresence, m } from "framer-motion";
import type { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  /** Current route path — used as animation key. 
   *  When path changes, the exit animation plays before the new page enters. */
  path: string;
}

export function PageTransition({ children, path }: PageTransitionProps) {
  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence mode="wait" initial={false}>
        <m.div
          key={path}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{
            duration: 0.28,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="min-h-[calc(100vh-6rem)] will-change-transform"
        >
          {children}
        </m.div>
      </AnimatePresence>
    </LazyMotion>
  );
}
