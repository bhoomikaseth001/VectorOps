import { useEffect, useState } from 'react';
import Card from '../../components/ui/Card.jsx';
import Table from '../../components/ui/Table.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Input from '../../components/ui/Input.jsx';
import { getDrivers, createDriver, updateDriver } from '../../api/drivers.js';

// Matches server/models/Driver.js exactly.
const STATUS_TONE = {
  Available: 'go',
  'On Trip': 'transit',
  'Off Duty': 'neutral',
  Suspended: 'stop',
};
const STATUS_OPTIONS = Object.keys(STATUS_TONE);

const MOCK_DRIVERS = [
  { id: '1', name: 'Ramesh Yadav', licenseNumber: 'UP32-2019-0044521', licenseCategory: 'HMV', licenseExpiryDate: '2027-03-15', contactNumber: '9876543210', safetyScore: 92, status: 'Available' },
  { id: '2', name: 'Suresh Kumar', licenseNumber: 'UP32-2020-0011983', licenseCategory: 'LMV', licenseExpiryDate: '2026-11-01', contactNumber: '9876500000', safetyScore: 88, status: 'On Trip' },
];

const EMPTY_FORM = {
  name: '',
  licenseNumber: '',
  licenseCategory: '',
  licenseExpiryDate: '',
  contactNumber: '',
  safetyScore: 100,
  status: 'Available',
};

export default function DriverList() {
  const [drivers, setDrivers] = useState(MOCK_DRIVERS);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    getDrivers()
      .then((data) => {
        setDrivers(data);
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

  const openEdit = (driver) => {
    setEditingId(driver.id);
    setForm(driver);
    setSaveError('');
    setModalOpen(true);
  };

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');

    const payload = { ...form, safetyScore: Number(form.safetyScore) };

    try {
      if (usingMock) {
        if (editingId) {
          setDrivers((prev) => prev.map((d) => (d.id === editingId ? { ...payload, id: editingId } : d)));
        } else {
          setDrivers((prev) => [...prev, { ...payload, id: String(Date.now()) }]);
        }
      } else if (editingId) {
        const updated = await updateDriver(editingId, payload);
        setDrivers((prev) => prev.map((d) => (d.id === editingId ? updated : d)));
      } else {
        const created = await createDriver(payload);
        setDrivers((prev) => [...prev, created]);
      }
      setModalOpen(false);
    } catch (err) {
      setSaveError(err.message || 'Failed to save driver');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'licenseNumber', header: 'License No.', render: (r) => <span className="font-mono">{r.licenseNumber}</span> },
    { key: 'licenseCategory', header: 'Category' },
    { key: 'contactNumber', header: 'Contact' },
    { key: 'safetyScore', header: 'Safety score' },
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
        title={`Drivers${usingMock ? ' (mock data)' : ''}`}
        action={<Button onClick={openAdd}>Add driver</Button>}
      >
        <Table columns={columns} rows={drivers} loading={loading} emptyMessage="No drivers on file yet." />
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit driver' : 'Add driver'}>
        <form onSubmit={onSave} className="space-y-4">
          <Input label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="License number"
              required
              value={form.licenseNumber}
              onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
            />
            <Input
              label="License category"
              required
              placeholder="LMV, HMV…"
              value={form.licenseCategory}
              onChange={(e) => setForm({ ...form, licenseCategory: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="License expiry"
              type="date"
              required
              value={form.licenseExpiryDate}
              onChange={(e) => setForm({ ...form, licenseExpiryDate: e.target.value })}
            />
            <Input
              label="Contact number"
              required
              value={form.contactNumber}
              onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
            />
          </div>
          <Input
            label="Safety score"
            type="number"
            min="0"
            max="100"
            value={form.safetyScore}
            onChange={(e) => setForm({ ...form, safetyScore: e.target.value })}
          />
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
              {saving ? 'Saving…' : 'Save driver'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}