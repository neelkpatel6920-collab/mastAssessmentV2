import Link from "next/link";
import { notFound } from "next/navigation";
import { MAST_LABELS, type MastType } from "@mast/core";
import { getScopedResponseById } from "@mast/database";
import { requireAdmin } from "../../auth";

export default async function ResponseDetailPage({ params }: { params: { id: string } }) {
  const session = await requireAdmin();
  const response = await getScopedResponseById(session, params.id);
  if (!response) notFound();

  const scores = [
    ["M", response.scoreM],
    ["A", response.scoreA],
    ["S", response.scoreS],
    ["T", response.scoreT]
  ] as Array<[MastType, number]>;

  return (
    <main className="min-h-screen px-4 py-6">
      <section className="panel mx-auto max-w-5xl rounded-2xl p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link href="/" className="text-sm font-bold text-blue-700">Back to dashboard</Link>
            <h1 className="mt-3 text-3xl font-bold text-ink">{response.participantName}</h1>
            <p className="mt-2 text-slate-600">
              {response.center.zone.name} / {response.center.name} / Age {response.age}
            </p>
          </div>
          <a href={`/api/admin/responses/${response.id}/pdf`} className="rounded-xl bg-ink px-5 py-3 text-center font-bold text-white">
            Download report
          </a>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Card label="Primary" value={`${response.primaryType} - ${MAST_LABELS[response.primaryType as MastType].label}`} />
          <Card label="Secondary" value={`${response.secondaryType} - ${MAST_LABELS[response.secondaryType as MastType].label}`} />
          <Card label="Sequence" value={response.sequence} />
        </div>

        <div className="mt-6 rounded-xl bg-white/80 p-5 ring-1 ring-blue-100">
          <h2 className="text-xl font-bold text-ink">Scores</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            {scores.map(([type, score]) => (
              <div key={type} className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">{type} - {MAST_LABELS[type].label}</p>
                <p className="mt-1 text-3xl font-bold">{score}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/80 p-5 ring-1 ring-blue-100">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-ink">{value}</p>
    </div>
  );
}
