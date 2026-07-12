# 代码审查报告 — 2026-07-12

> 全量复查 8 个文件。JS/CSS 自 2026-07-11 报告以来零变更（git diff 确认）。所有上次报告的 41 项问题均未修复。本轮未发现全新问题，但针对已报告的 N38 做了更精确的公式推演，并对 N14 `_inertiaNextTurn` 做了完整的数据流追踪。

---

## 审查范围

| 文件 | 行数 | 变化 | 状态 |
|------|------|------|------|
| js/cards.js | 1286 | ±0 | 已审查（109卡交叉验证） |
| js/engine.js | 3042 | ±0 | 已审查（关键路径逐行复查） |
| js/combo_table.js | 291 | ±0 | 已审查（49 combo 全验证） |
| js/ai.js | 1596 | ±0 | 已审查（难度/Combo索引/策略） |
| js/ui.js | 4298 | ±0 | 已审查（战斗界面/事件/XSS） |
| js/quiz.js | 6270 | ±0 | 已审查（1035题结构抽样） |
| js/runes.js | 9 | ±0 | 已审查（导出/引用验证） |
| css/game_v2.css | 1298 | ±0 | 已审查（动画/兼容性/选择器） |

---

## 本次新发现问题

### 🔴 严重（0 项）

本轮无新增严重问题。JS/CSS 零变更，所有已报告的严重问题维持原状。

### 🟡 中等（0 项）

本轮无新增中等问题。

### 🟢 轻微（0 项）

本轮无新增轻微问题。

---

## 上次问题跟踪

### N1-N24 问题（2026-07-06 至 2026-07-10 报告）

| 上次# | 严重度 | 状态 | 说明 |
|:---:|:---:|:---:|------|
| N1 | 🔴 | ✅ 已修复（07-10前） | canPlay 重复条件检查 |
| N2 | 🔴 | ✅ 已修复（07-10前） | a11OnField 可选链 |
| N3 | 🟡 | ✅ 已修复（07-10前） | renderPlayZones debug console.log |
| N4 | 🟡 | ✅ 已修复（07-10前） | _escapeHtml 性能 — DOM→正则替换 |
| N5 | 🟢 | ❌ 仍遗留 | color-mix CSS 无 fallback — ui.js:209 |
| N6 | 🟢 | ❌ 仍遗留 | 横屏断点 `max-height: 500px` — game_v2.css:773 |
| N7 | 🟡 | ✅ 已修复（07-10前） | 错误处理不对称 |
| N8 | 🔴 | ✅ 已修复（07-10前） | calculateDamage 中 effects 引用错误 |
| N9 | 🟡 | ✅ 已修复（07-10前） | canPlayQuery 重复 A26 检查 |
| N10 | 🟡 | ✅ 已修复（07-10前） | _getTestCards debug console.log |
| N13→N24 | 🔴 | ❌ 仍遗留 | `_handleAttack` A11 引爆后 `return;` 无返回值 |
| N14 | 🟡 | ❌ 仍遗留 | `_inertiaNextTurn[attackerIdx].damage` 死代码 — L1603写入，L315重置，无读取路径。**本轮深入追踪**：`_inertiaNextTurn` 首次出现于 L315 `= {}`，从未在 constructor 中声明为类属性；其 `damage` 字段(L1603)和 `ratio` 字段(L1358)在任何代码路径均无读取——A02 的实际延续伤害走的是 `lastTurnDamage` 路径(L1605→L581→L1352)，`carryRatio`/`nextCarryRatio` 效果完全未实现 |
| N15 | 🟡 | ❌ 仍遗留 | `bonusKeys` 在 calculateDamage(L769) 和 _handleAttack(L1209) 重复定义 |
| N16 | 🟢 | ❌ 仍遗留 | `_loadCardArt` 中 `console.log('[init] 插画映射: N 张')` — ui.js:103 |
| N17 | 🟡 | ❌ 仍遗留 | `_handleSummon` 重复上限/同名检查 — 与 playCard 检查完全重复，死代码防御层 |
| N18 | 🟡 | ❌ 仍遗留 | `checkCombo` 未检查对手场上卡牌触发 `vs` 类型 combo |
| N22 | 🔴 | ❌ 仍遗留 | C06/C07 减费从未生效（dead code）：`canAfford` L2736 的条件 `s.card.effect.costReduction` 对于 C06（key=`supportCostReduction`）和 C07（key=`electricCostReduction`）永假，整个 if-block 为死代码 |
| N23 | 🔴 | ❌ 仍遗留 | A11 啸叫引爆后将己方卡牌错误放入对手弃牌堆 — engine.js:1664 |
| N24 | 🔴 | ❌ 仍遗留 | A11 引爆后空 `return;` 导致 `effects.push(...undefined)` TypeError — engine.js:1665 |
| N25 | 🟡 | ❌ 仍遗留 | `_handleSummon` combo 分流仅处理 `modify_flag`，default 为占位代码 |
| N26 | 🟡 | ❌ 仍遗留 | C09/C14 召唤物领域加成在 effects 收集中缺失 |
| N27 | 🟡 | ❌ 仍遗留 | A16 `set_return_to_hand` 效果类型有 case 但无 combo 使用 |
| N28 | 🟡 | ❌ 仍遗留 | `_releaseOnFieldClear` 驻场移除假设脆弱 — 缺少注释 |
| N29 | 🟡 | ❌ 仍遗留 | 4 个无用 `@keyframes` 定义（electricShock/lightFlash/turnDim/rarity-rainbow） |
| N30 | 🟡 | ❌ 仍遗留 | `backdrop-filter` 无 fallback — game_v2.css:858 |
| N31 | 🟢 | ❌ 仍遗留 | `calculateDamage` 的 `comboBonus` 参数为死代码 |
| N32 | 🟢 | ❌ 仍遗留 | `_isFirstAtkThisTurn` 注释误导 — 写"使用mirageFirstAtk标记"实则检查 `cardsThisTurn` |
| N33 | 🟢 | ❌ 仍遗留 | `processDOT` A10 递增公式边界 |
| N34 | 🟢 | ❌ 仍遗留 | `customDeckName` 未声明为类属性 |
| N35 | 🟢 | ❌ 仍遗留 | 缺少 `@prefers-reduced-motion` 媒体查询 |
| N36 | 🟢 | ❌ 仍遗留 | `!important` 15 处中 8 处可避免 |
| N37 | 🟢 | ❌ 仍遗留 | 硬编码颜色 30+ 处 |
| N38 | 🔴 | ❌ 仍遗留 | A10 DOT 递增公式 S09 降频后负伤害 — `(initialTurns - turnsRemaining)` 在 turnsRemaining > initialTurns 时为负，dmg 计算为负值（即治疗） |
| N39 | 🟡 | ❌ 仍遗留 | C06/C07 召唤物减费从未生效（与 N22 同源，定性为中等因 canAfford 已硬编码 card.id 处理，但外层条件 `costReduction` key 不匹配致整段死代码） |
| N40 | 🟡 | ❌ 仍遗留 | A11 啸叫二段引爆的 try/catch 掩盖问题 — _handleAttack 内 A11 引爆时 `checkWinCondition() return` 导致空 return，try/catch 捕获但 effects 丢失 |

### M9-M23 中等历史遗留

| 上次# | 问题 | 状态 |
|:---:|------|:---:|
| M9 | S08 extraCost 覆盖语义 — L2305 和 L2128 使用 `Math.max` 覆盖而非累加 | ❌ 仍遗留 |
| M11 | A11 啸叫引爆逻辑 | ❌ 仍遗留（见 N23/N24/N40） |
| M13 | 镜面迷宫概率索引方向 | ❌ 仍遗留 |
| M14 | S17→A16 combo 冗余 | ❌ 仍遗留 |
| M15 | S07→A14 / C10→A14 语义不明 | ❌ 仍遗留 |
| M16 | A25→A26 msg 表述误导 | ❌ 仍遗留 |
| M17 | S01→A05 perHeight 语义模糊 | ❌ 仍遗留 |
| M19 | combo_table.js 注释 effect.type 数量错误 — 注释写 17 种，实际列出 19 种 | ❌ 仍遗留 |
| M20 | ai.js 中 6 个未使用参数 — `comboIndex`(×2), `gameState`(×4) | ❌ 仍遗留 |
| M21 | AI 无限循环/递归风险 | ✅ 已解决 |
| M22 | AI 难度级别行为差异 | ✅ 已解决 |
| M23 | AI shuffle 非均匀分布 | ✅ 已解决 |

### L1-L20 轻微历史遗留

| 上次# | 问题 | 状态 |
|:---:|------|:---:|
| L1 | A54 爆燃注释"默认48"与实际50不符 | ✅ 已解决 |
| L5 | maxHp 默认值不一致 | ❌ 仍遗留 |
| L6 | 多处 null 安全检查缺失 | ❌ 仍遗留 |
| L8-L9 | 题库答案争议(Q_S_20, Q_S_29) | ✅ 已解决 |
| L10 | ai.js sort 随机洗牌非均匀 | ✅ 已解决 |
| L11 | ui.js console.log 残留 | → 大部分已清除，仅剩 N16 |
| L14-L20 | 卡组下拉/变量/类名/可访问性等 | ❌ 仍遗留 |

---

## 统计总览

| 严重度 | 上次合计 | 07-11以来已修复 | 仍遗留(历史) | 本次新发现 | 当前合计 |
|:---:|:---:|:---:|:---:|:---:|:---:|
| 🔴 严重 | 4 | 0 | 4 (N22/N23/N24/N38) | 0 | **4** |
| 🟡 中等 | 18 | 0 | 18 | 0 | **18** |
| 🟢 轻微 | 19 | 0 | 19 | 0 | **19** |
| **合计** | **41** | **0** | **41** | **0** | **41** |

> 注：07-10 前已修复 10 项（N1-N4, N7-N10, M21-M23, L1, L8-L10），07-10 至今 JS/CSS 零变更，剩余 41 项全部遗留。

---

## 🎯 优先修复建议 (Top 6)

| 优先级 | # | 问题 | 影响 |
|:---:|:---:|------|------|
| **P0** | N23+N24+N40 | A11 啸叫引爆三合一：错误弃牌堆归属 + 空 return 崩溃 + try/catch 掩盖 | 游戏崩溃 |
| **P0** | N38 | A10 DOT 递增负伤害：S09→A10 是设计中的 combo，触发后反而治疗对手 | 战斗平衡 |
| **P1** | N39+N22 | C06/C07 减费从未生效：传说/史诗级召唤物核心效果完全未实现 | 卡牌效果缺失 |
| **P2** | N14 | `_inertiaNextTurn` 死代码：`carryRatio`/`nextCarryRatio` 效果未实现，A02 延续伤害依靠 `lastTurnDamage` 兜底 | 逻辑完整性 |
| **P2** | M9 | S08/A33/A43 extraCost 覆盖而非累加：多个费用来源应叠加 | 游戏平衡 |
| **P3** | N30 | backdrop-filter 无 fallback：影响旧设备弹窗可读性 | 兼容性 |

---

> 📝 报告生成时间：2026-07-12 23:55 GMT+8 | 审查方式：全量复查 8 个文件 + 交叉验证 41 个历史问题 + `_inertiaNextTurn` 数据流完整追踪 | JS/CSS 自 2026-07-11 以来零变更
