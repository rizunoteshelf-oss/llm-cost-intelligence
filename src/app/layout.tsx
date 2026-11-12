import type { Metadata } from "next";
import Script from "next/script";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import "./globals.css";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://llm.everydaypdf.me";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "LLM Cost Intelligence — Workload-First API Pricing Calculator",
    template: "%s | LLM Cost Intelligence",
  },
  description:
    "Client-side LLM API cost calculator across 8 providers. Models prompt caching writes & reads, Batch API stacking rules, long-context cliffs, and multi-turn agent scaling.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "LLM Cost Intelligence",
    title: "LLM Cost Intelligence — Workload-First API Pricing Calculator",
    description:
      "Calculate monthly LLM API costs with verified prompt caching, Batch API, long-context tier cliffs, and multi-turn scaling. 100% client-side.",
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
    <html lang="en">
      <body className="flex min-h-screen flex-col antialiased">
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
