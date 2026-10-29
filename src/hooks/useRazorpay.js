import { useCallback } from 'react';
import { RAZORPAY_SCRIPT_URL } from '../config/env';

let loader = null;

const loadScript = () => {
  if (window.Razorpay) return Promise.resolve(window.Razorpay);
  if (!loader) {
    loader = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = RAZORPAY_SCRIPT_URL;
      script.async = true;
      script.onload = () => resolve(window.Razorpay);
      script.onerror = () => {
        loader = null; // allow a retry after a network blip
        reject(new Error('Could not load the payment gateway. Check your connection.'));
      };
      document.body.appendChild(script);
    });
  }
  return loader;
};

/** Returns `loadRazorpay()`; the checkout script is fetched once, on first use. */
export function useRazorpay() {
  return useCallback(loadScript, []);
}

export const preloadRazorpay = () => loadScript().catch(() => {});
