import Link from "next/link";
import { notFound } from "next/navigation";
import { MAST_LABELS, type MastType } from "@mast/core";
import { getTestResponseById } from "@mast/database";
import ResultChart from "./result-chart";

export default async function ResultPage({ params }: { params: { id: string } }) {
  const response = await getTestResponseById(params.id);

  if (!response) notFound();

  const primary = response.primaryType as MastType;
  const secondary = response.secondaryType as MastType;
  const scores = [
    { type: "M", label: MAST_LABELS.M.label, score: response.scoreM },
    { type: "A", label: MAST_LABELS.A.label, score: response.scoreA },
    { type: "S", label: MAST_LABELS.S.label, score: response.scoreS },
    { type: "T", label: MAST_LABELS.T.label, score: response.scoreT }
  ];

  return (
    <main className="min-h-screen px-4 py-8">
      <section className="glass-panel mx-auto max-w-5xl rounded-2xl p-5 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold">તમારું MAST પરિણામ</p>
            <h1 className="mt-2 text-3xl font-bold text-ink">{response.participantName}</h1>
            <p className="mt-2 text-slate-600">
              {response.center.zone.name} / {response.center.name} / ઉંમર {response.age}
            </p>
          </div>
          <a
            href={`/api/responses/${response.id}/pdf`}
            className="rounded-xl bg-ink px-5 py-3 text-center font-bold text-white shadow-lg shadow-slate-300"
          >
            રિપોર્ટ ડાઉનલોડ
          </a>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-white/80 p-5 ring-1 ring-blue-100">
            <p className="text-sm text-slate-500">Primary</p>
            <p className="mt-1 text-3xl font-bold text-ink">{primary} - {MAST_LABELS[primary].label}</p>
          </div>
          <div className="rounded-xl bg-white/80 p-5 ring-1 ring-blue-100">
            <p className="text-sm text-slate-500">Secondary</p>
            <p className="mt-1 text-3xl font-bold text-ink">{secondary} - {MAST_LABELS[secondary].label}</p>
          </div>
          <div className="rounded-xl bg-white/80 p-5 ring-1 ring-blue-100">
            <p className="text-sm text-slate-500">Sequence</p>
            <p className="mt-1 text-3xl font-bold text-ink">{response.sequence}</p>
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-white/80 p-5 ring-1 ring-blue-100">
          <ResultChart scores={scores} />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {[primary, secondary].map((type) => (
            <article key={type} className="rounded-xl border border-blue-100 bg-white/75 p-5">
              <h2 className="text-xl font-bold text-ink">{type} - {MAST_LABELS[type].label}</h2>
              <p className="mt-2 leading-7 text-slate-700">{MAST_LABELS[type].description}</p>
            </article>
          ))}
        </div>

        <Link href="/" className="mt-6 inline-flex rounded-xl bg-white px-5 py-3 font-bold text-ink ring-1 ring-slate-200">
          નવી ટેસ્ટ ભરો
        </Link>
      </section>
    </main>
  );
}
