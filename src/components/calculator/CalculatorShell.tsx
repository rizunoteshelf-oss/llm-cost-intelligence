"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  calculateModelCost,
  type CalculatorInput,
  type ModelCostEstimate,
} from "@/lib/pricing/engine";
import {
  getPresetById,
  PRESET_BY_ID,
  presetToCalculatorInput,
  type WorkloadPresetId,
} from "@/lib/pricing/presets";
import type { PricingModel, ProviderId } from "@/lib/pricing/schema";
import { buildEstimatesCsv } from "@/lib/export/csv";
import { buildEstimatesMarkdown } from "@/lib/export/markdown";
import { ComparisonTable } from "./ComparisonTable";
import { FormattedNumberInput } from "./FormattedNumberInput";
import { LiveSpendLeaderboard } from "./LiveSpendLeaderboard";
import { PresetBar } from "./PresetBar";
import { PricingModifierPills } from "./PricingModifierPills";
import { PrintQuoteView } from "./PrintQuoteView";
import { TokenEstimatorDrawer } from "./TokenEstimatorDrawer";

interface CalculatorShellProps {
  models: readonly PricingModel[];
  registryUpdatedAt: string;
  initialPresetId?: WorkloadPresetId;
}

type SortKey = "monthly" | "per1k" | "savings";
type WeightFilter = "all" | "open" | "proprietary";

function fmtUsd(val: number, decimals = 2): string {
  if (val > 0 && val < 0.01 && decimals === 2) {
    return `$${val.toFixed(4)}`;
  }
  return `$${val.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

function resolveUsResidencyLabel(model: PricingModel): string | undefined {
  const match = model.hosting.regionMultipliers?.find(
    (r) =>
      r.multiplier > 1.0 &&
      (r.regionLabel.toLowerCase().includes("us") ||
        r.regionLabel.toLowerCase().includes("geo")),
  );
  return match?.regionLabel;
}

function parseBoolParam(val: string | null): boolean | undefined {
  if (val === "1" || val === "true") return true;
  if (val === "0" || val === "false") return false;
  return undefined;
}

function parseIntParam(
  val: string | null,
  min: number,
  max: number,
): number | undefined {
  if (!val) return undefined;
  const n = Number(val);
  if (!Number.isFinite(n)) return undefined;
  return Math.min(max, Math.max(min, Math.round(n)));
}

const QUICK_REQUEST_CHIPS = [
  { label: "1K", value: 1_000 },
  { label: "10K", value: 10_000 },
  { label: "100K", value: 100_000 },
  { label: "1M", value: 1_000_000 },
] as const;

export function CalculatorShell({
  models,
  registryUpdatedAt,
  initialPresetId = "rag-qa",
}: CalculatorShellProps) {
  const initialPreset = PRESET_BY_ID[initialPresetId];
  const [activePresetId, setActivePresetId] = useState<
    WorkloadPresetId | "custom"
  >(initialPresetId);

  const [viewMode, setViewMode] = useState<"quick" | "pro">("pro");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [includeLegacy, setIncludeLegacy] = useState(false);

  const [prefixTokens, setPrefixTokens] = useState(initialPreset.prefixTokens);
  const [dynamicInputTokens, setDynamicInputTokens] = useState(
    initialPreset.dynamicInputTokens,
  );
  const [outputTokens, setOutputTokens] = useState(initialPreset.outputTokens);
  const [requestsPerDay, setRequestsPerDay] = useState(
    initialPreset.requestsPerDay,
  );
  const [cacheHitRatePct, setCacheHitRatePct] = useState(
    Math.round(initialPreset.cacheHitRate * 100),
  );
  const [cacheWritesPerHour, setCacheWritesPerHour] = useState(
    initialPreset.cacheWritesPerHour,
  );
  const [cacheTtl, setCacheTtl] = useState<"5m" | "1h">(initialPreset.cacheTtl);
  const [useCaching, setUseCaching] = useState(initialPreset.useCaching);
  const [useBatch, setUseBatch] = useState(initialPreset.useBatch);
  const [turnsPerSession, setTurnsPerSession] = useState(
    initialPreset.turnsPerSession,
  );
  const [followUpUserTokens, setFollowUpUserTokens] = useState(
    initialPreset.followUpUserTokens,
  );
  const [activeHoursPerDay, setActiveHoursPerDay] = useState(
    initialPreset.activeHoursPerDay,
  );
  const [useOffPeak, setUseOffPeak] = useState(false);
  const [useUsResidency, setUseUsResidency] = useState(false);

  const [providerFilter, setProviderFilter] = useState<ProviderId | "all">(
    "all",
  );
  const [weightFilter, setWeightFilter] = useState<WeightFilter>("all");
  const [sortBy, setSortBy] = useState<SortKey>("monthly");
  const [isCopied, setIsCopied] = useState(false);
  const hasInteractedRef = useRef(false);

  // Hydrate query params on mount
  useEffect(() => {
    if (!window.location.search || window.location.search.length <= 1) {
      return;
    }
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      const params = new URLSearchParams(window.location.search);
      if (params.size === 0) return;

      const pId = params.get("preset");
      const presetObj = pId ? getPresetById(pId) : undefined;
      if (presetObj) {
        const pInput = presetToCalculatorInput(presetObj);
        setActivePresetId(presetObj.id);
        setPrefixTokens(pInput.prefixTokens);
        setDynamicInputTokens(pInput.dynamicInputTokens);
        setOutputTokens(pInput.outputTokens);
        setRequestsPerDay(pInput.requestsPerDay);
        setCacheHitRatePct(Math.round(pInput.cacheHitRate * 100));
        setCacheWritesPerHour(pInput.cacheWritesPerHour);
        setCacheTtl(pInput.cacheTtl);
        setUseCaching(pInput.useCaching);
        setUseBatch(pInput.useBatch);
        setTurnsPerSession(pInput.turnsPerSession);
        setFollowUpUserTokens(pInput.followUpUserTokens);
        setActiveHoursPerDay(pInput.activeHoursPerDay);
      }

      const qPrefix = parseIntParam(params.get("prefix"), 0, 1_000_000);
      const qDyn = parseIntParam(params.get("dyn"), 0, 1_000_000);
      const qOut = parseIntParam(params.get("out"), 1, 400_000);
      const qReq = parseIntParam(params.get("req"), 1, 10_000_000);
      const qHit = parseIntParam(params.get("hit"), 0, 100);
      const qWrites = parseIntParam(params.get("writes"), 0, 1000);
      const qTurns = parseIntParam(params.get("turns"), 1, 30);
      const qFollow = parseIntParam(params.get("follow"), 0, 50_000);
      const qTtl = params.get("ttl");
      const qCache = parseBoolParam(params.get("cache"));
      const qBatch = parseBoolParam(params.get("batch"));
      const qOffPeak = parseBoolParam(params.get("offpeak"));
      const qUs = parseBoolParam(params.get("us"));

      let touchedCustom = false;
      if (qPrefix !== undefined) {
        setPrefixTokens(qPrefix);
        touchedCustom = true;
      }
      if (qDyn !== undefined) {
        setDynamicInputTokens(qDyn);
        touchedCustom = true;
      }
      if (qOut !== undefined) {
        setOutputTokens(qOut);
        touchedCustom = true;
      }
      if (qReq !== undefined) {
        setRequestsPerDay(qReq);
        touchedCustom = true;
      }
      if (qHit !== undefined) {
        setCacheHitRatePct(qHit);
        touchedCustom = true;
      }
      if (qWrites !== undefined) {
        setCacheWritesPerHour(qWrites);
        touchedCustom = true;
      }
      if (qTurns !== undefined) {
        setTurnsPerSession(qTurns);
        touchedCustom = true;
      }
      if (qFollow !== undefined) {
        setFollowUpUserTokens(qFollow);
        touchedCustom = true;
      }
      if (qTtl === "5m" || qTtl === "1h") {
        setCacheTtl(qTtl);
        touchedCustom = true;
      }
      if (qCache !== undefined) {
        setUseCaching(qCache);
        touchedCustom = true;
      }
      if (qBatch !== undefined) {
        setUseBatch(qBatch);
        touchedCustom = true;
      }
      if (qOffPeak !== undefined) {
        setUseOffPeak(qOffPeak);
        touchedCustom = true;
      }
      if (qUs !== undefined) {
        setUseUsResidency(qUs);
        touchedCustom = true;
      }

      if (touchedCustom && !pId) {
        setActivePresetId("custom");
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // Sync state to URL params (shallow replaceState)
  useEffect(() => {
    if (!hasInteractedRef.current) return;

    const params = new URLSearchParams();
    if (activePresetId !== "custom") {
      params.set("preset", activePresetId);
    }
    params.set("prefix", String(prefixTokens));
    params.set("dyn", String(dynamicInputTokens));
    params.set("out", String(outputTokens));
    params.set("req", String(requestsPerDay));
    params.set("hit", String(cacheHitRatePct));
    params.set("writes", String(cacheWritesPerHour));
    params.set("ttl", cacheTtl);
    if (useCaching) params.set("cache", "1");
    if (useBatch) params.set("batch", "1");
    if (useOffPeak) params.set("offpeak", "1");
    if (useUsResidency) params.set("us", "1");
    if (turnsPerSession > 1) {
      params.set("turns", String(turnsPerSession));
      params.set("follow", String(followUpUserTokens));
    }

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, "", newUrl);
  }, [
    activePresetId,
    prefixTokens,
    dynamicInputTokens,
    outputTokens,
    requestsPerDay,
    cacheHitRatePct,
    cacheWritesPerHour,
    cacheTtl,
    useCaching,
    useBatch,
    useOffPeak,
    useUsResidency,
    turnsPerSession,
    followUpUserTokens,
  ]);

  function handleSelectPreset(presetId: WorkloadPresetId) {
    hasInteractedRef.current = true;
    const preset = getPresetById(presetId);
    if (!preset) return;

    const input = presetToCalculatorInput(preset);
    setActivePresetId(preset.id);
    setPrefixTokens(input.prefixTokens);
    setDynamicInputTokens(input.dynamicInputTokens);
    setOutputTokens(input.outputTokens);
    setRequestsPerDay(input.requestsPerDay);
    setCacheHitRatePct(Math.round(input.cacheHitRate * 100));
    setCacheWritesPerHour(input.cacheWritesPerHour);
    setCacheTtl(input.cacheTtl);
    setUseCaching(input.useCaching);
    setUseBatch(input.useBatch);
    setTurnsPerSession(input.turnsPerSession);
    setFollowUpUserTokens(input.followUpUserTokens);
    setActiveHoursPerDay(input.activeHoursPerDay);
  }

  function markCustom<T>(setter: (val: T) => void) {
    return (value: T) => {
      hasInteractedRef.current = true;
      setActivePresetId("custom");
      setter(value);
    };
  }

  const calculatorInput: CalculatorInput = useMemo(
    () => ({
      prefixTokens,
      dynamicInputTokens,
      outputTokens,
      requestsPerDay,
      cacheHitRate: cacheHitRatePct / 100,
      cacheWritesPerHour,
      cacheTtl,
      useCaching,
      useBatch,
      useOffPeak,
      turnsPerSession,
      followUpUserTokens,
      activeHoursPerDay,
      daysPerMonth: 30,
      referenceDate: registryUpdatedAt,
    }),
    [
      prefixTokens,
      dynamicInputTokens,
      outputTokens,
      requestsPerDay,
      cacheHitRatePct,
      cacheWritesPerHour,
      cacheTtl,
      useCaching,
      useBatch,
      useOffPeak,
      turnsPerSession,
      followUpUserTokens,
      activeHoursPerDay,
      registryUpdatedAt,
    ],
  );

  const estimates: ModelCostEstimate[] = useMemo(() => {
    const filtered = models.filter((m) => {
      if (!includeLegacy && m.lifecycleStatus === "legacy") {
        return false;
      }
      if (providerFilter !== "all" && m.provider !== providerFilter) {
        return false;
      }
      if (weightFilter === "open" && !m.openWeight) return false;
      if (weightFilter === "proprietary" && m.openWeight) return false;
      return true;
    });

    const computed = filtered.map((model) =>
      calculateModelCost(model, {
        ...calculatorInput,
        regionLabel: useUsResidency
          ? resolveUsResidencyLabel(model)
          : undefined,
      }),
    );

    return computed.sort((a, b) => {
      if (a.status !== b.status) {
        return a.status === "VALID" ? -1 : 1;
      }
      if (sortBy === "per1k") {
        return a.costPer1kTurnsUsd - b.costPer1kTurnsUsd;
      }
      if (sortBy === "savings") {
        return b.savingsPercent - a.savingsPercent;
      }
      return a.monthlyCostUsd - b.monthlyCostUsd;
    });
  }, [
    models,
    includeLegacy,
    providerFilter,
    weightFilter,
    calculatorInput,
    useUsResidency,
    sortBy,
  ]);

  const presetLabel =
    activePresetId === "custom"
      ? "Custom Workload"
      : PRESET_BY_ID[activePresetId].name;

  const sampleAvgTurnTokens =
    estimates[0]?.avgInputTokensPerTurn ?? prefixTokens + dynamicInputTokens;

  function handleCopyShareableUrl() {
    if (typeof window === "undefined") return;
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2500);
      })
      .catch(() => {});
  }

  function handleExportCsv() {
    const csv = buildEstimatesCsv(estimates, calculatorInput, {
      presetLabel,
      registryUpdatedAt,
      exportedAtIso: new Date().toISOString(),
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `llm-cost-quote-${presetLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleExportMarkdown() {
    const md = buildEstimatesMarkdown(estimates, calculatorInput, {
      presetLabel,
      registryUpdatedAt,
      exportedAtIso: new Date().toISOString(),
    });
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `llm-cost-quote-${presetLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handlePrintPdf() {
    window.print();
  }

  return (
    <div className="space-y-8">
      {/* Above-The-Fold Split-Screen Dashboard (Desktop >= 1280px / lg:grid) */}
      <div className="no-print lg:grid lg:grid-cols-12 lg:gap-8 items-start">
        {/* Left Column (55% width ~ col-span-7): Controls & Ergonomics */}
        <div className="space-y-6 lg:col-span-7">
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111827] p-5 shadow-sm sm:p-6 transition-colors space-y-6">
            
            {/* View Mode Segmented Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Calculator Configuration
              </div>
              <div className="inline-flex rounded-lg bg-slate-100 dark:bg-white/5 p-0.5 text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => setViewMode("quick")}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    viewMode === "quick"
                      ? "bg-white dark:bg-[#161F30] text-slate-900 dark:text-white shadow-xs font-bold"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Quick Estimate
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("pro")}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    viewMode === "pro"
                      ? "bg-white dark:bg-[#161F30] text-slate-900 dark:text-white shadow-xs font-bold"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  FinOps Pro Studio
                </button>
              </div>
            </div>

            <PresetBar
              activePresetId={activePresetId}
              onSelectPreset={handleSelectPreset}
            />

            {/* Core Token Parameter Grid */}
            <div className="border-t border-slate-100 dark:border-white/5 pt-5 space-y-5">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-mono text-[11px] font-bold">
                  2
                </span>
                <span className="text-xs font-semibold tracking-wider text-slate-700 dark:text-slate-300 uppercase">
                  Token Dimensions &amp; Scale
                </span>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                {/* Prefix Tokens */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <label
                      htmlFor="input-prefix-tokens"
                      className="font-semibold text-slate-700 dark:text-slate-300"
                    >
                      Cacheable Prefix Tokens
                    </label>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {prefixTokens.toLocaleString("en-US")}
                    </span>
                  </div>
                  <input
                    id="input-prefix-tokens"
                    type="range"
                    min={0}
                    max={100000}
                    step={100}
                    value={Math.min(100000, prefixTokens)}
                    onChange={(e) =>
                      markCustom(setPrefixTokens)(Number(e.target.value))
                    }
                    className="w-full accent-emerald-500"
                  />
                  <FormattedNumberInput
                    aria-label="Exact cacheable prefix tokens"
                    min={0}
                    max={1000000}
                    value={prefixTokens}
                    onChange={(val) => markCustom(setPrefixTokens)(val)}
                    className="w-full"
                  />
                </div>

                {/* Dynamic Input Tokens */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <label
                      htmlFor="input-dynamic-tokens"
                      className="font-semibold text-slate-700 dark:text-slate-300"
                    >
                      {turnsPerSession > 1
                        ? "Turn 1 User Query Tokens"
                        : "Uncached Dynamic Input"}
                    </label>
                    <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                      {dynamicInputTokens.toLocaleString("en-US")}
                    </span>
                  </div>
                  <input
                    id="input-dynamic-tokens"
                    type="range"
                    min={0}
                    max={350000}
                    step={250}
                    value={Math.min(350000, dynamicInputTokens)}
                    onChange={(e) =>
                      markCustom(setDynamicInputTokens)(Number(e.target.value))
                    }
                    className="w-full accent-emerald-500"
                  />
                  <FormattedNumberInput
                    aria-label="Exact dynamic input tokens"
                    min={0}
                    max={1048576}
                    value={dynamicInputTokens}
                    onChange={(val) => markCustom(setDynamicInputTokens)(val)}
                    className="w-full"
                  />
                </div>

                {/* Output Tokens / Turn */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <label
                      htmlFor="input-output-tokens"
                      className="font-semibold text-slate-700 dark:text-slate-300"
                    >
                      Output Tokens / Turn
                    </label>
                    <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400 tabular-nums">
                      {outputTokens.toLocaleString("en-US")}
                    </span>
                  </div>
                  <input
                    id="input-output-tokens"
                    type="range"
                    min={50}
                    max={32000}
                    step={50}
                    value={Math.min(32000, outputTokens)}
                    onChange={(e) =>
                      markCustom(setOutputTokens)(Number(e.target.value))
                    }
                    className="w-full accent-emerald-500"
                  />
                  <FormattedNumberInput
                    aria-label="Exact output tokens"
                    min={1}
                    max={393216}
                    value={outputTokens}
                    onChange={(val) => markCustom(setOutputTokens)(val)}
                    className="w-full"
                  />
                </div>

                {/* Requests / Day with Quick Chips */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <label
                      htmlFor="input-requests-day"
                      className="font-semibold text-slate-700 dark:text-slate-300"
                    >
                      {turnsPerSession > 1 ? "Sessions / Day" : "Requests / Day"}
                    </label>
                    <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                      {requestsPerDay.toLocaleString("en-US")}
                    </span>
                  </div>
                  <input
                    id="input-requests-day"
                    type="range"
                    min={10}
                    max={50000}
                    step={50}
                    value={Math.min(50000, requestsPerDay)}
                    onChange={(e) =>
                      markCustom(setRequestsPerDay)(Number(e.target.value))
                    }
                    className="w-full accent-emerald-500"
                  />
                  <div className="flex items-center gap-2">
                    <FormattedNumberInput
                      aria-label="Exact requests or sessions per day"
                      min={1}
                      max={10000000}
                      value={requestsPerDay}
                      onChange={(val) => markCustom(setRequestsPerDay)(val)}
                      className="flex-1"
                    />
                    {/* Log Scale Quick-Select Chips */}
                    <div className="flex items-center gap-1">
                      {QUICK_REQUEST_CHIPS.map((chip) => (
                        <button
                          key={chip.label}
                          type="button"
                          onClick={() => markCustom(setRequestsPerDay)(chip.value)}
                          className={`rounded px-1.5 py-1 font-mono text-[10px] font-bold transition-colors ${
                            requestsPerDay === chip.value
                              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                              : "border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
                          }`}
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Core Caching & Optimization Controls */}
            <div className="border-t border-slate-100 dark:border-white/5 pt-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 font-mono text-[11px] font-bold">
                    3
                  </span>
                  <span className="text-xs font-semibold tracking-wider text-slate-700 dark:text-slate-300 uppercase">
                    Caching &amp; Optimization
                  </span>
                </div>
              </div>

              {/* Core controls: Caching & Batch toggle + Hit Rate slider */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label
                      htmlFor="input-cache-hit"
                      className="font-medium text-slate-700 dark:text-slate-300"
                    >
                      Cache Hit Rate (%)
                    </label>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {cacheHitRatePct}%
                    </span>
                  </div>
                  <input
                    id="input-cache-hit"
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    disabled={!useCaching}
                    value={cacheHitRatePct}
                    onChange={(e) =>
                      markCustom(setCacheHitRatePct)(Number(e.target.value))
                    }
                    className="w-full accent-emerald-500 disabled:opacity-40"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => markCustom(setUseCaching)(!useCaching)}
                    className={`flex-1 flex items-center justify-between p-2.5 rounded-xl border transition-all text-xs font-semibold ${
                      useCaching
                        ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <span>Prompt Caching</span>
                    <span className="font-mono text-[10px] uppercase font-bold">
                      {useCaching ? "Active" : "Off"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => markCustom(setUseBatch)(!useBatch)}
                    className={`flex-1 flex items-center justify-between p-2.5 rounded-xl border transition-all text-xs font-semibold ${
                      useBatch
                        ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
                        : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <span>Batch API</span>
                    <span className="font-mono text-[10px] uppercase font-bold">
                      {useBatch ? "-50% Off" : "Sync"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Collapsible Drawer: Advanced Session & Provider Rules */}
              {viewMode === "pro" && (
                <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setAdvancedOpen((prev) => !prev)}
                    className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <span>Advanced Session &amp; Provider Rules</span>
                      <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">
                        (Write TTL, Multi-Turn Depth, DeepSeek Off-Peak, Geo Uplift)
                      </span>
                    </span>
                    <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
                      {advancedOpen ? "▲ Collapse" : "▼ Expand Controls"}
                    </span>
                  </button>

                  {advancedOpen && (
                    <div className="p-4 border-t border-slate-200 dark:border-white/5 space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Cache Writes / Hr */}
                        <div>
                          <label
                            htmlFor="input-writes-hr"
                            className="block text-[11px] font-medium text-slate-700 dark:text-slate-300"
                          >
                            Writes / Hr
                          </label>
                          <FormattedNumberInput
                            id="input-writes-hr"
                            aria-label="Cache writes per hour"
                            min={0}
                            max={1000}
                            disabled={!useCaching}
                            value={cacheWritesPerHour}
                            onChange={(val) => markCustom(setCacheWritesPerHour)(val)}
                            className="mt-1 w-full"
                          />
                        </div>

                        {/* Write TTL */}
                        <div>
                          <label
                            htmlFor="select-ttl"
                            className="block text-[11px] font-medium text-slate-700 dark:text-slate-300"
                          >
                            Write TTL
                          </label>
                          <select
                            id="select-ttl"
                            disabled={!useCaching}
                            value={cacheTtl}
                            onChange={(e) =>
                              markCustom(setCacheTtl)(e.target.value as "5m" | "1h")
                            }
                            className="mt-1 w-full rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-[#161F30] px-2 py-1.5 font-mono text-xs text-slate-900 dark:text-slate-100 disabled:opacity-40 focus:border-emerald-500 focus:outline-none"
                          >
                            <option value="5m">5m / 30m</option>
                            <option value="1h">1h / 12h</option>
                          </select>
                        </div>

                        {/* Turns / Session */}
                        <div>
                          <label
                            htmlFor="input-turns"
                            className="block text-[11px] font-medium text-slate-700 dark:text-slate-300"
                          >
                            Turns / Session
                          </label>
                          <FormattedNumberInput
                            id="input-turns"
                            aria-label="Turns per session"
                            min={1}
                            max={30}
                            value={turnsPerSession}
                            onChange={(val) => markCustom(setTurnsPerSession)(val)}
                            className="mt-1 w-full"
                          />
                        </div>

                        {/* Follow-Up User Tokens */}
                        <div>
                          <label
                            htmlFor="input-followup"
                            className="block text-[11px] font-medium text-slate-700 dark:text-slate-300"
                          >
                            Follow-Up Tok
                          </label>
                          <FormattedNumberInput
                            id="input-followup"
                            aria-label="Follow up user tokens"
                            min={0}
                            max={50000}
                            disabled={turnsPerSession <= 1}
                            value={followUpUserTokens}
                            onChange={(val) => markCustom(setFollowUpUserTokens)(val)}
                            className="mt-1 w-full"
                          />
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-white/5">
                        <PricingModifierPills
                          useCaching={useCaching}
                          onToggleCaching={markCustom(setUseCaching)}
                          useBatch={useBatch}
                          onToggleBatch={markCustom(setUseBatch)}
                          useOffPeak={useOffPeak}
                          onToggleOffPeak={(v) => {
                            hasInteractedRef.current = true;
                            setUseOffPeak(v);
                          }}
                          useUsResidency={useUsResidency}
                          onToggleUsResidency={(v) => {
                            hasInteractedRef.current = true;
                            setUseUsResidency(v);
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Elevated Client-Side Tokenizer Drawer */}
            <TokenEstimatorDrawer
              onApplyToPrefix={(t) => markCustom(setPrefixTokens)(t)}
              onApplyToDynamic={(t) => markCustom(setDynamicInputTokens)(t)}
            />
          </div>
        </div>

        {/* Right Column (45% width ~ col-span-5, sticky): Live Spend Leaderboard */}
        <div className="mt-8 lg:mt-0 lg:col-span-5 lg:sticky lg:top-20 space-y-4">
          <LiveSpendLeaderboard
            estimates={estimates}
            calculatorInput={calculatorInput}
            presetLabel={presetLabel}
            registryUpdatedAt={registryUpdatedAt}
            onCopyShareableUrl={handleCopyShareableUrl}
            isCopied={isCopied}
            onExportCsv={handleExportCsv}
            onExportMarkdown={handleExportMarkdown}
            onPrintPdf={handlePrintPdf}
          />
        </div>
      </div>

      {/* Full Comparison Table & Filter Controls Section */}
      <div className="no-print space-y-4 pt-6">
        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111827] p-4 sm:flex-row sm:items-center transition-colors">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Complete Model Comparison Directory ({estimates.length} models)
              </h3>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                100% Client-Side Engine
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
              Avg turn input:{" "}
              <strong className="text-slate-700 dark:text-slate-200">
                {Math.round(sampleAvgTurnTokens).toLocaleString("en-US")} tok
              </strong>{" "}
              · Daily turns:{" "}
              <strong className="text-slate-700 dark:text-slate-200">
                {(requestsPerDay * turnsPerSession).toLocaleString("en-US")}
              </strong>{" "}
              · Reference: <span>{registryUpdatedAt}</span>
            </p>
          </div>

          {/* Quick Filter Bar */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <label
                htmlFor="filter-provider"
                className="font-medium text-slate-600 dark:text-slate-400"
              >
                Provider:
              </label>
              <select
                id="filter-provider"
                value={providerFilter}
                onChange={(e) =>
                  setProviderFilter(e.target.value as ProviderId | "all")
                }
                className="rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-[#161F30] px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Providers</option>
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
                <option value="google">Google Gemini</option>
                <option value="deepseek">DeepSeek</option>
                <option value="mistral">Mistral</option>
                <option value="groq">Groq</option>
                <option value="together">Together AI</option>
                <option value="bedrock">Amazon Bedrock</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <label
                htmlFor="filter-weight"
                className="font-medium text-slate-600 dark:text-slate-400"
              >
                Type:
              </label>
              <select
                id="filter-weight"
                value={weightFilter}
                onChange={(e) =>
                  setWeightFilter(e.target.value as WeightFilter)
                }
                className="rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-[#161F30] px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Weights</option>
                <option value="open">Open-Weight Only</option>
                <option value="proprietary">Proprietary Only</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <label
                htmlFor="sort-by"
                className="font-medium text-slate-600 dark:text-slate-400"
              >
                Sort:
              </label>
              <select
                id="sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortKey)}
                className="rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-[#161F30] px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="monthly">Monthly Spend (Low → High)</option>
                <option value="per1k">Cost per 1K Turns</option>
                <option value="savings">Highest Savings %</option>
              </select>
            </div>

            {/* Include Legacy Models Checkbox Toggle */}
            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300 select-none ml-1 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/10">
              <input
                type="checkbox"
                checked={includeLegacy}
                onChange={(e) => setIncludeLegacy(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span>Include Legacy ({models.filter((m) => m.lifecycleStatus === "legacy").length})</span>
            </label>
          </div>
        </div>

        <ComparisonTable estimates={estimates} />

        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-[#111827] px-4 py-3.5 text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
          <strong className="text-slate-800 dark:text-slate-200">
            Institutional Tokenizer &amp; Pricing Note:
          </strong>{" "}
          Estimates reflect versioned USD list pricing verified on{" "}
          <span className="font-mono text-emerald-600 dark:text-emerald-400">
            {registryUpdatedAt}
          </span>
          . Actual token volumes vary by tokenizer architecture (for example,
          Claude 4.7+ uses a modern byte-level vocabulary generating ~30% more
          tokens on identical text than GPT-4o), and reasoning models (o1,
          DeepSeek-R1) bill hidden thinking tokens as output tokens.
        </div>
      </div>

      {/* Mobile Floating Bottom Spend Bar (< 1024px / lg:hidden) */}
      <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden border-t border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md p-3 px-4 shadow-lg shadow-black/20 flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
            Lowest Spend
          </div>
          <div className="font-mono text-base font-extrabold text-emerald-600 dark:text-emerald-400">
            {estimates[0] ? fmtUsd(estimates[0].monthlyCostUsd) : "—"}
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">/mo</span>
            <span className="ml-1.5 text-[11px] font-medium text-slate-700 dark:text-slate-300 hidden sm:inline">
              ({estimates[0]?.model.displayName})
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            document.getElementById("live-finops-leaderboard")?.scrollIntoView({ behavior: "smooth" });
          }}
          className="rounded-lg bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-600 active:scale-95 transition-all"
        >
          View Leaderboard →
        </button>
      </div>

      <PrintQuoteView
        estimates={estimates}
        input={calculatorInput}
        presetLabel={presetLabel}
        registryUpdatedAt={registryUpdatedAt}
      />
    </div>
  );
}
