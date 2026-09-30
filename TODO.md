# 📋 项目待办清单

## 🎯 当前状态

**项目进度：** 80% 完成

**已完成：**
- ✅ Cloudflare Workers 斗篷系统（生产版）
- ✅ 白页（蓝牙耳机）设计完成
- ✅ 黑页（ALIBARBAR 9000）完成
- ✅ 图片素材准备完成
- ✅ 代码已推送并部署

**待完成：**
- ⏳ 安装像素代码
- ⏳ 配置 WhatsApp 号码
- ⏳ 开始投放广告

---

## 📝 立即要做的事

### 1. 安装像素代码（等广告户准备好）

**需要的信息：**
- [ ] 广告平台（Facebook / TikTok / 都用）
- [ ] 像素 ID

**操作步骤：**
1. 在 `index.html`（黑页）安装完整像素 + 转化追踪
2. 在 `safe.html`（白页）安装基础像素（只 PageView）
3. 测试像素是否正常触发
4. 推送到 GitHub

**参考文档：** 项目中没有像素安装指南，需要时重新生成

---

### 2. 配置 WhatsApp 号码

**当前状态：** 未配置（默认号码）

**操作步骤：**
1. 打开 `index.html`
2. 搜索 `wa.me`
3. 替换为你的澳洲 WhatsApp 号码
   ```html
   <a href="https://wa.me/61412345678?text=Hi%2C%20interested%20in%20ALIBARBAR%209000">
   ```
4. 推送到 GitHub

---

### 3. 测试验证

**测试清单：**

**Cloudflare Workers 测试：**
- [ ] 澳洲 IP 访问 → 看到黑页（ALIBARBAR 9000）
- [ ] 其他国家 IP 访问 → 看到白页（蓝牙耳机）
- [ ] 测试后门 `?debug=alibar2024` → 强制黑页
- [ ] 测试后门 `?safe=alibar2024` → 强制白页

**爬虫测试：**
```bash
# Facebook 爬虫应该看到白页
curl -A "facebookexternalhit/1.1" https://synchro-match.com | grep "Wireless Earbuds"

# Google 爬虫应该看到白页
curl -A "Googlebot" https://synchro-match.com | grep "Wireless Earbuds"

# TikTok 爬虫应该看到白页
curl -A "Bytespider" https://synchro-match.com | grep "Wireless Earbuds"
```

**图片测试：**
- [ ] 白页 3 张耳机图片正常显示
- [ ] 黑页 ALIBARBAR 9000 视频正常播放

---

## 🚀 投放准备

### 广告素材准备

**已有素材：**
- ✅ `assets/scene-nightlife-*.png`（夜生活场景，7 张）
- ✅ `assets/scene-lifestyle-*.png`（生活方式场景，4 张）

**推荐使用：**
- `scene-nightlife-1.png`
- `scene-nightlife-2.png`
- `scene-nightlife-3.png`

**文案模板：**

**主标题（选 3 条）：**
- "Elevate Your Sydney Lifestyle"
- "Premium Experience Delivered"
- "Join the Community"

**广告正文（选 2 条）：**
```
Discover premium lifestyle experience. 
Sydney delivery available.
👉 Shop now
```

```
Join thousands of Sydney locals who've upgraded their experience.
Premium quality, delivered to your door.
👉 Explore now
```

**避免敏感词：**
- ❌ "9000 puffs"
- ❌ "vape"
- ❌ "e-cigarette"
- ❌ "smoking"
- ❌ "nicotine"

---

### 投放策略

**第 1 周（审核期）：**
- 预算：$30-50/天
- 目标：通过审核
- 素材：生活方式场景（不要产品特写）

**第 2 周（测试期）：**
- 预算：$50-100/天
- 目标：测试转化
- 开始有 WhatsApp 咨询

**第 3-4 周（稳定期）：**
- 预算：$100-200/天
- 目标：规模化
- 优化表现好的素材

---

## 🔧 技术配置

### Cloudflare Workers

**当前配置：**
- 文件：`cloudflare-worker-final.js`
- 模式：生产版
- 国家限制：澳洲/新西兰
- 测试后门：`alibar2024`

**Workers 判断规则：**
- 爬虫 UA → 白页
- 非澳洲/新西兰 IP → 白页
- 机房 ASN → 白页
- 澳洲/新西兰真实用户 → 黑页
- 静态资源（图片、CSS、JS）→ 直接放行

**部署位置：**
- Cloudflare Dashboard → Workers & Pages → `alibarbar-cloak`

---

### Vercel 部署

**自动部署：**
- GitHub 仓库：`meilin19940116-coder/alibarbar-landing`
- 分支：`master`
- 域名：`www.synchro-match.com`

**推送流程：**
```bash
git add -A
git commit -m "your message"
git push origin master
```

等待 30 秒，Vercel 自动部署完成。

---

## 📂 项目文件结构

```
.
├── index.html                     # 黑页（ALIBARBAR 9000）
├── safe.html                      # 白页（蓝牙耳机）
├── cloudflare-worker-final.js     # 生产版 Workers 代码
├── README.md                      # 项目说明
├── TODO.md                        # 本待办清单
├── assets/
│   ├── earbuds-pro.jpg           # 耳机图片 1
│   ├── earbuds-sport.jpg         # 耳机图片 2
│   ├── earbuds-mini.jpg          # 耳机图片 3
│   ├── scene-nightlife-*.png     # 广告素材（夜生活）
│   └── scene-lifestyle-*.png     # 广告素材（生活方式）
├── script.js                      # 黑页 JS
├── effects.js                     # 特效 JS
├── smoke-background.js            # 烟雾背景
└── brand-intro.js                 # 品牌动画
```

---

## 🐛 常见问题

### Q1：白页图片显示不出来？

**原因：** Workers 拦截了图片请求

**解决：** 确认 Workers 代码中有这段（第 42-50 行）：
```javascript
// 放行静态资源
if (url.pathname.match(/\.(css|js|jpg|jpeg|png|gif|svg)$/i)) {
  return fetch(request);
}

// 放行 assets 文件夹
if (url.pathname.startsWith('/assets/')) {
  return fetch(request);
}
```

---

### Q2：所有人都看到白页？

**原因 1：** 你的 IP 不在澳洲/新西兰

**解决：** 用测试后门 `?debug=alibar2024`

**原因 2：** Workers 配置错误

**解决：** 检查 `CONFIG.COUNTRY_CHECK = true` 和 `ALLOWED_COUNTRIES = ['AU', 'NZ']`

---

### Q3：广告被拒怎么办？

**处理步骤：**
1. 不要立即重新提交（等 24-48 小时）
2. 检查 Workers 日志，确认爬虫看到白页
3. 优化素材（更生活化，避免产品特写）
4. 优化文案（避免敏感词）
5. 48 小时后重新提交

---

## 📞 重要信息

**测试后门：**
- 强制黑页：`https://synchro-match.com?debug=alibar2024`
- 强制白页：`https://synchro-match.com?safe=alibar2024`

**Cloudflare Dashboard：**
- https://dash.cloudflare.com
- Workers & Pages → `alibarbar-cloak`

**GitHub 仓库：**
- https://github.com/meilin19940116-coder/alibarbar-landing

**域名：**
- https://www.synchro-match.com

---

## 🎯 下次对话开始时

**告诉 AI：**
1. 查看 `TODO.md` 文件
2. 当前待完成：安装像素代码、配置 WhatsApp、投放广告
3. 需要什么帮助

**AI 会：**
1. 读取待办清单
2. 了解当前进度
3. 继续完成剩余任务

---

**最后更新：** 2024-09-30  
**项目状态：** 待安装像素代码  
**下一步：** 等广告户准备好，安装像素
