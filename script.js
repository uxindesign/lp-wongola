document.addEventListener('DOMContentLoaded', () => {
  // Scale: >= 1280px use CSS transform scale to shrink/grow content
  // while keeping it centered and filling the viewport width.
  const page = document.querySelector('.page');
  function updateScale() {
    const vw = window.innerWidth;
    if (vw >= 1280) {
      const scale = vw / 1440;
      page.style.transform = 'scale(' + scale + ')';
      page.style.transformOrigin = 'top center';
      page.style.width = (100 / scale) + '%';
      page.style.marginLeft = 'auto';
      page.style.marginRight = 'auto';
    } else {
      page.style.transform = '';
      page.style.transformOrigin = '';
      page.style.width = '';
      page.style.marginLeft = '';
      page.style.marginRight = '';
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
