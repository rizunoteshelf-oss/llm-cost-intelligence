"use client";

import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Cpu,
  FileText,
  Lock,
  Sparkles,
  Zap,
} from "lucide-react";
import { estimateTokens } from "@/lib/tokenizer/estimate";

interface TokenEstimatorDrawerProps {
  onApplyToPrefix: (tokens: number) => void;
  onApplyToDynamic: (tokens: number) => void;
}

export function TokenEstimatorDrawer({
  onApplyToPrefix,
  onApplyToDynamic,
}: TokenEstimatorDrawerProps) {
  const [open, setOpen] = useState(false);
  const [sampleText, setSampleText] = useState("");

  const estimate = useMemo(() => estimateTokens(sampleText), [sampleText]);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-[#111827]/80 overflow-hidden transition-all">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-slate-100/70 dark:hover:bg-white/[0.03]"
      >
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Cpu className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white sm:text-sm">
                Estimate Tokens from Sample Prompt or Document
              </span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                0 KB LOCAL
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Paste instructions, schema, or text to measure real token count locally
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 sm:inline-flex">
            <Lock className="h-3 w-3" />
            100% Client-Side WASM/JS — Zero Data Leaves Browser
          </span>
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300">
            {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </div>
      </button>

      {open && (
        <div className="border-t border-slate-200 dark:border-white/10 p-4 space-y-4 bg-white dark:bg-[#0D1424]">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <label
              htmlFor="local-token-sample"
              className="font-medium text-slate-700 dark:text-slate-300"
            >
              Paste system instructions, JSON schema, or sample document context below:
            </label>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
              <Lock className="h-3 w-3" />
              100% Client-Side WASM/JS — Zero Data Leaves Browser
            </span>
          </div>

          <textarea
            id="local-token-sample"
            rows={4}
            value={sampleText}
            onChange={(e) => setSampleText(e.target.value)}
            placeholder="Paste prompt text, code snippet, or document chunk here to estimate token count locally in browser RAM..."
            className="w-full rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-[#161F30] p-3 font-mono text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
          />

          <div className="grid gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.02] p-3">
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Estimated Tokens
              </div>
              <div className="mt-1 font-mono text-lg font-bold text-slate-900 dark:text-white tabular-nums">
                {estimate.estimatedTokens.toLocaleString("en-US")}
              </div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 tabular-nums">
                Range: {estimate.rangeLow.toLocaleString("en-US")}–
                {estimate.rangeHigh.toLocaleString("en-US")}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.02] p-3">
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Claude 4.7+ Approx (~1.3x)
              </div>
              <div className="mt-1 font-mono text-lg font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                ~{estimate.claude47PlusApproxTokens.toLocaleString("en-US")}
              </div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500">
                Newer Claude tokenizer shift
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.02] p-3">
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Characters / Words
              </div>
              <div className="mt-1 font-mono text-sm font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                {estimate.characters.toLocaleString("en-US")} /{" "}
                {estimate.words.toLocaleString("en-US")}
              </div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500">
                Mode:{" "}
                {estimate.contentKind === "code_or_structured"
                  ? "Code / JSON"
                  : "English Prose"}
              </div>
            </div>

            <div className="flex flex-col justify-center gap-2">
              <button
                type="button"
                disabled={estimate.estimatedTokens === 0}
                onClick={() => onApplyToPrefix(estimate.estimatedTokens)}
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-emerald-500 disabled:opacity-40"
              >
                Apply to Prefix
              </button>
              <button
                type="button"
                disabled={estimate.estimatedTokens === 0}
                onClick={() => onApplyToDynamic(estimate.estimatedTokens)}
                className="rounded-lg border border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors hover:bg-slate-200 dark:hover:bg-white/10 disabled:opacity-40"
              >
                Apply to Dynamic Input
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
