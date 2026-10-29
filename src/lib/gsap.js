import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

// Register once; every animation module imports from here.
gsap.registerPlugin(ScrollTrigger, useGSAP);

// Keep entrance animations on schedule even while a WebGL canvas hogs the main thread
// (the default smoothing would stretch them out frame by frame on slow devices).
gsap.ticker.lagSmoothing(0);

export { gsap, ScrollTrigger, useGSAP };
