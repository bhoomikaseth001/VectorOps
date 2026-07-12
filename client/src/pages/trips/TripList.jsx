import { useEffect, useState } from 'react';
import Card from '../../components/ui/Card.jsx';
import Table from '../../components/ui/Table.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import { getTrips } from '../../api/trips.js';

const MOCK_TRIPS = [
  { id: '1', route: 'Kanpur → Lucknow', vehicle: 'UP32 AB 1234', driver: 'Ramesh Yadav', status: 'InProgress' },
  { id: '2', route: 'Kanpur → Agra', vehicle: 'UP32 CD 5678', driver: 'Suresh Kumar', status: 'Scheduled' },
];

const STATUS_TONE = { Scheduled: 'hold', InProgress: 'transit', Completed: 'go', Cancelled: 'stop' };

export default function TripList() {
  const [trips, setTrips] = useState(MOCK_TRIPS);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(true);

  useEffect(() => {
    getTrips()
      .then((data) => { setTrips(data); setUsingMock(false); })
      .catch(() => setUsingMock(true))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: 'route', header: 'Route' },
    { key: 'vehicle', header: 'Vehicle', render: (r) => <span className="font-mono">{r.vehicle}</span> },
    { key: 'driver', header: 'Driver' },
    { key: 'status', header: 'Status', render: (r) => <Badge tone={STATUS_TONE[r.status] || 'neutral'}>{r.status}</Badge> },
  ];

  return (
    <Card title={`Trips${usingMock ? ' (mock data)' : ''}`} action={<Button>Dispatch trip</Button>}>
      <Table columns={columns} rows={trips} loading={loading} emptyMessage="No trips dispatched yet." />
    </Card>
  );
}
