/**
 * Cloudflare Workers 斗篷脚本 - 生产版（最终版）
 * 限制澳洲/新西兰 IP，其他国家看白页
 */

// ==================== 配置区 ====================

const CONFIG = {
  VERCEL_DOMAIN: 'www.synchro-match.com',
  SAFE_PAGE_PATH: '/safe.html',
  REAL_PAGE_PATH: '/index.html',
  SECRET_TOKEN: 'alibar2024',

  // 生产模式：只有澳洲/新西兰能看黑页
  COUNTRY_CHECK: true,
  ALLOWED_COUNTRIES: ['AU', 'NZ'],

  DEBUG: true
};

const CRAWLER_PATTERNS = [
  /facebookexternalhit/i,
  /facebot/i,
  /facebook/i,
  /meta-externalagent/i,
  /meta-external/i,
  /googlebot/i,
  /google-adwords/i,
  /adsbot-google/i,
  /mediapartners-google/i,
  /bytespider/i,
  /tiktok/i,
  /twitterbot/i,
  /x-bot/i,
  /bot|crawler|spider|scraper/i,
  /curl|wget|python|java/i,
  /headless|phantom|selenium|puppeteer/i,
  /lighthouse|pagespeed/i,
];

const SUSPICIOUS_ASN = [
  32934, 13335, 15169, 16509, 14061, 8075, 396982, 45501,
];

// ==================== 主处理函数 ====================

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);

  // ⭐ 放行所有静态资源（图片、CSS、JS等）
  if (url.pathname.match(/\.(css|js|jpg|jpeg|png|gif|svg|webp|ico|woff|woff2|ttf|eot|map)$/i)) {
    return fetch(request);
  }

  // ⭐ 放行 assets 文件夹
  if (url.pathname.startsWith('/assets/')) {
    return fetch(request);
  }

  // 测试后门
  if (url.searchParams.get('debug') === CONFIG.SECRET_TOKEN) {
    return fetchPage(request, 'REAL', '测试后门：强制真实页');
  }

  if (url.searchParams.get('safe') === CONFIG.SECRET_TOKEN) {
    return fetchPage(request, 'SAFE', '测试后门：强制安全页');
  }

  const signals = collectSignals(request);
  const decision = makeDecision(signals);

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

function makeDecision(signals) {
  // 1. 检测爬虫
  const isCrawler = CRAWLER_PATTERNS.some(pattern => pattern.test(signals.userAgent));
  if (isCrawler) {
    return { page: 'SAFE', reason: '爬虫 UA 特征' };
  }

  // 2. 空 UA
  if (!signals.userAgent || signals.userAgent.length < 20) {
    return { page: 'SAFE', reason: 'UA 异常' };
  }

  // 3. 机房 ASN
  if (SUSPICIOUS_ASN.includes(signals.asn)) {
    return { page: 'SAFE', reason: `机房 ASN: ${signals.asn}` };
  }

  // 4. 国家限制（生产模式）
  if (CONFIG.COUNTRY_CHECK && !CONFIG.ALLOWED_COUNTRIES.includes(signals.country)) {
    return { page: 'SAFE', reason: `国家: ${signals.country}` };
  }

  // 通过所有检测
  return { page: 'REAL', reason: '真实用户' };
}

async function fetchPage(request, pageType, reason) {
  const pagePath = pageType === 'SAFE' ? CONFIG.SAFE_PAGE_PATH : CONFIG.REAL_PAGE_PATH;
  const vercelUrl = `https://${CONFIG.VERCEL_DOMAIN}${pagePath}`;

  const response = await fetch(vercelUrl, {
    method: request.method,
    headers: request.headers,
  });

  const newResponse = new Response(response.body, response);

  if (CONFIG.DEBUG) {
    newResponse.headers.set('X-Cloak-Decision', pageType);
    newResponse.headers.set('X-Cloak-Reason', encodeURIComponent(reason));
    newResponse.headers.set('X-Cloak-Mode', 'PRODUCTION');
  }

  newResponse.headers.delete('X-Vercel-Id');
  newResponse.headers.delete('X-Vercel-Cache');

  return newResponse;
}
