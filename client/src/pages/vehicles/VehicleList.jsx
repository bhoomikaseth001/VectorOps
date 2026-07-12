import { useEffect, useState } from 'react';
import Card from '../../components/ui/Card.jsx';
import Table from '../../components/ui/Table.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Input from '../../components/ui/Input.jsx';
import { getVehicles, createVehicle, updateVehicle } from '../../api/vehicles.js';

// Matches server/models/Vehicle.js exactly — status enum has spaces, keep as-is.
const STATUS_TONE = {
  Available: 'go',
  'On Trip': 'transit',
  'In Shop': 'hold',
  Retired: 'stop',
};
const STATUS_OPTIONS = Object.keys(STATUS_TONE);

const MOCK_VEHICLES = [
  { id: '1', registrationNumber: 'UP32 AB 1234', name: 'Ace Runner', type: 'Truck', maxLoadCapacity: 1200, odometer: 18240, acquisitionCost: 850000, region: 'Kanpur', status: 'Available' },
  { id: '2', registrationNumber: 'UP32 CD 5678', name: 'Bolero Hauler', type: 'Pickup', maxLoadCapacity: 900, odometer: 42110, acquisitionCost: 720000, region: 'Lucknow', status: 'On Trip' },
];

const EMPTY_FORM = {
  registrationNumber: '',
  name: '',
  type: '',
  maxLoadCapacity: '',
  odometer: '',
  acquisitionCost: '',
  region: '',
  status: 'Available',
};

export default function VehicleList() {
  const [vehicles, setVehicles] = useState(MOCK_VEHICLES);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    getVehicles()
      .then((data) => {
        setVehicles(data);
        setUsingMock(false);
      })
      .catch(() => setUsingMock(true))
      .finally(() => setLoading(false));
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSaveError('');
    setModalOpen(true);
  };

  const openEdit = (vehicle) => {
    setEditingId(vehicle.id);
    setForm(vehicle);
    setSaveError('');
    setModalOpen(true);
  };

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');

    // Coerce numeric fields — inputs give strings, Sequelize expects numbers.
    const payload = {
      ...form,
      maxLoadCapacity: Number(form.maxLoadCapacity),
      odometer: Number(form.odometer) || 0,
      acquisitionCost: Number(form.acquisitionCost),
    };

    try {
      if (usingMock) {
        if (editingId) {
          setVehicles((prev) => prev.map((v) => (v.id === editingId ? { ...payload, id: editingId } : v)));
        } else {
          setVehicles((prev) => [...prev, { ...payload, id: String(Date.now()) }]);
        }
      } else if (editingId) {
        const updated = await updateVehicle(editingId, payload);
        setVehicles((prev) => prev.map((v) => (v.id === editingId ? updated : v)));
      } else {
        const created = await createVehicle(payload);
        setVehicles((prev) => [...prev, created]);
      }
      setModalOpen(false);
    } catch (err) {
      setSaveError(err.message || 'Failed to save vehicle');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'registrationNumber', header: 'Reg. No.', render: (r) => <span className="font-mono">{r.registrationNumber}</span> },
    { key: 'name', header: 'Name' },
    { key: 'type', header: 'Type' },
    { key: 'maxLoadCapacity', header: 'Max load', render: (r) => `${Number(r.maxLoadCapacity).toLocaleString('en-IN')} kg` },
    { key: 'odometer', header: 'Odometer', render: (r) => `${Number(r.odometer).toLocaleString('en-IN')} km` },
    { key: 'status', header: 'Status', render: (r) => <Badge tone={STATUS_TONE[r.status] || 'neutral'}>{r.status}</Badge> },
    {
      key: 'actions',
      header: '',
      render: (r) => (
        <button className="text-sm text-signal-dark font-medium" onClick={() => openEdit(r)}>
          Edit
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Card
        title={`Vehicle Registry${usingMock ? ' (mock data)' : ''}`}
        action={<Button onClick={openAdd}>Add vehicle</Button>}
      >
        <Table columns={columns} rows={vehicles} loading={loading} emptyMessage="No vehicles registered yet." />
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit vehicle' : 'Add vehicle'}>
        <form onSubmit={onSave} className="space-y-4">
          <Input
            label="Registration number"
            required
            value={form.registrationNumber}
            onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input label="Type" required value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="Truck, Van, Pickup…" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Max load capacity (kg)"
              type="number"
              required
              value={form.maxLoadCapacity}
              onChange={(e) => setForm({ ...form, maxLoadCapacity: e.target.value })}
            />
            <Input
              label="Odometer (km)"
              type="number"
              value={form.odometer}
              onChange={(e) => setForm({ ...form, odometer: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Acquisition cost"
              type="number"
              required
              value={form.acquisitionCost}
              onChange={(e) => setForm({ ...form, acquisitionCost: e.target.value })}
            />
            <Input
              label="Region"
              value={form.region}
              onChange={(e) => setForm({ ...form, region: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-ink/70">Status</label>
            <select
              className="rounded border border-ink/15 px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-signal/40 focus:border-signal outline-none"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {saveError && <p className="text-sm text-line-stop">{saveError}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save vehicle'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}