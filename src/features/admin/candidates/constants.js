export const PAYMENT_COLORS = { Paid: 'green', Pending: 'yellow', Failed: 'red', Refunded: 'orange' };
export const ADMIN_ACTION_COLORS = { Accepted: 'green', Rejected: 'red', Refunded: 'orange' };
export const PAYMENT_STATUSES = ['Paid', 'Pending', 'Failed', 'Refunded'];

export const ACTION_COPY = {
  accept: {
    colorScheme: 'green',
    done: 'Candidate accepted and WhatsApp notification sent!',
    target: "this candidate's registration",
    note: 'A WhatsApp acceptance message will be sent to the candidate.',
  },
  reject: {
    colorScheme: 'red',
    done: 'Candidate rejected and WhatsApp notification sent!',
    target: "this candidate's registration",
    note: 'A WhatsApp rejection message will be sent to the candidate.',
  },
  refund: {
    colorScheme: 'orange',
    done: 'Refund processed successfully!',
    target: "this candidate's payment",
    note: '💰 The payment will be refunded through Razorpay. This action cannot be undone.',
  },
};
