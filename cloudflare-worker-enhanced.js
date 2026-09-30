/**
 * Cloudflare Workers 斗篷脚本 - 增强版
 * 融合基础判断 + 严格过滤
 */

// ==================== 配置区 ====================

const CONFIG = {
  // Vercel 部署的域名
  VERCEL_DOMAIN: 'www.synchro-match.com',

  // 安全页面路径
  SAFE_PAGE_PATH: '/safe.html',

  // 真实页面路径
  REAL_PAGE_PATH: '/index.html',

  // 是否启用详细日志
  DEBUG: true,

  // 模式控制
  // 'WHITE' = 100%白页（审核期）
  // 'FILTER' = 智能过滤（正常运营）
  // 'BALANCED' = 平衡模式（推荐新手）
  MODE: 'BALANCED',

  // 白名单国家
  ALLOWED_COUNTRIES: ['AU', 'NZ'],

  // 审核期宽松模式
  REVIEW_MODE: true,
  REVIEW_MODE_DAYS: 7,

  // 测试后门密钥
  SECRET_TOKEN: 'mygold888'
};

// ==================== 检测规则 ====================

// 广告平台爬虫
const CRAWLER_PATTERNS = [
  /facebookexternalhit/i,
  /facebot/i,
  /facebook/i,
  /meta-externalagent/i,
  /googlebot/i,
  /google-adwords/i,
  /adsbot-google/i,
  /mediapartners-google/i,
  /bytespider/i,
  /tiktok/i,
  /twitterbot/i,
  /x-bot/i,
  /bot|crawler|spider|scraper|curl|wget|python|java/i,
  /headless/i,
  /phantom/i,
  /selenium/i,
  /puppeteer/i,
  /lighthouse/i,
];

// 广告平台审核 IP 段
const SUSPICIOUS_ASN = [
  32934,  // Facebook
  13335,  // Cloudflare
  15169,  // Google
  16509,  // Amazon AWS
  14061,  // DigitalOcean
  8075,   // Microsoft Azure
  396982, // Google Cloud
  45501,  // Facebook Ireland
];

// 数据中心特征
const DATACENTER_HOSTING = [
  /amazon|aws|google|cloud|azure|digitalocean|linode|vultr|ovh/i
];

// 广告点击参数（新增）
const AD_CLICK_PARAMS = [
  'fbclid',    // Facebook
  'gclid',     // Google
  'ttclid',    // TikTok
  'wbraid',    // Google Web
  'gbraid',    // Google iOS
  'msclkid',   // Microsoft
];

// 广告平台 Referer（新增）
const AD_REFERERS = [
  'facebook.com',
  'instagram.com',
  'tiktok.com',
  'google.com',
  'bing.com',
  't.co',
  'twitter.com',
];

// ==================== 主处理函数 ====================

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);

  // 模式 1：纯白模式（审核期）
  if (CONFIG.MODE === 'WHITE') {
    return fetchPage(request, 'SAFE', '纯白模式：审核期');
  }

  // 测试后门：真实页
  if (url.searchParams.get('debug') === CONFIG.SECRET_TOKEN) {
    return fetchPage(request, 'REAL', '测试后门：强制真实页面');
  }

  // 测试后门：安全页
  if (url.searchParams.get('safe') === CONFIG.SECRET_TOKEN) {
    return fetchPage(request, 'SAFE', '测试后门：强制安全页面');
  }

  // 收集检测信号
  const signals = await collectSignals(request);

  // 综合判断
  const decision = makeDecision(signals);

  // 记录日志
  if (CONFIG.DEBUG) {
    console.log('Detection Signals:', JSON.stringify(signals, null, 2));
    console.log('Decision:', decision);
  }

  // 返回对应页面
  return fetchPage(request, decision.page, decision.reason);
}

// ==================== 信号收集 ====================

async function collectSignals(request) {
  const url = new URL(request.url);

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
    tlsVersion: request.cf?.tlsVersion || '',
    httpProtocol: request.cf?.httpProtocol || '',
    timestamp: Date.now(),

    // 新增：检测广告参数
    hasAdParam: AD_CLICK_PARAMS.some(param => url.searchParams.has(param)),
    adParams: AD_CLICK_PARAMS.filter(param => url.searchParams.has(param)),

    // 新增：检测设备类型
    isMobile: /mobile|android|iphone|ipad|ipod/i.test(request.headers.get('user-agent') || ''),
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
    riskScore += 100;
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

  // 5. 缺少广告参数（新增 - 严格模式）
  if (CONFIG.MODE === 'FILTER' && !signals.hasAdParam) {
    risks.push('缺少广告点击参数');
    riskScore += 40;
  }

  // 6. Referer 检测（新增）
  if (signals.referer) {
    const hasAdReferer = AD_REFERERS.some(domain =>
      signals.referer.toLowerCase().includes(domain)
    );
    if (!hasAdReferer && CONFIG.MODE === 'FILTER') {
      risks.push('Referer 不来自广告平台');
      riskScore += 30;
    }
  }

  // 7. 桌面端检测（新增）
  if (!signals.isMobile && CONFIG.MODE === 'FILTER') {
    risks.push('非移动设备访问');
    riskScore += 35;
  }

  // 8. 无 Referer 且直接访问
  if (!signals.referer && signals.secFetchSite === 'none') {
    risks.push('直接访问且无 Referer');
    riskScore += 30;
  }

  // 9. 缺少现代浏览器特征
  if (!signals.secFetchSite && !signals.secFetchMode) {
    risks.push('缺少 Sec-Fetch 头（非现代浏览器）');
    riskScore += 40;
  }

  // 10. Accept-Language 检测
  if (!signals.acceptLanguage) {
    risks.push('缺少 Accept-Language');
    riskScore += 20;
  }

  // 11. 数据中心托管检测
  const isDatacenter = DATACENTER_HOSTING.some(pattern =>
    pattern.test(signals.userAgent)
  );
  if (isDatacenter) {
    risks.push('检测到数据中心特征');
    riskScore += 35;
  }

  // 决策逻辑
  let threshold;
  if (CONFIG.MODE === 'WHITE') {
    threshold = 0; // 全部进白页
  } else if (CONFIG.MODE === 'FILTER') {
    threshold = CONFIG.REVIEW_MODE ? 150 : 40; // 严格模式
  } else { // BALANCED
    threshold = CONFIG.REVIEW_MODE ? 150 : 60; // 平衡模式（推荐）
  }

  const page = riskScore >= threshold ? 'SAFE' : 'REAL';
  const reason = page === 'SAFE'
    ? `检测到风险，展示安全页面（风险分数：${riskScore}）`
    : `通过验证，展示真实内容（风险分数：${riskScore}）`;

  return {
    page,
    reason,
    riskScore,
    risks,
    signals: {
      country: signals.country,
      isMobile: signals.isMobile,
      hasAdParam: signals.hasAdParam,
      adParams: signals.adParams,
    }
  };
}

// ==================== 页面获取 ====================

async function fetchPage(request, pageType, reason) {
  const url = new URL(request.url);
  const pagePath = pageType === 'SAFE' ? CONFIG.SAFE_PAGE_PATH : CONFIG.REAL_PAGE_PATH;

  // 构建 Vercel 请求 URL
  const vercelUrl = `https://${CONFIG.VERCEL_DOMAIN}${pagePath}`;

  // 转发请求到 Vercel
  const response = await fetch(vercelUrl, {
    method: request.method,
    headers: request.headers,
  });

  // 创建新的响应
  const newResponse = new Response(response.body, response);

  // 添加自定义响应头（调试用）
  if (CONFIG.DEBUG) {
    newResponse.headers.set('X-Cloak-Decision', pageType);
    newResponse.headers.set('X-Cloak-Reason', encodeURIComponent(reason));
  }

  // 清理可能暴露的响应头
  newResponse.headers.delete('X-Vercel-Id');
  newResponse.headers.delete('X-Vercel-Cache');

  return newResponse;
}
