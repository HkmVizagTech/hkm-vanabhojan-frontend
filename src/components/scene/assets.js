// Home page pictures live on Cloudflare R2 (public bucket), not in the app bundle, so the page stays light.
// Names carry a version: to change a picture, upload it as meal-v2.webp etc. and update the number here
// (the files are cached for a year).
const BASE = process.env.REACT_APP_ASSETS_URL || 'https://files.harekrishnavizag.org/site/vanabhojanam';

export const forest = `${BASE}/forest-v1.webp`;
export const meal = `${BASE}/meal-v1.webp`;
