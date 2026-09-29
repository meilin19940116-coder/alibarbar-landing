// 优雅的粒子汇聚开场动画
const initLiquidIntro = () => {
  const canvas = document.getElementById('liquid-canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  let frame = 0;
  const maxFrames = 100;

  const isMobile = window.innerWidth <= 768;
  const brandSize = isMobile ? 50 : 95;
  const modelSize = isMobile ? 100 : 190;
  const spacing = isMobile ? 40 : 70;

  // 创建粒子系统
  const particles = [];
  const particleCount = isMobile ? 120 : 200;

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      targetX: 0,
      targetY: 0,
      size: Math.random() * 2 + 1,
      speed: Math.random() * 0.02 + 0.01,
      delay: Math.random() * 30
    });
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function animate() {
    frame++;

    // 深黑背景
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const progress = frame / maxFrames;

    // 阶段1：粒子从随机位置汇聚到中心 (0-50帧)
    if (frame <= 50) {
      particles.forEach((p, i) => {
        if (frame > p.delay) {
          const localProgress = Math.min((frame - p.delay) / 40, 1);
          const eased = easeOutCubic(localProgress);

          const currentX = p.x + (centerX - p.x) * eased;
          const currentY = p.y + (centerY - p.y) * eased;

          const opacity = 0.3 + localProgress * 0.5;
          const size = p.size * (0.5 + localProgress * 0.5);

          ctx.fillStyle = `rgba(201, 169, 97, ${opacity})`;
          ctx.shadowBlur = 8;
          ctx.shadowColor = 'rgba(201, 169, 97, 0.6)';
          ctx.beginPath();
          ctx.arc(currentX, currentY, size, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    }

    // 阶段2：中心光爆 + 文字淡入 (35-85帧)
    if (frame >= 35) {
      const textProgress = Math.min((frame - 35) / 50, 1);
      const eased = easeOutCubic(textProgress);

      // 中心光晕
      if (frame < 60) {
        const glowProgress = (frame - 35) / 25;
        const glowRadius = glowProgress * 400;
        const glowGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, glowRadius);
        glowGradient.addColorStop(0, `rgba(255, 223, 143, ${0.3 * (1 - glowProgress)})`);
        glowGradient.addColorStop(0.5, `rgba(201, 169, 97, ${0.15 * (1 - glowProgress)})`);
        glowGradient.addColorStop(1, 'rgba(201, 169, 97, 0)');
        ctx.fillStyle = glowGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // ALIBARBAR 文字
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // 轻微模糊效果
      ctx.filter = `blur(${(1 - eased) * 8}px)`;
      ctx.globalAlpha = eased;

      // 品牌名 - 细线条
      ctx.font = `300 ${brandSize}px -apple-system, Arial, sans-serif`;
      ctx.letterSpacing = isMobile ? '0.3em' : '0.5em';

      const brandGradient = ctx.createLinearGradient(
        centerX - 300, centerY - spacing,
        centerX + 300, centerY - spacing
      );
      brandGradient.addColorStop(0, 'rgba(201, 169, 97, 0.7)');
      brandGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.95)');
      brandGradient.addColorStop(1, 'rgba(201, 169, 97, 0.7)');

      ctx.fillStyle = brandGradient;
      ctx.shadowBlur = 20;
      ctx.shadowColor = 'rgba(201, 169, 97, 0.4)';
      ctx.fillText('ALIBARBAR', centerX, centerY - spacing);

      // 9000 - 粗体
      ctx.font = `900 ${modelSize}px -apple-system, Arial, sans-serif`;
      ctx.letterSpacing = isMobile ? '0.1em' : '0.15em';

      const modelGradient = ctx.createLinearGradient(
        centerX - 400, centerY + spacing,
        centerX + 400, centerY + spacing
      );
      modelGradient.addColorStop(0, '#c9a961');
      modelGradient.addColorStop(0.3, '#ffd88f');
      modelGradient.addColorStop(0.5, '#ffffff');
      modelGradient.addColorStop(0.7, '#ffd88f');
      modelGradient.addColorStop(1, '#c9a961');

      ctx.fillStyle = modelGradient;
      ctx.shadowBlur = 30;
      ctx.shadowColor = 'rgba(201, 169, 97, 0.8)';
      ctx.fillText('9000', centerX, centerY + spacing);

      ctx.restore();
    }

    if (frame >= maxFrames) {
      setTimeout(() => {
        const introScreen = document.querySelector('[data-intro]');
        if (introScreen) {
          introScreen.classList.add('ended');
          document.body.classList.remove('intro-active');
          setTimeout(() => introScreen.remove(), 1000);
        }
      }, 400);
      return;
    }

    requestAnimationFrame(animate);
  }

  animate();
};

window.initLiquidIntro = initLiquidIntro;
