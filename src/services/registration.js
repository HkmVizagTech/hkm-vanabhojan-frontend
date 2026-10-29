import { http } from './http';

export const registrationApi = {
  /** Public list from our own backend; managed on the admin Colleges page. */
  getColleges: signal => http.get('/college', { signal }).then(r => (Array.isArray(r.data) ? r.data : [])),

  /** Creates the Razorpay order. A student ID photo, when present, goes up as multipart. */
  createOrder: ({ amountInPaise, formData, studentIdCard }) => {
    if (studentIdCard) {
      const body = new FormData();
      body.append('amount', amountInPaise);
      body.append('formData', JSON.stringify(formData));
      body.append('studentIdCard', studentIdCard);
      return http.post('/users/create-order-with-file', body).then(r => r.data);
    }
    return http
      .post('/users/create-order', { amount: amountInPaise, formData })
      .then(r => r.data);
  },

  verifyPayment: payload => http.post('/users/verify-payment', payload).then(r => r.data),

  getPaymentStatus: (paymentId, signal) =>
    http.get(`/users/verify-payment/${paymentId}`, { signal }).then(r => r),

  verifyImmediately: ({ orderId, paymentId }) =>
    http.post('/users/verify-payment-immediately', { orderId, paymentId }).then(r => r.data),
};
