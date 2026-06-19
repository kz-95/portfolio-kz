/* data.js - fetches data.json, exposes window.__data, handles errors */
const preloader = document.querySelector('.preloader');

function showFallback(message) {
  document.body.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;padding:2rem;font-family:system-ui,sans-serif;background:#f1f1ec;color:#14161b;text-align:center;">
      <div>
        <h1 style="font-size:2rem;margin-bottom:1rem;">ZEN</h1>
        <p style="color:#6b6f78;margin-bottom:0.5rem;">${message}</p>
        <p style="color:#6b6f78;font-size:0.85rem;">
          <a href="mailto:coffeeinveins@gmail.com" style="color:#2b3ff2;">coffeeinveins@gmail.com</a>
        </p>
      </div>
    </div>`;
}

async function loadData() {
  try {
    const resp = await fetch('data.json');
    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}`);
    }
    const data = await resp.json();
    window.__data = data;
    return data;
  } catch (err) {
    const offline = !navigator.onLine;
    const msg = offline
      ? 'Content failed to load - please check your connection and refresh.'
      : 'Content configuration error - please check data.json.';
    showFallback(msg);
    throw err;
  }
}

loadData().then((data) => {
  document.dispatchEvent(new CustomEvent('data:ready', { detail: data }));
}).catch(() => {
  /* fallback already shown */
});
