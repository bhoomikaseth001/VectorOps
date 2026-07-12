import { useEffect, useState } from 'react';
import StatCard from '../../components/ui/StatCard.jsx';
import Card from '../../components/ui/Card.jsx';
import { getDashboardSummary } from '../../api/reports.js';

// Static fallback so the page looks alive before the reports endpoint is wired up.
const FALLBACK = {
  activeVehicles: 18,
  vehiclesInMaintenance: 3,
  tripsToday: 42,
  fuelSpendMonth: 128400,
};

export default function Dashboard() {
  const [summary, setSummary] = useState(FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardSummary()
      .then((data) => setSummary(data))
      .catch(() => setSummary(FALLBACK)) // keep static data if API isn't ready yet
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active vehicles" value={summary.activeVehicles} tone="go" />
        <StatCard label="In maintenance" value={summary.vehiclesInMaintenance} tone="hold" />
        <StatCard label="Trips today" value={summary.tripsToday} tone="transit" />
        <StatCard
          label="Fuel spend (month)"
          value={`₹${Number(summary.fuelSpendMonth).toLocaleString('en-IN')}`}
          tone="neutral"
        />
      </div>

      <Card title="Fleet activity">
        <p className="text-sm text-ink/50">
          Charts go here once recharts is wired up (utilization, ROI, fuel efficiency trend).
        </p>
        {loading && <p className="text-xs text-ink/30 mt-2">Refreshing…</p>}
      </Card>
    </div>
  );
}
