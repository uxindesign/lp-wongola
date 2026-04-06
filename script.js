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

  // Floating decorations — gentle parallax on mouse move
  const decos = document.querySelectorAll('.d');
  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;  // -1 to 1
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // Each deco gets a random parallax intensity
  decos.forEach(el => {
    el._parallax = 0.5 + Math.random() * 1.5; // 0.5 to 2
    el._side = el.getBoundingClientRect().left > window.innerWidth / 2 ? 1 : -1;
  });

  function animateDecos() {
    decos.forEach(el => {
      const p = el._parallax;
      const offsetX = mouseX * 8 * p;
      const offsetY = mouseY * 6 * p;
      el.style.marginLeft = offsetX + 'px';
      el.style.marginTop = offsetY + 'px';
    });
    requestAnimationFrame(animateDecos);
  }
  animateDecos();
});
