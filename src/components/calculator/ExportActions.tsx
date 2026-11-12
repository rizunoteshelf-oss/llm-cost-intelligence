"use client";

import { useState } from "react";
import { Download, FileCode, FileSpreadsheet, Printer } from "lucide-react";
import { buildEstimatesCsv } from "@/lib/export/csv";
import { buildEstimatesMarkdown } from "@/lib/export/markdown";
import type { CalculatorInput, ModelCostEstimate } from "@/lib/pricing/engine";

interface ExportActionsProps {
  estimates: readonly ModelCostEstimate[];
  input: CalculatorInput;
  presetLabel: string;
  registryUpdatedAt: string;
}

export function ExportActions({
  estimates,
  input,
  presetLabel,
  registryUpdatedAt,
}: ExportActionsProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  function handleDownloadCsv() {
    const nowIso = new Date().toISOString();
    const csv = buildEstimatesCsv(estimates, input, {
      presetLabel,
      registryUpdatedAt,
      exportedAtIso: nowIso,
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `llm-cost-quote-${nowIso.slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleDownloadMarkdown() {
    const nowIso = new Date().toISOString();
    const md = buildEstimatesMarkdown(estimates, input, {
      presetLabel,
      registryUpdatedAt,
      exportedAtIso: nowIso,
    });
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `llm-cost-quote-${nowIso.slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handlePrintPdf() {
    window.print();
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <button
          type="button"
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-[#161F30] px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-xs transition-colors hover:bg-slate-50 dark:hover:bg-white/10"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Export FinOps Report</span>
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 top-full z-50 mt-1.5 w-48 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161F30] p-1.5 shadow-xl">
            <button
              type="button"
              onClick={() => {
                handleDownloadCsv();
                setDropdownOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
              <span>Export CSV Quote</span>
            </button>
            <button
              type="button"
              onClick={() => {
                handleDownloadMarkdown();
                setDropdownOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
            >
              <FileCode className="h-4 w-4 text-cyan-500" />
              <span>Export Markdown</span>
            </button>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handlePrintPdf}
        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 dark:bg-white px-3 py-1.5 text-xs font-semibold text-white dark:text-slate-900 shadow-xs transition-colors hover:bg-slate-800 dark:hover:bg-slate-100"
      >
        <Printer className="h-3.5 w-3.5" />
        <span>Print PDF Quote</span>
      </button>
    </div>
  );
}
