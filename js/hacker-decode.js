/* hacker-decode.js — scramble "Apa khabar!" greeting, cycle through languages */
const HACKER = {
  glyphs: '!<>-_\\/[]{}=+*^?#01x▮░▒',
  startSpread: 63,
  durationBase: 36,
  durationSpread: 72,
  rerollChance: 0.3,
  cycleMs: 4200,
  triggerDelay: 400,
};

const GREETINGS = [
  'Apa khabar!',
  'Hello there!',
  '你好!',
  'こんにちは!',
  'Hola!',
  'Bonjour!',
  'Hallo!',
  '안녕하세요!',
];

function hEsc(str) {
  if (!str) return '';
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function scramble(el, target, doneCb) {
  cancelAnimationFrame(el._decodeRaf);
  const from = el._plainText || '';
  const len = Math.max(from.length, target.length);
  const g = HACKER.glyphs;

  const q = Array.from({ length: len }, (_, i) => ({
    from: from[i] ?? '',
    to: target[i] ?? '',
    start: Math.floor(Math.random() * HACKER.startSpread),
    end: Math.floor(Math.random() * HACKER.durationBase) + HACKER.durationSpread,
    c: '',
    frame: 0,
  }));

  let frame = 0;
  const tick = () => {
    let done = 0;
    let html = '';
    for (const it of q) {
      if (it.frame >= it.end) {
        done++;
        html += hEsc(it.to);
      } else if (it.frame >= it.start) {
        if (!it.c || Math.random() < HACKER.rerollChance)
          it.c = g[Math.floor(Math.random() * g.length)];
        html += '<span class="tg">' + hEsc(it.c) + '</span>';
      } else {
        html += '<span class="to">' + hEsc(it.from) + '</span>';
      }
      it.frame++;
    }
    el.innerHTML = html;
    if (done === q.length) {
      el._plainText = target;
      el.classList.add('is-decoded');
      if (doneCb) doneCb();
      return;
    }
    frame++;
    el._decodeRaf = requestAnimationFrame(tick);
  };
  tick();
}

function initHackerDecode() {
  const title = document.querySelector('.about__title');
  if (!title) return;

  /* only the first line-inner — "Apa khabar! I'm ZEN —" */
  const lines = title.querySelectorAll('.line-inner');
  const greetLine = lines[0];
  if (!greetLine) return;

  const original = greetLine.textContent.trim();
  greetLine._plainText = original;

  let greetIdx = 0;
  let cycleTimer = null;
  let started = false;

  function scrambleGreeting(target) {
    cancelAnimationFrame(greetLine._decodeRaf);
    if (cycleTimer) clearTimeout(cycleTimer);
    scramble(greetLine, target, () => {
      greetLine._plainText = target;
    });
    cycleTimer = setTimeout(() => {
      greetIdx = (greetIdx + 1) % GREETINGS.length;
      scrambleGreeting(GREETINGS[greetIdx]);
    }, HACKER.cycleMs);
  }

  function stopHacker() {
    if (cycleTimer) clearTimeout(cycleTimer);
    cancelAnimationFrame(greetLine._decodeRaf);
    greetLine.innerHTML = hEsc(original);
    greetLine._plainText = original;
    started = false;
  }

  /* start immediately */
  function startHacker() {
    if (started) return;
    started = true;
    greetIdx = (greetIdx + 1) % GREETINGS.length;
    scrambleGreeting(GREETINGS[greetIdx]);
  }
  startHacker();

  /* hide when out of viewport, show when in viewport */
  const section = document.getElementById('about');
  if (section) {
    const visObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          startHacker();
        } else {
          stopHacker();
        }
      });
    }, { threshold: 0.05 });
    visObserver.observe(section);
  }
}

document.addEventListener('dom:ready', initHackerDecode);
