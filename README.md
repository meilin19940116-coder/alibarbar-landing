# ALIBARBAR 独立落地页

这是一个独立的静态广告落地页，不依赖 Shopyy 主题运行。Shopyy 继续负责商品、购物车、订单和支付，落地页通过购买按钮跳转到whatsapp私域转化

## 本地预览

直接双击 `index.html` 可以查看静态页面；如果浏览器限制本地资源，可在此目录启动任意静态文件服务器。

进站时按视口宽度选择一份视频，静音播放一次；结束后首页顶部使用对应的静态背景图，不循环播放。

| 使用范围 | 开场视频 | 首页背景及开场海报 |
|---|---|---|
| 手机布局（宽度 ≤ 768px） | `assets/alibarbar手机.mp4` | `assets/背景图手机端.png` |
| 电脑布局（宽度 > 768px） | `assets/alibarbar电脑.mp4` | `assets/背景图电脑.png` |

视频失败或自动播放被拦截时，显示对应背景图并解除开场层；页面不依赖视频才能展示。窗口缩放或手机旋转会自动切换背景图，不重新播放开场。修改文件名时，同步更新 `index.html` 的 `data-*-src` / `data-*-poster` 和 `styles.css` 的 `--hero-poster`；两处宽度断点保持一致。

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
