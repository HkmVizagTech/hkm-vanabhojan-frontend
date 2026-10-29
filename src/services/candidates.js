import { http, unwrapList } from './http';

export const candidatesApi = {
  /** event: an event id, 'all', or undefined for the current event. */
  list: (event, signal) =>
    http.get('/users', { params: event ? { event } : {}, signal }).then(r => unwrapList(r.data, ['candidates', 'records'])),

  /** action: 'accept' | 'reject' | 'refund' */
  act: (action, candidateId) =>
    http.post(`/users/admin/${action}/${candidateId}`).then(r => r.data),
};
