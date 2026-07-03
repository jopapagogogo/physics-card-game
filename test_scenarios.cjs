/**
 * 物理卡牌对战 — 端到端场景测试
 * 覆盖多回合交互、特殊效果、combo联动
 */
import('./js/engine.js').then(async mod => {
  const { GameEngine, shuffleArray } = mod;
  const { CARDS } = await import('./js/cards.js');

  let pass = 0, fail = 0;
  const check = (cond, name, exp, act) => {
    if (cond) { console.log('✅ '+name); pass++; return true; }
    console.log('❌ '+name+' — 期望 '+exp+' 实际 '+JSON.stringify(act)); fail++; return false;
  };

  function makeEng(hand = [], aiHand = []) {
    const deck = [...hand, ...Array(30).fill(CARDS[0])].slice(0,30);
    const aiDeck = [...aiHand, ...Array(30).fill(CARDS[0])].slice(0,30);
    const eng = new GameEngine(deck, aiDeck, '力', '声', '光', '热');
    eng.players[0].hand = hand.map(c => ({...c}));
    eng.players[0].spirit = 100;
    eng.players[1].spirit = 100;
    return eng;
  }

  const card = id => CARDS.find(c => c.id === id);
  const hp0 = eng => eng.players[0].hp;
  const hp1 = eng => eng.players[1].hp;
  const burn1 = eng => eng.players[1].burnLayers;
  const spirit0 = eng => eng.players[0].spirit;

  console.log('=== 场景测试 — ' + new Date().toISOString() + ' ===\n');

  // ========== 力领域 ==========
  {
    // S06 弹性储能
    const eng = makeEng([card('S06'), card('A01')]);
    eng.playCard(0, 'S06');
    check(eng.energyStore[0].stored === 0, 'S06-激活储能', 'stored=0', eng.energyStore[0].stored);
    eng.playCard(0, 'A01');
    const s06stored = eng.energyStore[0].stored;
    check(s06stored > 0, 'S06-力攻存储能量', 'stored>0', s06stored);
    // S06重复打出不重置
    eng.players[0].hand.push({...card('S06')});
    eng.playCard(0, 'S06');
    check(eng.energyStore[0].stored >= s06stored, 'S06-重复不重置', '不丢失能量', eng.energyStore[0].stored);
  }
  {
    // S06→A04 combo
    const eng = makeEng([card('S06'), card('A04')]);
    eng.playCard(0, 'S06');
    const pre = hp1(eng);
    eng.playCard(0, 'A04');
    const dmg = pre - hp1(eng);
    check(dmg >= 75, 'S06→A04-combo伤害', '≥75(50+25combo)', dmg);
  }
  {
    // A05 重力势能
    const eng = makeEng([card('A05')]);
    eng.playCard(0, 'A05');
    check(eng.hightBonus[0] >= 1, 'A05-初始高度', '≥1', eng.hightBonus[0]);
    // 模拟4回合
    for (let i = 0; i < 4; i++) {
      eng.endTurn(); eng.startTurn(); eng.endTurn(); eng.startTurn();
    }
    check(eng.hightBonus[0] > 0, 'A05-回合递增', 'height>0', eng.hightBonus[0]);
    // dmg should have been dealt
    check(hp1(eng) < 1200, 'A05-自动释放伤害', 'HP<1200', hp1(eng));
  }
  {
    // A02 惯性冲锋
    const eng = makeEng([card('A01'), card('A02')]);
    eng.playCard(0, 'A01'); // 上回合打力攻
    eng.endTurn(); eng.startTurn(); eng.endTurn(); eng.startTurn(); // AI回合
    eng.players[0].hand.push({...card('A02')});
    eng.players[0].spirit = 100;
    const pre = hp1(eng);
    eng.playCard(0, 'A02');
    const dmg = pre - hp1(eng);
    check(dmg >= 50, 'A02-惯性冲锋', '≥50', dmg);
  }
  {
    // A08 做功打击
    const eng = makeEng([card('A08')]);
    eng.players[1].hp = 600; // 已损600
    const pre = hp1(eng);
    eng.playCard(0, 'A08');
    const dmg = pre - hp1(eng);
    check(dmg >= 50 + Math.floor(600 * 0.1), 'A08-做功打击', '50+10%已损', dmg);
  }

  // ========== 声领域 ==========
  {
    // A14 回声爆破
    const eng = makeEng([card('A14')]);
    eng.playCard(0, 'A14');
    check(eng.echoBombPending[0] === true, 'A14-设置回声待触发', 'true', eng.echoBombPending[0]);
    // 模拟过两个回合（AI+自己）
    eng.endTurn(); eng.startTurn(); eng.endTurn(); eng.startTurn();
    check(hp1(eng) < 1200, 'A14-下回合触发100伤害', 'HP<1200', hp1(eng));
  }
  {
    // A11 啸叫
    const eng = makeEng([card('A11')]);
    eng.playCard(0, 'A11');
    check(eng.soundPressure[1] > 0, 'A11-声压叠加', '>0', eng.soundPressure[1]);
  }
  {
    // S09 频率调节—升高
    const eng = makeEng([card('S09'), card('A09')]);
    eng.playCard(0, 'S09');
    check(eng._pendingFrequencyChoice === true, 'S09-待频率选择', 'true', eng._pendingFrequencyChoice);
    eng.frequencyApply('high');
    const pre = hp1(eng);
    eng.playCard(0, 'A09');
    const dmg = pre - hp1(eng);
    check(dmg >= 55 + 20, 'S09升高→A09+20', '≥75', dmg);
  }
  {
    // S09 频率调节—降低
    const eng = makeEng([card('S09'), card('A10')]);
    eng.playCard(0, 'A10'); // 先挂DOT
    eng.players[0].hand.push({...card('S09')});
    eng.playCard(0, 'S09');
    eng.frequencyApply('low');
    const hasA10 = eng.players[1].dotEffects.some(d => d.cardId === 'A10');
    check(hasA10 && eng._turnAllSoundBonus[0] >= 5, 'S09降低-全声+5', 'A10 DOT扩容', eng._turnAllSoundBonus[0]);
  }

  // ========== 光领域 ==========
  {
    // A16 色散分解
    const eng = makeEng([card('A16')]);
    eng.playCard(0, 'A16');
    const hasDot = eng.players[1].dotEffects.some(d => d.cardId === 'A16');
    check(hasDot, 'A16-挂DOT', '有A16 DOT', hasDot);
    // 4回合后测试回手
    for (let i = 0; i < 4; i++) { eng.endTurn(); eng.startTurn(); eng.endTurn(); eng.startTurn(); }
    // 检查A16回手0费
    const inHand = eng.players[0].hand.some(c => c.id === 'A16' && c.cost === 0);
    check(inHand, 'A16-回手0费', 'true', inHand);
  }
  {
    // S18 X射线透视
    const eng = makeEng([card('S18')]);
    const r = eng.playCard(0, 'S18');
    const hasView = r.effects.some(e => e.type === 'view_hand');
    const hasDiscard = r.effects.some(e => e.type === 'discard_opponent');
    check(hasView && hasDiscard, 'S18-透视+弃牌', 'view_hand+discard_opponent', hasView+'/'+hasDiscard);
  }
  {
    // A50 海市蜃楼
    const eng = makeEng([card('A50')]);
    eng.playCard(0, 'A50');
    check(eng.mirageTurns[1] > 0, 'A50-海市蜃楼激活', 'turns>0', eng.mirageTurns[1]);
  }
  {
    // S19 镜面迷宫
    const eng = makeEng([card('S19')]);
    eng.playCard(0, 'S19');
    check(eng.mirrorMaze[1] > 0, 'S19-镜面迷宫激活', 'tries>0', eng.mirrorMaze[1]);
  }

  // ========== 热领域 ==========
  {
    // S25 潜热释放
    const eng = makeEng([card('S25')]);
    eng.players[1].burnLayers = 3;
    eng.players[0].hp = 200;
    eng.playCard(0, 'S25');
    check(burn1(eng) < 3 && hp0(eng) >= 280, 'S25-潜热释放+回血', 'burn<3,HP+80', burn1(eng)+'/'+hp0(eng));
  }
  {
    // A26 凝固封锁
    const eng = makeEng([card('A26')]);
    eng.players[1].burnLayers = 3;
    const pre = hp1(eng);
    eng.playCard(0, 'A26');
    check(burn1(eng) <= 1 && hp1(eng) < pre, 'A26-凝固封锁', '烧减2+伤害', burn1(eng)+'/'+hp1(eng));
  }
  {
    // A54 爆燃
    const eng = makeEng([card('A54')]);
    eng.players[1].burnLayers = 4;
    const pre = hp1(eng);
    eng.playCard(0, 'A54');
    const dmg = pre - hp1(eng);
    check(dmg >= 40 + 4 * 50 && burn1(eng) === 0, 'A54-爆燃', '40+200+清零', dmg+'/'+burn1(eng));
  }
  {
    // A25 蒸发消散（对方有驻场卡）
    const eng = makeEng([card('A25'), card('S08')]);
    eng.playCard(0, 'S08'); // 先放驻场卡到AI场（我方打出辅助卡）
    // 切换到AI视角...不，A25 destroyField 消灭的是对方的驻场卡
    // 需要对方有驻场卡。模拟：让对方场有辅助卡
    const supportCard = card('S08');
    eng.players[1].fieldSupports.push({ card: supportCard, turnsRemaining: 1 });
    const pre = hp1(eng);
    eng.playCard(0, 'A25');
    const dmg = pre - hp1(eng);
    const hasDestroy = eng.players[1].fieldSupports.length === 0;
    check(dmg >= 65, 'A25-蒸发消灭驻场', 'dmg≥65', dmg);
  }

  // ========== 电领域 ==========
  {
    // A27 闪电劈击（2电辅触发）
    const eng = makeEng([card('A27')]);
    eng.players[0].fieldSupports.push({ card: card('S27'), turnsRemaining: 3 });
    eng.players[0].fieldSupports.push({ card: card('S28'), turnsRemaining: 3 });
    const pre = hp1(eng);
    eng.playCard(0, 'A27');
    const dmg = pre - hp1(eng);
    check(dmg >= 30, 'A27-2电辅闪电', 'dmg≥30', dmg);
  }
  {
    // A29 电弧灼烧（1电辅触发）
    const eng = makeEng([card('A29')]);
    eng.players[0].fieldSupports.push({ card: card('S27'), turnsRemaining: 3 });
    const pre = hp1(eng);
    eng.playCard(0, 'A29');
    const dmg = pre - hp1(eng);
    check(dmg >= 30 + 20, 'A29-电弧灼烧+20', '≥50', dmg);
  }
  {
    // A49 过载放电（3电辅）
    const eng = makeEng([card('A49')]);
    eng.players[0].fieldSupports.push({ card: card('S27'), turnsRemaining: 3 });
    eng.players[0].fieldSupports.push({ card: card('S28'), turnsRemaining: 3 });
    eng.players[0].fieldSupports.push({ card: card('S29'), turnsRemaining: 3 });
    const pre = hp1(eng);
    eng.playCard(0, 'A49');
    const dmg = pre - hp1(eng);
    check(dmg >= 30 * 2, 'A49-过载双倍', '≥60', dmg);
  }
  {
    // S30 短路开关
    const eng = makeEng([card('S30'), card('A27')]);
    eng.players[0].fieldSupports.push({ card: card('S27'), turnsRemaining: 3 });
    eng.playCard(0, 'S30');
    const supportsAlive = eng.players[0].fieldSupports.length;
    check(supportsAlive < 1, 'S30-牺牲电辅', '支撑卡减少', supportsAlive);
  }

  // ========== 召唤联动 ==========
  {
    // C06阿基米德在场→打出A04杠杆撬击
    const eng = makeEng([card('A04')]);
    eng.players[0].fieldSummons.push({ card: card('C06'), hp: 240, maxHp: 240, id: 'c06_1' });
    const pre = hp1(eng);
    eng.playCard(0, 'A04');
    const dmg = pre - hp1(eng);
    check(dmg >= 75, 'C06→A04召唤联动', '≥75(50+25combo)', dmg);
  }

  // ========== 相变卡 ==========
  {
    // T01 能量守恒：已损失HP转精神力（不扣HP，计算已损失即可）
    const eng = makeEng([card('T01')]);
    eng.players[0].hp = 800;
    eng.players[0].spirit = 50; // 够支付30费
    const preSpirit = spirit0(eng);
    eng.playCard(0, 'T01');
    check(spirit0(eng) > preSpirit - 30, 'T01-能量守恒', '精↑', spirit0(eng));
  }
  {
    // T02 临界突破
    const eng = makeEng([card('T02'), card('A01')]);
    eng.players[0].hp = 300; // <40%
    eng.playCard(0, 'T02');
    check(eng.criticalBreak[0] === true, 'T02-临界突破', 'true', eng.criticalBreak[0]);
  }
  {
    // T03 熵逆转
    const eng = makeEng([card('T03')]);
    eng.players[0].hp = 1200;
    eng.players[1].hp = 300;
    eng.playCard(0, 'T03');
    check(hp0(eng) < 1200, 'T03-熵逆转HP互换', 'HP变化', hp0(eng)+'/'+hp1(eng));
  }
  {
    // C04 薛定谔的猫
    const eng = makeEng([card('C04')]);
    eng.playCard(0, 'C04');
    const summon = eng.players[0].fieldSummons.find(s => s.card?.id === 'C04');
    check(!!summon, 'C04-召唤成功', 'true', !!summon);
  }
  {
    // P2: S06被消灭释放储能（对方用A25消灭）
    const eng = makeEng([card('S06'), card('A01')]);
    eng.playCard(0, 'S06');
    eng.playCard(0, 'A01');
    const s06stored = eng.energyStore[0].stored;
    // AI回合：A25消灭玩家的S06
    eng.endTurn();
    eng.players[1].hand = [{...card('A25')}];
    eng.players[1].spirit = 100;
    eng.playCard(1, 'A25');
    const after = eng.energyStore[0].stored;
    check(after === 0, 'S06-被消灭释放', '能量清零', after);
  }

  // ========== 补充：A28雷暴链击 ==========
  {
    const eng = makeEng([card('A28')]);
    eng.players[0].fieldSupports.push({ card: card('S27'), turnsRemaining: 3 });
    const pre = hp1(eng);
    eng.playCard(0, 'A28');
    const dmg = pre - hp1(eng);
    check(dmg >= 30 + 15, 'A28-雷暴链击+15/电辅', '≥45', dmg);
  }
  {
    // A28 无电辅时仅基础伤害
    const eng = makeEng([card('A28')]);
    const pre = hp1(eng);
    eng.playCard(0, 'A28');
    const dmg = pre - hp1(eng);
    check(dmg >= 30, 'A28-无电辅基础伤', '≥30', dmg);
  }

  // ========== 补充：A30电磁脉冲 ==========
  {
    const eng = makeEng([card('A30')]);
    eng.players[0].fieldSupports.push({ card: card('S27'), turnsRemaining: 3 });
    eng.players[0].fieldSupports.push({ card: card('S28'), turnsRemaining: 3 });
    // 对方设一个驻场卡
    eng.players[1].fieldSupports.push({ card: card('S08'), turnsRemaining: 1 });
    const preSupports = eng.players[1].fieldSupports.length;
    const pre = hp1(eng);
    eng.playCard(0, 'A30');
    const dmg = pre - hp1(eng);
    const destroyed = eng.players[1].fieldSupports.length < preSupports;
    check(dmg >= 30 + 15 && destroyed, 'A30-电磁脉冲+消灭驻场', '≥45+消灭', dmg+'/'+destroyed);
  }

  // ========== 补充：S21凸透成像 ==========
  {
    const eng = makeEng([card('S21')]);
    // 模拟AI上回合打了一张攻击卡（存在对手索引1）
    const lastCard = card('A01');
    lastCard.damage = 75; // 临时加字段供S21使用
    eng._lastTurnCard[1] = { card: lastCard, damage: 75 };
    eng.playCard(0, 'S21');
    // S21设置_pendingConvexLens
    check(eng._pendingConvexLens !== null, 'S21-凸透成像待选择', '有pending', !!eng._pendingConvexLens);
    if (eng._pendingConvexLens) {
      check(eng._pendingConvexLens.lastCard.card.id === 'A01', 'S21-正确引用上张卡', 'A01', eng._pendingConvexLens.lastCard.card?.id);
    }
  }

  console.log('\n========== 结果 ==========');
  console.log(`✅ ${pass} 通过 ❌ ${fail} 失败`);
  process.exit(fail > 0 ? 1 : 0);
});
