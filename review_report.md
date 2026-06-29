# 代码审查报告 — 2026-06-29

> 全面审查，只读不修改。审查范围：全部 JS/CSS 文件。

---

## 审查范围

| 文件 | 行数 | 状态 |
|------|------|------|
| js/cards.js | 1286 | 已审查 |
| js/engine.js | 2648 | 已审查 |
| js/combo_table.js | 222 | 已审查 |
| js/ai.js | 1638 | 已审查 |
| js/ui.js | 3739 | 已审查 |
| js/quiz.js | 1453 | 已审查 |
| js/runes.js | 9 | 已审查 |
| css/game_v2.css | 1297 | 已审查 |
| css/game.css | 1182 | 已检查（未被 index.html 加载，视为废弃文件） |

---

## 发现新问题

### 🔴 严重

| # | 问题描述 | 文件:行号 | 建议修复 |
|---|---------|-----------|---------|
| 1 | **renderHand 高频调用 canPlay 消耗镜面迷宫次数** — 每次渲染手牌对每张卡调用 `engine.canPlay(0, card)`，而 `canPlay` 内部在镜面迷宫激活时有 `Math.random()` + `mirrorMaze[playerIdx]--`。renderHand 在 `updateAllDisplay` → 答题/出牌/AI 出牌等所有流程节点都会被调用，导致镜面迷宫(S19)次数被渲染大量消耗 | `ui.js:1663-1664`, `engine.js:2452-2458` | `canPlay` 拆分为纯查询版（不消耗次数）和带副作用执行版。renderHand 改用纯查询版；只在真实出牌时才消耗迷宫次数 |
| 2 | **A53 镜面回声 soundLightBonus 效果完全未生效** — cards.js 中 A53 的 `effect.soundLightBonus:10` 键值从未被引擎代码任何位置读取。`calculateDamage:777` 搜索 `fieldSupports` 中 `card.type === 'mirror_echo'` 的卡（不存在此类型）。A53 打出后仅 `_applySpecialEffects:1935-1938` 记录一条日志，无实际伤害加成 | `engine.js:777-779, 1935-1938`, `cards.js:635` | 在 engine 层添加本回合标记（类似 `soundSpeedBuff`），出牌阶段内声系/光系攻击+10。回合切换时重置 |

### 🟡 中等

| # | 问题描述 | 文件:行号 | 建议修复 |
|---|---------|-----------|---------|
| 3 | **S08→A10 Combo DOT 递增加固索引错位** — combo 触发时将 `_dotIncrementBoost[attackerIdx]` 设为 3（攻击方索引），但 `processDOT(playerIdx)` 读取 `_dotIncrementBoost[playerIdx]`（DOT 承受方索引）。攻击方≠承受方，加固永不生效 | `engine.js:1085, 2102` | `_dotIncrementBoost` 按 DOT 承受方索引存储，或在 processDOT 中用 `1 - playerIdx` 读取 |
| 4 | **_handleSummon 读取 card.effect.hp 而非 card.hp** — cards.js 中 C01~C14 的 hp 属性在顶层（如 `C01.hp=360`），effect 对象无 hp 字段。导致所有召唤物 HP 回退到硬编码默认 200 | `engine.js:1747-1748` | 改为 `card.hp \|\| card.effect.hp \|\| 200` |
| 5 | **A05 重力势能未加入 fieldSupports** — `isFieldCard(A05)` 返回 true（`effect.isFieldCard: true`）阻止弃牌堆推入，但卡牌从未加入 `fieldSupports` 或 `fieldSummons`。A05 仅通过 `hightAtkTrack`/`hightBonus` 引擎级数组追踪，游戏状态中不可见（UI 无法渲染、清场效果无法清除） | `engine.js:982-984, 357, 1145-1148` | `_handleAttack` 中增加 `attacker.fieldSupports.push({ card, turnsRemaining: 999 })` |
| 6 | **C04 _c04PlayerChoose 标记设置后从未读取** — C03↔C04 combo 设置此标记意图允许玩家选择伤害/治疗，但 `settlePhase:456` 始终用 `Math.random() < 0.5` | `engine.js:456, 473, 117-118` | settlePhase 中检查 `_c04PlayerChoose`，若为 true 则通过 engine 暴露选择回调供 UI 交互 |
| 7 | **A25→A26 Combo 偷取精神力数值错误** — A25 基值 `stealSpirit:15`。Combo msg 标注 "偷取精神力 15→25"，effect value 为 25。引擎 combo 处理对 `steal_spirit` 累加执行（A25 先偷 15 + combo 再偷 25 = 40），远超 msg 声明的 25 | `combo_table.js:143`, `engine.js:1061` | effect value 改为 10（增量而非总量值），使 15 + 10 = 25 |
| 8 | **D04 热领域 processBurn 错误加伤** — 回合开始灼烧结算时 `processBurn:2058-2062` 读取己方 D04 的 `perBurnBonus:4` 并对己方额外扣血。D04 效果描述为"热系攻击伤害+4 / 附加灼烧+1"，是对热系**主动攻击**的加成，不应影响灼烧 DOT 结算 | `engine.js:2057-2062` | 移除 processBurn 中 D04 的额外伤害逻辑。D04 的 `perBurnBonus` 仅在 `calculateDamage` 的热系攻击计算中使用 |
| 9 | **game.css 已废弃但仍保留在仓库** — index.html 只加载 `game_v2.css`，`game.css` 不再参与渲染。存在旧的 CSS 文件导致开发者困惑。上次报告的中等问题 #9（CSS 权重分裂）已自然解决，但清理不彻底 | `css/game.css` | 删除 `game.css` 或在文件头部添加 `/* 已废弃，见 game_v2.css */` 注释 |

### 🟢 轻微

| # | 问题描述 | 文件:行号 | 建议修复 |
|---|---------|-----------|---------|
| 10 | **@keyframes rarity-rainbow 重复定义** — 第 1053 行和 1141 行各定义一次，两次完全相同 | `game_v2.css:1053,1141` | 删除重复定义 |
| 11 | **card-v3:hover 缺少设备限制** — 未包裹在 `@media (hover:hover) and (pointer:fine)` 内，移动端触摸会引起视觉黏滞 | `game_v2.css:1184-1188` | 移入媒体查询块 |
| 12 | **getQuizBonus 与 engine QUIZ_BONUS 类型不一致** — quiz.js 返回整数百分比(12/8/5/0)，engine.js 使用小数(0.12/0.08/0.05/0.0)。UI finishQuiz 调用 `quiz.getQuizBonus` 仅用于日志显示，不传引擎（引擎内部查表） | `quiz.js:1397-1401`, `engine.js:29` | 统一 quiz.js 返回小数与 engine 一致 |
| 13 | **canPlay 在镜面迷宫触发时未返还精神力** — 镜面迷宫失败时 `canPlay` 会 `player.spirit += refund`（line 2455），但 `canPlay` 被 `canAfford` 和 `renderHand` 多处调用。`canAfford` 中调 `Math.random()` 判断但不会走进镜面迷宫分支（因为 `canAfford` 只检查费用），但语义上 `canPlay` 不应在查询阶段修改玩家状态 | `engine.js:2451-2458` | 将精神力退还逻辑移到实际出牌 `playCard` 中（出牌失败时退还），`canPlay` 仅返回判断结果 |

---

## 上次问题跟踪（2026-06-28 报告）

> ⚠️ **Git 日志确认：6/28 至今仅 `status_snapshot.md` 有变更，所有代码文件均为零修复。**

| 上次# | 状态 | 说明 |
|:---:|:---:|------|
| 1 | ❌ 未修复 | A53 soundLightBonus 仍未生效 → 本报告 #2 |
| 2 | ❌ 未修复 | canPlay 副作用仍在，renderHand 放大效应仍在 → 本报告 #1 |
| 3 | ❌ 未修复 | C04 _c04PlayerChoose 设置后仍不读取 → 本报告 #6 |
| 4 | ❌ 未修复 | S08→A10 _dotIncrementBoost 索引错位 → 本报告 #3 |
| 5 | ❌ 未修复 | A05 未加入 fieldSupports → 本报告 #5 |
| 6 | ❌ 未修复 | 召唤物 HP 字段读取错误 → 本报告 #4 |
| 7 | ❌ 未修复 | game.css 与 game_v2.css 冲突（已部分缓解：index.html 仅加载 v2，但 game.css 未删除）→ 本报告 #9 |
| 8 | ❌ 未修复 | S09 AI 决策仍硬编码在引擎层 |
| 9 | ❌ 未修复 | game.css/game_v2.css 权重分裂 |
| 10 | ❌ 未修复 | rarity-rainbow 重复定义 |
| 11 | ❌ 未修复 | card-v3:hover 缺设备限制 |
| 12 | ❌ 未修复 | getQuizBonus 类型不一致 |
| 13 | ❌ 未修复 | D04 processBurn 双倍扣血 |

**累计修复率：0/13。自第三周以来，累计代码问题修复率持续为 0%。**

---

## 特别关注：镜面迷宫被渲染消耗（#1 详解）

这是本次审查发现的**最高优先修复项**，影响游戏公平性。

**调用链：**
```
showQuizPhase → updateAllDisplay → renderHand → engine.canPlay(0, card) × N张手牌
handleCardSelect → updateAllDisplay → renderHand → engine.canPlay(0, card) × N张手牌
playSelectedCard → updateAllDisplay → renderHand → engine.canPlay(0, card) × N张手牌
runAITurn (每张AI出牌后) → updateAllDisplay → renderHand → engine.canPlay(0, card) × N张手牌
```

每帧渲染消耗 `N * mirrorMazeTries` 次镜面迷宫检测。若手牌 7 张 + mirrorMaze 3 次，一帧渲染就耗尽全部迷宫次数。实际游戏中可能在一帧内就消耗完。

---

## 📊 问题统计

| 严重度 | 数量 | 相比上次 (2026-06-28) |
|:---:|:---:|:---:|
| 🔴 严重 | 2 | = (A53 + 镜面迷宫仍在) |
| 🟡 中等 | 7 | +1 (A25→A26 偷取精神力数值错误) |
| 🟢 轻微 | 4 | = |
| **本次合计** | **13** | **+1 新发现** |

---

## 🎯 本次优先修复建议 (Top 5)

1. **ui.js:1663 + engine.js:2453** — renderHand 高频率调用带副作用的 canPlay，大量消耗镜面迷宫次数（游戏公平性影响）
2. **engine.js:777-779, 1935-1938** — A53 镜面回声 soundLightBonus 效果完全失效
3. **engine.js:1085, 2102** — S08→A10 Combo DOT 递增加固索引错位
4. **engine.js:1747-1748** — 召唤物 HP 字段错误，所有召唤物 HP 回退到 200
5. **engine.js:1145, 982** — A05 重力势能未加入 fieldSupports，卡牌不可见且无法被清场

---

## 🔍 AI_CONTEXT.md 铁律合规检查

| 铁律 | 状态 | 说明 |
|------|:----:|------|
| cards.js 为唯一权威源 | ✅ | 所有卡牌数据统一从此读取 |
| effect 属性名直接使用 cards.js 字段名 | ⚠️ | `card.effect.hp`（应为 `card.hp`）+ A53 `soundLightBonus` 未被引擎使用 → **2 处违规** |
| approved_cards.json 唯一插图映射 | ✅ | UI 通过 `_loadCardArt()` 正确加载 |
| serve.cjs 启动服务 | ✅ | 存在且格式正确 |
| git tag 标记版本 | ⚠️ | 最近无 tag |
| 收工 git add/commit/push | ⚠️ | 最近 2 次 commit 均仅状态快照/审查报告，无代码修复 |

---

> 📝 报告生成时间：2026-06-29 12:30 GMT+8 | 审查工具：手动逐行审查 + 模式搜索 + 交叉引用检查 + Git 变更追踪
