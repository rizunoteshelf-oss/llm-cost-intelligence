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
    default:
      "LLM API Pricing Calculator 2026 - Claude 3.5 Sonnet, GPT-4o, DeepSeek V3 & Gemini 2.0",
    template: "%s | LLM Cost Intelligence",
  },
  description:
    "Free client-side LLM API pricing calculator modeling real-world prompt caching write/read break-even, Batch API discount stacking (up to 50% off), long-context cliffs, and multi-turn agent growth across 20 models and 8 providers.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "LLM Cost Intelligence",
    title:
      "LLM API Pricing Calculator 2026 - Claude 3.5 Sonnet, GPT-4o, DeepSeek V3 & Gemini 2.0",
    description:
      "Calculate real monthly LLM API bills with verified prompt caching write/read break-even, Batch API stacking, and multi-turn agent scaling. 100% client-side FinOps.",
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
