import { http } from './http';

export const cashApi = {
  list: signal => http.get('/users/cash', { signal }).then(r => r.data),
  register: body => http.post('/users/cash/register', body).then(r => r.data),
  sendQr: id => http.post(`/users/cash/${id}/send-qr`).then(r => r.data),
};
