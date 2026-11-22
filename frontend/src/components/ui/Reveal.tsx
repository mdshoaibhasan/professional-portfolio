import { useEffect, useRef, type ReactNode } from "react";

/**
 * Fades content in once when it scrolls into view (DESIGN_SYSTEM §5).
 * Not for above-the-fold content. Reduced motion removes the movement (see index.css).
 */
export function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (!("IntersectionObserver" in window)) {
      element.dataset.reveal = "visible";
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          element.dataset.reveal = "visible";
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} data-reveal="" className={className}>
      {children}
    </div>
  );
}
