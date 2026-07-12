export default function Card({ children, className = '', title, action }) {
  return (
    <div className={`bg-white rounded shadow-panel border border-ink/5 ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink/5">
          {title && <h3 className="text-sm font-semibold text-ink/70 uppercase tracking-wide">{title}</h3>}
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}
