import { describe, expect, it } from "vitest";
import { estimateTokens } from "./estimate";

describe("heuristic token estimator", () => {
  it("returns zeroes for empty text", () => {
    expect(estimateTokens("")).toEqual({
      characters: 0,
      words: 0,
      lines: 0,
      contentKind: "prose",
      estimatedTokens: 0,
      rangeLow: 0,
      rangeHigh: 0,
      claude47PlusApproxTokens: 0,
    });
  });

  it("estimates English prose and includes +/-15% range + Claude 4.7+ ~1.3x guide", () => {
    const sample =
      "Retrieval augmented generation reduces hallucinations by grounding model answers in verified company documents.";
    const res = estimateTokens(sample);
    expect(res.contentKind).toBe("prose");
    expect(res.estimatedTokens).toBeGreaterThan(15);
    expect(res.rangeLow).toBeLessThanOrEqual(res.estimatedTokens);
    expect(res.rangeHigh).toBeGreaterThanOrEqual(res.estimatedTokens);
    expect(res.claude47PlusApproxTokens).toBeGreaterThanOrEqual(res.estimatedTokens);
  });

  it("detects code/structured JSON density", () => {
    const code = `const calc = (a: number, b: number) => { return { sum: a + b, ok: true }; };`;
    const res = estimateTokens(code);
    expect(res.contentKind).toBe("code_or_structured");
    expect(res.estimatedTokens).toBeGreaterThan(15);
  });
});
