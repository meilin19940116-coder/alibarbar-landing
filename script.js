/* Update this URL when the final Shopyy product or collection page is ready. */
const SHOP_URL = 'https://ausvape-b.shopyys.net/collections/all';
const AGE_GATE_KEY = 'alibarbar_age_confirmed';

const track = (eventName, detail = {}) => {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: eventName, ...detail });
  window.dispatchEvent(new CustomEvent(eventName, { detail }));
};

const setShopLinks = () => {
  document.querySelectorAll('[data-shop-link]').forEach((link) => {
    link.href = SHOP_URL;
    link.target = '_blank';
    link.rel = 'noopener';
  });
};

const setupAgeGate = () => {
  const gate = document.querySelector('[data-age-gate]');
  const confirm = document.querySelector('[data-age-confirm]');
  const deny = document.querySelector('[data-age-deny]');
  if (!gate || !confirm || !deny) return;

  const hideGate = () => {
    gate.classList.add('is-hidden');
    document.body.classList.remove('is-locked');
  };

  if (window.localStorage.getItem(AGE_GATE_KEY) === 'yes') {
    hideGate();
  } else {
    document.body.classList.add('is-locked');
  }

  confirm.addEventListener('click', () => {
    window.localStorage.setItem(AGE_GATE_KEY, 'yes');
    track('age_gate_confirmed');
    hideGate();
  });

  deny.addEventListener('click', () => {
    track('age_gate_denied');
    gate.querySelector('h2').textContent = 'Please return when you are of legal age.';
    confirm.hidden = true;
    deny.textContent = 'Close';
  });
};

const setupNavigation = () => {
  const header = document.querySelector('[data-header]');
  const toggle = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-nav]');
  if (!header || !toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const isOpen = header.classList.toggle('nav-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  nav.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
      header.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
};

const setupReveal = () => {
  const items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach((item) => item.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        currentObserver.unobserve(entry.target);
      }
    });
  }, { threshold: .14 });

  items.forEach((item) => observer.observe(item));
};

const setupHeroMotion = () => {
  const visual = document.querySelector('[data-hero-visual]');
  if (!visual || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  visual.addEventListener('pointermove', (event) => {
    const bounds = visual.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - .5;
    const y = (event.clientY - bounds.top) / bounds.height - .5;
    visual.style.setProperty('--pointer-x', `${x * 10}px`);
    visual.style.setProperty('--pointer-y', `${y * 10}px`);
    visual.querySelector('.device').style.translate = `${x * 10}px ${y * 8}px`;
  });

  visual.addEventListener('pointerleave', () => {
    visual.querySelector('.device').style.translate = '0 0';
  });
};

const setupTracking = () => {
  document.querySelectorAll('[data-track]').forEach((element) => {
    element.addEventListener('click', () => track('landing_click', { target: element.dataset.track }));
  });
};

document.addEventListener('DOMContentLoaded', () => {
  setShopLinks();
  setupAgeGate();
  setupNavigation();
  setupReveal();
  setupHeroMotion();
  setupTracking();
  document.querySelectorAll('[data-year]').forEach((node) => { node.textContent = new Date().getFullYear(); });
});
