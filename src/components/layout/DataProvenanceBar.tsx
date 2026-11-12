"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, ShieldCheck, Sparkles } from "lucide-react";
import { ProvenanceModal } from "./ProvenanceModal";

interface DataProvenanceBarProps {
  modelCount?: number;
  providerCount?: number;
  registryUpdatedAt?: string;
  className?: string;
}

export function DataProvenanceBar({
  modelCount = 20,
  providerCount = 8,
  registryUpdatedAt = "2026-11-12",
  className = "",
}: DataProvenanceBarProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div
        className={`flex flex-wrap items-center gap-2 text-xs ${className}`}
      >
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="group inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 font-mono text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 transition-all hover:border-emerald-500/40 hover:bg-emerald-500/15 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          title="Click to view verified provider audit dates & documentation"
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>
            {modelCount} Verified Models · {providerCount} Providers
          </span>
          <ChevronRight className="h-3 w-3 text-emerald-500/70 transition-transform group-hover:translate-x-0.5" />
        </button>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111827] px-3 py-1 font-mono text-[11px] font-medium text-slate-600 dark:text-slate-300 transition-colors hover:border-slate-300 dark:hover:border-white/20 hover:text-slate-900 dark:hover:text-white"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Pricing Verified {registryUpdatedAt}</span>
        </button>

        <Link
          href="/methodology/"
          className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors ml-1"
        >
          <Sparkles className="h-3 w-3" />
          <span>Audit Formulas &amp; Sources →</span>
        </Link>
      </div>

      <ProvenanceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        registryUpdatedAt={registryUpdatedAt}
      />
    </>
  );
}
