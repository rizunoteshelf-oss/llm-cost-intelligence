import Link from "next/link";
import rawRegistry from "@/data/models.json";
import type { PricingRegistry } from "@/lib/pricing/schema";
import { FinOpsEmblem } from "./FinOpsEmblem";

const registry = rawRegistry as unknown as PricingRegistry;

export function Footer() {
  return (
    <footer className="no-print mt-20 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#090D16] text-slate-600 dark:text-slate-400 transition-colors">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Brand & Privacy Guarantee */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <FinOpsEmblem className="h-7 w-7" />
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                LLM Cost Intelligence
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Zero-server LLM API cost modeling and cache break-even simulation
              across 8 providers. All calculations and exports execute 100% locally
              in browser memory.
            </p>

            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1 font-mono text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Zero Data Leaves Browser
              </span>
            </div>
          </div>

          {/* Featured Models */}
          <div>
            <p className="text-xs font-semibold tracking-wider text-slate-900 dark:text-slate-200 uppercase">
              Models &amp; Rate Cards
            </p>
            <ul className="mt-3.5 space-y-2 text-xs">
              <li>
                <Link
                  href="/models/"
                  className="font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
                >
                  All {registry.models.length} Models Directory →
                </Link>
              </li>
              <li>
                <Link
                  href="/models/claude-3-5-sonnet-latest/"
                  className="hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Claude 3.5 Sonnet Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/models/gpt-4o/"
                  className="hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  GPT-4o &amp; GPT-4o mini Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/models/deepseek-chat/"
                  className="hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  DeepSeek-V3 &amp; R1 Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/models/gemini-2-0-flash/"
                  className="hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Gemini 2.0 Flash Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/models/llama-3-3-70b-groq/"
                  className="hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Llama 3.3 70B (Groq) Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Workload Benchmarks & Guides */}
          <div>
            <p className="text-xs font-semibold tracking-wider text-slate-900 dark:text-slate-200 uppercase">
              Workloads &amp; Guides
            </p>
            <ul className="mt-3.5 space-y-2 text-xs">
              <li>
                <Link
                  href="/compare/rag-qa/"
                  className="hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  RAG Q&amp;A Workload Guide
                </Link>
              </li>
              <li>
                <Link
                  href="/compare/code-generation/"
                  className="hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Code Generation &amp; Agent Costs
                </Link>
              </li>
              <li>
                <Link
                  href="/compare/document-summarization/"
                  className="hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Document Summarization (Batch API)
                </Link>
              </li>
              <li>
                <Link
                  href="/compare/support-agent/"
                  className="hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Multi-Turn Support Agent Costs
                </Link>
              </li>
              <li>
                <Link
                  href="/guides/prompt-caching-write-vs-read-breakeven/"
                  className="hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Prompt Caching Break-Even Guide
                </Link>
              </li>
              <li>
                <Link
                  href="/guides/batch-api-stacking-rules/"
                  className="hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Batch API Stacking Rules 2026
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust, Methodology & Ecosystem */}
          <div>
            <p className="text-xs font-semibold tracking-wider text-slate-900 dark:text-slate-200 uppercase">
              Methodology &amp; Standards
            </p>
            <ul className="mt-3.5 space-y-2 text-xs">
              <li>
                <Link
                  href="/methodology/"
                  className="font-medium text-slate-900 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                  Mathematical Formulas &amp; Citations
                </Link>
              </li>
              <li>
                <Link
                  href="/about/"
                  className="hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  About &amp; Editorial Standards
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy/"
                  className="hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Privacy Policy (Zero Telemetry)
                </Link>
              </li>
            </ul>

            {/* Clean, subtle Everyday Suite Ecosystem Attribution in Footer */}
            <div className="mt-6 border-t border-slate-200 dark:border-white/10 pt-4">
              <p className="text-[11px] font-semibold tracking-wider text-slate-700 dark:text-slate-300 uppercase">
                Everyday Suite
              </p>
              <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
                Developer tools by Rizwan Khan:
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <a
                  href="https://everydaypdf.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  EverydayPDF (52+ PDF Tools) ↗
                </a>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <a
                  href="https://cut.everydaypdf.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  EverydayCut (Photo Studio) ↗
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-200 dark:border-white/10 pt-6 text-[11px] text-slate-500 dark:text-slate-500 sm:flex-row">
          <p>
            © 2026 LLM Cost Intelligence · Pricing verified {registry.registryUpdatedAt} against official provider documentation.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/methodology/" className="hover:underline">
              Formulas
            </Link>
            <Link href="/about/" className="hover:underline">
              Disclosures
            </Link>
            <Link href="/privacy/" className="hover:underline">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
