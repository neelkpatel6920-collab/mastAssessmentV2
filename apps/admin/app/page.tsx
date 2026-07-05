import { MAST_LABELS, type MastType } from "@mast/core";
import { getDashboardData, listZonesWithCenters } from "@mast/database";
import { requireAdmin } from "./auth";
import LogoutButton from "./logout-button";
import ResponsesTable from "./responses-table";

export default async function AdminDashboard() {
  const session = await requireAdmin();

  // Fetch dashboard stats + zones for filter dropdowns in parallel
  const [{ total, byType, latest }, zones] = await Promise.all([
    getDashboardData(session),
    listZonesWithCenters()
  ]);

  const counts = Object.fromEntries(byType.map((row) => [row.primaryType, row._count]));

  // Serialize Date objects so they can be passed to the Client Component
  const serializedRows = latest.map((r) => ({
    id: r.id,
    participantName: r.participantName,
    age: r.age,
    scoreM: r.scoreM,
    scoreA: r.scoreA,
    scoreS: r.scoreS,
    scoreT: r.scoreT,
    primaryType: r.primaryType,
    secondaryType: r.secondaryType,
    submittedAt: r.submittedAt.toISOString(),
    center: r.center,
  }));

  const sessionInfo = {
    role: session.role,
    zoneId: session.zoneId,
    centerId: session.centerId,
  };

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl space-y-5">

        {/* Header */}
        <div className="panel rounded-2xl p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold">
                {session.role}
              </p>
              <h1 className="mt-2 text-3xl font-bold text-ink">MAST Dashboard</h1>
              <p className="mt-1 text-sm text-slate-600">
                {session.name} / {session.email}
              </p>
            </div>
            <div className="flex gap-3">
              <a
                href="/api/admin/responses/export"
                className="rounded-xl bg-white px-4 py-3 font-bold text-ink ring-1 ring-slate-200 hover:bg-slate-50"
              >
                Export CSV
              </a>
              <LogoutButton />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-5">
          <Metric label="Total responses" value={total} />
          {(["M", "A", "S", "T"] as MastType[]).map((type) => (
            <Metric
              key={type}
              label={`${type} — ${MAST_LABELS[type].label}`}
              value={counts[type] ?? 0}
            />
          ))}
        </div>

        {/* Responses table — Client Component with filters + delete */}
        <ResponsesTable
          session={sessionInfo}
          initialRows={serializedRows}
          initialTotal={total}
          zones={zones}
        />

      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="panel rounded-xl p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-ink">{value}</p>
    </div>
  );
}
