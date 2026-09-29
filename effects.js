// ALIBARBAR 9000 - 特效组件

// 1. 漂浮粒子效果（模拟蒸汽粒子）- 只在非首屏区域
const createFloatingParticles = () => {
  const sections = document.querySelectorAll('.flavours, .features, .order-section, .footer');

  sections.forEach(section => {
    const container = document.createElement('div');
    container.className = 'particles-container';
    section.style.position = 'relative';
    section.appendChild(container);

    const particleCount = 15; // 每个区域15个粒子

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';

      // 随机位置
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 10 + 's';
      particle.style.animationDuration = (15 + Math.random() * 10) + 's';

      container.appendChild(particle);
    }
  });
};

// 2. 轮播产品的脉冲光效
const addCarouselGlow = () => {
  const track = document.querySelector('[data-carousel-track]');
  if (!track) return;

  const observer = new MutationObserver(() => {
    const activeSlide = track.querySelector('.carousel-slide.active');
    if (activeSlide && !activeSlide.querySelector('.pulse-glow')) {
      const glow = document.createElement('div');
      glow.className = 'pulse-glow';
      activeSlide.appendChild(glow);
    }
  });

  observer.observe(track, { attributes: true, subtree: true });
};

// 3. 流光线条背景 - 只在非首屏区域
const createFlowingLines = () => {
  const sections = document.querySelectorAll('.flavours, .features, .order-section');

  sections.forEach((section, index) => {
    const line = document.createElement('div');
    line.className = 'flowing-line';
    line.style.animationDelay = (index * 2) + 's';
    section.appendChild(line);
  });
};

// 4. 按钮悬停蒸汽效果 - 只针对非首屏的按钮
const addButtonVaporEffect = () => {
  const buttons = document.querySelectorAll('.order-section .btn-primary, .float-btn');

  buttons.forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      if (!btn.querySelector('.vapor-effect')) {
        const vapor = document.createElement('div');
        vapor.className = 'vapor-effect';
        btn.appendChild(vapor);

        setTimeout(() => vapor.remove(), 1000);
      }
    });
  });
};

// 5. 滚动时的视差光效
const addScrollGlow = () => {
  const glowElements = document.querySelectorAll('.feature-item, .order-box');

  window.addEventListener('scroll', () => {
    glowElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      if (rect.top < windowHeight * 0.8 && rect.bottom > 0) {
        el.classList.add('in-view');
      }
    });
  }, { passive: true });
};

// 初始化所有特效
const initEffects = () => {
  // 等待页面加载完成后再启动特效
  setTimeout(() => {
    createFloatingParticles();
    createFlowingLines();
    addButtonVaporEffect();
    addScrollGlow();

    // 轮播初始化后再添加光效
    setTimeout(() => {
      addCarouselGlow();
    }, 500);
  }, 2500); // 开场视频结束后启动
};

// 导出初始化函数
window.initProductEffects = initEffects;
