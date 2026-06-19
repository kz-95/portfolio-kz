/* main.js - GSAP, Lenis, cursor, preloader, arch shader (adapted for dom:ready) */

document.addEventListener('dom:ready', initAll);

function initAll() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(pointer: coarse)').matches;
  const hasGSAP = typeof gsap !== 'undefined';
  let menuOpen = false;

  if (hasGSAP && typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger);

  /* Lenis smooth scroll */
  let lenis = null;
  if (!prefersReduced && typeof Lenis !== 'undefined' && hasGSAP) {
    lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      syncTouch: true
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    window.__lenis = lenis;
  }

  function scrollToTarget(target) {
    if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.4 });
    else if (typeof target === 'string') document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
    else window.scrollTo({ top: target, behavior: 'smooth' });
  }

  /* split hero name into chars */
  document.querySelectorAll('.split-chars').forEach((el) => {
    const text = el.textContent;
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = [...text].map((c) =>
      `<span class="char">${c === ' ' ? '&nbsp;' : c}</span>`
    ).join('');
  });

  /* preloader + hero intro */
  const preloader = document.querySelector('.preloader');

  function heroIntro() {
    if (!hasGSAP) return;
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.fromTo('.hero__name .char',
        { yPercent: 115, rotate: 8 },
        { yPercent: 0, rotate: 0, duration: 1.2, stagger: 0.035 })
      .fromTo('.hero-arch',
        { clipPath: 'inset(100% 0 0 0)' },
        { clipPath: 'inset(0% 0 0 0)', duration: 1.4, ease: 'power3.inOut' }, 0.15)
      .fromTo('.hero__eyebrow, .hero__tag, .hero__actions',
        { y: 28, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.9, stagger: 0.12 }, 0.55)
      .fromTo('.hero__foot',
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.9 }, 1.0)
      .fromTo('.nav',
        { y: -24, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.8 }, 0.8);
  }

  if (preloader && hasGSAP && !prefersReduced) {
    gsap.set('.nav, .hero__eyebrow, .hero__tag, .hero__actions, .hero__foot', { autoAlpha: 0 });
    gsap.set('.hero__name .char', { yPercent: 115 });

    const num = preloader.querySelector('.preloader__num');
    const count = { v: 0 };
    const tl = gsap.timeline();
    tl.to(count, {
        v: 100, duration: 1.25, ease: 'power2.inOut',
        onUpdate: () => (num.textContent = Math.round(count.v)),
      })
      .to('.preloader__inner', { yPercent: -40, autoAlpha: 0, duration: 0.45, ease: 'power2.in' })
      .to('.preloader__curtain', { scaleY: 1, duration: 0.5, ease: 'power3.inOut' }, '-=0.25')
      .to(preloader, { yPercent: -100, duration: 0.7, ease: 'power3.inOut' })
      .set(preloader, { display: 'none' })
      .add(heroIntro, '-=0.55');
  } else {
    if (preloader) preloader.style.display = 'none';
    if (hasGSAP && !prefersReduced) heroIntro();
  }

  /* scroll reveals */
  if (hasGSAP && typeof ScrollTrigger !== 'undefined' && !prefersReduced) {
    document.querySelectorAll('.reveal-up').forEach((el) => {
      gsap.fromTo(el,
        { y: 44, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%' } });
    });

    document.querySelectorAll('.reveal-fade').forEach((el) => {
      gsap.fromTo(el,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 1.2, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 90%' } });
    });

    /* masked line titles */
    document.querySelectorAll('.line-mask').forEach((mask) => {
      const inner = mask.querySelector('.line-inner');
      if (!inner) return;
      gsap.fromTo(inner,
        { yPercent: 110 },
        { yPercent: 0, duration: 1.1, ease: 'power4.out',
          scrollTrigger: { trigger: mask, start: 'top 88%' } });
    });

    /* parallax mockups */
    document.querySelectorAll('[data-parallax]').forEach((el) => {
      const amount = parseFloat(el.dataset.parallax) || 0;
      gsap.fromTo(el, { y: -amount }, {
        y: amount, ease: 'none',
        scrollTrigger: {
          trigger: el.closest('section') || el,
          start: 'top bottom', end: 'bottom top', scrub: 1.2
        },
      });
    });

    /* hero arch drifts slower */
    gsap.to('.hero-arch', {
      yPercent: 18, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* stat counters */
    document.querySelectorAll('[data-count]').forEach((el) => {
      const target = parseInt(el.dataset.count, 10);
      if (isNaN(target)) return;
      const obj = { v: 0 };
      ScrollTrigger.create({
        trigger: el, start: 'top 90%', once: true,
        onEnter: () =>
          gsap.to(obj, {
            v: target, duration: 1.6, ease: 'power2.out',
            onUpdate: () => (el.textContent = Math.round(obj.v)),
          }),
      });
    });

    /* footer outline name slides in */
    gsap.fromTo('.footer__big', { xPercent: 6 }, {
      xPercent: -6, ease: 'none',
      scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'bottom bottom', scrub: 1 },
    });
  }

  /* nav: invert over dark sections, hide on scroll down */
  const navEl = document.querySelector('.nav');
  const darkSections = document.querySelectorAll('.case, .contact');
  if (navEl && hasGSAP && typeof ScrollTrigger !== 'undefined' && !prefersReduced) {
    let navHidden = false;
    ScrollTrigger.create({
      onUpdate(self) {
        if (menuOpen) return;
        const shouldHide = self.direction === 1 && window.scrollY > 240;
        if (shouldHide !== navHidden) {
          navHidden = shouldHide;
          gsap.to(navEl, { yPercent: shouldHide ? -130 : 0, duration: 0.5, ease: 'power3.out', overwrite: 'auto' });
        }
      },
    });
  }
  if (navEl) {
    if (hasGSAP && typeof ScrollTrigger !== 'undefined' && !prefersReduced) {
      darkSections.forEach((sec) => {
        ScrollTrigger.create({
          trigger: sec, start: 'top 56px', end: 'bottom 56px',
          onToggle: (self) => navEl.classList.toggle('nav--inverse', self.isActive),
        });
      });
    } else {
      const checkNav = () => {
        const overDark = [...darkSections].some((sec) => {
          const r = sec.getBoundingClientRect();
          return r.top <= 56 && r.bottom >= 56;
        });
        navEl.classList.toggle('nav--inverse', overDark);
      };
      window.addEventListener('scroll', checkNav, { passive: true });
      checkNav();
    }
  }

  /* anchor scrolling */
  document.querySelectorAll('[data-scroll]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      e.preventDefault();
      closeMenu();
      scrollToTarget(href);
    });
  });
  document.querySelector('[data-scroll-top]')?.addEventListener('click', () => scrollToTarget(0));

  /* mobile menu */
  const burger = document.querySelector('.nav__burger');
  const menu = document.querySelector('.menu');

  function openMenu() {
    menuOpen = true;
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Close menu');
    menu.style.visibility = 'visible';
    menu.setAttribute('aria-hidden', 'false');
    lenis?.stop();
    if (hasGSAP) {
      /* FIX #6: reset menu links before animating to prevent stale states */
      gsap.set('.menu__links a', { clearProps: 'all' });
      gsap.timeline()
        .to(menu, { clipPath: 'inset(0 0 0% 0)', duration: 0.6, ease: 'power3.inOut' })
        .fromTo('.menu__links a', { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.07, duration: 0.6, ease: 'power3.out' }, '-=0.2')
        .fromTo('.menu__foot', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, '-=0.3');
    } else {
      menu.style.clipPath = 'inset(0 0 0% 0)';
    }
  }

  function closeMenu() {
    if (!menuOpen) return;
    menuOpen = false;
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');
    menu.setAttribute('aria-hidden', 'true');
    lenis?.start();
    if (hasGSAP) {
      gsap.to(menu, {
        clipPath: 'inset(0 0 100% 0)', duration: 0.5, ease: 'power3.inOut',
        onComplete: () => {
          menu.style.visibility = 'hidden';
          /* FIX #6: reset after close */
          gsap.set('.menu__links a', { clearProps: 'all' });
        },
      });
    } else {
      menu.style.clipPath = 'inset(0 0 100% 0)';
      menu.style.visibility = 'hidden';
    }
  }

  burger?.addEventListener('click', () => (menuOpen ? closeMenu() : openMenu()));

  /* custom cursor - FIX #1, #2 */
  if (!isTouch && hasGSAP && !prefersReduced) {
    const cursor = document.querySelector('.cursor');
    const dot = cursor?.querySelector('.cursor__dot');
    const ring = cursor?.querySelector('.cursor__ring');
    const label = cursor?.querySelector('.cursor__label');

    if (cursor && dot && ring) {
      gsap.set([dot, ring], { x: -100, y: -100 });

      const dotX = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power2.out' });
      const dotY = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power2.out' });
      const ringX = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3.out' });
      const ringY = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3.out' });

      window.addEventListener('pointermove', (e) => {
        dotX(e.clientX); dotY(e.clientY);
        ringX(e.clientX); ringY(e.clientY);
      });

      /* FIX #1: cursor label explicitly set on enter/leave, not relying on data attribute alone */
      document.querySelectorAll('[data-cursor]').forEach((el) => {
        el.addEventListener('pointerenter', () => {
          const kind = el.dataset.cursor;
          cursor.classList.add(kind === 'view' ? 'is-view' : 'is-hover');
          if (label) label.textContent = kind === 'view' ? 'VIEW' : '';
        });
        el.addEventListener('pointerleave', () => {
          cursor.classList.remove('is-view', 'is-hover');
          if (label) label.textContent = '';
        });
      });

      /* FIX #2: include .work-card elements in hover set */
      document.querySelectorAll('a, button, .work-card').forEach((el) => {
        el.addEventListener('pointerenter', () => cursor.classList.add('is-hover'));
        el.addEventListener('pointerleave', () => cursor.classList.remove('is-hover'));
      });
    }
  }

  /* magnetic buttons - FIX #7: verify touch guard */
  if (!isTouch && hasGSAP && !prefersReduced) {
    document.querySelectorAll('[data-magnetic], [data-magnetic-strong]').forEach((el) => {
      /* FIX #7: early return if touch (extra safety) */
      if (window.matchMedia('(pointer: coarse)').matches) return;

      const strength = el.hasAttribute('data-magnetic-strong') ? 0.35 : 0.25;
      const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * strength);
        yTo((e.clientY - r.top - r.height / 2) * strength);
      });
      el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
    });
  }

  /* KL clock */
  const clockFmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kuala_Lumpur', hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
  function tickClock() {
    const t = clockFmt.format(new Date());
    document.querySelectorAll('.js-clock').forEach((el) => (el.textContent = t));
  }
  tickClock();
  setInterval(tickClock, 1000);

  /* three.js arch shader */
  initArch(prefersReduced, isTouch);
  /* about portrait iridescent shader */
  initAboutShader(prefersReduced);
}

async function initAboutShader(prefersReduced) {
  if (prefersReduced) return;
  const canvas = document.querySelector('.about__shader');
  if (!canvas) return;

  let THREE;
  try {
    THREE = await import('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js');
  } catch {
    return;
  }

  const holder = canvas.parentElement;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const uniforms = {
    uTime: { value: 0 },
    uAspect: { value: 1 },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      precision highp float;
      varying vec2 vUv;
      uniform float uTime;
      uniform float uAspect;

      void main() {
        vec2 u = vec2((vUv.x * 2.0 - 1.0) * uAspect, vUv.y * 2.0 - 1.0);
        float a = 0.0, d = 0.0;
        
        for (float i = 0.0; i < 8.0; i++) {
          d += sin(i * u.y + a);
          a += cos(i - d + 0.5 * uTime - a * u.x);
        }
            
        vec3 col;
        col.xy = 0.4 + 0.6 * cos(u * vec2(d, a));
        col.z  = 0.5 + 0.5 * cos(a + d);
             
        vec4 o;
        o.xyz = col;
        o = cos(0.5 + 0.5 * cos(vec4(d, a, 2.5, 0.0)) * o);

        /* tint to website palette: accent blue (#2b3ff2) to paper white (#f1f1ec) */
        vec3 accent = vec3(0.169, 0.247, 0.949);
        vec3 paper  = vec3(0.945, 0.945, 0.925);
        float lum   = dot(o.rgb, vec3(0.299, 0.587, 0.114));
        vec3 tinted = mix(accent * 0.6, paper, lum);
        tinted = mix(tinted, paper, smoothstep(0.5, 0.85, lum) * 0.6);

        gl_FragColor = vec4(tinted, 0.92);
      }`,
  });

  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));

  function resize() {
    const w = holder.clientWidth, h = holder.clientHeight;
    if (w === 0 || h === 0) return;
    renderer.setSize(w, h, false);
    uniforms.uAspect.value = w / h;
  }
  resize();
  window.addEventListener('resize', resize);

  const clock = new THREE.Clock();
  let inView = true;
  new IntersectionObserver(([entry]) => (inView = entry.isIntersecting), { threshold: 0 }).observe(holder);

  renderer.setAnimationLoop(() => {
    if (!inView) return;
    uniforms.uTime.value = clock.getElapsedTime();
    renderer.render(scene, camera);
  });
}

async function initArch(prefersReduced, isTouch) {
  if (prefersReduced) return;
  const canvas = document.querySelector('.hero-arch__canvas');
  if (!canvas) return;

  let THREE;
  try {
    THREE = await import('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js');
  } catch {
    return;
  }

  const holder = canvas.parentElement;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isTouch ? 1.25 : 1.75));

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const uniforms = {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uAspect: { value: 1 },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      precision highp float;
      varying vec2 vUv;
      uniform float uTime;
      uniform vec2 uMouse;
      uniform float uAspect;

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
      float noise(vec2 p) {
        vec2 i = floor(p), f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(hash(i), hash(i + vec2(1, 0)), f.x),
          mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
      }
      float fbm(vec2 p) {
        float v = 0.0, a = 0.5;
        mat2 r = mat2(0.8, 0.6, -0.6, 0.8);
        for (int i = 0; i < 5; i++) {
          v += a * noise(p);
          p = r * p * 2.0 + vec2(1.7, 4.6);
          a *= 0.5;
        }
        return v;
      }

      void main() {
        vec2 uv = vUv;
        vec2 p = vec2(uv.x * uAspect, uv.y);
        float t = uTime * 0.07;
        vec2 m = (uMouse - 0.5) * 0.45;

        float q = fbm(p * 1.7 + t + m);
        float r = fbm(p * 1.7 + q * 1.5 - t * 0.7);
        float v = fbm(p * 2.3 + r * 1.9 + m * 0.6);

        vec3 mist   = vec3(0.875, 0.895, 0.940);
        vec3 powder = vec3(0.600, 0.675, 0.910);
        vec3 cobalt = vec3(0.170, 0.250, 0.950);
        vec3 royal  = vec3(0.080, 0.110, 0.520);
        vec3 ink    = vec3(0.040, 0.050, 0.110);

        vec3 col = mix(mist, powder, smoothstep(0.08, 0.5, q));
        col = mix(col, cobalt, smoothstep(0.28, 0.72, r));
        col = mix(col, royal, smoothstep(0.48, 0.95, v) * 0.85);
        col = mix(col, ink, smoothstep(0.72, 1.0, v * r) * 0.5);
        col = mix(col, royal * 1.1, smoothstep(0.55, 0.0, uv.y) * 0.35);

        col += vec3(0.03, 0.06, 0.22) * smoothstep(0.55, 1.0, uv.y) * (0.5 + 0.5 * sin(t * 2.0));

        col += (hash(uv * vec2(1840.0, 1200.0) + uTime) - 0.5) * 0.05;

        /* iridescent rainbow blend at bottom — subtle blue-to-white */
        vec2 u = vec2((vUv.x * 2.0 - 1.0) * uAspect, vUv.y * 2.0 - 1.0);
        float a2 = 0.0, d2 = 0.0;
        for (float i = 0.0; i < 8.0; i++) {
          d2 += sin(i * u.y + a2);
          a2 += cos(i - d2 + 0.5 * uTime * 0.5 - a2 * u.x);
        }
        vec3 ic;
        ic.xy = 0.4 + 0.6 * cos(u * vec2(d2, a2));
        ic.z  = 0.5 + 0.5 * cos(a2 + d2);
        vec4 io;
        io.xyz = ic;
        io = cos(0.5 + 0.5 * cos(vec4(d2, a2, 2.5, 0.0)) * io);

        /* tint to accent-blue → paper-white gradient */
        vec3 accent = vec3(0.169, 0.247, 0.949);
        vec3 paper  = vec3(0.945, 0.945, 0.925);
        float lum = dot(io.rgb, vec3(0.299, 0.587, 0.114));
        vec3 iridescent = mix(accent * 0.6, paper, lum * 1.2);
        /* add subtle rainbow shift — cool blue → warm violet → white */
        iridescent = mix(iridescent, paper, smoothstep(0.4, 0.8, lum) * 0.6);

        /* blend: bottom 50% = iridescent rainbow, top = original flow-field */
        float ib = smoothstep(0.0, 0.5, uv.y);
        col = mix(iridescent, col, ib);

        gl_FragColor = vec4(col, 1.0);
      }`,
  });

  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));

  function resize() {
    const w = holder.clientWidth, h = holder.clientHeight;
    renderer.setSize(w, h, false);
    uniforms.uAspect.value = w / h;
  }
  resize();
  window.addEventListener('resize', resize);

  const clock = new THREE.Clock();
  let inView = true;
  new IntersectionObserver(([entry]) => (inView = entry.isIntersecting)).observe(holder);

  const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
  if (!isTouch) {
    window.addEventListener('pointermove', (e) => {
      mouse.tx = e.clientX / window.innerWidth;
      mouse.ty = 1 - e.clientY / window.innerHeight;
    });
  }

  renderer.setAnimationLoop(() => {
    if (!inView) return;
    mouse.x += (mouse.tx - mouse.x) * 0.04;
    mouse.y += (mouse.ty - mouse.y) * 0.04;
    uniforms.uMouse.value.set(mouse.x, mouse.y);
    uniforms.uTime.value = clock.getElapsedTime();
    renderer.render(scene, camera);
  });

  canvas.classList.add('is-on');
}
