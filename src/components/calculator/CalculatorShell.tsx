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
import { ComparisonTable } from "./ComparisonTable";
import { ExportActions } from "./ExportActions";
import { PresetBar } from "./PresetBar";
import { PrintQuoteView } from "./PrintQuoteView";
import { TokenEstimatorDrawer } from "./TokenEstimatorDrawer";

interface CalculatorShellProps {
  models: readonly PricingModel[];
  registryUpdatedAt: string;
  initialPresetId?: WorkloadPresetId;
}

type SortKey = "monthly" | "per1k" | "savings";
type WeightFilter = "all" | "open" | "proprietary";

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

export function CalculatorShell({
  models,
  registryUpdatedAt,
  initialPresetId = "rag-qa",
}: CalculatorShellProps) {
  const initialPreset = PRESET_BY_ID[initialPresetId];
  const [activePresetId, setActivePresetId] = useState<
    WorkloadPresetId | "custom"
  >(initialPresetId);

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
  const hasInteractedRef = useRef(false);

  // Hydrate optional shareable query params on client mount (avoids SSR/static hydration mismatch)
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
      if (qOffPeak !== undefined) setUseOffPeak(qOffPeak);
      if (qUs !== undefined) setUseUsResidency(qUs);

      if (touchedCustom && !presetObj) {
        setActivePresetId("custom");
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // Sync state to URL query parameters only after user interaction
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
    params.set("cache", useCaching ? "1" : "0");
    params.set("batch", useBatch ? "1" : "0");
    params.set("turns", String(turnsPerSession));
    if (turnsPerSession > 1) {
      params.set("follow", String(followUpUserTokens));
    }
    if (useOffPeak) params.set("offpeak", "1");
    if (useUsResidency) params.set("us", "1");

    const nextUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, "", nextUrl);
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
    turnsPerSession,
    followUpUserTokens,
    useOffPeak,
    useUsResidency,
  ]);

  function handleSelectPreset(id: WorkloadPresetId) {
    hasInteractedRef.current = true;
    const p = PRESET_BY_ID[id];
    setActivePresetId(id);
    setPrefixTokens(p.prefixTokens);
    setDynamicInputTokens(p.dynamicInputTokens);
    setOutputTokens(p.outputTokens);
    setRequestsPerDay(p.requestsPerDay);
    setCacheHitRatePct(Math.round(p.cacheHitRate * 100));
    setCacheWritesPerHour(p.cacheWritesPerHour);
    setCacheTtl(p.cacheTtl);
    setUseCaching(p.useCaching);
    setUseBatch(p.useBatch);
    setTurnsPerSession(p.turnsPerSession);
    setFollowUpUserTokens(p.followUpUserTokens);
    setActiveHoursPerDay(p.activeHoursPerDay);
  }

  function markCustom<T>(setter: (v: T) => void) {
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
  }, [models, providerFilter, weightFilter, calculatorInput, useUsResidency, sortBy]);

  const presetLabel =
    activePresetId === "custom"
      ? "Custom Workload"
      : PRESET_BY_ID[activePresetId].name;

  const sampleAvgTurnTokens = estimates[0]?.avgInputTokensPerTurn ?? prefixTokens + dynamicInputTokens;

  return (
    <div className="space-y-6">
      <div className="no-print space-y-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <PresetBar
          activePresetId={activePresetId}
          onSelectPreset={handleSelectPreset}
        />

        <div className="grid gap-5 border-t border-slate-100 pt-5 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label
                htmlFor="input-prefix-tokens"
                className="font-semibold text-slate-700"
              >
                Cacheable Prefix Tokens
              </label>
              <span className="font-mono font-bold text-slate-900 tabular-nums">
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
              className="w-full accent-emerald-600"
            />
            <input
              type="number"
              aria-label="Exact cacheable prefix tokens"
              min={0}
              max={1000000}
              value={prefixTokens}
              onChange={(e) =>
                markCustom(setPrefixTokens)(Math.max(0, Number(e.target.value) || 0))
              }
              className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 font-mono text-xs tabular-nums focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label
                htmlFor="input-dynamic-tokens"
                className="font-semibold text-slate-700"
              >
                {turnsPerSession > 1
                  ? "Turn 1 User Query Tokens"
                  : "Uncached Dynamic Input"}
              </label>
              <span className="font-mono font-bold text-slate-900 tabular-nums">
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
              className="w-full accent-emerald-600"
            />
            <input
              type="number"
              aria-label="Exact dynamic input tokens"
              min={0}
              max={1048576}
              value={dynamicInputTokens}
              onChange={(e) =>
                markCustom(setDynamicInputTokens)(
                  Math.max(0, Number(e.target.value) || 0),
                )
              }
              className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 font-mono text-xs tabular-nums focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label
                htmlFor="input-output-tokens"
                className="font-semibold text-slate-700"
              >
                Output Tokens / Turn
              </label>
              <span className="font-mono font-bold text-slate-900 tabular-nums">
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
              className="w-full accent-emerald-600"
            />
            <input
              type="number"
              aria-label="Exact output tokens"
              min={1}
              max={393216}
              value={outputTokens}
              onChange={(e) =>
                markCustom(setOutputTokens)(
                  Math.max(1, Number(e.target.value) || 1),
                )
              }
              className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 font-mono text-xs tabular-nums focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label
                htmlFor="input-requests-day"
                className="font-semibold text-slate-700"
              >
                {turnsPerSession > 1 ? "Sessions / Day" : "Requests / Day"}
              </label>
              <span className="font-mono font-bold text-slate-900 tabular-nums">
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
              className="w-full accent-emerald-600"
            />
            <input
              type="number"
              aria-label="Exact requests or sessions per day"
              min={1}
              max={10000000}
              value={requestsPerDay}
              onChange={(e) =>
                markCustom(setRequestsPerDay)(
                  Math.max(1, Number(e.target.value) || 1),
                )
              }
              className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 font-mono text-xs tabular-nums focus:border-emerald-600 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label
                htmlFor="input-cache-hit"
                className="font-semibold text-slate-700"
              >
                Cache Hit Rate (%)
              </label>
              <span className="font-mono font-bold text-slate-900 tabular-nums">
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
              className="w-full accent-emerald-600 disabled:opacity-40"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label
                htmlFor="input-writes-hr"
                className="block text-[11px] font-semibold text-slate-700"
              >
                Cache Writes / Hr
              </label>
              <input
                id="input-writes-hr"
                type="number"
                min={0}
                max={1000}
                disabled={!useCaching}
                value={cacheWritesPerHour}
                onChange={(e) =>
                  markCustom(setCacheWritesPerHour)(
                    Math.max(0, Number(e.target.value) || 0),
                  )
                }
                className="mt-1 w-full rounded-lg border border-slate-300 px-2.5 py-1.5 font-mono text-xs tabular-nums disabled:opacity-40"
              />
            </div>

            <div>
              <label
                htmlFor="select-ttl"
                className="block text-[11px] font-semibold text-slate-700"
              >
                Cache Write TTL
              </label>
              <select
                id="select-ttl"
                disabled={!useCaching}
                value={cacheTtl}
                onChange={(e) =>
                  markCustom(setCacheTtl)(e.target.value as "5m" | "1h")
                }
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs disabled:opacity-40"
              >
                <option value="5m">Short (5m / 30m)</option>
                <option value="1h">Extended (1h / 12h)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label
                htmlFor="input-turns"
                className="block text-[11px] font-semibold text-slate-700"
              >
                Turns / Session
              </label>
              <input
                id="input-turns"
                type="number"
                min={1}
                max={30}
                value={turnsPerSession}
                onChange={(e) =>
                  markCustom(setTurnsPerSession)(
                    Math.max(1, Math.min(30, Number(e.target.value) || 1)),
                  )
                }
                className="mt-1 w-full rounded-lg border border-slate-300 px-2.5 py-1.5 font-mono text-xs tabular-nums"
              />
            </div>

            <div>
              <label
                htmlFor="input-followup"
                className="block text-[11px] font-semibold text-slate-700"
              >
                Follow-Up User Tok
              </label>
              <input
                id="input-followup"
                type="number"
                min={0}
                max={50000}
                disabled={turnsPerSession <= 1}
                value={followUpUserTokens}
                onChange={(e) =>
                  markCustom(setFollowUpUserTokens)(
                    Math.max(0, Number(e.target.value) || 0),
                  )
                }
                className="mt-1 w-full rounded-lg border border-slate-300 px-2.5 py-1.5 font-mono text-xs tabular-nums disabled:opacity-40"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
            <label className="inline-flex cursor-pointer items-center gap-1.5 font-medium text-slate-800">
              <input
                type="checkbox"
                checked={useCaching}
                onChange={(e) => markCustom(setUseCaching)(e.target.checked)}
                className="h-4 w-4 rounded accent-emerald-600"
              />
              Prompt Caching
            </label>

            <label className="inline-flex cursor-pointer items-center gap-1.5 font-medium text-slate-800">
              <input
                type="checkbox"
                checked={useBatch}
                onChange={(e) => markCustom(setUseBatch)(e.target.checked)}
                className="h-4 w-4 rounded accent-emerald-600"
              />
              Batch API (24h)
            </label>

            <label className="inline-flex cursor-pointer items-center gap-1.5 font-medium text-slate-800">
              <input
                type="checkbox"
                checked={useOffPeak}
                onChange={(e) => {
                  hasInteractedRef.current = true;
                  setUseOffPeak(e.target.checked);
                }}
                className="h-4 w-4 rounded accent-emerald-600"
              />
              DeepSeek Off-Peak
            </label>

            <label className="inline-flex cursor-pointer items-center gap-1.5 font-medium text-slate-800">
              <input
                type="checkbox"
                checked={useUsResidency}
                onChange={(e) => {
                  hasInteractedRef.current = true;
                  setUseUsResidency(e.target.checked);
                }}
                className="h-4 w-4 rounded accent-emerald-600"
              />
              US-Only Geo Uplift
            </label>
          </div>
        </div>

        <TokenEstimatorDrawer
          onApplyToPrefix={(t) => markCustom(setPrefixTokens)(t)}
          onApplyToDynamic={(t) => markCustom(setDynamicInputTokens)(t)}
        />
      </div>

      {/* Results Header, Filters, Disclaimers & Export */}
      <div className="no-print space-y-3">
        <div className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 sm:text-base">
                {presetLabel} Cost Comparison ({estimates.length} models)
              </h2>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                100% Client-Side · Zero Prompt Transmission
              </span>
            </div>
            <p className="text-xs text-slate-600 tabular-nums">
              Avg input/turn:{" "}
              <strong>
                {Math.round(sampleAvgTurnTokens).toLocaleString("en-US")} tok
              </strong>{" "}
              · Daily turns:{" "}
              <strong>
                {(requestsPerDay * turnsPerSession).toLocaleString("en-US")}
              </strong>{" "}
              · Registry verified:{" "}
              <span className="font-mono">{registryUpdatedAt}</span>
            </p>
          </div>

          <ExportActions
            estimates={estimates}
            input={calculatorInput}
            presetLabel={presetLabel}
            registryUpdatedAt={registryUpdatedAt}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="filter-provider" className="font-semibold text-slate-600">
              Provider:
            </label>
            <select
              id="filter-provider"
              value={providerFilter}
              onChange={(e) =>
                setProviderFilter(e.target.value as ProviderId | "all")
              }
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs"
            >
              <option value="all">All 8 Providers</option>
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="google">Google Gemini</option>
              <option value="deepseek">DeepSeek</option>
              <option value="mistral">Mistral</option>
              <option value="groq">Groq</option>
              <option value="together">Together AI</option>
              <option value="bedrock">Amazon Bedrock</option>
            </select>

            <label htmlFor="filter-weight" className="ml-2 font-semibold text-slate-600">
              Model Type:
            </label>
            <select
              id="filter-weight"
              value={weightFilter}
              onChange={(e) => setWeightFilter(e.target.value as WeightFilter)}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs"
            >
              <option value="all">All Models</option>
              <option value="open">Open-Weight Only</option>
              <option value="proprietary">Proprietary Only</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="sort-by" className="font-semibold text-slate-600">
              Sort by:
            </label>
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs"
            >
              <option value="monthly">Monthly Cost (Low → High)</option>
              <option value="per1k">Cost per 1K Turns</option>
              <option value="savings">Highest Savings %</option>
            </select>
          </div>
        </div>

        <ComparisonTable estimates={estimates} />

        <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[11px] leading-relaxed text-slate-600">
          <strong>Budgeting &amp; Tokenizer Disclaimer:</strong> Estimates assume
          USD list pricing verified on {registryUpdatedAt}. Actual token counts
          vary across provider tokenizers (for example, Claude 4.7+ uses a newer
          tokenizer that generates ~30% more tokens on identical prose than
          legacy models), and reasoning models bill hidden thinking tokens as
          output tokens.
        </p>
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
