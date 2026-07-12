import { useEffect, useState } from 'react';
import Card from '../../components/ui/Card.jsx';
import Table from '../../components/ui/Table.jsx';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Input from '../../components/ui/Input.jsx';
import { getFuelLogs, createFuelLog, getExpenses, createExpense } from '../../api/fuelExpense.js';
import { getVehicles } from '../../api/vehicles.js';

// Matches server/models/FuelLog.js and Expense.js.
// NOTE: vehicleId assumed on both (like Trip's association) — confirm with
// Dev A's models/index.js if fuel logs / expenses are actually linked to
// Trip instead of Vehicle, and adjust the payload key accordingly.
const EXPENSE_TYPES = ['Toll', 'Other'];

const MOCK_VEHICLES = [{ id: '1', registrationNumber: 'UP32 AB 1234' }];
const MOCK_FUEL_LOGS = [
  { id: '1', vehicleId: '1', vehicleName: 'UP32 AB 1234', liters: 42, cost: 4200, date: '2026-07-11' },
];
const MOCK_EXPENSES = [
  { id: '1', vehicleId: '1', vehicleName: 'UP32 CD 5678', type: 'Toll', amount: 380, notes: 'NH2 toll plaza', date: '2026-07-11' },
];

const EMPTY_FUEL_FORM = { vehicleId: '', liters: '', cost: '', date: '' };
const EMPTY_EXPENSE_FORM = { vehicleId: '', type: 'Other', amount: '', notes: '', date: '' };

export default function ExpenseList() {
  const [vehicles, setVehicles] = useState(MOCK_VEHICLES);

  const [fuelLogs, setFuelLogs] = useState(MOCK_FUEL_LOGS);
  const [fuelLoading, setFuelLoading] = useState(true);
  const [fuelUsingMock, setFuelUsingMock] = useState(true);
  const [fuelModalOpen, setFuelModalOpen] = useState(false);
  const [fuelForm, setFuelForm] = useState(EMPTY_FUEL_FORM);
  const [fuelSaving, setFuelSaving] = useState(false);
  const [fuelError, setFuelError] = useState('');

  const [expenses, setExpenses] = useState(MOCK_EXPENSES);
  const [expLoading, setExpLoading] = useState(true);
  const [expUsingMock, setExpUsingMock] = useState(true);
  const [expModalOpen, setExpModalOpen] = useState(false);
  const [expForm, setExpForm] = useState(EMPTY_EXPENSE_FORM);
  const [expSaving, setExpSaving] = useState(false);
  const [expError, setExpError] = useState('');

  useEffect(() => {
    getVehicles().then(setVehicles).catch(() => {});

    getFuelLogs()
      .then((data) => { setFuelLogs(data); setFuelUsingMock(false); })
      .catch(() => setFuelUsingMock(true))
      .finally(() => setFuelLoading(false));

    getExpenses()
      .then((data) => { setExpenses(data); setExpUsingMock(false); })
      .catch(() => setExpUsingMock(true))
      .finally(() => setExpLoading(false));
  }, []);

  const openFuelAdd = () => {
    setFuelForm({ ...EMPTY_FUEL_FORM, date: new Date().toISOString().slice(0, 10) });
    setFuelError('');
    setFuelModalOpen(true);
  };

  const onSaveFuel = async (e) => {
    e.preventDefault();
    setFuelSaving(true);
    setFuelError('');
    const payload = { ...fuelForm, liters: Number(fuelForm.liters), cost: Number(fuelForm.cost), vehicleId: Number(fuelForm.vehicleId) };
    try {
      if (fuelUsingMock) {
        const vehicle = vehicles.find((v) => String(v.id) === fuelForm.vehicleId);
        setFuelLogs((prev) => [...prev, { ...payload, id: String(Date.now()), vehicleName: vehicle?.registrationNumber }]);
      } else {
        const created = await createFuelLog(payload);
        setFuelLogs((prev) => [...prev, created]);
      }
      setFuelModalOpen(false);
    } catch (err) {
      setFuelError(err.message || 'Failed to save fuel log');
    } finally {
      setFuelSaving(false);
    }
  };

  const openExpAdd = () => {
    setExpForm({ ...EMPTY_EXPENSE_FORM, date: new Date().toISOString().slice(0, 10) });
    setExpError('');
    setExpModalOpen(true);
  };

  const onSaveExpense = async (e) => {
    e.preventDefault();
    setExpSaving(true);
    setExpError('');
    const payload = { ...expForm, amount: Number(expForm.amount), vehicleId: Number(expForm.vehicleId) };
    try {
      if (expUsingMock) {
        const vehicle = vehicles.find((v) => String(v.id) === expForm.vehicleId);
        setExpenses((prev) => [...prev, { ...payload, id: String(Date.now()), vehicleName: vehicle?.registrationNumber }]);
      } else {
        const created = await createExpense(payload);
        setExpenses((prev) => [...prev, created]);
      }
      setExpModalOpen(false);
    } catch (err) {
      setExpError(err.message || 'Failed to save expense');
    } finally {
      setExpSaving(false);
    }
  };

  const fuelColumns = [
    { key: 'date', header: 'Date' },
    { key: 'vehicleName', header: 'Vehicle', render: (r) => <span className="font-mono">{r.vehicleName || r.vehicleId}</span> },
    { key: 'liters', header: 'Liters', render: (r) => `${r.liters} L` },
    { key: 'cost', header: 'Cost', render: (r) => `₹${Number(r.cost).toLocaleString('en-IN')}` },
  ];

  const expenseColumns = [
    { key: 'date', header: 'Date' },
    { key: 'vehicleName', header: 'Vehicle', render: (r) => <span className="font-mono">{r.vehicleName || r.vehicleId}</span> },
    { key: 'type', header: 'Type' },
    { key: 'amount', header: 'Amount', render: (r) => `₹${Number(r.amount).toLocaleString('en-IN')}` },
    { key: 'notes', header: 'Notes' },
  ];

  return (
    <div className="space-y-6">
      <Card
        title={`Fuel Logs${fuelUsingMock ? ' (mock data)' : ''}`}
        action={<Button onClick={openFuelAdd}>Add fuel log</Button>}
      >
        <Table columns={fuelColumns} rows={fuelLogs} loading={fuelLoading} emptyMessage="No fuel logs yet." />
      </Card>

      <Card
        title={`Expenses${expUsingMock ? ' (mock data)' : ''}`}
        action={<Button onClick={openExpAdd}>Add expense</Button>}
      >
        <Table columns={expenseColumns} rows={expenses} loading={expLoading} emptyMessage="No expenses logged yet." />
      </Card>

      <Modal open={fuelModalOpen} onClose={() => setFuelModalOpen(false)} title="Add fuel log">
        <form onSubmit={onSaveFuel} className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-ink/70">Vehicle</label>
            <select
              required
              className="rounded border border-ink/15 px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-signal/40 focus:border-signal outline-none"
              value={fuelForm.vehicleId}
              onChange={(e) => setFuelForm({ ...fuelForm, vehicleId: e.target.value })}
            >
              <option value="" disabled>Select a vehicle…</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.registrationNumber}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Liters"
              type="number"
              required
              value={fuelForm.liters}
              onChange={(e) => setFuelForm({ ...fuelForm, liters: e.target.value })}
            />
            <Input
              label="Cost"
              type="number"
              required
              value={fuelForm.cost}
              onChange={(e) => setFuelForm({ ...fuelForm, cost: e.target.value })}
            />
          </div>
          <Input
            label="Date"
            type="date"
            value={fuelForm.date}
            onChange={(e) => setFuelForm({ ...fuelForm, date: e.target.value })}
          />

          {fuelError && <p className="text-sm text-line-stop">{fuelError}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setFuelModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={fuelSaving}>{fuelSaving ? 'Saving…' : 'Save fuel log'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={expModalOpen} onClose={() => setExpModalOpen(false)} title="Add expense">
        <form onSubmit={onSaveExpense} className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-ink/70">Vehicle</label>
            <select
              required
              className="rounded border border-ink/15 px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-signal/40 focus:border-signal outline-none"
              value={expForm.vehicleId}
              onChange={(e) => setExpForm({ ...expForm, vehicleId: e.target.value })}
            >
              <option value="" disabled>Select a vehicle…</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.registrationNumber}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-ink/70">Type</label>
              <select
                className="rounded border border-ink/15 px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-signal/40 focus:border-signal outline-none"
                value={expForm.type}
                onChange={(e) => setExpForm({ ...expForm, type: e.target.value })}
              >
                {EXPENSE_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <Input
              label="Amount"
              type="number"
              required
              value={expForm.amount}
              onChange={(e) => setExpForm({ ...expForm, amount: e.target.value })}
            />
          </div>
          <Input
            label="Notes"
            value={expForm.notes}
            onChange={(e) => setExpForm({ ...expForm, notes: e.target.value })}
          />
          <Input
            label="Date"
            type="date"
            value={expForm.date}
            onChange={(e) => setExpForm({ ...expForm, date: e.target.value })}
          />

          {expError && <p className="text-sm text-line-stop">{expError}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setExpModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={expSaving}>{expSaving ? 'Saving…' : 'Save expense'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}