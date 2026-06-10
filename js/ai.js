// ============================================================
// 物理卡牌对战 —— AI对手引擎
// 面向初中生，导入 GameEngine，提供三种难度级别
// ============================================================

import { GameEngine } from './engine.js';

// ============================================================
// 已知卡牌组合表（辅助卡 → 攻击卡 → 额外效果）
// ============================================================
const KNOWN_COMBOS = {
  // 力领域组合
  'S01': { attackId: 'A01', bonusDmg: 65, desc: '质量增大→重力锤击' },
  'S03': { attackId: 'A03', bonusDmg: 65, desc: '受力面积缩小→压强穿刺' },
  'S02': {
    attackIds: ['A06', 'A08'],
    bonusFor: {
      'A06': { bonusDmg: 25, dotBonus: 12 },
      'A08': { pctBonus: 0.05 } // 额外10%→15%
    },
    desc: '能量蓄积→动能冲击/做功打击'
  },

  // 声领域组合
  'S08': { attackId: 'A09', bonusDmg: 15, desc: '频率调节→超声清洗' },
  'S09': { attackId: 'A45', viewAll: true, desc: '共振蓄能→双耳定位' },
  'S06': { attackId: 'A14', bonusDmg: 30, desc: '回声消声→回声爆破' },

  // 光领域组合
  'S14': { attackId: 'A19', bonusDmg: 25, desc: '光速传播→光纤穿透' },
  'S15': { attackId: 'A16', fieldTurns: 4, zeroCostReturn: true, desc: '光谱叠加→色散分解' },

  // 热领域组合
  'S19': { attackId: 'A54', burnDmgPerLayer: '48→62', desc: '温度升高→爆燃' },
  'S21': { attackId: 'A21', bonusPerBurn: 10, desc: '热量聚集→烈焰灼蚀' },

  // 电领域组合
  'S29': { attackId: 'A27', ignoreDefBonus: 10, desc: '高压击穿→闪电劈击' },
  'S31': { attackId: 'A49', preventDestroy: true, desc: '多路放电→过载放电' }
};

// 灭杀型攻击卡（优先攻击召唤物）
const SUMMON_ELIMINATOR_IDS = new Set(['A18', 'A25', 'A30', 'A07', 'A35']);

// ============================================================
// AIEngine 类
// ============================================================
class AIEngine {
  /**
   * @param {GameEngine} engine - 游戏引擎实例
   * @param {string} difficulty - 难度："easy"|"normal"|"hard"
   */
  constructor(engine, difficulty) {
    /** @type {GameEngine} */
    this.engine = engine;
    this.difficulty = this._normalizeDifficulty(difficulty);
    this.aiIdx = 1;       // AI固定为玩家索引 1
    this.oppIdx = 0;      // 对手（人类玩家）索引 0
    this.pendingDecisions = null; // 待出牌决策队列（用于逐张出牌）
  }

  // ==========================================================
  // 难度归一化
  // ==========================================================
  _normalizeDifficulty(d) {
    const valid = ['easy', 'normal', 'hard'];
    return valid.includes(d) ? d : 'normal';
  }

  // ==========================================================
  // 获取完整游戏状态快照
  // ==========================================================
  _getGameState() {
    return this.engine.getGameState();
  }

  /** 获取AI玩家状态 */
  _getSelf() {
    return this.engine.players[this.aiIdx];
  }

  /** 获取对手状态 */
  _getOpp() {
    return this.engine.players[this.oppIdx];
  }

  // ==========================================================
  // 答题模拟 —— simulateQuiz()
  // ==========================================================

  /**
   * 模拟答题结果
   * easy: 50%正确率，偏向1-2题
   * normal: 70%正确率，偏向2-3题
   * hard: 90%正确率，偏向3题
   * @returns {{ correct: number, total: number }}
   */
  simulateQuiz() {
    const total = 3;
    let correct;

    switch (this.difficulty) {
      case 'easy': {
        // 50%正确率，偏向1-2题
        const roll = Math.random();
        if (roll < 0.15) correct = 0;
        else if (roll < 0.55) correct = 1;
        else if (roll < 0.90) correct = 2;
        else correct = 3;
        break;
      }
      case 'normal': {
        // 70%正确率，偏向2-3题
        const roll = Math.random();
        if (roll < 0.05) correct = 0;
        else if (roll < 0.25) correct = 1;
        else if (roll < 0.70) correct = 2;
        else correct = 3;
        break;
      }
      case 'hard': {
        // 90%正确率，偏向3题
        const roll = Math.random();
        if (roll < 0.02) correct = 1;
        else if (roll < 0.20) correct = 2;
        else correct = 3;
        break;
      }
      default:
        correct = 2;
    }

    return { correct, total };
  }

  // ==========================================================
  // 思考延迟 —— getThinkDelay()
  // ==========================================================

  /**
   * AI思考延迟（模拟真人思考时间）
   * easy: 1-3秒
   * normal: 2-4秒
   * hard: 1.5-3秒（更果断）
   * @returns {number} 毫秒
   */
  getThinkDelay() {
    switch (this.difficulty) {
      case 'easy':
        return 1000 + Math.random() * 2000;
      case 'normal':
        return 2000 + Math.random() * 2000;
      case 'hard':
        return 1500 + Math.random() * 1500;
      default:
        return 2000;
    }
  }

  /** 内部sleep辅助 */
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ==========================================================
  // 出牌决策 —— makePlayDecision()
  // ==========================================================

  /**
   * AI出牌决策，按优先级依次判断
   * @returns {Array<{ cardId: string, target: string }>} 按顺序的出牌序列
   */
  makePlayDecision() {
    const self = this._getSelf();
    const opp = this._getOpp();
    const hand = [...self.hand];
    let spirit = self.spirit;
    const gameState = this._getGameState();

    const decisions = [];
    const usedIds = new Set();

    /** 帮辅函数：消耗手牌和精神力 */
    const useCard = (card, target = 'player') => {
      if (!card) return false;
      decisions.push({ cardId: card.id, target });
      spirit -= card.cost;
      usedIds.add(card.id);
      return true;
    };

    // easy难度：随机出牌
    if (this.difficulty === 'easy') {
      return this._makeRandomDecision(hand, spirit);
    }

    // ==========================================================
    // 1. 绝境翻盘：HP < 30% → 打出相变卡
    // ==========================================================
    const hpPercent = self.hp / self.maxHp;
    if (hpPercent < 0.3) {
      const phaseCards = hand.filter(
        c => c.type === 'phase' && c.cost <= spirit && !usedIds.has(c.id)
      );
      for (const pc of phaseCards) {
        // T02只能在HP<30%打出
        if (pc.id === 'T02' && hpPercent >= 0.3) continue;
        if (useCard(pc)) break;
      }
    }

    // ==========================================================
    // 2. 领域卡：场上无领域卡时打出
    // ==========================================================
    if (!self.fieldDomain) {
      const domainCards = hand.filter(
        c => c.type === 'domain' && c.cost <= spirit && !usedIds.has(c.id)
      );
      if (domainCards.length > 0) {
        // hard难度：优先匹配己方主/副领域
        if (this.difficulty === 'hard') {
          const matchDomain = domainCards.find(
            c => c.domain.includes(self.domain.main) || c.domain.includes(self.domain.sub)
          );
          useCard(matchDomain || domainCards[0]);
        } else {
          useCard(domainCards[0]);
        }
      }
    }

    // ==========================================================
    // 3. 组合：先打辅助再打对应攻击
    // ==========================================================
    const combo = this.getBestCombo(hand, spirit, usedIds, gameState);
    if (combo) {
      // 先打出辅助卡
      const supportCard = hand.find(
        c => c.id === combo.supportCardId && !usedIds.has(c.id)
      );
      const attackCard = hand.find(
        c => c.id === combo.attackCardId && !usedIds.has(c.id)
      );

      if (supportCard && attackCard) {
        const totalCost = (supportCard.cost || 0) + (attackCard.cost || 0);
        if (totalCost <= spirit) {
          useCard(supportCard);
          useCard(attackCard, combo.target);
        }
      }
    }

    // ==========================================================
    // 4. 召唤卡（精神力充裕，召唤物未满）
    // ==========================================================
    if (spirit >= 20 && self.fieldSummons.length < 2) {
      const summons = hand.filter(
        c => c.type === 'summon' && c.cost <= spirit && !usedIds.has(c.id)
      );
      if (summons.length > 0) {
        // hard难度优先选择匹配领域的召唤物
        if (this.difficulty === 'hard') {
          const matchSummon = summons.find(
            c => c.domain.some(d => d === self.domain.main || d === self.domain.sub)
          );
          if (matchSummon) {
            useCard(matchSummon);
          }
        } else {
          // normal: 简单按费用挑选
          summons.sort((a, b) => (b.cost || 0) - (a.cost || 0));
          useCard(summons[0]);
        }
      }
    }

    // ==========================================================
    // 5. 攻击卡：按性价比打出
    // ==========================================================
    let maxIterations = 10;
    while (spirit > 0 && maxIterations-- > 0) {
      const attacks = hand.filter(
        c => c.type === 'attack' && c.cost <= spirit && !usedIds.has(c.id)
      );
      if (attacks.length === 0) break;

      const best = this.getBestAttack(attacks, spirit, gameState);
      if (!best) break;

      const target = this.getBestTarget(best, gameState);
      useCard(best, target);
    }

    // ==========================================================
    // 6. 辅助卡：剩余精神力打出
    // ==========================================================
    maxIterations = 5;
    while (spirit > 0 && maxIterations-- > 0) {
      const supports = hand.filter(
        c => c.type === 'support' && c.cost <= spirit && !usedIds.has(c.id)
      );
      if (supports.length === 0) break;

      // 优选增伤/效果辅助
      const bestSupport = this._pickBestSupport(supports, gameState);
      if (!bestSupport) break;

      useCard(bestSupport);
    }

    // ==========================================================
    // 7. 剩余精神力打其他卡（领域/召唤补充）
    // ==========================================================
    const remaining = hand.filter(c => c.cost <= spirit && !usedIds.has(c.id));
    if (remaining.length > 0 && this.difficulty === 'hard') {
      // hard难度额外尝试
      // 如果还有领域卡没打也试一下（之前可能因为匹配跳过）
      const extraDomain = remaining.find(
        c => c.type === 'domain' && !self.fieldDomain
      );
      if (extraDomain && useCard(extraDomain)) {
        // 已打出
      }

      // 未满召唤物
      if (self.fieldSummons.length < 2 && spirit >= 20) {
        const extraSummon = remaining.find(c => c.type === 'summon');
        if (extraSummon) useCard(extraSummon);
      }
    }

    return decisions;
  }

  /**
   * 逐张出牌模式：获取AI的下一张出牌决策
   * 首次调用自动生成全部决策队列，后续逐个弹出
   * 当AI剩余精神力因外部事件（如对方光速传播出牌）变化时，
   * 会自动跳过费用不足的决策
   * @returns {{ cardId: string, target: string } | null}
   */
  getNextPlayDecision() {
    if (!this.pendingDecisions || this.pendingDecisions.length === 0) {
      this.pendingDecisions = this.makePlayDecision();
    }
    // 弹出下一张，同时检查是否仍有足够精神力
    while (this.pendingDecisions.length > 0) {
      const decision = this.pendingDecisions.shift();
      const self = this._getSelf();
      const card = this.engine.getCardById(decision.cardId);
      if (card && self.spirit >= card.cost) {
        return decision;
      }
      // 精神力不足，跳过这张
    }
    return null;
  }

  /**
   * 重置出牌决策队列（新回合开始时调用）
   */
  resetPlayDecisions() {
    this.pendingDecisions = null;
  }

  // ==========================================================
  // easy难度：随机出牌
  // ==========================================================
  _makeRandomDecision(hand, spirit) {
    const decisions = [];
    const shuffled = [...hand].sort(() => Math.random() - 0.5);

    for (const card of shuffled) {
      if (card.cost <= spirit) {
        const target = card.type === 'attack'
          ? this._randomTarget()
          : 'player';
        decisions.push({ cardId: card.id, target });
        spirit -= card.cost;
      }
      if (spirit <= 0) break;
    }

    return decisions;
  }

  /** 随机选择攻击目标 */
  _randomTarget() {
    const opp = this._getOpp();
    const targets = ['player'];
    for (let i = 0; i < opp.fieldSummons.length; i++) {
      targets.push(`summon_${i}`);
    }
    return targets[Math.floor(Math.random() * targets.length)];
  }

  // ==========================================================
  // 攻击性价比评估 —— getBestAttack()
  // ==========================================================

  /**
   * 选择性价比最高的攻击卡
   * 性价比 = 预期伤害 / 费用，考虑领域加成、召唤物加成、条件触发
   * @param {Array} hand - 可选攻击卡列表
   * @param {number} spirit - 剩余精神力
   * @param {object} gameState - 游戏状态
   * @returns {object|null} 最优攻击卡
   */
  getBestAttack(hand, spirit, gameState) {
    if (hand.length === 0) return null;
    const self = this._getSelf();
    const opp = this._getOpp();

    const scored = hand.map(card => {
      let value = this._estimateAttackDamage(card);

      // 附加价值：消灭驻场卡
      const special = card.effect.special || '';
      if (special.includes('消灭') && special.includes('驻场')) {
        if (opp.fieldSupports.length > 0 || opp.fieldDomain) {
          value += 30; // 消灭驻场卡额外价值
        }
      }

      // 附加价值：灼烧
      if (card.effect.burnLayers) {
        value += card.effect.burnLayers * 20;
      }

      // 附加价值：子弹回卡
      if (special.includes('弹回')) {
        value += 25;
      }

      // 附加价值：查看手牌
      if (special.includes('查看') && special.includes('手牌')) {
        value += 15;
      }

      // 附加价值：偷取精神力
      if (special.includes('偷取') && special.includes('精神力')) {
        value += 20;
      }

      // 特殊负面卡避免打（对己方有害的辅助卡、会摧毁自己辅助的攻击）
      if (card.id === 'A49' && self.fieldSupports.filter(s => s.card.domain.includes('电')).length < 3) {
        value *= 0.7; // A49过载放电条件不足时贬值
      }

      // 性价比分数
      const efficiency = value / Math.max(1, card.cost);

      return { card, efficiency, value };
    });

    // 排序：性价比高的优先
    scored.sort((a, b) => b.efficiency - a.efficiency);

    // hard难度额外考虑后续回合规划
    if (this.difficulty === 'hard') {
      // 如果有两个攻击卡分数相近，优先选费用低+伤害稳定的
      if (scored.length >= 2 && Math.abs(scored[0].efficiency - scored[1].efficiency) < 1.0) {
        if (scored[1].card.cost < scored[0].card.cost) {
          // 低费优先以保留精神力
          return scored[1].card;
        }
      }
    }

    return scored[0]?.card || null;
  }

  /**
   * 估算攻击卡预期伤害（考虑当前场上状态）
   * @param {object} card - 攻击卡对象
   * @returns {number} 预期伤害估计
   */
  _estimateAttackDamage(card) {
    const self = this._getSelf();
    const opp = this._getOpp();
    let dmg = card.effect.dmg || 0;

    // 领域加成
    if (self.fieldDomain) {
      const dCard = self.fieldDomain.card;
      if (dCard.effect.bonusDmg && card.domain.some(d => dCard.domain.includes(d))) {
        dmg += dCard.effect.bonusDmg;
      }
      // D02声领域特殊加成
      if (dCard.id === 'D02' && card.domain.includes('声')) {
        const soundCount = self.fieldSupports.filter(s => s.card.domain.includes('声')).length;
        dmg += soundCount * 8;
      }
    }

    // 召唤物加成
    for (const s of self.fieldSummons) {
      if (s.card.effect.dmgBonus) {
        const sDomains = s.card.domain;
        if (card.domain.some(d => sDomains.includes(d))) {
          dmg += s.card.effect.dmgBonus;
        }
      }
      // 安培(C14)：每层麻痹+2电攻
      if (s.card.id === 'C14' && card.domain.includes('电')) {
        dmg += opp.paralysis * 2;
      }
      // 瓦特(C13)：每层灼烧+3热攻
      if (s.card.id === 'C13' && card.domain.includes('热')) {
        dmg += opp.burnLayers * 3;
      }
      // 伽利略(C09)：每驻场辅助+3光攻
      if (s.card.id === 'C09' && card.domain.includes('光')) {
        dmg += self.fieldSupports.length * 3;
      }
    }

    // 串联增压（电系）
    if (card.domain.includes('电')) {
      const elecCount = self.fieldSupports.filter(s => s.card.domain.includes('电')).length;
      dmg += elecCount * 15;
    }

    // 条件效果预估
    if (card.effect.conditional) {
      const cond = card.effect.conditional;
      if (cond.condition.includes('己方辅助卡') || cond.condition.includes('驻场辅助')) {
        dmg += self.fieldSupports.length * (cond.bonusDmg || 0);
      }
      if (cond.condition.includes('灼烧')) {
        dmg += opp.burnLayers * (cond.bonusDmg || 0);
      }
      if (cond.condition.includes('对方场上每张卡')) {
        const df = opp.fieldSummons.length + (opp.fieldDomain ? 1 : 0) + opp.fieldSupports.length;
        dmg += df * (cond.bonusDmg || 0);
      }
      if (cond.condition.includes('己方有') && cond.condition.includes('领域')) {
        if (self.fieldDomain) dmg += cond.bonusDmg || 0;
      }
      if (cond.condition.includes('电辅助')) {
        const ec = self.fieldSupports.filter(s => s.card.domain.includes('电')).length;
        const m = cond.condition.match(/≥(\d+)/);
        if (ec >= (m ? parseInt(m[1]) : 1)) dmg += cond.bonusDmg || 0;
      }
      if (cond.condition.includes('已受电系伤害')) {
        // A48静电爆发：后续电击可触发，预估50%概率
        dmg += Math.floor((cond.bonusDmg || 0) * 0.5);
      }
    }

    // 特殊攻击预估
    if (card.id === 'A02') {
      // 惯性冲锋：上回合力系伤害50%额外
      dmg += Math.floor((self.totalForceDmg || 0) * 0.5);
    }
    if (card.id === 'A08') {
      // 做功打击：附加已损失HP的10%
      const lostHp = self.maxHp - opp.hp;
      dmg += Math.floor(lostHp * 0.1);
    }
    if (card.id === 'A54') {
      // 爆燃：引爆灼烧层数
      const burnDmg = opp.burnLayers * 48;
      dmg += burnDmg;
    }
    if (card.id === 'A51') {
      // 声速激增：下回声系攻击+buff
      dmg += opp.burnLayers * 6;
    }
    if (card.id === 'A41') {
      // 太阳能聚变：热领域+70
      if (self.fieldDomain?.card?.domain?.includes('热')) {
        dmg += 70;
      }
    }
    if (card.id === 'A53') {
      // 镜面回声：声光+10
      dmg += 10; // 预估附加
    }

    // 答题增益
    const quizBonus = (this.engine.quizResult?.bonus || 0);
    dmg = Math.floor(dmg * (1 + quizBonus));

    // 临界突破(T02)翻倍效果：硬难度考虑
    // 此处不处理，因为T02在出牌前就已打出

    return dmg;
  }

  // ==========================================================
  // 组合检测 —— getBestCombo()
  // ==========================================================

  /**
   * 寻找手牌中的最佳辅助→攻击组合
   * @param {Array} hand - 手牌列表
   * @param {number} spirit - 精神力
   * @param {Set} usedIds - 已使用的卡牌ID
   * @param {object} gameState - 游戏状态
   * @returns {object|null} { supportCardId, attackCardId, target, bonusDmg }
   */
  getBestCombo(hand, spirit, usedIds, gameState) {
    if (this.difficulty === 'easy') return null;

    const opp = this._getOpp();
    const available = hand.filter(c => !usedIds.has(c.id));

    // 收集所有可用的辅助卡和攻击卡
    const supports = available.filter(c => c.type === 'support');
    const attacks = available.filter(c => c.type === 'attack');

    let bestCombo = null;
    let bestValue = 0;

    for (const support of supports) {
      const comboInfo = KNOWN_COMBOS[support.id];
      if (!comboInfo) continue;

      // 单攻击组合
      if (comboInfo.attackId) {
        const attack = attacks.find(a => a.id === comboInfo.attackId);
        if (attack && support.cost + attack.cost <= spirit) {
          const value = comboInfo.bonusDmg || 15;
          if (value > bestValue) {
            bestValue = value;
            const target = this._getTargetForComboAttack(attack.id, opp);
            bestCombo = {
              supportCardId: support.id,
              attackCardId: attack.id,
              target,
              bonusDmg: comboInfo.bonusDmg || 0
            };
          }
        }
      }

      // 多攻击组合
      if (comboInfo.attackIds) {
        for (const atkId of comboInfo.attackIds) {
          const attack = attacks.find(a => a.id === atkId);
          if (attack && support.cost + attack.cost <= spirit) {
            // 多攻击组合保守估值
            const value = (comboInfo.bonusFor?.[atkId]?.bonusDmg) || 20;
            if (value > bestValue) {
              bestValue = value;
              const target = this._getTargetForComboAttack(attack.id, opp);
              bestCombo = {
                supportCardId: support.id,
                attackCardId: attack.id,
                target,
                bonusDmg: comboInfo.bonusFor?.[atkId]?.bonusDmg || 0
              };
            }
          }
        }
      }
    }

    return bestCombo;
  }

  /**
   * 为组合攻击选择目标
   */
  _getTargetForComboAttack(attackId, opp) {
    // 灭杀型攻击优先打召唤物
    if (SUMMON_ELIMINATOR_IDS.has(attackId) && opp.fieldSummons.length > 0) {
      // 找HP最低的召唤物
      let minHp = Infinity;
      let minIdx = 0;
      for (let i = 0; i < opp.fieldSummons.length; i++) {
        if (opp.fieldSummons[i].hp < minHp) {
          minHp = opp.fieldSummons[i].hp;
          minIdx = i;
        }
      }
      return `summon_${minIdx}`;
    }
    return 'player';
  }

  // ==========================================================
  // 最优攻击目标 —— getBestTarget()
  // ==========================================================

  /**
   * 选择最优攻击目标
   * 对方有召唤物时，优先消灭低HP召唤物
   * 灭杀型攻击卡优先打召唤物
   * @param {object} attackCard - 攻击卡对象
   * @param {object} gameState - 游戏状态
   * @returns {string} 目标标识 "player"|"summon_N"
   */
  getBestTarget(attackCard, gameState) {
    const opp = this._getOpp();

    if (opp.fieldSummons.length === 0) {
      return 'player';
    }

    // 灭杀型攻击卡：优先消灭召唤物
    if (SUMMON_ELIMINATOR_IDS.has(attackCard.id)) {
      // 找HP最低的召唤物
      let minHp = Infinity;
      let minIdx = 0;
      for (let i = 0; i < opp.fieldSummons.length; i++) {
        if (opp.fieldSummons[i].hp < minHp) {
          minHp = opp.fieldSummons[i].hp;
          minIdx = i;
        }
      }
      return `summon_${minIdx}`;
    }

    // 估算伤害
    const estDmg = this._estimateAttackDamage(attackCard);

    // 硬难度：判断是否能击杀召唤物
    if (this.difficulty === 'hard') {
      for (let i = 0; i < opp.fieldSummons.length; i++) {
        const summon = opp.fieldSummons[i];
        if (estDmg >= summon.hp && summon.hp > 0) {
          // 优先击杀惠更斯(C11，有闪避的)
          if (summon.card.id === 'C11') {
            return `summon_${i}`;
          }
          // 优先击杀芝诺龟(C01，伤害减半的)
          if (summon.card.id === 'C01') {
            return `summon_${i}`;
          }
          // 能单次击杀的低HP召唤物
          if (summon.hp <= 150) {
            return `summon_${i}`;
          }
        }
      }

      // normal/hard: 范围攻击考虑
      // 对方有惠更斯(闪避效果)优先攻击玩家（避免被闪避）
      if (opp.fieldSummons.some(s => s.card.id === 'C11')) {
        // 如果达不到惠更斯HP或者不是关键卡，打玩家
        return 'player';
      }
    }

    // normal难度：简单判断
    if (this.difficulty === 'normal') {
      // 仅当攻击卡为灭杀型或召唤物HP极低时打召唤物
      const weakSummonIdx = opp.fieldSummons.findIndex(s => s.hp <= 60);
      if (weakSummonIdx >= 0) {
        return `summon_${weakSummonIdx}`;
      }
    }

    return 'player';
  }

  // ==========================================================
  // 辅助卡挑选 —— _pickBestSupport()
  // ==========================================================

  /**
   * 从可用的辅助卡中选择当前最有价值的
   * @param {Array} supports - 可选辅助卡列表
   * @param {object} gameState - 游戏状态
   * @returns {object|null} 最优辅助卡
   */
  _pickBestSupport(supports, gameState) {
    if (supports.length === 0) return null;

    const self = this._getSelf();
    const opp = this._getOpp();

    const scored = supports.map(card => {
      let value = 0;

      // 增伤辅助：高价值
      if (card.effect.buffDmg) {
        value += card.effect.buffDmg * 1.5;
      }

      // 防御辅助
      if (card.effect.defense) {
        value += card.effect.defense.value || 20;
      }

      // 精神力恢复
      if (card.effect.spiritRestore) {
        value += card.effect.spiritRestore * 1.2;
      }

      // 特殊效果评分
      const special = card.effect.special || '';
      if (special.includes('附加') && special.includes('灼烧')) {
        const match = special.match(/(\d+)层灼烧/);
        if (match) value += parseInt(match[1]) * 25;
      }
      if (special.includes('查看') && special.includes('手牌')) {
        value += 20;
      }

      // 需要条件才能发动的辅助卡降分
      if (card.id === 'S18' || card.id === 'S20') {
        // 需要自身灼烧≥2
        if (self.burnLayers < 2) value *= 0.3;
      }
      if (card.id === 'S27') {
        // 需要牺牲电辅助
        const hasElec = self.fieldSupports.some(s => s.card.domain.includes('电'));
        if (!hasElec) value = 0;
      }
      if (card.id === 'S35') {
        // 需要对方场上有卡
        const oppHasField = opp.fieldSummons.length > 0 ||
          opp.fieldDomain || opp.fieldSupports.length > 0;
        if (!oppHasField) value *= 0.3;
      }

      // 效率分数
      const efficiency = value / Math.max(1, card.cost);

      return { card, efficiency, value };
    });

    scored.sort((a, b) => b.efficiency - a.efficiency);
    return scored[0]?.card || null;
  }

  // ==========================================================
  // 卡牌价值评估 —— evaluateCardValue()
  // ==========================================================

  /**
   * 评估卡牌在当前游戏状态下的整体价值
   * @param {object} card - 卡牌对象
   * @param {object} gameState - 游戏状态
   * @returns {number} 价值分数
   */
  evaluateCardValue(card, gameState) {
    const self = this._getSelf();
    const opp = this._getOpp();
    let value = 0;

    switch (card.type) {
      case 'attack':
        value = this._estimateAttackDamage(card) * 1.0;
        // 特殊效果加成
        if (card.effect.burnLayers) value += card.effect.burnLayers * 15;
        if (card.id === 'A31') {
          // 共振爆破：对方场上卡越多越值
          const oppField = opp.fieldSummons.length + (opp.fieldDomain ? 1 : 0) + opp.fieldSupports.length;
          value += oppField * 40;
        }
        break;

      case 'support':
        value = 20; // 基础值
        if (card.effect.buffDmg) value += card.effect.buffDmg * 1.5;
        if (card.effect.defense) value += (card.effect.defense.value || 15);
        if (card.effect.spiritRestore) value += card.effect.spiritRestore * 1.2;
        if (card.id === 'S16') value += 35; // X射线强
        if (card.id === 'S29') value += 40; // 高压击穿强
        if (card.id === 'S31') value += 35; // 多路放电强
        break;

      case 'domain':
        value = 50;
        if (self.fieldDomain) value = 15; // 已有领域时价值降低
        // 匹配主领域加分
        if (card.domain.some(d => d === self.domain.main)) value += 20;
        break;

      case 'summon':
        value = 40;
        if (self.fieldSummons.length >= 2) value = 10;
        if (card.id === 'C01') value += 20; // 芝诺龟强防守
        if (card.id === 'C02') value += 15; // 麦克斯韦妖资源
        if (card.id === 'C04') value += 10; // 薛定谔的猫随机
        if (card.id === 'C07') value += 15; // 欧姆减费
        break;

      case 'phase':
        value = 30;
        if (card.id === 'T01' && self.hp < self.maxHp * 0.5) value += 25;
        if (card.id === 'T02' && self.hp < self.maxHp * 0.3) value += 30;
        if (card.id === 'T03' && self.hp < opp.hp) value += 40;
        break;
    }

    // 费用惩罚高费卡
    const costPenalty = card.cost * 0.5;
    value = Math.max(0, value - costPenalty);

    return value;
  }

  // ==========================================================
  // 弃牌决策 —— _handleDiscard()
  // ==========================================================

  /**
   * AI处理弃牌阶段
   * 手牌超过5张时选择最差的牌丢弃
   */
  _handleDiscard() {
    const self = this._getSelf();
    const maxSize = 5;

    if (self.hand.length <= maxSize) return;

    const gameState = this._getGameState();
    const toDiscard = self.hand.length - maxSize;

    // 评估所有手牌价值
    const scored = self.hand.map((card, idx) => ({
      card,
      idx,
      value: this.evaluateCardValue(card, gameState)
    }));

    // 按价值升序排列（最差的在前）
    scored.sort((a, b) => a.value - b.value);

    // 需要弃置的索引（取最差的toDiscard张）
    const discardIndices = scored.slice(0, toDiscard).map(s => s.idx);

    this.engine.discardPhase(discardIndices);
  }

  // ==========================================================
  // 是否保留卡牌 —— shouldHoldCard()
  // ==========================================================

  /**
   * 判断是否应保留该卡牌（不弃置）
   * 用于hard难度：保留组合关键牌
   * @param {object} card - 卡牌对象
   * @returns {boolean} 是否保留
   */
  shouldHoldCard(card) {
    if (this.difficulty !== 'hard') return true;

    const self = this._getSelf();

    // 保留领域卡（如果还没有领域）
    if (card.type === 'domain' && !self.fieldDomain) return true;

    // 保留相变卡（HP危险时）
    if (card.type === 'phase') {
      if (card.id === 'T02' && self.hp < self.maxHp * 0.4) return true;
      if (card.id === 'T03' && self.hp < self.maxHp * 0.4) return true;
    }

    // 保留组合关键卡：检查手牌中是否有配套
    if (KNOWN_COMBOS[card.id]) {
      // 这是一张辅助卡，检查手牌中是否有对应攻击卡
      const comboInfo = KNOWN_COMBOS[card.id];
      const attackId = comboInfo.attackId;
      const attackIds = comboInfo.attackIds;
      if (attackId) {
        const hasAttack = self.hand.some(c => c.id === attackId);
        if (hasAttack) return true;
      }
      if (attackIds) {
        const hasAny = self.hand.some(c => attackIds.includes(c.id));
        if (hasAny) return true;
      }
    }

    // 检查此卡是否被其他辅助卡需要的攻击卡
    for (const support of self.hand) {
      if (support.id !== card.id && KNOWN_COMBOS[support.id]) {
        const info = KNOWN_COMBOS[support.id];
        if (info.attackId === card.id) return true;
        if (info.attackIds?.includes(card.id)) return true;
      }
    }

    // 保留高价值召唤物
    if (card.type === 'summon' && ['C01', 'C02', 'C07'].includes(card.id)) {
      return true;
    }

    return false;
  }
}

// ============================================================
// 导出
// ============================================================
export { AIEngine };
