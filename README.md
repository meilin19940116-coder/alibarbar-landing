# ALIBARBAR 独立落地页

这是一个独立的静态广告落地页，不依赖 Shopyy 主题运行。页面负责品牌展示和广告承接，商品、购物车、订单和支付仍由 Shopyy 负责。

## 首页视频

首页右侧会优先播放 `assets/hero-loop.mp4`。视频加载失败、用户开启“减少动态效果”或文件暂时不存在时，会自动回退到 CSS 产品视觉，不会留下空白首屏。

- 文件名固定为 `assets/hero-loop.mp4`。
- 建议使用静音、横向 MP4；视频首帧应可独立观看。
- 目前仓库内的视频约 4 MB，适合先做预览；正式投放前再根据手机网络测试加载速度。

## 本地预览

直接双击 `index.html` 可以查看静态页面；如果浏览器限制本地资源，可在此目录启动任意静态文件服务器。

## 修改购买链接

当前按钮仍使用 `script.js` 顶部的 `SHOP_URL` 作为临时跳转。若最终页面只保留 WhatsApp 咨询，应在拿到最终号码后统一替换为 WhatsApp 链接，并同步更新按钮文案、FAQ 和事件名称。

## 部署到 Vercel

1. 在 GitHub 新建一个独立仓库，例如 `alibarbar-landing`。
2. 上传本目录全部文件。
3. 登录 Vercel，选择 **Add New Project**，导入这个 GitHub 仓库。
4. Framework Preset 选择 `Other`，Build Command 留空，Output Directory 使用项目根目录。
5. 点击 Deploy。Vercel 会分配一个 `*.vercel.app` 地址，不需要先购买域名。
6. 页面验证完成后，再决定是否绑定自己的域名。

## 上线前待办

- 用真实产品透明图替换 CSS 产品占位视觉（视频加载失败时的回退画面）。
- 提供最终 WhatsApp 号码并把所有临时 `SHOP_URL` 按钮改为咨询入口。
- 用真实产品资料替换示例口味和描述。
- 根据投放地区确认年龄门槛、文案和平台合规要求。
- 在 `script.js` 的 `track` 事件上接入 Meta、TikTok 或其他投放平台像素。
