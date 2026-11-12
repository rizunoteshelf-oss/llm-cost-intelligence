import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About & Editorial Disclosures",
  description:
    "About LLM Cost Intelligence: independent engineering ownership, pricing verification standards, and transparent monetization disclosures.",
  alternates: {
    canonical: "/about/",
  },
};

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-3">
        <p className="text-xs font-semibold tracking-wider text-emerald-600 dark:text-emerald-400 font-mono uppercase">
          About &amp; Transparency
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl font-sans">
          Independent LLM FinOps Tooling
        </h1>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          LLM Cost Intelligence is built and maintained by an independent
          student software engineer in India as a zero-infrastructure,
          privacy-preserving developer utility.
        </p>
      </header>

      <section className="space-y-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111827] p-6 text-sm leading-relaxed text-slate-700 dark:text-slate-300 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Editorial &amp; Pricing Verification Standard
        </h2>
        <p>
          Every rate card, caching threshold, batch discount exception, and
          long-context price tier in our registry is manually audited against
          official provider pricing pages and stamped with a{" "}
          <code className="font-mono bg-slate-100 dark:bg-white/10 px-1 py-0.5 rounded text-emerald-600 dark:text-emerald-400">lastVerifiedDate</code> and direct{" "}
          <code className="font-mono bg-slate-100 dark:bg-white/10 px-1 py-0.5 rounded text-cyan-600 dark:text-cyan-400">officialSourceUrl</code>. We do not scrape unverified community
          spreadsheets or assume flat 50% batch discounts across providers.
        </p>
      </section>

      <section className="space-y-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111827] p-6 text-sm leading-relaxed text-slate-700 dark:text-slate-300 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Monetization &amp; Affiliate Disclosure
        </h2>
        <p>
          To keep this calculator 100% free with zero paywalls or accounts, the
          site may display clearly labeled editorial advertisements (Google
          AdSense) separated from interactive calculator controls.
        </p>
        <p>
          If future versions include cloud or developer infrastructure referral
          links, those links will be explicitly labeled as{" "}
          <strong className="text-slate-900 dark:text-white">Partner / Affiliate Links</strong> (
          <code>rel=&quot;sponsored nofollow noopener&quot;</code>) and will
          never influence model cost sorting or benchmark calculations.
        </p>
      </section>

      <div className="flex flex-wrap gap-3 text-xs font-semibold">
        <Link
          href="/"
          className="rounded-lg bg-slate-900 dark:bg-white px-4 py-2 text-white dark:text-slate-900 hover:bg-slate-800 transition-colors"
        >
          Open Cost Calculator
        </Link>
        <Link
          href="/methodology/"
          className="rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-[#161F30] px-4 py-2 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors"
        >
          View Methodology
        </Link>
      </div>
    </article>
  );
}
