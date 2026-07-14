/* service-detail.js - Service row gallery expansion for behavior:detail rows */
document.addEventListener('dom:ready', function () {
  const expanded = document.querySelector('.service-expanded');
  if (!expanded) return;

  const inner = expanded.querySelector('.service-expanded__inner');
  let activeId  = null;
  let capturedScrollY = 0;
  let lenisRef = null;

  function getLenis() {
    if (lenisRef) return lenisRef;
    if (window.__lenis) lenisRef = window.__lenis;
    return lenisRef;
  }

  function getServiceData(idx) {
    const d = window.__data;
    if (!d || !d.services || !d.services.rows) return null;
    return d.services.rows.find(r => r.idx === idx) || null;
  }

  function buildContent(svc) {
    if (!svc) return '';
    const hasGallery = svc.gallery && svc.gallery.length > 0;
    const arrows = hasGallery && svc.gallery.length > 1
      ? `<button class="carousel__btn carousel__btn--prev" data-carousel-prev aria-label="Previous image">‹</button>
         <button class="carousel__btn carousel__btn--next" data-carousel-next aria-label="Next image">›</button>`
      : '';
    const mediaHTML = hasGallery
      ? `<div class="service-expanded__carousel">
           <div class="service-expanded__gallery" data-carousel-track>${
             svc.gallery.map(item => renderSlide(item, svc.title)).join('')
           }</div>${arrows}</div>`
      : `<div class="service-expanded__carousel">
           <div class="service-expanded__placeholder"><span>${esc(svc.idx)}</span></div>
         </div>`;

    const liveBtn = svc.liveUrl
      ? `<a class="service-expanded__live btn-pill btn-pill--solid" href="${esc(svc.liveUrl)}" target="_blank" rel="noopener">Visit live site <span class="btn-pill__arrow">\u2197</span></a>`
      : '';

    return `
      ${mediaHTML}
      <div class="service-expanded__info">
        <h2>${esc(svc.title)}</h2>
        <p class="service-expanded__tags mono">${esc(svc.tags)}</p>
        <p class="service-expanded__desc">${esc(svc.description)}</p>
        ${liveBtn}
      </div>`;
  }

  function open(triggerEl) {
    const idx = triggerEl?.dataset?.serviceId;
    if (!idx || activeId === idx) return;
    activeId = idx;
    const svc = getServiceData(idx);
    if (!svc) return;

    const lenis = getLenis();
    if (lenis) {
      capturedScrollY = window.scrollY;
      lenis.stop();
      document.documentElement.style.transform = '';
    }

    inner.innerHTML = buildContent(svc);

    expanded.style.display = 'block';
    expanded.removeAttribute('aria-hidden');
    document.body.style.overflow = 'hidden';

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (typeof gsap !== 'undefined' && typeof Flip !== 'undefined' && !reduce) {
      gsap.fromTo(expanded, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'power2.out' });

      const stateFrom = Flip.getState(triggerEl);
      triggerEl.style.visibility = 'hidden';
      const stateTo = Flip.getState(inner, { props: 'borderRadius,padding' });
      triggerEl.style.visibility = '';

      Flip.from(stateFrom, {
        targets: inner,
        duration: 0.5,
        ease: 'power3.inOut',
        absolute: true,
        onStart() { inner.style.opacity = '1'; }
      });

      gsap.fromTo('.service-expanded__info',
        { autoAlpha: 0, y: 16 },
        { autoAlpha: 1, y: 0, duration: 0.3, delay: 0.25 }
      );
    }

    ensureCloseButton();

    /* sync URL */
    window.__route && window.__route.push('/services/' + encodeURIComponent(idx));
  }

  function close() {
    if (!activeId) return;
    window.__route && window.__route.home();
    const triggerEl = document.querySelector(`[data-service-id="${activeId}"]`);

    function finish() {
      inner.innerHTML = '';
      expanded.style.display = 'none';
      expanded.style.opacity = '';
      expanded.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      activeId = null;

      const lenis = getLenis();
      if (lenis) {
        lenis.start();
        lenis.scrollTo(capturedScrollY, { immediate: true });
      }
    }

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (typeof gsap !== 'undefined' && typeof Flip !== 'undefined' && triggerEl && !reduce) {
      gsap.set('.service-expanded__info', { clearProps: 'all' });
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
    if (document.querySelector('.service-expanded__close')) return;
    const btn = document.createElement('button');
    btn.className = 'service-expanded__close';
    btn.setAttribute('aria-label', 'Close');
    btn.innerHTML = '&times;';
    btn.addEventListener('click', (e) => { e.stopPropagation(); close(); });
    expanded.appendChild(btn);
  }

  /* Click handlers */
  document.addEventListener('click', (e) => {
    /* External service rows */
    const extRow = e.target.closest('[data-service-external]');
    if (extRow) {
      e.preventDefault();
      const url = extRow.dataset.serviceExternal;
      const target = extRow.dataset.serviceTarget || '_blank';
      if (url) window.open(url, target);
      return;
    }

    /* Detail service rows */
    const row = e.target.closest('[data-service-id]');
    if (row && !row.closest('.service-expanded')) {
      e.preventDefault();
      open(row);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && activeId) close();
  });

  window.__serviceDetail = { open, close };

  function esc(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
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
});
