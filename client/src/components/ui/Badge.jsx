// Transit-line style status chip. `tone` maps to the `line` color set.
const tones = {
  go: 'bg-line-go/10 text-line-go',
  hold: 'bg-line-hold/10 text-line-hold',
  stop: 'bg-line-stop/10 text-line-stop',
  transit: 'bg-line-transit/10 text-line-transit',
  neutral: 'bg-ink/5 text-ink/60',
};

const dots = {
  go: 'bg-line-go',
  hold: 'bg-line-hold',
  stop: 'bg-line-stop',
  transit: 'bg-line-transit',
  neutral: 'bg-ink/40',
};

export default function Badge({ tone = 'neutral', children }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium ${tones[tone]}`}>
      <span className={`status-dot ${dots[tone]}`} />
      {children}
    </span>
  );
}
