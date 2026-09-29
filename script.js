/* Update this URL when the final Shopyy product or collection page is ready. */
const SHOP_URL = 'https://ausvape-b.shopyys.net/collections/all';

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
  document.body.classList.add('reveal-enabled');
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

  if (!overlayVideo || !overlay) return;

  // 与 CSS 的 768px 断点保持一致；进站时只请求一份视频，旋转屏幕不重播。
  const mediaVariant = window.matchMedia('(max-width: 768px)').matches ? 'mobile' : 'desktop';
  overlayVideo.poster = overlayVideo.dataset[`${mediaVariant}Poster`];

  // Only show the full-screen layer after this initializer is ready. If the
  // script is blocked, the static page remains usable instead of staying black.
  document.documentElement.classList.add('js-ready');

  // 标记视频正在播放；视频结束后只保留英雄区的静态尾帧图。
  document.body.classList.add('intro-playing');

  let introEnding = false;
  const endIntro = () => {
    if (introEnding) return;
    introEnding = true;
    overlayVideo.pause();
    // 先释放滚动和页面交互，再让遮罩继续淡出；不要让视觉转场阻塞页面。
    document.body.classList.remove('intro-playing');
    document.body.classList.add('intro-ended');

    if (!document.body.classList.contains('intro-transitioning')) {
      document.body.classList.add('intro-transitioning');
    }
    overlay.classList.add('is-fading');

    // 遮罩动画不再占用点击和滚动；动画结束后从文档层移除。
    setTimeout(() => {
      overlay.classList.add('is-ended');
      document.body.classList.remove('intro-transitioning');
    }, 2000);

    // 烟雾初始化放到浏览器空闲时，避免和结束事件争抢主线程。
    const initSmoke = () => {
      // 初始化烟雾效果
      try {
        if (typeof window.initSmokeBackground === 'function') {
          console.log('Initializing WebGL smoke...');
          window.initSmokeBackground('webgl-smoke', '#d8a84e');
        } else {
          console.warn('initSmokeBackground function not found');
        }
      } catch (error) {
        console.warn('WebGL smoke is unavailable; continuing with CSS effects.', error);
      }
    };
    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(initSmoke, { timeout: 1500 });
    } else {
      setTimeout(initSmoke, 350);
    }

    track('intro_video_ended');
  };

  // 监听视频播放进度，在快结束时触发转场
  overlayVideo.addEventListener('timeupdate', () => {
    const timeRemaining = overlayVideo.duration - overlayVideo.currentTime;

    // 当剩余2秒时开始转场动画
    if (timeRemaining <= 2 && timeRemaining > 0 && !document.body.classList.contains('intro-transitioning')) {
      document.body.classList.add('intro-transitioning');
      overlay.classList.add('is-fading');
    }
  });

  overlayVideo.addEventListener('ended', endIntro);

  overlayVideo.addEventListener('error', () => {
    console.warn('Intro video failed to load');
    endIntro();
  });

  // 如果视频加载失败或无法播放
  overlayVideo.addEventListener('loadedmetadata', () => {
    if (overlayVideo.duration === 0 || isNaN(overlayVideo.duration)) {
      endIntro();
    }
  });

  // 脚本准备好后启动开场视频；拒绝自动播放时立即降级到尾帧图。
  try {
    overlayVideo.src = overlayVideo.dataset[`${mediaVariant}Src`];
    overlayVideo.muted = true;
    const playAttempt = overlayVideo.play();
    if (playAttempt && typeof playAttempt.catch === 'function') {
      playAttempt.catch(() => endIntro());
    }
  } catch (error) {
    endIntro();
  }

  // 最终超时保护 - 8秒
  setTimeout(() => {
    if (!document.body.classList.contains('intro-ended')) {
      console.warn('Intro video timeout');
      endIntro();
    }
  }, 8000);
};

document.addEventListener('DOMContentLoaded', () => {
  setShopLinks();
  setupNavigation();
  setupHeroVideo();
  setupReveal();
  setupHeroMotion();
  setupTracking();
  document.querySelectorAll('[data-year]').forEach((node) => { node.textContent = new Date().getFullYear(); });
});
