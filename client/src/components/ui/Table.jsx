/**
 * Minimal, consistent table shell.
 * columns: [{ key, header, render?(row) }]
 */
export default function Table({ columns, rows, emptyMessage = 'No records yet.', loading }) {
  if (loading) {
    return <div className="py-10 text-center text-sm text-ink/40">Loading…</div>;
  }
  if (!rows?.length) {
    return <div className="py-10 text-center text-sm text-ink/40">{emptyMessage}</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-ink/10 text-left">
            {columns.map((col) => (
              <th key={col.key} className="py-2 px-3 font-semibold text-ink/50 uppercase text-xs tracking-wide">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id || i} className="border-b border-ink/5 hover:bg-ink/[0.02]">
              {columns.map((col) => (
                <td key={col.key} className="py-3 px-3 text-ink/80">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
