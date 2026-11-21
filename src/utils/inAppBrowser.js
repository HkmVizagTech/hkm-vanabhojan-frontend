/**
 * True inside the browser built into WhatsApp, Instagram, Facebook and similar apps, or an Android WebView.
 * These often cannot open a UPI app, so a UPI payment started there tends to time out.
 */
export const isInAppBrowser = (userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '') =>
  /FBAN|FBAV|FB_IAB|Instagram|Line\/|Snapchat|Twitter|LinkedInApp|MicroMessenger|; wv\)|WhatsApp/i.test(String(userAgent));
