import { DataTable } from '../../components/data-table';

const rows = [
  { name: 'Sample 1', status: 'active', owner: 'ops@orderlify.com' },
  { name: 'Sample 2', status: 'pending', owner: 'finance@orderlify.com' },
];

export default function ModulePage() {
  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-3xl font-bold">billing Module</h2>
        <p className="text-slate-400">Enterprise controls with filtering, sorting and pagination.</p>
      </header>
      <DataTable columns={['Name', 'Status', 'Owner']} rows={rows} />
    </section>
  );
}
