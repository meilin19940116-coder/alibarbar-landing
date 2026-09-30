# ALIBARBAR Landing Page

## 项目说明

ALIBARBAR 9000 产品落地页，配合 Cloudflare Workers 斗篷系统。

## 部署架构

- **GitHub**: 代码仓库
- **Vercel**: 自动部署（www.synchro-match.com）
- **Cloudflare Workers**: 斗篷系统（判断用户身份）

## 文件说明

- `index.html`: 真实落地页（ALIBARBAR 9000）
- `safe.html`: 安全审核页（金属打火机商店）
- `cloudflare-worker-final.js`: 生产环境 Workers 代码

## Workers 部署

1. 访问 Cloudflare Dashboard
2. Workers & Pages → alibarbar-cloak
3. 复制 `cloudflare-worker-final.js` 代码
4. Edit Code → 粘贴 → Save and Deploy

## 测试后门

- 强制黑页: `?debug=alibar2024`
- 强制白页: `?safe=alibar2024`

## 判断规则

- 爬虫 → 白页
- 非澳洲/新西兰 IP → 白页
- 澳洲/新西兰真实用户 → 黑页
