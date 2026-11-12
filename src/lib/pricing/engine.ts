import type {
  CacheTtlOption,
  ContextTier,
  PricingModel,
} from "./schema";

export interface CalculatorInput {
  /** Cacheable prefix tokens (system instructions, schema, repo map) */
  prefixTokens: number;
  /** Uncached dynamic tokens per request (or Turn 1 user query in multi-turn mode) */
  dynamicInputTokens: number;
  /** Output tokens per request (or per turn in multi-turn mode) */
  outputTokens: number;
  /** Requests per day (or sessions per day when turnsPerSession > 1) */
  requestsPerDay: number;
  /** Fraction of cache-eligible prefix tokens hitting cache (0..1) */
  cacheHitRate: number;
  /** Cold cache writes per active hour */
  cacheWritesPerHour: number;
  /** Preferred cache TTL ("5m" or "1h") */
  cacheTtl: Extract<CacheTtlOption, "5m" | "1h">;
  /** Enable prompt caching */
  useCaching: boolean;
  /** Enable asynchronous Batch API mode */
  useBatch: boolean;
  /** Use off-peak rates where provider supports time-of-day windows (e.g., DeepSeek) */
  useOffPeak: boolean;
  /** Optional region routing label (matches hosting.regionMultipliers[].regionLabel) */
  regionLabel?: string;
  /** Number of turns per session (1 = single-turn; >1 = multi-turn arithmetic series) */
  turnsPerSession: number;
  /** Follow-up user prompt tokens added on turns 2..K (multi-turn only) */
  followUpUserTokens: number;
  /** Active workload hours per day (default 16 interactive, 24 batch) */
  activeHoursPerDay: number;
  /** Days per month for monthly projection (default 30) */
  daysPerMonth?: number;
  /** ISO date YYYY-MM-DD for promotional expiration checks (defaults to today UTC) */
  referenceDate?: string;
}

export interface ModelCostEstimate {
  model: PricingModel;
  status: "VALID" | "EXCEEDS_CONTEXT_WINDOW";
  tierLabel: string | null;
  peakTurnInputTokens: number;
  avgInputTokensPerTurn: number;
  totalTurnsPerDay: number;
  cacheActive: boolean;
  batchActive: boolean;
  offPeakActive: boolean;
  regionMultiplier: number;
  /** Effective USD per 1M rates applied on the highest active tier */
  effectiveRates: {
    inputPer1M: number;
    outputPer1M: number;
    cachedReadPer1M: number | null;
    cacheWritePer1M: number | null;
  } | null;
  /** Daily cost breakdown (USD) */
  dailyCostUsd: number;
  monthlyCostUsd: number;
  costPer1kTurnsUsd: number;
  /** Uncached synchronous baseline (no caching, no batch) for savings comparison */
  uncachedBaselineDailyCostUsd: number;
  monthlySavingsUsd: number;
  savingsPercent: number;
  warnings: string[];
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function resolveContextTier(
  model: PricingModel,
  totalInputTokens: number,
): ContextTier | null {
  const maxInput = model.maxInputTokens ?? model.contextWindowTokens;
  if (totalInputTokens > maxInput) {
    return null;
  }
  const sorted = [...model.pricingTiers].sort((a, b) => {
    const boundA = a.upToTokens ?? maxInput;
    const boundB = b.upToTokens ?? maxInput;
    return boundA - boundB;
  });
  for (const tier of sorted) {
    const bound = tier.upToTokens ?? maxInput;
    if (totalInputTokens <= bound) {
      return tier;
    }
  }
  return null;
}

function resolveRegionMultiplier(model: PricingModel, regionLabel?: string): number {
  if (!regionLabel || !model.hosting.regionMultipliers?.length) {
    return 1.0;
  }
  const match = model.hosting.regionMultipliers.find(
    (r) => r.regionLabel.toLowerCase() === regionLabel.toLowerCase(),
  );
  return match ? match.multiplier : 1.0;
}

function resolveCacheWriteRate(
  tier: ContextTier,
  baseInputRate: number,
  ttl: Extract<CacheTtlOption, "5m" | "1h">,
): number {
  if (ttl === "1h") {
    if (tier.cacheWrite1hPer1M != null) return tier.cacheWrite1hPer1M;
    if (tier.cacheWrite12hPer1M != null) return tier.cacheWrite12hPer1M;
  }
  if (tier.cacheWrite5mPer1M != null) return tier.cacheWrite5mPer1M;
  if (tier.cacheWrite30mPer1M != null) return tier.cacheWrite30mPer1M;
  return baseInputRate;
}

interface TurnShape {
  cacheablePrefixTokens: number;
  uncachedDynamicTokens: number;
  totalInputTokens: number;
}

function buildTurnShapes(input: CalculatorInput): TurnShape[] {
  const turns = Math.max(1, Math.round(input.turnsPerSession));
  const prefix = Math.max(0, input.prefixTokens);
  const initialDynamic = Math.max(0, input.dynamicInputTokens);
  const output = Math.max(0, input.outputTokens);
  const followUp = Math.max(0, input.followUpUserTokens);

  if (turns === 1) {
    return [
      {
        cacheablePrefixTokens: prefix,
        uncachedDynamicTokens: initialDynamic,
        totalInputTokens: prefix + initialDynamic,
      },
    ];
  }

  const shapes: TurnShape[] = [];
  for (let t = 1; t <= turns; t += 1) {
    if (t === 1) {
      shapes.push({
        cacheablePrefixTokens: prefix,
        uncachedDynamicTokens: initialDynamic,
        totalInputTokens: prefix + initialDynamic,
      });
    } else {
      const priorConversation =
        initialDynamic + output + (t - 2) * (followUp + output);
      const cacheable = prefix + priorConversation;
      shapes.push({
        cacheablePrefixTokens: cacheable,
        uncachedDynamicTokens: followUp,
        totalInputTokens: cacheable + followUp,
      });
    }
  }
  return shapes;
}

function daysBetweenIso(fromIso: string, toIso: string): number {
  const fromMs = Date.parse(`${fromIso}T00:00:00Z`);
  const toMs = Date.parse(`${toIso}T00:00:00Z`);
  return Math.round((toMs - fromMs) / 86_400_000);
}

export function calculateModelCost(
  model: PricingModel,
  rawInput: CalculatorInput,
): ModelCostEstimate {
  const input: CalculatorInput = {
    ...rawInput,
    prefixTokens: Math.max(0, rawInput.prefixTokens),
    dynamicInputTokens: Math.max(0, rawInput.dynamicInputTokens),
    outputTokens: Math.max(0, rawInput.outputTokens),
    requestsPerDay: Math.max(1, rawInput.requestsPerDay),
    cacheHitRate: clamp(rawInput.cacheHitRate, 0, 1),
    cacheWritesPerHour: Math.max(0, rawInput.cacheWritesPerHour),
    turnsPerSession: Math.max(1, Math.round(rawInput.turnsPerSession)),
    followUpUserTokens: Math.max(0, rawInput.followUpUserTokens),
    activeHoursPerDay: clamp(rawInput.activeHoursPerDay, 1, 24),
    daysPerMonth: Math.max(1, rawInput.daysPerMonth ?? 30),
  };

  const warnings: string[] = [];
  const daysPerMonth = input.daysPerMonth ?? 30;
  const referenceDate =
    input.referenceDate ?? new Date().toISOString().slice(0, 10);

  if (model.promotionalExpiryDate) {
    const daysLeft = daysBetweenIso(referenceDate, model.promotionalExpiryDate);
    if (daysLeft < 0) {
      warnings.push(
        `Promotional pricing expired on ${model.promotionalExpiryDate}; verify updated rates.`,
      );
    } else if (daysLeft <= 60) {
      warnings.push(
        `Promotional rate expires on ${model.promotionalExpiryDate} (${daysLeft}d remaining).`,
      );
    }
  }

  const turnShapes = buildTurnShapes(input);
  const peakTurnInputTokens = turnShapes.reduce(
    (max, t) => Math.max(max, t.totalInputTokens),
    0,
  );
  const avgInputTokensPerTurn =
    turnShapes.reduce((sum, t) => sum + t.totalInputTokens, 0) /
    turnShapes.length;
  const totalTurnsPerDay = input.requestsPerDay * turnShapes.length;

  const peakTier = resolveContextTier(model, peakTurnInputTokens);
  const regionMultiplier = resolveRegionMultiplier(model, input.regionLabel);

  if (!peakTier) {
    const maxAllowed = model.maxInputTokens ?? model.contextWindowTokens;
    warnings.push(
      `Peak input (${peakTurnInputTokens.toLocaleString("en-US")} tokens) exceeds model limit (${maxAllowed.toLocaleString("en-US")} tokens).`,
    );
    return {
      model,
      status: "EXCEEDS_CONTEXT_WINDOW",
      tierLabel: null,
      peakTurnInputTokens,
      avgInputTokensPerTurn,
      totalTurnsPerDay,
      cacheActive: false,
      batchActive: false,
      offPeakActive: false,
      regionMultiplier,
      effectiveRates: null,
      dailyCostUsd: 0,
      monthlyCostUsd: 0,
      costPer1kTurnsUsd: 0,
      uncachedBaselineDailyCostUsd: 0,
      monthlySavingsUsd: 0,
      savingsPercent: 0,
      warnings,
    };
  }

  const batchActive = input.useBatch && model.batchApi.supported;
  if (input.useBatch && !model.batchApi.supported) {
    warnings.push(
      model.batchApi.notes || "Batch API is not supported on this model/host; standard rates applied.",
    );
  } else if (
    input.useBatch &&
    model.batchApi.supported &&
    model.batchApi.discountPercent === 0
  ) {
    warnings.push(
      "Batch API offers 0% price discount on this provider (separate rate-limit pool only).",
    );
  }

  if (batchActive && input.useCaching && !model.batchApi.cachingAllowedInBatch) {
    warnings.push("Prompt caching is disabled in Batch mode on this provider.");
  }

  const minCacheTokens = model.promptCaching.minCacheableTokens ?? 0;
  const minPrefixForAnyTurn = turnShapes[0]?.cacheablePrefixTokens ?? 0;
  const cacheAllowedByBatch = !batchActive || model.batchApi.cachingAllowedInBatch;
  const cacheEligible =
    input.useCaching &&
    model.promptCaching.supported &&
    cacheAllowedByBatch &&
    peakTurnInputTokens >= minCacheTokens;

  if (
    input.useCaching &&
    model.promptCaching.supported &&
    cacheAllowedByBatch &&
    minPrefixForAnyTurn < minCacheTokens
  ) {
    warnings.push(
      `Turn 1 prefix (${minPrefixForAnyTurn} tokens) is below model caching minimum (${minCacheTokens} tokens); uncached turns bill at standard input rate.`,
    );
  }

  if (input.useCaching && !model.promptCaching.supported) {
    warnings.push("Prompt caching is not supported on this model/provider.");
  }

  const offPeakActive = input.useOffPeak && Boolean(peakTier.offPeakRates);

  let dailyCostUsd = 0;
  let uncachedBaselineDailyCostUsd = 0;
  let anyTurnCached = false;
  let lastRates: ModelCostEstimate["effectiveRates"] = null;

  const totalWritesPerDay = input.cacheWritesPerHour * input.activeHoursPerDay;
  const writesPerTurnSlot = totalWritesPerDay / turnShapes.length;

  for (const turn of turnShapes) {
    const tier = resolveContextTier(model, turn.totalInputTokens)!;
    const baseIn =
      input.useOffPeak && tier.offPeakRates
        ? tier.offPeakRates.inputPer1M
        : tier.inputPer1M;
    const baseOut =
      input.useOffPeak && tier.offPeakRates
        ? tier.offPeakRates.outputPer1M
        : tier.outputPer1M;
    const baseCachedRead =
      input.useOffPeak && tier.offPeakRates
        ? tier.offPeakRates.cachedInputReadPer1M
        : tier.cachedInputReadPer1M;

    const batchFactor =
      batchActive && model.batchApi.discountPercent != null
        ? 1 - model.batchApi.discountPercent / 100
        : 1.0;

    const rIn =
      batchActive && tier.batchInputPer1M != null
        ? tier.batchInputPer1M * regionMultiplier
        : baseIn * batchFactor * regionMultiplier;

    const rOut =
      batchActive && tier.batchOutputPer1M != null
        ? tier.batchOutputPer1M * regionMultiplier
        : baseOut * batchFactor * regionMultiplier;

    const cacheBatchFactor =
      batchActive && model.batchApi.batchDiscountAppliesToCache
        ? batchFactor
        : 1.0;

    const rRead =
      baseCachedRead != null
        ? baseCachedRead * regionMultiplier * cacheBatchFactor
        : null;

    const rawWrite = resolveCacheWriteRate(tier, baseIn, input.cacheTtl);
    const rWrite = rawWrite * regionMultiplier * cacheBatchFactor;

    const turnCacheActive =
      cacheEligible &&
      rRead !== null &&
      turn.cacheablePrefixTokens >= minCacheTokens;

    if (turnCacheActive) anyTurnCached = true;

    const sessionsPerDay = input.requestsPerDay;

    // Uncached synchronous baseline (no caching, no batch, same region & off-peak setting)
    const baselineInRate = baseIn * regionMultiplier;
    const baselineOutRate = baseOut * regionMultiplier;
    uncachedBaselineDailyCostUsd +=
      sessionsPerDay *
      ((turn.totalInputTokens / 1_000_000) * baselineInRate +
        (input.outputTokens / 1_000_000) * baselineOutRate);

    let turnPrefixCost = 0;
    if (turnCacheActive && rRead !== null) {
      const writeReqs = Math.min(sessionsPerDay, writesPerTurnSlot);
      const missReqs = Math.max(
        0,
        sessionsPerDay * (1 - input.cacheHitRate) - writeReqs,
      );
      const hitReqs = Math.max(0, sessionsPerDay - writeReqs - missReqs);

      const prefixM = turn.cacheablePrefixTokens / 1_000_000;
      turnPrefixCost =
        hitReqs * prefixM * rRead +
        missReqs * prefixM * rIn +
        writeReqs * prefixM * rWrite;
    } else {
      turnPrefixCost =
        sessionsPerDay * (turn.cacheablePrefixTokens / 1_000_000) * rIn;
    }

    const turnDynAndOutCost =
      sessionsPerDay *
      ((turn.uncachedDynamicTokens / 1_000_000) * rIn +
        (input.outputTokens / 1_000_000) * rOut);

    dailyCostUsd += turnPrefixCost + turnDynAndOutCost;

    lastRates = {
      inputPer1M: rIn,
      outputPer1M: rOut,
      cachedReadPer1M: turnCacheActive ? rRead : null,
      cacheWritePer1M: turnCacheActive ? rWrite : null,
    };
  }

  // Hourly cache storage (e.g., Gemini explicit context caching; stays un-discounted in batch)
  if (anyTurnCached && model.promptCaching.storagePer1MPerHour != null) {
    const avgCacheableTokens =
      turnShapes.reduce((s, t) => s + t.cacheablePrefixTokens, 0) /
      turnShapes.length;
    dailyCostUsd +=
      (avgCacheableTokens / 1_000_000) *
      model.promptCaching.storagePer1MPerHour *
      input.activeHoursPerDay *
      regionMultiplier;
  }

  const monthlyCostUsd = dailyCostUsd * daysPerMonth;
  const costPer1kTurnsUsd = (dailyCostUsd / totalTurnsPerDay) * 1000;
  const uncachedMonthly = uncachedBaselineDailyCostUsd * daysPerMonth;
  const monthlySavingsUsd = Math.max(0, uncachedMonthly - monthlyCostUsd);
  const savingsPercent =
    uncachedMonthly > 0
      ? Math.max(0, ((uncachedMonthly - monthlyCostUsd) / uncachedMonthly) * 100)
      : 0;

  return {
    model,
    status: "VALID",
    tierLabel: peakTier.label,
    peakTurnInputTokens,
    avgInputTokensPerTurn,
    totalTurnsPerDay,
    cacheActive: anyTurnCached,
    batchActive,
    offPeakActive,
    regionMultiplier,
    effectiveRates: lastRates,
    dailyCostUsd,
    monthlyCostUsd,
    costPer1kTurnsUsd,
    uncachedBaselineDailyCostUsd,
    monthlySavingsUsd,
    savingsPercent,
    warnings,
  };
}

export function calculateAllModels(
  models: readonly PricingModel[],
  input: CalculatorInput,
): ModelCostEstimate[] {
  const results = models.map((m) => calculateModelCost(m, input));
  return results.sort((a, b) => {
    if (a.status !== b.status) {
      return a.status === "VALID" ? -1 : 1;
    }
    return a.monthlyCostUsd - b.monthlyCostUsd;
  });
}
