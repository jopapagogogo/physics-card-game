# 代码审查报告 — 2026-06-30

> 全面审查，只读不修改。审查范围：全部 JS/CSS 文件 + 上次问题追踪。

---

## 审查范围

| 文件 | 行数 | 状态 |
|------|------|------|
| js/cards.js | 1287 | 已审查 |
| js/engine.js | 2670 | 已审查 |
| js/combo_table.js | 222 | 已审查 |
| js/ai.js | 1638 | 已审查 |
| js/ui.js | ~3900 | 已审查（关键区域） |
| js/quiz.js | 1430 | 已审查（关键区域） |
| js/runes.js | 10 | 已审查 |
| css/game_v2.css | ~1300 | 已审查（关键区域） |
| css/game.css | — | 已确认废弃标记存在 |

---

## 发现新问题

### 🔴 严重

| # | 问题描述 | 文件:行号 | 建议修复 |
|---|---------|-----------|---------|
| 1 | **S19 镜面迷宫 settlePhase 双重递减** — `canPlay` 中每次出牌失败 `mirrorMaze[playerIdx]--`（line 2467），`settlePhase` 又在回合结束时 `mirrorMaze[currentPlayer]--`（line 504）。这意味着即使对手未出牌或只出了一张，迷宫也会因回合切换被额外消耗。S19 提示"3 次出牌"，实际因 settlePhase 每回合扣 1，有效期大打折扣（如 1 回合出 2 张→canPlay 消耗 + settlePhase 消耗→2 回合就耗尽）。 | `engine.js:504, 2467` | 移除 settlePhase 中的 `mirrorMaze[currentPlayer]--`。mirrorMaze 仅由 canPlay 在出牌时递减，对齐"3 次出牌"语义。 |

### 🟡 中等

| # | 问题描述 | 文件:行号 | 建议修复 |
|---|---------|-----------|---------|
| 2 | **getPlayableCards 每卡调用 canPlay 两次** — `getPlayableCards` 返回 `canPlay` 和 `canPlayReason` 两个字段，对每张卡分别调用 `this.canPlay(playerIdx, card)`（line 2656、2658）。虽然 renderHand 已改用 `canPlayQuery` 避免了渲染消耗，但 `getPlayableCards` 仍然两次调用带副作用的 `canPlay`。若此方法在出牌阶段外被调用（如 UI 更新），会意外消耗镜面迷宫次数。 | `engine.js:2652-2659` | 将第二个 `canPlay` 调用改为复用第一次结果，如 `const result = this.canPlay(playerIdx, card); ... canPlay: result.can, canPlayReason: result.reason`。 |
| 3 | **A53 镜面回声 effects 数组重复推送** — `_applySpecialEffects` 中 A53 被两个 `if` 块分别处理：第一个（line 1950-1952）正确设置 `mirrorEchoBonus` 并 push `{ type: 'mirror_echo', value: 10 }`；第二个（line 1956-1958）无条件 push `{ type: 'mirror_echo', msg: '...' }`。两个块都会执行，导致 effects 数组中出现两次 `mirror_echo` 条目，UI 层可能重复渲染或日志重复。 | `engine.js:1950-1958` | 合并为一个 if 块，或第二个用 `else if` 与第一个互斥，或在第一个块中同时 push msg。 |

### 🟢 轻微

| # | 问题描述 | 文件:行号 | 建议修复 |
|---|---------|-----------|---------|
| 4 | **.card-v3.mini:hover 未包裹媒体查询** — 全尺寸卡牌 `.card-v3:hover` 已正确包裹在 `@media (hover: hover) and (pointer: fine)` 中（line 1184-1190），但手牌 mini 卡片的 hover 样式（line 1097-1101）未做类似包裹。移动端触摸会触发 hover 导致视觉黏滞（卡牌放大后无法恢复）。 | `game_v2.css:1097-1102` | 将 `.card-v3.mini:hover` 和 `.card-v3.mini.selected` 移入 `@media (hover: hover) and (pointer: fine)` 媒体查询内。 |
| 5 | **声领域颜色 AI_CONTEXT vs CSS 不一致** — `AI_CONTEXT.md` 声领域颜色为 `#16A085`（绿色），`game_v2.css` 手牌边框颜色为 `#3498db`（蓝色）。光领域颜色也有偏差（AI_CONTEXT: `#F39C12` vs CSS: `#f1c40f`）。虽可能是设计迭代导致的差异，但文档与代码不一致会误导开发者。 | `AI_CONTEXT.md:26`, `game_v2.css:1107-1108` | 统一文档和代码中的领域色值。建议以 AI_CONTEXT.md 为准更新 CSS，或以 CSS 实际值为准更新文档。 |
| 6 | **C04 薛定谔的猫 combo 模式下仍为引擎自动决策** — C03↔C04 combo 设置 `_c04PlayerChoose = true` 后，`settlePhase`（line 460-464）用 `hpRatio >= 0.5` 做智能选择（HP<50% 治疗，否则伤害），但并非真正的玩家选择。上次报告标记此问题后，引擎实现了"智能选择"但未暴露 UI 交互接口。严格而言，combo 描述"由玩家选择"仍不满足。 | `engine.js:460-464`, `engine.js:1090-1091` | 通过 engine 暴露选择回调（如 `engine.setOnC04Choice(callback)`），UI 层弹出选择对话框，实现真正的玩家交互。当前智能选择作为兜底策略保留。 |

---

## 上次问题跟踪（2026-06-29 报告）

> ✅ = 已修复 | ⚠️ = 部分修复/缓解 | ❌ = 未修复

| 上次# | 状态 | 说明 |
|:---:|:---:|------|
| 1 | ✅ 已修复 | renderHand 镜面迷宫消耗 — `canPlayQuery` 方法已添加（`engine.js:2527`），renderHand 优先使用它（`ui.js:1757`），不再消耗迷宫次数 |
| 2 | ✅ 已修复 | A53 soundLightBonus — `mirrorEchoBonus` 变量已添加（`engine.js:82`），在 `_applySpecialEffects` 设置（line 1951），在 `calculateDamage` 读取（line 787-788） |
| 3 | ✅ 已修复 | S08→A10 DOT 递增加固索引错位 — Combo handler 存储到 `_dotIncrementBoost[oIdx]`（line 1100，DOT 承受方），`processDOT` 读取 `_dotIncrementBoost[playerIdx]`（line 2113，正确匹配） |
| 4 | ✅ 已修复 | 召唤物 HP — `_handleSummon` line 1762 改为 `card.hp \|\| card.effect.hp \|\| 200` |
| 5 | ✅ 已修复 | A05 重力势能 fieldSupports — line 991-998 增加了 attack/support 类驻场卡自动加入 `fieldSupports` 的逻辑 |
| 6 | ⚠️ 部分修复 | C04 `_c04PlayerChoose` — 引擎现在实现智能自动选择（line 460-464，HP<50%治疗否则伤害），但仍不是"玩家选择"。combo 描述与实际行为不完全一致。→ 本报告 #6 |
| 7 | ✅ 已修复 | A25→A26 偷取精神力 — `combo_table.js:144` combo value 已改为 10（增量），配合 A25 基值 15 = 总 25 |
| 8 | ✅ 已修复 | D04 processBurn 双倍扣血 — `processBurn`（line 2061-2082）不再读取 D04 的 `perBurnBonus`，D04 加成仅在热系攻击 `calculateDamage` 中生效 |
| 9 | ✅ 已修复 | game.css 废弃 — 文件头部已添加 `/* ⚠️ 已废弃 — 不再被 index.html 加载... */` |
| 10 | ✅ 已修复 | @keyframes rarity-rainbow 重复 — 仅保留 line 1141 一处定义，line 1053 已不再是 keyframes |
| 11 | ✅ 已修复 | card-v3:hover 设备限制 — 全尺寸卡 hover 已包裹在 `@media (hover: hover) and (pointer: fine)` 中（line 1184-1190） |
| 12 | ✅ 已修复 | getQuizBonus 类型不一致 — `quiz.js:1397-1400` 现在返回小数（0.12/0.08/0.05/0.0），与 `engine.js:29` QUIZ_BONUS 一致 |
| 13 | ✅ 已缓解 | canPlay 精神力退还副作用 — `canPlayQuery` 分离了纯查询和带副作用的逻辑。`canPlay` 仅在实际出牌流程中调用，副作用已限于正确上下文 |

**累计修复率：11/13 完全修复 + 1/13 已缓解 + 1/13 部分修复。修复率从 0% 提升至约 92%。**

---

## 📊 问题统计

| 严重度 | 本次新发现 | 上次遗留 | 合计 |
|:---:|:---:|:---:|:---:|
| 🔴 严重 | 1 | 0 | 1 |
| 🟡 中等 | 2 | 0 | 2 |
| 🟢 轻微 | 3 | 1 (C04) | 3 |
| **合计** | **6** | **1** | **6** |

---

## 🔍 AI_CONTEXT.md 铁律合规检查

| 铁律 | 状态 | 说明 |
|------|:----:|------|
| cards.js 为唯一权威源 | ✅ | 所有卡牌数据统一从此读取 |
| effect 属性名直接使用 cards.js 字段名 | ✅ | A53 `soundLightBonus` 已修复为通过 `mirrorEchoBonus` 变量传递 |
| approved_cards.json 唯一插图映射 | ✅ | UI 通过 `_loadCardArt()` 正确加载 |
| serve.cjs 启动服务 | ✅ | 存在且格式正确 |
| git tag 标记版本 | ⚠️ | 最近无 tag |
| 收工 git add/commit/push | ✅ | 多次有意义的 commit（审查报告 Top5 bug 修复等） |
| 引擎与 cards.js 同步 | ✅ | 召唤物 HP、A53 等已同步 |

---

## 🎯 本次优先修复建议 (Top 3)

1. **engine.js:504** — S19 镜面迷宫 settlePhase 双重递减，严重影响游戏公平性（迷宫效果减半）
2. **engine.js:2652-2659** — getPlayableCards 重复调用带副作用的 canPlay，需改为复用结果
3. **engine.js:1950-1958** — A53 effects 重复推送，合并两个 if 块

---

> 📝 报告生成时间：2026-06-30 12:30 GMT+8 | 审查工具：手动逐行审查 + 模式搜索 + 交叉引用检查 + 上次报告 diff 对比
