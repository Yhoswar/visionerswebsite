// Minimal interactions placeholder
console.log('Visioners site loaded');

// Pricing cards: reveal fade+rise with 80ms stagger, pointer parallax 2–4px
(() => {
  const cards = Array.from(document.querySelectorAll('.pricing .price-card'));
  if (!cards.length) return;

  // Reveal on intersection with stagger
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const idx = cards.indexOf(entry.target);
      entry.target.style.setProperty('--stagger', `${80 * (idx >= 0 ? idx : 0)}ms`);
      entry.target.classList.add('is-revealed');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.16 });
  cards.forEach((c) => io.observe(c));

  // Pointer parallax for gradient layer
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(pointer:fine)').matches;
  if (reduced || !fine) return;

  cards.forEach((c) => {
    c.addEventListener('mousemove', (ev) => {
      const r = c.getBoundingClientRect();
      const dx = (ev.clientX - (r.left + r.width / 2)) / r.width;
      const dy = (ev.clientY - (r.top + r.height / 2)) / r.height;
      const amp = 4; // 2–4px range
      c.style.setProperty('--px', `${(dx * amp).toFixed(2)}px`);
      c.style.setProperty('--py', `${(dy * amp).toFixed(2)}px`);
    });
    c.addEventListener('mouseleave', () => {
      c.style.setProperty('--px', '0px');
      c.style.setProperty('--py', '0px');
    });
  });
})();

// Smooth scroll fade-in animations (decelerating, non-uniform)
let lastY = window.scrollY;
let lastTime = performance.now();
let speedSmoothed = 0; // px/ms, smoothed

const fadeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Optimized duration mapping for smoother animations
        const norm = Math.min(1, speedSmoothed / 0.8); // normalize roughly
        const durMs = 700 + Math.round((1 - norm) * 400); // 700–1100ms
        entry.target.style.setProperty('--fade-dur', `${durMs}ms`);
        entry.target.style.setProperty('--fade-child-dur', `${Math.round(durMs * 0.8)}ms`);
        entry.target.style.setProperty('--fade-ease', 'cubic-bezier(.16,.8,.3,1)');

        entry.target.classList.add('is-visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.08,
    rootMargin: '0px 0px -30px 0px'
  }
);

// Observe all sections for fade-in animation
const fadeInSections = document.querySelectorAll('.fade-in-section');
fadeInSections.forEach((section) => fadeObserver.observe(section));

// IntersectionObserver-based scroll reveal with variants
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

// Observe all elements marked with .reveal
const revealEls = Array.from(document.querySelectorAll('.reveal')).filter((el) => !el.classList.contains('tstep'));
revealEls.forEach((el) => observer.observe(el));

// Free Strategy section: elegant scroll-trigger reveal + parallax
(() => {
  const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (mql.matches) return;

  const els = Array.from(document.querySelectorAll(
    '#freeconsult .free-thumb, #freeconsult .free-badge.meet, #freeconsult .free-dots, #freeconsult .free-name, #freeconsult .free-bar'
  ));
  if (!els.length) return;

  // Assign motion class and directional variations
  els.forEach((el, i) => {
    el.classList.add('free-motion');
    // Directional variety
    let px = 0, py = 14; // entrance offset
    const dir = i % 4;
    switch (dir) {
      case 0: px = -12; py = 14; break; // slight left + down
      case 1: px = 12; py = 12; break;  // slight right + down
      case 2: px = 0; py = -14; break;  // up
      case 3: px = 0; py = 16; break;   // down
    }
    el.style.setProperty('--px', px + 'px');
    el.style.setProperty('--py', py + 'px');
    // Parallax drift values (alternate directions)
    const driftY = (i % 2 === 0) ? 16 : -16; // 10–20px range
    const driftX = (i % 2 === 0) ? 6 : -6;
    el.dataset.driftY = String(driftY);
    el.dataset.driftX = String(driftX);
  });

  // Reveal when ~18% visible
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const el = entry.target;
      if (entry.isIntersecting && entry.intersectionRatio >= 0.18) {
        el.classList.add('in-view');
      }
    });
  }, { threshold: [0.18, 0.4, 0.8] });

  els.forEach((el) => io.observe(el));

  // Parallax tracking
  let ticking = false;
  function updateParallax() {
    const vh = window.innerHeight;
    els.forEach((el) => {
      if (!el.classList.contains('in-view')) return;
      const r = el.getBoundingClientRect();
      const center = r.top + r.height / 2;
      // progress around viewport center: -1..1
      const prog = Math.max(-1, Math.min(1, (vh / 2 - center) / (vh / 2)));
      const driftY = Number(el.dataset.driftY || 14);
      const driftX = Number(el.dataset.driftX || 6);
      const py = prog * driftY;
      const px = prog * driftX;
      el.style.setProperty('--py', py.toFixed(2) + 'px');
      el.style.setProperty('--px', px.toFixed(2) + 'px');
    });
  }
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateParallax();
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  // Initial update
  onScroll();
})();

// Dept section: titles fade-up, card stagger + subtle parallax
(() => {
  const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (mql.matches) return;

  const section = document.querySelector('#dept');
  if (!section) return;

  const title = section.querySelector('.section-head:first-of-type h2');
  const sub = section.querySelector('.section-head:first-of-type p');
  const cards = Array.from(section.querySelectorAll('.dept-grid .price-card'));

  if (title) title.classList.add('dept-title');
  if (sub) sub.classList.add('dept-sub');
  cards.forEach((c, i) => {
    c.classList.add('dept-card');
    c.style.setProperty('--stagger', `${200 * i}ms`);
    c.dataset.row = i < 3 ? 'top' : 'bottom';
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting || entry.intersectionRatio < 0.2) return;
      // Titles
      if (title) {
        title.style.setProperty('--dept-delay', '160ms');
        title.classList.add('in-view');
      }
      if (sub) {
        setTimeout(() => sub.classList.add('in-view'), 220);
      }
      // Cards stagger (slower)
      cards.forEach((c, i) => {
        setTimeout(() => {
          c.classList.add('in-view');
          c.style.setProperty('transition-delay', `${360 + 240 * i}ms`);
        }, 360 + 240 * i);
      });
      io.unobserve(section);
    });
  }, { threshold: [0.2, 0.6] });

  io.observe(section);

  // Subtle parallax between rows (smoothed)
  let ticking = false;
  function updateParallax() {
    const vh = window.innerHeight;
    const rect = section.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > vh) return;
    const center = rect.top + rect.height / 2;
    const prog = Math.max(-1, Math.min(1, (vh / 2 - center) / (vh / 2)));
    cards.forEach((c) => {
      const amp = 2; // gentler depth
      const dir = c.dataset.row === 'top' ? -1 : 1;
      const target = prog * amp * dir;
      const curr = c._parallax || 0;
      const next = curr + (target - curr) * 0.18; // low-pass smoothing
      c._parallax = next;
      c.style.setProperty('--parallax', `${next.toFixed(2)}px`);
    });
  }
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateParallax();
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
})();


// Subtle parallax on hero content + scroll speed tracking

// Selected Work: cinematic header reveal, card stagger, hover parallax
(() => {
  const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (mql.matches) return;

  const section = document.querySelector('#work');
  if (!section) return;

  const header = section.querySelector('.section-head h2');
  const eyebrow = section.querySelector('.section-head .eyebrow');
  const cards = Array.from(section.querySelectorAll('.card-grid .card'));

  if (header) header.classList.add('work-title');
  if (eyebrow) eyebrow.classList.add('work-eyebrow');
  cards.forEach((c, i) => {
    c.classList.add('work-card');
    c.dataset.index = i;
    c.dataset.row = i < 3 ? 'top' : 'bottom';
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting || entry.intersectionRatio < 0.2) return;
      // Titles
      if (header) header.classList.add('in-view');
      if (eyebrow) {
        setTimeout(() => eyebrow.classList.add('in-view'), 120);
      }
      // Cards stagger
      cards.forEach((c, i) => {
        setTimeout(() => c.classList.add('in-view'), 150 + 150 * i);
      });
      io.unobserve(section);
    });
  }, { threshold: [0.2, 0.6] });
  io.observe(section);

  // Ambient parallax rows: top slower (-5%), bottom faster (+3%)
  let ticking = false;
  function updateParallax() {
    const vh = window.innerHeight;
    const rect = section.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > vh) return;
    const center = rect.top + rect.height / 2;
    const prog = Math.max(-1, Math.min(1, (vh / 2 - center) / (vh / 2)));
    cards.forEach((c) => {
      const h = c.offsetHeight || 300;
      const dir = c.dataset.row === 'top' ? -1 : 1;
      const percent = dir === -1 ? 0.05 : 0.03; // -5% / +3%
      const target = prog * percent * h;
      const curr = c._wParallax || 0;
      const next = curr + (target - curr) * 0.18; // smoothing
      c._wParallax = next;
      c.style.setProperty('--w-parallax', `${next.toFixed(2)}px`);
    });
  }
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateParallax();
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  // Hover: reverse parallax image drift and gradient light shift
  const supportsHover = window.matchMedia('(hover: hover)').matches;
  if (supportsHover) {
    cards.forEach((card) => {
      const mediaImg = card.querySelector('.card-media img');
      function handleMove(e) {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        const dx = (x - 0.5);
        const dy = (y - 0.5);
        const amp = 6; // px drift
        const ix = (-dx * amp).toFixed(2);
        const iy = (-dy * amp).toFixed(2);
        card.style.setProperty('--gx', `${ix}px`);
        card.style.setProperty('--gy', `${iy}px`);
        if (mediaImg) {
          mediaImg.style.transform = `translate(${ix}px, ${iy}px) scale(1.03)`;
        }
      }
      function enter() {
        card.classList.add('hovering');
      }
      function leave() {
        card.classList.remove('hovering');
        card.style.removeProperty('--gx');
        card.style.removeProperty('--gy');
        if (mediaImg) mediaImg.style.transform = '';
      }
      card.addEventListener('mousemove', handleMove);
      card.addEventListener('mouseenter', enter);
      card.addEventListener('mouseleave', leave);
    });
  }
})();
const heroInner = document.querySelector('.hero-inner');
const timelineEl = document.querySelector('#how .timeline');
let ticking = false;
function onScroll() {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      const now = performance.now();
      const y = window.scrollY;
      const dy = Math.abs(y - lastY);
      const dt = Math.max(1, now - lastTime);
      const speed = dy / dt;
      speedSmoothed = speedSmoothed * 0.9 + speed * 0.1; // smoother low-pass filter
      lastY = y;
      lastTime = now;

      // Optimized parallax with better performance
      const offset = Math.min(25, y * 0.04);
      if (heroInner) {
        heroInner.style.transform = `translate3d(0, ${offset}px, 0)`;
      }

      // Timeline progress based on scroll
      if (timelineEl) {
        const rect = timelineEl.getBoundingClientRect();
        const vh = window.innerHeight;
        // Progress anchored to viewport center crossing the timeline
        const center = vh * 0.5;
        const passed = center - rect.top; // how far the center has moved past the timeline top
        const progress = Math.max(0, Math.min(1, passed / rect.height));
        timelineEl.style.setProperty('--timeline-progress', progress.toFixed(3));
        if (progress > 0.02) timelineEl.classList.add('ignite'); else timelineEl.classList.remove('ignite');

        // Reveal steps sequentially as fill reaches them
        const line = timelineEl.querySelector('.timeline-line');
        if (line) {
          const vh = window.innerHeight || 800;
          const thresholdY = vh * (2 / 3); // tercio inferior del viewport
          const steps = Array.from(timelineEl.querySelectorAll('.timeline-steps .tstep'));

          const currentY = window.scrollY || document.documentElement.scrollTop || 0;
          const prevY = parseFloat(timelineEl.dataset.lastY || '0');
          const isDown = currentY > prevY;
          timelineEl.dataset.lastY = String(currentY);

          if (isDown) {
            for (const step of steps) {
              if (step.classList.contains('step-visible')) continue;
              const rect = step.getBoundingClientRect();
              const centerY = rect.top + rect.height * 0.5;
              if (centerY <= thresholdY) {
                step.classList.add('step-visible');
                // spark pulse feedback when a step is revealed
                timelineEl.classList.add('spark-pulse');
                setTimeout(() => timelineEl.classList.remove('spark-pulse'), 420);
                break; // revela solo uno por tick de scroll hacia abajo
              }
            }
          }
        }
      }



      ticking = false;
    });
    ticking = true;
  }
}
window.addEventListener('scroll', onScroll, { passive: true });

// Interactive tilt on cards
const tiltCards = document.querySelectorAll('.card');
tiltCards.forEach((card) => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rx = ((y / rect.height) - 0.5) * -4; // rotateX
    const ry = ((x / rect.width) - 0.5) * 4;  // rotateY
    card.style.transform = `perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

// Smooth light-source hover for cards and timeline steps
(() => {
  const lerp = (a, b, n) => a + (b - a) * n;
  const cards = Array.from(document.querySelectorAll('.card, .how .tstep, .price-card, .agency-banner'));
  if (!cards.length) return;

  const stateMap = new WeakMap();
  cards.forEach((card) => {
    stateMap.set(card, { x: card.clientWidth / 2, y: card.clientHeight / 2 });

    const onEnter = () => {
      card.style.setProperty('--ho', '1');
    };
    const onLeave = () => {
      card.style.setProperty('--ho', '0');
    };
    const onMove = (e) => {
      const rect = card.getBoundingClientRect();
      const targetX = e.clientX - rect.left;
      const targetY = e.clientY - rect.top;
      const s = stateMap.get(card);
      s.x = lerp(s.x, targetX, 0.18);
      s.y = lerp(s.y, targetY, 0.18);
      card.style.setProperty('--hx', `${s.x}px`);
      card.style.setProperty('--hy', `${s.y}px`);
    };

    card.addEventListener('pointerenter', onEnter);
    card.addEventListener('pointerleave', onLeave);
    card.addEventListener('pointermove', onMove);
  });
})();

// Add testimonial gradient parallax (2–4px) respecting reduced motion
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(pointer:fine)').matches;
  if (reduced || !fine) return;
  const cards = Array.from(document.querySelectorAll('#testimonials .tcard'));
  cards.forEach((c) => {
    c.addEventListener('mousemove', (ev) => {
      const r = c.getBoundingClientRect();
      const dx = (ev.clientX - (r.left + r.width / 2)) / r.width;
      const dy = (ev.clientY - (r.top + r.height / 2)) / r.height;
      const amp = 4; // 2–4px range
      c.style.setProperty('--tx', `${(dx * amp).toFixed(2)}px`);
      c.style.setProperty('--ty', `${(dy * amp).toFixed(2)}px`);
    });
    c.addEventListener('mouseleave', () => {
      c.style.setProperty('--tx', '0px');
      c.style.setProperty('--ty', '0px');
    });
  });
})();

// Add work card gradient parallax (2–4px), respecting reduced motion
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(pointer:fine)').matches;
  if (reduced || !fine) return;
  const cards = Array.from(document.querySelectorAll('.work .card'));
  cards.forEach((c) => {
    c.addEventListener('mousemove', (ev) => {
      const r = c.getBoundingClientRect();
      const dx = (ev.clientX - (r.left + r.width / 2)) / r.width;
      const dy = (ev.clientY - (r.top + r.height / 2)) / r.height;
      const amp = 4; // 2–4px range
      c.style.setProperty('--tx', `${(dx * amp).toFixed(2)}px`);
      c.style.setProperty('--ty', `${(dy * amp).toFixed(2)}px`);
    });
    c.addEventListener('mouseleave', () => {
      c.style.setProperty('--tx', '0px');
      c.style.setProperty('--ty', '0px');
    });
  });
})();

// Add light hover for buttons
(() => {
  const lerp = (a, b, n) => a + (b - a) * n;
  const supportsHover = window.matchMedia('(hover: hover)').matches;
  const buttons = Array.from(document.querySelectorAll('button, .btn, .tcard'));
  if (!supportsHover || !buttons.length) return;

  const stateMap = new WeakMap();
  buttons.forEach((btn) => {
    stateMap.set(btn, { x: btn.clientWidth / 2, y: btn.clientHeight / 2 });

    const onEnter = () => {
      btn.style.setProperty('--bo', '1');
    };
    const onLeave = () => {
      btn.style.setProperty('--bo', '0');
    };
    const onMove = (e) => {
      const rect = btn.getBoundingClientRect();
      const targetX = e.clientX - rect.left;
      const targetY = e.clientY - rect.top;
      const s = stateMap.get(btn);
      s.x = lerp(s.x, targetX, 0.22);
      s.y = lerp(s.y, targetY, 0.22);
      btn.style.setProperty('--bx', `${s.x}px`);
      btn.style.setProperty('--by', `${s.y}px`);
    };

    btn.addEventListener('pointerenter', onEnter);
    btn.addEventListener('pointerleave', onLeave);
    btn.addEventListener('pointermove', onMove);
  });
})();

// Mobile hamburger toggle
(() => {
  const btn = document.querySelector('.hamburger');
  const nav = document.getElementById('site-nav');
  if (!btn || !nav) return;
  const body = document.body;
  const toggle = () => {
    const open = body.classList.toggle('menu-open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  };
  btn.addEventListener('click', toggle);
  // Close menu when clicking a nav link (optional usability)
  nav.addEventListener('click', (e) => {
    const target = e.target;
    // Close if clicking a link
    if (target && target.tagName === 'A') {
      body.classList.remove('menu-open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && body.classList.contains('menu-open')) {
      body.classList.remove('menu-open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
})();

// Typewriter reveal for eyebrow text
(() => {
  const els = Array.from(document.querySelectorAll('.hero-eyebrow-text.reveal[data-anim="typewriter"], .reveal[data-anim="typewriter"]'));
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const full = el.textContent;
      el.textContent = '';
      const spd = Number(el.style.getPropertyValue('--type-speed')) || 28; // ms per char
      let i = 0;
      const type = () => {
        el.textContent = full.slice(0, i++);
        if (i <= full.length) {
          setTimeout(type, spd);
        } else {
          el.classList.add('typed');
        }
      };
      type();
      io.unobserve(el);
    });
  }, { threshold: 0.7 });
  els.forEach((el) => io.observe(el));
})();

// Reactive-on-scroll animations
// Extend reactive-on-scroll with parallax-x
(() => {
  const reactiveEls = Array.from(document.querySelectorAll('[data-anim^="scroll-"], [data-scroll]'));
  if (!reactiveEls.length) return;

  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  let ticking = false;
  const update = () => {
    ticking = false;
    const vh = window.innerHeight || 800;
    for (const el of reactiveEls) {
      const rect = el.getBoundingClientRect();
      const start = vh * 0.85;
      const end = -rect.height * 0.2;
      const raw = (start - rect.top) / (start - end);
      const p = easeOutCubic(clamp(raw, 0, 1));

      const variant = (el.dataset.anim && el.dataset.anim.startsWith('scroll-')) ? el.dataset.anim : (el.dataset.scroll ? `scroll-${el.dataset.scroll}` : '');
      if (variant === 'scroll-fade') {
        el.style.opacity = p.toFixed(3);
        const y = (1 - p) * 24;
        el.style.transform = `translateY(${y.toFixed(2)}px)`;
      } else if (variant === 'scroll-zoom') {
        el.style.opacity = p.toFixed(3);
        const scale = 0.92 + 0.08 * p;
        const y = (1 - p) * 20;
        el.style.transform = `scale(${scale.toFixed(3)}) translateY(${y.toFixed(2)}px)`;
      } else if (variant === 'scroll-parallax-x') {
        const x = (1 - p) * 30; // slides in from the right
        el.style.transform = `translateX(${x.toFixed(2)}px)`;
      } else if (variant === 'scroll-parallax-y') {
        const y = (1 - p) * 40; // gentle vertical drift
        el.style.transform = `translateY(${y.toFixed(2)}px)`;
      } else if (variant === 'scroll-zoom-slow') {
        const scale = 0.97 + 0.03 * p; // subtle growth
        el.style.transform = `scale(${scale.toFixed(3)})`;
        el.style.opacity = (0.75 + 0.25 * p).toFixed(3);
      } else if (variant === 'scroll-fade-slow') {
        el.style.opacity = (0.6 + 0.4 * p).toFixed(3);
        const y2 = (1 - p) * 30; // slight upward slide as fades in
        el.style.transform = `translateY(${y2.toFixed(2)}px)`;
      }
    }
  };
  const onScroll2 = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  window.addEventListener('scroll', onScroll2, { passive: true });
  window.addEventListener('resize', onScroll2);
  onScroll2();
})();

// Header logo: static rendering only; no scroll-based swap.

// Agency banner: calm, editorial motion system
(() => {
  const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (mql.matches) return;

  const section = document.querySelector('.agency-banner');
  if (!section) return;

  const left = section.querySelector('.agency-left');
  const title = left?.querySelector('.agency-title');
  const right = section.querySelector('.agency-right');
  const paras = Array.from(right?.querySelectorAll('p') || []);

  // Split headline by <br> into lines with clip-mask
  if (title) {
    const parts = title.innerHTML.split('<br>');
    const lines = parts.map((txt, i) => {
      const isLast = i === parts.length - 1;
      const star = isLast ? '<span class="agency-star" aria-hidden="true">✦</span>' : '';
      const underline = isLast ? '<span class="agency-underline" aria-hidden="true"></span>' : '';
      return `<span class="agency-line${isLast ? ' last' : ''}"><span class="agency-line-inner">${txt.trim()}${star}${underline}</span></span>`;
    }).join('');
    title.innerHTML = lines;
  }

  // Prepare body paragraphs
  paras.forEach((p, i) => { p.classList.add('agency-par'); p.style.setProperty('--par-index', String(i)); });

  // Entrance sequencing
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting || entry.intersectionRatio < 0.2) return;
      // Panel reveal
      section.classList.add('in-view');
      // Headline lines stagger
      const lines = Array.from(section.querySelectorAll('.agency-line'));
      const baseDelay = 150; // ms
      const stagger = 180;   // ms
      lines.forEach((line, i) => {
        setTimeout(() => line.classList.add('reveal'), baseDelay + i * stagger);
      });
      // Body reveal starts 350ms after headline begins
      setTimeout(() => {
        paras.forEach((p, i) => {
          setTimeout(() => p.classList.add('in-view'), i * 120);
        });
      }, 350);

      io.unobserve(section);
    });
  }, { threshold: [0.2, 0.4] });
  io.observe(section);

  // Optional subtle parallax for background sheen
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight || 800;
      const start = vh * 1.2;       // fully below viewport
      const end = -rect.height * 0.2; // a bit above
      const y = Math.max(0, Math.min(1, (start - rect.top) / (start - end)));
      const offset = (y * 24) - 12; // -12px → +12px
      section.style.setProperty('--bg-y', `${offset.toFixed(1)}px`);
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
})();

// Gallery: duplicate items for seamless CSS animation looping
(function () {
  const gallery = document.querySelector('.gallery');
  if (!gallery) return;

  const cols = gallery.querySelectorAll('.gallery-col .col-inner');
  cols.forEach(inner => {
    const items = Array.from(inner.children);
    items.forEach(item => {
      inner.appendChild(item.cloneNode(true));
    });
  });
})();


// Contact form submission via PHPMailer (AJAX)
(() => {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const statusEl = form.querySelector('.form-status');
  const btn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    statusEl.textContent = '';
    statusEl.style.color = 'var(--text)'; // Reset color
    
    // Basic frontend validation
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    if (!data.name || !data.email || !data.message) {
      statusEl.textContent = 'Please fill in all required fields.';
      statusEl.style.color = '#ff4d4f';
      return;
    }

    // UI Loading state
    const originalBtnText = btn.textContent;
    btn.textContent = 'Sending...';
    btn.disabled = true;

    try {
      const response = await fetch('send_mail.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (result.success) {
        statusEl.textContent = 'Message sent successfully!';
        statusEl.style.color = '#34a853';
        form.reset();
        setTimeout(() => {
            statusEl.textContent = '';
        }, 5000);
      } else {
        throw new Error(result.message || 'Unknown error occurred.');
      }
    } catch (error) {
      console.error('Mail Error:', error);
      statusEl.textContent = error.message || 'Failed to send message. Please try again later.';
      statusEl.style.color = '#ff4d4f';
    } finally {
      btn.textContent = originalBtnText;
      btn.disabled = false;
    }
  });
})();

// Contact under-gallery marquee control
(function () {
  const gallery = document.querySelector('#contact-gallery');
  if (!gallery) return;
  const rows = gallery.querySelectorAll('.hline');

  rows.forEach(row => {
    const dir = row.getAttribute('data-dir') || 'left';
    const inners = row.querySelectorAll('.hline-inner');
    // Ensure two inner tracks exist for seamless loop
    if (inners.length < 2 && inners[0]) {
      row.appendChild(inners[0].cloneNode(true));
    }

    // Pause on hover for accessibility
    row.addEventListener('mouseenter', () => {
      inners.forEach(el => el.style.animationPlayState = 'paused');
    });
    row.addEventListener('mouseleave', () => {
      inners.forEach(el => el.style.animationPlayState = 'running');
    });

    // Allow speed tuning via dataset e.g., data-speed="42s"
    const speed = row.dataset.speed || '40s';
    inners.forEach(el => {
      el.style.animationDuration = speed;
      el.style.animationTimingFunction = 'linear';
      el.style.animationIterationCount = 'infinite';
      el.style.animationName = dir === 'right' ? 'hscroll-right' : 'hscroll-left';
    });
  });
})();

// Testimonials slider
(() => {
  const section = document.getElementById('testimonials');
  if (!section) return;

  const card = section.querySelector('.tcard');
  const quoteEl = section.querySelector('.tquote');
  const nameEl = section.querySelector('.tname');
  const roleEl = section.querySelector('.trole');
  const avatarsEl = section.querySelector('.tavatars');
  const prevBtn = section.querySelector('.tarrow.left');
  const nextBtn = section.querySelector('.tarrow.right');

  // Cinematic section entrance
  const eyebrow = section.querySelector('.section-head .eyebrow');
  const headline = section.querySelector('.section-head h2');
  const container = section.querySelector('.twrap');
  if (eyebrow) eyebrow.classList.add('t-eyebrow');
  if (headline) headline.classList.add('t-headline');
  if (container) container.classList.add('t-container');

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting || entry.intersectionRatio < 0.18) return;
      // Eyebrow first
      if (eyebrow) setTimeout(() => eyebrow.classList.add('in-view'), 100);
      // Headline after 0.2s stagger
      if (headline) setTimeout(() => headline.classList.add('in-view'), 300);
      // Container after headline + 0.5s
      if (container) setTimeout(() => {
        container.classList.add('in-view');
        avatarsEl?.classList.add('in-view');
      }, 800);
      io.unobserve(section);
    });
  }, { threshold: [0.18, 0.4] });
  io.observe(section);

  const items = [
    {
      quote: `Visioners Media has provided invaluable support to our creative team here at Ministry Pass. We love the quality of service, ease of collaboration, and timeliness of delivery Josue and his team provide. Can't say enough about this group--they're great!`,
      name: 'Zodwa Ndlovu',
      role: 'MinistryPass, Content Director',
      avatar: 'assets/img/testimonials/Zodwa.webp'
    },
    {
      quote: `Josué and the team at Visioners have been super helpful in helping us convert content to Canva. My team didn’t just want someone who knew Canva, but needed someone with a great eye for design to make the right decisions when it came to making a Photoshop file still look great within the confines of what Canva can do. Great team. Responsive. Excellent.`,
      name: 'Jonathan Malm',
      role: 'Founder, SundaySocial.tv',
      avatar: 'assets/img/testimonials/Jonathan.webp'
    },
    {
      quote: `Working with Josue and the Visioners Media team has been amazing. They transformed how we convert Photoshop graphics to Canva—fast, precise, and efficient. Their communication is excellent, always responsive and professional. Visioners has become one of our most valued partners, and we look forward to continuing our collaboration!`,
      name: 'Thomas Seinbert',
      role: 'Founder, Church Design Lab',
      avatar: 'assets/img/testimonials/Thomas-scaled.webp'
    },
    {
      quote: `Josué and the team at Visioners Media have been a great partner with us at Nucleus Media. We needed fully editable templates and designs that we could distribute to the thousands of churches that use our service. And they’ve always been up for the challenge.`,
      name: 'Brady Shearer',
      role: 'Founder & CEO of Nucleus',
      avatar: 'assets/img/testimonials/Brady.webp'
    }
  ];

  let idx = 0;
  const clampIndex = (i) => (i + items.length) % items.length;

  const render = () => {
    const it = items[clampIndex(idx)];
    if (quoteEl) quoteEl.textContent = `“${it.quote}”`;
    if (nameEl) nameEl.textContent = it.name;
    if (roleEl) roleEl.textContent = it.role;
    if (avatarsEl) {
      avatarsEl.innerHTML = items.map((t, i) => `
        <li class="${i === clampIndex(idx) ? 'active' : ''}" data-index="${i}" title="${t.name}">
          <img src="${t.avatar}" alt="${t.name}" loading="lazy" />
        </li>`).join('');
    }
  };

  render();

  // Lock consistent card height across varying quote lengths
  const syncCardMinHeight = () => {
    if (!card) return;
    const temp = card.cloneNode(true);
    const tempQuote = temp.querySelector('.tquote');
    const tempName = temp.querySelector('.tname');
    const tempRole = temp.querySelector('.trole');
    const tempAvatars = temp.querySelector('.tavatars');

    Object.assign(temp.style, {
      position: 'absolute',
      left: '-9999px',
      top: '-9999px',
      visibility: 'hidden',
      pointerEvents: 'none',
      height: 'auto'
    });

    const { width } = card.getBoundingClientRect();
    temp.style.width = `${width}px`;
    document.body.appendChild(temp);

    let maxH = 0;
    items.forEach((it, i) => {
      if (tempQuote) tempQuote.textContent = `“${it.quote}”`;
      if (tempName) tempName.textContent = it.name;
      if (tempRole) tempRole.textContent = it.role;
      if (tempAvatars) {
        tempAvatars.innerHTML = items.map((t, j) => `
          <li class="${j === i ? 'active' : ''}" title="${t.name}">
            <img src="${t.avatar}" alt="${t.name}" />
          </li>`).join('');
      }
      maxH = Math.max(maxH, temp.offsetHeight);
    });

    temp.remove();
    card.style.minHeight = `${Math.ceil(maxH)}px`;
  };

  // Initial and responsive recalculation
  syncCardMinHeight();
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(syncCardMinHeight, 150);
  });

  let animating = false;
  const changeTo = (targetIdx) => {
    if (animating) return;
    const target = clampIndex(targetIdx);
    const dir = target > idx ? 'right' : 'left';

    animating = true;
    card?.classList.add('transitioning');
    // Outgoing: fade + drift horizontally toward arrow direction
    card?.classList.add(dir === 'right' ? 'slide-out-right' : 'slide-out-left');

    // Overlap: start incoming 200ms before outgoing finishes
    const outDur = 500; // ms
    const overlap = 200; // ms
    setTimeout(() => {
      // Prepare incoming state
      idx = target;
      render();
      // Set pre-state for incoming
      card?.classList.remove('slide-out-right', 'slide-out-left');
      card?.classList.add(dir === 'right' ? 'incoming-right' : 'incoming-left');
      // Next frame: run slide-in moving in same arrow direction
      requestAnimationFrame(() => {
        card?.classList.add('slide-in');
        // Clean up after incoming finishes
        setTimeout(() => {
          card?.classList.remove('slide-in', 'incoming-left', 'incoming-right', 'transitioning');
          animating = false;
        }, 600); // incoming duration
      });
    }, outDur - overlap);
  };

  // Avatar click navigation
  avatarsEl?.addEventListener('click', (e) => {
    const li = e.target.closest('li');
    if (!li) return;
    const i = Number(li.dataset.index || '0');
    changeTo(i);
  });

  prevBtn?.addEventListener('click', () => { changeTo(idx - 1); });
  nextBtn?.addEventListener('click', () => { changeTo(idx + 1); });

  // Keyboard support
  section.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { changeTo(idx - 1); }
    if (e.key === 'ArrowRight') { changeTo(idx + 1); }
  });
})();

(() => {
  const workSection = document.getElementById('work');
  const modal = document.getElementById('caseModal');
  if (!workSection || !modal) return;

  const grid = workSection.querySelector('.card-grid') || workSection;
  const backdrop = modal.querySelector('.vs-backdrop');
  const closeBtn = modal.querySelector('.vs-modal-close');
  const frame = modal.querySelector('iframe');

  const openCase = (url, push = true) => {
    if (!frame) return;
    frame.src = url;
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeBtn?.focus();
    if (push) {
      const match = url.match(/\/cases\/([^/]+)\.html$/);
      const slug = match ? match[1] : '';
      const nextUrl = slug ? `${location.pathname}?case=${slug}` : location.pathname;
      history.pushState({ case: slug }, '', nextUrl);
    }
  };

  const closeCase = (push = true) => {
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (frame) frame.src = '';
    if (push) {
      history.pushState({}, '', location.pathname);
    }
  };

  // Intercept clicks on Selected Work anchors to open overlay
  grid.addEventListener('click', (e) => {
    const link = e.target.closest('a.card');
    if (!link) return;
    e.preventDefault();
    openCase(link.href);
  }, { capture: true });

  grid.addEventListener('keydown', (e) => {
    const link = e.target.closest('a.card');
    if (!link) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openCase(link.href);
    }
  }, { capture: true });

  backdrop?.addEventListener('click', () => closeCase());
  closeBtn?.addEventListener('click', () => closeCase());
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeCase();
  });

  // Back/forward support
  window.addEventListener('popstate', () => {
    const params = new URLSearchParams(location.search);
    const slug = params.get('case');
    if (slug) {
      openCase(`/cases/${slug}.html`, false);
    } else if (!modal.classList.contains('hidden')) {
      closeCase(false);
    }
  });

  // Handle direct deep link: ?case=slug
  const initialSlug = new URLSearchParams(location.search).get('case');
  if (initialSlug) openCase(`/cases/${initialSlug}.html`, false);
})();


(() => {
  // Cards now navigate to dedicated case pages via anchors.
  // No modal logic needed.
})();

// Strategy + FreeConsult: collapsible FAQ toggles
(() => {
  const lists = document.querySelectorAll('#strategy .strategy-list, #freeconsult .strategy-list');
  if (!lists.length) return;
  lists.forEach((list) => {
    const items = list.querySelectorAll('.faq-item');
    items.forEach((item) => {
      const btn = item.querySelector('.faq-toggle');
      const panel = item.querySelector('.faq-content');
      const icon = btn?.querySelector('.plusbox');
      if (!btn || !panel) return;

      panel.style.maxHeight = '0px';
      panel.style.opacity = '0';
      btn.setAttribute('aria-expanded', 'false');

      btn.addEventListener('click', () => {
        const isOpen = item.classList.toggle('open');
        btn.setAttribute('aria-expanded', String(isOpen));
        if (icon) icon.textContent = isOpen ? '–' : '+';
        if (isOpen) {
          panel.style.maxHeight = panel.scrollHeight + 'px';
          panel.style.opacity = '1';
        } else {
          panel.style.maxHeight = '0px';
          panel.style.opacity = '0';
        }
      });
    });
  });
})();

// About: floating portraits subtle parallax + entrance
(() => {
  const section = document.getElementById('about');
  if (!section) return;

  const floats = Array.from(section.querySelectorAll('.about-float'));
  if (!floats.length) return;

  // Cinematic entrance: staggered reveal for floating portraits
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting || entry.intersectionRatio < 0.18) return;
      floats.forEach((el, i) => setTimeout(() => el.classList.add('in-view'), 80 + i * 90));
      io.unobserve(section);
    });
  }, { threshold: [0.18, 0.4] });
  io.observe(section);

  // Gentle pointer parallax with shadow drift for depth
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(pointer:fine)').matches;
  if (!reduced && fine) {
    const amps = floats.map((el, i) => 6 + (i % 3) * 2); // 6–10px per element

    const onMove = (ev) => {
      const r = section.getBoundingClientRect();
      const dx = (ev.clientX - (r.left + r.width / 2)) / r.width;  // -0.5..0.5
      const dy = (ev.clientY - (r.top + r.height / 2)) / r.height; // -0.5..0.5
      floats.forEach((el, i) => {
        const amp = amps[i];
        const px = (dx * amp).toFixed(2);
        const py = (dy * amp).toFixed(2);
        el.style.setProperty('--px', `${px}px`);
        el.style.setProperty('--py', `${py}px`);
        const shx = (dx * amp * 1.6).toFixed(2);
        const shy = (dy * amp * 2.2 + 24).toFixed(2);
        el.style.boxShadow = `${shx}px ${shy}px 80px rgba(0,0,0,0.14)`;
      });
    };

    const onLeave = () => {
      floats.forEach((el) => {
        el.style.setProperty('--px', '0px');
        el.style.setProperty('--py', '0px');
        el.style.boxShadow = '0 24px 80px rgba(0,0,0,0.14)';
      });
    };

    section.addEventListener('pointermove', onMove);
    section.addEventListener('pointerleave', onLeave);
  }
})();

// Prevent anchor jump on Cal booking links
(() => {
  const bookingLinks = document.querySelectorAll('a[data-cal-link]');
  bookingLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      // Stop default navigation to '#' while allowing Cal embed to open
      e.preventDefault();
    });
  });
})();

// About: scroll-dependent word-by-word reveal
(() => {
  const container = document.querySelector('.about .about-text');
  if (!container) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;
  const paragraphs = Array.from(container.querySelectorAll('p'));
  const words = [];
  paragraphs.forEach((p) => {
    const text = p.textContent || '';
    const parts = text.split(/(\s+)/);
    const frag = document.createDocumentFragment();
    parts.forEach((part) => {
      if (/\s+/.test(part)) {
        frag.appendChild(document.createTextNode(part));
      } else if (part.length) {
        const span = document.createElement('span');
        span.className = 'about-word';
        span.textContent = part;
        span.style.color = 'var(--muted)';
        frag.appendChild(span);
        words.push(span);
      }
    });
    p.textContent = '';
    p.appendChild(frag);
  });

  if (!words.length) return;

  let ticking = false;
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  const update = () => {
    const rect = container.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const progress = clamp((vh - rect.top) / (vh + rect.height), 0, 1);
    const eased = Math.pow(progress, 0.9);
    const activeCount = Math.floor(eased * words.length);
    for (let i = 0; i < words.length; i++) {
      words[i].style.color = i < activeCount ? '#111111' : 'var(--muted)';
    }
    ticking = false;
  };

  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        onScroll();
      }
    });
  }, { threshold: [0, 0.1] });
  io.observe(container);
})();
