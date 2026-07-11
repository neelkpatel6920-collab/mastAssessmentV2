"use client";

import { useState } from "react";
import Link from "next/link";
import {
  SECOND_TEST_INSTRUCTION,
  SECOND_TEST_INVALID_MESSAGE,
  SECOND_TEST_STATEMENTS,
  SECOND_TEST_COUNT,
  scoreSecondTest,
  type MastType
} from "@mast/core";
import { MAST_LABELS } from "@mast/core";

type Stage = "instruction" | "questions" | "submitting" | "valid" | "invalid";

export default function SecondTest({
  responseId,
  primaryType
}: {
  responseId: string;
  primaryType: MastType;
}) {
  const statements = SECOND_TEST_STATEMENTS[primaryType];
  const [stage, setStage] = useState<Stage>("instruction");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [error, setError] = useState("");

  const typeLabel = `${primaryType} — ${MAST_LABELS[primaryType].label}`;

  async function handleAnswer(answer: boolean) {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (newAnswers.length < SECOND_TEST_COUNT) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // All answered — auto-submit
      setStage("submitting");
      const { isValid } = scoreSecondTest(newAnswers);
      const valid = isValid ? "Valid" : "Invalid";

      try {
        const res = await fetch(`/api/responses/${responseId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ secondTestAnswers: newAnswers, valid })
        });
        if (!res.ok) throw new Error("Save failed");
        setStage(isValid ? "valid" : "invalid");
      } catch {
        setError("ડેટા સેવ કરવામાં સમસ્યા આવી. ફરી પ્રયાસ કરો.");
        setStage("questions"); // stay on last question so user sees error
      }
    }
  }

  // ── Instruction screen ──────────────────────────────────────────────────────
  if (stage === "instruction") {
    return (
      <section className="mt-8 rounded-2xl border border-blue-100 bg-white/80 p-6 sm:p-8">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-gold">Second Test</p>
        <h2 className="mt-2 text-2xl font-black text-ink">
          Your Primary Type: <span className="text-blue-700">{typeLabel}</span>
        </h2>

        <div className="mt-5 rounded-xl bg-amber-50 border border-amber-200 p-4">
          <p className="text-base font-semibold leading-8 text-slate-800">{SECOND_TEST_INSTRUCTION}</p>
        </div>

        <button
          type="button"
          onClick={() => setStage("questions")}
          className="mt-6 w-full rounded-xl bg-ink px-5 py-4 text-lg font-black text-white shadow-lg shadow-slate-300 transition hover:bg-slate-800"
        >
          શરૂ કરો →
        </button>
      </section>
    );
  }

  // ── Submitting screen ───────────────────────────────────────────────────────
  if (stage === "submitting") {
    return (
      <section className="mt-8 rounded-2xl border border-blue-100 bg-white/80 p-6 sm:p-8 text-center">
        <div className="flex justify-center">
          <svg className="h-8 w-8 animate-spin text-blue-600" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        </div>
        <p className="mt-4 text-base font-semibold text-slate-600">સેવ થઈ રહ્યું છે...</p>
      </section>
    );
  }

  // ── Valid screen ────────────────────────────────────────────────────────────
  if (stage === "valid") {
    return (
      <section className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 sm:p-8 text-center">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <svg className="h-9 w-9 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h2 className="mt-4 text-2xl font-black text-emerald-800">ટેસ્ટ સંપૂર્ણ!</h2>
        <p className="mt-2 text-base font-semibold text-emerald-700">
          તમારી Primary Type <strong>{typeLabel}</strong> Confirmed છે.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-xl bg-ink px-6 py-3 font-bold text-white shadow-lg shadow-slate-300 transition hover:bg-slate-800"
        >
          નવી ટેસ્ટ ભરો →
        </Link>
      </section>
    );
  }

  // ── Invalid screen ──────────────────────────────────────────────────────────
  if (stage === "invalid") {
    return (
      <section className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 p-6 sm:p-8 text-center">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
            <svg className="h-9 w-9 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
        </div>
        <p className="mt-4 text-base font-semibold leading-8 text-rose-800">
          {SECOND_TEST_INVALID_MESSAGE}
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-xl bg-rose-700 px-6 py-3 font-bold text-white shadow-lg shadow-rose-200 transition hover:bg-rose-800"
        >
          નવી ટેસ્ટ આપો
        </Link>
      </section>
    );
  }

  // ── Questions screen ────────────────────────────────────────────────────────
  const statement = statements[currentIndex];
  const progress = currentIndex + 1;

  return (
    <section className="mt-8 rounded-2xl border border-blue-100 bg-white/80 p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-gold">Second Test</p>
        <span className="rounded-lg bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">
          {progress} / {SECOND_TEST_COUNT}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-2 w-full rounded-full bg-slate-100">
        <div
          className="h-2 rounded-full bg-blue-500 transition-all duration-300"
          style={{ width: `${(currentIndex / SECOND_TEST_COUNT) * 100}%` }}
        />
      </div>

      <div className="mt-6 rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
        <p className="text-lg font-semibold leading-8 text-slate-800">{statement}</p>
      </div>

      {error && (
        <p className="mt-3 rounded-lg bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700">{error}</p>
      )}

      <div className="mt-5 grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => { setError(""); handleAnswer(true); }}
          className="rounded-xl bg-emerald-600 px-5 py-4 text-lg font-black text-white shadow transition hover:bg-emerald-700"
        >
          ✓ &nbsp;હા / Yes
        </button>
        <button
          type="button"
          onClick={() => { setError(""); handleAnswer(false); }}
          className="rounded-xl bg-slate-100 px-5 py-4 text-lg font-black text-slate-800 shadow transition hover:bg-slate-200"
        >
          ✗ &nbsp;ના / No
        </button>
      </div>

      <p className="mt-4 text-center text-xs font-semibold text-slate-400">
        એક વખત જવાબ આપ્યા પછી પાછું નહીં આવી શકાય.
      </p>
    </section>
  );
}
