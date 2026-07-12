import client from './client';

// NOTE: also mounted at bare '/api' in server.js — confirm exact sub-paths.
export const getDashboardSummary = () => client.get('/reports/dashboard').then((r) => r.data);
export const getFleetUtilization = (params) => client.get('/reports/utilization', { params }).then((r) => r.data);
export const getROIReport = (params) => client.get('/reports/roi', { params }).then((r) => r.data);
export const exportCsv = (reportType) =>
  client.get(`/reports/${reportType}/export`, { responseType: 'blob' }).then((r) => r.data);
