import client from './client';

export const getMaintenanceRecords = (params) => client.get('/maintenance', { params }).then((r) => r.data);
export const createMaintenanceRecord = (payload) => client.post('/maintenance', payload).then((r) => r.data);
export const updateMaintenanceRecord = (id, payload) => client.put(`/maintenance/${id}`, payload).then((r) => r.data);
