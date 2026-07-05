import { TEST_BLOCKS, type MastType, type OptionCode } from "./test-content";

type DiscType = "D" | "I" | "S" | "C";

export type BlockAnswer = {
  blockNumber: number;
  most: OptionCode;
  least: OptionCode;
};

export type MastScore = {
  scoreM: number;
  scoreA: number;
  scoreS: number;
  scoreT: number;
  primaryType: MastType;
  secondaryType: MastType;
  sequence: string;
};

const OPTION_CODES: OptionCode[] = ["A", "B", "C", "D"];
const TIE_PRIORITY: MastType[] = ["M", "A", "S", "T"];

const DISC_TO_MAST: Record<DiscType, MastType> = {
  D: "A",
  I: "M",
  S: "S",
  C: "T"
};

const ANSWER_KEY: Record<number, Record<OptionCode, DiscType>> = {
  1: { A: "D", B: "I", C: "S", D: "C" },
  2: { A: "C", B: "D", C: "I", D: "S" },
  3: { A: "S", B: "C", C: "D", D: "I" },
  4: { A: "I", B: "S", C: "C", D: "D" },
  5: { A: "D", B: "C", C: "S", D: "I" },
  6: { A: "I", B: "D", C: "C", D: "S" },
  7: { A: "S", B: "I", C: "D", D: "C" },
  8: { A: "C", B: "S", C: "I", D: "D" },
  9: { A: "D", B: "S", C: "C", D: "I" },
  10: { A: "I", B: "C", C: "D", D: "S" }
};

export function validateAnswers(answers: BlockAnswer[]): void {
  if (!Array.isArray(answers) || answers.length !== TEST_BLOCKS.length) {
    throw new Error("Exactly 10 answers are required.");
  }

  const seen = new Set<number>();
  for (const answer of answers) {
    if (!Number.isInteger(answer.blockNumber) || answer.blockNumber < 1 || answer.blockNumber > 10) {
      throw new Error("Every answer must have a valid block number.");
    }
    if (seen.has(answer.blockNumber)) {
      throw new Error(`Duplicate answer for block ${answer.blockNumber}.`);
    }
    seen.add(answer.blockNumber);
    if (!OPTION_CODES.includes(answer.most) || !OPTION_CODES.includes(answer.least)) {
      throw new Error(`Block ${answer.blockNumber} has an invalid option.`);
    }
    if (answer.most === answer.least) {
      throw new Error(`Block ${answer.blockNumber} must use different most and least options.`);
    }
  }
}

export function scoreAnswers(answers: BlockAnswer[]): MastScore {
  validateAnswers(answers);

  const totals: Record<MastType, number> = { M: 0, A: 0, S: 0, T: 0 };

  for (const answer of answers) {
    const key = ANSWER_KEY[answer.blockNumber];
    for (const option of OPTION_CODES) {
      const points = option === answer.most ? 2 : option === answer.least ? 0 : 1;
      const mastType = DISC_TO_MAST[key[option]];
      totals[mastType] += points;
    }
  }

  const total = totals.M + totals.A + totals.S + totals.T;
  if (total !== 40) {
    throw new Error(`Invalid score total ${total}; expected 40.`);
  }

  const ordered = [...TIE_PRIORITY].sort((left, right) => {
    const scoreDelta = totals[right] - totals[left];
    if (scoreDelta !== 0) return scoreDelta;
    return TIE_PRIORITY.indexOf(left) - TIE_PRIORITY.indexOf(right);
  });

  return {
    scoreM: totals.M,
    scoreA: totals.A,
    scoreS: totals.S,
    scoreT: totals.T,
    primaryType: ordered[0],
    secondaryType: ordered[1],
    sequence: ordered.join("-")
  };
}
