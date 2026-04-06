document.addEventListener('DOMContentLoaded', () => {
  // Scale: >= 1280px use CSS transform scale to shrink/grow content
  // while keeping it centered and filling the viewport width.
  const page = document.querySelector('.page');
  function updateScale() {
    const vw = window.innerWidth;
    if (vw >= 1280) {
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

  // Accordion
  document.querySelectorAll('.acc-item').forEach(item => {
    item.addEventListener('click', () => item.classList.toggle('open'));
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

  // Floating decorations — cursor as soft collider
  // Force depends on cursor VELOCITY, not just proximity
  const decos = document.querySelectorAll('.d');
  let mx = -9999, my = -9999, pmx = -9999, pmy = -9999;
  let mVel = 0;

  document.addEventListener('mousemove', (e) => {
    pmx = mx; pmy = my;
    mx = e.pageX; my = e.pageY;
    const ddx = mx - pmx, ddy = my - pmy;
    mVel = Math.sqrt(ddx * ddx + ddy * ddy);
  });

  decos.forEach(el => { el._px = 0; el._py = 0; el._vx = 0; el._vy = 0; });

  function tick() {
    const zoom = parseFloat(page.style.zoom) || 1;
    const velFactor = Math.min(mVel / 30, 1); // 0-1 based on speed

    decos.forEach(el => {
      const rect = el.getBoundingClientRect();
      const cx = (rect.left + rect.width / 2) + window.scrollX * zoom;
      const cy = (rect.top + rect.height / 2) + window.scrollY * zoom;
      const dx = cx - mx * zoom;
      const dy = cy - my * zoom;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const radius = 200;

      if (dist < radius && dist > 1) {
        const proximity = 1 - dist / radius;
        const force = proximity * velFactor * 3;
        const angle = Math.atan2(dy, dx);
        el._vx += Math.cos(angle) * force * 0.012;
        el._vy += Math.sin(angle) * force * 0.012;
      }

      // Very gentle spring back + heavy damping
      el._vx += -el._px * 0.003;
      el._vy += -el._py * 0.003;
      el._vx *= 0.985;
      el._vy *= 0.985;
      el._px += el._vx;
      el._py += el._vy;

      if (Math.abs(el._px) > 0.05 || Math.abs(el._py) > 0.05) {
        el.style.marginLeft = el._px + 'px';
        el.style.marginTop = el._py + 'px';
      } else {
        el.style.marginLeft = '';
        el.style.marginTop = '';
      }
    });

    mVel *= 0.85; // decay velocity when mouse stops
    requestAnimationFrame(tick);
  }
  tick();
});
