/* Update this URL when the final Shopyy product or collection page is ready. */
const SHOP_URL = 'https://ausvape-b.shopyys.net/collections/all';
const AGE_GATE_KEY = 'alibarbar_age_confirmed';

// Lottie 烟雾动画
const setupLottieSmoke = () => {
  if (typeof lottie === 'undefined') {
    console.warn('Lottie library not loaded');
    return;
  }

  // 使用免费的烟雾动画 JSON（LottieFiles 的公开资源）
  const smokeAnimationURL = 'https://lottie.host/d4156a0f-39a5-4be1-8b97-a3d9fa3f2c75/BnW2Kzg3bK.json';

  const containers = ['smoke-lottie-1', 'smoke-lottie-2', 'smoke-lottie-3'];

  containers.forEach((id, index) => {
    const container = document.getElementById(id);
    if (!container) return;

    setTimeout(() => {
      lottie.loadAnimation({
        container: container,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: smokeAnimationURL
      });
      console.log('Lottie smoke loaded:', id);
    }, index * 500); // 错开加载时间
  });
};

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

const setupHeroVideo = () => {
  const overlayVideo = document.querySelector('[data-intro-video]');
  const overlay = document.querySelector('[data-intro-overlay]');
  const bgVideo = document.querySelector('[data-hero-video-bg]');

  if (!overlayVideo || !overlay) return;

  // 标记视频正在播放
  document.body.classList.add('intro-playing');

  // 预加载背景视频到最后一帧
  if (bgVideo) {
    bgVideo.addEventListener('loadedmetadata', () => {
      bgVideo.currentTime = bgVideo.duration - 0.1;
      bgVideo.pause();
    });
    bgVideo.load();
  }

  // 监听视频播放进度，在快结束时触发转场
  overlayVideo.addEventListener('timeupdate', () => {
    const timeRemaining = overlayVideo.duration - overlayVideo.currentTime;

    // 当剩余2秒时开始转场动画
    if (timeRemaining <= 2 && timeRemaining > 0 && !document.body.classList.contains('intro-transitioning')) {
      document.body.classList.add('intro-transitioning');
      overlay.classList.add('is-fading');
    }
  });

  const endIntro = () => {
    // 确保转场已经开始
    if (!document.body.classList.contains('intro-transitioning')) {
      document.body.classList.add('intro-transitioning');
      overlay.classList.add('is-fading');
    }

    // 延迟后完全移除遮罩
    setTimeout(() => {
      document.body.classList.remove('intro-playing');
      document.body.classList.add('intro-ended');
      overlay.classList.add('is-ended');

      // 初始化烟雾效果
      if (typeof window.initSmokeBackground === 'function') {
        console.log('Initializing WebGL smoke...');
        window.initSmokeBackground('webgl-smoke', '#d8a84e');
      } else {
        console.warn('initSmokeBackground function not found');
      }
    }, 1500);

    track('intro_video_ended');
  };

  overlayVideo.addEventListener('ended', endIntro);

  overlayVideo.addEventListener('error', () => {
    console.warn('Intro video failed to load, showing site immediately');
    endIntro();
  });

  // 如果视频加载失败或无法播放
  overlayVideo.addEventListener('loadedmetadata', () => {
    if (overlayVideo.duration === 0 || isNaN(overlayVideo.duration)) {
      endIntro();
    }
  });

  // 超时保护
  setTimeout(() => {
    if (!document.body.classList.contains('intro-ended')) {
      console.warn('Intro video timeout, showing site');
      endIntro();
    }
  }, 10000);
};

document.addEventListener('DOMContentLoaded', () => {
  setShopLinks();
  setupAgeGate();
  setupNavigation();
  setupHeroVideo();
  setupReveal();
  setupHeroMotion();
  setupTracking();
  document.querySelectorAll('[data-year]').forEach((node) => { node.textContent = new Date().getFullYear(); });
});
