// 金色液体流动汇聚成文字动画
const initLiquidIntro = () => {
  const canvas = document.getElementById('liquid-canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  // 液体流类 - 像水流一样
  class LiquidStream {
    constructor(targetText, fontSize, targetX, targetY, delay) {
      this.targetText = targetText;
      this.fontSize = fontSize;
      this.targetX = targetX;
      this.targetY = targetY;
      this.delay = delay;

      // 从左边屏幕外开始
      this.x = -300;
      this.y = targetY + (Math.random() - 0.5) * 100;

      this.progress = 0;
      this.opacity = 0;
      this.width = 0;
      this.started = false;
    }

    update(frame) {
      if (frame < this.delay) return;

      if (!this.started) {
        this.started = true;
      }

      // 液体流动进度
      if (this.progress < 1) {
        this.progress += 0.015;
        this.x = -300 + (this.targetX + 300) * this.easeOut(this.progress);
        this.opacity = Math.min(this.progress * 2, 1);
        this.width = Math.min(this.progress * 300, 200);
      } else {
        // 到达目标，开始凝固成文字
        this.opacity = 1;
      }
    }

    easeOut(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    draw() {
      if (!this.started) return;

      ctx.save();
      ctx.globalAlpha = this.opacity;

      if (this.progress < 1) {
        // 绘制流动的液体
        const gradient = ctx.createLinearGradient(this.x - this.width, this.y, this.x, this.y);
        gradient.addColorStop(0, 'rgba(201, 169, 97, 0)');
        gradient.addColorStop(0.3, 'rgba(201, 169, 97, 0.6)');
        gradient.addColorStop(0.7, 'rgba(255, 223, 143, 1)');
        gradient.addColorStop(1, 'rgba(201, 169, 97, 1)');

        ctx.fillStyle = gradient;

        // 波浪形状
        ctx.beginPath();
        ctx.moveTo(this.x - this.width, this.y - 30);

        for (let i = 0; i <= this.width; i += 10) {
          const waveY = this.y + Math.sin((i + Date.now() * 0.01) * 0.1) * 8;
          ctx.lineTo(this.x - this.width + i, waveY);
        }

        for (let i = this.width; i >= 0; i -= 10) {
          const waveY = this.y + 30 + Math.sin((i + Date.now() * 0.01 + Math.PI) * 0.1) * 8;
          ctx.lineTo(this.x - this.width + i, waveY);
        }

        ctx.closePath();
        ctx.fill();

        // 发光效果
        ctx.shadowBlur = 30;
        ctx.shadowColor = 'rgba(201, 169, 97, 0.8)';
        ctx.fill();
        ctx.shadowBlur = 0;

      } else {
        // 凝固成文字
        ctx.font = `900 ${this.fontSize}px Arial`;
        ctx.fillStyle = '#c9a961';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // 发光效果
        ctx.shadowBlur = 40;
        ctx.shadowColor = 'rgba(201, 169, 97, 1)';
        ctx.fillText(this.targetText, this.targetX, this.targetY);
        ctx.shadowBlur = 0;
      }

      ctx.restore();
    }
  }

  // 创建液体流
  const isMobile = window.innerWidth <= 768;
  const brandSize = isMobile ? 50 : 90;
  const modelSize = isMobile ? 90 : 170;

  const streams = [
    new LiquidStream('ALIBARBAR', brandSize, centerX - 100, centerY - 20, 0),
    new LiquidStream('9000', modelSize, centerX + 150, centerY + 20, 30)
  ];

  let frame = 0;
  const maxFrames = 200;

  function animate() {
    frame++;

    // 半透明清除，产生拖尾效果
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    streams.forEach(stream => {
      stream.update(frame);
      stream.draw();
    });

    if (frame >= maxFrames) {
      setTimeout(() => {
        const introScreen = document.querySelector('[data-intro]');
        if (introScreen) {
          introScreen.classList.add('ended');
          document.body.classList.remove('intro-active');
          setTimeout(() => introScreen.remove(), 1000);
        }
      }, 500);
      return;
    }

    requestAnimationFrame(animate);
  }

  // 黑色背景
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  animate();
};

window.initLiquidIntro = initLiquidIntro;
