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
    if (!d || !d.works || !d.works.items) return null;
    return d.works.items.find(w => w.id === id) || null;
  }

  function buildContent(w) {
    if (!w) return '';
    const hasGallery = w.gallery && w.gallery.length > 0;
    const galleryHTML = hasGallery
      ? w.gallery.map(src =>
          `<img src="${esc(src)}" alt="${esc(w.title)} screenshot" loading="lazy">`
        ).join('')
      : `<div class="work-expanded__placeholder ${esc(w.thumbStyle)}"><span>${esc(w.thumbInitials)}</span></div>`;

    const liveBtn = w.liveUrl
      ? `<a class="work-expanded__live btn-pill btn-pill--solid" href="${esc(w.liveUrl)}" target="_blank" rel="noopener">Visit live site <span class="btn-pill__arrow">\u2197</span></a>`
      : '';

    return `
      <div class="work-expanded__gallery">${galleryHTML}</div>
      <div class="work-expanded__info">
        <div class="work-expanded__meta">
          <h2>${esc(w.title)}</h2>
          <span class="mono">${esc(w.year)}</span>
          <p class="work-expanded__tags mono">${esc(w.tags)}</p>
        </div>
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
    inner.innerHTML = buildContent(w) + buildOtherCards(id);

    /* Position expanded overlay */
    expanded.style.display = 'block';
    expanded.removeAttribute('aria-hidden');
    document.body.style.overflow = 'hidden';

    /* GSAP Flip animation */
    if (typeof gsap !== 'undefined' && typeof Flip !== 'undefined') {
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

      /* Fade in other cards after flip */
      gsap.fromTo('.work-expanded__others, .work-expanded__info', 
        { autoAlpha: 0, y: 20 },
        { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.08, delay: 0.3 }
      );
    }

    /* close button */
    ensureCloseButton();
  }

  function close() {
    if (!activeId) return;
    const triggerEl = document.querySelector(`[data-work-id="${activeId}"]`);
    
    function finish() {
      inner.innerHTML = '';
      expanded.style.display = 'none';
      expanded.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      activeId = null;

      const lenis = getLenis();
      if (lenis) {
        lenis.start();
        lenis.scrollTo(capturedScrollY, { immediate: true });
      }
    }

    if (typeof gsap !== 'undefined' && typeof Flip !== 'undefined' && triggerEl) {
      gsap.set('.work-expanded__others, .work-expanded__info', { clearProps: 'all' });
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

  window.__workDetail = { open, close };

  function esc(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }
});
