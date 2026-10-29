import { http } from './http';

export const authApi = {
  login: credentials =>
    http
      .post('/admin/users/login', credentials, { skipAuthRedirect: true })
      .then(r => r.data),
  register: payload =>
    http.post('/admin/users/register', payload, { skipAuthRedirect: true }).then(r => r.data),
  listUsers: signal => http.get('/admin/users', { signal }).then(r => r.data.user),
  updateUser: (id, changes) => http.patch(`/admin/users/${id}`, changes).then(r => r.data.user),
  deleteUser: id => http.delete(`/admin/users/${id}`).then(r => r.data),
  validateToken: () =>
    http.post('/admin/users/validate-token', null, { skipAuthRedirect: true }).then(r => r.data),
};
