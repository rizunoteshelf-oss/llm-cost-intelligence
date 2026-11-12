export interface TokenEstimateResult {
  characters: number;
  words: number;
  lines: number;
  contentKind: "prose" | "code_or_structured";
  estimatedTokens: number;
  rangeLow: number;
  rangeHigh: number;
  claude47PlusApproxTokens: number;
}

const CODE_HINT_RE = /[{}\[\];<>:=`]|=>|\bfunction\b|\bconst\b|\bimport\b|\bSELECT\b/g;

/**
 * 0 KB client-side heuristic token estimator.
 * Runs 100% locally in browser memory — zero network calls or external dependencies.
 */
export function estimateTokens(text: string): TokenEstimateResult {
  const normalized = text ?? "";
  const characters = normalized.length;

  if (characters === 0) {
    return {
      characters: 0,
      words: 0,
      lines: 0,
      contentKind: "prose",
      estimatedTokens: 0,
      rangeLow: 0,
      rangeHigh: 0,
      claude47PlusApproxTokens: 0,
    };
  }

  const trimmed = normalized.trim();
  const words = trimmed ? trimmed.split(/\s+/).length : 0;
  const lines = normalized.split(/\r?\n/).length;

  const codeHits = (normalized.match(CODE_HINT_RE) ?? []).length;
  const symbolDensity = codeHits / Math.max(1, characters);
  const contentKind: TokenEstimateResult["contentKind"] =
    symbolDensity >= 0.025 ? "code_or_structured" : "prose";

  const charsPerToken = contentKind === "code_or_structured" ? 3.3 : 4.0;
  const charEstimate = Math.ceil(characters / charsPerToken);
  const wordEstimate = Math.ceil(words * 1.33);

  const estimatedTokens = Math.max(
    1,
    contentKind === "code_or_structured"
      ? charEstimate
      : Math.round((charEstimate + wordEstimate) / 2),
  );

  const rangeLow = Math.max(1, Math.floor(estimatedTokens * 0.85));
  const rangeHigh = Math.ceil(estimatedTokens * 1.15);
  const claude47PlusApproxTokens = Math.ceil(estimatedTokens * 1.3);

  return {
    characters,
    words,
    lines,
    contentKind,
    estimatedTokens,
    rangeLow,
    rangeHigh,
    claude47PlusApproxTokens,
  };
}
