import { useEffect, useState } from 'react';
import Card from '../../components/ui/Card.jsx';
import Table from '../../components/ui/Table.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Input from '../../components/ui/Input.jsx';
import { getTrips, createTrip } from '../../api/trips.js';
import { getVehicles } from '../../api/vehicles.js';
import { getDrivers } from '../../api/drivers.js';

// Matches server/models/Trip.js exactly.
const STATUS_TONE = {
  Draft: 'neutral',
  Dispatched: 'transit',
  Completed: 'go',
  Cancelled: 'stop',
};

const MOCK_TRIPS = [
  { id: '1', source: 'Kanpur', destination: 'Lucknow', cargoWeight: 400, plannedDistance: 90, status: 'Dispatched', vehicleName: 'UP32 AB 1234', driverName: 'Ramesh Yadav' },
  { id: '2', source: 'Kanpur', destination: 'Agra', cargoWeight: 250, plannedDistance: 280, status: 'Draft', vehicleName: 'UP32 CD 5678', driverName: 'Suresh Kumar' },
];

const MOCK_AVAILABLE_VEHICLES = [{ id: '1', registrationNumber: 'UP32 AB 1234', status: 'Available' }];
const MOCK_AVAILABLE_DRIVERS = [{ id: '1', name: 'Ramesh Yadav', status: 'Available' }];

const EMPTY_FORM = {
  source: '',
  destination: '',
  cargoWeight: '',
  plannedDistance: '',
  vehicleId: '',
  driverId: '',
};

export default function TripList() {
  const [trips, setTrips] = useState(MOCK_TRIPS);
  const [vehicles, setVehicles] = useState(MOCK_AVAILABLE_VEHICLES);
  const [drivers, setDrivers] = useState(MOCK_AVAILABLE_DRIVERS);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    getTrips()
      .then((data) => {
        setTrips(data);
        setUsingMock(false);
      })
      .catch(() => setUsingMock(true))
      .finally(() => setLoading(false));
  }, []);

  const openDispatch = async () => {
    setForm(EMPTY_FORM);
    setSaveError('');
    setModalOpen(true);
    // fetch fresh so the dropdown reflects the latest availability
    try {
      const [v, d] = await Promise.all([getVehicles(), getDrivers()]);
      setVehicles(v.filter((x) => x.status === 'Available'));
      setDrivers(d.filter((x) => x.status === 'Available'));
    } catch {
      // keep whatever mock/last-known list we already have
    }
  };

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');

    const payload = {
      ...form,
      cargoWeight: Number(form.cargoWeight),
      plannedDistance: Number(form.plannedDistance),
      vehicleId: Number(form.vehicleId),
      driverId: Number(form.driverId),
      status: 'Dispatched',
    };

    try {
      if (usingMock) {
        const vehicle = vehicles.find((v) => String(v.id) === form.vehicleId);
        const driver = drivers.find((d) => String(d.id) === form.driverId);
        setTrips((prev) => [
          ...prev,
          {
            ...payload,
            id: String(Date.now()),
            vehicleName: vehicle?.registrationNumber || '—',
            driverName: driver?.name || '—',
          },
        ]);
      } else {
        const created = await createTrip(payload);
        setTrips((prev) => [...prev, created]);
      }
      setModalOpen(false);
    } catch (err) {
      setSaveError(err.message || 'Failed to dispatch trip');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'route', header: 'Route', render: (r) => `${r.source} → ${r.destination}` },
    { key: 'vehicleName', header: 'Vehicle', render: (r) => <span className="font-mono">{r.vehicleName || r.vehicleId}</span> },
    { key: 'driverName', header: 'Driver', render: (r) => r.driverName || r.driverId },
    { key: 'cargoWeight', header: 'Cargo', render: (r) => `${r.cargoWeight} kg` },
    { key: 'status', header: 'Status', render: (r) => <Badge tone={STATUS_TONE[r.status] || 'neutral'}>{r.status}</Badge> },
  ];

  return (
    <div className="space-y-4">
      <Card
        title={`Trips${usingMock ? ' (mock data)' : ''}`}
        action={<Button onClick={openDispatch}>Dispatch trip</Button>}
      >
        <Table columns={columns} rows={trips} loading={loading} emptyMessage="No trips dispatched yet." />
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Dispatch trip">
        <form onSubmit={onSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Source" required value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
            <Input label="Destination" required value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Cargo weight (kg)"
              type="number"
              required
              value={form.cargoWeight}
              onChange={(e) => setForm({ ...form, cargoWeight: e.target.value })}
            />
            <Input
              label="Planned distance (km)"
              type="number"
              required
              value={form.plannedDistance}
              onChange={(e) => setForm({ ...form, plannedDistance: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-ink/70">Vehicle (Available only)</label>
            <select
              required
              className="rounded border border-ink/15 px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-signal/40 focus:border-signal outline-none"
              value={form.vehicleId}
              onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}
            >
              <option value="" disabled>
                Select a vehicle…
              </option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.registrationNumber} {v.name ? `— ${v.name}` : ''}
                </option>
              ))}
            </select>
            {vehicles.length === 0 && (
              <p className="text-xs text-ink/40">No available vehicles right now.</p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-ink/70">Driver (Available only)</label>
            <select
              required
              className="rounded border border-ink/15 px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-signal/40 focus:border-signal outline-none"
              value={form.driverId}
              onChange={(e) => setForm({ ...form, driverId: e.target.value })}
            >
              <option value="" disabled>
                Select a driver…
              </option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            {drivers.length === 0 && (
              <p className="text-xs text-ink/40">No available drivers right now.</p>
            )}
          </div>

          {saveError && <p className="text-sm text-line-stop">{saveError}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Dispatching…' : 'Dispatch trip'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}