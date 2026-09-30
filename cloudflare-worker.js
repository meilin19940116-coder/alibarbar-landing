/**
 * Cloudflare Workers 斗篷脚本
 * 部署到 Cloudflare Workers，绑定到你的域名
 */

// ==================== 配置区 ====================

const CONFIG = {
  // Vercel 部署的域名
  VERCEL_DOMAIN: 'www.synchro-match.com',

  // 安全页面路径（相对于项目根目录）
  SAFE_PAGE_PATH: '/safe.html',

  // 真实页面路径
  REAL_PAGE_PATH: '/index.html',

  // 是否启用详细日志（调试用）
  DEBUG: true,

  // 白名单国家（只对这些国家启用斗篷，其他国家直接显示安全页）
  ALLOWED_COUNTRIES: ['AU', 'NZ'], // 澳洲、新西兰

  // 审核期宽松模式（上线前7天建议开启）
  REVIEW_MODE: false,
  REVIEW_MODE_DAYS: 7
};

// ==================== 检测规则 ====================

// 广告平台爬虫 User-Agent 特征
const CRAWLER_PATTERNS = [
  // Facebook/Meta
  /facebookexternalhit/i,
  /facebot/i,
  /facebook/i,
  /meta-externalagent/i,

  // Google
  /googlebot/i,
  /google-adwords/i,
  /adsbot-google/i,
  /mediapartners-google/i,

  // TikTok
  /bytespider/i,
  /tiktok/i,

  // Twitter/X
  /twitterbot/i,
  /x-bot/i,

  // 通用爬虫
  /bot|crawler|spider|scraper|curl|wget|python|java/i,

  // 无头浏览器
  /headless/i,
  /phantom/i,
  /selenium/i,
  /puppeteer/i,
];

// 已知广告平台审核 IP 段（持续更新）
const SUSPICIOUS_ASN = [
  32934,  // Facebook
  13335,  // Cloudflare（他们用来审核）
  15169,  // Google
  16509,  // Amazon AWS（广告平台常用）
  14061,  // DigitalOcean
];

// 数据中心特征检测
const DATACENTER_HOSTING = [
  /amazon|aws|google|cloud|azure|digitalocean|linode|vultr|ovh/i
];

// ==================== 主处理函数 ====================

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);

  // 管理后门：添加 ?真实密钥 参数可以强制显示真实页面（方便你自己测试）
  if (url.searchParams.get('debug_real') === 'alibarbar2024') {
    return fetchPage(request, 'REAL', '管理员强制真实页面');
  }

  // 安全后门：强制安全页面（测试用）
  if (url.searchParams.get('debug_safe') === 'test123') {
    return fetchPage(request, 'SAFE', '管理员强制安全页面');
  }

  // 收集检测信号
  const signals = await collectSignals(request);

  // 综合判断
  const decision = makeDecision(signals);

  // 记录日志（可选，调试用）
  if (CONFIG.DEBUG) {
    console.log('Detection Signals:', JSON.stringify(signals, null, 2));
    console.log('Decision:', decision);
  }

  // 返回对应页面
  return fetchPage(request, decision.page, decision.reason);
}

// ==================== 信号收集 ====================

async function collectSignals(request) {
  const signals = {
    userAgent: request.headers.get('user-agent') || '',
    ip: request.headers.get('cf-connecting-ip') || '',
    country: request.headers.get('cf-ipcountry') || '',
    asn: request.cf?.asn || 0,
    colo: request.cf?.colo || '',
    referer: request.headers.get('referer') || '',
    acceptLanguage: request.headers.get('accept-language') || '',
    acceptEncoding: request.headers.get('accept-encoding') || '',
    secFetchSite: request.headers.get('sec-fetch-site') || '',
    secFetchMode: request.headers.get('sec-fetch-mode') || '',
    secFetchDest: request.headers.get('sec-fetch-dest') || '',

    // Cloudflare 提供的额外信息
    tlsVersion: request.cf?.tlsVersion || '',
    httpProtocol: request.cf?.httpProtocol || '',

    // 时间戳（用于审核期判断）
    timestamp: Date.now(),
  };

  return signals;
}

// ==================== 决策引擎 ====================

function makeDecision(signals) {
  const risks = [];
  let riskScore = 0;

  // 1. User-Agent 检测（权重最高）
  const isCrawler = CRAWLER_PATTERNS.some(pattern =>
    pattern.test(signals.userAgent)
  );
  if (isCrawler) {
    risks.push('User-Agent 匹配爬虫特征');
    riskScore += 100; // 直接判定
  }

  // 2. 空或异常 User-Agent
  if (!signals.userAgent || signals.userAgent.length < 20) {
    risks.push('User-Agent 为空或过短');
    riskScore += 80;
  }

  // 3. ASN 检测（广告平台数据中心）
  if (SUSPICIOUS_ASN.includes(signals.asn)) {
    risks.push(`ASN ${signals.asn} 属于已知广告平台`);
    riskScore += 70;
  }

  // 4. 国家/地区限制
  if (!CONFIG.ALLOWED_COUNTRIES.includes(signals.country)) {
    risks.push(`国家 ${signals.country} 不在白名单`);
    riskScore += 50;
  }

  // 5. 无 Referer 且直接访问（可疑）
  if (!signals.referer && signals.secFetchSite === 'none') {
    risks.push('直接访问且无 Referer');
    riskScore += 30;
  }

  // 6. 缺少现代浏览器特征
  if (!signals.secFetchSite && !signals.secFetchMode) {
    risks.push('缺少 Sec-Fetch 头（非现代浏览器）');
    riskScore += 40;
  }

  // 7. Accept-Language 检测
  if (!signals.acceptLanguage) {
    risks.push('缺少 Accept-Language');
    riskScore += 20;
  }

  // 8. 数据中心托管检测
  const hostname = signals.ip;
  // 简单检测：如果 User-Agent 包含托管商名称
  const isDatacenter = DATACENTER_HOSTING.some(pattern =>
    pattern.test(signals.userAgent)
  );
  if (isDatacenter) {
    risks.push('检测到数据中心特征');
    riskScore += 35;
  }

  // 审核期宽松模式（降低阈值）
  const threshold = CONFIG.REVIEW_MODE ? 150 : 60;

  // 最终决策
  if (riskScore >= threshold) {
    return {
      page: 'SAFE',
      reason: risks.join('; '),
      riskScore: riskScore
    };
  } else {
    return {
      page: 'REAL',
      reason: '通过验证，展示真实内容',
      riskScore: riskScore
    };
  }
}

// ==================== 页面获取 ====================

async function fetchPage(request, pageType, reason) {
  const url = new URL(request.url);

  // 决定目标路径
  let targetPath;
  if (pageType === 'SAFE') {
    targetPath = CONFIG.SAFE_PAGE_PATH;
  } else {
    targetPath = CONFIG.REAL_PAGE_PATH;
  }

  // 构建 Vercel 请求
  const vercelUrl = `https://${CONFIG.VERCEL_DOMAIN}${targetPath}`;

  // 转发请求
  const modifiedRequest = new Request(vercelUrl, {
    method: request.method,
    headers: request.headers,
    body: request.body,
    redirect: 'manual'
  });

  // 获取响应
  let response = await fetch(modifiedRequest);

  // 克隆响应，修改头部
  response = new Response(response.body, response);

  // 添加自定义头（可选，调试用）
  if (CONFIG.DEBUG) {
    response.headers.set('X-Cloak-Decision', pageType);
    response.headers.set('X-Cloak-Reason', reason);
  }

  // 移除可能暴露 Vercel 的头
  response.headers.delete('x-vercel-id');
  response.headers.delete('x-vercel-cache');

  return response;
}

// ==================== 使用说明 ====================

/*
部署步骤：

1. 登录 Cloudflare Dashboard
2. 进入 Workers & Pages
3. 创建新 Worker，粘贴此代码
4. 修改 CONFIG 中的配置：
   - VERCEL_DOMAIN: 改成你的 Vercel 项目域名
   - ALLOWED_COUNTRIES: 根据你的目标市场调整

5. 部署 Worker

6. 绑定到你的域名：
   - 进入域名的 Workers Routes
   - 添加路由：your-domain.com/*
   - 选择刚创建的 Worker

7. 测试：
   - 正常访问：应该看到真实页面（如果你在澳洲）
   - 添加 ?debug_safe=test123 ：看到安全页面
   - 添加 ?debug_real=alibarbar2024 ：看到真实页面

8. 模拟爬虫测试：
   curl -A "facebookexternalhit/1.1" https://your-domain.com
   应该返回安全页面内容

监控建议：
- 在 Cloudflare Analytics 查看流量分布
- 观察 Workers 日志中的决策分布
- 前7天开启 REVIEW_MODE，观察广告审核情况

注意事项：
- 定期更新 CRAWLER_PATTERNS 和 SUSPICIOUS_ASN
- 广告平台检测手段在升级，需要持续调整阈值
- 建议每周检查一次 Workers 日志
*/
