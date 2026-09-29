// 金色光束扫描开场动画
const initLiquidIntro = () => {
  const canvas = document.getElementById('liquid-canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  let frame = 0;
  const maxFrames = 150;

  const isMobile = window.innerWidth <= 768;
  const brandSize = isMobile ? 45 : 85;
  const modelSize = isMobile ? 90 : 170;

  function animate() {
    frame++;

    // 黑色背景
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const progress = frame / maxFrames;

    // 阶段1：光束从左到右扫描 (0-40帧)
    if (frame < 40) {
      const scanProgress = frame / 40;
      const scanX = canvas.width * scanProgress;

      // 垂直光束
      const gradient = ctx.createLinearGradient(scanX - 100, 0, scanX + 100, 0);
      gradient.addColorStop(0, 'rgba(201, 169, 97, 0)');
      gradient.addColorStop(0.5, 'rgba(255, 223, 143, 0.8)');
      gradient.addColorStop(1, 'rgba(201, 169, 97, 0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(scanX - 100, 0, 200, canvas.height);

      // 光束扫过后留下金色粒子
      for (let i = 0; i < 20; i++) {
        const x = scanX + (Math.random() - 0.5) * 200;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 3 + 1;

        ctx.fillStyle = `rgba(201, 169, 97, ${Math.random() * 0.6})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 阶段2：文字逐渐显现 (40-100帧)
    if (frame >= 40) {
      const textProgress = Math.min((frame - 40) / 60, 1);

      // ALIBARBAR
      ctx.save();
      ctx.font = `900 ${brandSize}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // 从模糊到清晰
      ctx.filter = `blur(${(1 - textProgress) * 20}px)`;
      ctx.globalAlpha = textProgress;

      // 金色渐变
      const textGradient = ctx.createLinearGradient(
        centerX - 300, centerY - 50,
        centerX + 300, centerY + 50
      );
      textGradient.addColorStop(0, '#c9a961');
      textGradient.addColorStop(0.5, '#ffd88f');
      textGradient.addColorStop(1, '#c9a961');

      ctx.fillStyle = textGradient;
      ctx.shadowBlur = 40 * textProgress;
      ctx.shadowColor = 'rgba(201, 169, 97, 1)';

      ctx.fillText('ALIBARBAR', centerX, centerY - 30);

      // 9000
      ctx.font = `900 ${modelSize}px Arial`;
      ctx.fillText('9000', centerX, centerY + 60);

      ctx.restore();
    }

    // 阶段3：环绕粒子效果 (60帧后)
    if (frame >= 60) {
      const particleCount = 30;
      const radius = 300;
      const rotation = frame * 0.02;

      for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2 + rotation;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * (radius * 0.5);
        const size = 2 + Math.sin(frame * 0.1 + i) * 1;
        const opacity = 0.3 + Math.sin(frame * 0.05 + i) * 0.2;

        ctx.fillStyle = `rgba(201, 169, 97, ${opacity})`;
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(201, 169, 97, 0.8)';
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (frame >= maxFrames) {
      setTimeout(() => {
        const introScreen = document.querySelector('[data-intro]');
        if (introScreen) {
          introScreen.classList.add('ended');
          document.body.classList.remove('intro-active');
          setTimeout(() => introScreen.remove(), 1000);
        }
      }, 300);
      return;
    }

    requestAnimationFrame(animate);
  }

  animate();
};

window.initLiquidIntro = initLiquidIntro;
