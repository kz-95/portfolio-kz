/* contact-modal.js - Formspree contact form modal */
document.addEventListener('dom:ready', function () {
  const modal = document.querySelector('.contact-modal');
  if (!modal) return;

  const backdrop  = modal.querySelector('.contact-modal__backdrop');
  const panel     = modal.querySelector('.contact-modal__panel');
  const closeBtn  = modal.querySelector('.contact-modal__close');
  const form      = modal.querySelector('.contact-modal__form');
  const nameInp   = modal.querySelector('#cm-name');
  const emailInp  = modal.querySelector('#cm-email');
  const subjectInp = modal.querySelector('#cm-subject');
  const bodyTxt   = modal.querySelector('#cm-body');
  const nameErr   = modal.querySelector('.contact-modal__error[data-for="name"]');
  const emailErr  = modal.querySelector('.contact-modal__error[data-for="email"]');
  const waLink    = modal.querySelector('.contact-modal__alt a');
  const WA_NUMBER = '60182862739';
  const WA_SITE   = 'https://kze.dpdns.org/';

  function updateWhatsApp() {
    if (!waLink) return;
    const name = (nameInp?.value || '').trim();
    const msg = name.length >= 2
      ? `Hello Zen, I'm ${name}. I came across your portfolio website ${WA_SITE} and would like to hire you.`
      : `Hi Zen! I came across your portfolio website ${WA_SITE} and I'm interested in hiring you.`;
    waLink.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
  }
  const submitBtn = modal.querySelector('.contact-modal__submit');
  const submitText = submitBtn?.querySelector('.contact-modal__submit-text');
  const spinner   = submitBtn?.querySelector('.contact-modal__spinner');
  const successEl = modal.querySelector('.contact-modal__success');
  const serverErr = modal.querySelector('.contact-modal__server-error');

  let isOpen   = false;
  let originalScrollY = 0;
  let lenisRef = null;

  /* get lenis ref if available */
  function getLenis() {
    if (lenisRef) return lenisRef;
    if (window.__lenis) lenisRef = window.__lenis;
    return lenisRef;
  }

  function open() {
    if (isOpen) return;
    isOpen = true;

    const lenis = getLenis();
    if (lenis) { originalScrollY = window.scrollY; lenis.stop(); }

    modal.removeAttribute('aria-hidden');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';

    /* GSAP animation */
    if (typeof gsap !== 'undefined') {
      gsap.killTweensOf([backdrop, panel]);
      gsap.set(backdrop, { opacity: 0 });
      gsap.set(panel, { scale: 0.85, opacity: 0 });
      gsap.to(backdrop, { opacity: 1, duration: 0.3, ease: 'power2.out' });
      gsap.to(panel, { scale: 1, opacity: 1, duration: 0.35, ease: 'power3.out', delay: 0.05 });
    }

    /* Reset */
    resetForm();
    nameInp?.focus();

    /* sync URL */
    window.__route && window.__route.push('/contact');
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    window.__route && window.__route.home();

    document.body.style.overflow = '';

    function finish() {
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
      const lenis = getLenis();
      if (lenis) { lenis.start(); lenis.scrollTo(originalScrollY, { immediate: true }); }
    }

    if (typeof gsap !== 'undefined') {
      gsap.killTweensOf([backdrop, panel]);
      gsap.to([backdrop, panel], {
        opacity: 0, duration: 0.25, ease: 'power2.in',
        onComplete: finish
      });
    } else {
      finish();
    }
  }

  function resetForm() {
    form?.reset();
    if (nameErr) nameErr.textContent = '';
    if (emailErr) emailErr.textContent = '';
    updateWhatsApp();
    if (subjectInp) subjectInp.value = '';
    if (bodyTxt) bodyTxt.value = '';
    if (successEl) successEl.hidden = true;
    if (serverErr) serverErr.hidden = true;
    if (submitText) submitText.hidden = false;
    if (spinner) spinner.hidden = true;
    submitBtn && (submitBtn.disabled = false);
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function fillTemplate(tpl) {
    const name = (nameInp?.value || '').trim() || 'someone';
    const email = (emailInp?.value || '').trim();
    return (tpl || '').split('{name}').join(name).split('{email}').join(email);
  }

  function autoFill() {
    const d = window.__data;
    if (!d || !d.contact || !d.contact.formspree) return;
    const fs = d.contact.formspree;
    if (subjectInp) subjectInp.value = fillTemplate(fs.subjectTemplate);
    if (bodyTxt) bodyTxt.value = fillTemplate(fs.bodyTemplate);
  }

  function setLoading(isLoading) {
    if (!submitBtn) return;
    submitBtn.disabled = isLoading;
    if (submitText) submitText.hidden = isLoading;
    if (spinner) spinner.hidden = !isLoading;
    if (nameInp) nameInp.disabled = isLoading;
    if (emailInp) emailInp.disabled = isLoading;
  }

  /* live validation + template fill */
  function handleChange() {
    const email = (emailInp?.value || '').trim();
    if (emailErr) emailErr.textContent = '';
    if (nameErr) nameErr.textContent = '';
    if (email && !validateEmail(email)) {
      const field = emailInp.closest('.contact-modal__field');
      if (emailErr) emailErr.textContent = 'Please enter a valid email address';
      if (field) { field.classList.add('is-invalid'); setTimeout(() => field.classList.remove('is-invalid'), 500); }
    }
    autoFill();
    updateWhatsApp();
  }

  [nameInp, emailInp].forEach((inp) => {
    if (!inp) return;
    inp.addEventListener('blur', handleChange);
    inp.addEventListener('input', handleChange);
  });

  /* submit */
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = (nameInp?.value || '').trim();
    const email = (emailInp?.value || '').trim();
    const invalidate = (inp, errSpan, msg) => {
      const field = inp?.closest('.contact-modal__field');
      if (errSpan) errSpan.textContent = msg;
      if (field) { field.classList.add('is-invalid'); setTimeout(() => field.classList.remove('is-invalid'), 500); }
      inp?.focus();
    };
    if (!name) { invalidate(nameInp, nameErr, 'Please enter your name'); return; }
    if (!email || !validateEmail(email)) { invalidate(emailInp, emailErr, 'Please enter a valid email address'); return; }
    if (nameErr) nameErr.textContent = '';
    if (emailErr) emailErr.textContent = '';
    autoFill();

    const d = window.__data;
    const endpoint = d?.contact?.formspree?.endpoint;
    if (!endpoint || endpoint.includes('TODO_REPLACE')) {
      if (serverErr) { serverErr.textContent = 'Contact form not configured. Please set your Formspree endpoint in data.json.'; serverErr.hidden = false; }
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData(form);
      const resp = await fetch(endpoint, {
        method: 'POST',
        body: fd,
        headers: { 'Accept': 'application/json' }
      });
      if (resp.ok) {
        if (successEl) successEl.hidden = false;
        form.style.display = 'none';
        /* auto-close after 3s */
        setTimeout(close, 3000);
      } else {
        if (serverErr) serverErr.hidden = false;
      }
    } catch {
      if (serverErr) serverErr.hidden = false;
    } finally {
      setLoading(false);
    }
  });

  /* close triggers */
  closeBtn?.addEventListener('click', close);
  backdrop?.addEventListener('click', close);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

  /* open triggers - any element with data-contact-cta */
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-contact-cta]');
    if (trigger) {
      e.preventDefault();
      open();
    }
  });

  /* expose for programmatic use */
  window.__contactModal = { open, close };
});
