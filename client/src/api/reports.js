import client from './client';

export const getDashboardSummary = () =>
  client.get('/dashboard/kpis').then((r) => r.data);

export const getFleetReport = (params) =>
  client.get('/reports/fleet', { params }).then((r) => r.data);

export const exportFleetCsv = () =>
  client.get('/reports/fleet/export/csv', { responseType: 'blob' }).then((r) => r.data);