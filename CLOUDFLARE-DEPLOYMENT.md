# Cloudflare Workers 斗篷系统部署指南

## ✅ 配置已完成

- **Vercel 域名**: `www.synchro-match.com`
- **主域名**: `synchro-match.com`
- **Cloudflare 状态**: 已托管
- **目标国家**: 澳洲（AU）、新西兰（NZ）

---

## 🚀 立即部署（5 分钟完成）

### 第 1 步：登录 Cloudflare

1. 打开浏览器，访问：https://dash.cloudflare.com
2. 登录你的 Cloudflare 账户
3. 确认能看到域名 `synchro-match.com`

---

### 第 2 步：创建 Worker

1. **左侧菜单** 点击：**Workers & Pages**
2. 点击右上角：**Create application**
3. 选择：**Create Worker**
4. **Worker 名称**输入：`alibarbar-cloak`
5. 点击：**Deploy**（先部署，稍后编辑代码）

---

### 第 3 步：上传斗篷代码

#### 3.1 复制代码

1. 在你的项目文件夹中，打开文件：`cloudflare-worker.js`
2. **全选复制**所有代码（Ctrl+A / Cmd+A，然后 Ctrl+C / Cmd+C）

#### 3.2 粘贴到 Cloudflare

1. Worker 部署完成后，点击：**Edit Code**
2. **删除**编辑器中的所有默认代码
3. **粘贴**你刚才复制的 `cloudflare-worker.js` 代码
4. 检查第 10 行，确认显示：
   ```javascript
   VERCEL_DOMAIN: 'www.synchro-match.com',
   ```
5. 点击右上角：**Save and Deploy**

---

### 第 4 步：绑定域名路由

#### 4.1 返回主面板

1. 点击左上角 Cloudflare 图标返回主面板
2. 或者直接访问：https://dash.cloudflare.com

#### 4.2 配置路由

1. 在域名列表中，点击：**synchro-match.com**
2. 左侧菜单找到：**Workers Routes**（在 "DNS" 下方）
3. 点击：**Add route**
4. 填写表单：
   - **Route（路由）**: `synchro-match.com/*`
   - **Worker**: 选择 `alibarbar-cloak`
5. 点击：**Save**

#### 4.3 添加 www 子域名路由

1. 再次点击：**Add route**
2. 填写表单：
   - **Route（路由）**: `www.synchro-match.com/*`
   - **Worker**: 选择 `alibarbar-cloak`
3. 点击：**Save**

**现在应该有 2 条路由：**
- `synchro-match.com/*` → `alibarbar-cloak`
- `www.synchro-match.com/*` → `alibarbar-cloak`

---

## ✅ 部署验证

### 方式 1：浏览器测试

#### 测试 1：真实用户访问
1. 打开浏览器（无痕模式）
2. 访问：`https://synchro-match.com`
3. **应该看到**：ALIBARBAR 9000 真实页面（黑金开场动画）

#### 测试 2：安全页后门
1. 访问：`https://synchro-match.com?debug_safe=test123`
2. **应该看到**：Premium Lifestyle Electronics（安全页）
3. 页面标题应该是 "ALIBARBAR - Premium Lifestyle Electronics"

#### 测试 3：真实页后门
1. 访问：`https://synchro-match.com?debug_real=alibarbar2024`
2. **应该看到**：ALIBARBAR 9000 真实页面
3. 即使是爬虫 UA，也会强制显示真实页

---

### 方式 2：命令行测试（更准确）

打开终端（Mac 终端 / Git Bash），依次执行：

```bash
# 1. 测试正常浏览器访问（应该返回真实页）
curl -s https://synchro-match.com | grep -i "9000 puffs"
# 如果看到 "9000 puffs" 就是成功 ✅

# 2. 测试 Facebook 爬虫（应该返回安全页）
curl -s -A "facebookexternalhit/1.1" https://synchro-match.com | grep -i "Premium Lifestyle"
# 如果看到 "Premium Lifestyle" 就是成功 ✅

# 3. 测试 Google 爬虫（应该返回安全页）
curl -s -A "Googlebot/2.1" https://synchro-match.com | grep -i "Premium Lifestyle"
# 如果看到 "Premium Lifestyle" 就是成功 ✅

# 4. 测试 TikTok 爬虫（应该返回安全页）
curl -s -A "Bytespider/1.0" https://synchro-match.com | grep -i "Premium Lifestyle"
# 如果看到 "Premium Lifestyle" 就是成功 ✅

# 5. 测试安全页后门
curl -s "https://synchro-match.com?debug_safe=test123" | grep -i "Premium Lifestyle"
# 如果看到 "Premium Lifestyle" 就是成功 ✅

# 6. 测试真实页后门
curl -s "https://synchro-match.com?debug_real=alibarbar2024" | grep -i "9000 puffs"
# 如果看到 "9000 puffs" 就是成功 ✅
```

**如果所有测试都通过，恭喜！斗篷系统部署成功！🎉**

---

## 📊 查看实时日志

### 开启日志流

1. 回到 Cloudflare Dashboard
2. 进入：**Workers & Pages** → 点击 `alibarbar-cloak`
3. 点击顶部的：**Logs** 标签
4. 点击：**Begin log stream**
5. 保持页面打开

### 测试日志输出

1. 在另一个浏览器窗口访问：`https://synchro-match.com`
2. 回到日志页面，应该看到类似输出：

```json
{
  "Detection Signals": {
    "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...",
    "country": "AU",
    "asn": 12345,
    "referer": ""
  },
  "Decision": {
    "page": "REAL",
    "reason": "通过验证，展示真实内容",
    "riskScore": 30
  }
}
```

3. 用爬虫 UA 测试：
```bash
curl -A "facebookexternalhit/1.1" https://synchro-match.com
```

4. 日志应该显示：
```json
{
  "Decision": {
    "page": "SAFE",
    "reason": "检测到风险，展示安全页面",
    "riskScore": 100
  }
}
```

---

## 🎯 广告投放前的配置调整

### 场景 1：刚提交广告（前 7 天）

**需要开启宽松模式，让审核机器人更容易通过：**

1. 回到 Cloudflare Workers 编辑器
2. 找到第 25 行，修改：
```javascript
REVIEW_MODE: false,  // 改成 true
```

3. 改为：
```javascript
REVIEW_MODE: true,  // 开启宽松模式
```

4. 点击：**Save and Deploy**

**宽松模式的作用：**
- 提高风险阈值（150 分才判定为爬虫，而非 60 分）
- 让更多流量看到安全页，降低被拒风险
- 适合广告审核期

---

### 场景 2：广告通过审核后（7 天后）

**需要关闭宽松模式，让真实用户看到真实页：**

1. 回到 Cloudflare Workers 编辑器
2. 找到第 25 行，修改：
```javascript
REVIEW_MODE: true,  // 改回 false
```

3. 改为：
```javascript
REVIEW_MODE: false,  // 关闭宽松模式
```

4. 点击：**Save and Deploy**

**正常模式的作用：**
- 降低风险阈值（60 分以上判定为爬虫）
- 让 60-80% 的真实用户看到真实页
- 提高转化率

---

## 📈 监控与优化

### 每日检查清单

**早上（开始投放前）：**
- [ ] 访问 `https://synchro-match.com` 确认可访问
- [ ] 测试后门 `?debug_safe=test123` 和 `?debug_real=alibarbar2024`
- [ ] 检查 Cloudflare Workers 状态（Dashboard → Workers & Pages）
- [ ] 查看昨日日志，统计安全页 vs 真实页比例

**下午（投放中）：**
- [ ] 开启日志流，观察实时流量
- [ ] 检查广告账户是否有警告
- [ ] 查看 WhatsApp 咨询量

**晚上（总结）：**
- [ ] 导出 Workers 日志（如果可用）
- [ ] 记录当天数据：点击、咨询、转化
- [ ] 如有异常，调整配置

### 关键指标

| 指标 | 正常范围 | 异常阈值 | 处理方式 |
|------|---------|---------|---------|
| 安全页流量占比 | 20-40% | >60% | 放宽判断规则 |
| 真实页流量占比 | 60-80% | <40% | 检查是否误判 |
| 广告 CTR | 2-5% | <1% | 优化素材 |
| WhatsApp 咨询率 | 3-8% | <2% | 优化落地页 |
| 账户状态 | Active | Warning/Disabled | 立即应对 |

---

## 🆘 常见问题

### Q1：所有人都看到安全页怎么办？

**原因：** 判断规则太严格

**解决：**
1. 打开 Cloudflare Workers 编辑器
2. 找到 `makeDecision` 函数（大约在第 200 行）
3. 找到这一行：
```javascript
const threshold = CONFIG.REVIEW_MODE ? 150 : 60;
```
4. 改为：
```javascript
const threshold = CONFIG.REVIEW_MODE ? 150 : 100;
```
5. 保存并部署

---

### Q2：爬虫看到真实页怎么办？

**原因：** 有新的爬虫 UA 没被识别

**解决：**
1. 查看 Workers 日志，找到该请求的 User-Agent
2. 在 `CRAWLER_PATTERNS` 数组中添加新规则：
```javascript
const CRAWLER_PATTERNS = [
  // ... 原有的
  /新的爬虫UA特征/i,
];
```
3. 保存并部署

---

### Q3：广告被拒怎么办？

**处理步骤：**
1. **不要立即重新提交**，等 24-48 小时
2. 开启 `REVIEW_MODE: true`
3. 检查 Workers 日志，看审核机器人是否看到了安全页
4. 如果看到真实页，说明特征库需要更新
5. 优化广告素材（更生活化，避免敏感词）
6. 48 小时后重新提交

---

### Q4：如何临时关闭斗篷？

**场景：** 需要维护或测试

**方法 1：让所有人看安全页**
```javascript
// 在 handleRequest 函数开头添加
return fetchPage(request, 'SAFE', '临时维护');
```

**方法 2：让所有人看真实页**
```javascript
// 在 handleRequest 函数开头添加
return fetchPage(request, 'REAL', '临时关闭斗篷');
```

**方法 3：完全移除 Workers**
1. Cloudflare Dashboard
2. 选择域名 `synchro-match.com`
3. Workers Routes
4. 删除所有路由
5. 域名会直接指向 Vercel

---

## 🎉 部署完成

如果所有测试都通过，你现在可以：

1. ✅ **开始准备广告素材**（见下一部分）
2. ✅ **配置 WhatsApp 号码**（见 README.md）
3. ✅ **小预算测试投放**（$20-50/天）

---

## 📞 需要帮助？

**保存这些后门链接，方便随时测试：**

- 真实页后门：`https://synchro-match.com?debug_real=alibarbar2024`
- 安全页后门：`https://synchro-match.com?debug_safe=test123`

**重要提醒：**
- 不要把后门链接发给别人
- 不要在广告中使用后门链接
- 后门仅供自己测试使用
