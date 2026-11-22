import { Menu, X } from "lucide-react";
import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
} from "react";
import { Link, NavLink, useLocation } from "react-router";
import { buttonClasses } from "@/components/ui/button-styles";
import { useSiteContent } from "@/app/site-content";
import { contactNavItem, primaryNav } from "@/content/site";
import { displayName } from "@/lib/display";
import { cn } from "@/lib/cn";

function subscribeToScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

function useScrolled(threshold = 8): boolean {
  return useSyncExternalStore(
    subscribeToScroll,
    () => window.scrollY > threshold,
    () => false,
  );
}

const desktopLink = ({ isActive }: { isActive: boolean }) =>
  cn(
    "font-display text-[0.9rem] font-medium no-underline transition-colors duration-150",
    isActive ? "text-fg" : "text-muted hover:text-fg",
  );

export function Navbar() {
  const { profile } = useSiteContent();
  const scrolled = useScrolled();
  const { pathname } = useLocation();
  // The menu is open only for the path it was opened on, so any navigation
  // (link click, back button) closes it without an effect.
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const open = openedAt === pathname;

  const menuId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = (returnFocus = false) => {
    setOpenedAt(null);
    if (returnFocus) toggleRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>("a")?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!open) return;
    if (event.key === "Escape") {
      event.preventDefault();
      close(true);
      return;
    }
    if (event.key !== "Tab" || !panelRef.current) return;
    // Keep focus inside the open menu (toggle button + panel links).
    const focusable = [
      toggleRef.current,
      ...panelRef.current.querySelectorAll<HTMLElement>("a"),
    ].filter((el): el is HTMLElement => el !== null);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  };

  return (
    // `contents` keeps the header sticky relative to <body> while one handler
    // traps focus across the toggle button and the menu panel.
    <div className="contents" onKeyDown={onKeyDown}>
      <header
        className={cn(
          "sticky top-0 z-40 border-b transition-colors duration-150",
          scrolled || open
            ? "border-line bg-canvas/90 backdrop-blur-md"
            : "border-transparent bg-transparent",
        )}
      >
        <div className="container-page flex h-16 items-center justify-between gap-6">
          <Link
            to="/"
            className="font-display text-[1.05rem] font-semibold tracking-tight whitespace-nowrap text-fg no-underline"
          >
            {displayName(profile)}
            <span className="text-primary-text">.</span>
          </Link>

          <nav aria-label="Primary" className="hidden md:block">
            <ul className="flex items-center gap-7">
              {primaryNav.map((item) => (
                <li key={item.to}>
                  <NavLink to={item.to} className={desktopLink}>
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <Link to={contactNavItem.to} className={buttonClasses("primary", "max-md:hidden")}>
              {contactNavItem.label}
            </Link>
            <button
              ref={toggleRef}
              type="button"
              className={buttonClasses("secondary", "px-3 md:hidden")}
              aria-expanded={open}
              aria-controls={menuId}
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => (open ? close() : setOpenedAt(pathname))}
            >
              {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>

      <div
        id={menuId}
        ref={panelRef}
        hidden={!open}
        className="fixed inset-x-0 top-16 bottom-0 z-30 border-t border-line bg-canvas md:hidden"
      >
        <nav aria-label="Mobile" className="container-page py-8">
          <ul className="flex flex-col gap-1">
            {[...primaryNav, contactNavItem].map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  onClick={() => close()}
                  className={({ isActive }) =>
                    cn(
                      "block border-b border-line py-4 font-display text-2xl font-medium no-underline",
                      isActive ? "text-fg" : "text-fg-secondary hover:text-fg",
                    )
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
