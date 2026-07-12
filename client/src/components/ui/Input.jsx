export default function Input({ label, error, className = '', id, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-ink/70">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`rounded border px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-signal/40 focus:border-signal outline-none ${
          error ? 'border-line-stop' : 'border-ink/15'
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-line-stop">{error}</span>}
    </div>
  );
}
