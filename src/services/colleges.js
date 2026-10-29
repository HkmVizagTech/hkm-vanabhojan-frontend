import { http } from './http';

export const collegesApi = {
  list: signal =>
    http.get('/college', { signal }).then(r => (Array.isArray(r.data) ? r.data : [])),
  create: name => http.post('/college', { name }).then(r => r.data),
  bulk: names => http.post('/college/bulk', { names }).then(r => r.data),
  update: (id, name) => http.put(`/college/${id}`, { name }).then(r => r.data),
  remove: id => http.delete(`/college/${id}`).then(r => r.data),
};
