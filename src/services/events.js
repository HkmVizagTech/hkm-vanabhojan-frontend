import { http } from './http';

export const eventsApi = {
  /** Public: the edition shown on the registration site (null when none is set up yet). */
  current: signal => http.get('/events/current', { signal }).then(r => r.data.event),
  list: signal => http.get('/events', { signal }).then(r => r.data),
  create: body => http.post('/events', body).then(r => r.data.event),
  update: (id, body) => http.put(`/events/${id}`, body).then(r => r.data.event),
  remove: id => http.delete(`/events/${id}`).then(r => r.data),
  setCurrent: id => http.post(`/events/${id}/set-current`).then(r => r.data.event),
  adoptLegacy: id => http.post(`/events/${id}/adopt-legacy`).then(r => r.data),
  analytics: signal => http.get('/events/analytics', { signal }).then(r => r.data.events),
  followup: (params, signal) => http.get('/events/followup', { params, signal }).then(r => r.data),
  sendFollowup: body => http.post('/events/followup/send', body).then(r => r.data),
};
