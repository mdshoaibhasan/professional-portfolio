import { Outlet, ScrollRestoration } from "react-router";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { SkipLink } from "@/components/layout/SkipLink";
import { ConsentBanner } from "@/features/consent/ConsentBanner";
import { ConsentProvider } from "@/features/consent/ConsentContext";

export function RootLayout() {
  return (
    <ConsentProvider>
      <div className="flex min-h-dvh flex-col">
        <SkipLink />
        <Navbar />
        <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
          <Outlet />
        </main>
        <Footer />
        <ScrollRestoration />
      </div>
      <ConsentBanner />
    </ConsentProvider>
  );
}
