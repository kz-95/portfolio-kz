/* contact-modal.js - Formspree contact form modal */
document.addEventListener('dom:ready', function () {
  const modal = document.querySelector('.contact-modal');
  if (!modal) return;

  const backdrop  = modal.querySelector('.contact-modal__backdrop');
  const panel     = modal.querySelector('.contact-modal__panel');
  const closeBtn  = modal.querySelector('.contact-modal__close');
  const form      = modal.querySelector('.contact-modal__form');
  const emailInp  = modal.querySelector('#cm-email');
  const subjectInp = modal.querySelector('#cm-subject');
  const bodyTxt   = modal.querySelector('#cm-body');
  const errEl     = modal.querySelector('.contact-modal__error');
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

    /* Reset + pre-fill from data.json templates as hints */
    resetForm();
    const d = window.__data;
    const fs = d?.contact?.formspree;
    const subj = document.getElementById('cm-subject');
    const body = document.getElementById('cm-body');
    if (subj) subj.value = fs?.hintSubject || fs?.subjectTemplate || '';
    if (body) body.value = fs?.hintBody || fs?.bodyTemplate || '';
    const em = document.getElementById('cm-email');
    em?.focus();
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;

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
    if (errEl) errEl.textContent = '';
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

  function autoFill(email) {
    const d = window.__data;
    if (!d || !d.contact || !d.contact.formspree) return;
    const fs = d.contact.formspree;
    const subj = subjectInp || document.getElementById('cm-subject');
    const body = bodyTxt || document.getElementById('cm-body');
    if (subj) subj.value = (fs.subjectTemplate || '').replace('{email}', email);
    if (body) body.value = (fs.bodyTemplate || '').replace('{email}', email);
  }

  function setLoading(isLoading) {
    if (!submitBtn) return;
    submitBtn.disabled = isLoading;
    if (submitText) submitText.hidden = isLoading;
    if (spinner) spinner.hidden = !isLoading;
    const em = emailInp || document.getElementById('cm-email');
    if (em) em.disabled = isLoading;
    subjectInp && (subjectInp.disabled = isLoading);
    bodyTxt && (bodyTxt.disabled = isLoading);
  }

  /* auto-fill on blur AND input for real-time feedback */
  function handleEmailChange() {
    const inp = document.getElementById('cm-email');
    if (!inp) return;
    const email = inp.value.trim();
    const field = inp.closest('.contact-modal__field');
    if (errEl) errEl.textContent = '';
    if (!email) return;
    if (!validateEmail(email)) {
      if (errEl) errEl.textContent = 'Please enter a valid email address';
      if (field) { field.classList.add('is-invalid'); setTimeout(() => field.classList.remove('is-invalid'), 500); }
      const d = window.__data;
      const fs = d?.contact?.formspree;
      const subj = document.getElementById('cm-subject');
      const body = document.getElementById('cm-body');
      if (subj) subj.value = fs?.hintSubject || fs?.subjectTemplate || '';
      if (body) body.value = fs?.hintBody || fs?.bodyTemplate || '';
    } else {
      autoFill(email);
    }
  }

  const em = emailInp || document.getElementById('cm-email');
  if (em) {
    em.addEventListener('blur', handleEmailChange);
    em.addEventListener('input', handleEmailChange);
  }

  /* submit */
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const em = document.getElementById('cm-email');
    const field = em?.closest('.contact-modal__field');
    const email = em?.value.trim();
    if (!email || !validateEmail(email)) {
      if (errEl) errEl.textContent = 'Please enter a valid email address';
      if (field) { field.classList.add('is-invalid'); setTimeout(() => field.classList.remove('is-invalid'), 500); }
      em?.focus();
      return;
    }
    if (errEl) errEl.textContent = '';

    const d = window.__data;
    const endpoint = d?.contact?.formspree?.endpoint;
    if (!endpoint || endpoint.includes('TODO_REPLACE')) {
      if (serverErr) { serverErr.textContent = 'Contact form not configured. Please set your Formspree endpoint in data.json.'; serverErr.hidden = false; }
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData(form);
      const resp = await fetch(endpoint, { method: 'POST', body: fd });
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
