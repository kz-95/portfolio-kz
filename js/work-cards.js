/* work-cards.js - hover behaviour for the Selected Works cards.

   Each thumb is three stacked layers:
     bottom  .work-card__preview  gallery / video, hidden until hover
     middle  .work-card__shade    translucent shade, fades away on hover
     top     .work-card__initials glass-masked letters + stroked outline

   On hover the initials "un-draw" (the outline animates back to nothing) and
   the glass dissolves; on leave they simply fade back in. */
document.addEventListener('dom:ready', function () {
  const PHOTO_MS = 1500;   /* dwell per still in a card preview */
  const VIDEO_MS = 3000;   /* a clip gets at most this long before the next item */
  const FADE_MS  = 600;    /* must outlast the .is-back fade in CSS */

  const state = new WeakMap();

  function mediaOf(thumb) {
    try { return JSON.parse(thumb.dataset.preview || '[]'); } catch (e) { return []; }
  }

  function makeEl(item, loop) {
    let el;
    if (item.t === 'video') {
      el = document.createElement('video');
      el.src = item.s;
      el.muted = true;
      /* a lone clip loops (there is nothing to advance to); in a reel it plays once */
      el.loop = !!loop;
      el.playsInline = true;
      el.preload = 'auto';
      el.play().catch(() => {});
    } else {
      el = document.createElement('img');
      el.src = item.s;
      el.alt = '';
      el.decoding = 'async';
    }
    el.className = 'work-card__media';
    return el;
  }

  /* crossfade: stack the incoming layer on top, then drop the old one */
  function swap(box, item, loop) {
    const next = makeEl(item, loop);
    box.appendChild(next);
    requestAnimationFrame(() => next.classList.add('is-in'));
    const stale = [...box.children].filter(c => c !== next);
    setTimeout(() => stale.forEach(c => c.remove()), 450);
    return next;
  }

  function enter(card) {
    const thumb = card.querySelector('.work-card__thumb');
    const box = card.querySelector('.work-card__preview');
    if (!thumb || !box) return;

    card.classList.remove('is-back');
    card.classList.add('is-hover');

    const items = mediaOf(thumb);
    if (!items.length) return;

    const prev = state.get(card);
    if (prev) clearTimeout(prev.timer);

    const solo = items.length === 1;
    let i = 0;
    let el = swap(box, items[0], solo);

    /* Each item holds for its own dwell:
         still        -> PHOTO_MS
         video        -> until it ends, capped at VIDEO_MS
         video + full -> until it ends, no cap */
    const s = { timer: null };
    function queueNext() {
      clearTimeout(s.timer);
      const item = items[i];
      let fired = false;

      const advance = () => {
        if (fired || !card.classList.contains('is-hover')) return;
        fired = true;
        clearTimeout(s.timer);
        i = (i + 1) % items.length;
        el = swap(box, items[i], false);
        queueNext();
      };

      if (item && item.t === 'video') {
        if (el && el.tagName === 'VIDEO') el.addEventListener('ended', advance, { once: true });
        if (!item.full) s.timer = setTimeout(advance, VIDEO_MS);
      } else {
        /* a gif carries its own length, so it can ask for a longer dwell */
        s.timer = setTimeout(advance, (item && item.hold) || PHOTO_MS);
      }
    }
    if (!solo) queueNext();
    state.set(card, s);
  }

  function leave(card) {
    const box = card.querySelector('.work-card__preview');
    const s = state.get(card);
    if (s) { clearTimeout(s.timer); state.delete(card); }

    card.classList.remove('is-hover');
    card.classList.add('is-back');

    setTimeout(() => {
      card.classList.remove('is-back');
      if (box && !card.classList.contains('is-hover')) box.innerHTML = '';
    }, FADE_MS);
  }

  document.addEventListener('mouseover', (e) => {
    const card = e.target.closest('.work-card');
    if (card && !card.contains(e.relatedTarget)) enter(card);
  });
  document.addEventListener('mouseout', (e) => {
    const card = e.target.closest('.work-card');
    if (card && !card.contains(e.relatedTarget)) leave(card);
  });
});
