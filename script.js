const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');

if (menuButton && nav) {
  menuButton.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
  });
}

const spyLinks = [...document.querySelectorAll('[data-spy-link]')];
const spySections = [...document.querySelectorAll('[data-spy-section]')];

if (spyLinks.length && spySections.length) {
  const byId = new Map(spyLinks.map((link) => [link.getAttribute('href').slice(1), link]));

  const updateActiveLink = () => {
    const offset = 170;
    let activeId = spySections[0].id;

    for (const section of spySections) {
      const top = section.getBoundingClientRect().top;
      if (top - offset <= 0) activeId = section.id;
    }

    spyLinks.forEach((link) => link.classList.toggle('is-active', link === byId.get(activeId)));
  };

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  window.addEventListener('resize', updateActiveLink);
  updateActiveLink();
}

const carousels = [...document.querySelectorAll('[data-carousel]')];

carousels.forEach((carousel) => {
  const track = carousel.querySelector('[data-carousel-track]');
  const slides = [...carousel.querySelectorAll('[data-carousel-slide]')];
  const prev = carousel.querySelector('[data-carousel-prev]');
  const next = carousel.querySelector('[data-carousel-next]');
  const dots = carousel.querySelector('[data-carousel-dots]');
  const autoplay = carousel.dataset.autoplay !== 'false';
  const intervalMs = Number(carousel.dataset.interval || 3600);
  let index = 0;
  let timer = null;

  if (!track || !slides.length) return;

  const update = () => {
    track.style.transform = `translateX(-${index * 100}%)`;
    if (dots) {
      [...dots.children].forEach((dot, dotIndex) => {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }
  };

  const goTo = (nextIndex) => {
    index = (nextIndex + slides.length) % slides.length;
    update();
  };

  const start = () => {
    if (!autoplay || slides.length < 2) return;
    stop();
    timer = window.setInterval(() => goTo(index + 1), intervalMs);
  };

  const stop = () => {
    if (timer) window.clearInterval(timer);
  };

  if (dots && slides.length > 1) {
    slides.forEach((_, slideIndex) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', `Go to slide ${slideIndex + 1}`);
      dot.addEventListener('click', () => {
        goTo(slideIndex);
        start();
      });
      dots.appendChild(dot);
    });
  }

  prev?.addEventListener('click', () => {
    goTo(index - 1);
    start();
  });

  next?.addEventListener('click', () => {
    goTo(index + 1);
    start();
  });

  carousel.addEventListener('mouseenter', stop);
  carousel.addEventListener('mouseleave', start);

  update();
  start();
});
