import { useEffect, useState } from 'react';
import Card from '../../components/ui/Card.jsx';
import Table from '../../components/ui/Table.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import { getMaintenanceRecords } from '../../api/maintenance.js';

const MOCK = [
  { id: '1', vehicle: 'UP32 EF 9012', type: 'Oil change', date: '2026-07-10', status: 'Completed' },
  { id: '2', vehicle: 'UP32 AB 1234', type: 'Brake inspection', date: '2026-07-15', status: 'Scheduled' },
];

const STATUS_TONE = { Scheduled: 'hold', InProgress: 'transit', Completed: 'go', Overdue: 'stop' };

export default function MaintenanceList() {
  const [records, setRecords] = useState(MOCK);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(true);

  useEffect(() => {
    getMaintenanceRecords()
      .then((data) => { setRecords(data); setUsingMock(false); })
      .catch(() => setUsingMock(true))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: 'vehicle', header: 'Vehicle', render: (r) => <span className="font-mono">{r.vehicle}</span> },
    { key: 'type', header: 'Service type' },
    { key: 'date', header: 'Date' },
    { key: 'status', header: 'Status', render: (r) => <Badge tone={STATUS_TONE[r.status] || 'neutral'}>{r.status}</Badge> },
  ];

  return (
    <Card title={`Maintenance${usingMock ? ' (mock data)' : ''}`} action={<Button>Log service</Button>}>
      <Table columns={columns} rows={records} loading={loading} emptyMessage="No maintenance records yet." />
    </Card>
  );
}
