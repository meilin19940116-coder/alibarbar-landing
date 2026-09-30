// Cinematic Brand Intro. Embedded by scripts/build-intro.cjs before the homepage markup.
(() => {
  'use strict';

  const template = document.querySelector('[data-brand-intro-template]');
  if (!template || template.dataset.enabled === 'false') return;

  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // The component arrives with HTML; ordinary network timing must not disable it.
  // Continue respecting explicit accessibility preferences and navigation context.
  if (motion.matches || document.hidden || window.scrollY > 0 || window.location.hash ||
      document.readyState === 'complete') return;

  const intro = template.content.firstElementChild.cloneNode(true);
  const interactionEvents = ['pointerdown', 'touchstart', 'wheel', 'keydown'];
  let fallbackTimer;
  let finished = false;

  const finish = () => {
    if (finished) return;
    finished = true;
    clearTimeout(fallbackTimer);
    intro.hidden = true;
    intro.remove();
    intro.removeEventListener('animationend', onAnimationEnd);
    intro.removeEventListener('animationcancel', onAnimationEnd);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    window.removeEventListener('pagehide', finish);
    interactionEvents.forEach(name => window.removeEventListener(name, finish, true));
    if (motion.removeEventListener) motion.removeEventListener('change', onMotionChange);
    else if (motion.removeListener) motion.removeListener(onMotionChange);
  };

  const onAnimationEnd = event => {
    if (event.target === intro && event.animationName === 'brand-intro-exit') finish();
  };
  const onVisibilityChange = () => { if (document.hidden) finish(); };
  const onMotionChange = event => { if (event.matches) finish(); };

  // Register the watchdog before showing anything; never wait for images or lock scrolling.
  fallbackTimer = setTimeout(finish, 2500);
  try {
    intro.addEventListener('animationend', onAnimationEnd);
    intro.addEventListener('animationcancel', onAnimationEnd);
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('pagehide', finish);
    interactionEvents.forEach(name => window.addEventListener(name, finish, { capture: true, passive: true }));
    if (motion.addEventListener) motion.addEventListener('change', onMotionChange);
    else if (motion.addListener) motion.addListener(onMotionChange);

    document.body.appendChild(intro);
    intro.classList.add('is-active');
    intro.hidden = false;

    const style = window.getComputedStyle(intro);
    const duration = parseFloat(style.animationDuration);
    if (style.animationName !== 'brand-intro-exit' || style.animationPlayState !== 'running' ||
        style.display === 'none' || !Number.isFinite(duration) || duration <= 0) finish();
  } catch (error) {
    finish();
  }
})();
