export type ProviderId =
  | "openai"
  | "anthropic"
  | "google"
  | "deepseek"
  | "mistral"
  | "groq"
  | "together"
  | "bedrock";

export type EndpointType =
  | "first_party"
  | "managed_cloud"
  | "inference_specialist";

export type CachingMode = "automatic" | "explicit" | "none";

export type CacheTtlOption =
  | "automatic"
  | "5m"
  | "30m"
  | "1h"
  | "2h"
  | "12h"
  | "custom_hourly";

export interface ContextTier {
  /** Human label, e.g., "Standard (<= 200K)" or "Long Context (> 200K)" */
  label: string;
  /** Inclusive upper bound of total input tokens for this tier; null = up to model max input/context */
  upToTokens: number | null;
  /** Standard uncached input USD per 1M tokens */
  inputPer1M: number;
  /** Standard output USD per 1M tokens (includes thinking/reasoning tokens when billed as output) */
  outputPer1M: number;
  /** Cached input read USD per 1M tokens; null if caching unsupported */
  cachedInputReadPer1M: number | null;
  /** Cache write USD per 1M tokens for 5m TTL; equals inputPer1M if no surcharge, null if N/A */
  cacheWrite5mPer1M: number | null;
  /** Cache write USD per 1M tokens for extended 1h TTL; null if not offered */
  cacheWrite1hPer1M: number | null;
  /** Optional cache write USD per 1M tokens for 30m TTL (e.g., OpenAI in-memory retention) */
  cacheWrite30mPer1M?: number | null;
  /** Optional cache write USD per 1M tokens for 12h TTL (e.g., OpenAI Responses API retention) */
  cacheWrite12hPer1M?: number | null;
  /** Optional explicit tier-level batch input/output rates if not a flat percentage of tier rates */
  batchInputPer1M?: number | null;
  batchOutputPer1M?: number | null;
  /** Optional off-peak USD rates for time-windowed providers (e.g., DeepSeek off-peak vs peak) */
  offPeakRates?: {
    inputPer1M: number;
    outputPer1M: number;
    cachedInputReadPer1M: number | null;
    windowDescriptionUtc: string;
  };
}

export interface PromptCachingRules {
  supported: boolean;
  mode: CachingMode;
  /** Minimum prefix tokens required to trigger caching (e.g., 64, 512, 1024, 4096); null if none/N/A */
  minCacheableTokens: number | null;
  /** Supported TTL options */
  ttlOptions: CacheTtlOption[];
  /** Optional context-cache storage fee in USD per 1M tokens per hour (e.g., Gemini explicit caching) */
  storagePer1MPerHour: number | null;
  /** Optional cache block alignment in tokens (e.g., Mistral 64-token blocks) */
  cacheBlockAlignmentTokens?: number | null;
  /** Explicit behavior notes */
  notes: string;
}

export interface BatchRules {
  supported: boolean;
  /** Exact verified percentage discount off standard tier rates (e.g., 50, 25, 0), or null if unsupported */
  discountPercent: number | null;
  /** Whether prompt caching can be used inside Batch API requests */
  cachingAllowedInBatch: boolean;
  /** Whether the batch discount also reduces cache read/write token rates */
  batchDiscountAppliesToCache: boolean;
  /** Turnaround SLA description, e.g., "Up to 24h" */
  turnaroundWindow: string | null;
  notes: string;
}

export interface RegionalPricingMultiplier {
  regionLabel: string;
  multiplier: number;
}

export interface HostingInfo {
  endpointProvider: string;
  endpointType: EndpointType;
  regionMultipliers?: RegionalPricingMultiplier[];
  hostingNotes: string;
}

export interface PricingModel {
  id: string;
  slug: string;
  displayName: string;
  apiModelId: string;
  provider: ProviderId;
  modelFamily: string;
  openWeight: boolean;
  contextWindowTokens: number;
  /** Optional separate max input limit (e.g., OpenAI 922K max input inside 1.05M total window) */
  maxInputTokens?: number;
  maxOutputTokens: number;
  reasoningTokensBilledAsOutput: boolean;
  /** Whether to generate a dedicated /models/[slug]/ detail page at v1.0 launch */
  featuredDetailPage?: boolean;
  pricingTiers: ContextTier[];
  promptCaching: PromptCachingRules;
  batchApi: BatchRules;
  hosting: HostingInfo;
  effectiveDate: string;
  promotionalExpiryDate: string | null;
  lastVerifiedDate: string;
  officialSourceUrl: string;
  notes: string;
}

export interface PricingRegistry {
  schemaVersion: "1.0.0";
  registryUpdatedAt: string;
  currency: "USD";
  models: PricingModel[];
}

const VALID_PROVIDERS: ReadonlySet<string> = new Set([
  "openai",
  "anthropic",
  "google",
  "deepseek",
  "mistral",
  "groq",
  "together",
  "bedrock",
]);

const VALID_ENDPOINT_TYPES: ReadonlySet<string> = new Set([
  "first_party",
  "managed_cloud",
  "inference_specialist",
]);

const VALID_CACHING_MODES: ReadonlySet<string> = new Set([
  "automatic",
  "explicit",
  "none",
]);

const VALID_TTL_OPTIONS: ReadonlySet<string> = new Set([
  "automatic",
  "5m",
  "30m",
  "1h",
  "2h",
  "12h",
  "custom_hourly",
]);

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isNonNegativeFinite(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v) && v >= 0;
}

function isPositiveFinite(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v) && v > 0;
}

function isNullableNonNegFinite(v: unknown): v is number | null {
  return v === null || isNonNegativeFinite(v);
}

export interface RegistryValidationResult {
  valid: boolean;
  errors: string[];
  registry?: PricingRegistry;
}

export function validateRegistry(input: unknown): RegistryValidationResult {
  const errors: string[] = [];

  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { valid: false, errors: ["Registry root must be a JSON object."] };
  }

  const obj = input as Record<string, unknown>;

  if (obj.schemaVersion !== "1.0.0") {
    errors.push(`schemaVersion must be "1.0.0" (got ${String(obj.schemaVersion)}).`);
  }
  if (typeof obj.registryUpdatedAt !== "string" || !ISO_DATE_RE.test(obj.registryUpdatedAt)) {
    errors.push(`registryUpdatedAt must be ISO YYYY-MM-DD.`);
  }
  if (obj.currency !== "USD") {
    errors.push(`currency must be "USD".`);
  }
  if (!Array.isArray(obj.models) || obj.models.length === 0) {
    errors.push("models must be a non-empty array.");
    return { valid: false, errors };
  }

  const seenIds = new Set<string>();
  const seenSlugs = new Set<string>();

  obj.models.forEach((rawModel, idx) => {
    const prefix = `models[${idx}]`;
    if (!rawModel || typeof rawModel !== "object" || Array.isArray(rawModel)) {
      errors.push(`${prefix} must be an object.`);
      return;
    }

    const m = rawModel as Record<string, unknown>;
    const id = typeof m.id === "string" ? m.id : "";
    const slug = typeof m.slug === "string" ? m.slug : "";

    if (!id) errors.push(`${prefix}.id is required.`);
    else if (seenIds.has(id)) errors.push(`Duplicate model id: ${id}`);
    else seenIds.add(id);

    if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
      errors.push(`${prefix}.slug must be lowercase URL-safe kebab-case (got "${slug}").`);
    } else if (seenSlugs.has(slug)) {
      errors.push(`Duplicate model slug: ${slug}`);
    } else {
      seenSlugs.add(slug);
    }

    if (typeof m.displayName !== "string" || !m.displayName.trim()) {
      errors.push(`${prefix}.displayName is required.`);
    }
    if (typeof m.apiModelId !== "string" || !m.apiModelId.trim()) {
      errors.push(`${prefix}.apiModelId is required.`);
    }
    if (typeof m.provider !== "string" || !VALID_PROVIDERS.has(m.provider)) {
      errors.push(`${prefix}.provider is invalid: ${String(m.provider)}`);
    }
    if (typeof m.openWeight !== "boolean") {
      errors.push(`${prefix}.openWeight must be boolean.`);
    }
    if (!isPositiveFinite(m.contextWindowTokens)) {
      errors.push(`${prefix}.contextWindowTokens must be > 0.`);
    }
    if (m.maxInputTokens !== undefined && !isPositiveFinite(m.maxInputTokens)) {
      errors.push(`${prefix}.maxInputTokens must be > 0 when present.`);
    }
    if (!isPositiveFinite(m.maxOutputTokens)) {
      errors.push(`${prefix}.maxOutputTokens must be > 0.`);
    }
    if (typeof m.reasoningTokensBilledAsOutput !== "boolean") {
      errors.push(`${prefix}.reasoningTokensBilledAsOutput must be boolean.`);
    }

    if (typeof m.effectiveDate !== "string" || !ISO_DATE_RE.test(m.effectiveDate)) {
      errors.push(`${prefix}.effectiveDate must be YYYY-MM-DD.`);
    }
    if (
      m.promotionalExpiryDate !== null &&
      (typeof m.promotionalExpiryDate !== "string" || !ISO_DATE_RE.test(m.promotionalExpiryDate))
    ) {
      errors.push(`${prefix}.promotionalExpiryDate must be null or YYYY-MM-DD.`);
    }
    if (typeof m.lastVerifiedDate !== "string" || !ISO_DATE_RE.test(m.lastVerifiedDate)) {
      errors.push(`${prefix}.lastVerifiedDate must be YYYY-MM-DD.`);
    }
    if (typeof m.officialSourceUrl !== "string" || !m.officialSourceUrl.startsWith("https://")) {
      errors.push(`${prefix}.officialSourceUrl must start with https://.`);
    }

    // Validate pricingTiers
    if (!Array.isArray(m.pricingTiers) || m.pricingTiers.length === 0) {
      errors.push(`${prefix}.pricingTiers must be a non-empty array.`);
    } else {
      let prevBound = 0;
      let sawCatchAll = false;
      m.pricingTiers.forEach((rawTier, tIdx) => {
        const tPrefix = `${prefix}.pricingTiers[${tIdx}]`;
        if (!rawTier || typeof rawTier !== "object") {
          errors.push(`${tPrefix} must be an object.`);
          return;
        }
        const t = rawTier as Record<string, unknown>;
        if (typeof t.label !== "string" || !t.label.trim()) {
          errors.push(`${tPrefix}.label is required.`);
        }
        if (sawCatchAll) {
          errors.push(`${tPrefix} appears after a null catch-all tier.`);
        }
        if (t.upToTokens === null) {
          sawCatchAll = true;
        } else if (isPositiveFinite(t.upToTokens)) {
          if (t.upToTokens <= prevBound) {
            errors.push(`${tPrefix}.upToTokens (${t.upToTokens}) must increase monotonically.`);
          }
          prevBound = t.upToTokens;
        } else {
          errors.push(`${tPrefix}.upToTokens must be a positive number or null.`);
        }

        if (!isNonNegativeFinite(t.inputPer1M)) errors.push(`${tPrefix}.inputPer1M invalid.`);
        if (!isNonNegativeFinite(t.outputPer1M)) errors.push(`${tPrefix}.outputPer1M invalid.`);
        if (!isNullableNonNegFinite(t.cachedInputReadPer1M)) {
          errors.push(`${tPrefix}.cachedInputReadPer1M invalid.`);
        }
        if (!isNullableNonNegFinite(t.cacheWrite5mPer1M)) {
          errors.push(`${tPrefix}.cacheWrite5mPer1M invalid.`);
        }
        if (!isNullableNonNegFinite(t.cacheWrite1hPer1M)) {
          errors.push(`${tPrefix}.cacheWrite1hPer1M invalid.`);
        }
        if (t.cacheWrite30mPer1M !== undefined && !isNullableNonNegFinite(t.cacheWrite30mPer1M)) {
          errors.push(`${tPrefix}.cacheWrite30mPer1M invalid.`);
        }
        if (t.cacheWrite12hPer1M !== undefined && !isNullableNonNegFinite(t.cacheWrite12hPer1M)) {
          errors.push(`${tPrefix}.cacheWrite12hPer1M invalid.`);
        }
        if (t.batchInputPer1M !== undefined && !isNullableNonNegFinite(t.batchInputPer1M)) {
          errors.push(`${tPrefix}.batchInputPer1M invalid.`);
        }
        if (t.batchOutputPer1M !== undefined && !isNullableNonNegFinite(t.batchOutputPer1M)) {
          errors.push(`${tPrefix}.batchOutputPer1M invalid.`);
        }
      });
    }

    // Validate promptCaching
    const pc = m.promptCaching as Record<string, unknown> | undefined;
    if (!pc || typeof pc !== "object") {
      errors.push(`${prefix}.promptCaching is required.`);
    } else {
      if (typeof pc.supported !== "boolean") errors.push(`${prefix}.promptCaching.supported must be boolean.`);
      if (typeof pc.mode !== "string" || !VALID_CACHING_MODES.has(pc.mode)) {
        errors.push(`${prefix}.promptCaching.mode invalid.`);
      }
      if (!isNullableNonNegFinite(pc.minCacheableTokens)) {
        errors.push(`${prefix}.promptCaching.minCacheableTokens invalid.`);
      }
      if (!Array.isArray(pc.ttlOptions)) {
        errors.push(`${prefix}.promptCaching.ttlOptions must be an array.`);
      } else {
        for (const ttl of pc.ttlOptions) {
          if (typeof ttl !== "string" || !VALID_TTL_OPTIONS.has(ttl)) {
            errors.push(`${prefix}.promptCaching.ttlOptions contains invalid TTL: ${String(ttl)}`);
          }
        }
      }
      if (!isNullableNonNegFinite(pc.storagePer1MPerHour)) {
        errors.push(`${prefix}.promptCaching.storagePer1MPerHour invalid.`);
      }
    }

    // Validate batchApi
    const ba = m.batchApi as Record<string, unknown> | undefined;
    if (!ba || typeof ba !== "object") {
      errors.push(`${prefix}.batchApi is required.`);
    } else {
      if (typeof ba.supported !== "boolean") errors.push(`${prefix}.batchApi.supported must be boolean.`);
      if (
        ba.discountPercent !== null &&
        (!isNonNegativeFinite(ba.discountPercent) || ba.discountPercent > 100)
      ) {
        errors.push(`${prefix}.batchApi.discountPercent must be null or 0..100.`);
      }
      if (typeof ba.cachingAllowedInBatch !== "boolean") {
        errors.push(`${prefix}.batchApi.cachingAllowedInBatch must be boolean.`);
      }
      if (typeof ba.batchDiscountAppliesToCache !== "boolean") {
        errors.push(`${prefix}.batchApi.batchDiscountAppliesToCache must be boolean.`);
      }
      if (ba.cachingAllowedInBatch === false && ba.batchDiscountAppliesToCache === true) {
        errors.push(
          `${prefix}.batchApi.batchDiscountAppliesToCache cannot be true when cachingAllowedInBatch is false.`,
        );
      }
    }

    // Validate hosting
    const h = m.hosting as Record<string, unknown> | undefined;
    if (!h || typeof h !== "object") {
      errors.push(`${prefix}.hosting is required.`);
    } else {
      if (typeof h.endpointProvider !== "string" || !h.endpointProvider.trim()) {
        errors.push(`${prefix}.hosting.endpointProvider is required.`);
      }
      if (typeof h.endpointType !== "string" || !VALID_ENDPOINT_TYPES.has(h.endpointType)) {
        errors.push(`${prefix}.hosting.endpointType invalid.`);
      }
    }
  });

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    registry: input as PricingRegistry,
  };
}
