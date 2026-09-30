/**
 * Cloudflare Workers 斗篷脚本 - 自动化智能版
 * 无需手动改代码，自动根据时间和流量调整策略
 */

// ==================== 配置区（只需要改这里）====================

const CONFIG = {
  // Vercel 域名
  VERCEL_DOMAIN: 'www.synchro-match.com',

  // 页面路径
  SAFE_PAGE_PATH: '/safe.html',
  REAL_PAGE_PATH: '/index.html',

  // 测试后门密钥（改成你自己的，不要泄露）
  SECRET_TOKEN: 'alibar2024',

  // 白名单国家
  ALLOWED_COUNTRIES: ['AU', 'NZ'],

  // 是否开启调试日志
  DEBUG: true,

  // ============ 自动化策略配置 ============

  // 广告首次投放时间（改成你第一次提交广告的日期）
  // 格式：'YYYY-MM-DD'，例如：'2024-10-01'
  FIRST_AD_SUBMIT_DATE: '2024-10-01',  // 改成你实际提交广告的日期

  // 自动策略开关（true = 自动，false = 手动）
  AUTO_MODE: true,

  // 手动模式设置（当 AUTO_MODE = false 时生效）
  MANUAL_SETTINGS: {
    showRealPagePercent: 50,  // 真实用户中多少%看到黑页（0-100）
    strictFilter: false       // 是否开启严格过滤
  }
};

// ==================== 自动策略规则 ====================

const AUTO_STRATEGY = {
  // 第 1-7 天：审核期（极度保守）
  reviewPeriod: {
    days: [0, 7],
    showRealPagePercent: 0,      // 0% 真实用户看黑页
    strictFilter: false,
    description: '审核期 - 全白页模式'
  },

  // 第 8-14 天：测试期（谨慎开放）
  testPeriod: {
    days: [8, 14],
    showRealPagePercent: 30,     // 30% 真实用户看黑页
    strictFilter: false,
    description: '测试期 - 小流量测试'
  },

  // 第 15-30 天：稳定期（逐步开放）
  stablePeriod: {
    days: [15, 30],
    showRealPagePercent: 60,     // 60% 真实用户看黑页
    strictFilter: false,
    description: '稳定期 - 正常运营'
  },

  // 第 31+ 天：规模化期（最优转化）
  scalePeriod: {
    days: [31, 999],
    showRealPagePercent: 70,     // 70% 真实用户看黑页
    strictFilter: true,          // 开启严格过滤
    description: '规模化期 - 高质量流量'
  }
};

// ==================== 检测规则 ====================

const CRAWLER_PATTERNS = [
  /facebookexternalhit/i, /facebot/i, /facebook/i, /meta-externalagent/i,
  /googlebot/i, /google-adwords/i, /adsbot-google/i, /mediapartners-google/i,
  /bytespider/i, /tiktok/i, /twitterbot/i, /x-bot/i,
  /bot|crawler|spider|scraper|curl|wget|python|java/i,
  /headless/i, /phantom/i, /selenium/i, /puppeteer/i, /lighthouse/i,
];

const SUSPICIOUS_ASN = [
  32934, 13335, 15169, 16509, 14061, 8075, 396982, 45501,
];

const AD_CLICK_PARAMS = ['fbclid', 'gclid', 'ttclid', 'wbraid', 'gbraid', 'msclkid'];
const AD_REFERERS = ['facebook.com', 'instagram.com', 'tiktok.com', 'google.com', 'bing.com'];

// ==================== 主处理函数 ====================

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);

  // 测试后门
  if (url.searchParams.get('debug') === CONFIG.SECRET_TOKEN) {
    return fetchPage(request, 'REAL', '测试后门：强制真实页面');
  }
  if (url.searchParams.get('safe') === CONFIG.SECRET_TOKEN) {
    return fetchPage(request, 'SAFE', '测试后门：强制安全页面');
  }

  // 获取当前策略
  const strategy = getCurrentStrategy();

  // 收集信号
  const signals = await collectSignals(request);

  // 判断
  const decision = makeDecision(signals, strategy);

  // 日志
  if (CONFIG.DEBUG) {
    console.log({
      strategy: strategy.description,
      daysFromStart: strategy.daysFromStart,
      signals: {
        country: signals.country,
        isMobile: signals.isMobile,
        hasAdParam: signals.hasAdParam,
        isCrawler: signals.isCrawler
      },
      decision: {
        page: decision.page,
        reason: decision.reason,
        riskScore: decision.riskScore
      }
    });
  }

  return fetchPage(request, decision.page, decision.reason);
}

// ==================== 获取当前策略 ====================

function getCurrentStrategy() {
  if (!CONFIG.AUTO_MODE) {
    // 手动模式
    return {
      showRealPagePercent: CONFIG.MANUAL_SETTINGS.showRealPagePercent,
      strictFilter: CONFIG.MANUAL_SETTINGS.strictFilter,
      description: '手动模式',
      daysFromStart: -1
    };
  }

  // 自动模式：计算天数
  const firstAdDate = new Date(CONFIG.FIRST_AD_SUBMIT_DATE);
  const now = new Date();
  const daysFromStart = Math.floor((now - firstAdDate) / (1000 * 60 * 60 * 24));

  // 选择策略
  for (const [key, strategy] of Object.entries(AUTO_STRATEGY)) {
    const [minDay, maxDay] = strategy.days;
    if (daysFromStart >= minDay && daysFromStart <= maxDay) {
      return {
        ...strategy,
        daysFromStart
      };
    }
  }

  // 默认：规模化期
  return {
    ...AUTO_STRATEGY.scalePeriod,
    daysFromStart
  };
}

// ==================== 信号收集 ====================

async function collectSignals(request) {
  const url = new URL(request.url);
  const ua = request.headers.get('user-agent') || '';

  return {
    userAgent: ua,
    country: request.headers.get('cf-ipcountry') || '',
    asn: request.cf?.asn || 0,
    referer: request.headers.get('referer') || '',
    isMobile: /mobile|android|iphone|ipad|ipod/i.test(ua),
    isCrawler: CRAWLER_PATTERNS.some(p => p.test(ua)),
    hasAdParam: AD_CLICK_PARAMS.some(p => url.searchParams.has(p)),
    adParams: AD_CLICK_PARAMS.filter(p => url.searchParams.has(p)),
    hasAdReferer: AD_REFERERS.some(d => (request.headers.get('referer') || '').toLowerCase().includes(d)),
    secFetchSite: request.headers.get('sec-fetch-site') || '',
    acceptLanguage: request.headers.get('accept-language') || '',
  };
}

// ==================== 决策引擎 ====================

function makeDecision(signals, strategy) {
  const risks = [];
  let riskScore = 0;

  // 1. 爬虫检测（绝对拦截）
  if (signals.isCrawler) {
    risks.push('爬虫特征');
    riskScore += 100;
  }

  // 2. 空 UA（绝对拦截）
  if (!signals.userAgent || signals.userAgent.length < 20) {
    risks.push('UA异常');
    riskScore += 100;
  }

  // 3. ASN 黑名单
  if (SUSPICIOUS_ASN.includes(signals.asn)) {
    risks.push(`机房ASN:${signals.asn}`);
    riskScore += 70;
  }

  // 4. 国家限制
  if (!CONFIG.ALLOWED_COUNTRIES.includes(signals.country)) {
    risks.push(`国家:${signals.country}`);
    riskScore += 50;
  }

  // 5. 严格模式额外检测
  if (strategy.strictFilter) {
    if (!signals.hasAdParam) {
      risks.push('缺少广告参数');
      riskScore += 40;
    }
    if (!signals.isMobile) {
      risks.push('非移动端');
      riskScore += 35;
    }
    if (!signals.hasAdReferer && signals.referer) {
      risks.push('非广告来源');
      riskScore += 30;
    }
  }

  // 6. 基础检测
  if (!signals.referer && signals.secFetchSite === 'none') {
    risks.push('直接访问');
    riskScore += 25;
  }

  if (!signals.acceptLanguage) {
    risks.push('缺少语言头');
    riskScore += 20;
  }

  // 决策逻辑
  const threshold = 60;
  const isRisky = riskScore >= threshold;

  // 如果是高风险，直接白页
  if (isRisky) {
    return {
      page: 'SAFE',
      reason: `高风险流量 (分数:${riskScore})`,
      riskScore,
      risks
    };
  }

  // 低风险：根据策略随机分配
  const random = Math.random() * 100;
  const showReal = random < strategy.showRealPagePercent;

  return {
    page: showReal ? 'REAL' : 'SAFE',
    reason: showReal
      ? `通过验证，展示黑页 (${strategy.description})`
      : `策略白页 (${strategy.description}, 黑页占比:${strategy.showRealPagePercent}%)`,
    riskScore,
    risks
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

  if (CONFIG.DEBUG) {
    newResponse.headers.set('X-Cloak-Decision', pageType);
    newResponse.headers.set('X-Cloak-Reason', encodeURIComponent(reason));
  }

  newResponse.headers.delete('X-Vercel-Id');
  newResponse.headers.delete('X-Vercel-Cache');

  return newResponse;
}
