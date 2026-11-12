"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, ExternalLink, ShieldCheck, X } from "lucide-react";

interface ProviderAuditEntry {
  provider: string;
  displayName: string;
  endpoint: string;
  lastVerifiedDate: string;
  officialSourceUrl: string;
  modelsCount: number;
}

const PROVIDER_AUDIT_DATA: ProviderAuditEntry[] = [
  {
    provider: "openai",
    displayName: "OpenAI",
    endpoint: "api.openai.com",
    lastVerifiedDate: "2026-11-12",
    officialSourceUrl: "https://openai.com/api/pricing/",
    modelsCount: 4,
  },
  {
    provider: "anthropic",
    displayName: "Anthropic",
    endpoint: "api.anthropic.com",
    lastVerifiedDate: "2026-11-12",
    officialSourceUrl: "https://www.anthropic.com/pricing",
    modelsCount: 3,
  },
  {
    provider: "google",
    displayName: "Google Gemini",
    endpoint: "generativelanguage.googleapis.com",
    lastVerifiedDate: "2026-11-12",
    officialSourceUrl: "https://ai.google.dev/pricing",
    modelsCount: 3,
  },
  {
    provider: "deepseek",
    displayName: "DeepSeek",
    endpoint: "api.deepseek.com",
    lastVerifiedDate: "2026-11-12",
    officialSourceUrl: "https://api-docs.deepseek.com/quick_start/pricing",
    modelsCount: 2,
  },
  {
    provider: "mistral",
    displayName: "Mistral AI",
    endpoint: "api.mistral.ai",
    lastVerifiedDate: "2026-11-12",
    officialSourceUrl: "https://mistral.ai/technology/#pricing",
    modelsCount: 2,
  },
  {
    provider: "groq",
    displayName: "Groq",
    endpoint: "api.groq.com",
    lastVerifiedDate: "2026-11-12",
    officialSourceUrl: "https://groq.com/pricing/",
    modelsCount: 2,
  },
  {
    provider: "together",
    displayName: "Together AI",
    endpoint: "api.together.xyz",
    lastVerifiedDate: "2026-11-12",
    officialSourceUrl: "https://www.together.ai/pricing",
    modelsCount: 2,
  },
  {
    provider: "bedrock",
    displayName: "Amazon Bedrock",
    endpoint: "bedrock-runtime.amazonaws.com",
    lastVerifiedDate: "2026-11-12",
    officialSourceUrl: "https://aws.amazon.com/bedrock/pricing/",
    modelsCount: 2,
  },
];

interface ProvenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  registryUpdatedAt: string;
}

export function ProvenanceModal({
  isOpen,
  onClose,
  registryUpdatedAt,
}: ProvenanceModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="provenance-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Surface */}
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111827] p-6 shadow-2xl transition-all sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 dark:text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3
                id="provenance-title"
                className="text-lg font-bold text-slate-900 dark:text-white"
              >
                Data Provenance &amp; Verification
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Institutional audit timestamps across 8 tracked providers
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-2 font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Zero Scraping · Manual Official Audit</span>
            </div>
            <p className="mt-1 leading-relaxed text-slate-600 dark:text-slate-400">
              Every rate card, prompt caching threshold, Batch API policy, and
              long-context cliff is directly cross-checked against official
              documentation. Registry last certified on{" "}
              <strong className="font-mono text-slate-900 dark:text-white">
                {registryUpdatedAt}
              </strong>
              .
            </p>
          </div>

          {/* Provider List */}
          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-white/10">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/60 font-semibold text-slate-600 dark:text-slate-400">
                <tr>
                  <th className="px-3.5 py-2.5">Provider &amp; Endpoint</th>
                  <th className="px-3 py-2.5">Models</th>
                  <th className="px-3 py-2.5">Verified Date</th>
                  <th className="px-3.5 py-2.5 text-right">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-mono text-[11px]">
                {PROVIDER_AUDIT_DATA.map((entry) => (
                  <tr
                    key={entry.provider}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-3.5 py-2.5">
                      <div className="font-sans font-semibold text-slate-900 dark:text-slate-100">
                        {entry.displayName}
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500">
                        {entry.endpoint}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 tabular-nums text-slate-600 dark:text-slate-300">
                      {entry.modelsCount} models
                    </td>
                    <td className="px-3 py-2.5 text-emerald-600 dark:text-emerald-400 font-medium">
                      {entry.lastVerifiedDate}
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-sans">
                      <a
                        href={entry.officialSourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors"
                      >
                        <span>Official Docs</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/methodology/"
              onClick={onClose}
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
            >
              Read Full Methodology &amp; Mathematical Formulas →
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
