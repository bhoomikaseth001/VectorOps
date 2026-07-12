import { useAuth } from '../../context/AuthContext.jsx';
import { LogOut } from 'lucide-react';

export default function Topbar({ title }) {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-ink/10 bg-white/80 backdrop-blur sticky top-0 z-10">
      <h1 className="font-display text-xl font-semibold text-ink">{title}</h1>

      <div className="flex items-center gap-4">
        <div className="text-right leading-tight">
          <p className="text-sm font-medium text-ink">{user?.name}</p>
          <p className="text-xs text-ink/40">{user?.role}</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-sm text-ink/50 hover:text-line-stop transition-colors"
          aria-label="Log out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
