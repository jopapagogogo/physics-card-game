/**
 * Phase 3 — Combo 系统端到端测试
 * 
 * 验证目标：
 * 1. COMBO_TABLE 中所有 combo 能否被正确检测
 * 2. combo 效果能否被正确应用到伤害/状态
 * 3. AI 对战中 combo 是否正常触发
 * 4. 边界情况：无 combo、反向出牌、回合清理等
 * 
 * 关键机制：
 * - 先出辅助/前卡 → combo检测 → pendingCombo[playerIdx] = combo
 * - 再出攻击/后卡 → _handleAttack 读取 pendingCombo → 应用效果到当前卡
 * - 效果附加在**后卡**的 effects 中
 */

import { describe, it, expect } from 'vitest';
import { GameEngine } from '../js/engine.js';
import { AIEngine } from '../js/ai.js';
import { CARDS } from '../js/cards.js';
import { COMBO_TABLE } from '../js/combo_table.js';

// ============================================================
// 工具函数
// ============================================================

/** 构建保证不会抽空的牌库 */
function buildDeck(cardIds) {
  const deck = [];
  while (deck.length < 40) {
    deck.push(...cardIds);
  }
  return deck.slice(0, 40);
}

/** 创建测试引擎 */
function createEngine(playerCardIds, aiCardIds = ['A01'], pDomain = '力', aDomain = '热') {
  return new GameEngine(
    buildDeck(playerCardIds), buildDeck(aiCardIds),
    pDomain, '声', aDomain, '电'
  );
}

/** 强制手牌 */
function setHand(engine, playerIdx, cardIds) {
  engine.players[playerIdx].hand = cardIds.map(id => engine.getCardById(id)).filter(Boolean);
}

/** 设置回合状态并出牌 */
function playCardsInTurn(engine, playerIdx, cardIds, quizCorrect = 0) {
  engine.startTurn();
  engine.startQuizPhase();
  engine.setQuizResult(quizCorrect, 3);
  
  const results = [];
  for (const cardId of cardIds) {
    const result = engine.playCard(playerIdx, cardId, 'player');
    results.push({ cardId, ...result });
  }
  return results;
}

/** 查找卡牌数据 */
function getCard(id) {
  return CARDS.find(c => c.id === id);
}

// ============================================================
// 1. COMBO_TABLE 完整性
// ============================================================

describe('COMBO_TABLE 完整性', () => {
  it('应有正确数量的 combo 定义', () => {
    const count = Object.keys(COMBO_TABLE).length;
    expect(count).toBeGreaterThan(0);
    console.log(`  实际combo数量: ${count}`);
  });

  it('每个 combo 应有 type, msg, effects', () => {
    for (const [key, combo] of Object.entries(COMBO_TABLE)) {
      expect(combo).toHaveProperty('type');
      expect(combo).toHaveProperty('msg');
      expect(combo).toHaveProperty('effects');
      expect(Array.isArray(combo.effects)).toBe(true);
    }
  });

  it('combo 键格式应包含分隔符', () => {
    for (const key of Object.keys(COMBO_TABLE)) {
      expect(key).toMatch(/[→↔vs]/);
    }
  });
});

// ============================================================
// 2. Combo 检测逻辑
// ============================================================

describe('Combo 检测逻辑', () => {
  it('先出S01再出A01应触发力领域combo', () => {
    const engine = createEngine(['S01', 'A01']);
    setHand(engine, 0, ['S01', 'A01']);
    
    engine.startTurn();
    engine.startQuizPhase();
    engine.setQuizResult(0, 3);
    
    engine.playCard(0, 'S01', 'player');
    engine.playCard(0, 'A01', 'player');
    
    expect(engine.comboThisTurn.length).toBeGreaterThan(0);
    expect(engine.pendingCombo[0]).not.toBeNull();
    expect(engine.pendingCombo[0].type).toBe('combo_s01_a01');
  });

  it('反向出牌（A01→S01）不应触发combo', () => {
    const engine = createEngine(['A01', 'S01']);
    setHand(engine, 0, ['A01', 'S01']);
    
    engine.startTurn();
    engine.startQuizPhase();
    engine.setQuizResult(0, 3);
    
    engine.playCard(0, 'A01', 'player');
    engine.playCard(0, 'S01', 'player');
    
    expect(engine.comboThisTurn.length).toBe(0);
  });

  it('单张卡不触发combo', () => {
    const engine = createEngine(['A01']);
    setHand(engine, 0, ['A01']);
    
    engine.startTurn();
    engine.startQuizPhase();
    engine.setQuizResult(0, 3);
    
    engine.playCard(0, 'A01', 'player');
    
    expect(engine.comboThisTurn.length).toBe(0);
  });
});

// ============================================================
// 3. Combo 效果应用 — extra_damage 类
// ============================================================

describe('Combo 效果 — extra_damage', () => {
  // 辅助卡→攻击卡 combo：先出辅助，再出攻击
  // pendingCombo 在辅助卡出牌时设定，在攻击卡 _handleAttack 时应用
  
  it('S01→A01: +65伤害', () => {
    const engine = createEngine(['S01', 'A01']);
    setHand(engine, 0, ['S01', 'A01']);
    
    const results = playCardsInTurn(engine, 0, ['S01', 'A01']);
    const atkResult = results[1]; // A01的结果
    
    // combo效果记录在攻击卡的effects中
    const comboDmg = atkResult.effects.find(e => e.type === 'combo_extra_dmg');
    expect(comboDmg).toBeDefined();
    expect(comboDmg.value).toBe(65);
  });

  it('S01→A02: +40伤害', () => {
    const engine = createEngine(['S01', 'A02']);
    setHand(engine, 0, ['S01', 'A02']);
    
    const results = playCardsInTurn(engine, 0, ['S01', 'A02']);
    const comboDmg = results[1].effects.find(e => e.type === 'combo_extra_dmg');
    expect(comboDmg).toBeDefined();
    expect(comboDmg.value).toBe(40);
  });

  it('S03→A03: +65伤害', () => {
    const engine = createEngine(['S03', 'A03']);
    setHand(engine, 0, ['S03', 'A03']);
    
    const results = playCardsInTurn(engine, 0, ['S03', 'A03']);
    const comboDmg = results[1].effects.find(e => e.type === 'combo_extra_dmg');
    expect(comboDmg).toBeDefined();
    expect(comboDmg.value).toBe(65);
  });

  it('S16→A19: +25伤害（光领域）', () => {
    const engine = createEngine(['S16', 'A19'], ['A01'], '光', '电');
    setHand(engine, 0, ['S16', 'A19']);
    
    const results = playCardsInTurn(engine, 0, ['S16', 'A19']);
    const comboDmg = results[1].effects.find(e => e.type === 'combo_extra_dmg');
    expect(comboDmg).toBeDefined();
    expect(comboDmg.value).toBe(25);
  });

  it('S27→A36: +25伤害（电领域）', () => {
    const engine = createEngine(['S27', 'A36'], ['A01'], '电', '热');
    setHand(engine, 0, ['S27', 'A36']);
    
    const results = playCardsInTurn(engine, 0, ['S27', 'A36']);
    const comboDmg = results[1].effects.find(e => e.type === 'combo_extra_dmg');
    expect(comboDmg).toBeDefined();
    expect(comboDmg.value).toBe(25);
  });

  it('S28→A40: +20伤害（电领域）', () => {
    const engine = createEngine(['S28', 'A40'], ['A01'], '电', '热');
    setHand(engine, 0, ['S28', 'A40']);
    
    const results = playCardsInTurn(engine, 0, ['S28', 'A40']);
    const comboDmg = results[1].effects.find(e => e.type === 'combo_extra_dmg');
    expect(comboDmg).toBeDefined();
    expect(comboDmg.value).toBe(20);
  });

  it('S07→A14: +30伤害（声领域）', () => {
    const engine = createEngine(['S07', 'A14'], ['A01'], '声', '热');
    setHand(engine, 0, ['S07', 'A14']);
    
    const results = playCardsInTurn(engine, 0, ['S07', 'A14']);
    const comboDmg = results[1].effects.find(e => e.type === 'combo_extra_dmg');
    expect(comboDmg).toBeDefined();
    expect(comboDmg.value).toBe(30);
  });

  it('S09升→A09: +15伤害（声领域）', () => {
    const engine = createEngine(['S09', 'A09'], ['A01'], '声', '热');
    setHand(engine, 0, ['S09', 'A09']);
    
    const results = playCardsInTurn(engine, 0, ['S09', 'A09']);
    const comboDmg = results[1].effects.find(e => e.type === 'combo_extra_dmg');
    expect(comboDmg).toBeDefined();
    expect(comboDmg.value).toBe(15);
  });

  it('S09升→A13: +30伤害（声领域）', () => {
    const engine = createEngine(['S09', 'A13'], ['A01'], '声', '热');
    setHand(engine, 0, ['S09', 'A13']);
    
    const results = playCardsInTurn(engine, 0, ['S09', 'A13']);
    const comboDmg = results[1].effects.find(e => e.type === 'combo_extra_dmg');
    expect(comboDmg).toBeDefined();
    expect(comboDmg.value).toBe(30);
  });

  it('A39→A52: +20伤害（跨领域）', () => {
    const engine = createEngine(['A39', 'A52'], ['A01'], '光', '电');
    setHand(engine, 0, ['A39', 'A52']);
    
    const results = playCardsInTurn(engine, 0, ['A39', 'A52']);
    const comboDmg = results[1].effects.find(e => e.type === 'combo_extra_dmg');
    expect(comboDmg).toBeDefined();
    expect(comboDmg.value).toBe(20);
  });
});

// ============================================================
// 4. Combo 效果 — extra_burn
// ============================================================

describe('Combo 效果 — extra_burn', () => {
  it('A17→A23: +1层灼烧（光领域）', () => {
    const engine = createEngine(['A17', 'A23'], ['A01'], '光', '热');
    setHand(engine, 0, ['A17', 'A23']);
    
    const results = playCardsInTurn(engine, 0, ['A17', 'A23']);
    const burnEffect = results[1].effects.find(e => e.type === 'combo_extra_burn');
    expect(burnEffect).toBeDefined();
    expect(burnEffect.layers).toBe(1);
  });

  it('A22→A24: +1层灼烧（热领域）', () => {
    const engine = createEngine(['A22', 'A24'], ['A01'], '热', '力');
    setHand(engine, 0, ['A22', 'A24']);
    
    const results = playCardsInTurn(engine, 0, ['A22', 'A24']);
    const burnEffect = results[1].effects.find(e => e.type === 'combo_extra_burn');
    expect(burnEffect).toBeDefined();
    expect(burnEffect.layers).toBe(1);
  });
});

// ============================================================
// 5. Combo 效果 — steal_spirit
// ============================================================

describe('Combo 效果 — steal_spirit', () => {
  it('A25→A26: 偷取25点精神力（热领域）', () => {
    const engine = createEngine(['A25', 'A26'], ['A01'], '热', '力');
    setHand(engine, 0, ['A25', 'A26']);
    engine.players[1].burnLayers = 3;  // A26需要2层灼烧
    engine.players[1].spirit = 50;
    
    const results = playCardsInTurn(engine, 0, ['A25', 'A26']);
    const stealEffect = results[1].effects.find(e => e.type === 'combo_steal_spirit');
    expect(stealEffect).toBeDefined();
    expect(stealEffect.value).toBe(25);
  });
});

// ============================================================
// 6. Combo 效果 — modify_flag
// ============================================================

describe('Combo 效果 — modify_flag', () => {
  it('S33→A49: 设置 a49_no_destroy 标记', () => {
    const engine = createEngine(['S33', 'A49'], ['A01'], '电', '力');
    setHand(engine, 0, ['S33', 'A49']);
    // A49需要3张电辅助才翻倍
    const sCard = engine.getCardById('S27');
    if (sCard) {
      for (let i = 0; i < 3; i++) {
        engine.players[0].fieldSupports.push({ card: sCard, turnsRemaining: 3 });
      }
    }
    
    const results = playCardsInTurn(engine, 0, ['S33', 'A49']);
    const flagEffect = results[1].effects.find(e => e.type === 'combo_flag');
    expect(flagEffect).toBeDefined();
    expect(flagEffect.flag).toBe('a49_no_destroy');
  });

  it('C03↔C04: 设置 c04_choose 标记', () => {
    const engine = createEngine(['C03', 'C04'], ['A01'], '声', '力');
    setHand(engine, 0, ['C03', 'C04']);
    
    const results = playCardsInTurn(engine, 0, ['C03', 'C04']);
    const flagEffect = results[1].effects.find(e => e.type === 'combo_flag');
    expect(flagEffect).toBeDefined();
    expect(flagEffect.flag).toBe('c04_choose');
  });
});

// ============================================================
// 7. Combo 效果 — extra_dot / extend_dot_turns
// ============================================================

describe('Combo 效果 — DOT相关', () => {
  it('C05→A02: 追加DOT 15伤害1回合', () => {
    const engine = createEngine(['C05', 'A02'], ['A01'], '力', '热');
    setHand(engine, 0, ['C05', 'A02']);
    
    const results = playCardsInTurn(engine, 0, ['C05', 'A02']);
    const dotEffect = results[1].effects.find(e => e.type === 'combo_extra_dot');
    expect(dotEffect).toBeDefined();
    expect(dotEffect.dmg).toBe(15);
    expect(dotEffect.turns).toBe(1);
  });

  it('C01→A02: DOT延续回合+1', () => {
    const engine = createEngine(['C01', 'A02'], ['A01'], '力', '热');
    setHand(engine, 0, ['C01', 'A02']);
    
    const results = playCardsInTurn(engine, 0, ['C01', 'A02']);
    const extendEffect = results[1].effects.find(e => e.type === 'combo_extend_dot');
    expect(extendEffect).toBeDefined();
    expect(extendEffect.value).toBe(1);
  });

  it('S09降→A10: DOT延续回合+2', () => {
    const engine = createEngine(['S09', 'A10'], ['A01'], '声', '热');
    setHand(engine, 0, ['S09', 'A10']);
    // S09默认升模式，需手动设为降
    // S09打出后默认设置cardForms['S09'] = 'up'
    // 需要在出牌后手动切换
    
    engine.startTurn();
    engine.startQuizPhase();
    engine.setQuizResult(0, 3);
    
    engine.playCard(0, 'S09', 'player');
    // 手动改为降模式
    engine.players[0].cardForms['S09'] = 'down';
    const r2 = engine.playCard(0, 'A10', 'player');
    
    const extendEffect = r2.effects.find(e => e.type === 'combo_extend_dot');
    expect(extendEffect).toBeDefined();
    expect(extendEffect.value).toBe(2);
  });
});

// ============================================================
// 8. Combo 效果 — view_hand
// ============================================================

describe('Combo 效果 — view_hand', () => {
  it('S10→A45: 查看对方全部手牌', () => {
    const engine = createEngine(['S10', 'A45'], ['A01'], '声', '力');
    setHand(engine, 0, ['S10', 'A45']);
    
    const results = playCardsInTurn(engine, 0, ['S10', 'A45']);
    const viewEffect = results[1].effects.find(e => e.type === 'combo_view_hand');
    expect(viewEffect).toBeDefined();
    expect(viewEffect.count).toBe('all');
  });

  it('C03→A45: 查看对方全部手牌', () => {
    const engine = createEngine(['C03', 'A45'], ['A01'], '声', '力');
    setHand(engine, 0, ['C03', 'A45']);
    
    const results = playCardsInTurn(engine, 0, ['C03', 'A45']);
    const viewEffect = results[1].effects.find(e => e.type === 'combo_view_hand');
    expect(viewEffect).toBeDefined();
    expect(viewEffect.count).toBe('all');
  });
});

// ============================================================
// 9. 召唤物 → 攻击 combo
// ============================================================

describe('召唤物combo', () => {
  it('C10→A14: +25伤害', () => {
    const engine = createEngine(['C10', 'A14'], ['A01'], '声', '热');
    setHand(engine, 0, ['C10', 'A14']);
    
    const results = playCardsInTurn(engine, 0, ['C10', 'A14']);
    const comboDmg = results[1].effects.find(e => e.type === 'combo_extra_dmg');
    expect(comboDmg).toBeDefined();
    expect(comboDmg.value).toBe(25);
  });

  it('C08→A36: +20伤害', () => {
    const engine = createEngine(['C08', 'A36'], ['A01'], '热', '电');
    setHand(engine, 0, ['C08', 'A36']);
    
    const results = playCardsInTurn(engine, 0, ['C08', 'A36']);
    const comboDmg = results[1].effects.find(e => e.type === 'combo_extra_dmg');
    expect(comboDmg).toBeDefined();
    expect(comboDmg.value).toBe(20);
  });
});

// ============================================================
// 10. 跨领域combo
// ============================================================

describe('跨领域combo', () => {
  it('A39→A52: +20伤害（光+电）', () => {
    const engine = createEngine(['A39', 'A52'], ['A01'], '光', '电');
    setHand(engine, 0, ['A39', 'A52']);
    
    const results = playCardsInTurn(engine, 0, ['A39', 'A52']);
    const comboDmg = results[1].effects.find(e => e.type === 'combo_extra_dmg');
    expect(comboDmg).toBeDefined();
    expect(comboDmg.value).toBe(20);
  });
});

// ============================================================
// 11. Combo 伤害数值端到端验证
// ============================================================

describe('Combo 伤害端到端验证', () => {
  it('S01→A01 combo: 实际HP减少应包含额外伤害', () => {
    const engine = createEngine(['S01', 'A01']);
    setHand(engine, 0, ['S01', 'A01']);
    
    const oppHpBefore = engine.players[1].hp;
    
    const results = playCardsInTurn(engine, 0, ['S01', 'A01'], 0); // 0%答题加成
    const oppHpAfter = engine.players[1].hp;
    
    const totalDmg = oppHpBefore - oppHpAfter;
    // A01基础75 + combo 65 = 至少140
    expect(totalDmg).toBeGreaterThanOrEqual(140);
  });
});

// ============================================================
// 12. Combo 回合清理
// ============================================================

describe('Combo 回合清理', () => {
  it('新回合开始时 pendingCombo 和 comboThisTurn 应被清空', () => {
    const engine = createEngine(['S01', 'A01', 'A02']);
    setHand(engine, 0, ['S01', 'A01']);
    
    // 出两张牌触发combo
    const results = playCardsInTurn(engine, 0, ['S01', 'A01'], 0);
    
    // combo应已触发
    expect(engine.comboThisTurn.length).toBeGreaterThan(0);
    
    // 结算并进入下回合
    engine.settlePhase();
    engine.endTurn(); // → AI回合
    engine.settlePhase();
    engine.endTurn(); // → 玩家回合
    
    // 新回合开始时，comboThisTurn 和 pendingCombo 应已清空
    expect(engine.comboThisTurn.length).toBe(0);
    expect(engine.pendingCombo[0]).toBeNull();
  });
});

// ============================================================
// 13. AI 对战 combo 触发验证
// ============================================================

describe('AI 对战 combo 验证', () => {
  it('AI makePlayDecision 应返回决策数组', () => {
    const engine = createEngine(['A01', 'A02'], ['S01', 'A01', 'A02', 'S03'], '力', '力');
    const ai = new AIEngine(engine, 'normal');
    
    // AI回合
    engine.currentPlayer = 1;
    engine.startTurn();
    engine.startQuizPhase();
    engine.setQuizResult(2, 3);
    
    const decisions = ai.makePlayDecision();
    expect(Array.isArray(decisions)).toBe(true);
  });

  it('完整AI对战20回合无崩溃', () => {
    const deck = buildDeck(['A01', 'A02', 'S01', 'S03', 'A03']);
    const engine = new GameEngine([...deck], [...deck], '力', '声', '力', '声');
    const ai = new AIEngine(engine, 'normal');
    
    for (let t = 0; t < 20; t++) {
      if (engine.isGameOver()) break;
      
      const pIdx = engine.currentPlayer;
      engine.startTurn();
      engine.startQuizPhase();
      
      if (pIdx === 1) {
        const quiz = ai.simulateQuiz();
        engine.setQuizResult(quiz.correct, quiz.total);
        
        const decisions = ai.makePlayDecision();
        for (const d of decisions) {
          if (d.cardId) {
            const card = engine.getCardById(d.cardId);
            if (card) {
              const canPlay = engine.canPlay(1, card);
              if (canPlay.can) {
                engine.playCard(1, d.cardId, d.target || 'player');
              }
            }
          }
        }
      } else {
        engine.setQuizResult(2, 3);
        const playable = engine.getPlayableCards(0).filter(c => c.canPlay);
        if (playable.length > 0) {
          engine.playCard(0, playable[0].id, 'player');
        }
      }
      
      engine.settlePhase();
      engine.endTurn();
    }
    
    expect(true).toBe(true); // 无崩溃即通过
  });
});

// ============================================================
// 14. 大规模模拟
// ============================================================

describe('大规模AI对战模拟', () => {
  it('50局AI对战无崩溃，统计combo触发率', () => {
    let comboTriggered = 0;
    let errors = [];
    const totalGames = 50;
    
    for (let g = 0; g < totalGames; g++) {
      try {
        const domains = ['力', '声', '光', '热', '电'];
        const pDomain = domains[g % 5];
        const aDomain = domains[(g + 1) % 5];
        
        const deck = buildDeck(['A01', 'A02', 'S01', 'S03', 'A03', 'S08', 'A09']);
        const engine = new GameEngine([...deck], [...deck], pDomain, '声', aDomain, '电');
        const ai = new AIEngine(engine, ['easy', 'normal', 'hard'][g % 3]);
        
        for (let t = 0; t < 20; t++) {
          if (engine.isGameOver()) break;
          
          const pIdx = engine.currentPlayer;
          engine.startTurn();
          engine.startQuizPhase();
          
          if (pIdx === 1) {
            const quiz = ai.simulateQuiz();
            engine.setQuizResult(quiz.correct, quiz.total);
            const decisions = ai.makePlayDecision();
            for (const d of decisions) {
              if (d.cardId) {
                const card = engine.getCardById(d.cardId);
                if (card) {
                  const canPlay = engine.canPlay(1, card);
                  if (canPlay.can) {
                    engine.playCard(1, d.cardId, d.target || 'player');
                  }
                }
              }
            }
          } else {
            engine.setQuizResult(2, 3);
            const playable = engine.getPlayableCards(0).filter(c => c.canPlay);
            if (playable.length > 0) {
              engine.playCard(0, playable[Math.floor(Math.random() * playable.length)].id, 'player');
            }
          }
          
          engine.settlePhase();
          engine.endTurn();
        }
        
        const comboLogs = engine.log.filter(l => l.msg && l.msg.includes('组合触发'));
        if (comboLogs.length > 0) comboTriggered++;
      } catch (e) {
        errors.push({ game: g, error: e.message });
      }
    }
    
    expect(errors.length).toBe(0);
    expect(comboTriggered).toBeGreaterThan(0);
    
    console.log(`\n📊 50局模拟结果:`);
    console.log(`   崩溃: ${errors.length}`);
    console.log(`   combo触发局数: ${comboTriggered}/${totalGames} (${(comboTriggered/totalGames*100).toFixed(0)}%)`);
  });
});
