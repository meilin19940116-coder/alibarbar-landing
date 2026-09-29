# ALIBARBAR 独立落地页

这是一个独立的静态广告落地页，不依赖 Shopyy 主题运行。Shopyy 继续负责商品、购物车、订单和支付，落地页通过购买按钮跳转到 Shopyy。

## 本地预览

直接双击 `index.html` 可以查看静态页面；如果浏览器限制本地资源，可在此目录启动任意静态文件服务器。

首屏背景使用 `assets/intro-poster.jpg`（从 `intro-video.mp4` 的尾帧制作）。手机端直接显示这张图；桌面端播放开场视频，视频加载失败时也会显示图片。以后替换视频时，请同步更新海报图，避免首屏展示旧画面。

## 修改购买链接

编辑 `script.js` 顶部的 `SHOP_URL`，替换成最终的 Shopyy 商品页或集合页地址。

## 部署到 Vercel

1. 在 GitHub 新建一个独立仓库，例如 `alibarbar-landing`。
2. 上传本目录全部文件。
3. 登录 Vercel，选择 **Add New Project**，导入这个 GitHub 仓库。
4. Framework Preset 选择 `Other`，Build Command 留空，Output Directory 使用项目根目录。
5. 点击 Deploy。Vercel 会分配一个 `*.vercel.app` 地址，不需要先购买域名。
6. 页面验证完成后，再决定是否绑定自己的域名。

## 上线前待办

- 用真实产品透明图替换 CSS 产品占位视觉。
- 把 `SHOP_URL` 换成最终商品地址。
- 根据投放地区确认年龄门槛、文案和平台合规要求。
- 在 `script.js` 的 `track` 事件上接入 Meta、TikTok 或其他投放平台像素。
