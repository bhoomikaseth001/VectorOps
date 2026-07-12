export default function StatCard({ label, value, sublabel, tone = 'neutral' }) {
  const toneText = {
    go: 'text-line-go',
    hold: 'text-line-hold',
    stop: 'text-line-stop',
    transit: 'text-line-transit',
    neutral: 'text-ink',
  }[tone];

  return (
    <div className="bg-white rounded shadow-panel border border-ink/5 p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">{label}</p>
      <p className={`font-display text-3xl font-semibold mt-2 ${toneText}`}>{value}</p>
      {sublabel && <p className="text-xs text-ink/40 mt-1">{sublabel}</p>}
    </div>
  );
}
