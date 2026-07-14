/* work-detail.js - Selected Works card-to-modal expansion with GSAP Flip */
document.addEventListener('dom:ready', function () {
  const expanded = document.querySelector('.work-expanded');
  if (!expanded) return;

  const inner = expanded.querySelector('.work-expanded__inner');
  let activeId  = null;
  let capturedScrollY = 0;
  let lenisRef = null;

  function getLenis() {
    if (lenisRef) return lenisRef;
    if (window.__lenis) lenisRef = window.__lenis;
    return lenisRef;
  }

  function getWorkData(id) {
    const d = window.__data;
    if (!d) return null;
    if (d.works && d.works.items) {
      const w = d.works.items.find(w => w.id === id);
      if (w) return w;
    }
    /* featured case study (section 01) opens through the same overlay carousel */
    if (d.caseStudy && d.caseStudy.id === id) {
      const c = d.caseStudy;
      return {
        id: c.id,
        title: `${c.titleLine1 || ''} ${c.titleLine2 || ''}`.trim(),
        year: (c.meta && c.meta.year) || '',
        tags: (c.meta && c.meta.scope) || '',
        thumbStyle: 'thumb-invoice',
        thumbInitials: 'MHS',
        gallery: c.gallery || [],
        description: c.subtitle || '',
        liveUrl: (c.cta && c.cta.url) || ''
      };
    }
    return null;
  }

  function buildContent(w) {
    if (!w) return '';
    const hasGallery = w.gallery && w.gallery.length > 0;
    const arrows = hasGallery && w.gallery.length > 1
      ? `<button class="carousel__btn carousel__btn--prev" data-carousel-prev aria-label="Previous image">‹</button>
         <button class="carousel__btn carousel__btn--next" data-carousel-next aria-label="Next image">›</button>`
      : '';
    const mediaHTML = hasGallery
      ? `<div class="work-expanded__carousel">
           <div class="work-expanded__gallery" data-carousel-track>${
             w.gallery.map(item => renderSlide(item, w.title)).join('')
           }</div>${arrows}</div>`
      : `<div class="work-expanded__carousel">
           <div class="work-expanded__placeholder ${esc(w.thumbStyle)}"><span>${esc(w.thumbInitials)}</span></div>
         </div>`;

    const liveBtn = w.liveUrl
      ? `<a class="work-expanded__live" href="${esc(w.liveUrl)}" target="_blank" rel="noopener">Visit live site <span class="work-expanded__live-arrow" aria-hidden="true">\u2192</span></a>`
      : '';

    return `
      <div class="work-expanded__header">
        <h2 class="work-expanded__title">${esc(w.title)}</h2>
        <span class="work-expanded__year mono">${esc(w.year)}</span>
        <p class="work-expanded__tags mono">${esc(w.tags)}</p>
      </div>
      <div class="work-expanded__sep"></div>
      ${mediaHTML}
      <div class="work-expanded__desc-row">
        <p class="work-expanded__desc">${esc(w.description)}</p>
        ${liveBtn}
      </div>`;
  }

  function buildOtherCards(currentId) {
    const d = window.__data;
    if (!d || !d.works || !d.works.items) return '';
    const others = d.works.items.filter(w => w.id !== currentId);
    if (!others.length) return '';
    return `<div class="work-expanded__others">
      ${others.map(w => {
        const imgs = galImages(w.gallery);          // still-image srcs for the hover slideshow
        const vid  = galFirstVideo(w.gallery);      // first playable video, if any
        const base = imgs[0] || '';
        const bgStyle = base ? ` style="--card-bg:url('${esc(absUrl(base))}')"` : '';
        const media = vid
          ? `<video class="work-expanded__other-vid" src="${esc(vid)}" muted loop playsinline preload="none"></video>`
          : '';
        return `
        <div class="work-expanded__other-card ${base ? 'has-media' : esc(w.thumbStyle)}" data-work-id="${esc(w.id)}" data-preview='${esc(JSON.stringify(imgs))}'${bgStyle}>
          <div class="work-expanded__other-media" aria-hidden="true">${media}</div>
          <div class="work-expanded__other-glass">
            <span>${esc(w.thumbInitials)}</span>
            <p>${esc(w.title)}</p>
          </div>
        </div>`;
      }).join('')}
    </div>`;
  }

  function open(triggerEl) {
    const id = triggerEl?.dataset?.workId;
    if (!id || activeId === id) return;
    activeId = id;
    const w = getWorkData(id);
    if (!w) return;

    /* Stop Lenis before Flip */
    const lenis = getLenis();
    if (lenis) {
      capturedScrollY = window.scrollY;
      lenis.stop();
      document.documentElement.style.transform = '';
    }

    /* Build content */
    inner.innerHTML = buildContent(w) + '<div class="work-expanded__sep"></div>' + buildOtherCards(id);

    /* Position expanded overlay */
    expanded.style.display = 'block';
    expanded.removeAttribute('aria-hidden');
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    /* GSAP Flip animation */
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (typeof gsap !== 'undefined' && typeof Flip !== 'undefined' && !reduce) {
      /* fade the overlay backdrop in so the card morph reads cleanly */
      gsap.fromTo(expanded, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'power2.out' });

      const stateFrom = Flip.getState(triggerEl);
      /* swap trigger visibility for state collection */
      triggerEl.style.visibility = 'hidden';
      const stateTo = Flip.getState(inner, { props: 'borderRadius,padding' });
      triggerEl.style.visibility = '';

      const flipTl = Flip.from(stateFrom, {
        targets: inner,
        duration: 0.5,
        ease: 'power3.inOut',
        absolute: true,
        onStart() {
          inner.style.opacity = '1';
        }
      });

      /* Fade in body + other cards after flip */
      gsap.fromTo('.work-expanded__desc-row, .work-expanded__others',
        { autoAlpha: 0, y: 20 },
        { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.08, delay: 0.3 }
      );
    }

    /* close button */
    ensureCloseButton();

    /* sync URL */
    window.__route && window.__route.push('/work/' + encodeURIComponent(id));
  }

  function close() {
    if (!activeId) return;
    window.__route && window.__route.home();
    const triggerEl = document.querySelector(`[data-work-id="${activeId}"]`);
    
    function finish() {
      inner.innerHTML = '';
      expanded.style.display = 'none';
      expanded.style.opacity = '';
      expanded.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      activeId = null;

      const lenis = getLenis();
      if (lenis) {
        lenis.start();
        lenis.scrollTo(capturedScrollY, { immediate: true });
      }
    }

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (typeof gsap !== 'undefined' && typeof Flip !== 'undefined' && triggerEl && !reduce) {
      gsap.set('.work-expanded__desc-row, .work-expanded__others', { clearProps: 'all' });
      gsap.to(expanded, { opacity: 0, duration: 0.32, ease: 'power2.in' });
      const stateTo = Flip.getState(triggerEl);
      Flip.from(stateTo, {
        targets: inner,
        duration: 0.4,
        ease: 'power3.in',
        absolute: true,
        onComplete: finish
      });
    } else {
      finish();
    }
  }

  function ensureCloseButton() {
    if (document.querySelector('.work-expanded__close')) return;
    const btn = document.createElement('button');
    btn.className = 'work-expanded__close';
    btn.setAttribute('aria-label', 'Close');
    btn.innerHTML = '&times;';
    btn.addEventListener('click', (e) => { e.stopPropagation(); close(); });
    expanded.appendChild(btn);
  }

  /* Click handlers on work cards */
  document.addEventListener('click', (e) => {
    const card = e.target.closest('[data-work-id]');
    if (card && !card.closest('.work-expanded')) {
      e.preventDefault();
      open(card);
    }
    /* Switch between other cards */
    const otherCard = e.target.closest('.work-expanded__other-card');
    if (otherCard) {
      const newId = otherCard.dataset.workId;
      const triggerEl = document.querySelector(`[data-work-id="${newId}"]`);
      if (triggerEl) open(triggerEl);
    }
  });

  /* Escape to close */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && activeId) close();
  });

  /* Carousel arrows (works for work + service detail overlays) */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-carousel-prev], [data-carousel-next]');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    const track = btn.parentElement.querySelector('[data-carousel-track]');
    if (!track) return;
    const dir = btn.hasAttribute('data-carousel-next') ? 1 : -1;
    track.scrollBy({ left: dir * track.clientWidth, behavior: 'smooth' });
  });

  window.__workDetail = { open, close };

  function esc(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  /* A relative url() inside a custom property resolves against the stylesheet that
     USES it (css/style.css), not the document - so "img/x.png" would 404 as
     "css/img/x.png". Hand CSS an absolute URL instead. */
  function absUrl(src) {
    try { return new URL(src, document.baseURI).href; } catch (e) { return src; }
  }

  /* gallery items may be a plain "src" string or a { src, caption, type, id, poster } object */
  function galSrc(item) { return typeof item === 'string' ? item : (item && item.src) || ''; }
  function galCap(item) { return typeof item === 'string' ? '' : (item && item.caption) || ''; }
  function galUrl(item) { return typeof item === 'string' ? '' : (item && item.url) || ''; }
  function galTitle(item) { return typeof item === 'string' ? '' : (item && item.title) || ''; }
  function galType(item) {
    if (typeof item === 'string') return 'image';
    return (item && item.type) || 'image';
  }

  /* still images only - used for the hover slideshow on the "other work" cards */
  function galImages(gallery) {
    return (gallery || []).filter(i => galType(i) === 'image').map(galSrc).filter(Boolean);
  }
  /* first self-hosted video in a gallery, if any (youtube is not hover-playable) */
  function galFirstVideo(gallery) {
    const v = (gallery || []).find(i => galType(i) === 'video');
    return v ? galSrc(v) : '';
  }

  /* one carousel slide: image, self-hosted video, or youtube embed */
  function renderSlide(item, title) {
    const type = galType(item);
    const cap  = galCap(item);
    const url  = galUrl(item);
    const ttl  = galTitle(item);
    /* a slide that points at a live site gets the same desc-row treatment as the modal footer */
    const capHTML = (cap || url || ttl)
      ? `<figcaption class="carousel__caption${url ? ' work-expanded__desc-row' : ''}">
           <span class="carousel__meta">
             ${ttl ? `<b class="carousel__title">${esc(ttl)}</b>` : ''}
             ${cap ? `<span class="work-expanded__desc">${esc(cap)}</span>` : ''}
           </span>
           ${url ? `<a class="work-expanded__live" href="${esc(url)}" target="_blank" rel="noopener">Visit live site <span class="work-expanded__live-arrow" aria-hidden="true">→</span></a>` : ''}
         </figcaption>`
      : '';

    let media;
    if (type === 'youtube') {
      const id = (item && item.id) || '';
      media = `<iframe class="carousel__yt" src="https://www.youtube-nocookie.com/embed/${esc(id)}"
                 title="${esc(title)} video" loading="lazy" allowfullscreen
                 allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>`;
    } else if (type === 'video') {
      const poster = item && item.poster ? ` poster="${esc(item.poster)}"` : '';
      media = `<video class="carousel__video" src="${esc(galSrc(item))}"${poster}
                 controls playsinline preload="metadata"></video>`;
    } else {
      /* NOT loading="lazy": the slides are built while the modal is still
         display:none, so a lazy image never becomes "visible" and is never
         fetched - the slide just renders as an empty box. */
      media = `<img src="${esc(galSrc(item))}" alt="${esc(title)} preview" decoding="async">`;
    }
    return `<figure class="carousel__slide">${media}${capHTML}</figure>`;
  }

  /* ── hover preview on the "other work" cards ──────────────
     cards with a video play it on hover; cards with 2+ stills
     cycle through them as a slideshow.                        */
  const cardTimers = new WeakMap();

  function startPreview(card) {
    const vid = card.querySelector('.work-expanded__other-vid');
    if (vid) {
      vid.play().catch(() => {});
      return;
    }
    let imgs = [];
    try { imgs = JSON.parse(card.dataset.preview || '[]'); } catch (e) { imgs = []; }
    if (imgs.length < 2) return;

    let i = 0;
    const timer = setInterval(() => {
      i = (i + 1) % imgs.length;
      card.style.setProperty('--card-bg', `url('${absUrl(imgs[i])}')`);
    }, 900);
    cardTimers.set(card, { timer, imgs });
  }

  function stopPreview(card) {
    const vid = card.querySelector('.work-expanded__other-vid');
    if (vid) { vid.pause(); vid.currentTime = 0; }

    const state = cardTimers.get(card);
    if (!state) return;
    clearInterval(state.timer);
    cardTimers.delete(card);
    if (state.imgs[0]) card.style.setProperty('--card-bg', `url('${absUrl(state.imgs[0])}')`);
  }

  document.addEventListener('mouseover', (e) => {
    const card = e.target.closest('.work-expanded__other-card');
    if (card && !card.contains(e.relatedTarget)) startPreview(card);
  });
  document.addEventListener('mouseout', (e) => {
    const card = e.target.closest('.work-expanded__other-card');
    if (card && !card.contains(e.relatedTarget)) stopPreview(card);
  });
});
