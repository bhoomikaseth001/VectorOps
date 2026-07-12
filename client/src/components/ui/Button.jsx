const variants = {
  primary: 'bg-signal text-ink hover:bg-signal-dark',
  secondary: 'bg-ink text-white hover:bg-ink-700',
  ghost: 'bg-transparent text-ink hover:bg-ink/5 border border-ink/15',
  danger: 'bg-line-stop text-white hover:opacity-90',
};

export default function Button({
  children,
  variant = 'primary',
  className = '',
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
