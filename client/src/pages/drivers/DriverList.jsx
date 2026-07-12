import { useEffect, useState } from 'react';
import Card from '../../components/ui/Card.jsx';
import Table from '../../components/ui/Table.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import { getDrivers } from '../../api/drivers.js';

const MOCK_DRIVERS = [
  { id: '1', name: 'Ramesh Yadav', licenseNumber: 'UP32-2019-0044521', status: 'Available' },
  { id: '2', name: 'Suresh Kumar', licenseNumber: 'UP32-2020-0011983', status: 'OnTrip' },
];

const STATUS_TONE = { Available: 'go', OnTrip: 'transit', OffDuty: 'neutral', Suspended: 'stop' };

export default function DriverList() {
  const [drivers, setDrivers] = useState(MOCK_DRIVERS);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(true);

  useEffect(() => {
    getDrivers()
      .then((data) => { setDrivers(data); setUsingMock(false); })
      .catch(() => setUsingMock(true))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'licenseNumber', header: 'License No.', render: (r) => <span className="font-mono">{r.licenseNumber}</span> },
    { key: 'status', header: 'Status', render: (r) => <Badge tone={STATUS_TONE[r.status] || 'neutral'}>{r.status}</Badge> },
    { key: 'actions', header: '', render: () => <button className="text-sm text-signal-dark font-medium">Edit</button> },
  ];

  return (
    <Card title={`Drivers${usingMock ? ' (mock data)' : ''}`} action={<Button>Add driver</Button>}>
      <Table columns={columns} rows={drivers} loading={loading} emptyMessage="No drivers on file yet." />
    </Card>
  );
}
