# 引擎 Bug 审计报告 — engine.js

**文件**: `C:/Users/86138/WorkBuddy/2026-06-06-22-55-18/物理卡牌游戏/js/engine.js`
**审计日期**: 2026-06-17
**总行数**: 2685

---

## 符号说明

| 严重度 | 含义 |
|--------|------|
| **CRITICAL** | 直接影响游戏可玩性/核心机制，必须立即修复 |
| **HIGH** | 会显著影响游戏体验或导致难以调试的异常行为 |
| **MEDIUM** | 在特定条件下出现问题或逻辑不一致 |
| **LOW** | 代码异味、潜在隐患、或非核心路径的边界情况 |

---

## BUG #1 (CRITICAL) — 驻场卡回合递减次数过多（三倍于预期）

**行号**: 213, 473-474, 2113

**代码**:
```javascript
// startTurn() 第 213 行
this.processFieldEffects(pIdx);

// settlePhase() 第 473-474 行
this._tickFieldCards(this.currentPlayer);
this._tickFieldCards(1 - this.currentPlayer);
```

**分析**:
每个玩家的驻场效果在一个完整回合周期内被 `processFieldEffects` 调用了 **3 次**：
1. `startTurn()` 中调用 1 次（当前玩家）
2. 当前玩家的 `settlePhase()` 中调用 1 次（当前玩家）
3. 对手的 `settlePhase()` 中再次调用 1 次（即当前玩家）

结果：`turnsRemaining: 3` 的驻场支援卡只能存活 1 个完整回合（而非预期的 3 个玩家回合），严重缩短了驻场卡的实际生效周期。

**严重度**: **CRITICAL** — 破坏核心游戏平衡，所有驻场支援卡的实际效果远低于预期。

**修复建议**: `processFieldEffects` 应每回合仅对当前玩家递减一次。在 `startTurn()` 中调用一次，或仅在 `settlePhase()` 中调用一次，但不要两处都调用。或者删除 `settlePhase` 中对对方玩家的 `_tickFieldCards` 调用。

---

## BUG #2 (HIGH) — 热之领域(D04) 在 processBurn 中加伤逻辑方向错误

**行号**: 2047-2056

**代码**:
```javascript
processBurn(playerIdx) {
    const player = this.players[playerIdx];
    if (player.burnLayers <= 0) return;
    // ...
    // 热领域(D04)加成：每层+4  <-- 注释意图是给施加者加成
    if (player.fieldDomain?.card?.id === 'D04') {
        const d04 = player.fieldDomain.card;
        const perBurnBonus = (d04?.effect?.perBurnBonus) || 4;
        const extraDmg = player.burnLayers * perBurnBonus;
        player.hp = Math.max(0, player.hp - totalDmg - extraDmg);
    }
}
```

**分析**:
`processBurn` 对当前玩家（灼烧受害者）执行灼烧伤害处理。但代码检查的是 **受害者自己** 的领域卡是否为 D04，而非对手的领域卡。这导致：如果受害者有 D04 领域，他会受到 **额外** 的灼烧伤害（用对手的领域来给自己加伤害），这显然不符合设计意图。

对比 `_handleAttack` 中施加灼烧时的正确逻辑（第 1352-1362 行）：
```javascript
if (attacker.fieldDomain?.card?.id === 'D04') {
    opponent.burnLayers += 1;  // 攻击者有D04，给对手多叠一层
}
```

**严重度**: **HIGH** — 逻辑错误导致 D04 领域卡对灼烧伤害的加成完全失效（或产生反向效果）。

**修复建议**: `processBurn` 应检查 **对手** 的领域卡是否为 D04，而不是当前玩家自己的。需要在函数中添加对手引用：
```javascript
const opponent = this.players[1 - playerIdx];
if (opponent.fieldDomain?.card?.id === 'D04') { ... }
```

---

## BUG #3 (HIGH) — lightSubFirstCard 从不会被调用且逻辑有缺陷

**行号**: 2237-2257

**代码**:
```javascript
lightSubFirstCard(playerIdx, card) {
    if (this.players[playerIdx].isLightSub && card.domain.includes('光') && card.type === 'attack') {
        const lightAttacks = this.cardsThisTurn.filter(id => {
            const c = this.getCardById(id);
            return c && c.domain.includes('光') && c.type === 'attack';
        });
        if (lightAttacks.length === 0) {
            return 0.10;  // 此分支永远不会被执行
        }
    }
    return 0;
}
```

**分析**:
1. **未调用**: 搜索整个 `engine.js`，`lightSubFirstCard` 只在定义处出现，从未被任何其他函数调用。这是一个死代码方法。
2. **逻辑错误**: 即使被调用，`this.cardsThisTurn` 在 `playCard` 第 914 行已包含当前卡片的 ID，所以在 `calculateDamage` 阶段检查时 `lightAttacks.length >= 1`，条件 `lightAttacks.length === 0` 永远为 `false`，`return 0.10` 永远不会执行。

**严重度**: **HIGH** — 核心机制（光替首次攻击加成）完全失效，且代码无法按预期工作。

**修复建议**:
1. 在 `calculateDamage` 中调用 `lightSubFirstCard` 来应用光替加成。
2. 修改过滤逻辑，排除当前卡片自身：使用 `lightAttacks.filter(id => id !== card.id).length === 0`。

---

## BUG #4 (MEDIUM) — 连携效果仅在攻击卡触发时处理，非攻击卡的连携会被丢失

**行号**: 916-922, 925-941, 990-993

**代码**:
```javascript
// playCard() 第 916-922 行
const combo = this.checkCombo(card, this.cardsThisTurn, playerIdx);
if (combo) {
    this.pendingCombo[playerIdx] = combo;
    this.comboCount[playerIdx]++;
}

// playCard() 第 925-941 行
switch (card.type) {
    case 'attack':
        this._handleAttack(card, playerIdx);  // 只有这里处理 pendingCombo
        break;
    case 'support':   // 支援卡不会处理 pendingCombo
        // ...
    case 'phase':     // 相位卡也不会处理 pendingCombo
        // ...
}
```

**分析**:
当一个非攻击卡（如支援卡、相位卡）触发连携时：
- `pendingCombo[playerIdx]` 被正确设置
- 但连携效果仅在 `_handleAttack` 中处理（第 990-1104 行）
- 如果本回合后续没有攻击卡被使用，连携效果丢失（下回合开始时 `pendingCombo` 被重置为 `[null, null]`，见第 256 行）

**严重度**: **MEDIUM** — 当连携组合涉及非攻击卡且玩家未在本回合后续打出攻击卡时，连携效果会被静默丢弃。

**修复建议**: 在非攻击卡的 `_handleSupport` / `_handlePhase` 中也增加对 `pendingCombo` 的处理，或将连携效果的处理提取为独立函数在所有卡类型中调用。

---

## BUG #5 (MEDIUM) — set_return_to_hand 连携效果未实现

**行号**: 1063-1068

**代码**:
```javascript
case 'set_return_to_hand': {
    effects.push({
        type: 'set_return_to_hand',
        cardId: eff.cardId || combo.partner
    });
    // 没有任何状态修改 — 从未设置任何标记或触发器
    break;
}
```

**分析**:
该 `case` 分支仅向 `effects` 数组推送了一个描述对象（仅用于构建返回值/日志），但 **从未设置任何实际状态或标记** 来使卡片返回手牌。`effects` 数组在 `_handleAttack` 结束后仅用于构建返回值，不被其他逻辑读取来产生实际效果。

**严重度**: **MEDIUM** — 连携组合的此效果名存实亡，可能影响特定卡组策略。

**修复建议**: 在此分支中设置一个标记（如 `this._returnToHand[attackerIdx] = eff.cardId || combo.partner`），并在攻击结算后的适当位置检查并执行回手逻辑。

---

## BUG #6 (MEDIUM) — dotSequence 伤害序列值从未被使用

**行号**: 1346-1351, 2082-2108

**代码**:
```javascript
// 第 1346-1351 行：存储 dotSequence
opponent.dotEffects.push({
    dmg: seq[0],
    turnsRemaining: seq.length,
    initialTurns: seq.length,
    cardId: card.id,
    dotSequence: seq  // 除 seq[0] 外的值从未被读取
});

// processDOT() 第 2082-2108 行：只用 dmg，完全忽略 dotSequence
const dmgPer = dot.dmg;
// ... 没有 dotSequence 相关逻辑
```

**分析**:
`dotSequence` 储存了一个伤害值数组（如 `[3, 5, 7]`），本意为每回合造成不同数值的持续伤害。但 `processDOT` 函数固定使用 `dot.dmg`（即序列的第一个值），后续值从未被读取。整个 `dotSequence` 机制形同虚设。

**严重度**: **MEDIUM** — 功能未实现，影响带有多段持续伤害设定的卡牌效果。

**修复建议**: 在 `processDOT` 中，根据 `(dot.initialTurns - dot.turnsRemaining)` 索引访问 `dotSequence` 数组获取当前回合应造成的伤害值。

---

## BUG #7 (MEDIUM) — parseInt 缺少 radix 参数

**行号**: 697, 1294

**代码**:
```javascript
// 第 697 行
parseInt(match[1])

// 第 1294 行
parseInt(target.split('_')[1])
```

**分析**:
`parseInt` 不带第二个参数（radix）时，会自动检测前缀：以 `0x` 或 `0X` 开头会按十六进制解析，以 `0` 开头在某些引擎中会按八进制解析。虽然目前的卡牌 ID 不太可能遇到这些情况，但这是 JavaScript 最佳实践应避免的问题。

**严重度**: **MEDIUM** — 代码健壮性问题，可能在不寻常的输入下产生错误结果。

**修复建议**: 统一使用 `parseInt(value, 10)`。

---

## BUG #8 (LOW) — 拼写错误: "hight" 应为 "height"

**行号**: 64, 67, 2228

**代码**:
```javascript
this.hightAtkTrack = [0, 0];      // 应为 heightAtkTrack
this.hightBonus = [0, 0];          // 应为 heightBonus
```

**分析**:
`hight` 是 `height` 的拼写错误（少了一个 `e`）。虽然在整个文件中使用一致（不会导致运行时错误），但会影响可读性和可维护性。

**严重度**: **LOW** — 不影响功能，但影响代码可维护性。

---

## BUG #9 (LOW) — 死代码: lastTurnOwnAtks 从未被读取

**行号**: 97, 104

**代码**:
```javascript
// 构造函数 第 97 行
this.lastTurnOwnAtks = [{}, {}];

// 第 104 行
this.lastTurnOwnAtks = [{}, {}];  // 重复赋值
```

**分析**:
搜索整个文件，`lastTurnOwnAtks` 只在初始化时被赋值，且被 **连续两次**初始化为相同的值，之后 **从未被读取或用于任何逻辑分支**。这是残留的死状态/死代码，有明显的复制粘贴痕迹。

**严重度**: **LOW** — 浪费内存，不产生运行时影响。

**修复建议**: 如果确认不需要，移除此初始化代码；如果后续计划使用，添加注释说明。

---

## BUG #10 (LOW) — startTurn 中提前 return 导致回合状态不一致

**行号**: 216, 309, 348, 559-561

**代码**:
```javascript
// endTurn() 第 559-561 行
this.currentPlayer = 1 - this.currentPlayer;
this.turnNumber++;
this.startTurn();

// startTurn() 第 216 行
if (this.checkWinCondition()) return;
```

**分析**:
当 `startTurn()` 中检测到游戏结束（如灼烧伤害击杀）并提前返回时，`endTurn()` 已经切换了 `currentPlayer` 并递增了 `turnNumber`。虽然 `gameOver` 标记已设为 `true`，后续操作会被阻止，但状态（player 已切换、turn 已递增）与 `gameOver` 的组合是不一致的，对调试和状态回放不利。

**严重度**: **LOW** — 游戏已结束，后续操作被 `gameOver` 守卫阻止，不造成玩家可感知的错误。

---

## BUG #11 (LOW) — _forceStackCount 自增逻辑无上限保护

**行号**: 64, 1417, 796

**代码**:
```javascript
// 第 1417 行（每次增高攻击时自增）
this._forceStackCount[attackerIdx]++;

// 第 796 行（在 calculateDamage 中使用）
damage += Math.min(this._forceStackCount[attackerIdx] * stackingPer, maxStack);
```

**分析**:
`_forceStackCount` 使用 `++` 自增但没有上限保护。虽然计算伤害时有 `maxStack` 上限限制，但计数器本身会无限增长。在极长的对局中可能达到 `Number.MAX_SAFE_INTEGER`（约 9e15），但在实际游戏中几乎不可能。

**严重度**: **LOW** — 实际上不太可能出现，属于理论上的数值溢出风险。

---

## BUG #12 (LOW) — getCardById 返回 null 但多处调用点无防御性检查

**行号**: 2370 (定义), 多处调用点如 170, 547, 1108

**代码**:
```javascript
getCardById(id) {
    return this.fullDeck.find(c => c.id === id) || null;
}

// 多处调用缺少 null 检查，如：
const c = this.getCardById(id);
return c.domain;  // 如果 c 为 null 则抛出 TypeError
```

**分析**:
虽然正常游戏中所有卡牌 ID 都应该存在，但缺少防御性编程使得任何数据污染都会直接导致崩溃而非优雅降级。

**严重度**: **LOW** — 正常流程不会触发，属于代码健壮性问题。

---

## 总结

| 严重度 | 数量 | 关键问题 |
|--------|------|----------|
| CRITICAL | 1 | 驻场卡回合递减3倍 |
| HIGH | 2 | D04灼烧伤害方向错误、光替首次攻击失效 |
| MEDIUM | 4 | 非攻击卡连携丢失、回手未实现、dotSequence未使用、parseInt无radix |
| LOW | 5 | 拼写错误、死代码、状态不一致、数值溢出、null防御 |

**未发现的问题类型**:
- **无限递归/循环**: 无 — 代码结构是线性的，所有循环都有明确的退出条件
- **竞态条件**: 无 — 引擎是纯同步代码，无异步操作
- **数组越界**: 无 — 数组访问都有合理的边界保护

**核心修复优先级**:
1. **立即修复 BUG #1**（驻场卡递减）—— 这是影响所有驻场支援卡的关键平衡问题。
2. **尽快修复 BUG #2**（D04 灼烧方向）—— 热之领域对灼烧的加成在当前代码中方向完全反了。
3. **修复 BUG #3**（光替加成）—— 这是一个完全未被调用的死方法。
4. **审查所有连携效果**（BUG #4, #5, #6）—— 确保非攻击卡的连携组合不会被静默丢弃，dotSequence 和回手效果能正常工作。
