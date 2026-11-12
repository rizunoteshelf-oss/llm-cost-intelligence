import type { Metadata } from "next";
import Script from "next/script";
import rawRegistry from "@/data/models.json";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import type { PricingRegistry } from "@/lib/pricing/schema";
import "./globals.css";

const registry = rawRegistry as unknown as PricingRegistry;
const providerCount = new Set(registry.models.map((m) => m.provider)).size;

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://llm.everydaypdf.me";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      "LLM API Pricing Calculator & FinOps Cost Simulator (2026)",
    template: "%s | LLM Cost Intelligence",
  },
  description: `FinOps platform modeling real-world LLM API costs with verified prompt caching write/read break-even, 50% Batch API stacking, long-context cliffs, and multi-turn agent growth across ${registry.models.length} models and ${providerCount} providers. 100% private client-side simulation.`,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "LLM Cost Intelligence",
    title:
      "LLM API Pricing Calculator & FinOps Cost Simulator (2026)",
    description:
      "Calculate real monthly LLM API bills with verified prompt caching write/read break-even, Batch API stacking, and multi-turn agent scaling across 20 verified models. 100% client-side FinOps.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const enableAdsense = process.env.NEXT_PUBLIC_ENABLE_ADSENSE === "true";
  const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ?? "";

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function() {
              try {
                var theme = localStorage.getItem('theme');
                if (theme === 'light') {
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {
                document.documentElement.classList.add('dark');
              }
            })();`,
          }}
        />
      </head>
      <body className="flex min-h-screen flex-col bg-[#f1f5f9] dark:bg-[#090D16] text-slate-900 dark:text-slate-100 antialiased selection:bg-emerald-500/20 selection:text-emerald-400">
        {enableAdsense && adsenseClientId ? (
          <Script
            id="adsense-init"
            async
            strategy="afterInteractive"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(
              adsenseClientId,
            )}`}
            crossOrigin="anonymous"
          />
        ) : null}
        <Header />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
