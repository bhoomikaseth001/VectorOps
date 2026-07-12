import client from './client';

export const getTrips = (params) => client.get('/trips', { params }).then((r) => r.data);
export const getTrip = (id) => client.get(`/trips/${id}`).then((r) => r.data);
export const createTrip = (payload) => client.post('/trips', payload).then((r) => r.data);
export const updateTripStatus = (id, status) =>
  client.patch(`/trips/${id}/status`, { status }).then((r) => r.data);
export const updateTrip = (id, payload) => client.put(`/trips/${id}`, payload).then((r) => r.data);
