# Vanabhojanam Youth Festival: frontend

React 19 + Chakra UI + react-router. Registration and payments, QR attendance, and the admin console, with
three.js (react-three-fiber) figures and GSAP motion.

```bash
npm install
npm start          # dev server
npm test           # unit + component tests
npm run build      # production build
```

Optional overrides live in `.env.local` (see `.env.example`): API URL, college list URL, Razorpay key.

## Structure

```
src/
  app/          App shell + lazy routes (every page is its own chunk)
  config/       env.js, event.js (all event copy, fees, dates), vanabhojana.js (story content)
  theme/        Chakra theme: brand/saffron/lotus palettes, fonts, semantic tokens (light + dark)
  services/     axios instance (auth header, 401/403 -> logout) + one module per backend area
  context/      AuthContext (lazy token verification, role)
  hooks/        useAsyncData, useDebouncedValue, usePagination, useRazorpay, useInView, useCountdown
  lib/gsap.js   single place GSAP plugins are registered
  components/
    common/     Reveal, CountUp, StatCard, Pagination, ConfirmDialog, FormField, RequireAuth ...
    layout/     PublicShell, SiteFooter, AdminLayout, Sidebar
    three/      Figure (lazy, in-view gated) + figures/ (procedural low-poly models)
  features/
    landing/    registration page: hero, highlights, Vanabhojanam story, form, payment
    thankyou/   payment polling + confirmation
    attendance/ public "view my QR codes" page
    auth/       admin login / register
    admin/      candidates, attendance, scanned list, colleges, QR scanner
```

## Editing content

* Dates, venue, fees, highlights: `src/config/event.js`.
* "What is Vanabhojanam?" content: `src/config/vanabhojana.js`.

## Adding a 3D figure

1. Create `src/components/three/figures/MyFigure.jsx` (default export, procedural meshes, use `useFigure()` for
   `reducedMotion` / `activeRef`, GSAP via `useGSAP` for entrance tweens).
2. Register it in `figures/index.js` with a camera position.
3. Render it anywhere with `<Figure name="myFigure" label="Accessible description" />`.

`Figure` only downloads three.js when it is about to scroll into view, unmounts the WebGL canvas when it leaves the
viewport, and falls back to an emoji glyph without WebGL. `prefers-reduced-motion` renders a still frame.
