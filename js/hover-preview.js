/* hover-preview.js - cursor-following media preview for service rows.
   The card is portaled to <body> and positioned with `fixed` + translate, so it
   can never be clipped or re-anchored by a transformed ancestor (GSAP animates
   the sections above it). Pointer-events stay off so it never eats a click. */
document.addEventListener('dom:ready', function () {
  /* pointer-follow preview is a desktop affordance only */
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  if (!fine.matches) return;

  const CYCLE_MS = 1500;   /* dwell per still image when a row has several */
  const VIDEO_MS = 3300;   /* cap for a clip, unless the item is marked full */
  const YT_MS    = 8000;   /* youtube iframes give us no "ended" event */
  const EASE     = 0.16;   /* lerp factor - lower trails further behind cursor */
  const OFFSET_X = 28;     /* keep the card clear of the cursor itself */

  let card = null;
  let mediaBox = null;
  let activeRow = null;
  let items = [];
  let idx = 0;
  let cycleTimer = null;
  let rafId = null;

  /* target follows the cursor; current chases the target each frame */
  let targetX = 0, targetY = 0, curX = 0, curY = 0;
  let placed = false;

  function build() {
    if (card) return;
    card = document.createElement('div');
    card.className = 'svc-preview';
    card.setAttribute('aria-hidden', 'true');
    mediaBox = document.createElement('div');
    mediaBox.className = 'svc-preview__media';
    card.appendChild(mediaBox);
    document.body.appendChild(card);
  }

  function setMedia(item) {
    if (!item) return;
    mediaBox.innerHTML = '';

    let el;
    if (item.t === 'video') {
      el = document.createElement('video');
      el.src = item.s;
      el.muted = true;
      el.loop = false;          /* play it through once, then move on */
      el.playsInline = true;
      el.autoplay = true;
      el.preload = 'auto';
      el.play().catch(() => {});
    } else if (item.t === 'youtube') {
      el = document.createElement('iframe');
      el.src = `https://www.youtube-nocookie.com/embed/${item.id}` +
               `?autoplay=1&mute=1&controls=0&loop=0&playsinline=1&modestbranding=1&rel=0`;
      el.allow = 'autoplay; encrypted-media; picture-in-picture';
      el.setAttribute('frameborder', '0');
    } else {
      el = document.createElement('img');
      el.src = item.s;
      el.alt = '';
      el.loading = 'eager';
      el.decoding = 'async';
    }
    /* fade + un-blur each swap so cycling reads as a deliberate preview */
    el.className = 'svc-preview__el';
    mediaBox.appendChild(el);
    requestAnimationFrame(() => el.classList.add('is-in'));
  }

  function tick() {
    curX += (targetX - curX) * EASE;
    curY += (targetY - curY) * EASE;
    card.style.transform = `translate3d(${curX.toFixed(1)}px, ${curY.toFixed(1)}px, 0)`;
    rafId = requestAnimationFrame(tick);
  }

  /* clamp so the card never hangs off-screen */
  function position(e) {
    const w = card.offsetWidth  || 320;
    const h = card.offsetHeight || 180;
    const x = Math.min(e.clientX + OFFSET_X, window.innerWidth  - w - 16);
    const y = Math.min(Math.max(e.clientY - h / 2, 16), window.innerHeight - h - 16);
    targetX = x;
    targetY = y;
    if (!placed) { curX = x; curY = y; placed = true; }  /* first frame: no trail-in from 0,0 */
  }

  function show(row, e) {
    let parsed;
    try { parsed = JSON.parse(row.dataset.svcPreview || '[]'); } catch (err) { return; }
    if (!parsed.length) return;

    build();
    activeRow = row;
    items = parsed;
    idx = 0;
    placed = false;

    position(e);
    setMedia(items[0]);
    card.classList.add('is-visible');

    if (rafId === null) rafId = requestAnimationFrame(tick);

    if (items.length > 1) queueNext();
  }

  /* Each item holds for its own dwell:
       still          -> CYCLE_MS
       video          -> until it ends, capped at VIDEO_MS
       video + full   -> until it ends, no cap
       youtube        -> YT_MS (an iframe gives us no reliable "ended") */
  function queueNext() {
    clearTimeout(cycleTimer);
    const item = items[idx];
    let fired = false;

    const advance = () => {
      if (fired || !activeRow) return;
      fired = true;
      clearTimeout(cycleTimer);
      idx = (idx + 1) % items.length;
      setMedia(items[idx]);
      queueNext();
    };

    if (item && item.t === 'video') {
      const v = mediaBox.querySelector('video');
      if (v) v.addEventListener('ended', advance, { once: true });
      if (!item.full) cycleTimer = setTimeout(advance, VIDEO_MS);
    } else if (item && item.t === 'youtube') {
      cycleTimer = setTimeout(advance, item.hold || YT_MS);
    } else {
      /* a gif carries its own length, so it can ask for a longer dwell */
      cycleTimer = setTimeout(advance, (item && item.hold) || CYCLE_MS);
    }
  }

  function hide() {
    if (!activeRow) return;
    activeRow = null;
    clearTimeout(cycleTimer);
    cycleTimer = null;

    if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
    if (!card) return;

    card.classList.remove('is-visible');
    /* drop the <video> so it stops decoding once the card is out of sight */
    setTimeout(() => { if (!activeRow && mediaBox) mediaBox.innerHTML = ''; }, 260);
  }

  document.addEventListener('mouseover', (e) => {
    const row = e.target.closest('[data-svc-preview]');
    if (!row || row === activeRow) return;
    if (activeRow) hide();
    show(row, e);
  });

  document.addEventListener('mouseout', (e) => {
    const row = e.target.closest('[data-svc-preview]');
    if (row && row === activeRow && !row.contains(e.relatedTarget)) hide();
  });

  document.addEventListener('mousemove', (e) => {
    if (activeRow && card) position(e);
  }, { passive: true });

  /* a modal opening over the row would otherwise strand the card on screen.
     NB: don't hide on scroll - Lenis emits scroll continuously during its
     momentum phase, which would tear the card down the instant it appears. */
  document.addEventListener('click', hide);
});
