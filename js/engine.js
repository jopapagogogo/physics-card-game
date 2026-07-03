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
const MAX_HAND_SIZE = 7;
const DRAW_PER_TURN = 3;
const INITIAL_DRAW = 5;
const SPIRIT_PER_TURN = 10;
const MAX_SUMMONS = 2;
const BURN_BASE_DMG = 30;       // 灼烧每层基础伤害
const BURN_ENHANCED_DMG = 36;   // 温度升高(S24)后每层伤害
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
    this.mirageFirstAtk = [false, false];    // 本回合首次攻击已触发（海市蜃楼用）
    this._zenoFirstAtk = [false, false];     // 本回合首次攻击已触发（芝诺龟用）

    // 镜面迷宫 (S19)
    this.mirrorMaze = [0, 0];               // 剩余出牌次数

    // 影子束缚 (S20)
    this.shadowBindTurns = [0, 0];           // 剩余回合数

    // 声系下次增伤 (A51声速激增)
    this.soundSpeedBuff = [0, 0];
    // 镜面回声本回合声/光加成 (A53)
    this.mirrorEchoBonus = [0, 0];

    // 偏振过滤 (S15)
    this.polarizeRestriction = [null, null];

    // 光谱叠加 (S17) 累计伤害加成
    this.spectrumBonus = [0, 0];

    // 短路开关 (S30)
    this.shortCircuitActive = [false, false];

    // 高压击穿 (S31)
    this.highVoltagePierce = [0, 0];          // 剩余回合数

    // 多路放电 (S33) 减费效果
    this.multiDischarge = [false, false];

    // 上回合攻击记录（用于A02惯性冲锋和A05蓄力等）
    this.lastTurnDamage = [0, 0];             // 上回合造成的总伤害
    this.lastTurnOwnAtks = [{}, {}];          // 上回合打出的攻击卡 { domain: count }

    // 光速传播 (S16) 激活状态
    this.lightSpeedActive = [false, false];
    this.lightSpeedTurns = [0, 0];

    // 凝固封锁 (A26) 触发状态 — 通过 player.turnBlocked 处理

    // S07回声消声：查看手牌标记
    this.viewedOpponentHand = [false, false];

    // A02惯性冲锋：本回合的力系伤害（用于下回合延续）
    this.forceDamageThisTurn = [0, 0];

    // A05重力势能：对手累计造成伤害追踪
    this._a05DmgReceived = [0, 0];

    // C04 薛定谔的猫：C03↔C04 combo 玩家选择标记
    this._c04PlayerChoose = false;

    // A10次声震荡DOT递增基准
    this.a10DotBaseTurns = [null, null];

    // Combo 临时状态
    this._a49NoDestroy = false;                // S33→A49 不摧毁辅助卡
    this._pendingBurnAfterExplode = [0, 0];    // S26→A54 引爆后额外灼烧
    this._heightBonusPerLevel = [0, 0];        // S01→A05 每层高度额外伤害
    this._dotIncrementBoost = [0, 0];          // S08→A10 DOT递增加成
    this._mirrorMazeBoost = [0, 0];            // S15→S19 镜面迷宫概率加成
    this._burnCapIncrease = [0, 0];            // S14→A55 灼烧上限提升
    this._burnDmgPerLayer = [50, 50];          // S24→A54 爆燃每层伤害（默认50，对齐cards.js）
    this._ignoreDefBonus = [0, 0];             // S33→A49 无视防御额外伤害

    // ========== P2 新增效果 ==========
    // A11 啸叫声压
    this.soundPressure = [0, 0];               // 每个玩家的声压层数
    // S01/S02/S03/S12 下次攻击加成
    this.nextBonus = [{}, {}];                 // { force, sound, any, antiBarrier }
    // S05 力的合成本回合力攻击计数
    this._forceStackCount = [0, 0];
    // S06 弹性储能
    this.energyStore = [{ stored: 0 }, { stored: 0 }];
    // S09 频率调节—本回合全体声波加成
    this._turnAllSoundBonus = [0, 0];
    // S14 滤光领域 + 减费
    this._filterDomain = [null, null];         // 选定的领域
    this._filterDomainReduction = [0, 0];      // 减费量
    // S21 凸透成像—对手上回合打出的最后一张卡
    this._lastTurnCard = [null, null];         // 对手上回合最后打出的卡 {card, damage(dealt)}
    this._pendingConvexLens = null;            // S21凸透成像待选择
    this._pendingFrequencyChoice = false;      // S09频率调节待选择
    // S32 低压启动—目标电系卡引用
    this._reduceElectricTarget = [{ cardRef: null, costReduction: 0 }, { cardRef: null, costReduction: 0 }];

    // P2: 知识减费/加费 — 答题结果影响出牌费用
    this.quizCostReduction = [0, 0];    // 知识减费剩余次数
    this.quizCostPenalty = [0, 0];      // 知识惩罚（答错惩罚费用）

    // 初始化：洗牌库，抽初始手牌
    for (let i = 0; i < 2; i++) {
      this.players[i].deck = this.shuffleDeck([...this.players[i].deck]);
      this.drawCards(i, INITIAL_DRAW);
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
      burnEnhanced: false,     // S24温度升高
      burnImmune: 0,           // S22比热护盾剩余回合
      paralysis: 0,
      dotEffects: [],          // [{dmg, turnsRemaining, cardId}]
      spiritDebuff: 0,         // 精神力恢复减益值（负数或0）
      turnBlocked: false,      // 下回合是否被封锁
      extraCost: 0,            // 下回合每卡额外费用
      totalForceDmg: 0,        // 上回合力系伤害累计
      domain: { main: mainDomain, sub: subDomain },
      isLightSub: subDomain === '光',
      cardForms: {}            // 卡牌形态跟踪，如 { S09: 'up' }
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

    // 光速传播(S16)精神力恢复
    if (this.lightSpeedActive[pIdx]) {
      player.spirit = Math.min(MAX_SPIRIT, player.spirit + 10);
      this.lightSpeedTurns[pIdx]--;
      if (this.lightSpeedTurns[pIdx] <= 0) {
        this.lightSpeedActive[pIdx] = false;
        this._addLog(`[${pIdx === 0 ? '玩家' : 'AI'}] 光速传播效果结束。`);
      }
    }

    // 电磁感应(S28)精神力
    const emInduction = player.fieldSupports.find(s => s.card.id === 'S28');
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
    this._burnDmgPerLayer[pIdx] = 50;
    this._ignoreDefBonus[pIdx] = 0;
    this.spectrumBonus[pIdx] = 0;
    this._inertiaNextTurn = {};             // A02惯性冲锋标记重置
    this.quizResult = { correct: 0, total: 3, bonus: 0 };
    player.extraCost = 0;
    this.quizCostReduction[pIdx] = 0;
    this.quizCostPenalty[pIdx] = 0;

    // 重置偏转首次攻击标记
    this.mirageFirstAtk[pIdx] = false;
    this._zenoFirstAtk[pIdx] = false;
    this._c04PlayerChoose = false;  // 薛定谔猫标记回合重置

    // 重置短路开关
    this.shortCircuitActive[pIdx] = false;

    // 重置多路放电
    this.multiDischarge[pIdx] = false;

    // 清除偏振限制
    this.polarizeRestriction[pIdx] = null;

    // P2: 重置每回合效果
    this._forceStackCount[pIdx] = 0;
    this._turnAllSoundBonus[pIdx] = 0;
    this._filterDomain[pIdx] = null;
    this._filterDomainReduction[pIdx] = 0;
    this._reduceElectricTarget[pIdx] = { cardRef: null, costReduction: 0 };
    this.mirrorEchoBonus[pIdx] = 0;

    // A11 啸叫：每回合声压叠加
    const a11OnField = player.fieldSupports.find(s => s.card?.id === 'A11');
    if (a11OnField) {
      const applyPerTurn = a11OnField.card.effect.applyPerTurn || 1;
      const maxStacks = a11OnField.card.effect.maxStacks || 3;
      this.soundPressure[oIdx] = Math.min(maxStacks, this.soundPressure[oIdx] + applyPerTurn);
      this._addLog(`[啸叫] 声压叠加至 ${this.soundPressure[oIdx]} 层。`);
      // 检查是否引爆
      if (this.soundPressure[oIdx] >= maxStacks) {
        const detonateDmg = a11OnField.card.effect.detonateDmg || 60;
        opponent.hp = Math.max(0, opponent.hp - detonateDmg);
        this._addLog(`[啸叫引爆] 声压达到 ${maxStacks} 层，造成 ${detonateDmg} 点伤害！`);
        this.soundPressure[oIdx] = 0;
        // 移除 A11
        const a11Idx = player.fieldSupports.indexOf(a11OnField);
        if (a11Idx !== -1) {
          player.fieldSupports.splice(a11Idx, 1);
          player.discardPile.push(a11OnField.card);
        }
        if (this.checkWinCondition()) return;
      }
    }

    // C03 拉普拉斯妖/S13多普勒探测：每回合窥牌数据
    this._pendingScry = null;  // 清除上一回合的窥牌数据（最后出牌优先）
    this._scryHandled = false; // 本回合已处理过窥牌
    const c03 = player.fieldSummons.find(s => s.card.id === 'C03');
    if (c03 && opponent.deck.length > 0) {
      const scryCount = Math.min(c03.card.effect.scryOpponent || 5, opponent.deck.length);
      const topCards = opponent.deck.slice(-scryCount).reverse();
      const cardNames = topCards.map(c => c.name).join('、');
      this._addLog(`[拉普拉斯妖] 预览对方牌库顶 ${scryCount} 张：${cardNames}`);
      // 保存窥牌数据，供UI交互使用
      this._pendingScry = {
        targetPlayerIdx: oIdx,
        cards: topCards.map(c => ({ id: c.id, name: c.name, domain: c.domain, type: c.type, dmg: c.effect?.dmg || 0 })),
        count: scryCount
      };
    }

    // C10 贝尔：每回合查看对方1张手牌
    const c10 = player.fieldSummons.find(s => s.card.id === 'C10');
    if (c10 && opponent.hand.length > 0) {
      const rIdx = Math.floor(Math.random() * opponent.hand.length);
      this._addLog(`[贝尔] 查看到对方手牌「${opponent.hand[rIdx].name}」。`);
    }

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
    const a05Card = player.fieldSupports.find(f => f.card?.id === 'A05');
    const triggerThreshold = a05Card?.card?.effect?.triggerThreshold || 200;
    const shouldTrigger = this.hightAtkTrack[pIdx] >= 4 ||
        (this._a05DmgReceived[pIdx] >= triggerThreshold);
    if (shouldTrigger) {
      const reason = this._a05DmgReceived[pIdx] >= triggerThreshold ?
        `敌方累计伤害达标(${this._a05DmgReceived[pIdx]}≥${triggerThreshold})` : '蓄满4回合';
      const bonus = this.hightBonus[pIdx] + 1;
      const perHeightDmg = 40 + this._heightBonusPerLevel[pIdx];  // S01→A05 combo加成
      const dmg = 40 + bonus * perHeightDmg;
      opponent.hp = Math.max(0, opponent.hp - dmg);
      this._addLog(`[重力势能] ${reason}触发！造成 ${dmg} 点伤害（高度=${bonus}, 每层=${perHeightDmg}）。`);
      this.hightAtkTrack[pIdx] = 0;
      this.hightBonus[pIdx] = 0;
      this._a05DmgReceived[pIdx] = 0;
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
      if (!card) break; // deck still empty after reshuffle, stop drawing
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

    // 知识减费/加费：答对减费，答错加费
    const wrongCount = total - correct;
    this.quizCostReduction[this.currentPlayer] = correct;    // 答对N题=N次减费
    this.quizCostPenalty[this.currentPlayer] = wrongCount;   // 答错N题=每卡+N费
    if (correct > 0 || wrongCount > 0) {
      this._addLog(`[知识之力] 答题结果影响出牌费用：减费${correct}次 加费+${wrongCount}。`);
    }

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
        let isDamage;
        if (this._c04PlayerChoose) {
          // C03↔C04 combo: 智能选择——HP<50%时治疗，否则伤害
          const hpRatio = player.hp / MAX_HP;
          isDamage = hpRatio >= 0.5;
          this._addLog(`[薛定谔的猫·可控] 玩家选择: ${isDamage ? '造成伤害' : '恢复HP'}。`);
        } else {
          isDamage = Math.random() < 0.5;
        }
        if (isDamage) {
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
        this._c04PlayerChoose = false; // 重置标记
      }
    }

    // 处理精神力恢复减益递减
    const opp = this.players[1 - this.currentPlayer];
    if (opp.spiritDebuff < 0) {
      opp.spiritDebuff = Math.min(0, opp.spiritDebuff + 1);
    }

    // 处理海市蜃楼(A50)回合
    if (this.mirageTurns[this.currentPlayer] > 0) {
      this.mirageTurns[this.currentPlayer]--;
    }

    // 处理镜面迷宫(S19)
    // 处理影子束缚(S20)
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
      // 自动随机弃牌兜底：手牌超上限但无指定索引
      const over = player.hand.length - MAX_HAND_SIZE;
      const shuffled = [...Array(player.hand.length).keys()].sort(() => Math.random() - 0.5);
      discardIndices = shuffled.slice(0, over);
      this._addLog(`[${this.currentPlayer === 0 ? '玩家' : 'AI'}] 手牌超上限，自动随机弃 ${over} 张。`);
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
    // 兜底：确保不会超过上限
    while (player.hand.length > MAX_HAND_SIZE) {
      const card = player.hand.pop();
      player.discardPile.push(card);
      this._addLog(`[${this.currentPlayer === 0 ? '玩家' : 'AI'}] 兜底弃置「${card.name}」。`);
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

    // P2: S21 凸透成像 — 保存当前玩家最后打出的攻击/辅助卡供对手使用
    const lastAttackOrSupport = [...this.cardsThisTurn].reverse().find(cid => {
      const c = this.getCardById(cid);
      return c && (c.type === 'attack' || c.type === 'support');
    });
    if (lastAttackOrSupport) {
      const c = this.getCardById(lastAttackOrSupport);
      this._lastTurnCard[1 - this.currentPlayer] = {
        card: c,
        damage: c.effect?.dmg || 0
      };
    }

    // 切换回合
    this.currentPlayer = 1 - this.currentPlayer;
    this.turnNumber++;
    // 注意：不在此处调用 startTurn()，由调用方（UI层）在合适的时机显式调用
    // 避免 processFieldEffects 双重递减领域卡回合
  }

  /** scry：重新排序指定玩家牌库顶部（C03窥对手/S13自窥） */
  scryReorderTarget(cardIds) {
    if (!this._pendingScry) return false;
    const { targetPlayerIdx, count } = this._pendingScry;
    const target = this.players[targetPlayerIdx];
    if (!target || target.deck.length < count) return false;
    if (!Array.isArray(cardIds) || cardIds.length !== count) return false;
    const removed = target.deck.splice(-count, count);
    const newCards = cardIds.map(id => {
      const idx = removed.findIndex(c => c.id === id);
      return idx === -1 ? null : removed[idx];
    });
    if (newCards.includes(null)) {
      target.deck.push(...removed);
      return false;
    }
    target.deck.push(...newCards.reverse());
    this._addLog(`[窥牌] 已重新排列牌库顶部 ${count} 张。`);
    this._pendingScry = null;
    return true;
  }

  /** S21凸透成像：应用玩家选择 */
  convexLensApply(choice) {
    if (!this._pendingConvexLens) return null;
    const { lastCard, lensEff } = this._pendingConvexLens;
    this._pendingConvexLens = null;
    const player = this.players[0];
    const opponent = this.players[1];
    if (choice === 'real' && lastCard.damage) {
      const heal = Math.floor(lastCard.damage * (lensEff.realImage?.restoreHp || 1.5));
      const actual = Math.min(MAX_HP - player.hp, heal);
      player.hp += actual;
      return { type: 'convex_real', heal: actual };
    } else if (choice === 'virtual' && lastCard.card) {
      const extraCost = Math.ceil((lastCard.card.cost || 0) * (lensEff.virtualImage?.extraCost || 0.5));
      player.spirit = Math.max(0, player.spirit - extraCost);
      const copyDmg = Math.floor((lastCard.damage || 0) * (lensEff.virtualImage?.copyEffect || 1.2));
      if (copyDmg > 0) opponent.hp = Math.max(0, opponent.hp - copyDmg);
      return { type: 'convex_virtual', dmg: copyDmg, extraCost, cardName: lastCard.card.name };
    }
    return null;
  }

  /** S09频率调节：应用玩家选择 */
  frequencyApply(choice) {
    if (!this._pendingFrequencyChoice) return null;
    this._pendingFrequencyChoice = false;
    const player = this.players[0];
    const opponent = this.players[1];
    if (choice === 'high') {
      player.cardForms['S09'] = 'up';
      this.nextBonus[0].sound = (this.nextBonus[0].sound || 0) + 20;
      return { type: 'set_frequency_form', form: 'up', msg: '升高：下张声系+20' };
    } else {
      player.cardForms['S09'] = 'down';
      this._turnAllSoundBonus[0] += 5;
      for (const dot of opponent.dotEffects) {
        if (dot.cardId === 'A10') dot.turnsRemaining += 2;
      }
      return { type: 'set_frequency_form', form: 'down', msg: '降低：全体声系+5' };
    }
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
  calculateDamage(card, attackerIdx, defenderIdx, comboBonus = 0, skipDefense = false) {
    const attacker = this.players[attackerIdx];
    const defender = this.players[defenderIdx];
    let damage = card.effect.dmg || 0;

    // 1. 领域加成（固定值）
    // D01 力之领域：力系攻击+25
    if (attacker.fieldDomain) {
      const dCard = attacker.fieldDomain.card;
      const dmgBonus = dCard.effect.bonusDmg || dCard.effect.forceDmgBonus;
      if (dmgBonus && card.domain.some(d => dCard.domain.includes(d))) {
        damage += dmgBonus;
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
      // 领域特定伤害加成
      const bonusKeys = {力:'forceDmgBonus',热:'heatDmgBonus',光:'lightDmgBonus',声:'soundDmgBonus',电:'electricDmgBonus'};
      for (const [domain, key] of Object.entries(bonusKeys)) {
        if (s.card.effect[key] && card.domain.includes(domain)) {
          damage += s.card.effect[key];
        }
      }
      // 牛顿(C05) forceDmgBonus 已通过 bonusKeys 统一处理
      // C09 伽利略: 每张己方辅助卡光系+3
      if (s.card.id === 'C09' && s.card.effect.perSupportLightBonus && card.domain.includes('光')) {
        damage += attacker.fieldSupports.length * s.card.effect.perSupportLightBonus;
      }
      // C14 安培: 每层麻痹电系+2
      if (s.card.id === 'C14' && s.card.effect.perParalysisBonus && card.domain.includes('电')) {
        damage += (defender.paralysis || 0) * s.card.effect.perParalysisBonus;
      }
    }

    // 3. 串联增压（电被动：场上电辅助数×15）
    if (card.domain.includes('电') || attacker.fieldDomain?.card?.domain?.includes('电')) {
      const electricSupports = attacker.fieldSupports.filter(
        s => s.card.domain.includes('电')
      ).length;
      damage += electricSupports * 15;
    }

    // 3.5 驻场 buffDmg 加成（辅助卡增伤）
    for (const s of attacker.fieldSupports) {
      if (s.card.effect?.buffDmg) {
        damage += s.card.effect.buffDmg;
      }
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
        const threshold = match ? parseInt(match[1], 10) : 1;
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

    // 光谱叠加(S17)
    damage += this.spectrumBonus[attackerIdx];

    // 短路开关(S30)
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

    // 5.5. 卡牌效果条件加成（从 cards.js 读取平属性）
    if (card.effect.perSupportBonus) {
        const supportCount = attacker.fieldSupports.length;
        damage += card.effect.perSupportBonus * supportCount;
    }
    if (card.effect.perBurnBonus) {
        damage += card.effect.perBurnBonus * defender.burnLayers;
    }
    if (card.effect.hpLossBonus) {
        // A08 做功打击: 对方已损失HP的N%额外伤害
        const lostHp = (defender.maxHp || MAX_HP) - defender.hp;
        damage += Math.floor(lostHp * card.effect.hpLossBonus);
    }
    if (card.effect.perOppFieldCard) {
        const oppFieldCount = defender.fieldSummons.length +
            (defender.fieldDomain ? 1 : 0) + defender.fieldSupports.length;
        damage += card.effect.perOppFieldCard * oppFieldCount;
    }
    if (card.effect.perSoundFieldBonus) {
        const soundFields = attacker.fieldSupports.filter(
            f => f.card?.domain?.includes('声')
        ).length;
        damage += card.effect.perSoundFieldBonus * soundFields;
    }
    if (card.effect.forceDomainBonus && attacker.fieldDomain?.card?.id === 'D01') {
        damage += card.effect.forceDomainBonus;
    }
    if (card.effect.domainBonus && attacker.fieldDomain) {
        damage += card.effect.domainBonus;
    }

    // A53 镜面回声: +10 to sound and light attacks this turn
    if (this.mirrorEchoBonus[attackerIdx] > 0 && (card.domain.includes('声') || card.domain.includes('光'))) {
        damage += this.mirrorEchoBonus[attackerIdx];
    }

    // P2: A11 声压—对方有声压时声系攻击加伤
    if (card.domain.includes('声') && this.soundPressure[defenderIdx] > 0) {
      const a11Card = attacker.fieldSupports.find(s => s.card?.id === 'A11');
      const sonicDmgPerStack = a11Card?.card?.effect?.sonicDmgPerStack || 10;
      damage += this.soundPressure[defenderIdx] * sonicDmgPerStack;
    }

    // P2: S01/S02/S03/S12/S09 — 下次攻击加成
    const nb = this.nextBonus[attackerIdx];
    if (nb.force && card.domain.includes('力')) {
      damage += nb.force;
      delete nb.force;
    }
    if (nb.sound && card.domain.includes('声')) {
      damage += nb.sound;
      // S12 反屏障额外伤害
      if (nb.antiBarrier && defender.fieldSupports.some(s => s.card.effect?.soundDefense)) {
        damage += nb.antiBarrier;
        delete nb.antiBarrier;
      }
      delete nb.sound;
    }
    if (nb.any) {
      damage += nb.any;
      delete nb.any;
    }

    // P2: S05 力的合成—本回合力攻击叠伤
    if (card.domain.includes('力') && card.type === 'attack') {
      const s05 = attacker.fieldSupports.find(s => s.card?.id === 'S05');
      if (s05) {
        const stackingPer = s05.card.effect.stackingForceDmg || 10;
        const maxStack = s05.card.effect.maxStacking || 30;
        damage += Math.min(this._forceStackCount[attackerIdx] * stackingPer, maxStack);
      }
    }

    // P2: S09 频率调节 low 模式—全体声波+5
    damage += this._turnAllSoundBonus[attackerIdx];

    // 6. 防御减伤
    let totalDefense = 0;
    const cardDomains = card.domain;

    // 领域卡提供的防御（替换旧领域时新领域才有防御）
    // 本游戏领域中领域卡本身不直接提供防御减伤给玩家
    // 防御来自辅助卡如 S04, S11, S27

    // 领域防御：检查防御方的领域卡是否提供防御
    // 注：领域卡D01-D05不直接提供防御减伤
    // 防御减伤主要来自防御型辅助卡

    // 辅助卡防御 - 检查领域特定防御效果
    // S31 高压击穿: 电系攻击无视电领域防御
    const hvpActive = this.highVoltagePierce && this.highVoltagePierce[attackerIdx] > 0 &&
        cardDomains.includes('电');
    const defKeys = {力:'forceDefense', 声:'soundDefense', 电:'electricDefense', 光:'lightDefense', 热:'heatDefense'};
    for (const s of defender.fieldSupports) {
      for (const [domain, key] of Object.entries(defKeys)) {
        if (hvpActive && domain === '电') {
          // S31 高压击穿: 无视20点电防御
          if (s.card.effect[key] && cardDomains.includes(domain)) {
            totalDefense += Math.max(0, s.card.effect[key] - 20);
          }
          continue;
        }
        if (s.card.effect[key] && cardDomains.includes(domain)) {
          totalDefense += s.card.effect[key];
        }
      }
    }

    damage = Math.max(0, damage - (skipDefense ? 0 : totalDefense));
    // 之前 Combo 的 ignore defense 加成（M2: 死变量激活）
    if (this._ignoreDefBonus && this._ignoreDefBonus[attackerIdx] > 0) {
      damage += this._ignoreDefBonus[attackerIdx];
      this._ignoreDefBonus[attackerIdx] = 0;
    }
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
    // 知识减费
    if (this.quizCostReduction[playerIdx] > 0) {
      cost = Math.max(0, cost - 1);
      this.quizCostReduction[playerIdx]--;
      this._addLog(`[知识减费] 答对奖励：本卡费用-1（剩余${this.quizCostReduction[playerIdx]}次）。`);
    }
    // 答错惩罚
    if (this.quizCostPenalty[playerIdx] > 0) {
      cost += this.quizCostPenalty[playerIdx];
      this._addLog(`[知识惩罚] 答错惩罚：本卡额外+${this.quizCostPenalty[playerIdx]}费。`);
    }
    // 多路放电(S33)电攻减费
    if (this.multiDischarge[playerIdx] && card.domain.includes('电') && card.type === 'attack') {
      cost -= 2;
    }
    // S14 滤光领域减费
    if (this._filterDomain[playerIdx] && card.domain.includes(this._filterDomain[playerIdx])) {
      cost -= this._filterDomainReduction[playerIdx];
    }
    // S32 低压启动减费
    const eTgt = this._reduceElectricTarget[playerIdx];
    if (eTgt && eTgt.costReduction > 0 && card === eTgt.cardRef) {
      cost -= eTgt.costReduction;
    }
    player.spirit = Math.max(0, player.spirit - Math.max(0, cost));

    // 从手牌移除
    player.hand.splice(handIdx, 1);
    const effects = [];

    // E10: 召唤卡前置检查（扣费后但可退还）
    if (card.type === 'summon') {
      if (player.fieldSummons.length >= MAX_SUMMONS) {
        player.spirit = Math.min(MAX_SPIRIT, player.spirit + Math.max(0, cost));
        player.hand.push(card);
        return { success: false, msg: '召唤物已达上限（2个）。', effects: [] };
      }
      if (player.fieldSummons.some(s => s.card.id === card.id)) {
        player.spirit = Math.min(MAX_SPIRIT, player.spirit + Math.max(0, cost));
        player.hand.push(card);
        return { success: false, msg: `同名召唤物「${card.name}」已存在。`, effects: [] };
      }
    }

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
        try {
          effects.push(...this._handleAttack(card, playerIdx, target));
        } catch (e) {
          console.error('_handleAttack error for card', card?.id, e);
          this._addLog(`[错误] 攻击卡处理失败: ${card?.name || '未知'}`);
        }
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

    // 电磁感应(S28)：电系卡额外+2精神力
    const emInduction = player.fieldSupports.find(s => s.card.id === 'S28');
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
    } else if (!['domain', 'summon'].includes(card.type)) {
      // 攻击/辅助类驻场卡（如A05重力势能）：未在 _handleSupport 中加入的，补加入 fieldSupports
      const alreadyTracked = player.fieldSupports.find(s => s.card?.id === card.id);
      if (!alreadyTracked) {
        player.fieldSupports.push({ card, turnsRemaining: 999 });
      }
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
    if (card.effect.ignoreDefense) {
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
            this._dotIncrementBoost[oIdx] = (eff.value || 0);  // 按DOT承受方(oIdx)存储
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
            this._burnDmgPerLayer[attackerIdx] = (eff.value || 50);
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
          case 'refund_cost':
            {
              const refund = Math.floor((card.cost || 0) * (eff.ratio || 0.5));
              attacker.spirit = Math.min(MAX_SPIRIT, attacker.spirit + refund);
              effects.push({ type: 'refund_cost', value: refund, msg: `退回${refund}精神力` });
            }
            break;
          default:
            this._addLog(`[Combo::未识别] ${eff.type} (${combo.type})`);
        }
      }
      this.pendingCombo[attackerIdx] = null;  // 清空已消费的combo
    }

    // 特殊攻击处理
    if (card.id === 'A02') {
      // 惯性冲锋：上回合力学伤害50%额外
      const extra = Math.floor(this.lastTurnDamage[attackerIdx] * 0.5);
      damage += extra;
      effects.push({ type: 'inertia_extra', value: extra });
      // 标记：本回合A02最终伤害需保存用于 nextCarryRatio
      if (card.effect.nextCarryRatio) {
        if (!this._inertiaNextTurn) this._inertiaNextTurn = {};
        this._inertiaNextTurn[attackerIdx] = { pending: true, ratio: card.effect.nextCarryRatio, damage: 0 };
      }
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
      effects.push({ type: 'echo_bomb_pending', dmg: 100, msg: '回声爆破待触发，下回合自动造成100伤害' });
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
        // Combo(S33→A49)：不摧毁辅助卡
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

    // A27-A30: 电系辅助卡数量触发效果
    const elecSupCount = attacker.fieldSupports.filter(s => s.card.domain.includes('电')).length;
    if (card.id === 'A27' && elecSupCount >= 2) {
      // 闪电劈击：无视20点防御+额外20伤害
      const trig = card.effect.triggerElectric2 || {};
      damage += (trig.bonusDmg || 20);
      this._ignoreDefBonus[attackerIdx] += (trig.ignoreDefense || 20);
      effects.push({ type: 'electric_trigger', msg: '高压击穿：无视20防御+额外20伤害' });
    }
    if (card.id === 'A28' && elecSupCount >= 1) {
      // 雷暴链击：对方每张辅助卡额外15伤害
      const trig = card.effect.triggerElectric1 || {};
      const oppSupports = opponent.fieldSupports.length;
      const chainDmg = oppSupports * (trig.chainPerSupport || 15);
      damage += chainDmg;
      if (chainDmg > 0) effects.push({ type: 'electric_trigger', msg: `连锁伤害: ${oppSupports}张×${trig.chainPerSupport||15}=${chainDmg}` });
    }
    if (card.id === 'A29' && elecSupCount >= 1) {
      // 电弧灼烧：额外20灼烧伤害
      const trig = card.effect.triggerElectric1 || {};
      damage += (trig.bonusDmg || 20);
      effects.push({ type: 'electric_trigger', msg: '电弧灼烧：额外+20伤害' });
    }
    if (card.id === 'A30' && elecSupCount >= 2) {
      // 电磁脉冲：消灭驻场卡+额外15伤害
      const trig = card.effect.triggerElectric2 || {};
      damage += (trig.bonusDmg || 15);
      if (trig.destroyField && opponent.fieldSupports.length > 0) {
        const target = opponent.fieldSupports[opponent.fieldSupports.length - 1];
        opponent.discardPile.push(target.card);
        opponent.fieldSupports.pop();
        effects.push({ type: 'destroy_field', msg: `电磁脉冲摧毁了「${target.card.name}」` });
      }
      effects.push({ type: 'electric_trigger', msg: '电磁脉冲：额外+15伤害' });
    }

    if (card.id === 'A54') {
      // 爆燃：引爆所有灼烧层数（默认50，S24→A54 combo可提升）
      const perLayerDmg = this._burnDmgPerLayer[attackerIdx];
      const burnExplode = opponent.burnLayers * perLayerDmg;
      opponent.burnLayers = 0;
      damage += burnExplode;
      effects.push({ type: 'burn_explode', value: burnExplode, perLayer: perLayerDmg });
      // Combo(S26→A54)：引爆后额外+灼烧
      if (this._pendingBurnAfterExplode[attackerIdx] > 0) {
        opponent.burnLayers += this._pendingBurnAfterExplode[attackerIdx];
        effects.push({ type: 'combo_burn_after_explode', layers: this._pendingBurnAfterExplode[attackerIdx] });
        this._pendingBurnAfterExplode[attackerIdx] = 0;
      }
    }

    if (card.id === 'A55') {
      // 凸透引燃：每张己方驻场辅助卡附加1层灼烧（上限3层）
      const extraBurn = Math.min(3, attacker.fieldSupports.length);
      const maxBurn = MAX_BURN_DEFAULT + this._burnCapIncrease[attackerIdx];
      opponent.burnLayers = Math.min(maxBurn, Math.max(0, opponent.burnLayers + extraBurn));
      effects.push({ type: 'extra_burn', layers: extraBurn });
    }

    // 惠更斯(C11)闪避检查
    for (const s of opponent.fieldSummons) {
      if (s.card.id === 'C11' && s.card.effect.dodgeChance) {
        if (Math.random() < s.card.effect.dodgeChance) {
          this._addLog(`[惠更斯] 闪避了攻击！`);
          damage = 0;
          effects.push({ type: 'dodge', msg: '惠更斯闪避了攻击' });
        }
      }
    }

    // 芝诺龟(C01)减半伤害
    if (!this._zenoFirstAtk[attackerIdx]) {
      for (const s of opponent.fieldSummons) {
        if (s.card.id === 'C01') {
          const halfDmg = this._isFirstAtkThisTurn(attackerIdx);
          if (halfDmg) {
            damage = Math.floor(damage / 2);
            effects.push({ type: 'zeno_halve', msg: '芝诺龟将首次攻击伤害减半' });
          }
        }
      }
      // 芝诺龟仅对第一次攻击减半
      this._zenoFirstAtk[attackerIdx] = true;
    }

    // 海市蜃楼(A50)偏转检查
    if (this.mirageTurns[oIdx] > 0 && !this.mirageFirstAtk[attackerIdx]) {
      if (Math.random() < 0.3) {
        this._addLog(`[海市蜃楼] 攻击被偏转！伤害变为0。`);
        damage = 0;
        effects.push({ type: 'mirage_deflect', msg: '海市蜃楼偏转了攻击' });
      }
    }
    this.mirageFirstAtk[attackerIdx] = true;

    // 处理特定攻击的消灭/弹回效果
    const destroyCards = ['A09', 'A18', 'A25'];
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

    // A36 焦耳热击 — 对偶加伤（必须在HP扣减前）
    if (card.id === 'A36') {
      if (card.effect.bonusDmgPerPair) {
        const pairs = (opponent.paralysis || 0) * opponent.burnLayers;
        const bonus = pairs * card.effect.bonusDmgPerPair;
        damage += bonus;
        effects.push({ type: 'pair_bonus', value: bonus });
      }
    }

    // 造成伤害
    if (damage > 0) {
      if (target.startsWith('summon_')) {
        const summonIdx = parseInt(target.split('_')[1]);
        effects.push(...this._attackSummon(opponent, summonIdx, damage));
      } else {
        opponent.hp = Math.max(0, opponent.hp - damage);
        const quizBonusPct = this.quizResult.bonus || 0;
        const quizTag = quizBonusPct > 0 ? ` [知识之力 +${(quizBonusPct * 100).toFixed(0)}%]` : '';
        this._addLog(`[攻击]${quizTag} 造成 ${damage} 点伤害。${oIdx === 0 ? '玩家' : 'AI'} HP: ${opponent.hp}/${MAX_HP}`);
        effects.push({ type: 'damage', value: damage, target: 'player' });

        // A05重力势能：追踪对方对己方造成的累计伤害
        if (this._a05DmgReceived && this.hightAtkTrack[oIdx] > 0) {
          this._a05DmgReceived[oIdx] += damage;
        }
      }
    }

    // 记录力系伤害
    if (card.domain.includes('力')) {
      attacker.totalForceDmg += damage;
    }

    // A02惯性冲锋：保存本回合最终伤害用于下回合 nextCarryRatio
    if (this._inertiaNextTurn?.[attackerIdx]?.pending && card.id === 'A02') {
      this._inertiaNextTurn[attackerIdx].damage = damage;
      this._inertiaNextTurn[attackerIdx].pending = false;
      this.lastTurnDamage[attackerIdx] = damage; // 覆盖保存最终伤害值
    }

    // 应用DOT效果
    if (card.effect.dotDmg) {
      opponent.dotEffects.push({
        dmg: card.effect.dotDmg,
        turnsRemaining: card.effect.dotTurns,
        initialTurns: card.effect.dotTurns,
        cardId: card.id
      });
      effects.push({ type: 'dot', dmg: card.effect.dotDmg, turns: card.effect.dotTurns });
    } else if (card.effect.dot) {
      opponent.dotEffects.push({
        dmg: card.effect.dot.perTurn,
        turnsRemaining: card.effect.dot.turns,
        initialTurns: card.effect.dot.turns,
        cardId: card.id
      });
      effects.push({ type: 'dot', dmg: card.effect.dot.perTurn, turns: card.effect.dot.turns });
    } else if (card.effect.dotSequence) {
      const seq = card.effect.dotSequence;
      opponent.dotEffects.push({
        dmg: seq[0],
        turnsRemaining: seq.length,
        initialTurns: seq.length,
        cardId: card.id,
        dotSequence: seq
      });
      effects.push({ type: 'dot', dmg: seq[0], turns: seq.length, sequence: seq });
    }

    // 应用灼烧
    if (card.effect.burn) {
      opponent.burnLayers += card.effect.burn;
      // 热之领域(D04)：额外+1层
      if (attacker.fieldDomain?.card?.id === 'D04') {
        opponent.burnLayers += 1;
      }
      // 灼烧上限检查
      const maxBurn = MAX_BURN_DEFAULT + this._burnCapIncrease[attackerIdx];
      opponent.burnLayers = Math.min(opponent.burnLayers, maxBurn);
      effects.push({ type: 'burn', layers: card.effect.burn });
    }

    // opponentExtraCost/stealSpirit/halveSpiritRecovery 由 _applySpecialEffects 统一处理
    // P2: A11 啸叫 — 叠加声压 + 驻场
    if (card.id === 'A11') {
      const sc = card.effect.applyOnCast || 1;
      this.soundPressure[oIdx] += sc;
      this._addLog(`[啸叫] 叠加 ${sc} 层声压（当前 ${this.soundPressure[oIdx]} 层）。`);
      // A11 驻场（引爆由 startTurn 统一处理，同名限1规则下打出时声压不可能满3层）
      const existingA11 = attacker.fieldSupports.find(s => s.card.id === 'A11');
      if (!existingA11) {
        attacker.fieldSupports.push({ card, turnsRemaining: 999 });
        effects.push({ type: 'field_card', name: card.name });
      }
    }

    // P2: A36 焦耳热击 — 麻痹转灼烧 (bonusDmgPerPair 已移到伤害前)
    if (card.id === 'A36') {
      if (card.effect.burnPerParalyze) {
        const pLayers = opponent.paralysis || 0;
        opponent.burnLayers += pLayers * card.effect.burnPerParalyze;
        effects.push({ type: 'burn_from_paralyze', layers: pLayers });
      }
    }

    // P2: A39 光电效应 — 光系驻场卡变光电双属性
    if (card.id === 'A39') {
      const lightField = attacker.fieldSupports.find(
        s => s.card.domain.includes('光') && !s.card.domain.includes('电')
      );
      if (lightField) {
        // 创建副本避免修改静态卡牌定义
        const cardCopy = { ...lightField.card, domain: [...lightField.card.domain, '电'] };
        lightField.card = cardCopy;
        this._addLog(`[光电效应]「${cardCopy.name}」获得电属性。`);
        effects.push({ type: 'dual_domain', name: cardCopy.name });
      }
    }

    // P2: S05 力的合成 — 力攻击计数递增
    if (card.domain.includes('力') && card.type === 'attack') {
      this._forceStackCount[attackerIdx]++;
    }

    // P2: S06 弹性储能 — 力攻击伤害存储
    const s06Field = attacker.fieldSupports.find(s => s.card?.id === 'S06');
    if (s06Field && card.domain.includes('力') && card.type === 'attack') {
      const energyStoreEffect = s06Field.card.effect;
      const storeRatio = energyStoreEffect.energyStore || 0.3;
      const maxStore = energyStoreEffect.maxStore || 300;
      const releaseRatio = energyStoreEffect.releaseRatio || 0.5;
      const toStore = Math.floor(damage * storeRatio);
      this.energyStore[attackerIdx].stored = Math.min(maxStore, (this.energyStore[attackerIdx].stored || 0) + toStore);
      this._addLog(`[弹性储能] 存储 ${toStore} 点能量（已存储 ${this.energyStore[attackerIdx].stored}/${maxStore}）。`);
      effects.push({ type: 'energy_stored', value: toStore, total: this.energyStore[attackerIdx].stored });
      // 满能量立即释放
      if (this.energyStore[attackerIdx].stored >= maxStore) {
        const releaseDmg = Math.floor(this.energyStore[attackerIdx].stored * releaseRatio);
        opponent.hp = Math.max(0, opponent.hp - releaseDmg);
        this.energyStore[attackerIdx].stored = 0;
        this._addLog(`[弹性储能释放] 已达上限，释放 ${releaseDmg} 点伤害！`);
        effects.push({ type: 'energy_released', dmg: releaseDmg });
      }
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
    // 领域级防御（forceDefense/soundDefense/electricDefense）被动生效，加条目
    if (card.effect.forceDefense) effects.push({ type: 'defense', value: card.effect.forceDefense });
    if (card.effect.soundDefense) effects.push({ type: 'defense', value: card.effect.soundDefense });
    if (card.effect.electricDefense) effects.push({ type: 'defense', value: card.effect.electricDefense });

    // 增伤buff效果（驻场）
    if (card.effect.buffDmg && !card.effect.defense && !card.effect.draw && !card.effect.drawCards) {
      const existing = attacker.fieldSupports.find(s => s.card.id === card.id);
      if (existing) {
        existing.turnsRemaining = card.effect.turns || 2;
      } else {
        attacker.fieldSupports.push({ card, turnsRemaining: card.effect.turns || 2 });
      }
      effects.push({ type: 'buff', value: card.effect.buffDmg });
    }

    // 持续效果辅助卡（如S28电磁感应：有turns且属于持续生效类）
    if (card.effect.turns && !card.effect.defense && !card.effect.buffDmg
        && !card.effect.draw && !card.effect.drawCards
        && (card.effect.spiritPerTurn || card.effect.perElectricCard)) {
      const existing = attacker.fieldSupports.find(s => s.card.id === card.id);
      if (existing) {
        existing.turnsRemaining = card.effect.turns;
      } else {
        attacker.fieldSupports.push({ card, turnsRemaining: card.effect.turns });
      }
      effects.push({ type: 'continuous_support', name: card.name, turns: card.effect.turns });
    }

    // 特殊效果处理
    this._applySpecialEffects(card, attackerIdx, opponent, effects);

    // ========== P2: 支援卡特殊效果 ==========

    // S01 质量增大 / S02 能量蓄积 — 下次力系攻击加成
    if (card.effect.nextForceBonus) {
      this.nextBonus[attackerIdx].force = (this.nextBonus[attackerIdx].force || 0) + card.effect.nextForceBonus;
      effects.push({ type: 'next_force_bonus', value: card.effect.nextForceBonus });
    }

    // S03 受力面积缩小 — 下次攻击加成
    if (card.effect.nextAtkBonus) {
      this.nextBonus[attackerIdx].any = (this.nextBonus[attackerIdx].any || 0) + card.effect.nextAtkBonus;
      effects.push({ type: 'next_atk_bonus', value: card.effect.nextAtkBonus });
    }

    // S12 聚焦声束 — 下次声系加成 + 反屏障
    if (card.effect.nextSoundBonus) {
      this.nextBonus[attackerIdx].sound = (this.nextBonus[attackerIdx].sound || 0) + card.effect.nextSoundBonus;
      if (card.effect.antiBarrier) {
        this.nextBonus[attackerIdx].antiBarrier = (this.nextBonus[attackerIdx].antiBarrier || 0) + card.effect.antiBarrier;
      }
      effects.push({ type: 'next_sound_bonus', value: card.effect.nextSoundBonus,
        antiBarrier: card.effect.antiBarrier || 0 });
    }

    // S05 力的合成 — 初始化力攻击计数
    if (card.effect.stackingForceDmg) {
      this._forceStackCount[attackerIdx] = 0;
      // S05 也作为本回合驻场（非持久）
      attacker.fieldSupports.push({ card, turnsRemaining: 1 });
      effects.push({ type: 'stacking_force', perStack: card.effect.stackingForceDmg, max: card.effect.maxStacking });
    }

    // S06 弹性储能 — 激活储能
    if (card.effect.energyStore) {
      this.energyStore[attackerIdx].stored = 0;
      // 作为驻场卡
      attacker.fieldSupports.push({
        card,
        turnsRemaining: card.effect.maxTurns || 4
      });
      effects.push({ type: 'energy_store', max: card.effect.maxStore, ratio: card.effect.releaseRatio });
    }

    // S09 频率调节 — 双模式
    if (card.id === 'S09') {
      if (attackerIdx === 1) {
        // AI: 有A10在场→降低，否则→升高
        const hasA10 = attacker.fieldSupports.some(s => s.card.id === 'A10') ||
          opponent.dotEffects.some(d => d.cardId === 'A10');
        if (hasA10) {
          attacker.cardForms['S09'] = 'down';
          this._turnAllSoundBonus[attackerIdx] += 5;
          for (const dot of opponent.dotEffects) {
            if (dot.cardId === 'A10') dot.turnsRemaining += 2;
          }
          effects.push({ type: 'set_frequency_form', form: 'down', msg: '频率调节：降低模式' });
        } else {
          attacker.cardForms['S09'] = 'up';
          this.nextBonus[attackerIdx].sound = (this.nextBonus[attackerIdx].sound || 0) + 20;
          effects.push({ type: 'set_frequency_form', form: 'up', msg: '频率调节：升高模式' });
        }
      } else {
        // 玩家: 待选择
        this._pendingFrequencyChoice = true;
        effects.push({ type: 'freq_pending', msg: '选择升高或降低频率' });
      }
    }

    // S14 滤光 — 选择领域减费
    if (card.effect.filterDomain) {
      // AI：挑选手中卡牌最多的领域
      const domainCount = {};
      for (const hc of attacker.hand) {
        for (const d of hc.domain) {
          domainCount[d] = (domainCount[d] || 0) + 1;
        }
      }
      let bestDomain = null;
      let bestCount = 0;
      for (const [d, c] of Object.entries(domainCount)) {
        if (c > bestCount) { bestCount = c; bestDomain = d; }
      }
      if (bestDomain) {
        this._filterDomain[attackerIdx] = bestDomain;
        this._filterDomainReduction[attackerIdx] = card.effect.costReduction || 3;
        this._addLog(`[滤光] 选择「${bestDomain}」领域，该领域卡牌费用-${this._filterDomainReduction[attackerIdx]}。`);
        effects.push({ type: 'filter_domain', domain: bestDomain, reduction: this._filterDomainReduction[attackerIdx] });
      }
    }

    // S21 凸透成像 — 复现上回合卡牌效果（玩家选择，AI自动）
    if (card.effect.convexLens) {
      const lastCard = this._lastTurnCard[1 - attackerIdx];
      const lensEff = card.effect.convexLens;
      if (lastCard && lastCard.card) {
        if (attackerIdx === 1) {
          // AI: 自动选择——HP<50%且对方上回合有伤害则实像，否则虚像
          const hpRatio = attacker.hp / MAX_HP;
          if (hpRatio < 0.5 && lastCard.damage) {
            const heal = Math.floor(lastCard.damage * (lensEff.realImage?.restoreHp || 1.5));
            attacker.hp = Math.min(MAX_HP, attacker.hp + heal);
            effects.push({ type: 'convex_real', heal });
          } else if (lastCard.damage) {
            const copyDmg = Math.floor(lastCard.damage * (lensEff.virtualImage?.copyEffect || 1.2));
            const extraCost = Math.ceil((lastCard.card.cost || 0) * (lensEff.virtualImage?.extraCost || 0.5));
            attacker.spirit = Math.max(0, attacker.spirit - extraCost);
            opponent.hp = Math.max(0, opponent.hp - copyDmg);
            effects.push({ type: 'convex_virtual', dmg: copyDmg, extraCost });
          }
        } else {
          // 玩家: 标记待选择
          this._pendingConvexLens = { lastCard, lensEff };
          effects.push({ type: 'convex_pending', msg: '选择实像(回血)或虚像(复制卡牌)' });
        }
      } else {
        effects.push({ type: 'convex_none', msg: '无上回合卡牌可复现' });
      }
    }

    // S32 低压启动 — 选一张手中电系卡减费
    if (card.effect.reduceElectricCost) {
      const electricInHand = attacker.hand.filter(c => c.domain.includes('电'));
      if (electricInHand.length > 0) {
        const pick = electricInHand[Math.floor(Math.random() * electricInHand.length)];
        this._reduceElectricTarget[attackerIdx] = {
          cardRef: pick,  // 存储卡牌对象引用
          costReduction: card.effect.reduceElectricCost,
          cardId: pick.id
        };
        effects.push({ type: 'reduce_electric_cost', card: pick.name, reduction: card.effect.reduceElectricCost });
        this._addLog(`[低压启动]「${pick.name}」费用-${card.effect.reduceElectricCost}。`);
      }
    }

    // S34 置换卡 — 手牌换抽
    if (card.effect.replaceHand) {
      if (attacker.hand.length > 0) {
        const rIdx = Math.floor(Math.random() * attacker.hand.length);
        const returned = attacker.hand.splice(rIdx, 1)[0];
        attacker.deck.unshift(returned); // 放回牌库底
        this._addLog(`[置换卡] 将「${returned.name}」放回牌库顶部。`);
        this.drawCards(attackerIdx, 1);
        effects.push({ type: 'replace_hand', returned: returned.name });
      }
    }

    // C12 赫兹 — 声系辅助卡+1持续回合
    const c12Field = attacker.fieldSummons.find(s => s.card.id === 'C12');
    if (c12Field && card.domain.includes('声') && card.type === 'support') {
      // 检查刚打的这张卡是否是驻场卡
      const justAdded = attacker.fieldSupports.find(s => s.card === card);
      if (justAdded && justAdded.turnsRemaining !== undefined) {
        const extendTurns = c12Field.card.effect.soundSupportExtend || 1;
        justAdded.turnsRemaining += extendTurns;
        effects.push({ type: 'c12_extend', name: card.name, extra: extendTurns });
        this._addLog(`[赫兹] 延长「${card.name}」持续时间 +${extendTurns} 回合。`);
      }
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
      hp: card.hp || card.effect.hp || 300
    });
    effects.push({ type: 'summon', name: card.name, hp: card.hp || card.effect.hp || 300 });

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
    const eff = card.effect || {};

    // --- 共通效果（基于 card.effect 字段）---

    // 查看手牌 (effect.viewHand)
    if (eff.viewHand) {
      const count = eff.viewHand === 'all' ? 'all' : eff.viewHand;
      const shown = count === 'all' ? opponent.hand.length : Math.min(count, opponent.hand.length);
      const names = opponent.hand.slice(-shown).map(c => c.name).join('、');
      effects.push({ type: 'view_hand', count, player: oIdx, cards: names });
      this.viewedOpponentHand[oIdx] = true;
    }

    // 弃置对方手牌 (effect.discardOpponent)
    if (eff.discardOpponent) {
      effects.push({ type: 'discard_opponent', count: eff.discardOpponent });
    }

    // 盲选弹回对方手牌 (effect.bounceHand, e.g. A22)
    if (eff.bounceHand && opponent.hand.length > 0) {
      const rIdx = Math.floor(Math.random() * opponent.hand.length);
      const bounced = opponent.hand.splice(rIdx, 1)[0];
      opponent.deck.push(bounced);
      effects.push({ type: 'bounce_hand', msg: `盲选弹回了「${bounced.name}」到牌库顶` });
    }

    // 清除负面状态 (effect.clearDebuff) — 跳过S07(自有处理)
    if (eff.clearDebuff && card.id !== 'S07') {
      player.burnLayers = Math.max(0, player.burnLayers - 1);
      if (player.paralysis > 0) player.paralysis = Math.max(0, player.paralysis - 1);
      if (player.dotEffects.length > 0) player.dotEffects.shift();
      effects.push({ type: 'clear_debuff', msg: '清除了1种负面状态' });
    }

    // 精神力恢复减益 (effect.spiritDebuff, e.g. A24)
    if (eff.spiritDebuff && eff.spiritDebuff < 0) {
      opponent.spiritDebuff = Math.max(-10, opponent.spiritDebuff + eff.spiritDebuff);
      effects.push({ type: 'spirit_debuff', value: eff.spiritDebuff });
    }

    // 对方下回合每出卡额外消耗 (effect.opponentExtraCost)
    if (eff.opponentExtraCost) {
      opponent.extraCost = Math.max(opponent.extraCost || 0, eff.opponentExtraCost);
      effects.push({ type: 'extra_cost', value: eff.opponentExtraCost });
    }

    // 偷取精神力 (effect.stealSpirit, e.g. A25, A34)
    if (eff.stealSpirit) {
      const actual = Math.min(opponent.spirit, eff.stealSpirit);
      opponent.spirit -= actual;
      player.spirit = Math.min(MAX_SPIRIT, player.spirit + actual);
      effects.push({ type: 'steal_spirit', value: actual });
    }

    // 凝固封锁 (effect.consumeBurn + turnBlock, e.g. A26)
    if (eff.consumeBurn && eff.turnBlock) {
      if (opponent.burnLayers >= eff.consumeBurn) {
        opponent.burnLayers -= eff.consumeBurn;
        opponent.turnBlocked = true;
        effects.push({ type: 'freeze_lock', msg: '对方下回合被凝固封锁' });
      }
    }

    // 消耗灼烧发动的辅助 (S23消耗对方, S25消耗己方)
    if (eff.consumeBurn && card.type === 'support') {
      if (card.id === 'S23' && opponent.burnLayers >= eff.consumeBurn) {
        opponent.burnLayers -= eff.consumeBurn;
        player.spirit = Math.min(MAX_SPIRIT, player.spirit + (eff.spiritRestore || 15));
        effects.push({ type: 'heat_engine', spiritRestore: eff.spiritRestore || 15 });
      }
      if (card.id === 'S25' && opponent.burnLayers >= eff.consumeBurn) {
        opponent.burnLayers -= eff.consumeBurn;
        player.hp = Math.min(MAX_HP, player.hp + (eff.heal || 80));
        if (player.paralysis > 0) player.paralysis = Math.max(0, player.paralysis - 1);
        if (player.dotEffects.length > 0) player.dotEffects.shift();
        effects.push({ type: 'latent_heat', heal: eff.heal || 80 });
      }
    }

    // 给对手附加灼烧 (effect.burn, support类型, e.g. S26)
    if (eff.burn && card.type === 'support') {
      const maxBurn = MAX_BURN_DEFAULT + this._burnCapIncrease[playerIdx];
      opponent.burnLayers = Math.min(maxBurn, opponent.burnLayers + eff.burn);
      effects.push({ type: 'burn', layers: eff.burn });
    }

    // 温度升高 (S24)
    if (card.id === 'S24') {
      for (let i = 0; i < 2; i++) {
        this.players[i].burnEnhanced = true;
      }
      player.fieldSupports.push({ card, turnsRemaining: eff.turns || 3 });
      effects.push({ type: 'temperature_rise', msg: '灼烧伤害提升至36/层（持续3回合）' });
    }

    // 比热护盾 (S22)
    if (card.id === 'S22') {
      player.burnImmune = eff.turns || 3;
      effects.push({ type: 'burn_immune', turns: eff.turns || 3 });
    }

    // 光速传播 (S16)
    if (card.id === 'S16') {
      this.lightSpeedActive[playerIdx] = true;
      this.lightSpeedTurns[playerIdx] = eff.turns || 4;
      if (!player.fieldSupports.find(s => s.card.id === 'S16')) {
        player.fieldSupports.push({ card, turnsRemaining: eff.turns || 4 });
      }
      effects.push({ type: 'light_speed', turns: eff.turns || 4 });
    }

    // 恢复HP (effect.heal, e.g. A47)
    if (eff.heal) {
      const heal = Math.min(MAX_HP - player.hp, eff.heal);
      player.hp += heal;
      effects.push({ type: 'heal', value: heal });
    }

    // 对方精神力恢复减半 (effect.halveSpiritRecovery, e.g. A42)
    if (eff.halveSpiritRecovery) {
      opponent.spiritDebuff = Math.max(-10, opponent.spiritDebuff - Math.floor(SPIRIT_PER_TURN / 2));
      effects.push({ type: 'spirit_halve', msg: '对方下回合精神力恢复减半' });
    }

    // 海市蜃楼 (A50)
    if (card.id === 'A50') {
      this.mirageTurns[oIdx] = 4;
      effects.push({ type: 'mirage', turns: 4 });
    }

    // 声速激增 (A51) — 基于对方灼烧层数
    if (card.id === 'A51') {
      const buff = (opponent.burnLayers || 0) * 6;
      this.soundSpeedBuff[playerIdx] += buff;
      effects.push({ type: 'sound_speed_buff', value: buff });
    }
    // 镜面回声 (A53)
    if (card.id === 'A53') {
      this.mirrorEchoBonus[playerIdx] = card.effect?.soundLightBonus || 10;
      effects.push({ type: 'mirror_echo', value: card.effect?.soundLightBonus || 10, msg: '本回合声系和光系攻击+10伤害' });
    }

    // 偏振过滤 (S15)
    if (card.id === 'S15') {
      if (eff.polarize) {
        this.polarizeRestriction[oIdx] = 'restricted';
      }
      effects.push({ type: 'polarize', msg: '对方下回合只能出一种类型的卡' });
    }

    // 光谱叠加 (S17)
    if (card.id === 'S17') {
      const uniqueDomains = new Set();
      for (const s of player.fieldSupports) {
        s.card.domain.forEach(d => uniqueDomains.add(d));
      }
      if (player.fieldDomain?.card?.domain) {
        player.fieldDomain.card.domain.forEach(d => uniqueDomains.add(d));
      }
      this.spectrumBonus[playerIdx] = uniqueDomains.size * 10;
      effects.push({ type: 'spectrum', bonus: this.spectrumBonus[playerIdx] });
    }

    // 镜面迷宫 (S19)
    if (card.id === 'S19') {
      this.mirrorMaze[oIdx] = 3;
      effects.push({ type: 'mirror_maze', msg: '对方3次出牌有35%概率失败' });
    }

    // 影子束缚 (S20)
    if (card.id === 'S20') {
      if (opponent.fieldSupports.length > 0 || opponent.fieldSummons.length > 0 || opponent.fieldDomain) {
        this.shadowBindTurns[oIdx] = 2;
        if (!player.fieldSupports.find(s => s.card.id === 'S20')) {
          player.fieldSupports.push({ card, turnsRemaining: 2 });
        }
        effects.push({ type: 'shadow_bind', msg: '对方下2回合不能出辅助卡' });
      }
    }

    // 短路开关 (S30)
    if (card.id === 'S30') {
      const elecIdx = player.fieldSupports.findIndex(s => s.card.domain.includes('电'));
      if (elecIdx !== -1) {
        player.fieldSupports.splice(elecIdx, 1);
        this.shortCircuitActive[playerIdx] = true;
        effects.push({ type: 'short_circuit', msg: '牺牲电辅助卡，本回合电攻+20' });
      }
    }

    // S10 共振蓄能：本回合若已打出声系攻击，额外恢复精神力
    if (card.id === 'S10' && eff.soundBonusSpirit) {
      const soundPlayed = this.cardsThisTurn.some(cid => {
        const c = this.getCardById(cid);
        return c && c.type === 'attack' && c.domain.includes('声');
      });
      if (soundPlayed) {
        player.spirit = Math.min(MAX_SPIRIT, player.spirit + eff.soundBonusSpirit);
        effects.push({ type: 'spirit_restore', value: eff.soundBonusSpirit });
      }
    }

    // 高压击穿 (S31)
    if (card.id === 'S31') {
      this.highVoltagePierce[playerIdx] = 3;
      if (!player.fieldSupports.find(s => s.card.id === 'S31')) {
        player.fieldSupports.push({ card, turnsRemaining: 3 });
      }
      effects.push({ type: 'high_voltage', msg: '电攻无视20点防御，持续3回合' });
    }

    // 多路放电 (S33)
    if (card.id === 'S33') {
      this.multiDischarge[playerIdx] = true;
      effects.push({ type: 'multi_discharge', msg: '本回合所有电攻费用-2' });
    }

    // 噪音干扰 (S08)
    if (card.id === 'S08') {
      opponent.extraCost = Math.max(opponent.extraCost || 0, eff.opponentExtraCost || 5);
      // 驻场显示
      if (!player.fieldSupports.find(s => s.card.id === 'S08')) {
        player.fieldSupports.push({ card, turnsRemaining: eff.turns || 1 });
      }
      effects.push({ type: 'noise', msg: '对方下回合每出卡+5费' });
    }

    // S07 回声消声：查看手牌+清除负面
    if (card.id === 'S07') {
      effects.push({ type: 'view_hand', count: eff.viewHand || 2, player: oIdx });
      this.viewedOpponentHand[oIdx] = true;
      const p = this.players[playerIdx];
      if (p.burnLayers > 0) p.burnLayers = Math.max(0, p.burnLayers - 1);
      if (p.paralysis > 0) p.paralysis = Math.max(0, p.paralysis - 1);
      if (p.dotEffects.length > 0) p.dotEffects.shift();
      effects.push({ type: 'clear_debuff', msg: '清除了1种负面状态' });
    }

    // S29 静电吸附：弃1张手牌→抽2张+清除负面
    if (card.id === 'S29' && eff.draw) {
      if (player.hand.length > 0) {
        // 弃一张手牌
        const discardIdx = player.hand.length - 1; // 弃最后一张（简化：AI/自动选）
        const discarded = player.hand.splice(discardIdx, 1)[0];
        player.discardPile.push(discarded);
        effects.push({ type: 'discard', msg: `弃置「${discarded.name}」` });
      }
      this.drawCards(playerIdx, eff.draw);
      const p = this.players[playerIdx];
      if (p.burnLayers > 0) p.burnLayers = Math.max(0, p.burnLayers - 1);
      if (p.paralysis > 0) p.paralysis = Math.max(0, p.paralysis - 1);
      if (p.dotEffects.length > 0) p.dotEffects.shift();
      effects.push({ type: 'draw', count: eff.draw });
    }

    // === 通用驻场逻辑：support卡有持续效果但未加入fieldSupports的，自动加入 ===
    if (card.type === 'support') {
      const already = player.fieldSupports.find(s => s.card.id === card.id);
      if (!already) {
        // 有turns的持续效果卡（S08/S16/S20/S31等）
        if (eff.turns) {
          player.fieldSupports.push({ card, turnsRemaining: eff.turns });
        }
        // 下次攻击加成卡（S01/S02/S03/S12等）
        else if (eff.nextForceBonus || eff.nextAtkBonus || eff.nextSoundBonus) {
          player.fieldSupports.push({ card, turnsRemaining: 1 });
        }
      }
    }

    // 通用窥牌效果 (effect.scry, e.g. S13多普勒探测)
    if (eff.scry && player.deck.length > 0) {
      const scryCount = Math.min(eff.scry, player.deck.length);
      const topCards = player.deck.slice(-scryCount).reverse();
      this._pendingScry = {
        targetPlayerIdx: playerIdx,
        cards: topCards.map(c => ({ id: c.id, name: c.name, domain: c.domain, type: c.type, dmg: c.effect?.dmg || 0 })),
        count: scryCount
      };
      effects.push({ type: 'scry_self', count: scryCount, msg: `预览牌库顶${scryCount}张` });
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

    // 比热护盾(S22)免疫
    if (player.burnImmune > 0) {
      player.burnImmune--;
      this._addLog(`[${playerIdx === 0 ? '玩家' : 'AI'}] 比热护盾免疫了灼烧伤害。`);
      // 灼烧层数依然递减
      player.burnLayers = Math.max(0, player.burnLayers - 1);
      return;
    }

    const burnDmg = player.burnEnhanced ? BURN_ENHANCED_DMG : BURN_BASE_DMG;
    const totalDmg = player.burnLayers * burnDmg;
    player.hp = Math.max(0, player.hp - totalDmg);

    this._addLog(`[灼烧] ${playerIdx === 0 ? '玩家' : 'AI'} 受到 ${player.burnLayers}层灼烧共 ${totalDmg} 点伤害。`);

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
      // A10次声震荡：DOT递增（含S08→A10 combo加成）
      let dmg = dot.dmg;
      if (dot.cardId === 'A10') {
        const increment = 10 + this._dotIncrementBoost[playerIdx];  // 基础递增10 + S08→A10 combo +3
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
      // S24温度升高过期时清除双方burnEnhanced标记
      if (removed.card.id === 'S24') {
        this.players[0].burnEnhanced = false;
        this.players[1].burnEnhanced = false;
        this._addLog(`[系统] 灼烧增强效果结束，双方灼烧伤害恢复正常。`);
      }
      // P2: S06 弹性储能过期 — 释放存储能量
      if (removed.card.id === 'S06') {
        const stored = this.energyStore[playerIdx].stored || 0;
        if (stored > 0) {
          const releaseRatio = removed.card.effect.releaseRatio || 0.5;
          const releaseDmg = Math.floor(stored * releaseRatio);
          const opponent = this.players[1 - playerIdx];
          opponent.hp = Math.max(0, opponent.hp - releaseDmg);
          this._addLog(`[弹性储能释放] 持续结束，释放 ${releaseDmg} 点伤害！`);
          this.energyStore[playerIdx].stored = 0;
        }
      }
      // A16 色散分解：驻场结束后回到手牌可0费再次打出
      if (removed.card.id === 'A16' && removed.card.effect.returnOnSurvive) {
        // 深拷贝 effect 避免污染原始卡牌数据（Object.assign 比 spread 语义更明确）
        const cardCopy = { ...removed.card, effect: Object.assign({}, removed.card.effect, { cost: 0 }) };
        cardCopy._returned = true;
        player.hand.push(cardCopy);
        this._addLog(`[色散分解] 回到手牌，可0费再次打出。`);
      }
      if (removed.card.effect.defense || removed.card.effect.buffDmg) {
        this._addLog(`[${playerIdx === 0 ? '玩家' : 'AI'}] 驻场卡「${removed.card.name}」效果结束。`);
      }
    }

    // 高压击穿(S31)回合递减
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
      // 构建键：如果有形态信息则追加（如 "S09升"）
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
  // lightSubFirstCard 已移除（死代码，从未被调用）

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
    if (card.effect?.buffDmg && !card.effect?.draw && !card.effect?.drawCards) return true;
    // 明确定义为驻场卡
    if (card.effect?.isFieldCard) return true;
    // P2: 声压驻场卡 (A11啸叫)
    if (card.effect?.applyOnCast && card.effect?.applyPerTurn) return true;
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

    // 多路放电(S33)电攻减费
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

    // P2: S14 滤光 — 选定领域卡费用减
    if (this._filterDomain[playerIdx] && card.domain.includes(this._filterDomain[playerIdx])) {
      cost -= this._filterDomainReduction[playerIdx];
    }

    // P2: S32 低压启动 — 选定电系卡费用减
    const eTarget = this._reduceElectricTarget[playerIdx];
    if (eTarget && eTarget.costReduction > 0 && card === eTarget.cardRef) {
      cost -= eTarget.costReduction;
    }

    // P2: 知识减费/加费 — 答题结果影响出牌费用
    if (this.quizCostReduction && this.quizCostReduction[playerIdx] > 0) {
      cost = Math.max(0, cost - 1);
    }
    if (this.quizCostPenalty && this.quizCostPenalty[playerIdx] > 0) {
      cost += this.quizCostPenalty[playerIdx];
    }

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

    // 镜面迷宫失败概率（S15→S19 combo可提升概率）
    const mazeProb = Math.max(0.35, this._mirrorMazeBoost[1 - playerIdx] || 0.35);
    if (this.mirrorMaze[playerIdx] > 0 && Math.random() < mazeProb) {
      const refund = Math.floor(card.cost * 0.5);
      player.spirit = Math.min(MAX_SPIRIT, player.spirit + refund);
      this.mirrorMaze[playerIdx]--;
      return { can: false, reason: `镜面迷宫：出牌失败，返还${refund}精神力。` };
    }

    // 光领域棱镜界(D03)失败概率
    const oppDomain = opponent.fieldDomain;
    if (oppDomain?.card?.id === 'D03' && oppDomain.card.effect.opponentFailChance) {
      if (Math.random() < oppDomain.card.effect.opponentFailChance) {
        return { can: false, reason: '棱镜界：出牌有20%概率失效。' };
      }
    }

    // 偏振过滤(S15)
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
    if (card.id === 'S20' && !opponent.fieldSupports.length && !opponent.fieldSummons.length && !opponent.fieldDomain) {
      return { can: false, reason: '对方场上无卡牌，无法使用影子束缚。' };
    }
    if (card.id === 'S30' && !player.fieldSupports.some(s => s.card.domain.includes('电'))) {
      return { can: false, reason: '己方场上无电系辅助卡。' };
    }

    // S20 影子束缚: 需对方场上有卡
    if (card.id === 'S20' && !opponent.fieldSupports.length && !opponent.fieldSummons.length && !opponent.fieldDomain) {
      return { can: false, reason: '对方场上无卡牌，无法使用影子束缚。' };
    }
    // S30 短路开关: 需己方场上有电辅助
    if (card.id === 'S30' && !player.fieldSupports.some(s => s.card.domain.includes('电'))) {
      return { can: false, reason: '己方场上无电系辅助卡。' };
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

    // S23/S25 热机驱动/潜热释放：均消耗对方2层灼烧
    if (card.id === 'S25' && opponent.burnLayers < 2) {
      return { can: false, reason: '对方灼烧层数不足2层。' };
    }
    if (card.id === 'S23') {
      const opp = this.players[1 - playerIdx];
      if (opp.burnLayers < 2) {
        return { can: false, reason: '对方灼烧层数不足2层。' };
      }
    }

    return { can: true, reason: '' };
  }

  /** 纯查询版 canPlay — 不消耗镜面迷宫/棱镜界随机次数，供 renderHand 使用 */
  canPlayQuery(playerIdx, card) {
    const player = this.players[playerIdx];
    const opponent = this.players[1 - playerIdx];

    if (player.turnBlocked && playerIdx === this.currentPlayer) {
      return { can: false, reason: '本回合被凝固封锁，无法出牌。' };
    }
    if (this.shadowBindTurns[playerIdx] > 0 && card.type === 'support') {
      return { can: false, reason: '被影子束缚，无法出辅助卡。' };
    }
    // 跳过镜面迷宫/棱镜界随机判定（纯查询，不影响游戏状态）
    if (this.polarizeRestriction[playerIdx] && playerIdx === this.currentPlayer) {
      if (this.cardsThisTurn.length > 0) {
        const firstType = this.getCardById(this.cardsThisTurn[0])?.type;
        if (firstType && card.type !== firstType) {
          return { can: false, reason: '偏振过滤：本回合只能出一种类型的卡。' };
        }
      }
    }
    if (!this.canAfford(playerIdx, card)) {
      return { can: false, reason: '精神力不足。' };
    }
    if (card.id === 'S20' && !opponent.fieldSupports.length && !opponent.fieldSummons.length && !opponent.fieldDomain) {
      return { can: false, reason: '对方场上无卡牌，无法使用影子束缚。' };
    }
    if (card.id === 'S30' && !player.fieldSupports.some(s => s.card.domain.includes('电'))) {
      return { can: false, reason: '己方场上无电系辅助卡。' };
    }
    // 其他特殊条件（与 canPlay 相同）
    if (card.type === 'phase') {
      if (card.id === 'T02') {
        const hpPercent = player.hp / MAX_HP;
        if (hpPercent >= 0.3) return { can: false, reason: 'HP需低于30%才能打出临界突破。' };
      }
    }
    if (card.id === 'A26' && playerIdx === this.currentPlayer) {
      if (opponent.burnLayers < 2) {
        return { can: false, reason: '对方灼烧层数不足2层，无法发动凝固封锁。' };
      }
    }
    if (card.id === 'A26' && opponent.burnLayers < 2) {
      return { can: false, reason: '对方灼烧层数不足2层，无法发动凝固封锁。' };
    }
    if (card.id === 'S25' && opponent.burnLayers < 2) {
      return { can: false, reason: '对方灼烧层数不足2层。' };
    }
    if (card.id === 'S23' && opponent.burnLayers < 2) {
      return { can: false, reason: '对方灼烧层数不足2层。' };
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
        hand: p.hand.map(c => ({ id: c.id, name: c.name, type: c.type, domain: c.domain, cost: c.cost, description: c.description, effect: c.effect, rarity: c.rarity, formula: c.formula })),
        handSize: p.hand.length,
        deckSize: p.deck.length,
        discardSize: p.discardPile.length,
        fieldSummons: p.fieldSummons.map(s => ({ name: s.card.name, hp: s.hp, maxHp: s.card.effect?.hp || 300, id: s.card.id, domain: s.card.domain })),
        fieldDomain: p.fieldDomain ? { name: p.fieldDomain.card.name, turns: p.fieldDomain.turnsRemaining, domain: p.fieldDomain.card.domain, cardId: p.fieldDomain.card.id } : null,
        fieldSupports: p.fieldSupports.map(s => ({ name: s.card.name, turns: s.turnsRemaining, id: s.card.id, domain: s.card.domain, card: s.card })),
        burnLayers: p.burnLayers,
        burnEnhanced: p.burnEnhanced,
        burnImmune: p.burnImmune,
        paralysis: p.paralysis,
        spiritDebuff: p.spiritDebuff,
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
      canPlay: (this.canPlayQuery ? this.canPlayQuery(playerIdx, card) : this.canPlay(playerIdx, card)).can,
      affordable: this.canAfford(playerIdx, card),
      canPlayReason: (this.canPlayQuery ? this.canPlayQuery(playerIdx, card) : this.canPlay(playerIdx, card)).reason
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
    return this.calculateDamage(card, attackerIdx, defenderIdx, 0, true);
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
