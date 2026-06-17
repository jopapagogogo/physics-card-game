// ============================================================
// 物理卡牌对战 —— AI 对手引擎 v2.0
// 面向初中生，导入 GameEngine，提供三种难度级别
// Phase 6 P0: AI 策略全面升级
// ============================================================

import { GameEngine } from './engine.js';
import { COMBO_TABLE } from './combo_table.js';

// ============================================================
// 常量定义
// ============================================================

/** 每回合灼烧基础伤害 */
const BURN_DMG = 10;

/** 每层麻痹伤害 */
const PARALYSIS_DMG = 15;

/** 高威胁召唤物伤害阈值 */
const HIGH_THREAT_SUMMON_DMG = 15;

/** 高风险灼烧层数 */
const CRITICAL_BURN_LAYERS = 5;

/** 危险 HP 阈值 */
const DANGER_HP_RATIO = 0.3;
const WARNING_HP_RATIO = 0.4;

/** 威胁预算阈值 */
const THREAT_FULL_SEND = 0.7;
const THREAT_SAVE = 0.3;

/** 精神力保留值 */
const SPIRIT_RESERVE_NORMAL = 15;
const SPIRIT_RESERVE_LOW = 20;
const SPIRIT_RESERVE_HIGH = 40;

/** 对手 combo 潜力权重 */
const COMBO_POTENTIAL_WEIGHT = 0.15;

/** 灭杀型攻击卡 ID 集合 */
const SUMMON_ELIMINATOR_IDS = new Set([
  'A18', 'A25', 'A30', 'A07', 'A35'
]);

/** 高价值召唤物 ID */
const HIGH_VALUE_SUMMONS = new Set(['C01', 'C02', 'C07']);

/** _estimateAttackDamage 中需要特殊处理的卡牌 ID */
const SPECIAL_ATTACK_CARDS = {
  A49: { id: 'A49', check: 'electric_supports' },
  A02: { id: 'A02', check: 'force_history' },
  A08: { id: 'A08', check: 'lost_hp' },
  A54: { id: 'A54', check: 'burn_explosion' },
  A51: { id: 'A51', check: 'burn_boost' },
  A41: { id: 'A41', check: 'solar_boost' },
  A53: { id: 'A53', check: 'light_sound_boost' },
  A48: { id: 'A48', check: 'electric_chain' }
};

// ============================================================
// 1. ComboIndex — 组合索引
// 解析 COMBO_TABLE，构建多向快速查询索引
// ============================================================
class ComboIndex {
  constructor() {
    /** @type {object} 原始 COMBO_TABLE 引用 */
    this.rawTable = COMBO_TABLE;

    /** @type {Object<string, Object<string, object>>} 前向索引：basePrevId -> { curId -> comboEntry } */
    this.forwardIndex = {};

    /** @type {Object<string, string[]>} 参与索引：cardId -> 该卡参与的所有 comboKey */
    this.participatingCombos = {};

    /** @type {Object<string, object>} 双向索引（↔ 分隔的 combo） */
    this.bidirectional = {};

    /** @type {Object<string, object>} 对抗索引（vs 分隔的 combo），双向有效 */
    this.conflictPair = {};

    this._built = false;
  }

  /** 构建索引（首次调用自动触发） */
  _ensureBuilt() {
    if (this._built) return;
    this._build();
    this._built = true;
  }

  /** 解析所有 COMBO_TABLE 条目 */
  _build() {
    for (const [key, entry] of Object.entries(this.rawTable)) {
      const parsed = this._parseKey(key);
      if (!parsed) continue;

      const { prevRaw, cur, separator, basePrev } = parsed;

      // 参与索引
      this._addParticipant(basePrev, key);
      this._addParticipant(cur, key);

      if (separator === '↔') {
        // 双向 combo：两个方向都有效
        this.bidirectional[key] = entry;
        this._addForward(basePrev, cur, key, entry);
        this._addForward(cur, basePrev, key, entry);
      } else if (separator === 'vs') {
        // 对抗 combo：双向有效
        this.conflictPair[key] = entry;
        this._addForward(basePrev, cur, key, entry);
        this._addForward(cur, basePrev, key, entry);
      } else {
        // → 方向性 combo
        this._addForward(basePrev, cur, key, entry);
      }
    }
  }

  /**
   * 解析 combo key
   * @returns {{ prevRaw: string, cur: string, separator: string, basePrev: string } | null}
   */
  _parseKey(key) {
    // 确定分隔符
    let separator = null;
    if (key.includes('→')) separator = '→';
    else if (key.includes('↔')) separator = '↔';
    else if (key.includes('vs')) separator = 'vs';
    if (!separator) return null;

    const parts = key.split(separator);
    if (parts.length !== 2) return null;

    const prevRaw = parts[0].trim();
    const cur = parts[1].trim();

    // 提取 basePrev：去掉 升/降 等模式后缀
    const basePrev = prevRaw.replace(/[升降]$/, '');

    return { prevRaw, cur, separator, basePrev };
  }

  /** 添加前向索引条目 */
  _addForward(prevId, curId, key, entry) {
    if (!this.forwardIndex[prevId]) {
      this.forwardIndex[prevId] = {};
    }
    this.forwardIndex[prevId][curId] = { key, ...entry };
  }

  /** 添加参与索引 */
  _addParticipant(cardId, comboKey) {
    if (!this.participatingCombos[cardId]) {
      this.participatingCombos[cardId] = [];
    }
    if (!this.participatingCombos[cardId].includes(comboKey)) {
      this.participatingCombos[cardId].push(comboKey);
    }
  }

  /**
   * 查询两个卡牌之间是否存在 combo
   * @param {string} prevCardId - 先出的卡牌 ID
   * @param {string} curCardId - 后出的卡牌 ID
   * @returns {object|null} combo 条目
   */
  queryCombo(prevCardId, curCardId) {
    this._ensureBuilt();

    // 直查前向索引
    if (this.forwardIndex[prevCardId]?.[curCardId]) {
      return this.forwardIndex[prevCardId][curCardId];
    }

    // 查双向索引
    for (const [key, entry] of Object.entries(this.bidirectional)) {
      const parsed = this._parseKey(key);
      if (!parsed) continue;
      if ((parsed.basePrev === prevCardId && parsed.cur === curCardId) ||
          (parsed.basePrev === curCardId && parsed.cur === prevCardId)) {
        return { key, ...entry };
      }
    }

    // 查对抗索引
    for (const [key, entry] of Object.entries(this.conflictPair)) {
      const parsed = this._parseKey(key);
      if (!parsed) continue;
      if ((parsed.basePrev === prevCardId && parsed.cur === curCardId) ||
          (parsed.basePrev === curCardId && parsed.cur === prevCardId)) {
        return { key, ...entry };
      }
    }

    return null;
  }

  /**
   * 获取某卡牌参与的所有 combo key
   * @param {string} cardId
   * @returns {string[]}
   */
  getCombosForCard(cardId) {
    this._ensureBuilt();
    return this.participatingCombos[cardId] || [];
  }

  /**
   * 获取某辅助/前置卡的后续攻击卡 ID 列表
   * @param {string} prevCardId
   * @returns {string[]}
   */
  getCurCardsForPrev(prevCardId) {
    this._ensureBuilt();
    const forward = this.forwardIndex[prevCardId];
    if (!forward) return [];
    return Object.keys(forward);
  }

  /**
   * 获取需要某攻击卡作为后续的前置卡 ID 列表
   * @param {string} curCardId
   * @returns {string[]}
   */
  getPrevCardsForCur(curCardId) {
    this._ensureBuilt();
    const result = [];
    for (const [prevId, curMap] of Object.entries(this.forwardIndex)) {
      if (curMap[curCardId]) result.push(prevId);
    }
    return result;
  }

  /**
   * 在给定卡牌列表中查找所有可行的 combo 配对
   * @param {Array<{id: string}>} cards - 卡牌列表
   * @returns {Array<{ prevId: string, curId: string, comboKey: string, entry: object }>}
   */
  findAllCombosInCardList(cards) {
    this._ensureBuilt();
    const cardIds = cards.map(c => c.id);
    const results = [];

    for (let i = 0; i < cards.length; i++) {
      for (let j = 0; j < cards.length; j++) {
        if (i === j) continue;
        const prevId = cardIds[i];
        const curId = cardIds[j];
        const entry = this.queryCombo(prevId, curId);
        if (entry) {
          results.push({
            prevId,
            curId,
            prevCard: cards[i],
            curCard: cards[j],
            comboKey: entry.key,
            entry
          });
        }
      }
    }

    return results;
  }
}

// ============================================================
// 2. ThreatAssessor — 威胁评估
// ============================================================
const ThreatAssessor = {
  /**
   * 评估对手场面对己方的威胁等级
   * @param {object} self - AI 方玩家状态
   * @param {object} opp - 对手状态
   * @param {string} difficulty
   * @returns {{ level: number, details: object }}
   */
  assess(self, opp, difficulty) {
    if (difficulty === 'easy') return { level: 0.3, details: {} };
    if (difficulty === 'normal') return { level: 0.5, details: {} };

    // hard: 精确评估
    let score = 0;
    const details = {};

    // 因子1：对手场上进攻力 (0~0.3)
    let oppOffense = 0;
    for (const s of opp.fieldSummons) {
      if (s.card?.effect?.dmgBonus) oppOffense += s.card.effect.dmgBonus;
    }
    if (opp.fieldDomain?.card?.effect?.bonusDmg) {
      oppOffense += opp.fieldDomain.card.effect.bonusDmg;
    }
    oppOffense += opp.fieldSupports.length * 8;
    details.offense = Math.min(0.3, oppOffense / 60);

    // 因子2：对手 combo 潜力 (0~0.2)
    const oppComboPotential = (opp.hand.length / 5) * 0.1 +
      (opp.spirit / 100) * 0.1;
    details.comboPotential = Math.min(0.2, oppComboPotential);

    // 因子3：己方脆弱度 (0~0.25)
    const hpRatio = self.hp / self.maxHp;
    const fragility = (1 - hpRatio) * 0.25;
    // 无保护召唤物时更脆弱
    let protectedBySummon = false;
    for (const s of self.fieldSummons) {
      if (HIGH_VALUE_SUMMONS.has(s.card?.id)) {
        protectedBySummon = true;
        break;
      }
    }
    details.fragility = protectedBySummon ? fragility * 0.5 : fragility;

    // 因子4：对手驻场威胁 (0~0.15)
    const oppFieldCount = opp.fieldSummons.length +
      (opp.fieldDomain ? 1 : 0) + opp.fieldSupports.length;
    details.fieldThreat = Math.min(0.15, oppFieldCount * 0.05);

    // 因子5：DOT 累计 (0~0.1)
    const dotDmg = (self.burnLayers || 0) * BURN_DMG +
      (self.paralysis || 0) * PARALYSIS_DMG;
    details.dotThreat = Math.min(0.1, dotDmg / 200);

    score = details.offense + details.comboPotential +
      details.fragility + details.fieldThreat + details.dotThreat;

    return { level: Math.min(1.0, Math.max(0, score)), details };
  }
};

// ============================================================
// 3. SpiritBudgetManager — 精神力预算
// ============================================================
const SpiritBudgetManager = {
  /**
   * 计算精神力预算方案
   * @returns {{ thisTurnMax: number, reserved: number, strategy: string }}
   */
  compute(hand, spirit, threatLevel, difficulty) {
    if (difficulty === 'easy') {
      return { thisTurnMax: spirit, reserved: 0, strategy: 'full_send' };
    }

    if (difficulty === 'normal') {
      const reserved = Math.min(SPIRIT_RESERVE_NORMAL, Math.floor(spirit * 0.3));
      return {
        thisTurnMax: spirit - reserved,
        reserved,
        strategy: 'balanced'
      };
    }

    // hard 难度：精确预算
    const handCosts = hand.map(c => c.cost || 0).sort((a, b) => b - a);

    if (threatLevel > THREAT_FULL_SEND) {
      // 高威胁：全火力应对
      return { thisTurnMax: spirit, reserved: 0, strategy: 'full_send' };
    }

    if (threatLevel > THREAT_SAVE) {
      // 中威胁：均衡模式
      const avgCost = handCosts.length > 0
        ? handCosts.reduce((a, b) => a + b, 0) / handCosts.length
        : 20;
      const reserved = Math.min(SPIRIT_RESERVE_LOW, Math.floor(spirit * 0.25));
      return {
        thisTurnMax: Math.max(avgCost, spirit - reserved),
        reserved,
        strategy: 'balanced'
      };
    }

    // 低威胁：积蓄模式
    const reserved = Math.min(SPIRIT_RESERVE_HIGH, Math.floor(spirit * 0.5));
    return {
      thisTurnMax: spirit - reserved,
      reserved,
      strategy: 'save'
    };
  },

  /**
   * 估算下回合精神力
   */
  estimateNextTurnSpirit(self, reserved) {
    // 基础恢复 + 保留值
    return Math.min(100, 30 + reserved);
  }
};

// ============================================================
// 4. DefensePlanner — 防守策略
// ============================================================
const DefensePlanner = {
  /**
   * 判断是否需要防守
   * @returns {{ defend: boolean, priority: string, reason: string }}
   */
  shouldDefend(self, opp, threatLevel, comboIndex) {
    const hpRatio = self.hp / self.maxHp;

    // 绝境：HP < 30%
    if (hpRatio < DANGER_HP_RATIO) {
      return { defend: true, priority: 'immediate', reason: 'HP低于30%' };
    }

    // 警告：HP < 40%
    if (hpRatio < WARNING_HP_RATIO) {
      return { defend: true, priority: 'preemptive', reason: 'HP低于40%' };
    }

    // 对手场上有高伤害召唤物
    for (const s of opp.fieldSummons) {
      if ((s.card?.effect?.dmgBonus || 0) >= HIGH_THREAT_SUMMON_DMG) {
        return { defend: true, priority: 'preemptive',
          reason: `对手${s.card.name}威胁过高` };
      }
    }

    // 己方 DOT 致命：高灼烧 + 低 HP
    if ((self.burnLayers || 0) >= CRITICAL_BURN_LAYERS && hpRatio < WARNING_HP_RATIO) {
      return { defend: true, priority: 'immediate', reason: '灼烧即将致命' };
    }

    // 己方关键召唤物受威胁
    for (const s of opp.fieldSummons) {
      if (s.card?.effect?.special?.includes('消灭') &&
          self.fieldSummons.some(ss => HIGH_VALUE_SUMMONS.has(ss.card?.id))) {
        return { defend: true, priority: 'preemptive',
          reason: '关键召唤物受威胁' };
      }
    }

    return { defend: false, priority: 'none', reason: '' };
  },

  /**
   * 获取防守动作序列
   * @returns {Array<{ cardId: string, target: string, reason: string }>}
   */
  getDefensiveActions(hand, spirit, self, opp, comboIndex) {
    const actions = [];
    let remainingSpirit = spirit;

    const canAfford = (cost) => cost <= remainingSpirit;

    // 1. 优先相变卡
    const hpRatio = self.hp / self.maxHp;
    const phaseCards = hand.filter(c => c.type === 'phase' && canAfford(c.cost));
    for (const pc of phaseCards) {
      if (pc.id === 'T02' && hpRatio < DANGER_HP_RATIO) {
        actions.push({ cardId: pc.id, target: 'player', reason: 'HP危急→时停' });
        remainingSpirit -= pc.cost;
        break;
      }
      if (pc.id === 'T01' && hpRatio < WARNING_HP_RATIO) {
        actions.push({ cardId: pc.id, target: 'player', reason: 'HP危险→回溯' });
        remainingSpirit -= pc.cost;
        break;
      }
      if (pc.id === 'T03' && hpRatio < 0.35) {
        actions.push({ cardId: pc.id, target: 'player', reason: 'HP危急→暗影' });
        remainingSpirit -= pc.cost;
        break;
      }
    }

    // 2. 防御辅助卡
    const defenseCards = hand.filter(
      c => c.type === 'support' && c.effect?.defense && canAfford(c.cost)
    );
    if (defenseCards.length > 0) {
      defenseCards.sort((a, b) => (b.effect.defense.value || 0) - (a.effect.defense.value || 0));
      actions.push({ cardId: defenseCards[0].id, target: 'player',
        reason: `防御+${defenseCards[0].effect.defense.value || 0}` });
      remainingSpirit -= defenseCards[0].cost;
    }

    // 3. 消灭型攻击卡清除对手高危召唤物
    if (remainingSpirit > 0) {
      const eliminators = hand.filter(
        c => c.type === 'attack' &&
          SUMMON_ELIMINATOR_IDS.has(c.id) &&
          canAfford(c.cost)
      );
      if (eliminators.length > 0 && opp.fieldSummons.length > 0) {
        // 找最威胁的对手召唤物
        let worstIdx = 0;
        let worstThreat = 0;
        for (let i = 0; i < opp.fieldSummons.length; i++) {
          const s = opp.fieldSummons[i];
          const threat = (s.card?.effect?.dmgBonus || 0) + (s.hp / 50);
          if (threat > worstThreat) {
            worstThreat = threat;
            worstIdx = i;
          }
        }
        actions.push({
          cardId: eliminators[0].id,
          target: `summon_${worstIdx}`,
          reason: '灭杀高危召唤物'
        });
        remainingSpirit -= eliminators[0].cost;
      }
    }

    // 4. 召唤芝诺龟作为肉盾
    if (remainingSpirit >= 20 && self.fieldSummons.length < 2) {
      const zeno = hand.find(c => c.id === 'C01' && canAfford(c.cost));
      if (zeno) {
        actions.push({ cardId: 'C01', target: 'player', reason: '芝诺龟肉盾' });
        remainingSpirit -= zeno.cost;
      }
    }

    return { actions, remainingSpirit };
  }
};

// ============================================================
// 5. ComboDetector — 多模式 Combo 检测
// ============================================================
const ComboDetector = {
  /**
   * 在手牌中检测所有可行的 combo
   * @param {Array} hand - 手牌
   * @param {string[]} cardsThisTurn - 本回合已出卡牌 ID 列表
   * @param {ComboIndex} comboIndex
   * @param {number} maxSpirit - 预算上限
   * @param {string} difficulty
   * @returns {Array<{ prevCard: object, curCard: object, prevId: string, curId: string,
   *            comboKey: string, entry: object, totalCost: number, pattern: string, score: number }>}
   */
  detectAll(hand, cardsThisTurn, comboIndex, maxSpirit, difficulty) {
    if (difficulty === 'easy') return [];

    const results = [];

    if (difficulty === 'normal') {
      // 仅辅助→攻击
      this._findSupportAttackCombos(hand, comboIndex, maxSpirit, results);
    } else {
      // hard: 全模式
      this._findSupportAttackCombos(hand, comboIndex, maxSpirit, results);
      this._findAttackAttackCombos(hand, comboIndex, maxSpirit, results);
      this._findSummonAttackCombos(hand, comboIndex, maxSpirit, results);
      this._findSummonBidirectional(hand, comboIndex, maxSpirit, results);
      this._findCrossFieldCombos(hand, comboIndex, maxSpirit, results);

      // 考虑本回合已出的卡作为前置
      if (cardsThisTurn.length > 0) {
        this._findChainCombos(hand, cardsThisTurn, comboIndex, maxSpirit, results);
      }
    }

    // 计算评分
    for (const r of results) {
      r.score = this._scoreCombo(r);
    }

    // 按效率排序
    results.sort((a, b) => (b.score / Math.max(1, b.totalCost)) -
                          (a.score / Math.max(1, a.totalCost)));

    return results;
  },

  /** 辅助→攻击 */
  _findSupportAttackCombos(hand, comboIndex, maxSpirit, out) {
    const supports = hand.filter(c => c.type === 'support');
    const attacks = hand.filter(c => c.type === 'attack');

    for (const support of supports) {
      const curIds = comboIndex.getCurCardsForPrev(support.id);
      if (curIds.length === 0) continue;

      for (const atkId of curIds) {
        const attack = attacks.find(a => a.id === atkId);
        if (!attack) continue;

        const entry = comboIndex.queryCombo(support.id, atkId);
        if (!entry) continue;

        const totalCost = support.cost + attack.cost;
        if (totalCost > maxSpirit) continue;

        out.push({
          prevCard: support, curCard: attack,
          prevId: support.id, curId: atkId,
          comboKey: entry.key || `${support.id}→${atkId}`,
          entry, totalCost,
          pattern: 'support→attack'
        });
      }
    }
  },

  /** 攻击→攻击（同一回合链式出牌） */
  _findAttackAttackCombos(hand, comboIndex, maxSpirit, out) {
    const attacks = hand.filter(c => c.type === 'attack');

    for (let i = 0; i < attacks.length; i++) {
      for (let j = 0; j < attacks.length; j++) {
        if (i === j) continue;
        const entry = comboIndex.queryCombo(attacks[i].id, attacks[j].id);
        if (!entry) continue;
        const totalCost = attacks[i].cost + attacks[j].cost;
        if (totalCost > maxSpirit) continue;

        out.push({
          prevCard: attacks[i], curCard: attacks[j],
          prevId: attacks[i].id, curId: attacks[j].id,
          comboKey: entry.key,
          entry, totalCost,
          pattern: 'attack→attack'
        });
      }
    }
  },

  /** 召唤→攻击 */
  _findSummonAttackCombos(hand, comboIndex, maxSpirit, out) {
    const summons = hand.filter(c => c.type === 'summon');
    const attacks = hand.filter(c => c.type === 'attack');

    for (const summon of summons) {
      const curIds = comboIndex.getCurCardsForPrev(summon.id);
      if (curIds.length === 0) continue;

      for (const atkId of curIds) {
        const attack = attacks.find(a => a.id === atkId);
        if (!attack) continue;

        const entry = comboIndex.queryCombo(summon.id, atkId);
        if (!entry) continue;

        const totalCost = summon.cost + attack.cost;
        if (totalCost > maxSpirit) continue;

        out.push({
          prevCard: summon, curCard: attack,
          prevId: summon.id, curId: atkId,
          comboKey: entry.key,
          entry, totalCost,
          pattern: 'summon→attack'
        });
      }
    }
  },

  /** 召唤对冲（↔） */
  _findSummonBidirectional(hand, comboIndex, maxSpirit, out) {
    const summons = hand.filter(c => c.type === 'summon');

    for (let i = 0; i < summons.length; i++) {
      for (let j = i + 1; j < summons.length; j++) {
        const entry = comboIndex.queryCombo(summons[i].id, summons[j].id);
        if (!entry) continue;
        const totalCost = summons[i].cost + summons[j].cost;
        if (totalCost > maxSpirit) continue;

        out.push({
          prevCard: summons[i], curCard: summons[j],
          prevId: summons[i].id, curId: summons[j].id,
          comboKey: entry.key,
          entry, totalCost,
          pattern: 'summon↔summon'
        });
      }
    }
  },

  /** 跨领域对抗 */
  _findCrossFieldCombos(hand, comboIndex, maxSpirit, out) {
    for (const [key, entry] of Object.entries(comboIndex.conflictPair)) {
      const parsed = comboIndex._parseKey(key);
      if (!parsed) continue;

      const cardA = hand.find(c => c.id === parsed.basePrev);
      const cardB = hand.find(c => c.id === parsed.cur);
      if (!cardA || !cardB) continue;

      const totalCost = cardA.cost + cardB.cost;
      if (totalCost > maxSpirit) continue;

      out.push({
        prevCard: cardA, curCard: cardB,
        prevId: cardA.id, curId: cardB.id,
        comboKey: key,
        entry, totalCost,
        pattern: 'cross_field'
      });
    }
  },

  /**
   * 链式 combo：本回合已出的卡作为前置，手牌中有后续
   */
  _findChainCombos(hand, cardsThisTurn, comboIndex, maxSpirit, out) {
    for (const prevId of cardsThisTurn) {
      const curIds = comboIndex.getCurCardsForPrev(prevId);
      if (curIds.length === 0) continue;

      for (const curId of curIds) {
        const curCard = hand.find(c => c.id === curId);
        if (!curCard) continue;

        const entry = comboIndex.queryCombo(prevId, curId);
        if (!entry) continue;

        if (curCard.cost > maxSpirit) continue;

        out.push({
          prevCard: { id: prevId }, curCard,
          prevId, curId,
          comboKey: entry.key,
          entry,
          totalCost: curCard.cost,
          pattern: 'chain→attack'
        });
      }
    }
  },

  /**
   * 评分 combo
   */
  _scoreCombo(combo) {
    let score = 0;

    for (const effect of combo.entry.effects) {
      switch (effect.type) {
        case 'extra_damage':
        case 'extra_damage_per_force_card':
          score += effect.value || 0;
          break;
        case 'extra_damage_per_burn':
          score += (effect.perLayer || 0) * 3;
          break;
        case 'extra_burn':
        case 'extra_burn_after_detonate':
          score += (effect.layers || 0) * 25;
          break;
        case 'extra_dot':
          score += (effect.dmg || 0) * (effect.turns || 1);
          break;
        case 'extend_dot_turns':
          score += (effect.value || 0) * 15;
          break;
        case 'view_hand':
          score += 30;
          break;
        case 'steal_spirit':
          score += (effect.value || 0) * 1.5;
          break;
        case 'set_return_to_hand':
        case 'return_to_hand':
          score += 25;
          break;
        case 'modify_flag':
          score += 20;
          break;
        case 'boost_burn_dmg':
        case 'boost_burn_cap':
        case 'boost_dot_increment':
        case 'boost_ignore_defense':
        case 'boost_mirror_maze':
        case 'boost_clear_debuff':
          score += 25;
          break;
        case 'modify_height':
          score += (effect.perHeight || 0) * 3;
          break;
        case 'modify_card_dmg':
          score += (effect.value || 0);
          break;
        case 'extra_damage_ignore_block':
          score += (effect.value || 0) * 1.5;
          break;
        case 'heal_hp':
          score += (effect.value || 0) * 0.8;
          break;
        default:
          score += 10;
      }
    }

    return score;
  }
};

// ============================================================
// 6. MultiTurnPlanner — 多回合规划（hard 难度专属）
// ============================================================
const MultiTurnPlanner = {
  /**
   * 多回合规划
   * @returns {{ shouldPassTurn: boolean, recommendedCombo: object|null, reason: string }}
   */
  plan(hand, spirit, budget, comboIndex, self, opp, threatLevel) {
    // 如果已经有威胁，不蓄力
    if (threatLevel > 0.5) {
      return { shouldPassTurn: false, recommendedCombo: null, reason: '威胁过高，不蓄力' };
    }

    // 如果对手 HP 太低，先解决战斗
    const oppHpRatio = opp.hp / opp.maxHp;
    if (oppHpRatio < 0.3) {
      return { shouldPassTurn: false, recommendedCombo: null, reason: '对手HP低，直接进攻' };
    }

    // 查找高压 combo：总费用 > 当前精神力但 < 下回合精神力
    const nextTurnSpirit = SpiritBudgetManager.estimateNextTurnSpirit(self, budget.reserved);
    const allCombos = ComboDetector.detectAll(
      hand, [], comboIndex, nextTurnSpirit, 'hard'
    );

    for (const combo of allCombos) {
      // 该 combo 需要超过当前精神力，但下回合足够
      if (combo.totalCost > spirit && combo.totalCost <= nextTurnSpirit) {
        return {
          shouldPassTurn: true,
          recommendedCombo: combo,
          reason: `蓄力下回合打出${combo.prevId}→${combo.curId} (${combo.totalCost}费)`
        };
      }

      // 即使当前够，如果留到下回合能打出更强效果也蓄力
      if (combo.totalCost > budget.thisTurnMax * 0.8 &&
          combo.totalCost <= nextTurnSpirit &&
          combo.score > 50) {
        return {
          shouldPassTurn: true,
          recommendedCombo: combo,
          reason: `保留精神力下回合爆发: ${combo.prevId}→${combo.curId}`
        };
      }
    }

    // 看看是否应该少出牌（保留更多下回合可用）
    if (budget.strategy === 'save' && allCombos.length === 0) {
      // 没有 combo 机会，等一张关键牌
      return {
        shouldPassTurn: false,
        recommendedCombo: null,
        reason: '等抽关键牌'
      };
    }

    return { shouldPassTurn: false, recommendedCombo: null, reason: '' };
  }
};

// ============================================================
// AIEngine 类
// ============================================================
class AIEngine {
  /**
   * @param {GameEngine} engine - 游戏引擎实例
   * @param {string} difficulty - "easy"|"normal"|"hard"
   */
  constructor(engine, difficulty) {
    /** @type {GameEngine} */
    this.engine = engine;
    this.difficulty = this._normalizeDifficulty(difficulty);
    this.aiIdx = 1;
    this.oppIdx = 0;
    this.pendingDecisions = null;

    /** @type {ComboIndex} 组合索引（单例缓存） */
    this._comboIndex = new ComboIndex();
  }

  // ==========================================================
  // 难度归一化
  // ==========================================================
  _normalizeDifficulty(d) {
    const valid = ['easy', 'normal', 'hard'];
    return valid.includes(d) ? d : 'normal';
  }

  // ==========================================================
  // 游戏状态访问
  // ==========================================================
  _getGameState() {
    return this.engine.getGameState();
  }
  _getSelf() {
    return this.engine.players[this.aiIdx];
  }
  _getOpp() {
    return this.engine.players[this.oppIdx];
  }

  // ==========================================================
  // 答题模拟 —— simulateQuiz()（不变）
  // ==========================================================
  simulateQuiz() {
    const total = 3;
    let correct;

    switch (this.difficulty) {
      case 'easy': {
        const roll = Math.random();
        if (roll < 0.15) correct = 0;
        else if (roll < 0.55) correct = 1;
        else if (roll < 0.90) correct = 2;
        else correct = 3;
        break;
      }
      case 'normal': {
        const roll = Math.random();
        if (roll < 0.05) correct = 0;
        else if (roll < 0.25) correct = 1;
        else if (roll < 0.70) correct = 2;
        else correct = 3;
        break;
      }
      case 'hard': {
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
  // 思考延迟 —— getThinkDelay()（不变）
  // ==========================================================
  getThinkDelay() {
    switch (this.difficulty) {
      case 'easy':   return 1000 + Math.random() * 2000;
      case 'normal': return 2000 + Math.random() * 2000;
      case 'hard':   return 1500 + Math.random() * 1500;
      default:       return 2000;
    }
  }

  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ==========================================================
  // 出牌决策 —— makePlayDecision() [重写]
  // ==========================================================
  makePlayDecision() {
    const self = this._getSelf();
    const opp = this._getOpp();
    const hand = [...self.hand];
    let spirit = self.spirit;
    const gameState = this._getGameState();
    const cardsThisTurn = this.engine.cardsThisTurn || [];
    const comboIndex = this._comboIndex;

    const decisions = [];
    const usedIds = new Set();

    const useCard = (card, target = 'player') => {
      if (!card) return false;
      decisions.push({ cardId: card.id, target });
      spirit -= card.cost;
      usedIds.add(card.id);
      return true;
    };

    // === easy 难度：随机出牌 ===
    if (this.difficulty === 'easy') {
      return this._makeRandomDecision(hand, spirit);
    }

    // === 第 1 步：威胁评估 ===
    const threat = ThreatAssessor.assess(self, opp, this.difficulty);

    // === 第 2 步：精神力预算 ===
    const budget = SpiritBudgetManager.compute(hand, spirit, threat.level, this.difficulty);

    // === 第 3 步：防守检查 ===
    const defenseCheck = DefensePlanner.shouldDefend(self, opp, threat.level, comboIndex);
    if (defenseCheck.defend) {
      const { actions, remainingSpirit: defRemaining } =
        DefensePlanner.getDefensiveActions(hand, spirit, self, opp, comboIndex);
      for (const action of actions) {
        const card = hand.find(c => c.id === action.cardId && !usedIds.has(c.id));
        if (card && card.cost <= spirit) {
          useCard(card, action.target);
        }
      }
      // 更新精神力和手牌
      hand.splice(0, hand.length, ...self.hand.filter(c => !usedIds.has(c.id)));
      spirit = self.spirit - decisions.reduce((sum, d) => {
        const c = this.engine.getCardById(d.cardId);
        return sum + (c ? c.cost : 0);
      }, 0);
    }

    // === 第 4 步：多回合规划（仅 hard） ===
    if (this.difficulty === 'hard') {
      const remainingHand = hand.filter(c => !usedIds.has(c.id));
      const plan = MultiTurnPlanner.plan(
        remainingHand, spirit, budget, comboIndex, self, opp, threat.level
      );
      if (plan.shouldPassTurn) {
        // 蓄力：可能只出低费防守牌，空过主要精神力
        if (plan.recommendedCombo && spirit >= plan.recommendedCombo.totalCost) {
          // 如果当前就能打，不空过
        } else {
          // 少出牌，保留精神力
          return decisions;
        }
      }
    }

    // === 第 5 步：Combo 搜索（多模式） ===
    if (this.difficulty !== 'easy') {
      const remainingHand = hand.filter(c => !usedIds.has(c.id));
      const allCombos = ComboDetector.detectAll(
        remainingHand, cardsThisTurn, comboIndex, budget.thisTurnMax, this.difficulty
      );

      if (allCombos.length > 0) {
        const best = allCombos[0];
        const prevCard = remainingHand.find(c => c.id === best.prevId && !usedIds.has(c.id));
        const curCard = remainingHand.find(c => c.id === best.curId && !usedIds.has(c.id));
        const totalCost = (prevCard?.cost || 0) + (curCard?.cost || 0);

        if (prevCard && curCard && totalCost <= budget.thisTurnMax) {
          const prevTarget = prevCard.type === 'attack'
            ? this.getBestTarget(prevCard, gameState)
            : 'player';
          useCard(prevCard, prevTarget);
          const curTarget = curCard.type === 'attack'
            ? this.getBestTarget(curCard, gameState)
            : 'player';
          useCard(curCard, curTarget);
        }
      }
    }

    // === 第 6 步：领域卡 ===
    const activeHand = hand.filter(c => !usedIds.has(c.id));
    if (!self.fieldDomain) {
      const domainCards = activeHand.filter(
        c => c.type === 'domain' && c.cost <= budget.thisTurnMax &&
        c.cost <= spirit && !usedIds.has(c.id)
      );
      if (domainCards.length > 0) {
        if (this.difficulty === 'hard') {
          const matchDomain = domainCards.find(
            c => Array.isArray(c.domain) && (c.domain.includes(self.domain.main) || c.domain.includes(self.domain.sub))
          );
          useCard(matchDomain || domainCards[0]);
        } else {
          useCard(domainCards[0]);
        }
      }
    }

    // === 第 7 步：召唤物 ===
    if (spirit >= 20 && self.fieldSummons.length < 2) {
      const summons = activeHand.filter(
        c => c.type === 'summon' && c.cost <= spirit &&
        c.cost <= budget.thisTurnMax && !usedIds.has(c.id)
      );
      if (summons.length > 0) {
        if (this.difficulty === 'hard') {
          // 优先选有 combo 配对的召唤物
          let bestSummon = null;
          for (const s of summons) {
            const hasComboPair = activeHand.some(
              c => c.id !== s.id && comboIndex.queryCombo(s.id, c.id)
            );
            if (hasComboPair) {
              bestSummon = s;
              break;
            }
          }
          if (!bestSummon) {
            const matchSummon = summons.find(
              c => Array.isArray(c.domain) && c.domain.some(d => d === self.domain.main || d === self.domain.sub)
            );
            bestSummon = matchSummon || summons[0];
          }
          useCard(bestSummon);
        } else {
          summons.sort((a, b) => (b.cost || 0) - (a.cost || 0));
          useCard(summons[0]);
        }
      }
    }

    // === 第 8 步：攻击卡 — 在预算内按性价比打出 ===
    let maxIterations = 10;
    while (spirit > 0 && maxIterations-- > 0) {
      const attacks = activeHand.filter(
        c => c.type === 'attack' && c.cost <= spirit &&
        c.cost <= budget.thisTurnMax && !usedIds.has(c.id)
      );
      if (attacks.length === 0) break;

      const best = this.getBestAttack(attacks, spirit, gameState);
      if (!best) break;

      const target = this.getBestTarget(best, gameState);
      useCard(best, target);
    }

    // === 第 9 步：辅助卡 — 剩余精神力 ===
    maxIterations = 5;
    while (spirit > 0 && maxIterations-- > 0) {
      const supports = activeHand.filter(
        c => c.type === 'support' && c.cost <= spirit &&
        c.cost <= budget.thisTurnMax && !usedIds.has(c.id)
      );
      if (supports.length === 0) break;

      const bestSupport = this._pickBestSupport(supports, gameState);
      if (!bestSupport) break;

      useCard(bestSupport);
    }

    // === 第 10 步：hard 难度额外补充 ===
    if (spirit > 0 && this.difficulty === 'hard') {
      const remaining = activeHand.filter(
        c => c.cost <= spirit && !usedIds.has(c.id) && c.cost <= budget.thisTurnMax
      );

      if (!self.fieldDomain) {
        const extraDomain = remaining.find(c => c.type === 'domain');
        if (extraDomain) useCard(extraDomain);
      }

      if (self.fieldSummons.length < 2 && spirit >= 20) {
        const extraSummon = remaining.find(c => c.type === 'summon');
        if (extraSummon) useCard(extraSummon);
      }
    }

    return decisions;
  }

  // ==========================================================
  // 逐张出牌模式（不变）
  // ==========================================================
  getNextPlayDecision() {
    if (!this.pendingDecisions || this.pendingDecisions.length === 0) {
      this.pendingDecisions = this.makePlayDecision();
    }
    while (this.pendingDecisions.length > 0) {
      const decision = this.pendingDecisions.shift();
      const self = this._getSelf();
      const card = this.engine.getCardById(decision.cardId);
      if (card && self.spirit >= card.cost) {
        return decision;
      }
    }
    return null;
  }

  resetPlayDecisions() {
    this.pendingDecisions = null;
  }

  // ==========================================================
  // easy难度：随机出牌（不变）
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
  getBestAttack(hand, spirit, gameState) {
    if (hand.length === 0) return null;
    const self = this._getSelf();
    const opp = this._getOpp();

    const scored = hand.map(card => {
      let value = this._estimateAttackDamage(card);

      const special = card.effect.special || '';
      if (special.includes('消灭') && special.includes('驻场')) {
        if (opp.fieldSupports.length > 0 || opp.fieldDomain) {
          value += 30;
        }
      }
      if (card.effect.burnLayers) {
        value += card.effect.burnLayers * 20;
      }
      if (special.includes('弹回')) {
        value += 25;
      }
      if (special.includes('查看') && special.includes('手牌')) {
        value += 15;
      }
      if (special.includes('偷取') && special.includes('精神力')) {
        value += 20;
      }
      if (card.id === 'A49' &&
          self.fieldSupports.filter(s => s.card.domain.includes('电')).length < 3) {
        value *= 0.7;
      }

      const efficiency = value / Math.max(1, card.cost);
      return { card, efficiency, value };
    });

    scored.sort((a, b) => b.efficiency - a.efficiency);

    if (this.difficulty === 'hard') {
      if (scored.length >= 2 &&
          Math.abs(scored[0].efficiency - scored[1].efficiency) < 1.0) {
        if (scored[1].card.cost < scored[0].card.cost) {
          return scored[1].card;
        }
      }
    }

    return scored[0]?.card || null;
  }

  // ==========================================================
  // 估算攻击卡伤害
  // ==========================================================
  _estimateAttackDamage(card) {
    const self = this._getSelf();
    const opp = this._getOpp();
    let dmg = card.effect.dmg || 0;

    // 领域加成
    if (self.fieldDomain) {
      const dCard = self.fieldDomain.card;
      if (dCard?.effect?.bonusDmg && card.domain?.some(d => dCard.domain?.includes(d))) {
        dmg += dCard.effect.bonusDmg;
      }
      if (dCard.id === 'D02' && Array.isArray(card.domain) && card.domain.includes('声')) {
        const soundCount = self.fieldSupports.filter(
          s => Array.isArray(s.card?.domain) && s.card.domain.includes('声')
        ).length;
        dmg += soundCount * 8;
      }
    }

    // 召唤物加成
    for (const s of self.fieldSummons) {
      if (s.card?.effect?.dmgBonus) {
        const sDomains = Array.isArray(s.card.domain) ? s.card.domain : [s.card.domain || ''];
        const cDomains = Array.isArray(card.domain) ? card.domain : [card.domain || ''];
        if (cDomains.some(d => sDomains.includes(d))) {
          dmg += s.card.effect.dmgBonus;
        }
      }
      if (s.card.id === 'C14' && Array.isArray(card.domain) && card.domain.includes('电')) {
        dmg += (opp.paralysis || 0) * 2;
      }
      if (s.card.id === 'C13' && Array.isArray(card.domain) && card.domain.includes('热')) {
        dmg += (opp.burnLayers || 0) * 3;
      }
      if (s.card.id === 'C09' && Array.isArray(card.domain) && card.domain.includes('光')) {
        dmg += self.fieldSupports.length * 3;
      }
    }

    // 串联增压（电系）
    if (Array.isArray(card.domain) && card.domain.includes('电')) {
      const elecCount = self.fieldSupports.filter(
        s => Array.isArray(s.card?.domain) && s.card.domain.includes('电')
      ).length;
      dmg += elecCount * 15;
    }

    // 条件效果预估
    if (card.effect?.conditional) {
      const cond = card.effect.conditional;
      if (cond.condition.includes('己方辅助卡') || cond.condition.includes('驻场辅助')) {
        dmg += self.fieldSupports.length * (cond.bonusDmg || 0);
      }
      if (cond.condition.includes('灼烧')) {
        dmg += opp.burnLayers * (cond.bonusDmg || 0);
      }
      if (cond.condition.includes('对方场上每张卡')) {
        const df = opp.fieldSummons.length + (opp.fieldDomain ? 1 : 0) +
          opp.fieldSupports.length;
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
        dmg += Math.floor((cond.bonusDmg || 0) * 0.5);
      }
    }

    // 特殊攻击卡预估
    if (card.id === 'A02') {
      dmg += Math.floor((self.totalForceDmg || 0) * 0.5);
    }
    if (card.id === 'A08') {
      const lostHp = (opp.maxHp || 500) - opp.hp;
      dmg += Math.floor(lostHp * 0.1);
    }
    if (card.id === 'A54') {
      const burnDmg = opp.burnLayers * 48;
      dmg += burnDmg;
    }
    if (card.id === 'A51') {
      dmg += opp.burnLayers * 6;
    }
    if (card.id === 'A41') {
      if (self.fieldDomain?.card?.domain?.includes('热')) {
        dmg += 70;
      }
    }
    if (card.id === 'A53') {
      dmg += 10;
    }

    // 答题增益
    const quizBonus = (this.engine.quizResult?.bonus || 0);
    dmg = Math.floor(dmg * (1 + quizBonus));

    return dmg;
  }

  // ==========================================================
  // 最优攻击目标 —— getBestTarget()（增强）
  // ==========================================================
  getBestTarget(attackCard, gameState) {
    const opp = this._getOpp();

    if (opp.fieldSummons.length === 0) {
      return 'player';
    }

    // 灭杀型攻击卡：优先消灭召唤物
    if (SUMMON_ELIMINATOR_IDS.has(attackCard.id)) {
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

    const estDmg = this._estimateAttackDamage(attackCard);

    if (this.difficulty === 'hard') {
      for (let i = 0; i < opp.fieldSummons.length; i++) {
        const summon = opp.fieldSummons[i];
        if (estDmg >= summon.hp && summon.hp > 0) {
          // 优先击杀高价值召唤物
          if (summon.card.id === 'C11') return `summon_${i}`;
          if (summon.card.id === 'C01') return `summon_${i}`;
          if (summon.card.id === 'C02') return `summon_${i}`;
          if (summon.hp <= 150) return `summon_${i}`;
        }
      }

      // 对手有高威胁召唤物时优先攻击
      for (let i = 0; i < opp.fieldSummons.length; i++) {
        const s = opp.fieldSummons[i];
        if ((s.card?.effect?.dmgBonus || 0) >= HIGH_THREAT_SUMMON_DMG) {
          return `summon_${i}`;
        }
      }

      if (opp.fieldSummons.some(s => s.card.id === 'C11')) {
        return 'player';
      }
    }

    if (this.difficulty === 'normal') {
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
  _pickBestSupport(supports, gameState) {
    if (supports.length === 0) return null;

    const self = this._getSelf();
    const opp = this._getOpp();

    const scored = supports.map(card => {
      let value = 0;

      if (card.effect.buffDmg) {
        value += card.effect.buffDmg * 1.5;
      }
      if (card.effect.defense) {
        value += card.effect.defense.value || 20;
      }
      if (card.effect.spiritRestore) {
        value += card.effect.spiritRestore * 1.2;
      }

      const special = card.effect.special || '';
      if (special.includes('附加') && special.includes('灼烧')) {
        const match = special.match(/(\d+)层灼烧/);
        if (match) value += parseInt(match[1]) * 25;
      }
      if (special.includes('查看') && special.includes('手牌')) {
        value += 20;
      }
      // 消灭驻场
      if (special.includes('消灭') && special.includes('驻场')) {
        if (opp.fieldSupports.length > 0 || opp.fieldDomain) {
          value += 35;
        }
      }

      if (card.id === 'S18' || card.id === 'S20') {
        if (self.burnLayers < 2) value *= 0.3;
      }
      if (card.id === 'S27') {
        const hasElec = self.fieldSupports.some(s => s.card.domain.includes('电'));
        if (!hasElec) value = 0;
      }
      if (card.id === 'S35') {
        const oppHasField = opp.fieldSummons.length > 0 ||
          opp.fieldDomain || opp.fieldSupports.length > 0;
        if (!oppHasField) value *= 0.3;
      }

      const efficiency = value / Math.max(1, card.cost);
      return { card, efficiency, value };
    });

    scored.sort((a, b) => b.efficiency - a.efficiency);
    return scored[0]?.card || null;
  }

  // ==========================================================
  // 卡牌价值评估 —— evaluateCardValue()（增强）
  // ==========================================================
  evaluateCardValue(card, gameState) {
    const self = this._getSelf();
    const opp = this._getOpp();
    let value = 0;

    switch (card.type) {
      case 'attack':
        value = this._estimateAttackDamage(card) * 1.0;
        if (card.effect.burnLayers) value += card.effect.burnLayers * 15;
        if (card.id === 'A31') {
          const oppField = opp.fieldSummons.length + (opp.fieldDomain ? 1 : 0) +
            opp.fieldSupports.length;
          value += oppField * 40;
        }
        break;

      case 'support':
        value = 20;
        if (card.effect.buffDmg) value += card.effect.buffDmg * 1.5;
        if (card.effect.defense) value += (card.effect.defense.value || 15);
        if (card.effect.spiritRestore) value += card.effect.spiritRestore * 1.2;
        if (card.id === 'S16') value += 35;
        if (card.id === 'S29') value += 40;
        if (card.id === 'S31') value += 35;
        // combo 潜力加分
        if (this._comboIndex.getCombosForCard(card.id).length > 0) {
          value += 15;
        }
        break;

      case 'domain':
        value = 50;
        if (self.fieldDomain) value = 15;
        if (card.domain.some(d => d === self.domain.main)) value += 20;
        break;

      case 'summon':
        value = 40;
        if (self.fieldSummons.length >= 2) value = 10;
        if (card.id === 'C01') value += 20;
        if (card.id === 'C02') value += 15;
        if (card.id === 'C04') value += 10;
        if (card.id === 'C07') value += 15;
        // combo 潜力加分
        if (this._comboIndex.getCurCardsForPrev(card.id).length > 0) {
          value += 20;
        }
        break;

      case 'phase':
        value = 30;
        if (card.id === 'T01' && self.hp < self.maxHp * 0.5) value += 25;
        if (card.id === 'T02' && self.hp < self.maxHp * 0.3) value += 30;
        if (card.id === 'T03' && self.hp < opp.hp) value += 40;
        break;
    }

    const costPenalty = card.cost * 0.5;
    value = Math.max(0, value - costPenalty);

    return value;
  }

  // ==========================================================
  // 弃牌决策 —— _handleDiscard()（增强）
  // ==========================================================
  _handleDiscard() {
    const self = this._getSelf();
    const maxSize = 5;

    if (self.hand.length <= maxSize) return;

    const gameState = this._getGameState();
    const toDiscard = self.hand.length - maxSize;

    const scored = self.hand.map((card, idx) => ({
      card,
      idx,
      value: this.evaluateCardValue(card, gameState)
    }));

    scored.sort((a, b) => a.value - b.value);
    const discardIndices = scored.slice(0, toDiscard).map(s => s.idx);
    this.engine.discardPhase(discardIndices);
  }

  // ==========================================================
  // 是否保留卡牌 —— shouldHoldCard()（增强：使用真实 COMBO_TABLE）
  // ==========================================================
  shouldHoldCard(card) {
    if (this.difficulty !== 'hard') return true;

    const self = this._getSelf();
    const comboIndex = this._comboIndex;

    // 保留领域卡（如果还没有领域）
    if (card.type === 'domain' && !self.fieldDomain) return true;

    // 保留相变卡（HP危险时）
    if (card.type === 'phase') {
      const hpRatio = self.hp / self.maxHp;
      if (card.id === 'T02' && hpRatio < 0.4) return true;
      if (card.id === 'T03' && hpRatio < 0.4) return true;
    }

    // 使用真实 COMBO_TABLE 检查 combo 关键牌
    const combos = comboIndex.getCombosForCard(card.id);
    if (combos.length > 0) {
      // 检查手牌中是否有配套卡
      for (const comboKey of combos) {
        const pairIds = comboIndex.getCurCardsForPrev(card.id);
        const hasPairInHand = self.hand.some(h => pairIds.includes(h.id));
        if (hasPairInHand) return true;
      }
    }

    // 检查此卡是否被其他卡需要的后续卡
    const prevIds = comboIndex.getPrevCardsForCur(card.id);
    const hasPrevInHand = self.hand.some(h => prevIds.includes(h.id));
    if (hasPrevInHand) return true;

    // 保留高价值召唤物
    if (card.type === 'summon' && HIGH_VALUE_SUMMONS.has(card.id)) {
      return true;
    }

    return false;
  }
}

// ============================================================
// 导出
// ============================================================
export { AIEngine };
