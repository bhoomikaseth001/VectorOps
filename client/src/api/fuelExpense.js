import client from './client';

// NOTE: server.js mounts fuelExpenseRoutes at bare '/api', so confirm exact
// sub-paths with your backend teammate (e.g. '/fuel-logs' vs '/fuellogs').
// Adjust the strings below to match — this is the only file you'll need to touch.
export const getFuelLogs = (params) => client.get('/fuel-logs', { params }).then((r) => r.data);
export const createFuelLog = (payload) => client.post('/fuel-logs', payload).then((r) => r.data);

export const getExpenses = (params) => client.get('/expenses', { params }).then((r) => r.data);
export const createExpense = (payload) => client.post('/expenses', payload).then((r) => r.data);
