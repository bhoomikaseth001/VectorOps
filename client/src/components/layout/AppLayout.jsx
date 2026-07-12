import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';

const TITLES = {
  '/': 'Dashboard',
  '/vehicles': 'Vehicle Registry',
  '/drivers': 'Drivers',
  '/maintenance': 'Maintenance',
  '/trips': 'Trips',
  '/expenses': 'Fuel & Expenses',
};

export default function AppLayout() {
  const { pathname } = useLocation();
  const title = TITLES[pathname] || 'TransitOps';

  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title={title} />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}