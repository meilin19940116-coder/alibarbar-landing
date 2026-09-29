// 液体粒子汇聚开场动画
const initLiquidIntro = () => {
  const canvas = document.getElementById('liquid-canvas');
  const ctx = canvas.getContext('2d');
  const logo = document.querySelector('[data-intro-logo]');
  const text = document.querySelector('[data-intro-text]');

  // 设置canvas尺寸
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // 粒子数组
  const particles = [];
  const particleCount = 200; // 200个金色粒子
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  // 粒子类
  class Particle {
    constructor() {
      // 从四周随机位置开始
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

      // 目标点（中心附近随机）
      this.targetX = centerX + (Math.random() - 0.5) * 400;
      this.targetY = centerY + (Math.random() - 0.5) * 200;

      // 当前速度
      this.vx = 0;
      this.vy = 0;

      // 大小和透明度
      this.size = Math.random() * 4 + 2;
      this.opacity = 0;

      // 延迟出现
      this.delay = Math.random() * 30;
      this.age = 0;
    }

    update() {
      this.age++;
      if (this.age < this.delay) return;

      // 计算到目标的方向
      const dx = this.targetX - this.x;
      const dy = this.targetY - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 5) {
        // 流体效果：速度逐渐加快，接近目标时减速
        const speed = Math.min(distance * 0.03, 8);
        this.vx = (dx / distance) * speed;
        this.vy = (dy / distance) * speed;

        // 添加液体波动效果
        this.vx += (Math.random() - 0.5) * 0.5;
        this.vy += (Math.random() - 0.5) * 0.5;

        this.x += this.vx;
        this.y += this.vy;

        // 透明度渐增
        if (this.opacity < 1) this.opacity += 0.02;
      } else {
        // 到达目标，轻微波动
        this.x += (Math.random() - 0.5) * 0.3;
        this.y += (Math.random() - 0.5) * 0.3;
        this.opacity = 1;
      }
    }

    draw() {
      if (this.age < this.delay) return;

      ctx.save();
      ctx.globalAlpha = this.opacity;

      // 金色渐变
      const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
      gradient.addColorStop(0, 'rgba(255, 223, 143, 1)');
      gradient.addColorStop(0.5, 'rgba(201, 169, 97, 1)');
      gradient.addColorStop(1, 'rgba(201, 169, 97, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  // 创建粒子
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  let frame = 0;
  const maxFrames = 150; // 动画总帧数（约2.5秒）

  // 动画循环
  function animate() {
    frame++;

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 更新和绘制粒子
    particles.forEach(p => {
      p.update();
      p.draw();
    });

    // 检查是否所有粒子都到达
    const allArrived = particles.every(p => {
      const dx = p.targetX - p.x;
      const dy = p.targetY - p.y;
      return Math.sqrt(dx * dx + dy * dy) < 10;
    });

    // 粒子汇聚后显示文字
    if (frame > 90) {
      if (logo) {
        logo.style.opacity = Math.min((frame - 90) / 30, 1);
      }
      if (text) {
        text.style.opacity = Math.min((frame - 100) / 30, 1);
      }
    }

    // 动画结束
    if (frame >= maxFrames || allArrived && frame > 120) {
      // 停止动画，触发结束
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

  // 启动动画
  animate();
};

// 导出
window.initLiquidIntro = initLiquidIntro;
