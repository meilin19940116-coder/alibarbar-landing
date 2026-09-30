#!/bin/bash
# Cloudflare Workers 部署快速命令

echo "=== 斗篷系统测试命令集合 ==="
echo ""

echo "1. 测试真实用户访问（应该看到 ALIBARBAR 9000）"
echo "curl -s https://synchro-match.com | grep '9000 puffs'"
echo ""

echo "2. 测试安全页后门"
echo "curl -s 'https://synchro-match.com?debug_safe=test123' | grep 'Premium Lifestyle'"
echo ""

echo "3. 测试真实页后门"
echo "curl -s 'https://synchro-match.com?debug_real=alibarbar2024' | grep '9000 puffs'"
echo ""

echo "4. 测试 Facebook 爬虫（应该看到安全页）"
echo "curl -s -A 'facebookexternalhit/1.1' https://synchro-match.com | grep 'Premium Lifestyle'"
echo ""

echo "5. 测试 Google 爬虫（应该看到安全页）"
echo "curl -s -A 'Googlebot/2.1' https://synchro-match.com | grep 'Premium Lifestyle'"
echo ""

echo "6. 测试 TikTok 爬虫（应该看到安全页）"
echo "curl -s -A 'Bytespider/1.0' https://synchro-match.com | grep 'Premium Lifestyle'"
echo ""

echo "=== 执行所有测试 ==="
echo ""

echo "✅ 测试 1: 真实用户访问"
curl -s https://synchro-match.com | grep -q '9000 puffs' && echo "✅ 通过" || echo "❌ 失败"

echo "✅ 测试 2: 安全页后门"
curl -s 'https://synchro-match.com?debug_safe=test123' | grep -q 'Premium Lifestyle' && echo "✅ 通过" || echo "❌ 失败"

echo "✅ 测试 3: 真实页后门"
curl -s 'https://synchro-match.com?debug_real=alibarbar2024' | grep -q '9000 puffs' && echo "✅ 通过" || echo "❌ 失败"

echo "✅ 测试 4: Facebook 爬虫"
curl -s -A 'facebookexternalhit/1.1' https://synchro-match.com | grep -q 'Premium Lifestyle' && echo "✅ 通过" || echo "❌ 失败"

echo "✅ 测试 5: Google 爬虫"
curl -s -A 'Googlebot/2.1' https://synchro-match.com | grep -q 'Premium Lifestyle' && echo "✅ 通过" || echo "❌ 失败"

echo "✅ 测试 6: TikTok 爬虫"
curl -s -A 'Bytespider/1.0' https://synchro-match.com | grep -q 'Premium Lifestyle' && echo "✅ 通过" || echo "❌ 失败"

echo ""
echo "=== 如果所有测试都通过，斗篷系统部署成功！🎉 ==="
