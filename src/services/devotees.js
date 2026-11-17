import { http } from './http';

export const devoteesApi = {
  // Admin: manage the list
  list: signal => http.get('/admin/devotees', { signal }).then(r => r.data.devotees),
  add: body => http.post('/admin/devotees', body).then(r => r.data.devotee),
  addMany: rows => http.post('/admin/devotees/bulk', { rows }).then(r => r.data),
  update: (id, changes) => http.patch(`/admin/devotees/${id}`, changes).then(r => r.data.devotee),
  remove: id => http.delete(`/admin/devotees/${id}`).then(r => r.data),
  // Public: sign in with a code sent on WhatsApp
  requestCode: phone => http.post('/devotee-auth/otp', { phone }, { skipAuthRedirect: true }).then(r => r.data),
  verifyCode: (phone, otp) => http.post('/devotee-auth/verify', { phone, otp }, { skipAuthRedirect: true }).then(r => r.data),
};
