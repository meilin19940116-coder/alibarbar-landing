// ALIBARBAR 9000 - 简洁高转化脚本

// 开场视频控制
const initIntro = () => {
  const screen = document.querySelector('[data-intro]');
  const video = document.querySelector('[data-intro-video]');
  const source = video?.querySelector('[data-video-src]');

  if (!screen || !video || !source) {
    document.body.classList.remove('intro-active');
    return;
  }

  document.body.classList.add('intro-active');

  // 立即预加载背景图
  const isMobile = window.innerWidth <= 768;
  const bgImage = isMobile ? './assets/背景图手机端.png' : './assets/背景图电脑.png';
  const bgPreload = new Image();
  bgPreload.src = bgImage;

  // 根据视口选择视频
  source.src = isMobile ? './assets/alibarbar手机.mp4' : './assets/alibarbar电脑.mp4';
  video.load();

  let introEnded = false;
  let videoPlayed = false;

  function endIntro() {
    if (introEnded) return;
    introEnded = true;

    screen.classList.add('ended');
    document.body.classList.remove('intro-active');

    // 确保背景图立即显示
    const hero = document.querySelector('.hero');
    if (hero) {
      hero.style.backgroundImage = `url('${bgImage}')`;
    }

    // 1秒后移除开场遮罩
    setTimeout(() => screen.remove(), 1000);
  }

  // 视频就绪后播放
  video.addEventListener('canplay', () => {
    const playPromise = video.play();

    if (playPromise !== undefined) {
      playPromise.then(() => {
        videoPlayed = true;
      }).catch((error) => {
        console.log('Autoplay failed:', error.message);
        endIntro();
      });
    }
  }, { once: true });

  // 视频结束
  video.addEventListener('ended', endIntro, { once: true });

  // 加载失败处理
  video.addEventListener('error', (e) => {
    console.log('Video error:', e);
    endIntro();
  }, { once: true });

  // 2秒快速超时 - 视频没开始就跳过
  setTimeout(() => {
    if (!videoPlayed && !introEnded) {
      console.log('Quick timeout (2s) - video not playing');
      endIntro();
    }
  }, 2000);

  // 5秒最大超时
  setTimeout(() => {
    if (!introEnded) {
      console.log('Max timeout (5s)');
      endIntro();
    }
  }, 5000);
};

// 首屏背景视频（定格循环）
const startHeroVideo = () => {
  const video = document.querySelector('[data-hero-video]');
  const source = video?.querySelector('[data-hero-src]');

  if (!video || !source) return;

  // 使用静态背景图片替代视频尾帧
  const hero = document.querySelector('.hero');
  if (hero) {
    const isMobile = window.innerWidth <= 768;
    const bgImage = isMobile ? './assets/背景图手机端.png' : './assets/背景图电脑.png';

    // 直接设置背景图
    hero.style.backgroundImage = `url('${bgImage}')`;
    hero.style.backgroundSize = 'cover';
    hero.style.backgroundPosition = 'center';
    hero.classList.add('hero-loaded');
  }
};

// 轮播图控制 - 3D卡片效果
const initCarousel = () => {
  const carousel = document.querySelector('[data-carousel]');
  const track = document.querySelector('[data-carousel-track]');
  const slides = Array.from(track?.querySelectorAll('.carousel-slide') || []);
  const prevBtn = document.querySelector('[data-carousel-prev]');
  const nextBtn = document.querySelector('[data-carousel-next]');
  const currentEl = document.querySelector('[data-current]');
  const totalEl = document.querySelector('[data-total]');

  if (!carousel || !track || slides.length === 0) return;

  let currentIndex = 0;
  const totalSlides = slides.length;

  // 更新总数
  if (totalEl) totalEl.textContent = totalSlides;

  // 更新slide状态 - 只显示中间、左边、右边三张
  const updateSlides = () => {
    slides.forEach((slide, index) => {
      slide.classList.remove('active', 'prev', 'next');

      // 中间当前图
      if (index === currentIndex) {
        slide.classList.add('active');
      }
      // 左边图
      else if (index === currentIndex - 1 || (currentIndex === 0 && index === totalSlides - 1)) {
        slide.classList.add('prev');
      }
      // 右边图
      else if (index === currentIndex + 1 || (currentIndex === totalSlides - 1 && index === 0)) {
        slide.classList.add('next');
      }
    });

    // 更新计数器
    if (currentEl) currentEl.textContent = currentIndex + 1;
  };

  // 上一张
  const goPrev = () => {
    currentIndex = currentIndex > 0 ? currentIndex - 1 : totalSlides - 1;
    updateSlides();
    track('carousel_prev', { index: currentIndex });
  };

  // 下一张
  const goNext = () => {
    currentIndex = currentIndex < totalSlides - 1 ? currentIndex + 1 : 0;
    updateSlides();
    track('carousel_next', { index: currentIndex });
  };

  // 绑定按钮
  prevBtn?.addEventListener('click', goPrev);
  nextBtn?.addEventListener('click', goNext);

  // 键盘控制
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') goPrev();
    if (e.key === 'ArrowRight') goNext();
  });

  // 触摸滑动支持
  let touchStartX = 0;
  let touchEndX = 0;

  track.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  });

  track.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  });

  const handleSwipe = () => {
    if (touchStartX - touchEndX > 50) goNext();
    if (touchEndX - touchStartX > 50) goPrev();
  };

  // 初始化
  updateSlides();
};

// 导航菜单
const setupNav = () => {
  const header = document.querySelector('[data-header]');
  const toggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-nav]');

  if (!toggle) return;

  toggle.addEventListener('click', () => {
    header.classList.toggle('open');
  });

  // 点击链接关闭菜单
  nav?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      header.classList.remove('open');
    });
  });

  // 点击外部关闭
  document.addEventListener('click', (e) => {
    if (!header.contains(e.target) && header.classList.contains('open')) {
      header.classList.remove('open');
    }
  });
};

// 平滑滚动
const setupScroll = () => {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#' || href === '#top') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
};

// 追踪
const track = (name, data = {}) => {
  if (window.dataLayer) {
    window.dataLayer.push({ event: name, ...data });
  }
  console.log('Track:', name, data);
};

const setupTracking = () => {
  document.querySelectorAll('[data-track]').forEach(el => {
    el.addEventListener('click', () => {
      track('cta_click', { source: el.dataset.track });
    });
  });
};

// 年份
const setYear = () => {
  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });
};

// 导航栏滚动效果
const setupHeaderScroll = () => {
  const header = document.querySelector('[data-header]');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  initIntro();
  initCarousel();
  setupNav();
  setupScroll();
  setupTracking();
  setYear();
  setupHeaderScroll();
  track('page_load');

  // 启动产品特效
  if (window.initProductEffects) {
    window.initProductEffects();
  }
});

