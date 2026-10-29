// Some layouts (a live video box, auto-sized popovers) make the browser report
// "ResizeObserver loop completed with undelivered notifications". It is a harmless layout notice,
// but the development server turns it into a full-screen error. Two measures:
//
// 1. Deliver ResizeObserver callbacks on the next frame, which avoids the loop in most cases.
// 2. In development only: if the dev server shows its error overlay for that one notice, remove the
//    overlay again. (Its own error listener registers before ours, so it cannot be pre-empted.)
//    Every other error is left alone, so real problems still show.
if (typeof window !== 'undefined') {
  if (window.ResizeObserver) {
    const NativeResizeObserver = window.ResizeObserver;
    window.ResizeObserver = class extends NativeResizeObserver {
      constructor(callback) {
        super((entries, observer) => window.requestAnimationFrame(() => callback(entries, observer)));
      }
    };
  }

  if (process.env.NODE_ENV === 'development') {
    const BENIGN = /ResizeObserver loop (completed with undelivered notifications|limit exceeded)/;
    const OVERLAY_ID = 'webpack-dev-server-client-overlay';

    // Hidden (not removed): the dev server keeps using the same overlay for later errors.
    const sync = overlay => {
      const text = overlay.contentDocument?.body?.innerText || '';
      const onlyBenign = BENIGN.test(text) && !/(TypeError|ReferenceError|SyntaxError|Some real|Uncaught (?!runtime errors))/.test(text);
      overlay.style.display = onlyBenign ? 'none' : '';
    };

    const watch = overlay => {
      const refresh = () => overlay.isConnected && sync(overlay);
      [30, 150, 500].forEach(delay => setTimeout(refresh, delay));
      const body = overlay.contentDocument?.body;
      if (body) new MutationObserver(refresh).observe(body, { childList: true, subtree: true, characterData: true });
    };

    new MutationObserver(mutations => {
      mutations.forEach(m =>
        m.addedNodes.forEach(node => {
          if (node.id === OVERLAY_ID) setTimeout(() => watch(node), 30);
        })
      );
    }).observe(document.documentElement, { childList: true, subtree: true });
  }
}
