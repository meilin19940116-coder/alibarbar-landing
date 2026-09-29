// 液体流动汇聚成文字动画
const initLiquidIntro = () => {
  const canvas = document.getElementById('liquid-canvas');
  const ctx = canvas.getContext('2d');

  // 设置canvas尺寸
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  // 创建文字轮廓点
  function getTextPoints(text, fontSize, x, y) {
    ctx.font = `900 ${fontSize}px Arial`;
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);

    // 获取文字像素数据
    const textWidth = ctx.measureText(text).width;
    const imageData = ctx.getImageData(x - textWidth / 2 - 20, y - fontSize / 2 - 20, textWidth + 40, fontSize + 40);
    const pixels = imageData.data;
    const points = [];

    // 采样文字边缘点
    for (let py = 0; py < imageData.height; py += 3) {
      for (let px = 0; px < imageData.width; px += 3) {
        const i = (py * imageData.width + px) * 4;
        if (pixels[i + 3] > 128) { // alpha > 128
          points.push({
            x: x - textWidth / 2 - 20 + px,
            y: y - fontSize / 2 - 20 + py
          });
        }
      }
    }

    return points;
  }

  // 清空画布，准备获取文字轮廓
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 获取"ALIBARBAR 9000"的轮廓点
  const isMobile = window.innerWidth <= 768;
  const brandSize = isMobile ? 40 : 80;
  const modelSize = isMobile ? 80 : 160;
  const gap = isMobile ? 60 : 100;

  const brandPoints = getTextPoints('ALIBARBAR', brandSize, centerX - gap, centerY);
  const modelPoints = getTextPoints('9000', modelSize, centerX + gap * 1.5, centerY);
  const textPoints = [...brandPoints, ...modelPoints];

  // 清空画布
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 粒子类
  class Particle {
    constructor(targetPoint) {
      // 从屏幕边缘随机位置开始
      const edge = Math.floor(Math.random() * 4);
      if (edge === 0) { // 上
        this.x = Math.random() * canvas.width;
        this.y = -50;
      } else if (edge === 1) { // 右
        this.x = canvas.width + 50;
        this.y = Math.random() * canvas.height;
      } else if (edge === 2) { // 下
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + 50;
      } else { // 左
        this.x = -50;
        this.y = Math.random() * canvas.height;
      }

      this.targetX = targetPoint.x;
      this.targetY = targetPoint.y;
      this.size = Math.random() * 3 + 2;
      this.opacity = 0;
      this.delay = Math.random() * 40;
      this.age = 0;
    }

    update() {
      this.age++;
      if (this.age < this.delay) return;

      const dx = this.targetX - this.x;
      const dy = this.targetY - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 2) {
        const speed = Math.min(distance * 0.05, 10);
        this.x += (dx / distance) * speed + (Math.random() - 0.5) * 0.8;
        this.y += (dy / distance) * speed + (Math.random() - 0.5) * 0.8;

        if (this.opacity < 1) this.opacity += 0.03;
      } else {
        this.x = this.targetX + (Math.random() - 0.5) * 0.5;
        this.y = this.targetY + (Math.random() - 0.5) * 0.5;
        this.opacity = 1;
      }
    }

    draw() {
      if (this.age < this.delay) return;

      ctx.save();
      ctx.globalAlpha = this.opacity;

      const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 2);
      gradient.addColorStop(0, 'rgba(255, 223, 143, 1)');
      gradient.addColorStop(0.4, 'rgba(201, 169, 97, 1)');
      gradient.addColorStop(1, 'rgba(201, 169, 97, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  // 创建粒子（每个文字点对应一个粒子）
  const particles = textPoints.map(point => new Particle(point));

  let frame = 0;
  const maxFrames = 180;

  function animate() {
    frame++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.update();
      p.draw();
    });

    // 检查是否完成
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

  animate();
};

window.initLiquidIntro = initLiquidIntro;
