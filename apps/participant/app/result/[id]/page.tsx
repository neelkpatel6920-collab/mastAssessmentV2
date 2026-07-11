import { notFound } from "next/navigation";
import Link from "next/link";
import { MAST_LABELS, type MastType } from "@mast/core";
import { getTestResponseById } from "@mast/database";
import SecondTest from "./second-test";

export default async function ResultPage({ params }: { params: { id: string } }) {
  const response = await getTestResponseById(params.id);

  if (!response) notFound();

  const primary = response.primaryType as MastType;

  return (
    <main className="min-h-screen px-4 py-8">
      <section className="glass-panel mx-auto max-w-2xl rounded-2xl p-5 sm:p-8">
        {/* Participant info */}
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold">તમારું MAST પરિણામ</p>
        <h1 className="mt-2 text-3xl font-bold text-ink">{response.participantName}</h1>
        <p className="mt-2 text-slate-600">
          {response.center.zone.name} / {response.center.name} / ઉંમર {response.age}
        </p>

        {/* Primary Type */}
        <div className="mt-6 rounded-xl bg-white/80 p-6 ring-1 ring-blue-100">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Primary Type</p>
          <p className="mt-2 text-4xl font-black text-ink">
            {primary} — {MAST_LABELS[primary].label}
          </p>
          <p className="mt-1 text-base font-medium text-slate-500">{MAST_LABELS[primary].english}</p>
          <p className="mt-3 leading-7 text-slate-700">{MAST_LABELS[primary].description}</p>
        </div>

        {/* Second test */}
        <SecondTest responseId={response.id} primaryType={primary} />

        <Link href="/" className="mt-6 inline-flex rounded-xl bg-white px-5 py-3 font-bold text-ink ring-1 ring-slate-200">
          નવી ટેસ્ટ ભરો
        </Link>
      </section>
    </main>
  );
}
