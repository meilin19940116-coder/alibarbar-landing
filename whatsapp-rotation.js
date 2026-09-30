/**
 * WhatsApp 号码轮询系统
 * 每次页面加载随机选择一个号码，分散流量
 */

// ==================== 配置区 ====================

// WhatsApp 号码池（添加你的多个号码）
const WHATSAPP_NUMBERS = [
  {
    number: '61412345678',  // 澳洲号码格式：61 + 手机号
    name: 'Customer Service 1',
    active: true
  },
  {
    number: '61412345679',
    name: 'Customer Service 2',
    active: true
  },
  {
    number: '61412345680',
    name: 'Customer Service 3',
    active: true
  },
  {
    number: '61412345681',
    name: 'Customer Service 4',
    active: true
  },
  {
    number: '61412345682',
    name: 'Customer Service 5',
    active: true
  }
];

// 默认消息文本
const DEFAULT_MESSAGE = 'Hi, I\'m interested in ALIBARBAR 9000';

// ==================== 轮询逻辑 ====================

/**
 * 从激活的号码中随机选择一个
 */
function getRandomWhatsAppNumber() {
  // 过滤出激活的号码
  const activeNumbers = WHATSAPP_NUMBERS.filter(item => item.active);

  if (activeNumbers.length === 0) {
    console.error('没有可用的 WhatsApp 号码！');
    return null;
  }

  // 随机选择
  const randomIndex = Math.floor(Math.random() * activeNumbers.length);
  const selected = activeNumbers[randomIndex];

  console.log(`WhatsApp 号码轮询: ${selected.name} (${selected.number})`);

  return selected.number;
}

/**
 * 生成 WhatsApp 链接
 */
function generateWhatsAppLink(message = DEFAULT_MESSAGE) {
  const number = getRandomWhatsAppNumber();

  if (!number) {
    // 如果没有可用号码，返回空链接
    return '#';
  }

  // 编码消息文本
  const encodedMessage = encodeURIComponent(message);

  return `https://wa.me/${number}?text=${encodedMessage}`;
}

/**
 * 初始化所有 WhatsApp 按钮
 */
function initWhatsAppButtons() {
  // 生成随机链接
  const whatsappLink = generateWhatsAppLink();

  // 查找所有 WhatsApp 链接元素
  const whatsappElements = document.querySelectorAll('a[href*="wa.me"]');

  console.log(`找到 ${whatsappElements.length} 个 WhatsApp 按钮`);

  // 更新所有链接
  whatsappElements.forEach((element, index) => {
    element.href = whatsappLink;
    console.log(`WhatsApp 按钮 ${index + 1} 已更新: ${whatsappLink}`);
  });
}

// ==================== 页面加载时初始化 ====================

// DOM 加载完成后立即执行
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWhatsAppButtons);
} else {
  // 如果 DOM 已经加载完成，直接执行
  initWhatsAppButtons();
}

// 导出函数供调试使用
window.getRandomWhatsAppNumber = getRandomWhatsAppNumber;
window.generateWhatsAppLink = generateWhatsAppLink;
window.initWhatsAppButtons = initWhatsAppButtons;
