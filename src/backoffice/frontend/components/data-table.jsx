export function DataTable({ columns, rows }) {
  return (
    <div className="rounded-xl border border-slate-800 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-900">
          <tr>{columns.map((c) => <th key={c} className="text-left px-3 py-2">{c}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={idx} className="border-t border-slate-800">
              {Object.values(r).map((v, i) => <td key={i} className="px-3 py-2">{String(v)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
