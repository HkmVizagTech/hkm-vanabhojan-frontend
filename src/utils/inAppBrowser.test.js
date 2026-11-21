import { isInAppBrowser } from './inAppBrowser';

describe('isInAppBrowser', () => {
  it('spots the in-app browsers that cannot open UPI apps', () => {
    expect(isInAppBrowser('Mozilla/5.0 (Linux; Android 13; Pixel 7 Build/TQ3A; wv) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36')).toBe(true);
    expect(isInAppBrowser('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605 Mobile/15E148 Instagram 300.0')).toBe(true);
    expect(isInAppBrowser('Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36 [FBAN/FB4A;FBAV/450]')).toBe(true);
  });
  it('leaves normal browsers alone', () => {
    expect(isInAppBrowser('Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36')).toBe(false);
    expect(isInAppBrowser('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605 Version/17.0 Mobile/15E148 Safari/604.1')).toBe(false);
    expect(isInAppBrowser('')).toBe(false);
  });
});
