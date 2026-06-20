/* router.js - History API routing for detail overlays and modals */
(function () {
  let suppressing = false;

  /* push a route only when triggered by a real user action (not popstate/initial) */
  function push(path) {
    if (suppressing) return;
    if (location.pathname !== path) history.pushState({ app: true }, '', path);
  }

  /* open whatever overlay the path describes, without re-pushing history */
  function apply(path) {
    suppressing = true;
    try {
      let m;
      if ((m = path.match(/^\/work\/([^/]+)\/?$/))) {
        const el = document.querySelector(`[data-work-id="${cssEscape(decodeURIComponent(m[1]))}"]`);
        if (el && window.__workDetail) { window.__workDetail.open(el); return; }
      }
      if ((m = path.match(/^\/services\/([^/]+)\/?$/))) {
        const el = document.querySelector(`[data-service-id="${cssEscape(decodeURIComponent(m[1]))}"]`);
        if (el && window.__serviceDetail) { window.__serviceDetail.open(el); return; }
      }
      if (/^\/contact\/?$/.test(path)) {
        if (window.__contactModal) { window.__contactModal.open(); return; }
      }
      /* home / anything else: close all overlays */
      window.__workDetail && window.__workDetail.close();
      window.__serviceDetail && window.__serviceDetail.close();
      window.__contactModal && window.__contactModal.close();
    } finally {
      suppressing = false;
    }
  }

  function cssEscape(s) {
    return (window.CSS && CSS.escape) ? CSS.escape(s) : String(s).replace(/["\\]/g, '\\$&');
  }

  window.__route = {
    push,
    home() { push('/'); },
    isSuppressing: () => suppressing,
  };

  /* browser back / forward */
  window.addEventListener('popstate', () => apply(location.pathname));

  /* deep link on first load (after data + overlays are ready) */
  document.addEventListener('dom:ready', function once() {
    document.removeEventListener('dom:ready', once);
    const p = location.pathname;
    if (p && p !== '/' && p !== '/index.html') {
      /* replace so the home state still sits beneath the deep-linked overlay */
      history.replaceState({ app: true }, '', p);
      apply(p);
    }
  });
})();
