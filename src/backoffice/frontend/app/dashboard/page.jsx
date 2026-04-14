import { KpiCard } from '../../components/kpi-card';

export default function ModulePage() {
  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-3xl font-bold">Executive Dashboard</h2>
        <p className="text-slate-400">MRR, churn, health, failed payments and live operations.</p>
      </header>
      <div className="grid md:grid-cols-4 gap-4">
        <KpiCard title="MRR" value="$168,540" delta="+8.2% MoM" />
        <KpiCard title="ARR" value="$2,022,480" delta="+7.1% YoY" />
        <KpiCard title="Active Subscriptions" value="1,408" delta="+64 net" />
        <KpiCard title="Failed Payments" value="14" delta="-11% vs last week" />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 h-80">Line/Bar/Pie charts via Recharts + polling/WebSocket.</div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 h-80">Live orders feed and system alerts panel.</div>
      </div>
    </section>
  );
}
