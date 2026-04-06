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

  // Floating decorations — cursor acts as a soft collider
  // Elements get gently pushed away when cursor is near
  const decos = document.querySelectorAll('.d');
  let mouseX = -9999, mouseY = -9999;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.pageX;
    mouseY = e.pageY;
  });

  decos.forEach(el => {
    el._pushX = 0;
    el._pushY = 0;
    el._pushRot = 0;
  });

  function tick() {
    decos.forEach(el => {
      const rect = el.getBoundingClientRect();
      const zoom = parseFloat(page.style.zoom) || 1;
      const cx = (rect.left + rect.width / 2) / zoom + window.scrollX;
      const cy = (rect.top + rect.height / 2) / zoom + window.scrollY;
      const dx = cx - mouseX / zoom;
      const dy = cy - mouseY / zoom;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const radius = 150;

      if (dist < radius && dist > 0) {
        const force = (1 - dist / radius) * 25;
        const angle = Math.atan2(dy, dx);
        el._pushX += (Math.cos(angle) * force - el._pushX) * 0.15;
        el._pushY += (Math.sin(angle) * force - el._pushY) * 0.15;
        el._pushRot += (force * 0.3 - el._pushRot) * 0.1;
      } else {
        el._pushX *= 0.92;
        el._pushY *= 0.92;
        el._pushRot *= 0.92;
      }

      if (Math.abs(el._pushX) > 0.1 || Math.abs(el._pushY) > 0.1) {
        el.style.marginLeft = el._pushX + 'px';
        el.style.marginTop = el._pushY + 'px';
      } else {
        el.style.marginLeft = '';
        el.style.marginTop = '';
      }
    });
    requestAnimationFrame(tick);
  }
  tick();
});
