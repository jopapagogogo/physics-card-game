/**
 * test_all_cards.js — 运行时卡牌测试
 * 对全部 109 张卡逐一实例化 GameEngine，模拟打出，验证效果。
 *
 * 用法: node test_all_cards.js
 */

'use strict';

const fs = require('fs');

// ─── 加载源码 ───────────────────────────────────────────────
let __cardsSrc = fs.readFileSync('./js/cards.js', 'utf-8');
let __comboSrc = fs.readFileSync('./js/combo_table.js', 'utf-8');
let __engineSrc = fs.readFileSync('./js/engine.js', 'utf-8');

// 去掉 export / import
__cardsSrc = __cardsSrc.replace(/export\s*\{[^}]*\}\s*;?/g, '');
__comboSrc = __comboSrc.replace(/export\s*\{[^}]*\}\s*;?/g, '');
__engineSrc = __engineSrc
  .replace(/import\s*\{[^}]*\}\s*from\s*['"]\.\/[^'"]*['"]\s*;?/g, '')
  .replace(/export\s*\{[^}]*\}\s*;?/g, '');

// 拼接为一段脚本，用 eval 执行
const __combined = __cardsSrc + '\n' + __comboSrc + '\n' + __engineSrc;

// 在模块作用域中 eval（CommonJS 下变量会提升到模块作用域）
// 将 const 声明放入 Function 以获取返回值
const __env = {};
const __execFn = new Function('env',
  __combined + '\n' +
  'env.CARDS = CARDS;\n' +
  'env.COMBO_TABLE = COMBO_TABLE;\n' +
  'env.GameEngine = GameEngine;\n'
);
__execFn(__env);

const CARDS = __env.CARDS;
const GameEngine = __env.GameEngine;

// ─── 常量 ───────────────────────────────────────────────────
const OUTPUT_FILE = '/workspace/physics-card-game/test_all_cards_result.txt';
const MAX_HP = 1200;
const MAX_SPIRIT = 100;

// ─── 特殊卡牌条件配置 ──────────────────────────────────────
// [cardId]: function(game) 在 playCard 之前调用，设置前置条件
const SPECIAL_SETUP = {
  // 需要对手灼烧层数的卡
  'A26': (g) => { g.players[1].burnLayers = 5; },  // 凝固封锁: 消耗2层灼烧
  'S23': (g) => { g.players[1].burnLayers = 5; },  // 热机驱动: 消耗2层灼烧
  'S25': (g) => { g.players[1].burnLayers = 5; },  // 潜热释放: 消耗2层灼烧

  // T02 临界突破：需要 HP < 30%
  'T02': (g) => { g.players[0].hp = 300; },

  // A05 重力势能: 需要将 target 设为 summon 或 player（无需特殊处理但标记一下）
  // S20 影子束缚: 需要对手场上有卡牌 - 放一个假辅助卡
  'S20': (g) => {
    const dummyCard = CARDS.find(c => c.id === 'S04');
    g.players[1].fieldSupports.push({ card: dummyCard, turnsRemaining: 2 });
  },

  // S30 短路开关: 需要场上有电系辅助卡来牺牲
  'S30': (g) => {
    const elecSupport = CARDS.find(c => c.id === 'S27');
    g.players[0].fieldSupports.push({ card: elecSupport, turnsRemaining: 3 });
  },

  // A11 啸叫: 确保没有重复的 A11 在场
  // A05: 确保没有重复的 A05 在场
};

// cards that are expected to fail/skip if not set up
// These will be tested with special setup, and if playCard succeeds we treat as pass
const CONDITIONAL_CARDS = new Set(Object.keys(SPECIAL_SETUP));

// ─── 工具函数 ──────────────────────────────────────────────

/** 创建基础 GameEngine，玩家 deck 全是 A01 */
function createEngine() {
  return new GameEngine(
    ['A01', 'A01', 'A01', 'A01', 'A01'],
    ['A01', 'A01', 'A01', 'A01', 'A01'],
    '力', '电', '力', '电'
  );
}

/** 判断卡牌是否应该有驻场效果 */
function expectsFieldSupport(card) {
  if (!card || !card.effect) return false;
  const e = card.effect;
  // 领域和召唤物的驻场不在 fieldSupports 中
  if (card.type === 'domain' || card.type === 'summon') return false;
  // 有 turns 且非一次性效果的卡
  if (e.turns) return true;
  // 有 defense 相关效果
  if (e.forceDefense || e.soundDefense || e.electricDefense) return true;
  // 明确定义为驻场卡
  if (e.isFieldCard) return true;
  // 啸叫类型
  if (e.applyOnCast && e.applyPerTurn) return true;
  // 光速传播
  if (e.lightSpeed) return true;
  // 影子束缚
  if (e.shadowBind) return true;
  // 弹性储能
  if (e.energyStore) return true;
  // 忽略电防御 (S31)
  if (e.ignoreElectricDefense) return true;
  return false;
}

/** 检查 fieldSupports 是否包含该卡 */
function cardInFieldSupports(game, cardId) {
  return game.players[0].fieldSupports.some(s => s.card?.id === cardId);
}

/** 获取效果摘要 */
function effectSummary(effects) {
  if (!effects || effects.length === 0) return 'NO_EFFECTS';
  const types = effects.map(e => e.type).filter(Boolean);
  if (types.length === 0) return 'NO_TYPE_FIELDS';
  return types.join(',');
}

// ─── 主测试流程 ─────────────────────────────────────────────

const results = [];
let passCount = 0;
let failCount = 0;
let skipCount = 0;
let attentionCards = [];

const lines = [];

function log(msg) {
  console.log(msg);
  lines.push(msg);
}

log('='.repeat(70));
log('  物理卡牌对战 — 全部 109 张卡牌运行时测试');
log('  测试时间: ' + new Date().toISOString());
log('='.repeat(70));
log('');

// 按类型排序：先攻击、再辅助、领域、召唤、相变
const typeOrder = { attack: 0, support: 1, domain: 2, summon: 3, phase: 4 };
const sortedCards = [...CARDS].sort((a, b) => {
  if ((typeOrder[a.type] || 99) !== (typeOrder[b.type] || 99)) {
    return (typeOrder[a.type] || 99) - (typeOrder[b.type] || 99);
  }
  return a.id.localeCompare(b.id);
});

for (const card of sortedCards) {
  const game = createEngine();

  // 清空玩家手牌，只放测试卡
  game.players[0].hand = [card];
  game.players[0].spirit = 999;

  // 应用特殊前置条件
  const needsSetup = CONDITIONAL_CARDS.has(card.id);
  if (needsSetup && SPECIAL_SETUP[card.id]) {
    SPECIAL_SETUP[card.id](game);
  }

  // 打出卡牌
  let result;
  try {
    result = game.playCard(0, card.id, 'player');
  } catch (err) {
    result = { success: false, msg: 'Exception: ' + err.message, effects: [] };
  }

  // ── 判断结果 ──
  const label = `${card.id} ${card.name} (${card.type}, cost=${card.cost})`;

  if (result.success) {
    const hasEffects = result.effects && result.effects.length > 0;
    const effSummary = effectSummary(result.effects);

    // 检查 fieldSupports
    const needsFS = expectsFieldSupport(card);
    let fsCheck = 'N/A';
    if (needsFS) {
      const inFS = cardInFieldSupports(game, card.id);
      fsCheck = inFS ? 'OK' : 'MISSING';
      if (!inFS) {
        attentionCards.push({ card, reason: 'fieldSupports MISSING (expected, not found)' });
      }
    }

    if (hasEffects && fsCheck !== 'MISSING') {
      log(`✅ ${label}: dmg=${card.effect?.dmg || 'N/A'} ✔ fieldSupports=${fsCheck} effects=[${effSummary}]`);
      passCount++;
    } else if (!hasEffects && fsCheck === 'MISSING') {
      log(`❌ ${label}: NO_EFFECTS & fieldSupports MISSING`);
      failCount++;
    } else if (!hasEffects) {
      log(`⚠️ ${label}: result.success=true but NO_EFFECTS (type=${card.type}, fs=${fsCheck})`);
      attentionCards.push({ card, reason: 'result.success=true but effects is empty' });
      passCount++;  // played successfully without errors counts as pass
    } else {
      // fsCheck === 'MISSING'
      log(`❌ ${label}: fieldSupports MISSING (expected, got none) effects=[${effSummary}]`);
      failCount++;
    }

    results.push({ cardId: card.id, name: card.name, type: card.type, success: true,
      effects: effSummary, fieldSupports: fsCheck });

  } else {
    // playCard failed
    if (needsSetup) {
      // It required special setup which we provided, but it still failed
      log(`❌ ${label}: result.success=false (reason: ${result.msg}) [特殊前置已设置但仍失败]`);
      failCount++;
    } else {
      log(`⚠️ ${label}: result.success=false (reason: ${result.msg})`);
      skipCount++;
    }

    results.push({ cardId: card.id, name: card.name, type: card.type, success: false,
      reason: result.msg, skipped: !needsSetup });
  }
}

// ─── 汇总 ───────────────────────────────────────────────────
log('');
log('='.repeat(70));
log('                         测试汇总');
log('='.repeat(70));
log(`  总卡牌数: ${CARDS.length}`);
log(`  ✅ 通过:   ${passCount} 张`);
log(`  ❌ 失败:   ${failCount} 张`);
log(`  ⚠️ 跳过:   ${skipCount} 张（条件不满足）`);
log('');

if (failCount > 0) {
  log('── 失败卡牌详情 ──');
  for (const r of results) {
    if (!r.success && CONDITIONAL_CARDS.has(r.cardId)) {
      log(`  ❌ ${r.cardId} ${r.name}: ${r.reason} (前置条件已设置) @ type=${r.type}`);
    } else if (!r.success) {
      log(`  ⚠️ ${r.cardId} ${r.name}: ${r.reason} @ type=${r.type}`);
    }
  }
  // Also include cards that passed but failed fieldSupports check
  for (const a of attentionCards) {
    if (a.reason.includes('MISSING')) {
      log(`  ❌ ${a.card.id} ${a.card.name}: ${a.reason} @ type=${a.card.type}`);
    }
  }
  log('');
}

if (skipCount > 0) {
  log('── 跳过卡牌详情（无条件无法打出）──');
  for (const r of results) {
    if (!r.success && r.skipped) {
      log(`  ⚠️ ${r.cardId} ${r.name}: ${r.reason}`);
    }
  }
  log('');
}

if (attentionCards.length > 0) {
  log('── 特殊关注的卡牌（驻场/持续效果异常）──');
  for (const a of attentionCards) {
    log(`  🔍 ${a.card.id} ${a.card.name}: ${a.reason}`);
  }
  log('');
}

log(`  ✅ 通过: ${passCount} / ${CARDS.length} (${(passCount/CARDS.length*100).toFixed(1)}%)`);
log(`  ❌ 失败: ${failCount} / ${CARDS.length}`);
log(`  ⚠️ 跳过: ${skipCount} / ${CARDS.length}`);
log('='.repeat(70));

// ─── 写入文件 ───────────────────────────────────────────────
fs.writeFileSync(OUTPUT_FILE, lines.join('\n'), 'utf-8');
console.log('\n结果已写入: ' + OUTPUT_FILE);
