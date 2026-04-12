document.addEventListener('DOMContentLoaded', () => {
  // Scale: >= 1280px use CSS transform scale to shrink/grow content
  // while keeping it centered and filling the viewport width.
  const page = document.querySelector('.page');
  function updateScale() {
    const vw = window.innerWidth;
    if (vw > 1280) {
      page.style.zoom = vw / 1920;
    } else {
      page.style.zoom = '';
    }
  }
  updateScale();
  window.addEventListener('resize', updateScale);

  // Nav scroll
  const nav = document.querySelector('.nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  });

  // Hamburger
  const hamburger = document.querySelector('.nav-hamburger');
  const menu = document.querySelector('.nav-menu');
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    menu.classList.toggle('open');
  });
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      menu.classList.remove('open');
    });
  });

  // Content Accordion (smooth animated)
  // Remove hidden attribute on load — CSS handles visibility via max-height
  document.querySelectorAll('[data-cacc] .cacc-body').forEach(body => {
    body.removeAttribute('hidden');
  });

  document.querySelectorAll('[data-cacc]').forEach(item => {
    const header = item.querySelector('.cacc-header');
    const icon = item.querySelector('.cacc-icon');

    header.addEventListener('click', () => {
      const isOpen = item.classList.contains('cacc-open');

      if (isOpen) {
        item.classList.remove('cacc-open');
        header.setAttribute('aria-expanded', 'false');
        icon.src = 'assets/icon-chevron-right.svg';
      } else {
        // Close all others
        document.querySelectorAll('[data-cacc]').forEach(other => {
          other.classList.remove('cacc-open');
          const otherHeader = other.querySelector('.cacc-header');
          const otherIcon = other.querySelector('.cacc-icon');
          if (otherHeader) otherHeader.setAttribute('aria-expanded', 'false');
          if (otherIcon) otherIcon.src = 'assets/icon-chevron-right.svg';
        });

        // Open this
        item.classList.add('cacc-open');
        header.setAttribute('aria-expanded', 'true');
        icon.src = 'assets/icon-chevron-down.svg';
      }
    });
  });

  // Scroll animations
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.anim').forEach(el => observer.observe(el));

  // ============================================
  // FLOATING RECTANGLES — continuous random drift
  // Uses layered sine waves at different frequencies
  // to create organic, never-repeating trajectories.
  // Cursor acts as soft collider on top of the drift.
  // ============================================
  const decos = document.querySelectorAll('.d, .wongola-africa-bg, .wongola-africa-border, .wongola-africa-map, .trophy-cup-v2, .trophy-pillars-v2, .trophy-bg-shape, .trophy-union, .como-arrow');
  let mx = -9999, my = -9999, pmx = -9999, pmy = -9999, mVel = 0;

  document.addEventListener('mousemove', (e) => {
    pmx = mx; pmy = my;
    mx = e.pageX; my = e.pageY;
    mVel = Math.sqrt((mx - pmx) ** 2 + (my - pmy) ** 2);
  });

  // Each element gets unique random wave parameters
  decos.forEach(el => {
    const isArrow = el.classList.contains('como-arrow');
    const isPillar = el.classList.contains('trophy-pillars-v2');
    const isTrophy = el.classList.contains('trophy-cup-v2') || el.classList.contains('trophy-bg-shape');
    const range = isArrow ? 6 : (isPillar || isTrophy) ? 4 : 25;
    const rotRange = isArrow ? 0 : (isPillar || isTrophy) ? 0.5 : 4;

    // 3 layered sine waves per axis for complex paths
    el._waves = {
      x1: { freq: 0.0003 + Math.random() * 0.0004, amp: range * (0.6 + Math.random() * 0.4), phase: Math.random() * Math.PI * 2 },
      x2: { freq: 0.0007 + Math.random() * 0.0005, amp: range * (0.3 + Math.random() * 0.3), phase: Math.random() * Math.PI * 2 },
      x3: { freq: 0.00015 + Math.random() * 0.0002, amp: range * (0.2 + Math.random() * 0.2), phase: Math.random() * Math.PI * 2 },
      y1: { freq: 0.00025 + Math.random() * 0.0004, amp: range * (0.6 + Math.random() * 0.4), phase: Math.random() * Math.PI * 2 },
      y2: { freq: 0.0006 + Math.random() * 0.0005, amp: range * (0.3 + Math.random() * 0.3), phase: Math.random() * Math.PI * 2 },
      y3: { freq: 0.00012 + Math.random() * 0.00015, amp: range * (0.2 + Math.random() * 0.2), phase: Math.random() * Math.PI * 2 },
      r1: { freq: 0.0002 + Math.random() * 0.0003, amp: rotRange, phase: Math.random() * Math.PI * 2 },
    };

    el._pushX = 0; el._pushY = 0;
    el._pvx = 0; el._pvy = 0;
    el._baseRot = getComputedStyle(el).getPropertyValue('--base-rot').trim() || 'rotate(0)';
  });

  function tick(t) {
    const zoom = parseFloat(page.style.zoom) || 1;
    const velFactor = Math.min(mVel / 30, 1);

    decos.forEach(el => {
      const w = el._waves;

      // Layered sine drift
      const driftX = Math.sin(t * w.x1.freq + w.x1.phase) * w.x1.amp
                    + Math.sin(t * w.x2.freq + w.x2.phase) * w.x2.amp
                    + Math.sin(t * w.x3.freq + w.x3.phase) * w.x3.amp;
      const driftY = Math.sin(t * w.y1.freq + w.y1.phase) * w.y1.amp
                    + Math.sin(t * w.y2.freq + w.y2.phase) * w.y2.amp
                    + Math.sin(t * w.y3.freq + w.y3.phase) * w.y3.amp;
      const driftR = Math.sin(t * w.r1.freq + w.r1.phase) * w.r1.amp;

      // Cursor collision
      const rect = el.getBoundingClientRect();
      const cx = (rect.left + rect.width / 2) + window.scrollX * zoom;
      const cy = (rect.top + rect.height / 2) + window.scrollY * zoom;
      const dx = cx - mx * zoom;
      const dy = cy - my * zoom;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 200 && dist > 1) {
        const proximity = 1 - dist / 200;
        const force = proximity * velFactor * 3.6;
        const angle = Math.atan2(dy, dx);
        el._pvx += Math.cos(angle) * force * 0.014;
        el._pvy += Math.sin(angle) * force * 0.014;
      }

      el._pvx += -el._pushX * 0.003;
      el._pvy += -el._pushY * 0.003;
      el._pvx *= 0.985;
      el._pvy *= 0.985;
      el._pushX += el._pvx;
      el._pushY += el._pvy;

      const totalX = driftX + el._pushX;
      const totalY = driftY + el._pushY;

      el.style.transform = el._baseRot + ' translate(' + totalX.toFixed(1) + 'px,' + totalY.toFixed(1) + 'px) rotate(' + driftR.toFixed(2) + 'deg)';
    });

    mVel *= 0.85;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
});
