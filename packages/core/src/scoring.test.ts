import { describe, expect, it } from "vitest";
import { scoreAnswers, validateAnswers, type BlockAnswer } from "./scoring";

const allMostA: BlockAnswer[] = Array.from({ length: 10 }, (_, index) => ({
  blockNumber: index + 1,
  most: "A",
  least: "B"
}));

describe("MAST scoring", () => {
  it("rejects missing blocks", () => {
    expect(() => validateAnswers(allMostA.slice(0, 9))).toThrow("Exactly 10");
  });

  it("rejects duplicate most and least", () => {
    expect(() =>
      validateAnswers([{ blockNumber: 1, most: "A", least: "A" }, ...allMostA.slice(1)])
    ).toThrow("different");
  });

  it("always totals 40", () => {
    const score = scoreAnswers(allMostA);
    expect(score.scoreM + score.scoreA + score.scoreS + score.scoreT).toBe(40);
  });

  it("maps original DISC scores into MAST labels", () => {
    const score = scoreAnswers(allMostA);
    expect(score.scoreA).toBeGreaterThan(0);
    expect(score.scoreM).toBeGreaterThan(0);
    expect(score.sequence).not.toContain("D");
    expect(score.sequence).not.toContain("I");
    expect(score.sequence).not.toContain("C");
  });

  it("uses M-A-S-T tie priority", () => {
    const tied: BlockAnswer[] = [
      { blockNumber: 1, most: "A", least: "B" },
      { blockNumber: 2, most: "A", least: "B" },
      { blockNumber: 3, most: "A", least: "B" },
      { blockNumber: 4, most: "A", least: "B" },
      { blockNumber: 5, most: "A", least: "B" },
      { blockNumber: 6, most: "C", least: "D" },
      { blockNumber: 7, most: "C", least: "D" },
      { blockNumber: 8, most: "C", least: "D" },
      { blockNumber: 9, most: "C", least: "D" },
      { blockNumber: 10, most: "C", least: "D" }
    ];
    const score = scoreAnswers(tied);
    expect(score.sequence.split("-").sort()).toEqual(["A", "M", "S", "T"].sort());
  });
});
