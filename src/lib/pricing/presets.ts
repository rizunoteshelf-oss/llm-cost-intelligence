import type { CacheTtlOption } from "./schema";

export type WorkloadPresetId =
  | "rag-qa"
  | "code-generation"
  | "document-summarization"
  | "support-agent"
  | "extraction";

export interface WorkloadPreset {
  id: WorkloadPresetId;
  slug: WorkloadPresetId;
  name: string;
  shortLabel: string;
  description: string;
  /** Static/shared system instructions, tool schemas, or few-shot prefix tokens */
  prefixTokens: number;
  /** Per-request (or Turn 1 initial) dynamic uncached input tokens */
  dynamicInputTokens: number;
  /** Output tokens per request (or per assistant turn in multi-turn mode) */
  outputTokens: number;
  /** Requests per day (or sessions per day when turnsPerSession > 1) */
  requestsPerDay: number;
  /** Expected fraction of cache-eligible prefix hits (0..1) */
  cacheHitRate: number;
  /** Cold cache writes per active hour */
  cacheWritesPerHour: number;
  /** Preferred cache TTL tier */
  cacheTtl: Extract<CacheTtlOption, "5m" | "1h">;
  /** Whether prompt caching is enabled by default */
  useCaching: boolean;
  /** Whether asynchronous Batch API mode is enabled by default */
  useBatch: boolean;
  /** Number of turns per session (1 for single-turn, >1 for multi-turn agent loops) */
  turnsPerSession: number;
  /** Follow-up user message tokens added on turns 2..K (multi-turn only) */
  followUpUserTokens: number;
  /** Active workload hours per day used for write/storage amortization */
  activeHoursPerDay: number;
}

export const WORKLOAD_PRESETS: readonly WorkloadPreset[] = [
  {
    id: "rag-qa",
    slug: "rag-qa",
    name: "RAG Q&A",
    shortLabel: "RAG Q&A",
    description:
      "Grounded retrieval-augmented Q&A with a shared system/citation prompt (1,800 tok) and dynamic retrieved chunks + query (3,200 tok).",
    prefixTokens: 1800,
    dynamicInputTokens: 3200,
    outputTokens: 450,
    requestsPerDay: 2000,
    cacheHitRate: 0.85,
    cacheWritesPerHour: 12,
    cacheTtl: "5m",
    useCaching: true,
    useBatch: false,
    turnsPerSession: 1,
    followUpUserTokens: 0,
    activeHoursPerDay: 16,
  },
  {
    id: "code-generation",
    slug: "code-generation",
    name: "Code Generation",
    shortLabel: "Code Gen",
    description:
      "IDE/agentic coding with a large cacheable repository map & style rules (12,000 tok), active diff context (2,500 tok), and code/reasoning output (1,600 tok).",
    prefixTokens: 12000,
    dynamicInputTokens: 2500,
    outputTokens: 1600,
    requestsPerDay: 500,
    cacheHitRate: 0.8,
    cacheWritesPerHour: 4,
    cacheTtl: "5m",
    useCaching: true,
    useBatch: false,
    turnsPerSession: 1,
    followUpUserTokens: 0,
    activeHoursPerDay: 16,
  },
  {
    id: "document-summarization",
    slug: "document-summarization",
    name: "Document Summarization",
    shortLabel: "Doc Summary",
    description:
      "Long-context PDF/contract summarization (45,000 dynamic doc tokens) with low cache reuse across unique documents and high Batch API eligibility.",
    prefixTokens: 600,
    dynamicInputTokens: 45000,
    outputTokens: 1200,
    requestsPerDay: 300,
    cacheHitRate: 0.1,
    cacheWritesPerHour: 1,
    cacheTtl: "5m",
    useCaching: true,
    useBatch: true,
    turnsPerSession: 1,
    followUpUserTokens: 0,
    activeHoursPerDay: 24,
  },
  {
    id: "support-agent",
    slug: "support-agent",
    name: "Support Agent (Multi-Turn)",
    shortLabel: "Support Agent",
    description:
      "5-turn live customer support loop modeling quadratic conversation history growth (300 follow-up + 350 reply = 650 tok/turn; 4,600 avg input tok/turn).",
    prefixTokens: 2500,
    dynamicInputTokens: 800,
    outputTokens: 350,
    requestsPerDay: 1500,
    cacheHitRate: 0.75,
    cacheWritesPerHour: 12,
    cacheTtl: "5m",
    useCaching: true,
    useBatch: false,
    turnsPerSession: 5,
    followUpUserTokens: 300,
    activeHoursPerDay: 16,
  },
  {
    id: "extraction",
    slug: "extraction",
    name: "Extraction (JSON / ETL)",
    shortLabel: "Extraction",
    description:
      "High-volume structured JSON extraction (10,000 req/day) sharing a strict schema prefix (1,200 tok) over incoming payloads (1,800 tok), ideal for Batch API.",
    prefixTokens: 1200,
    dynamicInputTokens: 1800,
    outputTokens: 250,
    requestsPerDay: 10000,
    cacheHitRate: 0.9,
    cacheWritesPerHour: 1,
    cacheTtl: "1h",
    useCaching: true,
    useBatch: true,
    turnsPerSession: 1,
    followUpUserTokens: 0,
    activeHoursPerDay: 24,
  },
];

export const PRESET_BY_ID: Readonly<Record<WorkloadPresetId, WorkloadPreset>> = {
  "rag-qa": WORKLOAD_PRESETS[0]!,
  "code-generation": WORKLOAD_PRESETS[1]!,
  "document-summarization": WORKLOAD_PRESETS[2]!,
  "support-agent": WORKLOAD_PRESETS[3]!,
  extraction: WORKLOAD_PRESETS[4]!,
};

export function getPresetById(id: string): WorkloadPreset | undefined {
  return (PRESET_BY_ID as Record<string, WorkloadPreset | undefined>)[id];
}

export function presetToCalculatorInput(
  preset: WorkloadPreset,
  overrides?: {
    useOffPeak?: boolean;
    regionLabel?: string;
    daysPerMonth?: number;
    referenceDate?: string;
  },
) {
  return {
    prefixTokens: preset.prefixTokens,
    dynamicInputTokens: preset.dynamicInputTokens,
    outputTokens: preset.outputTokens,
    requestsPerDay: preset.requestsPerDay,
    cacheHitRate: preset.cacheHitRate,
    cacheWritesPerHour: preset.cacheWritesPerHour,
    cacheTtl: preset.cacheTtl,
    useCaching: preset.useCaching,
    useBatch: preset.useBatch,
    useOffPeak: overrides?.useOffPeak ?? false,
    regionLabel: overrides?.regionLabel,
    turnsPerSession: preset.turnsPerSession,
    followUpUserTokens: preset.followUpUserTokens,
    activeHoursPerDay: preset.activeHoursPerDay,
    daysPerMonth: overrides?.daysPerMonth ?? 30,
    referenceDate: overrides?.referenceDate,
  };
}
