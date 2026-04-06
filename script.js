document.addEventListener('DOMContentLoaded', () => {
  // Scale: >= 1280px zoom proportionally, < 1280px responsive layout
  const page = document.querySelector('.page');
  function updateScale() {
    const vw = window.innerWidth;
    if (vw >= 1280) {
      page.style.zoom = vw / 1600;
      page.style.width = '1440px';
      page.style.overflow = 'hidden';
    } else {
      page.style.zoom = '';
      page.style.width = '';
      page.style.overflow = '';
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
});
