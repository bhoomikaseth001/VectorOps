import { useEffect, useState } from 'react';
import Card from '../../components/ui/Card.jsx';
import Table from '../../components/ui/Table.jsx';
import Button from '../../components/ui/Button.jsx';
import { getExpenses } from '../../api/fuelExpense.js';

const MOCK = [
  { id: '1', vehicle: 'UP32 AB 1234', category: 'Fuel', amount: 4200, date: '2026-07-11' },
  { id: '2', vehicle: 'UP32 CD 5678', category: 'Toll', amount: 380, date: '2026-07-11' },
];

export default function ExpenseList() {
  const [expenses, setExpenses] = useState(MOCK);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(true);

  useEffect(() => {
    getExpenses()
      .then((data) => { setExpenses(data); setUsingMock(false); })
      .catch(() => setUsingMock(true))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: 'date', header: 'Date' },
    { key: 'vehicle', header: 'Vehicle', render: (r) => <span className="font-mono">{r.vehicle}</span> },
    { key: 'category', header: 'Category' },
    { key: 'amount', header: 'Amount', render: (r) => `₹${Number(r.amount).toLocaleString('en-IN')}` },
  ];

  return (
    <Card title={`Fuel & Expenses${usingMock ? ' (mock data)' : ''}`} action={<Button>Add expense</Button>}>
      <Table columns={columns} rows={expenses} loading={loading} emptyMessage="No expenses logged yet." />
    </Card>
  );
}
