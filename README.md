# ALIBARBAR 独立落地页

这是一个独立的静态展示页，不依赖 Shopyy 主题运行。页面不展示固定价格，询价按钮引导访客通过 WhatsApp 联系。

## 本地预览

直接双击 `index.html` 可以查看静态页面；如果浏览器限制本地资源，可在此目录启动任意静态文件服务器。

## Cinematic Brand Intro

开场是独立的 CSS / JavaScript 渐进增强组件：深黑 `#050505`、香槟金 `#D6AE55`，默认 2.05 秒。细金线与弱光晕出现后，品牌字母收拢显现、品牌上移与 9000 显现、高光和光幕扩展，最后淡出。全部动画只改变 transform / opacity，不使用 Canvas、WebGL、视频或动画库。移动端减小字母位移、关闭独立光晕并降低光幕强度。

### 组件位置与配置

- `index.html`：head 引入组件资源，body 开头的 `template[data-brand-intro-template]` 保存开场结构，不改变 Hero 和正文。
- `brand-intro.css`：命名隔离的外观与四阶段动画；通过 `--intro-duration`、`--intro-gold`、`--intro-background` 调整时长和颜色。建议时长保持 1.8～2.2 秒。
- `brand-intro.js`：启动条件、动画结束清理、异常降级与固定 2500ms 兜底；独立于首页业务脚本。
- **关闭开场**：将 template 的 `data-enabled="true"` 改成 `data-enabled="false"`，无需改动首页脚本。

### 加载与失败行为

首页始终正常渲染，不锁定 body 滚动，不等待图片或视频。组件样式用 preload + 非屏幕 media 加载，不阻塞首页首帧；只有样式已到达、页面尚未显示内容时才启用。组件资源较晚到达时直接跳过，避免首页已显示后又被遮住。

无 JavaScript 时 template 不会显示；组件 CSS 缺失、动画禁用或启动异常时不显示遮罩。正常结束自动销毁，动画取消、页面离开、切入后台或用户滚动/触摸/按键时提前销毁；即使结束事件丢失，也有 2.5 秒 JavaScript 兜底。开启 prefers-reduced-motion 时直接展示首页，也支持运行中切换该偏好。

带锚点进入、恢复已有滚动位置或页面已经绘制完成时不重放开场。Hero 继续使用原有响应式背景：宽度 ≤ 768px 为 `assets/背景图手机端.png`，其余为 `assets/背景图电脑.png`。开场不会写入 Hero 的行内样式，也不再引用旧的 `liquid-intro.js`。

### 回归检查

运行 `node --test tests/brand-intro.test.cjs`，检查正常结束、动画事件缺失、CSS 不可用、减少动态效果、页面恢复及监听器清理。桌面与手机视觉、浏览器实际降级检查的结果和未验证范围记录在开发日志中。

## 修改联系链接

在 `index.html` 中将四处 `https://wa.me/` 替换成完整的商家 WhatsApp 链接（国际区号加号码，不含 `+` 或空格）。当前链接尚无号码，上线前必须补全并逐个测试。

## 部署到 Vercel

1. 在 GitHub 新建一个独立仓库，例如 `alibarbar-landing`。
2. 上传本目录全部文件。
3. 登录 Vercel，选择 **Add New Project**，导入这个 GitHub 仓库。
4. Framework Preset 选择 `Other`，Build Command 留空，Output Directory 使用项目根目录。
5. 点击 Deploy。Vercel 会分配一个 `*.vercel.app` 地址，不需要先购买域名。
6. 页面验证完成后，再决定是否绑定自己的域名。

## 上线前待办

- 用真实产品透明图替换 CSS 产品占位视觉。
- 补全四处 WhatsApp 链接并测试。
- 根据投放地区确认年龄门槛、文案和平台合规要求。
- 在 `script.js` 的 `track` 事件上接入 Meta、TikTok 或其他投放平台像素。
