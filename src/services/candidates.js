import { http, unwrapList } from './http';

export const candidatesApi = {
  /** event: an event id, 'all', or undefined for the current event. */
  list: (event, signal) =>
    http.get('/users', { params: event ? { event } : {}, signal }).then(r => unwrapList(r.data, ['candidates', 'records'])),

  /** The entry QR token of a paid (and, for students, approved) registration. */
  qr: candidateId => http.get(`/users/admin/qr/${candidateId}`).then(r => r.data),

  /** Sends the entry QR to the person's WhatsApp. */
  sendQr: candidateId => http.post(`/users/admin/send-qr/${candidateId}`).then(r => r.data),

  /** Dashboard totals against what Razorpay holds, plus every registration that disagrees. */
  auditPayments: event => http.get('/users/admin/payments-audit', { params: event ? { event } : {} }).then(r => r.data),

  /** Asks Razorpay about registrations still Pending and settles the ones it has captured. */
  checkPending: () => http.post('/users/check-pending-payments').then(r => r.data),

  /** action: 'accept' | 'reject' | 'refund' */
  act: (action, candidateId) =>
    http.post(`/users/admin/${action}/${candidateId}`).then(r => r.data),
};
