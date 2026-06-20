/* render.js - populates DOM from window.__data */
document.addEventListener('data:ready', (e) => {
  const d = e.detail;
  if (!d) return;

  setTheme(d.theme);
  setMeta(d.meta);
  renderNav(d.nav, d.global);
  renderHero(d.hero, d.global);
  renderBand(d.bandText);
  renderCaseStudy(d.caseStudy);
  renderWorks(d.works);
  renderAbout(d.about);
  renderServices(d.services);
  renderContact(d.contact, d.global);
  renderFooter(d.footer, d.global);
  renderSectionThemes(d.sections);
  renderHiddenContainers();
  startClock(d.global.timezoneIANA);
  document.dispatchEvent(new CustomEvent('dom:ready'));
});

/* theme CSS custom properties */
function setTheme(t) {
  if (!t) return;
  const root = document.documentElement.style;
  if (t.paper)      root.setProperty('--paper', t.paper);
  if (t.stone)      root.setProperty('--stone', t.stone);
  if (t.ink)        root.setProperty('--ink', t.ink);
  if (t.inkSoft)    root.setProperty('--ink-soft', t.inkSoft);
  if (t.accent)     root.setProperty('--accent', t.accent);
  if (t.accentDeep) root.setProperty('--accent-deep', t.accentDeep);
  if (t.accentLite) root.setProperty('--accent-lite', t.accentLite);
  if (t.muted)      root.setProperty('--muted', t.muted);
  if (t.line)       root.setProperty('--line', t.line);
  if (t.linePaper)  root.setProperty('--line-paper', t.linePaper);
  if (t.geoColor)   root.setProperty('--geo-color', t.geoColor);
}

/* meta tags */
function setMeta(m) {
  if (!m) return;
  document.title = m.title || document.title;
  const setMetaTag = (name, content, isProperty) => {
    if (!content) return;
    const attr = isProperty ? 'property' : 'name';
    let el = document.querySelector(`meta[${attr}="${name}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };
  setMetaTag('description', m.description);
  setMetaTag('og:title', m.ogTitle, true);
  setMetaTag('og:description', m.ogDescription, true);
}

/* nav */
function renderNav(nav, g) {
  if (!nav) return;
  const logo = qs(S.navLogo);
  if (logo) logo.innerHTML = `${esc(nav.logo)}<sup>\u00a9</sup>`;
  const links = qs(S.navLinks);
  if (links && nav.links) {
    links.innerHTML = nav.links.map(l =>
      `<a href="${esc(l.href)}" data-scroll>${esc(l.label)}</a>`
    ).join('');
  }
  const cta = qs(S.navCta);
  if (cta && nav.cta) {
    cta.setAttribute('href', nav.cta.href);
    cta.innerHTML = `${esc(nav.cta.label)} <span class="btn-pill__arrow">\u2192</span>`;
    cta.setAttribute('data-contact-cta', '');
  }
}

/* hero */
function renderHero(h, g) {
  if (!h) return;
  const eyebrow = qs(S.heroEyebrow);
  if (eyebrow) eyebrow.textContent = h.eyebrow;
  const name = qs(S.heroName);
  if (name) {
    const indent = h.nameLine2 ? ' hero__line--indent' : '';
    name.innerHTML = `
      <span class="hero__line"><span class="split-chars">${esc(h.nameLine1)}</span></span>
      <span class="hero__line${indent}"><span class="split-chars">${esc(h.nameLine2 || '')}</span><span class="hero__star" aria-hidden="true">\u25c6</span></span>`;
  }
  const tag = qs(S.heroTag);
  if (tag) tag.innerHTML = `<em>${esc(h.tag)}</em>`;
  const actions = qs(S.heroActions);
  if (actions) {
    actions.innerHTML = '';
    if (h.ctaPrimary) {
      const a = document.createElement('a');
      a.className = 'btn-pill btn-pill--solid';
      a.href = h.ctaPrimary.href;
      a.setAttribute('data-magnetic', '');
      a.setAttribute('data-contact-cta', '');
      a.innerHTML = `${esc(h.ctaPrimary.label)} <span class="btn-pill__arrow">\u2192</span>`;
      actions.appendChild(a);
    }
    if (h.ctaSecondary) {
      const a = document.createElement('a');
      a.className = 'btn-pill btn-pill--ghost';
      a.href = h.ctaSecondary.href;
      a.setAttribute('data-scroll', '');
      a.setAttribute('data-magnetic', '');
      a.innerHTML = `${esc(h.ctaSecondary.label)} <span class="btn-pill__arrow">\u2193</span>`;
      actions.appendChild(a);
    }
  }
  const avail = qs(S.heroAvail);
  if (avail && g) {
    avail.innerHTML = `<span class="pulse-dot" aria-hidden="true"></span><span class="mono">${esc(g.availability)}</span>`;
  }
  const scroll = qs(S.heroScroll);
  if (scroll) {
    scroll.innerHTML = `${esc(h.scrollText || 'SCROLL')}<span class="hero__scroll-line"></span>`;
  }
  const geo = qs(S.heroGeo);
  if (geo && g) {
    geo.innerHTML = `${esc(g.location)}\u2002\u00b7\u2002<span class="js-clock">--:--:--</span> ${esc(g.timezone)}`;
  }
}

/* band marquee */
function renderBand(text) {
  const track = qs(S.bandTrack);
  if (track && text) {
    track.innerHTML = `<span>${esc(text)}&nbsp;</span><span>${esc(text)}&nbsp;</span>`;
  }
}

/* case study */
function renderCaseStudy(cs) {
  if (!cs) return;
  /* separate label render is separate .sec-label in the head */
  /* we find the case section's specific elements */
  const caseEl = qs(S.caseSection);
  if (!caseEl) return;

  /* section label */
  const label = caseEl.querySelector(S.secLabel);
  if (label) label.textContent = cs.sectionLabel;

  /* title */
  const title = caseEl.querySelector(S.caseTitle);
  if (title) {
    title.innerHTML = `
      <span class="line-mask"><span class="line-inner">${esc(cs.titleLine1)}</span></span>
      <span class="line-mask"><span class="line-inner"><em>${esc(cs.titleLine2)}</em></span></span>`;
  }

  /* subtitle */
  const sub = caseEl.querySelector(S.caseSub);
  if (sub) sub.textContent = cs.subtitle;

  /* copy text */
  const copy = caseEl.querySelector(S.caseCopy);
  if (copy && cs.description) {
    const descP = copy.querySelector('p');
    if (descP) descP.innerHTML = cs.description;
  }

  /* points */
  const points = caseEl.querySelector(S.casePoints);
  if (points && cs.points) {
    points.innerHTML = cs.points.map((p, i) =>
      `<li class="reveal-up"><span class="mono">\u2460</span> ${esc(p)}</li>`
        .replace('\u2460', ['\u2460','\u2461','\u2462','\u2463'][i] || '\u2460')
    ).join('');
  }

  /* meta */
  const meta = caseEl.querySelector(S.caseMeta);
  if (meta && cs.meta) {
    const keys = ['ROLE','SCOPE','PLATFORM','YEAR'];
    const vals = [cs.meta.role, cs.meta.scope, cs.meta.platform, cs.meta.year];
    meta.innerHTML = keys.map((k, i) =>
      `<div><dt class="mono">${k}</dt><dd>${esc(vals[i] || '')}</dd></div>`
    ).join('');
  }

  /* cta */
  const cta = caseEl.querySelector('.btn-pill--paper');
  if (cta && cs.cta) {
    cta.href = cs.cta.url;
    cta.innerHTML = `${esc(cs.cta.label)} <span class="btn-pill__arrow">\u2197</span>`;
  }

  /* stats */
  const stats = caseEl.querySelector(S.caseStats);
  if (stats && cs.stats) {
    stats.innerHTML = cs.stats.map(s => {
      if (typeof s.value === 'string') {
        return `<div class="stat reveal-up"><b>${esc(s.value)}</b><span>${esc(s.label)}</span></div>`;
      }
      return `<div class="stat reveal-up"><b data-count="${s.value}">0</b><span>${esc(s.label)}</span></div>`;
    }).join('');
  }

  /* gallery */
  const gallery = caseEl.querySelector('.case__gallery');
  if (gallery && cs.gallery && cs.gallery.length > 0) {
    gallery.innerHTML = cs.gallery.map(src =>
      `<img src="${src}" alt="Case study screenshot" loading="lazy">`
    ).join('');
    gallery.style.display = 'grid';
  } else if (gallery) {
    gallery.style.display = 'none';
  }

  /* mockup images */
  const browserImg = caseEl.querySelector('.mhs-browser__img');
  if (browserImg && cs.mockupBrowser) browserImg.src = cs.mockupBrowser;
  const phoneImg = caseEl.querySelector('.mhs-phone__img');
  if (phoneImg && cs.mockupPhone) phoneImg.src = cs.mockupPhone;
}

/* selected works */
function renderWorks(ws) {
  if (!ws) return;
  const worksSection = qs(S.works);
  if (worksSection) {
    const label = worksSection.querySelector(S.secLabel);
    if (label && ws.sectionLabel) label.textContent = ws.sectionLabel;
  }
  const items = ws.items;
  const grid = qs(S.worksGrid);
  if (!grid || !items) return;
  grid.innerHTML = items.map((w, i) => `
    <div class="work-card reveal-up" data-work-id="${esc(w.id)}" data-cursor="view">
      <div class="work-card__thumb ${esc(w.thumbStyle)}"><span>${esc(w.thumbInitials)}</span></div>
      <div class="work-card__row"><h3>${esc(w.title)}</h3><span class="mono">${esc(w.year)}</span></div>
      <p class="work-card__tags mono">${esc(w.tags)}</p>
    </div>
  `).join('');
}

/* about */
function renderAbout(a) {
  if (!a) return;
  const about = qs(S.about);
  if (!about) return;

  const label = about.querySelector(S.secLabel);
  if (label) label.textContent = a.sectionLabel;

  const title = about.querySelector(S.aboutTitle);
  if (title && a.titleLines) {
    title.innerHTML = a.titleLines.map(line =>
      `<span class="line-mask"><span class="line-inner">${esc(line)}</span></span>`
    ).join('\n');
  }

  const bio = about.querySelector(`${S.aboutCopy} > p`);
  if (bio) bio.innerHTML = a.bio;

  const portraitArt = about.querySelector('.about__portrait-art');
  if (portraitArt && a.portrait) {
    portraitArt.style.backgroundImage = `url(${a.portrait})`;
    portraitArt.style.backgroundSize = 'cover';
    portraitArt.style.backgroundPosition = 'center';
  }

  const caption = about.querySelector(`${S.aboutPortrait} .mono`);
  if (caption) caption.textContent = a.portraitCaption;

  const stats = about.querySelector(S.aboutStats);
  if (stats && a.stats) {
    stats.innerHTML = a.stats.map(s => {
      if (s.value === '\u221e') {
        return `<div class="stat reveal-up"><b>\u221e</b><span>${esc(s.label)}</span></div>`;
      }
      return `<div class="stat reveal-up"><b data-count="${s.value}">0</b><span>${esc(s.label)}</span></div>`;
    }).join('');
  }
}

/* services */
function renderServices(s) {
  if (!s) return;
  const svc = qs(S.services);
  if (!svc) return;

  const label = svc.querySelector(S.secLabel);
  if (label) label.textContent = s.sectionLabel;

  const list = qs(S.servicesList);
  if (list && s.rows) {
    list.innerHTML = s.rows.map(row => {
      const extIcon = row.behavior === 'external' ? ' \u21d7' : '';
      const dataAttrs = row.behavior === 'detail'
        ? ` data-service-id="${esc(row.idx)}"`
        : row.behavior === 'external'
        ? ` data-service-external="${esc(row.url)}" data-service-target="${row.targetBlank ? '_blank' : '_self'}"`
        : '';
      return `
        <li class="svc-row" data-cursor="plus"${dataAttrs}>
          <span class="svc-row__idx mono">${esc(row.idx)}</span>
          <h3>${esc(row.title)}</h3>
          <p class="svc-row__tags mono">${esc(row.tags)}</p>
          <span class="svc-row__arrow" aria-hidden="true">\u2192</span>
        </li>`;
    }).join('');
  }
}

/* contact */
function renderContact(c, g) {
  if (!c) return;
  const contact = qs(S.contact);
  if (!contact) return;

  const label = contact.querySelector(S.secLabel);
  if (label) label.textContent = c.sectionLabel;

  const kicker = qs(S.contactKicker);
  if (kicker) kicker.innerHTML = `<em>${esc(c.kicker)}</em>`;

  const cta = qs(S.contactCta);
  if (cta) {
    cta.setAttribute('data-contact-cta', '');
    cta.innerHTML = `<span class="line-mask"><span class="line-inner">${esc(c.cta)}&nbsp;<span class="contact__arrow">\u2197</span></span></span>`;
  }

  /* meta */
  const meta = qs(S.contactMeta);
  if (meta) {
    meta.innerHTML = `
      <div><p class="mono">EMAIL</p><a href="mailto:${esc(c.email || g.email)}">${esc(c.email || g.email)}</a></div>
      <div><p class="mono">AVAILABILITY</p><p><span class="pulse-dot" aria-hidden="true"></span> ${esc(c.availability || g.availability)}</p></div>
      <div><p class="mono">SOCIALS</p>
        <div class="contact__socials">${(c.socials || []).map(s =>
          `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}</a>`
        ).join('')}</div>
      </div>`;
  }
}

/* footer */
function renderFooter(f, g) {
  if (!f) return;
  const big = qs(S.footerBig);
  if (big) big.innerHTML = esc(f.outline).replace(/ /g, '&nbsp;') + '&nbsp;\u25c6';

  const bar = qs(S.footerBar);
  if (bar) {
    bar.innerHTML = `
      <p>${esc(f.copyright)}</p>
      <p class="footer__made">${esc(f.madeIn)} \u00b7 <span class="js-clock">--:--:--</span> ${esc(g.timezone)}</p>
      <button class="footer__top" data-scroll-top>Back to top \u2191</button>`;
  }
}

/* section nav-theme attributes */
function renderSectionThemes(sections) {
  if (!sections) return;
  Object.entries(sections).forEach(([key, cfg]) => {
    if (!cfg.id) return;
    const el = document.getElementById(cfg.id);
    if (el && cfg.navTheme) {
      el.setAttribute('data-nav-theme', cfg.navTheme);
    }
  });
}

/* hidden containers for work/service expansions */
function renderHiddenContainers() {
  const main = document.querySelector('main') || document.body;
  if (!document.querySelector('.work-expanded')) {
    const el = document.createElement('div');
    el.className = 'work-expanded';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = '<div class="work-expanded__inner"></div>';
    main.appendChild(el);
  }
  if (!document.querySelector('.service-expanded')) {
    const el = document.createElement('div');
    el.className = 'service-expanded';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = '<div class="service-expanded__inner"></div>';
    main.appendChild(el);
  }
  if (!document.querySelector('.contact-modal')) {
    const el = document.createElement('div');
    el.className = 'contact-modal';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = `
      <div class="contact-modal__backdrop"></div>
      <div class="contact-modal__panel">
        <button class="contact-modal__close" aria-label="Close">&times;</button>
        <h2 class="contact-modal__title">Let's talk</h2>
        <form class="contact-modal__form" novalidate>
          <div class="contact-modal__field">
            <label class="mono" for="cm-email">Email <span class="required">*</span></label>
            <input type="email" id="cm-email" placeholder="you@example.com" required autocomplete="email">
            <span class="contact-modal__error"></span>
          </div>
          <div class="contact-modal__field">
            <label class="mono" for="cm-subject">Subject</label>
            <input type="text" id="cm-subject" hidden>
          </div>
          <div class="contact-modal__field">
            <label class="mono" for="cm-body">Message</label>
            <textarea id="cm-body" rows="5" hidden></textarea>
          </div>
          <input type="text" name="_honey" style="display:none" tabindex="-1" autocomplete="off">
          <button type="submit" class="contact-modal__submit btn-pill btn-pill--solid">
            <span class="contact-modal__submit-text">Send message</span>
            <span class="contact-modal__spinner" hidden></span>
          </button>
        </form>
        <p class="contact-modal__success" hidden>Message sent</p>
        <p class="contact-modal__server-error" hidden>Failed to send. Check your connection and try again.</p>
      </div>`;
    main.appendChild(el);
  }
}

/* KL clock */
function startClock(tz) {
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: tz || 'Asia/Kuala_Lumpur',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
  function tick() {
    const t = fmt.format(new Date());
    document.querySelectorAll('.js-clock').forEach(el => el.textContent = t);
  }
  tick();
  setInterval(tick, 1000);
}

/* helpers */
function qs(sel) { return document.querySelector(sel); }
function esc(str) { if (!str) return ''; const d = document.createElement('div'); d.textContent = str; return d.innerHTML; }
