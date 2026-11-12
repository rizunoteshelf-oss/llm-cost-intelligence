import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Zero-Transmission Privacy Policy",
  description:
    "All token estimates, cost calculations, and CSV/PDF quote exports execute 100% locally in your browser with zero server transmission.",
  alternates: {
    canonical: "/privacy/",
  },
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-3">
        <p className="text-xs font-semibold tracking-wider text-emerald-600 dark:text-emerald-400 font-mono uppercase">
          Privacy Architecture
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl font-sans">
          Zero-Transmission Local Execution
        </h1>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          LLM Cost Intelligence is compiled as a pure static site with zero
          application servers, zero databases, and zero backend logging.
        </p>
      </header>

      <section className="space-y-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111827] p-6 text-sm leading-relaxed text-slate-700 dark:text-slate-300 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          1. Prompt Text &amp; Workload Inputs Never Leave Your Browser
        </h2>
        <p>
          When you paste sample prompts into the local Token Estimator Drawer,
          adjust token sliders, or export CSV/PDF quotes, every computation runs
          in local JavaScript memory inside your browser tab. Zero prompt text,
          token counts, or quote figures are transmitted to our servers or third
          parties.
        </p>
        <p>
          Calculator parameters are reflected in your browser&apos;s URL query
          string strictly on your device so you can bookmark or share scenarios.
        </p>
      </section>

      <section className="space-y-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111827] p-6 text-sm leading-relaxed text-slate-700 dark:text-slate-300 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          2. Static Hosting &amp; Advertising Notice
        </h2>
        <p>
          This site is delivered via Cloudflare Pages static edge caching.
          Standard web server edge logs (such as IP address and requested path)
          may be processed transiently by Cloudflare for DDoS protection and
          caching.
        </p>
        <p>
          When Google AdSense is enabled on our standalone custom domain, Google
          and its partners may use cookies or local storage solely to serve and
          measure advertisements in editorial zones, subject to Google&apos;s
          Privacy &amp; Terms. Ad scripts never read calculator inputs or local
          prompt text.
        </p>
      </section>

      <div>
        <Link
          href="/"
          className="inline-block rounded-lg bg-slate-900 dark:bg-white px-4 py-2 text-xs font-semibold text-white dark:text-slate-900 hover:bg-slate-800 transition-colors"
        >
          Return to Calculator
        </Link>
      </div>
    </article>
  );
}
