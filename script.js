const reveals = document.querySelectorAll('.reveal');
const nav = document.querySelector('.nav');

// Interactive spotlight (updates CSS variables used by gradients)
const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
if (!prefersReducedMotion) {
  const setSpotlight = (x, y) => {
    document.documentElement.style.setProperty('--mx', `${Math.round(x)}px`);
    document.documentElement.style.setProperty('--my', `${Math.round(y)}px`);
  };

  // Set an initial pleasant position
  setSpotlight(window.innerWidth * 0.5, window.innerHeight * 0.28);

  window.addEventListener(
    'pointermove',
    (e) => {
      // Ignore multitouch gestures
      if (typeof e.isPrimary === 'boolean' && !e.isPrimary) return;
      setSpotlight(e.clientX, e.clientY);
    },
    { passive: true }
  );
}

// Reveal sections (smooth + efficient)
const revealObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        revealObserver.unobserve(entry.target);
      }
    }
  },
  { root: null, threshold: 0.12, rootMargin: '0px 0px -10% 0px' }
);

reveals.forEach((el) => revealObserver.observe(el));

// Mobile nav toggle
const toggleButton = document.querySelector('.nav__toggle');
const navLinks = document.querySelector('.nav__links');

if (toggleButton && navLinks) {
  const setMenuOpen = (open) => {
    document.body.classList.toggle('nav-open', open);
    toggleButton.setAttribute('aria-expanded', String(open));
  };

  toggleButton.addEventListener('click', () => {
    const isOpen = !document.body.classList.contains('nav-open');
    setMenuOpen(isOpen);
  });

  navLinks.addEventListener('click', (e) => {
    const target = e.target;
    if (target instanceof HTMLAnchorElement) {
      setMenuOpen(false);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setMenuOpen(false);
  });

  document.addEventListener('click', (e) => {
    const target = e.target;
    if (!(target instanceof Node)) return;
    if (!document.body.classList.contains('nav-open')) return;
    if (nav && nav.contains(target)) return;
    setMenuOpen(false);
  });
}

// Active section link highlight
const sectionIds = ['problem', 'solution', 'features', 'math', 'constants', 'future'];
const linkById = new Map(
  sectionIds
    .map((id) => [id, document.querySelector(`.nav__links a[href="#${id}"]`)])
    .filter(([, link]) => link)
);

const sectionObserver = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((e) => e.isIntersecting)
      .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0));

    if (!visible.length) return;
    const id = visible[0].target.id;

    for (const [, link] of linkById) {
      link.classList.remove('active');
    }
    const activeLink = linkById.get(id);
    if (activeLink) activeLink.classList.add('active');
  },
  { threshold: [0.25, 0.5, 0.75] }
);

for (const id of sectionIds) {
  const section = document.getElementById(id);
  if (section) sectionObserver.observe(section);
}

// Nav scrolled styling
const updateNavScrolled = () => {
  if (!nav) return;
  nav.classList.toggle('nav--scrolled', window.scrollY > 8);
};

updateNavScrolled();
window.addEventListener('scroll', updateNavScrolled, { passive: true });
