export function KpiCard({ title, value, delta }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <p className="text-slate-400 text-sm">{title}</p>
      <h3 className="text-2xl font-semibold mt-2">{value}</h3>
      <p className="text-emerald-400 text-sm mt-1">{delta}</p>
    </div>
  );
}
