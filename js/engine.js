// ============================================================
// 物理卡牌对战 —— 游戏引擎
// 面向初中生，纯 ES6，无外部依赖
// ============================================================

import { CARDS } from './cards.js';
import { COMBO_TABLE } from './combo_table.js';

// ============================================================
// 常量定义
// ============================================================
const MAX_HP = 1200;
const MAX_SPIRIT = 100;
const INITIAL_HP = 1200;
const INITIAL_SPIRIT = 50;
const MAX_HAND_SIZE = 5;
const DRAW_PER_TURN = 3;
const SPIRIT_PER_TURN = 10;
const MAX_SUMMONS = 2;
const BURN_BASE_DMG = 30;       // 灼烧每层基础伤害
const BURN_ENHANCED_DMG = 36;   // 温度升高(S19)后每层伤害
const MAX_BURN_DEFAULT = 10;     // 灼烧默认上限
const PARALYSIS_DECAY = 2;      // 麻痹每回合衰减
const PARALYSIS_COST = 2;       // 麻痹每层额外消耗精神力
const PARALYSIS_BASE_DMG = 15;  // 麻痹每层基础附加伤害（电领域被动）

// 答题增益表
const QUIZ_BONUS = { 3: 0.12, 2: 0.08, 1: 0.05, 0: 0.0 };

// ============================================================
// GameEngine 类
// ============================================================
class GameEngine {
  /**
   * @param {string[]} playerDeck - 玩家牌库ID数组
   * @param {string[]} aiDeck - AI牌库ID数组
   * @param {string} playerMainDomain - 玩家主领域
   * @param {string} playerSubDomain - 玩家副领域
   * @param {string} aiMainDomain - AI主领域
   * @param {string} aiSubDomain - AI副领域
   */
  constructor(playerDeck, aiDeck, playerMainDomain, playerSubDomain, aiMainDomain, aiSubDomain) {
    // 初始化玩家双方状态
    this.players = [
      this._createPlayerState(playerDeck, playerMainDomain, playerSubDomain),
      this._createPlayerState(aiDeck, aiMainDomain, aiSubDomain)
    ];

    this.currentPlayer = 0;     // 0=玩家, 1=AI
    this.turnNumber = 1;
    this.phase = 'draw';         // draw|quiz|play|settle|discard
    this.quizResult = { correct: 0, total: 3, bonus: 0 };
    this.comboThisTurn = [];      // 本回合已触发的组合
    this.pendingCombo = [null, null]; // 待应用的组合效果 [player0, player1]
    this.log = [];               // 战斗日志 [{msg, turn}]
    this.cardsThisTurn = [];     // 本回合打出的卡牌ID列表
    this.gameOver = false;
    this.winner = null;
    this.criticalBreak = [false, false];  // T02临界突破标记

    // 临时效果跟踪
    this.echoBombPending = [false, false];    // A14回声爆破待触发
    this.echoBombDmg = [0, 0];               // 回声爆破延迟伤害
    this.hightAtkTrack = [0, 0];             // A05重力势能蓄力回合
    this.hightBonus = [0, 0];                // A05当前高度加成

    // 海市蜃楼偏转 (A50)
    this.mirageTurns = [0, 0];               // 剩余回合数
    this.mirageFirstAtk = [false, false];    // 本回合首次攻击已触发

    // 镜面迷宫 (S34)
    this.mirrorMaze = [0, 0];               // 剩余出牌次数

    // 影子束缚 (S35)
    this.shadowBindTurns = [0, 0];           // 剩余回合数

    // 声系下次增伤 (A51声速激增)
    this.soundSpeedBuff = [0, 0];

    // 偏振过滤 (S13)
    this.polarizeRestriction = [null, null];

    // 光谱叠加 (S15) 累计伤害加成
    this.spectrumBonus = [0, 0];

    // 用电辅助收集器 (S27 短路开关)
    this.shortCircuitActive = [false, false];

    // 高压击穿 (S29)
    this.highVoltagePierce = [0, 0];          // 剩余回合数

    // 多路放电 (S31) 减费效果
    this.multiDischarge = [false, false];

    // 上回合攻击记录（用于A02惯性冲锋和A05蓄力等）
    this.lastTurnDamage = [0, 0];             // 上回合造成的总伤害
    this.lastTurnOwnAtks = [{}, {}];          // 上回合打出的攻击卡 { domain: count }

    // 光速传播 (S14) 激活状态
    this.lightSpeedActive = [false, false];
    this.lightSpeedTurns = [0, 0];

    // 凝固封锁 (A26) 触发状态 — 通过 player.turnBlocked 处理

    // S06回声消声：查看手牌标记
    this.viewedOpponentHand = [false, false];

    // A02惯性冲锋：本回合的力系伤害（用于下回合延续）
    this.forceDamageThisTurn = [0, 0];

    // A10次声震荡DOT递增基准
    this.a10DotBaseTurns = [null, null];

    // Combo 临时状态
    this._a49NoDestroy = false;                // S31→A49 不摧毁辅助卡
    this._pendingBurnAfterExplode = [0, 0];    // S21→A54 引爆后额外灼烧
    this._heightBonusPerLevel = [0, 0];        // S01→A05 每层高度额外伤害
    this._dotIncrementBoost = [0, 0];          // S09→A10 DOT递增加成
    this._mirrorMazeBoost = [0, 0];            // S13→C03 镜面迷宫概率加成
    this._burnCapIncrease = [0, 0];            // S17→A51 灼烧上限提升
    this._burnDmgPerLayer = [48, 48];          // S19→A54 爆燃每层伤害（默认48）
    this._ignoreDefBonus = [0, 0];             // S31→A49 无视防御额外伤害

    // 初始化：洗牌库，抽初始手牌
    for (let i = 0; i < 2; i++) {
      this.players[i].deck = this.shuffleDeck([...this.players[i].deck]);
      this.drawCards(i, 5);
    }

    this._addLog('游戏开始！双方各抽5张初始手牌。');
  }

  // ==========================================================
  // 状态创建
  // ==========================================================
  _createPlayerState(deckIds, mainDomain, subDomain) {
    return {
      hp: INITIAL_HP,
      maxHp: MAX_HP,
      spirit: INITIAL_SPIRIT,
      deck: deckIds.map(id => this.getCardById(id)).filter(Boolean),
      hand: [],
      discardPile: [],
      fieldSummons: [],        // [{card, hp}]
      fieldDomain: null,       // {card, turnsRemaining} | null
      fieldSupports: [],       // [{card, turnsRemaining}]
      burnLayers: 0,
      burnEnhanced: false,     // S19温度升高
      burnImmune: 0,           // S17比热护盾剩余回合
      paralysis: 0,
      dotEffects: [],          // [{dmg, turnsRemaining, cardId}]
      spiritDebuff: 0,         // 精神力恢复减益值（负数或0）
      turnBlocked: false,      // 下回合是否被封锁
      extraCost: 0,            // 下回合每卡额外费用
      totalForceDmg: 0,        // 上回合力系伤害累计
      domain: { main: mainDomain, sub: subDomain },
      isLightSub: subDomain === '光',
      cardForms: {}            // 卡牌形态跟踪，如 { S08: 'up' }
    };
  }

  // ==========================================================
  // 回合流程
  // ==========================================================

  /** 开始当前玩家回合 */
  startTurn() {
    if (this.gameOver) return;

    const player = this.players[this.currentPlayer];
    const opponent = this.players[1 - this.currentPlayer];
    const pIdx = this.currentPlayer;
    const oIdx = 1 - pIdx;

    this._addLog(`--- 第 ${this.turnNumber} 回合 ---`);

    // 处理灼烧
    this.processBurn(pIdx);
    // 处理麻痹衰减
    this.processParalysis(pIdx);
    // 处理DOT
    this.processDOT(pIdx);
    // 处理场上持续效果
    this.processFieldEffects(pIdx);

    // 检查胜利条件（灼烧/DOT可能导致死亡）
    if (this.checkWinCondition()) return;

    // 精神力恢复：基础+10 + 减益影响（答题增益在setQuizResult中即时发放）
    let spiritGain = SPIRIT_PER_TURN + player.spiritDebuff;
    player.spirit = Math.min(MAX_SPIRIT, Math.max(0, player.spirit + spiritGain));
    this._addLog(`[${pIdx === 0 ? '玩家' : 'AI'}] 精神力恢复: 基础${SPIRIT_PER_TURN} + 减益${player.spiritDebuff} = ${spiritGain}`);

    // 光速传播(S14)精神力恢复
    if (this.lightSpeedActive[pIdx]) {
      player.spirit = Math.min(MAX_SPIRIT, player.spirit + 10);
      this.lightSpeedTurns[pIdx]--;
      if (this.lightSpeedTurns[pIdx] <= 0) {
        this.lightSpeedActive[pIdx] = false;
        this._addLog(`[${pIdx === 0 ? '玩家' : 'AI'}] 光速传播效果结束。`);
      }
    }

    // 电磁感应(S24)精神力
    const emInduction = player.fieldSupports.find(s => s.card.id === 'S24');
    if (emInduction) {
      player.spirit = Math.min(MAX_SPIRIT, player.spirit + 2);
    }

    // 麦克斯韦妖(C02)精神力
    for (const s of player.fieldSummons) {
      if (s.card.id === 'C02' && s.card.effect.spiritPerTurn) {
        player.spirit = Math.min(MAX_SPIRIT, player.spirit + s.card.effect.spiritPerTurn);
      }
    }

    // 焦耳(C08)精神力
    for (const s of player.fieldSummons) {
      if (s.card.id === 'C08' && s.card.effect.spiritPerTurn) {
        player.spirit = Math.min(MAX_SPIRIT, player.spirit + s.card.effect.spiritPerTurn);
      }
    }

    // 重置回合状态
    this.cardsThisTurn = [];
    this.comboThisTurn = [];
    this.pendingCombo = [null, null];
    this._a49NoDestroy = false;
    this._pendingBurnAfterExplode[pIdx] = 0;
    this._heightBonusPerLevel[pIdx] = 0;
    this._dotIncrementBoost[pIdx] = 0;
    this._mirrorMazeBoost[pIdx] = 0;
    this._burnCapIncrease[pIdx] = 0;
    this._burnDmgPerLayer[pIdx] = 48;
    this._ignoreDefBonus[pIdx] = 0;
    this.quizResult = { correct: 0, total: 3, bonus: 0 };
    player.extraCost = 0;

    // 重置偏转首次攻击标记
    this.mirageFirstAtk[pIdx] = false;

    // 重置短路开关
    this.shortCircuitActive[pIdx] = false;

    // 重置多路放电
    this.multiDischarge[pIdx] = false;

    // 清除偏振限制
    this.polarizeRestriction[pIdx] = null;

    // 检查凝固封锁
    if (player.turnBlocked) {
      this._addLog(`[${pIdx === 0 ? '玩家' : 'AI'}] 回合被凝固封锁！无法出牌。`);
    }

    // 回声爆破(A14)待触发 — 在出牌阶段开始处理
    if (this.echoBombPending[pIdx]) {
      const dmg = this.echoBombDmg[pIdx];
      opponent.hp = Math.max(0, opponent.hp - dmg);
      this._addLog(`[回声爆破] 自动触发！造成 ${dmg} 点伤害。`);
      this.echoBombPending[pIdx] = false;
      this.echoBombDmg[pIdx] = 0;
      if (this.checkWinCondition()) return;
    }

    // 重力势能(A05)处理
    this.hightAtkTrack[pIdx]++;
    if (this.hightAtkTrack[pIdx] >= 4) {
      const bonus = this.hightBonus[pIdx] + 1;
      const perHeightDmg = 40 + this._heightBonusPerLevel[pIdx];  // S01→A05 combo加成
      const dmg = 40 + bonus * perHeightDmg;
      opponent.hp = Math.max(0, opponent.hp - dmg);
      this._addLog(`[重力势能] 蓄满触发！造成 ${dmg} 点伤害（高度=${bonus}, 每层=${perHeightDmg}）。`);
      this.hightAtkTrack[pIdx] = 0;
      this.hightBonus[pIdx] = 0;
    }

    // 抽牌
    this.drawCards(pIdx, DRAW_PER_TURN);
    this.phase = 'draw';
  }

  /**
   * 抽牌
   * @param {number} playerIdx - 玩家索引
   * @param {number} count - 抽牌数量
   */
  drawCards(playerIdx, count) {
    const player = this.players[playerIdx];
    let drawn = 0;

    for (let i = 0; i < count; i++) {
      // 牌库空：弃牌堆洗回
      if (player.deck.length === 0) {
        if (player.discardPile.length === 0) {
          this._addLog(`[${playerIdx === 0 ? '玩家' : 'AI'}] 牌库和弃牌堆均空，无法抽牌。`);
          break;
        }
        player.deck = this.shuffleDeck([...player.discardPile]);
        player.discardPile = [];
        this._addLog(`[${playerIdx === 0 ? '玩家' : 'AI'}] 弃牌堆洗回牌库。`);
      }
      const card = player.deck.pop();
      player.hand.push(card);
      drawn++;
    }

    // 手牌超过上限则进入弃牌阶段（由UI触发）
    if (player.hand.length > MAX_HAND_SIZE) {
      this.phase = 'discard';
    }
  }

  /** 进入答题阶段 */
  startQuizPhase() {
    this.phase = 'quiz';
  }

  /**
   * 设置答题结果
   * @param {number} correct - 答对数
   * @param {number} total - 总题数
   */
  setQuizResult(correct, total) {
    const bonus = QUIZ_BONUS[correct] || 0;
    this.quizResult = { correct, total, bonus };

    // 答题增益即时发放：攻击伤害提升 + 精神力恢复
    const quizSpiritBonus = Math.floor(bonus * 100);
    const player = this.players[this.currentPlayer];
    player.spirit = Math.min(MAX_SPIRIT, player.spirit + quizSpiritBonus);
    this._addLog(`[答题] ${correct}/${total} 正确，攻击增益 ${(bonus * 100).toFixed(0)}%，精神力+${quizSpiritBonus}。`);
    this.startPlayPhase();
  }

  /** 进入出牌阶段 */
  startPlayPhase() {
    this.phase = 'play';
    this._addLog(`[${this.currentPlayer === 0 ? '玩家' : 'AI'}] 进入出牌阶段。`);
  }

  /** 结算阶段 */
  settlePhase() {
    this.phase = 'settle';

    // 处理薛定谔的猫(C04)随机效果
    const player = this.players[this.currentPlayer];
    for (const s of player.fieldSummons) {
      if (s.card.id === 'C04') {
        if (Math.random() < 0.5) {
          const opponent = this.players[1 - this.currentPlayer];
          opponent.hp = Math.max(0, opponent.hp - 100);
          this._addLog(`[薛定谔的猫] 造成 100 点伤害！`);
        } else {
          const heal = Math.min(MAX_HP - player.hp, 100);
          player.hp += heal;
          if (heal < 100) {
            player.spirit = Math.min(MAX_SPIRIT, player.spirit + 30);
            this._addLog(`[薛定谔的猫] HP已满，恢复 30 点精神力。`);
          } else {
            this._addLog(`[薛定谔的猫] 恢复 ${heal} 点HP。`);
          }
        }
        if (this.checkWinCondition()) return;
      }
    }

    // 处理驻场卡回合递减
    this._tickFieldCards(this.currentPlayer);
    this._tickFieldCards(1 - this.currentPlayer);

    // 处理精神力恢复减益递减
    const opp = this.players[1 - this.currentPlayer];
    if (opp.spiritDebuff < 0) {
      opp.spiritDebuff = Math.min(0, opp.spiritDebuff + 1);
    }

    // 处理海市蜃楼(A50)回合
    if (this.mirageTurns[this.currentPlayer] > 0) {
      this.mirageTurns[this.currentPlayer]--;
    }

    // 处理镜面迷宫(S34)
    if (this.mirrorMaze[this.currentPlayer] > 0) {
      this.mirrorMaze[this.currentPlayer]--;
    }

    // 处理影子束缚(S35)
    if (this.shadowBindTurns[this.currentPlayer] > 0) {
      this.shadowBindTurns[this.currentPlayer]--;
    }

    // 检查胜利条件
    this.checkWinCondition();
  }

  /** 弃牌阶段 */
  discardPhase(discardIndices) {
    this.phase = 'discard';
    const player = this.players[this.currentPlayer];

    if (player.hand.length <= MAX_HAND_SIZE) {
      this._addLog(`[${this.currentPlayer === 0 ? '玩家' : 'AI'}] 手牌 ${player.hand.length}/${MAX_HAND_SIZE}，无需弃牌。`);
      return;
    }

    if (!Array.isArray(discardIndices) || discardIndices.length === 0) {
      this._addLog(`[${this.currentPlayer === 0 ? '玩家' : 'AI'}] 未指定弃牌，跳过。`);
      return;
    }

    // 弃置指定索引的牌（按降序处理避免索引偏移）
    const sorted = [...discardIndices].sort((a, b) => b - a);
    for (const idx of sorted) {
      if (idx >= 0 && idx < player.hand.length) {
        const card = player.hand.splice(idx, 1)[0];
        player.discardPile.push(card);
        this._addLog(`[${this.currentPlayer === 0 ? '玩家' : 'AI'}] 弃置了「${card.name}」。`);
      }
    }
  }

  /** 结束回合 */
  endTurn() {
    if (this.gameOver) return;

    // 记录上回合力系伤害（用于A02惯性冲锋）
    this.lastTurnDamage[this.currentPlayer] = this.players[this.currentPlayer].totalForceDmg;
    this.forceDamageThisTurn[this.currentPlayer] = 0;
    // 重置力系伤害累计
    this.players[this.currentPlayer].totalForceDmg = 0;

    // 凝固封锁解除
    const curPlayer = this.players[this.currentPlayer];
    if (curPlayer.turnBlocked) {
      curPlayer.turnBlocked = false;
    }
    // 重置临界突破标记
    this.criticalBreak[this.currentPlayer] = false;

    // 切换回合
    this.currentPlayer = 1 - this.currentPlayer;
    this.turnNumber++;
    this.startTurn();
  }

  // ==========================================================
  // 伤害计算（核心）
  // ==========================================================

  /**
   * 计算攻击伤害
   * @param {object} card - 卡牌对象
   * @param {number} attackerIdx - 攻击方索引
   * @param {number} defenderIdx - 防守方索引
   * @param {number} comboBonus - 组合加成（固定值）
   * @returns {number} 最终伤害
   */
  calculateDamage(card, attackerIdx, defenderIdx, comboBonus = 0) {
    const attacker = this.players[attackerIdx];
    const defender = this.players[defenderIdx];
    let damage = card.effect.dmg || 0;

    // 1. 领域加成（固定值）
    // D01 力之领域：力系攻击+25
    if (attacker.fieldDomain) {
      const dCard = attacker.fieldDomain.card;
      if (dCard.effect.bonusDmg && card.domain.some(d => dCard.domain.includes(d))) {
        damage += dCard.effect.bonusDmg;
      }
    }

    // 2. 召唤物加成（固定值）
    for (const s of attacker.fieldSummons) {
      if (s.card.effect.dmgBonus) {
        // 检查领域匹配
        const sDomains = s.card.domain;
        const matchesDomain = card.domain.some(d => sDomains.includes(d));
        if (matchesDomain) {
          damage += s.card.effect.dmgBonus;
        }
      }
      // 牛顿(C05)：力系攻击+20
      if (s.card.id === 'C05' && s.card.effect.forceDmgBonus && card.domain.includes('力')) {
        damage += s.card.effect.forceDmgBonus;
      }
    }

    // 3. 串联增压（电被动：场上电辅助数×15）
    if (card.domain.includes('电') || attacker.fieldDomain?.card?.domain?.includes('电')) {
      const electricSupports = attacker.fieldSupports.filter(
        s => s.card.domain.includes('电')
      ).length;
      damage += electricSupports * 15;
    }

    // 4. 辅助组合/条件加成
    // 处理 conditional 效果
    if (card.effect.conditional) {
      const cond = card.effect.conditional;
      // 处理"每张己方辅助卡在场"
      if (cond.condition.includes('己方辅助卡')) {
        damage += attacker.fieldSupports.length * (cond.bonusDmg || 0);
      }
      // 处理"每张己方驻场辅助卡在场"（包括声系驻场卡）
      if (cond.condition.includes('驻场辅助') || cond.condition.includes('驻场卡')) {
        if (cond.condition.includes('声系')) {
          const soundField = attacker.fieldSupports.filter(
            s => s.card.domain.includes('声')
          ).length;
          damage += soundField * (cond.bonusDmg || 0);
        } else if (cond.condition.includes('己方驻场辅助')) {
          damage += attacker.fieldSupports.length * (cond.bonusDmg || 0);
        }
      }
      // 处理"每层灼烧"
      if (cond.condition.includes('灼烧')) {
        damage += defender.burnLayers * (cond.bonusDmg || 0);
      }
      // 处理"对方场上每张卡"
      if (cond.condition.includes('对方场上每张卡')) {
        const defenderField = defender.fieldSummons.length +
          (defender.fieldDomain ? 1 : 0) + defender.fieldSupports.length;
        damage += defenderField * (cond.bonusDmg || 0);
      }
      // 处理"己方有力领域"
      if (cond.condition.includes('己方有力领域')) {
        if (attacker.fieldDomain?.card?.domain?.includes('力')) {
          damage += cond.bonusDmg || 0;
        }
      }
      // 处理"己方有领域卡"
      if (cond.condition.includes('己方有领域卡')) {
        if (attacker.fieldDomain) {
          damage += cond.bonusDmg || 0;
        }
      }
      // 处理"己方有热领域"
      if (cond.condition.includes('己方有热领域')) {
        if (attacker.fieldDomain?.card?.domain?.includes('热')) {
          damage += cond.bonusDmg || 0;
        }
      }
      // 处理"场上电辅助≥N"
      if (cond.condition.includes('场上电辅助')) {
        const electricCount = attacker.fieldSupports.filter(
          s => s.card.domain.includes('电')
        ).length;
        const match = cond.condition.match(/≥(\d+)/);
        const threshold = match ? parseInt(match[1]) : 1;
        if (electricCount >= threshold) {
          damage += cond.bonusDmg || 0;
        }
      }
      // 处理"本回合对方已受电系伤害"
      if (cond.condition.includes('已受电系伤害')) {
        // 此条件需要在调用时由playCard处理
        // 暂由外部传入
      }
    }

    // 声速激增(A51)
    if (card.domain.includes('声') && this.soundSpeedBuff[attackerIdx] > 0) {
      damage += this.soundSpeedBuff[attackerIdx];
      this.soundSpeedBuff[attackerIdx] = 0;
    }

    // 光谱叠加(S15)
    damage += this.spectrumBonus[attackerIdx];

    // 短路开关(S27)
    if (this.shortCircuitActive[attackerIdx] && card.domain.includes('电') && card.type === 'attack') {
      damage += 20;
    }

    // 组合加成
    damage += comboBonus;

    // 临界突破 (T02): 本回合攻击伤害翻倍
    if (this.criticalBreak[attackerIdx]) {
      damage *= 2;
    }

    // 5. 答题增益（百分比）
    const quizBonus = this.quizResult.bonus || 0;
    damage = Math.floor(damage * (1 + quizBonus));

    // 6. 防御减伤
    let totalDefense = 0;
    const cardDomains = card.domain;

    // 领域卡提供的防御（替换旧领域时新领域才有防御）
    // 本游戏领域中领域卡本身不直接提供防御减伤给玩家
    // 防御来自辅助卡如 S04, S10, S23, S42

    // 领域防御：检查防御方的领域卡是否提供防御
    // 注：领域卡D01-D05不直接提供防御减伤
    // 防御减伤主要来自防御型辅助卡

    // 辅助卡防御
    for (const s of defender.fieldSupports) {
      if (s.card.effect.defense) {
        const def = s.card.effect.defense;
        if (cardDomains.some(d => def.domain === d)) {
          totalDefense += def.value;
        }
      }
    }

    damage = Math.max(0, damage - totalDefense);

    // 7. 最终取整
    damage = Math.floor(damage);

    return damage;
  }

  // ==========================================================
  // 出牌处理
  // ==========================================================

  /**
   * 打出一张牌
   * @param {number} playerIdx - 出牌方索引
   * @param {string} cardId - 卡牌ID
   * @param {string} target - 目标 "player"|"summon_N"
   * @returns {{ success: boolean, msg: string, effects: array }}
   */
  playCard(playerIdx, cardId, target = 'player') {
    const player = this.players[playerIdx];
    const opponent = this.players[1 - playerIdx];

    // 查找手牌中的卡牌
    const handIdx = player.hand.findIndex(c => c.id === cardId);
    if (handIdx === -1) {
      return { success: false, msg: '手牌中没有此卡牌。', effects: [] };
    }

    const card = player.hand[handIdx];

    // 检查是否可以打出
    const canPlayResult = this.canPlay(playerIdx, card);
    if (!canPlayResult.can) {
      return { success: false, msg: canPlayResult.reason, effects: [] };
    }

    // 检查对方回合出牌（光速传播）
    if (playerIdx !== this.currentPlayer) {
      if (!this.canPlayInOpponentTurn(playerIdx, card)) {
        return { success: false, msg: '无法在对方回合打出此牌。', effects: [] };
      }
    }

    // 扣除精神力（含额外费用和麻痹影响）
    let cost = card.cost + player.extraCost;
    // 麻痹：每卡额外消耗麻痹强度×2精神力
    cost += player.paralysis * PARALYSIS_COST;
    player.spirit = Math.max(0, player.spirit - cost);

    // 从手牌移除
    player.hand.splice(handIdx, 1);
    const effects = [];

    // 记录本回合打出的卡
    this.cardsThisTurn.push(cardId);

    // 组合检测（必须在卡牌效果处理之前，这样攻击卡能读到 pendingCombo）
    const combo = this.checkCombo(card, this.cardsThisTurn, playerIdx);
    if (combo && !this.comboThisTurn.includes(combo.type)) {
      this.comboThisTurn.push(combo.type);
      this.pendingCombo[playerIdx] = combo;
      this._addLog(`[${playerIdx === 0 ? '玩家' : 'AI'}] ⚡ 组合触发：${combo.msg}`);
    }

    // 按卡牌类型处理
    switch (card.type) {
      case 'attack':
        effects.push(...this._handleAttack(card, playerIdx, target));
        break;
      case 'support':
        effects.push(...this._handleSupport(card, playerIdx));
        break;
      case 'domain':
        effects.push(...this._handleDomain(card, playerIdx));
        break;
      case 'summon':
        effects.push(...this._handleSummon(card, playerIdx));
        break;
      case 'phase':
        effects.push(...this._handlePhase(card, playerIdx));
        break;
    }

    // 电磁感应(S24)：电系卡额外+2精神力
    const emInduction = player.fieldSupports.find(s => s.card.id === 'S24');
    if (emInduction && card.domain.includes('电')) {
      player.spirit = Math.min(MAX_SPIRIT, player.spirit + 2);
    }

    // 麦克斯韦妖(C02)：每出一卡+2精神力
    const maxwell = player.fieldSummons.find(s => s.card.id === 'C02');
    if (maxwell) {
      player.spirit = Math.min(MAX_SPIRIT, player.spirit + 2);
      if (player.spirit >= MAX_SPIRIT - 1) {
        const heal = Math.min(MAX_HP - player.hp, 30);
        player.hp += heal;
      }
    }

    this._addLog(`[${playerIdx === 0 ? '玩家' : 'AI'}] 打出「${card.name}」(费用${cost})。`);

    // 卡牌放入弃牌堆（除驻场卡外）
    if (!this.isFieldCard(card)) {
      player.discardPile.push(card);
    }

    // 检查胜利条件
    this.checkWinCondition();

    return { success: true, msg: `成功打出「${card.name}」。`, effects };
  }

  // ==========================================================
  // 攻击处理
  // ==========================================================
  _handleAttack(card, attackerIdx, target) {
    const attacker = this.players[attackerIdx];
    const opponent = this.players[1 - attackerIdx];
    const effects = [];
    const oIdx = 1 - attackerIdx;

    // 计算伤害（无视防御的卡使用不扣防御的公式）
    let damage;
    if (card.effect.ignoreDef) {
      damage = this._calcRawDamage(card, attackerIdx, oIdx);
    } else {
      damage = this.calculateDamage(card, attackerIdx, oIdx, 0);
    }

    // ========== Combo 效果处理 ==========
    const combo = this.pendingCombo[attackerIdx];
    if (combo && combo.effects) {
      for (const eff of combo.effects) {
        switch (eff.type) {
          case 'extra_damage':
            damage += (eff.value || 0);
            effects.push({ type: 'combo_extra_dmg', value: eff.value });
            break;
          case 'extra_damage_per_burn':
            const burnDmg = (opponent.burnLayers || 0) * (eff.perLayer || 0);
            damage += burnDmg;
            if (burnDmg > 0) effects.push({ type: 'combo_per_burn_dmg', value: burnDmg });
            break;
          case 'extra_damage_per_force_card':
            // 本回合之前打出的力系卡数量
            const forceCards = this.cardsThisTurn.slice(0, -1).filter(cid => {
              const c = this.getCardById(cid);
              return c && c.domain && c.domain.includes('力');
            }).length;
            const forceDmg = Math.min(forceCards * (eff.value || 0), eff.cap || Infinity);
            damage += forceDmg;
            if (forceDmg > 0) effects.push({ type: 'combo_force_dmg', value: forceDmg });
            break;
          case 'extra_damage_ignore_block':
            damage += (eff.value || 0);
            effects.push({ type: 'combo_ignore_block', value: eff.value });
            break;
          case 'extra_burn':
            opponent.burnLayers += (eff.layers || 0);
            const maxBurn = MAX_BURN_DEFAULT + this._burnCapIncrease[attackerIdx];
            opponent.burnLayers = Math.min(opponent.burnLayers, maxBurn);
            effects.push({ type: 'combo_extra_burn', layers: eff.layers });
            break;
          case 'extra_dot':
            opponent.dotEffects.push({
              dmg: eff.dmg || 0,
              turnsRemaining: eff.turns || 1,
              cardId: card.id
            });
            effects.push({ type: 'combo_extra_dot', dmg: eff.dmg, turns: eff.turns });
            break;
          case 'extend_dot_turns':
            for (const dot of opponent.dotEffects) {
              dot.turnsRemaining += (eff.value || 0);
            }
            effects.push({ type: 'combo_extend_dot', value: eff.value });
            break;
          case 'view_hand':
            effects.push({ type: 'combo_view_hand', count: eff.count });
            break;
          case 'steal_spirit':
            const stolen = Math.min(eff.value || 0, opponent.spirit);
            opponent.spirit -= stolen;
            attacker.spirit = Math.min(MAX_SPIRIT, attacker.spirit + stolen);
            effects.push({ type: 'combo_steal_spirit', value: stolen });
            break;
          case 'heal_hp':
            const healed = Math.min(eff.value || 0, MAX_HP - attacker.hp);
            attacker.hp += healed;
            effects.push({ type: 'combo_heal_hp', value: healed });
            break;
          case 'modify_flag':
            if (eff.flag === 'a49_no_destroy') {
              this._a49NoDestroy = true;
            }
            if (eff.flag === 'c04_choose') {
              this._c04PlayerChoose = true;
            }
            effects.push({ type: 'combo_flag', flag: eff.flag });
            break;
          case 'set_return_to_hand':
            // 设置卡牌回手标记（如A16回手）
            effects.push({ type: 'combo_return_to_hand', cardId: eff.cardId });
            break;
          case 'boost_dot_increment':
            this._dotIncrementBoost[attackerIdx] = (eff.value || 0);
            effects.push({ type: 'combo_dot_boost', value: eff.value });
            break;
          case 'boost_mirror_maze':
            this._mirrorMazeBoost[attackerIdx] = (eff.value || 0);
            effects.push({ type: 'combo_mirror_boost', value: eff.value });
            break;
          case 'boost_burn_cap':
            this._burnCapIncrease[attackerIdx] = (eff.value || 0);
            effects.push({ type: 'combo_burn_cap', value: eff.value });
            break;
          case 'boost_clear_debuff':
            // 清除己方 DOT 效果
            const cleared = Math.min(eff.value || 0, attacker.dotEffects.length);
            if (cleared > 0) {
              attacker.dotEffects.splice(0, cleared);
              effects.push({ type: 'combo_clear_debuff', removed: cleared });
            }
            break;
          case 'boost_burn_dmg':
            this._burnDmgPerLayer[attackerIdx] = (eff.value || 48);
            effects.push({ type: 'combo_burn_dmg', perLayer: eff.value });
            break;
          case 'modify_height':
            this._heightBonusPerLevel[attackerIdx] = (eff.perHeight || 0);
            effects.push({ type: 'combo_height_bonus', perHeight: eff.perHeight });
            break;
          case 'extra_burn_after_detonate':
            this._pendingBurnAfterExplode[attackerIdx] = (eff.layers || 0);
            break;
          case 'boost_ignore_defense':
            damage += (eff.value || 0);
            this._ignoreDefBonus[attackerIdx] = (eff.value || 0);
            effects.push({ type: 'combo_ignore_def', value: eff.value });
            break;
          default:
            this._addLog(`[Combo::未识别] ${eff.type} (${combo.type})`);
        }
      }
    }

    // 特殊攻击处理
    if (card.id === 'A02') {
      // 惯性冲锋：上回合力学伤害50%额外
      const extra = Math.floor(this.lastTurnDamage[attackerIdx] * 0.5);
      damage += extra;
      effects.push({ type: 'inertia_extra', value: extra });
    }

    if (card.id === 'A03') {
      // 压强穿刺：无视力领域防御
      // 已在calculateDamage中ignoreDef标记，此处处理
      // 实际伤害公式中已不扣防御
    }

    if (card.id === 'A05') {
      // 重力势能：增加高度计数
      this.hightBonus[attackerIdx]++;
      effects.push({ type: 'height_increase', value: this.hightBonus[attackerIdx] });
    }

    if (card.id === 'A08') {
      // 做功打击：附加已损失HP的10%
      const lostHp = MAX_HP - opponent.hp;
      const extra = Math.floor(lostHp * 0.1);
      damage += extra;
      effects.push({ type: 'work_extra', value: extra });
    }

    if (card.id === 'A14') {
      // 回声爆破：本回合0伤害，下回合出牌阶段自动100伤害
      this.echoBombPending[attackerIdx] = true;
      this.echoBombDmg[attackerIdx] = 100;
      damage = 0;
    }

    if (card.id === 'A41') {
      // 太阳能聚变：己方有热领域则+70
      if (attacker.fieldDomain?.card?.domain?.includes('热')) {
        damage += 70;
      }
    }

    if (card.id === 'A48') {
      // 静电爆发：本回合对方已受电系伤害则+25
      // 简化：首次电系攻击不触发，后续触发
      const alreadyElectric = this.cardsThisTurn.filter(cid => {
        const c = this.getCardById(cid);
        return c && c.type === 'attack' && c.domain.includes('电') && c.id !== 'A48';
      }).length > 0;
      if (alreadyElectric) {
        damage += 25;
        effects.push({ type: 'static_bonus', value: 25 });
      }
    }

    if (card.id === 'A49') {
      // 过载放电：场上电辅助≥3时伤害翻倍
      const electricCount = attacker.fieldSupports.filter(s => s.card.domain.includes('电')).length;
      if (electricCount >= 3) {
        damage *= 2;
        // Combo(S31→A49)：不摧毁辅助卡
        if (!this._a49NoDestroy) {
          const elecIdx = attacker.fieldSupports.findIndex(s => s.card.domain.includes('电'));
          if (elecIdx !== -1) {
            attacker.fieldSupports.splice(elecIdx, 1);
            effects.push({ type: 'destroy_support', msg: '摧毁了1张己方电辅助卡' });
          }
        } else {
          effects.push({ type: 'combo_a49_saved', msg: '多路放电保护：辅助卡未被摧毁' });
        }
      }
    }

    if (card.id === 'A54') {
      // 爆燃：引爆所有灼烧层数（默认48，S19→A54 combo可提升）
      const perLayerDmg = this._burnDmgPerLayer[attackerIdx];
      const burnExplode = opponent.burnLayers * perLayerDmg;
      opponent.burnLayers = 0;
      damage += burnExplode;
      effects.push({ type: 'burn_explode', value: burnExplode, perLayer: perLayerDmg });
      // Combo(S21→A54)：引爆后额外+灼烧
      if (this._pendingBurnAfterExplode[attackerIdx] > 0) {
        opponent.burnLayers += this._pendingBurnAfterExplode[attackerIdx];
        effects.push({ type: 'combo_burn_after_explode', layers: this._pendingBurnAfterExplode[attackerIdx] });
        this._pendingBurnAfterExplode[attackerIdx] = 0;
      }
    }

    if (card.id === 'A55') {
      // 凸透引燃：每张己方驻场辅助卡附加1层灼烧（上限3层）
      const extraBurn = Math.min(3, attacker.fieldSupports.length);
      opponent.burnLayers = Math.max(0, opponent.burnLayers + extraBurn);
      effects.push({ type: 'extra_burn', layers: extraBurn });
    }

    // 惠更斯(C11)闪避检查
    for (const s of opponent.fieldSummons) {
      if (s.card.id === 'C11' && s.card.effect.dodgeChance) {
        if (Math.random() * 100 < s.card.effect.dodgeChance) {
          this._addLog(`[惠更斯] 闪避了攻击！`);
          damage = 0;
          effects.push({ type: 'dodge', msg: '惠更斯闪避了攻击' });
        }
      }
    }

    // 芝诺龟(C01)减半伤害
    if (!this.mirageFirstAtk[attackerIdx]) {
      for (const s of opponent.fieldSummons) {
        if (s.card.id === 'C01') {
          const halfDmg = this._isFirstAtkThisTurn(attackerIdx);
          if (halfDmg) {
            damage = Math.floor(damage / 2);
            effects.push({ type: 'zeno_halve', msg: '芝诺龟将首次攻击伤害减半' });
          }
        }
      }
      this.mirageFirstAtk[attackerIdx] = true;
    }

    // 海市蜃楼(A50)偏转检查
    if (this.mirageTurns[oIdx] > 0 && !this.mirageFirstAtk[attackerIdx]) {
      if (Math.random() < 0.3) {
        this._addLog(`[海市蜃楼] 攻击被偏转！伤害变为0。`);
        damage = 0;
        effects.push({ type: 'mirage_deflect', msg: '海市蜃楼偏转了攻击' });
      }
    }

    // 处理特定攻击的消灭/弹回效果
    const destroyCards = ['A07', 'A09', 'A18', 'A25'];
    const bounceCards = ['A38', 'A46'];
    const destroySummons = ['A35'];

    if (destroyCards.includes(card.id)) {
      // 消灭对方一张驻场卡（辅助优先）
      if (opponent.fieldSupports.length > 0) {
        const removed = opponent.fieldSupports.shift();
        opponent.discardPile.push(removed.card);
        effects.push({ type: 'destroy_support', msg: `消灭了「${removed.card.name}」` });
      } else if (opponent.fieldDomain) {
        const removed = opponent.fieldDomain;
        opponent.fieldDomain = null;
        opponent.discardPile.push(removed.card);
        effects.push({ type: 'destroy_domain', msg: `消灭了领域卡「${removed.card.name}」` });
      }
    }

    if (bounceCards.includes(card.id)) {
      // 弹回对方驻场卡
      if (opponent.fieldSupports.length > 0) {
        const bounced = opponent.fieldSupports.shift();
        opponent.hand.push(bounced.card);
        effects.push({ type: 'bounce', msg: `弹回了「${bounced.card.name}」至对方手牌` });
      } else if (opponent.fieldDomain) {
        const bounced = opponent.fieldDomain;
        opponent.fieldDomain = null;
        opponent.hand.push(bounced.card);
        effects.push({ type: 'bounce', msg: `弹回了领域卡「${bounced.card.name}」至对方手牌` });
      } else if (card.id === 'A38') {
        // A38光压推击：否则盲选手牌放回牌库顶
        if (opponent.hand.length > 0) {
          const rIdx = Math.floor(Math.random() * opponent.hand.length);
          const taken = opponent.hand.splice(rIdx, 1)[0];
          opponent.deck.push(taken);
          effects.push({ type: 'blind_return', msg: '盲选了对方1张手牌放回牌库顶部' });
        }
      }
    }

    if (destroySummons.includes(card.id)) {
      // 短路熔毁：优先消灭召唤物
      if (opponent.fieldSummons.length > 0) {
        const removed = opponent.fieldSummons.shift();
        opponent.discardPile.push(removed.card);
        damage = 0; // 消灭召唤物时不对玩家造成伤害
        effects.push({ type: 'destroy_summon', msg: `消灭了召唤物「${removed.card.name}」` });
      }
    }

    // 造成伤害
    if (damage > 0) {
      if (target.startsWith('summon_')) {
        const summonIdx = parseInt(target.split('_')[1]);
        effects.push(...this._attackSummon(opponent, summonIdx, damage));
      } else {
        opponent.hp = Math.max(0, opponent.hp - damage);
        this._addLog(`[攻击] 造成 ${damage} 点伤害。${oIdx === 0 ? '玩家' : 'AI'} HP: ${opponent.hp}/${MAX_HP}`);
        effects.push({ type: 'damage', value: damage, target: 'player' });
      }
    }

    // 记录力系伤害
    if (card.domain.includes('力')) {
      attacker.totalForceDmg += damage;
    }

    // 应用DOT效果
    if (card.effect.dot) {
      opponent.dotEffects.push({
        dmg: card.effect.dot.perTurn,
        turnsRemaining: card.effect.dot.turns,
        initialTurns: card.effect.dot.turns,  // 记录初始回合数（用于A10递增）
        cardId: card.id
      });
      effects.push({ type: 'dot', dmg: card.effect.dot.perTurn, turns: card.effect.dot.turns });
    }

    // 应用灼烧
    if (card.effect.burnLayers) {
      opponent.burnLayers += card.effect.burnLayers;
      // 热之领域(D04)：额外+1层
      if (attacker.fieldDomain?.card?.id === 'D04') {
        opponent.burnLayers += 1;
      }
      // 灼烧上限检查
      const maxBurn = MAX_BURN_DEFAULT + this._burnCapIncrease[attackerIdx];
      opponent.burnLayers = Math.min(opponent.burnLayers, maxBurn);
      effects.push({ type: 'burn', layers: card.effect.burnLayers });
    }

    // 处理特殊效果（文本-based）
    this._applySpecialEffects(card, attackerIdx, opponent, effects);

    return effects;
  }

  // ==========================================================
  // 辅助卡处理
  // ==========================================================
  _handleSupport(card, attackerIdx) {
    const attacker = this.players[attackerIdx];
    const opponent = this.players[1 - attackerIdx];
    const effects = [];

    // 精神力恢复
    if (card.effect.spiritRestore) {
      attacker.spirit = Math.min(MAX_SPIRIT, attacker.spirit + card.effect.spiritRestore);
      effects.push({ type: 'spirit_restore', value: card.effect.spiritRestore });
    }

    // 防御效果（驻场辅助卡）
    if (card.effect.defense) {
      // 检查是否有同名效果
      const existing = attacker.fieldSupports.find(
        s => s.card.id === card.id || (s.card.effect.defense?.domain === card.effect.defense?.domain)
      );
      if (existing) {
        // 刷新持续时间
        existing.turnsRemaining = card.effect.defense.turns;
      } else {
        attacker.fieldSupports.push({
          card,
          turnsRemaining: card.effect.defense.turns
        });
      }
    }

    // 增伤buff效果（驻场）
    if (card.effect.buffDmg && !card.effect.defense && !card.effect.drawCards) {
      const existing = attacker.fieldSupports.find(s => s.card.id === card.id);
      if (existing) {
        existing.turnsRemaining = 2; // 默认2回合
      } else {
        attacker.fieldSupports.push({ card, turnsRemaining: 2 });
      }
      effects.push({ type: 'buff', value: card.effect.buffDmg });
    }

    // 特殊效果处理
    this._applySpecialEffects(card, attackerIdx, opponent, effects);

    // S08频率调节：跟踪形态（默认'up'=升高；Phase 4补UI选择）
    if (card.id === 'S08') {
      attacker.cardForms['S08'] = 'up'; // 默认升高
      effects.push({ type: 'set_frequency_form', form: 'up', msg: '频率调节：升高模式' });
    }

    return effects;
  }

  // ==========================================================
  // 领域卡处理
  // ==========================================================
  _handleDomain(card, playerIdx) {
    const player = this.players[playerIdx];
    const effects = [];

    // 替换旧领域卡
    if (player.fieldDomain) {
      player.discardPile.push(player.fieldDomain.card);
      effects.push({ type: 'replace_domain', old: player.fieldDomain.card.name });
    }

    player.fieldDomain = {
      card,
      turnsRemaining: card.effect.turns || 3
    };
    effects.push({ type: 'domain', name: card.name, turns: card.effect.turns || 3 });

    return effects;
  }

  // ==========================================================
  // 召唤物处理
  // ==========================================================
  _handleSummon(card, playerIdx) {
    const player = this.players[playerIdx];
    const effects = [];

    // 检查上限
    if (player.fieldSummons.length >= MAX_SUMMONS) {
      return [{ type: 'error', msg: '召唤物已达上限（2个）。' }];
    }

    // 同名限1
    if (player.fieldSummons.some(s => s.card.id === card.id)) {
      return [{ type: 'error', msg: `同名召唤物「${card.name}」已存在。` }];
    }

    player.fieldSummons.push({
      card,
      hp: card.effect.hp || 200
    });
    effects.push({ type: 'summon', name: card.name, hp: card.effect.hp || 200 });

    // 处理召唤物相关的 combo 效果（如 C03↔C04 的 modify_flag）
    const combo = this.pendingCombo[playerIdx];
    if (combo && combo.effects) {
      for (const eff of combo.effects) {
        switch (eff.type) {
          case 'modify_flag':
            if (eff.flag === 'c04_choose') {
              this._c04PlayerChoose = true;
            }
            effects.push({ type: 'combo_flag', flag: eff.flag });
            break;
          default:
            // 其他召唤相关 combo 效果待 Phase 4 实现
            break;
        }
      }
    }

    return effects;
  }

  // ==========================================================
  // 相变卡处理
  // ==========================================================
  _handlePhase(card, playerIdx) {
    const player = this.players[playerIdx];
    const opponent = this.players[1 - playerIdx];
    const effects = [];

    if (card.id === 'T01') {
      // 能量守恒：已损失HP的30%转精神力（最多60）
      const lostHp = MAX_HP - player.hp;
      const spiritGain = Math.min(60, Math.floor(lostHp * 0.3));
      player.spirit = Math.min(MAX_SPIRIT, player.spirit + spiritGain);
      effects.push({ type: 'energy_conserve', spiritGain });
    }

    if (card.id === 'T02') {
      // 临界突破：本回合攻击伤害翻倍
      this.criticalBreak[playerIdx] = true;
      effects.push({ type: 'critical_break', msg: '临界突破！本回合所有攻击伤害翻倍' });
    }

    if (card.id === 'T03') {
      // 熵逆转：交换HP
      const tmp = player.hp;
      player.hp = opponent.hp;
      opponent.hp = tmp;
      player.spirit = 0;
      opponent.spirit = MAX_SPIRIT;
      effects.push({ type: 'entropy_reverse', playerHp: player.hp, aiHp: opponent.hp });
    }

    return effects;
  }

  // ==========================================================
  // 特殊效果处理
  // ==========================================================
  _applySpecialEffects(card, playerIdx, opponent, effects) {
    const player = this.players[playerIdx];
    const oIdx = 1 - playerIdx;

    // --- 共通效果 ---
    if (card.effect.special) {
      const spec = card.effect.special;

      // 查看手牌
      if (spec.includes('查看对方') && spec.includes('手牌')) {
        const count = card.id === 'A52' || card.id === 'S16' ? 'all' : 2;
        effects.push({ type: 'view_hand', count, player: oIdx });
      }

      // 弃置对方手牌
      if (card.effect.discardOpponent) {
        effects.push({ type: 'discard_opponent', count: card.effect.discardOpponent });
      }

      // 清除负面状态
      if (spec.includes('清除') && spec.includes('负面状态')) {
        opponent.burnLayers = Math.max(0, opponent.burnLayers - 1);
        if (opponent.paralysis > 0) opponent.paralysis = Math.max(0, opponent.paralysis - 1);
        if (opponent.dotEffects.length > 0) opponent.dotEffects.shift();
        effects.push({ type: 'clear_debuff', msg: '清除了1种负面状态' });
      }

      // 精神力恢复减益 (A24/A36)
      if (spec.includes('精神力恢复-3')) {
        opponent.spiritDebuff = Math.max(-10, opponent.spiritDebuff - 3);
        effects.push({ type: 'spirit_debuff', value: -3 });
      }

      // 对方下回合每出卡+费 (A33, A43, S07)
      if (spec.includes('每出卡+') || spec.includes('每出一张卡额外消耗')) {
        const match = spec.match(/\+(\d+)/);
        if (match) {
          opponent.extraCost = parseInt(match[1]);
          effects.push({ type: 'extra_cost', value: opponent.extraCost });
        }
      }

      // 偷取精神力 (A25, A34)
      if (spec.includes('偷取') && spec.includes('精神力')) {
        const match = spec.match(/(\d+)/);
        if (match) {
          const steal = parseInt(match[1]);
          const actual = Math.min(opponent.spirit, steal);
          opponent.spirit -= actual;
          player.spirit = Math.min(MAX_SPIRIT, player.spirit + actual);
          effects.push({ type: 'steal_spirit', value: actual });
        }
      }

      // 凝固封锁 (A26)
      if (spec.includes('无法出牌')) {
        if (opponent.burnLayers >= 2) {
          opponent.burnLayers -= 2;
          opponent.turnBlocked = true;
          effects.push({ type: 'freeze_lock', msg: '对方下回合被凝固封锁' });
        }
      }

      // 消耗灼烧发动的辅助 (S20消耗己方, S23消耗对方)
      if (spec.includes('消耗2层灼烧') || spec.includes('消耗对方2层灼烧')) {
        // S23 热机驱动：消耗对方2层灼烧
        if (card.id === 'S23' && opponent.burnLayers >= 2) {
          opponent.burnLayers -= 2;
          player.spirit = Math.min(MAX_SPIRIT, player.spirit + 15);
          effects.push({ type: 'heat_engine', spiritRestore: 15 });
        }
        // S20 潜热释放：消耗己方2层灼烧
        if (card.id === 'S20' && player.burnLayers >= 2) {
          player.burnLayers -= 2;
          player.hp = Math.min(MAX_HP, player.hp + 80);
          // 清除1种负面状态
          if (player.paralysis > 0) player.paralysis = Math.max(0, player.paralysis - 1);
          if (player.dotEffects.length > 0) player.dotEffects.shift();
          effects.push({ type: 'latent_heat', heal: 80 });
        }
      }

      // 给对附加灼烧 (S21)
      if (spec.includes('附加') && spec.includes('层灼烧') && card.type === 'support') {
        const match = spec.match(/(\d+)层灼烧/);
        if (match) {
          opponent.burnLayers += parseInt(match[1]);
          effects.push({ type: 'burn', layers: parseInt(match[1]) });
        }
      }

      // 温度升高 (S19)：灼烧伤害从30提升到36，影响双方灼烧结算
      if (card.id === 'S19') {
        // S19为全局效果，双方灼烧结算时每层伤害提升至36
        for (let i = 0; i < 2; i++) {
          this.players[i].burnEnhanced = true;
        }
        // 3回合后由processFieldEffects清除
        player.fieldSupports.push({ card, turnsRemaining: 3 });
        effects.push({ type: 'temperature_rise', msg: '灼烧伤害提升至36/层（持续3回合）' });
      }

      // 比热护盾 (S17)
      if (card.id === 'S17') {
        player.burnImmune = 3;
        effects.push({ type: 'burn_immune', turns: 3 });
      }

      // 光速传播 (S14)
      if (card.id === 'S14') {
        this.lightSpeedActive[playerIdx] = true;
        this.lightSpeedTurns[playerIdx] = 4;
        effects.push({ type: 'light_speed', turns: 4 });
      }

      // 恢复HP (A47)
      if (spec.includes('恢复') && spec.includes('HP')) {
        const match = spec.match(/(\d+)/);
        if (match) {
          const heal = Math.min(MAX_HP - player.hp, parseInt(match[1]));
          player.hp += heal;
          effects.push({ type: 'heal', value: heal });
        }
      }

      // 海市蜃楼 (A50)
      if (card.id === 'A50') {
        this.mirageTurns[oIdx] = 4;
        effects.push({ type: 'mirage', turns: 4 });
      }

      // 声速激增 (A51)
      if (card.id === 'A51') {
        const buff = player.burnLayers * 6;
        this.soundSpeedBuff[playerIdx] += buff;
        effects.push({ type: 'sound_speed_buff', value: buff });
      }

      // 镜面回声 (A53)
      if (card.id === 'A53') {
        effects.push({ type: 'mirror_echo', msg: '本回合声系和光系攻击+10伤害' });
      }

      // 偏振过滤 (S13)
      if (card.id === 'S13') {
        // 对方下回合只能出攻击卡或辅助卡
        opponent.extraCost = 0; // 不影响费用，限制类型
        this.polarizeRestriction[oIdx] = card.effect.special.includes('攻击或辅助') ? 'restricted' : null;
        effects.push({ type: 'polarize', msg: '对方下回合只能出一种类型的卡' });
      }

      // 光谱叠加 (S15)
      if (card.id === 'S15') {
        const uniqueDomains = new Set();
        // 检查攻击方场上所有卡的领域
        for (const s of player.fieldSupports) {
          s.card.domain.forEach(d => uniqueDomains.add(d));
        }
        if (player.fieldDomain?.card?.domain) {
          player.fieldDomain.card.domain.forEach(d => uniqueDomains.add(d));
        }
        this.spectrumBonus[playerIdx] = uniqueDomains.size * 10;
        effects.push({ type: 'spectrum', bonus: this.spectrumBonus[playerIdx] });
      }

      // 镜面迷宫 (S34)
      if (card.id === 'S34') {
        this.mirrorMaze[oIdx] = 3;
        effects.push({ type: 'mirror_maze', msg: '对方3次出牌有35%概率失败' });
      }

      // 影子束缚 (S35)
      if (card.id === 'S35') {
        if (opponent.fieldSupports.length > 0 || opponent.fieldSummons.length > 0 || opponent.fieldDomain) {
          this.shadowBindTurns[oIdx] = 2;
          effects.push({ type: 'shadow_bind', msg: '对方下2回合不能出辅助卡' });
        }
      }

      // 短路开关 (S27)
      if (card.id === 'S27') {
        const elecIdx = player.fieldSupports.findIndex(s => s.card.domain.includes('电'));
        if (elecIdx !== -1) {
          player.fieldSupports.splice(elecIdx, 1);
          this.shortCircuitActive[playerIdx] = true;
          effects.push({ type: 'short_circuit', msg: '牺牲电辅助卡，本回合电攻+20' });
        }
      }

      // 高压击穿 (S29)
      if (card.id === 'S29') {
        this.highVoltagePierce[playerIdx] = 3;
        effects.push({ type: 'high_voltage', msg: '电攻无视20点防御，持续3回合' });
      }

      // 多路放电 (S31)
      if (card.id === 'S31') {
        this.multiDischarge[playerIdx] = true;
        effects.push({ type: 'multi_discharge', msg: '本回合所有电攻费用-2' });
      }

      // 噪音干扰 (S07)
      if (card.id === 'S07') {
        opponent.extraCost = 5;
        effects.push({ type: 'noise', msg: '对方下回合每出卡+5费' });
      }

      // S06 查看手牌+清除负面
      if (card.id === 'S06') {
        effects.push({ type: 'view_hand', count: 2, player: oIdx });
        // 清除己方1种负面状态
        const p = this.players[playerIdx];
        if (p.burnLayers > 0) p.burnLayers = Math.max(0, p.burnLayers - 1);
        if (p.paralysis > 0) p.paralysis = Math.max(0, p.paralysis - 1);
        if (p.dotEffects.length > 0) p.dotEffects.shift();
        effects.push({ type: 'clear_debuff', msg: '清除了1种负面状态' });
      }

      // 噪声/干扰效果 (S06 回声消声)
      if (spec.includes('对方下回合') && spec.includes('恢复减半')) {
        opponent.spiritDebuff = Math.max(-10, opponent.spiritDebuff - Math.floor(SPIRIT_PER_TURN / 2));
        effects.push({ type: 'spirit_halve', msg: '对方下回合精神力恢复减半' });
      }

      // 下回合每出卡额外消耗
      if (spec.includes('每出卡') && spec.includes('费')) {
        const match = spec.match(/\+(\d+)/);
        if (match) {
          opponent.extraCost = parseInt(match[1]);
        }
      }

      // 抽卡效果 (S25静电吸附)
      if (card.effect.drawCards && card.id === 'S25') {
        // 需要先弃1张（由UI处理）
        effects.push({ type: 'need_discard', msg: '需先弃1张手牌' });
        this.drawCards(playerIdx, card.effect.drawCards);
        // 清除负面
        const p = this.players[playerIdx];
        if (p.burnLayers > 0) p.burnLayers = Math.max(0, p.burnLayers - 1);
        if (p.paralysis > 0) p.paralysis = Math.max(0, p.paralysis - 1);
        if (p.dotEffects.length > 0) p.dotEffects.shift();
        effects.push({ type: 'draw', count: card.effect.drawCards });
      }
    }
  }

  // ==========================================================
  // 状态效果处理
  // ==========================================================

  /** 附加灼烧层数 */
  applyBurn(targetIdx, layers) {
    this.players[targetIdx].burnLayers = Math.max(0, this.players[targetIdx].burnLayers + layers);
  }

  /** 附加麻痹 */
  applyParalysis(targetIdx, layers) {
    this.players[targetIdx].paralysis = Math.max(0, this.players[targetIdx].paralysis + layers);
  }

  /** 处理灼烧（回合开始时） */
  processBurn(playerIdx) {
    const player = this.players[playerIdx];
    if (player.burnLayers <= 0) return;

    // 比热护盾(S17)免疫
    if (player.burnImmune > 0) {
      player.burnImmune--;
      this._addLog(`[${playerIdx === 0 ? '玩家' : 'AI'}] 比热护盾免疫了灼烧伤害。`);
      // 灼烧层数依然递减
      player.burnLayers = Math.max(0, player.burnLayers - 1);
      return;
    }

    const burnDmg = player.burnEnhanced ? BURN_ENHANCED_DMG : BURN_BASE_DMG;
    const totalDmg = player.burnLayers * burnDmg;

    // 热领域(D04)加成：每层+3
    if (player.fieldDomain?.card?.id === 'D04') {
      const extraDmg = player.burnLayers * 3;
      player.hp = Math.max(0, player.hp - totalDmg - extraDmg);
    } else {
      player.hp = Math.max(0, player.hp - totalDmg);
    }

    this._addLog(`[灼烧] ${playerIdx === 0 ? '玩家' : 'AI'} 受到 ${player.burnLayers}层灼烧共 ${burnDmg * player.burnLayers} 点伤害。`);

    // 层数-1
    player.burnLayers = Math.max(0, player.burnLayers - 1);
  }

  /** 麻痹衰减（每回合-2，最低0） */
  processParalysis(playerIdx) {
    const player = this.players[playerIdx];
    const opponent = this.players[1 - playerIdx];
    if (player.paralysis > 0) {
      // 麻痹伤害：基础15点 + 电之领域额外25点（D05）
      let dmgPerLayer = PARALYSIS_BASE_DMG;
      if (opponent.fieldDomain && opponent.fieldDomain.card.id === 'D05') {
        dmgPerLayer += 25; // 电之领域额外25
      }
      const totalDmg = player.paralysis * dmgPerLayer;
      player.hp = Math.max(0, player.hp - totalDmg);
      this._addLog(`[麻痹] ${playerIdx === 0 ? '玩家' : 'AI'} 受到 ${totalDmg} 点麻痹伤害 (${player.paralysis}层×${dmgPerLayer})`);
      if (this.checkWinCondition()) return;
      // 衰减
      player.paralysis = Math.max(0, player.paralysis - PARALYSIS_DECAY);
    }
  }

  /** 处理DOT伤害 */
  processDOT(playerIdx) {
    const player = this.players[playerIdx];
    const toRemove = [];

    for (let i = 0; i < player.dotEffects.length; i++) {
      const dot = player.dotEffects[i];
      // A10次声震荡：DOT递增（含S09→A10 combo加成）
      let dmg = dot.dmg;
      if (dot.cardId === 'A10') {
        const increment = 13 + this._dotIncrementBoost[pIdx];  // S09→A10 combo +3
        dmg = dot.dmg + (dot.initialTurns - dot.turnsRemaining) * increment || dot.dmg;
      }
      player.hp = Math.max(0, player.hp - dmg);
      this._addLog(`[DOT] ${playerIdx === 0 ? '玩家' : 'AI'} 受到 ${dmg} 点持续伤害。`);

      dot.turnsRemaining--;
      if (dot.turnsRemaining <= 0) {
        toRemove.push(i);
      }
    }

    // 移除已结束的DOT
    for (let i = toRemove.length - 1; i >= 0; i--) {
      player.dotEffects.splice(toRemove[i], 1);
    }
  }

  /** 处理场上持续效果（回合递减） */
  processFieldEffects(playerIdx) {
    const player = this.players[playerIdx];

    // 领域卡回合递减
    if (player.fieldDomain) {
      player.fieldDomain.turnsRemaining--;
      if (player.fieldDomain.turnsRemaining <= 0) {
        this._addLog(`[${playerIdx === 0 ? '玩家' : 'AI'}] 领域卡「${player.fieldDomain.card.name}」效果结束。`);
        player.discardPile.push(player.fieldDomain.card);
        player.fieldDomain = null;
      }
    }

    // 驻场辅助卡回合递减
    const expiredSupports = [];
    for (let i = 0; i < player.fieldSupports.length; i++) {
      if (player.fieldSupports[i].turnsRemaining !== undefined) {
        player.fieldSupports[i].turnsRemaining--;
        if (player.fieldSupports[i].turnsRemaining <= 0) {
          expiredSupports.push(i);
        }
      }
    }
    for (let i = expiredSupports.length - 1; i >= 0; i--) {
      const removed = player.fieldSupports.splice(expiredSupports[i], 1)[0];
      // S19温度升高过期时清除双方burnEnhanced标记
      if (removed.card.id === 'S19') {
        this.players[0].burnEnhanced = false;
        this.players[1].burnEnhanced = false;
        this._addLog(`[系统] 灼烧增强效果结束，双方灼烧伤害恢复正常。`);
      }
      if (removed.card.effect.defense || removed.card.effect.buffDmg) {
        this._addLog(`[${playerIdx === 0 ? '玩家' : 'AI'}] 驻场卡「${removed.card.name}」效果结束。`);
      }
    }

    // 高压击穿(S29)回合递减
    if (this.highVoltagePierce[playerIdx] > 0) {
      this.highVoltagePierce[playerIdx]--;
    }
  }

  /** 驻场卡回合递减（两个玩家都处理） */
  _tickFieldCards(playerIdx) {
    this.processFieldEffects(playerIdx);
  }

  // ==========================================================
  // 组合检测
  // ==========================================================

  /**
   * 检测组合触发 —— 查询 COMBO_TABLE 查找表
   * @param {object} cardPlayed - 本回合打出的卡（对象）
   * @param {string[]} cardsThisTurn - 本回合已打出的卡牌ID（含刚打出的）
   * @param {number} playerIdx - 出牌方索引（用于查 cardForms）
   * @returns {object|null} combo 效果对象或 null
   */
  checkCombo(cardPlayed, cardsThisTurn, playerIdx) {
    const player = this.players[playerIdx];

    // 遍历此前打出的卡（不包括刚打出的最后一张）
    const prevCards = cardsThisTurn.slice(0, -1);

    for (const prevCardId of prevCards) {
      // 构建键：如果有形态信息则追加（如 "S08升"）
      const form = player.cardForms[prevCardId];
      let prevKey = prevCardId;
      if (form) {
        prevKey = `${prevCardId}${form === 'up' ? '升' : '降'}`;
      }

      // 1. 标准方向：前卡→当前卡（方向敏感）
      const standardKey = `${prevKey}→${cardPlayed.id}`;
      if (COMBO_TABLE[standardKey]) {
        return COMBO_TABLE[standardKey];
      }

      // 2. 双向对冲：A↔B 或 B↔A（方向不敏感）
      const bidirKey1 = `${prevKey}↔${cardPlayed.id}`;
      const bidirKey2 = `${cardPlayed.id}↔${prevKey}`;
      if (COMBO_TABLE[bidirKey1]) {
        return COMBO_TABLE[bidirKey1];
      }
      if (COMBO_TABLE[bidirKey2]) {
        return COMBO_TABLE[bidirKey2];
      }

      // 3. 对抗：AvsB 或 BvsA（方向不敏感）
      const vsKey1 = `${prevKey}vs${cardPlayed.id}`;
      const vsKey2 = `${cardPlayed.id}vs${prevKey}`;
      if (COMBO_TABLE[vsKey1]) {
        return COMBO_TABLE[vsKey1];
      }
      if (COMBO_TABLE[vsKey2]) {
        return COMBO_TABLE[vsKey2];
      }
    }

    return null;
  }

  // ==========================================================
  // 特殊机制
  // ==========================================================

  /** 串联增压：场上电辅助数×15 */
  seriesBoost(playerIdx) {
    const player = this.players[playerIdx];
    const electricCount = player.fieldSupports.filter(s => s.card.domain.includes('电')).length;
    return electricCount * 15;
  }

  /** 光副晨曦：每回合首个光攻+10%伤害 */
  lightSubFirstCard(playerIdx, card) {
    if (this.players[playerIdx].isLightSub && card.domain.includes('光') && card.type === 'attack') {
      // 检查是否为本回合首个光攻
      const lightAttacks = this.cardsThisTurn.filter(id => {
        const c = this.getCardById(id);
        return c && c.domain.includes('光') && c.type === 'attack';
      });
      if (lightAttacks.length === 0) {
        return 0.10; // 10%伤害加成
      }
    }
    return 0;
  }

  /** 检查是否可在对方回合出牌（光速传播） */
  canPlayInOpponentTurn(playerIdx, card) {
    return this.lightSpeedActive[playerIdx] && card.domain.includes('光');
  }

  /** 对方回合出牌 */
  playInOpponentTurn(playerIdx, cardId, target) {
    if (!this.canPlayInOpponentTurn(playerIdx, this.getCardById(cardId))) {
      return { success: false, msg: '光速传播未激活或非光系卡。', effects: [] };
    }
    // 光速传播出牌费用+3
    const card = this.getCardById(cardId);
    if (!card) return { success: false, msg: '卡牌不存在。', effects: [] };

    const player = this.players[playerIdx];
    const extraCost = 3;
    if (player.spirit < card.cost + extraCost) {
      return { success: false, msg: '精神力不足。', effects: [] };
    }

    // 临时增加费用
    player.extraCost += extraCost;
    const result = this.playCard(playerIdx, cardId, target);
    player.extraCost = Math.max(0, player.extraCost - extraCost);
    return result;
  }

  // ==========================================================
  // 召唤物操作
  // ==========================================================

  /** 检查同名召唤物 */
  summonExists(playerIdx, cardId) {
    return this.players[playerIdx].fieldSummons.some(s => s.card.id === cardId);
  }

  /** 场上召唤物数量 */
  getSummonCount(playerIdx) {
    return this.players[playerIdx].fieldSummons.length;
  }

  /** 攻击召唤物 */
  _attackSummon(defender, summonIdx, damage) {
    const effects = [];
    if (summonIdx >= 0 && summonIdx < defender.fieldSummons.length) {
      defender.fieldSummons[summonIdx].hp -= damage;
      effects.push({
        type: 'summon_damage',
        value: damage,
        remainingHp: defender.fieldSummons[summonIdx].hp
      });

      if (defender.fieldSummons[summonIdx].hp <= 0) {
        const removed = defender.fieldSummons.splice(summonIdx, 1)[0];
        defender.discardPile.push(removed.card);
        effects.push({ type: 'summon_destroyed', name: removed.card.name });
        this._addLog(`[召唤物] 「${removed.card.name}」被消灭。`);
      }
    }
    return effects;
  }

  /** 移除召唤物 */
  removeSummon(playerIdx, summonIdx) {
    const player = this.players[playerIdx];
    if (summonIdx >= 0 && summonIdx < player.fieldSummons.length) {
      const removed = player.fieldSummons.splice(summonIdx, 1)[0];
      player.discardPile.push(removed.card);
    }
  }

  // ==========================================================
  // 驻场卡操作
  // ==========================================================

  /** 是否为驻场卡 */
  isFieldCard(card) {
    // 防御效果卡、持续buff卡、domain卡视为驻场
    if (card.type === 'domain') return true;
    if (card.type === 'summon') return true;
    if (card.effect?.defense) return true;
    // 持续buff卡
    if (card.effect?.buffDmg && !card.effect?.drawCards) return true;
    // 声场效果卡（特殊标记）
    if (card.effect?.special?.includes('驻场')) return true;
    return false;
  }

  /** 消灭驻场卡 */
  destroyFieldCard(playerIdx, cardIndex) {
    const player = this.players[playerIdx];
    const removed = player.fieldSupports.splice(cardIndex, 1)[0];
    if (removed) {
      player.discardPile.push(removed.card);
      this._addLog(`[消灭] 驻场卡「${removed.card.name}」被消灭。`);
      return true;
    }
    return false;
  }

  /** 弹回驻场卡至手牌 */
  bounceFieldCard(playerIdx, cardIndex) {
    const player = this.players[playerIdx];
    const bounced = player.fieldSupports.splice(cardIndex, 1)[0];
    if (bounced) {
      player.hand.push(bounced.card);
      this._addLog(`[弹回] 驻场卡「${bounced.card.name}」弹回手牌。`);
      return true;
    }
    return false;
  }

  // ==========================================================
  // 工具方法
  // ==========================================================

  /** 根据ID查找卡牌 */
  getCardById(id) {
    return CARDS.find(c => c.id === id) || null;
  }

  /** 检查精神力是否足够 */
  canAfford(playerIdx, card) {
    const player = this.players[playerIdx];
    let cost = card.cost + player.extraCost + player.paralysis * PARALYSIS_COST;

    // 多路放电(S31)电攻减费
    if (this.multiDischarge[playerIdx] && card.domain.includes('电') && card.type === 'attack') {
      cost -= 2;
    }

    // 召唤物减费
    for (const s of player.fieldSummons) {
      if (s.card.effect.costReduction) {
        // 检查是否适用
        if (s.card.id === 'C07') {
          // 欧姆：电系卡费用-6
          if (card.domain.includes('电')) cost -= 6;
        } else if (s.card.id === 'C06') {
          // 阿基米德：辅助卡-4，力系辅助额外-2
          if (card.type === 'support') {
            cost -= 4;
            if (card.domain.includes('力')) cost -= 2;
          }
        }
      }
    }

    // 光速传播在对方回合出牌费用+3（通过playInOpponentTurn的extraCost实现，此处不再重复计算）
    // 注意: canAfford中不再额外+3，避免与playInOpponentTurn的extraCost重复

    return player.spirit >= cost;
  }

  /** 检查是否可打出 */
  canPlay(playerIdx, card) {
    const player = this.players[playerIdx];
    const opponent = this.players[1 - playerIdx];

    // 回合封锁
    if (player.turnBlocked && playerIdx === this.currentPlayer) {
      return { can: false, reason: '本回合被凝固封锁，无法出牌。' };
    }

    // 影子束缚
    if (this.shadowBindTurns[playerIdx] > 0 && card.type === 'support') {
      return { can: false, reason: '被影子束缚，无法出辅助卡。' };
    }

    // 镜面迷宫失败概率（S13→C03 combo可提升概率）
    const mazeProb = Math.max(0.35, this._mirrorMazeBoost[1 - playerIdx] || 0.35);
    if (this.mirrorMaze[playerIdx] > 0 && Math.random() < mazeProb) {
      const refund = Math.floor(card.cost * 0.5);
      player.spirit = Math.min(MAX_SPIRIT, player.spirit + refund);
      this.mirrorMaze[playerIdx]--;
      return { can: false, reason: `镜面迷宫：出牌失败，返还${refund}精神力。` };
    }

    // 光领域棱镜界(D03)失败概率
    const oppDomain = opponent.fieldDomain;
    if (oppDomain?.card?.id === 'D03' && oppDomain.card.effect.failRate) {
      if (Math.random() * 100 < oppDomain.card.effect.failRate) {
        return { can: false, reason: '棱镜界：出牌有20%概率失效。' };
      }
    }

    // 偏振过滤(S13)
    if (this.polarizeRestriction[playerIdx] && playerIdx === this.currentPlayer) {
      // 只允许一种类型
      if (this.cardsThisTurn.length > 0) {
        const firstType = this.getCardById(this.cardsThisTurn[0])?.type;
        if (firstType && card.type !== firstType) {
          return { can: false, reason: '偏振过滤：本回合只能出一种类型的卡。' };
        }
      }
    }

    // 精神力检查
    if (!this.canAfford(playerIdx, card)) {
      return { can: false, reason: '精神力不足。' };
    }

    // 相变卡特殊条件
    if (card.type === 'phase') {
      if (card.id === 'T02') {
        const hpPercent = player.hp / MAX_HP;
        if (hpPercent >= 0.3) {
          return { can: false, reason: 'HP需低于30%才能打出临界突破。' };
        }
      }
    }

    // A26凝固封锁：需要2层灼烧
    if (card.id === 'A26' && playerIdx === this.currentPlayer) {
      if (opponent.burnLayers < 2) {
        return { can: false, reason: '对方灼烧层数不足2层，无法发动凝固封锁。' };
      }
    }

    // S18/S20：消耗灼烧的辅助卡
    if ((card.id === 'S18' || card.id === 'S20') && player.burnLayers < 2) {
      return { can: false, reason: '自身灼烧层数不足2层。' };
    }

    return { can: true, reason: '' };
  }

  /** 获取有效攻击目标 */
  getValidTargets(playerIdx) {
    const opponent = this.players[1 - playerIdx];
    const targets = [{ type: 'player', label: '对方玩家', id: 'player' }];

    opponent.fieldSummons.forEach((s, i) => {
      targets.push({
        type: 'summon',
        label: s.card.name,
        id: `summon_${i}`,
        hp: s.hp
      });
    });

    return targets;
  }

  /** 获取完整游戏状态 */
  getGameState() {
    return {
      players: this.players.map(p => ({
        hp: p.hp,
        maxHp: p.maxHp,
        spirit: p.spirit,
        hand: p.hand.map(c => ({ id: c.id, name: c.name, type: c.type, domain: c.domain, cost: c.cost, description: c.description, effect: c.effect })),
        handSize: p.hand.length,
        deckSize: p.deck.length,
        discardSize: p.discardPile.length,
        fieldSummons: p.fieldSummons.map(s => ({ name: s.card.name, hp: s.hp, maxHp: s.card.effect?.hp || 300, id: s.card.id, domain: s.card.domain })),
        fieldDomain: p.fieldDomain ? { name: p.fieldDomain.card.name, turns: p.fieldDomain.turnsRemaining, domain: p.fieldDomain.card.domain } : null,
        fieldSupports: p.fieldSupports.map(s => ({ name: s.card.name, turns: s.turnsRemaining, id: s.card.id, domain: s.card.domain })),
        burnLayers: p.burnLayers,
        paralysis: p.paralysis,
        dotEffects: p.dotEffects.map(d => ({ dmg: d.dmg, turns: d.turnsRemaining })),
        domain: p.domain,
        turnBlocked: p.turnBlocked,
        extraCost: p.extraCost
      })),
      currentPlayer: this.currentPlayer,
      turnNumber: this.turnNumber,
      phase: this.phase,
      quizResult: this.quizResult,
      gameOver: this.gameOver,
      winner: this.winner
    };
  }

  /** 检查胜利条件 */
  checkWinCondition() {
    if (this.gameOver) return true;

    if (this.players[0].hp <= 0) {
      this.gameOver = true;
      this.winner = 1;
      this._addLog('玩家HP归零，AI获胜！');
      return true;
    }
    if (this.players[1].hp <= 0) {
      this.gameOver = true;
      this.winner = 0;
      this._addLog('AI的HP归零，玩家获胜！');
      return true;
    }
    return false;
  }

  /** 是否游戏结束 */
  isGameOver() {
    return this.gameOver;
  }

  /** 获取可打出的卡牌列表 */
  getAvailableCards(playerIdx) {
    const player = this.players[playerIdx];
    return player.hand.filter(card => {
      // 只能查看自己的手牌
      return true;
    });
  }

  /** 获取当前玩家可打出的卡牌（含可行性检查） */
  getPlayableCards(playerIdx) {
    const player = this.players[playerIdx];
    return player.hand.map(card => ({
      ...card,
      canPlay: this.canPlay(playerIdx, card).can,
      affordable: this.canAfford(playerIdx, card),
      canPlayReason: this.canPlay(playerIdx, card).reason
    }));
  }

  /** 洗牌 */
  shuffleDeck(deck) {
    const arr = [...deck];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // ==========================================================
  // 内部辅助方法
  // ==========================================================

  /** 记录战斗日志 */
  _addLog(msg) {
    this.log.push({ msg, turn: this.turnNumber });
  }

  /** 不计算防御的原始伤害（无视防御效果使用） */
  _calcRawDamage(card, attackerIdx, defenderIdx) {
    const attacker = this.players[attackerIdx];
    const defender = this.players[defenderIdx];
    let damage = card.effect.dmg || 0;

    // 领域加成
    if (attacker.fieldDomain) {
      const dCard = attacker.fieldDomain.card;
      if (dCard.effect.bonusDmg && card.domain.some(d => dCard.domain.includes(d))) {
        damage += dCard.effect.bonusDmg;
      }
    }

    // 召唤物加成
    for (const s of attacker.fieldSummons) {
      if (s.card.effect.dmgBonus) {
        damage += s.card.effect.dmgBonus;
      }
    }

    // 串联增压
    if (card.domain.includes('电')) {
      const electricCount = attacker.fieldSupports.filter(s => s.card.domain.includes('电')).length;
      damage += electricCount * 15;
    }

    // 条件加成
    if (card.effect.conditional) {
      const cond = card.effect.conditional;
      if (cond.condition.includes('己方辅助卡')) {
        damage += attacker.fieldSupports.length * (cond.bonusDmg || 0);
      }
      if (cond.condition.includes('灼烧')) {
        damage += defender.burnLayers * (cond.bonusDmg || 0);
      }
      if (cond.condition.includes('对方场上每张卡')) {
        const df = defender.fieldSummons.length + (defender.fieldDomain ? 1 : 0) + defender.fieldSupports.length;
        damage += df * (cond.bonusDmg || 0);
      }
      if (cond.condition.includes('己方有') && cond.condition.includes('领域')) {
        if (attacker.fieldDomain) damage += cond.bonusDmg || 0;
      }
      if (cond.condition.includes('电辅助')) {
        const ec = attacker.fieldSupports.filter(s => s.card.domain.includes('电')).length;
        const m = cond.condition.match(/≥(\d+)/);
        if (ec >= (m ? parseInt(m[1]) : 1)) damage += cond.bonusDmg || 0;
      }
    }

    // 答题增益
    damage = Math.floor(damage * (1 + (this.quizResult.bonus || 0)));
    return Math.floor(damage);
  }

  /** 检查是否为本回合首次攻击 */
  _isFirstAtkThisTurn(attackerIdx) {
    // 简化：使用mirageFirstAtk标记
    const atksThisTurn = this.cardsThisTurn.filter(id => {
      const c = this.getCardById(id);
      return c && c.type === 'attack';
    });
    return atksThisTurn.length <= 1;
  }
}

// ============================================================
// 导出
// ============================================================
export { GameEngine };
