"use client";

import { useMemo, useState } from "react";
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
    <div className="rounded-xl border border-slate-200 bg-slate-50/70">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-xs font-semibold text-slate-800 hover:bg-slate-100/80 sm:text-sm"
      >
        <span className="flex items-center gap-2">
          <span className="inline-block rounded bg-emerald-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-emerald-800">
            0 KB LOCAL
          </span>
          Estimate Tokens from Sample Prompt or Document
        </span>
        <span className="font-mono text-xs text-slate-500">
          {open ? "Hide −" : "Open +"}
        </span>
      </button>

      {open && (
        <div className="border-t border-slate-200 px-4 py-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
            <label htmlFor="local-token-sample" className="font-medium">
              Paste system instructions, JSON schema, or sample context below:
            </label>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
              100% Client-Side · Zero Data Leaves Browser
            </span>
          </div>

          <textarea
            id="local-token-sample"
            rows={4}
            value={sampleText}
            onChange={(e) => setSampleText(e.target.value)}
            placeholder="Paste prompt text, code snippet, or document chunk here to estimate token count locally in browser RAM..."
            className="w-full rounded-lg border border-slate-300 bg-white p-3 font-mono text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none"
          />

          <div className="grid gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-slate-200 bg-white p-2.5">
              <div className="text-[11px] text-slate-500">Estimated Tokens</div>
              <div className="mt-0.5 font-mono text-base font-bold text-slate-900 tabular-nums">
                {estimate.estimatedTokens.toLocaleString("en-US")}
              </div>
              <div className="text-[10px] text-slate-500 tabular-nums">
                Range: {estimate.rangeLow.toLocaleString("en-US")}–
                {estimate.rangeHigh.toLocaleString("en-US")}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-2.5">
              <div className="text-[11px] text-slate-500">
                Claude 4.7+ Approx (~1.3x)
              </div>
              <div className="mt-0.5 font-mono text-base font-bold text-amber-700 tabular-nums">
                ~{estimate.claude47PlusApproxTokens.toLocaleString("en-US")}
              </div>
              <div className="text-[10px] text-slate-500">
                Newer Claude tokenizer shift
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-2.5">
              <div className="text-[11px] text-slate-500">
                Characters / Words
              </div>
              <div className="mt-0.5 font-mono text-sm font-semibold text-slate-800 tabular-nums">
                {estimate.characters.toLocaleString("en-US")} /{" "}
                {estimate.words.toLocaleString("en-US")}
              </div>
              <div className="text-[10px] text-slate-500">
                Mode:{" "}
                {estimate.contentKind === "code_or_structured"
                  ? "Code / JSON"
                  : "English Prose"}
              </div>
            </div>

            <div className="flex flex-col justify-center gap-1.5">
              <button
                type="button"
                disabled={estimate.estimatedTokens === 0}
                onClick={() => onApplyToPrefix(estimate.estimatedTokens)}
                className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Apply to Prefix Tokens
              </button>
              <button
                type="button"
                disabled={estimate.estimatedTokens === 0}
                onClick={() => onApplyToDynamic(estimate.estimatedTokens)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Apply to Dynamic Input
              </button>
            </div>
          </div>

          <p className="text-[11px] leading-relaxed text-slate-500">
            <strong>Tokenizer Variance Disclaimer:</strong> Heuristic counts
            are budgeting estimates. Exact tokenization varies across OpenAI (
            <code>o200k_base</code>), Anthropic Claude (note: Claude 4.7+ uses a
            tokenizer producing ~30% more tokens on identical prose), Google
            Gemini, and open-weight BPE/SentencePiece models. Reasoning models
            also bill internal thinking tokens at output rates.
          </p>
        </div>
      )}
    </div>
  );
}
