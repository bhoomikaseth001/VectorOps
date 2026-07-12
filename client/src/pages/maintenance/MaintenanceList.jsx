import { useEffect, useState } from 'react';
import Card from '../../components/ui/Card.jsx';
import Table from '../../components/ui/Table.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Input from '../../components/ui/Input.jsx';
import { getMaintenanceRecords, createMaintenanceRecord, updateMaintenanceRecord } from '../../api/maintenance.js';
import { getVehicles } from '../../api/vehicles.js';

// Matches server/models/Maintenance.js. NOTE: vehicleId assumed via association
// (like Trip) — confirm with Dev A's models/index.js and adjust the payload key
// below if the association is named differently (e.g. VehicleId vs vehicleId).
const STATUS_TONE = { Active: 'hold', Closed: 'go' };
const STATUS_OPTIONS = Object.keys(STATUS_TONE);

const MOCK_VEHICLES = [{ id: '1', registrationNumber: 'UP32 AB 1234' }];
const MOCK_RECORDS = [
  { id: '1', vehicleId: '1', vehicleName: 'UP32 AB 1234', description: 'Brake pad replacement', cost: 4200, status: 'Active', date: '2026-07-10' },
  { id: '2', vehicleId: '1', vehicleName: 'UP32 CD 5678', description: 'Oil change', cost: 1800, status: 'Closed', date: '2026-07-05' },
];

const EMPTY_FORM = { vehicleId: '', description: '', cost: '', status: 'Active', date: '' };

export default function MaintenanceList() {
  const [records, setRecords] = useState(MOCK_RECORDS);
  const [vehicles, setVehicles] = useState(MOCK_VEHICLES);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    getMaintenanceRecords()
      .then((data) => { setRecords(data); setUsingMock(false); })
      .catch(() => setUsingMock(true))
      .finally(() => setLoading(false));

    getVehicles()
      .then((data) => setVehicles(data))
      .catch(() => {}); // keep mock vehicle list if this fails too
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, date: new Date().toISOString().slice(0, 10) });
    setSaveError('');
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditingId(record.id);
    setForm({ ...EMPTY_FORM, ...record, date: record.date?.slice(0, 10) });
    setSaveError('');
    setModalOpen(true);
  };

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');

    const payload = {
      ...form,
      cost: Number(form.cost) || 0,
      vehicleId: Number(form.vehicleId),
    };

    try {
      if (usingMock) {
        const vehicle = vehicles.find((v) => String(v.id) === form.vehicleId);
        if (editingId) {
          setRecords((prev) =>
            prev.map((r) => (r.id === editingId ? { ...payload, id: editingId, vehicleName: vehicle?.registrationNumber } : r))
          );
        } else {
          setRecords((prev) => [
            ...prev,
            { ...payload, id: String(Date.now()), vehicleName: vehicle?.registrationNumber },
          ]);
        }
      } else if (editingId) {
        const updated = await updateMaintenanceRecord(editingId, payload);
        setRecords((prev) => prev.map((r) => (r.id === editingId ? updated : r)));
      } else {
        const created = await createMaintenanceRecord(payload);
        setRecords((prev) => [...prev, created]);
      }
      setModalOpen(false);
    } catch (err) {
      setSaveError(err.message || 'Failed to save maintenance record');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'vehicleName', header: 'Vehicle', render: (r) => <span className="font-mono">{r.vehicleName || r.vehicleId}</span> },
    { key: 'description', header: 'Description' },
    { key: 'cost', header: 'Cost', render: (r) => `₹${Number(r.cost).toLocaleString('en-IN')}` },
    { key: 'date', header: 'Date' },
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
        title={`Maintenance${usingMock ? ' (mock data)' : ''}`}
        action={<Button onClick={openAdd}>Log service</Button>}
      >
        <Table columns={columns} rows={records} loading={loading} emptyMessage="No maintenance records yet." />
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit maintenance record' : 'Log service'}>
        <form onSubmit={onSave} className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-ink/70">Vehicle</label>
            <select
              required
              className="rounded border border-ink/15 px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-signal/40 focus:border-signal outline-none"
              value={form.vehicleId}
              onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}
            >
              <option value="" disabled>Select a vehicle…</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.registrationNumber}</option>
              ))}
            </select>
          </div>

          <Input
            label="Description"
            required
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Brake pad replacement, oil change…"
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Cost"
              type="number"
              value={form.cost}
              onChange={(e) => setForm({ ...form, cost: e.target.value })}
            />
            <Input
              label="Date"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
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
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {saveError && <p className="text-sm text-line-stop">{saveError}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save record'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}