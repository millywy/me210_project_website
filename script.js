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

if (spyLinks.length && spySections.length && 'IntersectionObserver' in window) {
  const byId = new Map(spyLinks.map((link) => [link.getAttribute('href').slice(1), link]));
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;

      const id = visible.target.id;
      spyLinks.forEach((link) => link.classList.toggle('is-active', link === byId.get(id)));
    },
    {
      rootMargin: '-25% 0px -55% 0px',
      threshold: [0.15, 0.4, 0.7],
    }
  );

  spySections.forEach((section) => observer.observe(section));
}
