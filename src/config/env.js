// Runtime configuration. Every value can be overridden with a REACT_APP_* variable
// (see .env.example); the fallbacks keep the current deployment working.
export const API_URL =
  process.env.REACT_APP_API_URL ||
  'https://hkm-vanabhojan-backend-882278565284.europe-west1.run.app';

// Razorpay key ids are public by design (the secret stays on the server).
export const RAZORPAY_KEY =
  process.env.REACT_APP_RAZORPAY_KEY || 'rzp_live_HBAc3tlMK0X5Xd';

export const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';
