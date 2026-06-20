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
             w.gallery.map(src => `<img src="${esc(src)}" alt="${esc(w.title)} preview" loading="lazy">`).join('')
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
      ${others.map(w => `
        <div class="work-expanded__other-card ${esc(w.thumbStyle)}" data-work-id="${esc(w.id)}">
          <span>${esc(w.thumbInitials)}</span>
          <p>${esc(w.title)}</p>
        </div>`).join('')}
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
});
