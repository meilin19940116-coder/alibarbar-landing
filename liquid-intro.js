// 优雅简洁的粒子汇聚开场动画
const initLiquidIntro = () => {
  const canvas = document.getElementById('liquid-canvas');
  const ctx = canvas.getContext('2d');

  // 固定canvas尺寸，防止跳动
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  let frame = 0;
  const maxFrames = 90;

  const isMobile = window.innerWidth <= 768;
  const brandSize = isMobile ? 36 : 85;
  const modelSize = isMobile ? 72 : 160;
  const spacing = isMobile ? 35 : 65;

  // 创建粒子系统
  const particles = [];
  const particleCount = isMobile ? 80 : 150;

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 1,
      delay: Math.random() * 20
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

    // 阶段1：粒子汇聚 (0-40帧)
    if (frame <= 40) {
      particles.forEach((p) => {
        if (frame > p.delay) {
          const localProgress = Math.min((frame - p.delay) / 35, 1);
          const eased = easeOutCubic(localProgress);

          const currentX = p.x + (centerX - p.x) * eased;
          const currentY = p.y + (centerY - p.y) * eased;

          ctx.fillStyle = `rgba(201, 169, 97, ${0.4 + localProgress * 0.4})`;
          ctx.shadowBlur = 6;
          ctx.shadowColor = 'rgba(201, 169, 97, 0.5)';
          ctx.beginPath();
          ctx.arc(currentX, currentY, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    }

    // 阶段2：光爆 + 文字显现 (30-80帧)
    if (frame >= 30) {
      const textProgress = Math.min((frame - 30) / 50, 1);
      const eased = easeOutCubic(textProgress);

      // 中心光晕
      if (frame < 55) {
        const glowProgress = (frame - 30) / 25;
        const glowRadius = glowProgress * 350;
        const glowGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, glowRadius);
        glowGradient.addColorStop(0, `rgba(255, 223, 143, ${0.25 * (1 - glowProgress)})`);
        glowGradient.addColorStop(0.6, `rgba(201, 169, 97, ${0.1 * (1 - glowProgress)})`);
        glowGradient.addColorStop(1, 'rgba(201, 169, 97, 0)');
        ctx.fillStyle = glowGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // 文字渲染
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.filter = `blur(${(1 - eased) * 6}px)`;
      ctx.globalAlpha = eased;

      // ALIBARBAR
      ctx.font = `300 ${brandSize}px Arial, sans-serif`;

      const brandGradient = ctx.createLinearGradient(
        centerX - 250, centerY - spacing,
        centerX + 250, centerY - spacing
      );
      brandGradient.addColorStop(0, 'rgba(201, 169, 97, 0.8)');
      brandGradient.addColorStop(0.5, 'rgba(255, 255, 255, 1)');
      brandGradient.addColorStop(1, 'rgba(201, 169, 97, 0.8)');

      ctx.fillStyle = brandGradient;
      ctx.shadowBlur = 15;
      ctx.shadowColor = 'rgba(201, 169, 97, 0.3)';
      ctx.fillText('ALIBARBAR', centerX, centerY - spacing);

      // 9000
      ctx.font = `900 ${modelSize}px Arial, sans-serif`;

      const modelGradient = ctx.createLinearGradient(
        centerX - 350, centerY + spacing,
        centerX + 350, centerY + spacing
      );
      modelGradient.addColorStop(0, '#c9a961');
      modelGradient.addColorStop(0.35, '#ffd88f');
      modelGradient.addColorStop(0.5, '#ffffff');
      modelGradient.addColorStop(0.65, '#ffd88f');
      modelGradient.addColorStop(1, '#c9a961');

      ctx.fillStyle = modelGradient;
      ctx.shadowBlur = 25;
      ctx.shadowColor = 'rgba(201, 169, 97, 0.6)';
      ctx.fillText('9000', centerX, centerY + spacing);

      ctx.restore();
    }

    if (frame >= maxFrames) {
      setTimeout(() => {
        const introScreen = document.querySelector('[data-intro]');
        if (introScreen) {
          introScreen.classList.add('ended');
          document.body.classList.remove('intro-active');
          setTimeout(() => introScreen.remove(), 800);
        }
      }, 300);
      return;
    }

    requestAnimationFrame(animate);
  }

  animate();
};

window.initLiquidIntro = initLiquidIntro;
