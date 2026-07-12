import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  LayoutDashboard,
  Truck,
  Users,
  Route,
  Wrench,
  Receipt,
  BarChart3,
} from 'lucide-react';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, roles: null }, // null = everyone
  { to: '/vehicles', label: 'Vehicles', icon: Truck, roles: ['FleetManager', 'SafetyOfficer'] },
  { to: '/drivers', label: 'Drivers', icon: Users, roles: ['FleetManager', 'SafetyOfficer'] },
  { to: '/trips', label: 'Trips', icon: Route, roles: ['FleetManager', 'Driver'] },
  { to: '/maintenance', label: 'Maintenance', icon: Wrench, roles: ['FleetManager', 'SafetyOfficer'] },
  { to: '/expenses', label: 'Fuel & Expenses', icon: Receipt, roles: ['FleetManager', 'FinancialAnalyst'] },
  { to: '/reports', label: 'Reports', icon: BarChart3, roles: ['FleetManager', 'FinancialAnalyst'] },
];

export default function Sidebar() {
  const { user, hasRole } = useAuth();
  const items = NAV.filter((item) => !item.roles || hasRole(...item.roles));

  return (
    <aside className="w-60 shrink-0 bg-ink text-fog flex flex-col h-screen sticky top-0">
      <div className="px-5 py-5 border-b border-white/10">
        <p className="font-display text-lg font-semibold text-white">TransitOps</p>
        <p className="text-xs text-fog/70 mt-0.5">{user?.role}</p>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-signal text-ink'
                  : 'text-fog hover:bg-white/5 hover:text-fog-light'
              }`
            }
          >
            <Icon size={17} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-white/10 text-xs text-fog/50">
        v0.1 · hackathon build
      </div>
    </aside>
  );
}
